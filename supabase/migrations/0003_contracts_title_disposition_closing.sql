-- =========================================================================
-- CrossForge CRM — 0003 contracts, title, disposition, closing (Phases 4 & 5)
-- =========================================================================

create type contract_status as enum ('active','terminated','closed');
create type title_tier      as enum ('green','yellow','red');
create type title_lens      as enum ('ownership','lien','property_specific');
create type deadline_kind   as enum (
  'earnest_money_due','inspection_deadline','title_objection_deadline',
  'buyer_marketing_start','final_buyer_selection_deadline','closing_date'
);
create type interest_level  as enum ('hot','warm','cold','no');
create type selection_status as enum ('primary','backup','passed');

-- ---- contracts ---------------------------------------------------------
create table contracts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  contract_signed_date date,
  purchase_price_cents bigint,
  earnest_money_amount_cents bigint,
  earnest_money_due_date date,
  earnest_money_deposited_date date,
  earnest_money_confirmation_path text,
  inspection_period_days int check (inspection_period_days is null or inspection_period_days >= 7),
  inspection_deadline date,
  title_objection_deadline date,
  target_buyer_placement_deadline date,
  closing_date date,                       -- specific date; ranges rejected in app
  extension_clause_terms text,
  assignability_confirmed boolean not null default false,
  access_for_designees_confirmed boolean not null default false,
  as_is_language_confirmed boolean not null default false,
  closing_cost_allocation text,
  equitable_interest_disclosure_signed boolean not null default false,
  equitable_interest_disclosure_path text,
  -- gates for earnest money release
  verified_title_contact boolean not null default false,
  escrow_instructions_path text,
  wire_verified_by_phone boolean not null default false,
  status contract_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (seller_lead_id)
);

-- Seven-document packet checklist.
create table contract_packet_docs (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  contract_id uuid not null references contracts(id) on delete cascade,
  doc_code    text not null,               -- one of the 7
  storage_path text,
  attached_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (contract_id, doc_code)
);

-- Calendared deadlines with advance-alert dates + acknowledgment notes.
create table contract_deadlines (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  contract_id uuid not null references contracts(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  kind        deadline_kind not null,
  due_date    date not null,
  advance_alert_date date not null,
  missed_flag boolean not null default false,
  missed_note text,                         -- required to dismiss a missed flag
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);
create index on contract_deadlines (org_id, due_date) where deleted_at is null;

-- ---- title_files -------------------------------------------------------
create table title_files (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  contract_id uuid references contracts(id) on delete set null,
  title_company text, closer_contact text,
  opened_date date, commitment_received_date date, commitment_path text,
  lens_ownership title_tier not null default 'green',
  lens_liens title_tier not null default 'green',
  lens_property_specific title_tier not null default 'green',
  file_tier title_tier not null default 'green',   -- computed = worst lens
  opening_variance_flag boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (seller_lead_id)
);

create table title_issues (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  title_file_id uuid not null references title_files(id) on delete cascade,
  category    title_lens not null,
  severity    title_tier not null default 'yellow',
  issue       text not null,
  who_must_fix text,
  estimated_cure_timeline text,
  cure_realistic_in_window boolean,
  buyer_will_still_perform boolean,
  resolution  text,                         -- extend | renegotiate | terminate
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

create or replace function rank_to_tier(r int)
returns title_tier language sql immutable as $$
  select case r when 2 then 'red'::title_tier when 1 then 'yellow'::title_tier else 'green'::title_tier end;
$$;

-- Recompute each lens as its worst issue severity; the file takes the worst
-- of the three lenses. Computed logic, not operator judgment alone (3.9).
create or replace function recompute_title_tier(p_title_file uuid)
returns void language plpgsql as $$
declare r_own int; r_lien int; r_prop int;
begin
  select
    coalesce(max(case when category='ownership' then rank end), 0),
    coalesce(max(case when category='lien' then rank end), 0),
    coalesce(max(case when category='property_specific' then rank end), 0)
  into r_own, r_lien, r_prop
  from (
    select category,
      case severity when 'green' then 0 when 'yellow' then 1 else 2 end as rank
    from title_issues
    where title_file_id = p_title_file and deleted_at is null
  ) s;

  update title_files tf set
    lens_ownership = rank_to_tier(r_own),
    lens_liens = rank_to_tier(r_lien),
    lens_property_specific = rank_to_tier(r_prop),
    file_tier = rank_to_tier(greatest(r_own, r_lien, r_prop)),
    updated_at = now()
  where tf.id = p_title_file;
end $$;

create or replace function trg_title_issue_change()
returns trigger language plpgsql as $$
begin
  perform recompute_title_tier(coalesce(new.title_file_id, old.title_file_id));
  return coalesce(new, old);
end $$;
create trigger trg_title_issues_recompute
  after insert or update or delete on title_issues
  for each row execute function trg_title_issue_change();

-- ---- dispositions ------------------------------------------------------
create table dispositions (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  contract_id uuid references contracts(id) on delete set null,
  structure_decision text,                  -- assignment | double_close
  structure_reason text,                    -- fee proportion | institutional | prohibits | local custom
  blast_body text,
  went_live_at timestamptz,
  a_tier_sent_at timestamptz,
  b_tier_unlock_hours int not null default 4,
  certainty_notice_sent text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (seller_lead_id)
);

create table buyer_interest (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  disposition_id uuid not null references dispositions(id) on delete cascade,
  buyer_id    uuid references buyers(id) on delete set null,
  date_contacted date, channel text,
  response_received boolean not null default false,
  interest_level interest_level,
  pof_received boolean not null default false,
  offer_amount_cents bigint, terms text,
  selection_status selection_status,
  -- selection checklist (all required to mark primary)
  chk_pof_received boolean not null default false,
  chk_criteria_match boolean not null default false,
  chk_understands_structure boolean not null default false,
  chk_em_acceptable boolean not null default false,
  chk_communication_prompt boolean not null default false,
  chk_no_retrade_signs boolean not null default false,
  chk_backup_identified boolean not null default false,
  certainty_score int,
  notes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

-- ---- closings ----------------------------------------------------------
create table closings (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  contract_id uuid references contracts(id) on delete set null,
  -- three-stage checklist as jsonb of {item: date-stamp}
  preclose jsonb not null default '{}'::jsonb,
  day_of jsonb not null default '{}'::jsonb,
  post_close jsonb not null default '{}'::jsonb,
  settlement_statement_path text,
  funding_confirmed boolean not null default false,   -- gates income
  funding_confirmed_at timestamptz,
  gross_fee_cents bigint,
  direct_expenses_cents bigint,
  buyer_id uuid references buyers(id),
  -- tax reserve
  tax_reserve_cents bigint,
  tax_reserve_task_open boolean not null default false,
  -- post-close review (required within 48h of funding)
  review_completed_at timestamptz,
  review_what_nearly_failed text,
  review_what_to_change text,
  assignment_fee_documented boolean not null default false,
  seller_disclosure_documented boolean not null default false,
  complete boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (seller_lead_id)
);

-- ---- Master checklist (19 items) --------------------------------------
create table deal_checklist (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  item_code   text not null,
  completed_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  unique (seller_lead_id, item_code)
);

-- ---- Income entries (gated by funding_confirmed) ----------------------
create table income_entries (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  closing_id  uuid not null references closings(id) on delete cascade,
  amount_cents bigint not null,
  recognized_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

do $$
declare t text;
begin
  foreach t in array array[
    'contracts','contract_packet_docs','contract_deadlines','title_files',
    'title_issues','dispositions','buyer_interest','closings','deal_checklist'
  ] loop
    execute format(
      'create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;
