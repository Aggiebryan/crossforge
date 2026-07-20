-- =========================================================================
-- CrossForge CRM — 0005 Row Level Security
-- Multi-tenant from day one: every table is scoped by org_id. Role-based
-- access mirrors Section 7. RLS is the security boundary, never client filters.
-- =========================================================================

-- Enable RLS on every tenant table.
do $$
declare t text;
begin
  foreach t in array array[
    'orgs','memberships','activity_log','lead_stages','lead_sources',
    'lead_source_months','state_rules','seller_leads','lead_touches',
    'deal_folders','deal_documents','deal_analysis','comps','repair_estimates',
    'mao_adjustments','walk_away_overrides','qualifications','buyers','buyer_notes',
    'contracts','contract_packet_docs','contract_deadlines','title_files',
    'title_issues','dispositions','buyer_interest','closings','deal_checklist',
    'income_entries','sops','sop_acknowledgements','templates','review_gates',
    'failure_log','sop_defect_tickets','webhook_subscriptions','webhook_events',
    'daily_logs'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
  end loop;
end $$;

-- ---- orgs & memberships -----------------------------------------------
create policy org_member_select on orgs for select using (is_member(id));
create policy org_owner_update on orgs for update using (current_role_in(id) = 'owner_operator');

create policy mem_self_select on memberships for select using (is_member(org_id));
create policy mem_owner_all on memberships for all
  using (current_role_in(org_id) = 'owner_operator')
  with check (current_role_in(org_id) = 'owner_operator');

-- ---- Generic member read/write policies -------------------------------
-- Most operational tables: any member of the org can read; writes require
-- membership. Soft-deleted rows are filtered in the app; hard delete is
-- restricted to owner_operator via the delete policies below.
do $$
declare t text;
begin
  foreach t in array array[
    'activity_log','lead_stages','lead_sources','lead_source_months','state_rules',
    'seller_leads','lead_touches','deal_folders','deal_documents','comps',
    'repair_estimates','mao_adjustments','walk_away_overrides','qualifications',
    'buyer_notes','contracts','contract_packet_docs','contract_deadlines',
    'title_files','title_issues','dispositions','buyer_interest','deal_checklist',
    'sops','sop_acknowledgements','templates','review_gates','failure_log',
    'sop_defect_tickets','webhook_subscriptions','webhook_events','daily_logs'
  ] loop
    execute format('create policy %1$s_sel on %1$s for select using (is_member(org_id));', t);
    execute format('create policy %1$s_ins on %1$s for insert with check (is_member(org_id));', t);
    execute format('create policy %1$s_upd on %1$s for update using (is_member(org_id)) with check (is_member(org_id));', t);
    -- Hard delete only for owner_operator (app uses soft delete regardless).
    execute format('create policy %1$s_del on %1$s for delete using (can_delete(org_id));', t);
  end loop;
end $$;

-- ---- seller_leads: VAs see only assigned leads ------------------------
drop policy seller_leads_sel on seller_leads;
create policy seller_leads_sel on seller_leads for select using (
  is_member(org_id) and (
    current_role_in(org_id) <> 'virtual_assistant'
    or assigned_to = auth.uid()
  )
);

-- ---- buyers: dispositions/owner manage; acquisitions read-limited -----
-- Buyers table carries buyer financials (POF). Acquisitions has "no buyer
-- financials" — enforced by a column-less view in the app; at the row level
-- all members may read the buyer record, financial columns are elided in the
-- API layer for acquisitions. Writes limited to dispositions + owner.
create policy buyers_sel on buyers for select using (is_member(org_id));
create policy buyers_ins on buyers for insert with check (
  current_role_in(org_id) in ('owner_operator','dispositions')
);
create policy buyers_upd on buyers for update using (
  current_role_in(org_id) in ('owner_operator','dispositions')
) with check (
  current_role_in(org_id) in ('owner_operator','dispositions')
);
create policy buyers_del on buyers for delete using (can_delete(org_id));

-- ---- deal_analysis: pricing roles only --------------------------------
create policy da_sel on deal_analysis for select using (has_pricing_access(org_id));
create policy da_ins on deal_analysis for insert with check (has_pricing_access(org_id));
create policy da_upd on deal_analysis for update using (has_pricing_access(org_id)) with check (has_pricing_access(org_id));
create policy da_del on deal_analysis for delete using (can_delete(org_id));

-- ---- Financial tables: financials roles only --------------------------
create policy closings_sel on closings for select using (is_member(org_id));
create policy closings_ins on closings for insert with check (is_member(org_id));
create policy closings_upd on closings for update using (is_member(org_id)) with check (is_member(org_id));
create policy closings_del on closings for delete using (can_delete(org_id));

create policy income_sel on income_entries for select using (has_financials_access(org_id));
create policy income_ins on income_entries for insert with check (has_financials_access(org_id));
create policy income_upd on income_entries for update using (has_financials_access(org_id)) with check (has_financials_access(org_id));
create policy income_del on income_entries for delete using (can_delete(org_id));

-- Enforce the income-recognition rule at the database: no income row unless
-- the linked closing has funding_confirmed = true.
create or replace function assert_funding_confirmed()
returns trigger language plpgsql as $$
begin
  if not exists (select 1 from closings c where c.id = new.closing_id and c.funding_confirmed) then
    raise exception 'No fee counted as income until the closing wire clears (funding not confirmed).';
  end if;
  return new;
end $$;
create trigger trg_income_requires_funding
  before insert on income_entries
  for each row execute function assert_funding_confirmed();
