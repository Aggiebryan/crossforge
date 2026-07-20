-- =========================================================================
-- CrossForge CRM — 0002 underwriting + buyers (Phases 2 & 3)
-- deal_analysis, comps, repair_estimate, MAO snapshot, buyers, buyer notes,
-- match-engine indexes.
-- =========================================================================

create type likely_buyer_type as enum ('flipper','landlord','wholetail','builder','other');
create type deal_decision     as enum ('offer','do_not_offer','follow_up_for_more_info');
create type repair_tier       as enum ('light_cosmetic','moderate','heavy');
create type buyer_grade       as enum ('A','B','C');
create type pof_status        as enum ('received','pending','none');
create type exit_strategy      as enum ('rental','flip','wholetail','new_build','specialty');
create type rehab_tolerance    as enum ('light','moderate','heavy');
create type structure_pref     as enum ('yes','no','sometimes');

-- ---- deal_analysis -----------------------------------------------------
create table deal_analysis (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  -- mirrored context
  property_address text, county text, zip text,
  property_type property_type, beds_baths_sqft text, occupancy occupancy_status,
  likely_buyer_type likely_buyer_type,
  neighborhood_notes text,
  arv_optimistic_cents bigint, arv_likely_cents bigint, arv_conservative_cents bigint,
  repair_low_cents bigint, repair_likely_cents bigint, repair_high_cents bigint,
  known_title_risks text, known_occupancy_risks text,
  estimated_buyer_costs_cents bigint, risk_comments text,
  target_fee_low_cents bigint, target_fee_high_cents bigint,
  ideal_offer_cents bigint, acceptable_offer_cents bigint, walk_away_number_cents bigint,
  buy_percentage int not null default 70,
  wholesaler_fee_cents bigint not null default 0,
  selected_repair_tier repair_tier,
  decision deal_decision,
  offer_band_approved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (seller_lead_id)
);

create table comps (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  deal_analysis_id uuid not null references deal_analysis(id) on delete cascade,
  address text, sale_date date, price_cents bigint, sqft numeric,
  distance_miles numeric, condition text, adjustment_notes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

-- ---- repair_estimate (one per deal_analysis; lines as jsonb) ----------
create table repair_estimates (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  deal_analysis_id uuid not null references deal_analysis(id) on delete cascade,
  -- { line_code: { low, likely, high, note } } — cents, app rounds up to $100
  lines jsonb not null default '{}'::jsonb,
  contingency_pct int not null default 10,
  subtotal_low_cents bigint, subtotal_likely_cents bigint, subtotal_high_cents bigint,
  contingency_low_cents bigint, contingency_likely_cents bigint, contingency_high_cents bigint,
  total_low_cents bigint, total_likely_cents bigint, total_high_cents bigint,
  computed_tier repair_tier,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (deal_analysis_id)
);

-- ---- MAO tightening adjustments (audit of haircuts) -------------------
create table mao_adjustments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  deal_analysis_id uuid not null references deal_analysis(id) on delete cascade,
  reason      text not null,
  amount_cents bigint not null,
  created_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

-- Log of any offer that exceeded the walk-away number.
create table walk_away_overrides (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  offer_cents bigint not null,
  walk_away_cents bigint not null,
  justification text not null,
  created_at  timestamptz not null default now(),
  created_by  uuid
);

-- ---- qualification -----------------------------------------------------
create table qualifications (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  score_motivation int, note_motivation text,
  score_timeline int, note_timeline text,
  score_authority int, note_authority text,
  score_condition int, note_condition text,
  score_price_flexibility int, note_price_flexibility text,
  -- six question buckets as structured jsonb (queryable, not a notes blob)
  bucket_property_facts jsonb default '{}'::jsonb,
  bucket_occupancy_access jsonb default '{}'::jsonb,
  bucket_ownership_title jsonb default '{}'::jsonb,
  bucket_debt_equity jsonb default '{}'::jsonb,
  bucket_motivation jsonb default '{}'::jsonb,
  bucket_pricing jsonb default '{}'::jsonb,
  red_flags boolean[] not null default array[false,false,false,false,false,false,false,false,false],
  red_flag_override text,       -- written justification when >=2 flags
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (seller_lead_id)
);

-- ---- buyers ------------------------------------------------------------
create table buyers (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  buyer_name text not null, company_name text,
  phone text, email text, preferred_contact_method text,
  proof_of_funds_status pof_status not null default 'none',
  proof_of_funds_date date, proof_of_funds_source text, proof_of_funds_path text,
  target_counties text[] not null default '{}',
  target_zips text[] not null default '{}',
  price_range_low_cents bigint, price_range_high_cents bigint,
  property_types text[] not null default '{}',
  asset_class text,
  exit_strategies exit_strategy[] not null default '{}',
  rehab_tolerance rehab_tolerance,
  preferred_close_timeline text,
  structure_assignment structure_pref default 'sometimes',
  structure_double_close structure_pref default 'sometimes',
  structure_direct_purchase structure_pref default 'sometimes',
  preferred_title_company text,
  buyer_grade buyer_grade not null default 'C',
  buyer_type text,
  last_meaningful_contact date,
  disqualifiers boolean[] not null default array[false,false,false,false,false,false,false,false],
  needs_reverify boolean not null default false,   -- decay flag
  notes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);
-- Match-engine indexes: filter by zip (GIN over array) and price band.
create index buyers_zips_gin on buyers using gin (target_zips) where deleted_at is null;
create index buyers_counties_gin on buyers using gin (target_counties) where deleted_at is null;
create index buyers_price_idx on buyers (org_id, price_range_low_cents, price_range_high_cents) where deleted_at is null;
create index buyers_grade_idx on buyers (org_id, buyer_grade) where deleted_at is null;

create table buyer_notes (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  buyer_id    uuid not null references buyers(id) on delete cascade,
  note_date   date not null default current_date,
  body        text not null,
  reconfirms_buy_box boolean not null default false,  -- gates grade restoration
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);
create index on buyer_notes (org_id, buyer_id, note_date desc);

do $$
declare t text;
begin
  foreach t in array array[
    'deal_analysis','comps','repair_estimates','qualifications','buyers','buyer_notes'
  ] loop
    execute format(
      'create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ---- Server-side match engine (single indexed query, <2s at scale) ----
create or replace function match_buyers(
  p_org uuid, p_zip text, p_county text, p_price_cents bigint
) returns setof buyers language sql stable as $$
  select b.* from buyers b
  where b.org_id = p_org
    and b.deleted_at is null
    and not (true = any(b.disqualifiers))
    and (b.target_zips @> array[p_zip] or (p_county is not null and b.target_counties @> array[p_county]))
    and p_price_cents between coalesce(b.price_range_low_cents,0) and coalesce(b.price_range_high_cents, 9223372036854775807)
  order by case b.buyer_grade when 'A' then 0 when 'B' then 1 else 2 end,
           b.last_meaningful_contact desc nulls last;
$$;
