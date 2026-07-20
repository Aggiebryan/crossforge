-- =========================================================================
-- CrossForge CRM — 0004 SOP library, scripts/templates, review gates,
-- failure log / SOP-defect tickets, webhooks (Phases 6 & 7).
-- =========================================================================

-- ---- SOP library (first-class; VA task gating depends on it) ----------
create table sops (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  task_type   text not null,            -- key a VA task is gated on
  title       text not null,
  purpose     text,
  trigger     text,
  steps       text,
  required_fields text,
  quality_checks text,
  escalation  text,
  version     int not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz,
  unique (org_id, task_type)
);

create table sop_acknowledgements (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  sop_id      uuid not null references sops(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  sop_version int not null,
  unique (sop_id, user_id, sop_version)
);

-- A VA cannot be assigned a task type until an SOP exists AND is acknowledged.
create or replace function va_task_allowed(p_org uuid, p_user uuid, p_task_type text)
returns boolean language sql stable as $$
  select exists (
    select 1 from sops s
    join sop_acknowledgements a
      on a.sop_id = s.id and a.user_id = p_user and a.sop_version = s.version
    where s.org_id = p_org and s.task_type = p_task_type and s.deleted_at is null
  );
$$;

-- ---- Scripts & templates (versioned, merge fields) --------------------
create table templates (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  key         text not null,            -- cold_call_opener, title_opening_email, ...
  title       text not null,
  body        text not null,            -- with {{merge_fields}}
  version     int not null default 1,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);
create index on templates (org_id, key, version desc);

-- ---- Review gates (Section 4.4) ---------------------------------------
create table review_gates (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid not null references seller_leads(id) on delete cascade,
  gate_key    text not null,            -- lead_qualification, offer_approval, ...
  checklist   jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  completed_by uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  unique (seller_lead_id, gate_key)
);

-- ---- Failure log + SOP-defect tickets (repeat-failure rule) -----------
create table failure_log (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  seller_lead_id uuid references seller_leads(id) on delete set null,
  failure_type text not null,
  description text,
  related_sop_task_type text,
  created_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

create table sop_defect_tickets (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  failure_type text not null,
  related_sop_task_type text,
  incident_ids uuid[] not null default '{}',
  status      text not null default 'open',
  framing     text not null default 'This is an SOP defect, not an operator error.',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- When the same failure_type is logged twice, raise an SOP defect ticket.
create or replace function trg_failure_repeat()
returns trigger language plpgsql as $$
declare v_count int; v_ids uuid[];
begin
  select count(*), array_agg(id) into v_count, v_ids
  from failure_log
  where org_id = new.org_id and failure_type = new.failure_type and deleted_at is null;

  if v_count >= 2 and not exists (
    select 1 from sop_defect_tickets t
    where t.org_id = new.org_id and t.failure_type = new.failure_type and t.status = 'open'
  ) then
    insert into sop_defect_tickets (org_id, failure_type, related_sop_task_type, incident_ids)
    values (new.org_id, new.failure_type, new.related_sop_task_type, v_ids);
  end if;
  return new;
end $$;
create trigger trg_failure_log_repeat
  after insert on failure_log
  for each row execute function trg_failure_repeat();

-- ---- Webhook subscriptions + outbox (n8n compatible) ------------------
create table webhook_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  url         text not null,
  events      text[] not null default '{}',   -- stage_change, contract_signed, ...
  secret      text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

create table webhook_events (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  event_type  text not null,
  payload     jsonb not null,
  delivered   boolean not null default false,
  attempts    int not null default 0,
  created_at  timestamptz not null default now()
);
create index on webhook_events (org_id, delivered, created_at);

-- Daily non-negotiables / time-block tracking + daily & EOD dashboard entries
create table daily_logs (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null default current_date,
  top_priorities text[] not null default '{}',
  nn_lead_followup boolean not null default false,
  nn_pipeline_review boolean not null default false,
  nn_underwriting_decision boolean not null default false,
  nn_buyer_touchpoint boolean not null default false,
  eod_new_leads int, eod_seller_convos int, eod_offers_made int,
  eod_contracts_signed int, eod_buyer_commitments int, eod_problems text,
  process_weakness text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, user_id, log_date)
);

do $$
declare t text;
begin
  foreach t in array array[
    'sops','templates','review_gates','webhook_subscriptions','daily_logs'
  ] loop
    execute format(
      'create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;
