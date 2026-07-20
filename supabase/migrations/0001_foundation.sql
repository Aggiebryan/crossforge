-- =========================================================================
-- CrossForge CRM — 0001 foundation
-- Orgs, membership/roles, the shared conventions (org_id, audit, soft delete),
-- activity_log, lead stages, lead sources, seller_leads, quick capture,
-- deal folders, follow-up cadence. Phase 1.
-- =========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_cron";

-- ---- Enums -------------------------------------------------------------
create type role as enum (
  'owner_operator','acquisitions','dispositions',
  'transaction_coordinator','virtual_assistant','bookkeeper'
);

create type lead_stage as enum (
  'new','skip_traced','attempting_contact','contact_made','follow_up',
  'qualified','offer_pending','offer_made','negotiating','contract_sent',
  'under_contract','title_opened','disposition_active','assigned',
  'double_close_pending','closed','dead','long_term_nurture'
);

create type occupancy_status as enum ('owner_occupied','tenant','vacant','unknown');
create type property_type   as enum ('single_family','duplex','townhome','other');
create type access_available as enum ('yes','no','limited');
create type lead_rating      as enum ('strong','medium','weak');

-- ---- Orgs & membership -------------------------------------------------
create table orgs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  business_tz text not null default 'America/Chicago',
  tax_reserve_pct int not null default 30,
  em_reserve_threshold_cents bigint not null default 0,
  packet_legal_review_date date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

create table memberships (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        role not null default 'virtual_assistant',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (org_id, user_id)
);

-- Helper: does the current user belong to org, and with which role?
create or replace function current_role_in(target_org uuid)
returns role language sql stable security definer set search_path = public as $$
  select m.role from memberships m
  where m.org_id = target_org and m.user_id = auth.uid() and m.deleted_at is null
  limit 1;
$$;

create or replace function is_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org and m.user_id = auth.uid() and m.deleted_at is null
  );
$$;

create or replace function has_pricing_access(target_org uuid)
returns boolean language sql stable as $$
  select current_role_in(target_org) in
    ('owner_operator','acquisitions','dispositions');
$$;

create or replace function has_financials_access(target_org uuid)
returns boolean language sql stable as $$
  select current_role_in(target_org) in ('owner_operator','bookkeeper');
$$;

create or replace function can_delete(target_org uuid)
returns boolean language sql stable as $$
  select current_role_in(target_org) = 'owner_operator';
$$;

-- ---- Shared updated_at trigger ----------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---- Activity log (full audit trail) ----------------------------------
create table activity_log (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  actor       uuid,
  entity_type text not null,
  entity_id   uuid,
  action      text not null,       -- e.g. stage_change, grade_change, price_change
  before_value jsonb,
  after_value  jsonb,
  created_at  timestamptz not null default now()
);
create index on activity_log (org_id, entity_type, entity_id, created_at desc);

-- ---- Lead stages (seeded, renamable labels; codes frozen) -------------
create table lead_stages (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  code        lead_stage not null,
  label       text not null,
  sort_order  int not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (org_id, code)
);

-- ---- Lead sources ------------------------------------------------------
create table lead_sources (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  name        text not null,
  channel     text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

create table lead_source_months (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  lead_source_id uuid not null references lead_sources(id) on delete cascade,
  month       date not null,              -- first of month
  spend_cents bigint not null default 0,
  leads_generated int not null default 0,
  qualified_leads int not null default 0,
  contracts_signed int not null default 0,
  deals_closed int not null default 0,
  gross_fees_cents bigint not null default 0,
  tier        text,                       -- tier_1 | tier_2 | tier_3 (computed)
  verdict     text,                       -- keep | cut | test_further
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (org_id, lead_source_id, month)
);

-- ---- State rules (jurisdiction is first-class) ------------------------
create table state_rules (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  state_code  text not null,              -- 'TX', ...
  disclosure_requirements text,
  licensing_notes text,
  registration_requirements text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (org_id, state_code)
);

-- ---- seller_leads ------------------------------------------------------
create table seller_leads (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  date_created  date not null default current_date,
  lead_source_id uuid references lead_sources(id),
  -- address broken out
  property_address text,
  street text, city text, county text, state text, zip text,
  owner_name text,
  mailing_address text,
  phone_1 text, phone_2 text, email text,
  occupancy_status occupancy_status,
  property_type property_type,
  beds numeric, baths numeric, square_feet numeric,
  year_built int,
  lot_notes text, condition_notes text, roof_notes text, hvac_notes text,
  foundation_notes text, plumbing_electrical_notes text, major_damage_notes text,
  mortgage_payoff_estimate_cents bigint,
  taxes_liens_hoa_notes text,
  reason_for_selling text,              -- verbatim seller language
  seller_timeline text,
  seller_asking_price_cents bigint,
  how_seller_arrived_at_price text,
  access_available access_available,
  who_must_sign text,
  lead_rating lead_rating,
  next_action text,
  follow_up_date date,
  next_touch_date date,
  stage lead_stage not null default 'new',
  is_incomplete boolean not null default false,   -- quick-capture flag
  -- escalation flags feeding the repair contingency
  flag_limited_access boolean not null default false,
  flag_utilities_off boolean not null default false,
  flag_vacancy_over_12mo boolean not null default false,
  flag_seller_evasive boolean not null default false,
  -- lifecycle timestamps for days-elapsed KPIs
  contract_signed_at timestamptz,
  buyer_placed_at timestamptz,
  closed_at timestamptz,
  assigned_to uuid references auth.users(id),      -- VA scoping
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);
create index on seller_leads (org_id, stage) where deleted_at is null;
create index on seller_leads (org_id, zip) where deleted_at is null;
create index on seller_leads (org_id, assigned_to) where deleted_at is null;

-- ---- Follow-up cadence touches ----------------------------------------
create table lead_touches (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  due_date    date not null,
  channel     text,
  label       text,
  completed_at timestamptz,
  outcome     text,
  next_touch_date date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);
create index on lead_touches (org_id, due_date) where completed_at is null and deleted_at is null;

-- ---- Deal folders ------------------------------------------------------
create table deal_folders (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  storage_prefix text not null,          -- bucket path prefix, e.g. org/{id}/deal/{id}
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (seller_lead_id)
);

create table deal_documents (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  folder      text not null,             -- one of the 8 fixed folders
  document_type text not null,           -- controlled vocabulary
  filename    text not null,             -- app-built; manual names rejected
  storage_path text not null,
  uploaded_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);
create index on deal_documents (org_id, seller_lead_id) where deleted_at is null;

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'orgs','memberships','lead_stages','lead_sources','lead_source_months',
    'state_rules','seller_leads','lead_touches','deal_folders','deal_documents'
  ] loop
    execute format(
      'create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;
