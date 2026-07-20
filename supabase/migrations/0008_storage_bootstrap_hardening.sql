-- =========================================================================
-- CrossForge CRM — 0008 storage policies, owner bootstrap, security hardening
-- Idempotent: safe to re-run on a fresh project.
-- =========================================================================

-- ---- Private deal-docs bucket policies ---------------------------------
-- Objects are namespaced by org id as the first path segment:
--   {org_id}/{lead_id}/{folder}/{filename}
-- Only members of that org may read/write; deletion is owner-only. All other
-- access is via short-lived signed URLs.
drop policy if exists "deal_docs_member_read" on storage.objects;
create policy "deal_docs_member_read" on storage.objects for select
  to authenticated using (
    bucket_id = 'deal-docs' and is_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "deal_docs_member_write" on storage.objects;
create policy "deal_docs_member_write" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'deal-docs' and is_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "deal_docs_member_update" on storage.objects;
create policy "deal_docs_member_update" on storage.objects for update
  to authenticated using (
    bucket_id = 'deal-docs' and is_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "deal_docs_owner_delete" on storage.objects;
create policy "deal_docs_owner_delete" on storage.objects for delete
  to authenticated using (
    bucket_id = 'deal-docs' and can_delete(((storage.foldername(name))[1])::uuid)
  );

-- ---- Owner bootstrap ---------------------------------------------------
-- When the pre-authorized email signs up, attach an owner_operator membership
-- to the CrossForge Capital org automatically. Change the email to onboard a
-- different first owner, or generalize as needed.
create or replace function handle_bootstrap_owner()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if lower(new.email) = 'bryan@woodlands.law' then
    select id into v_org from orgs
      where name = 'CrossForge Capital, LLC' and deleted_at is null
      order by created_at limit 1;
    if v_org is not null then
      insert into memberships (org_id, user_id, role, created_by)
      values (v_org, new.id, 'owner_operator', new.id)
      on conflict (org_id, user_id) do update set role = 'owner_operator', deleted_at = null;
    end if;
  end if;
  return new;
end $$;
-- Trigger function only; must not be callable via the REST RPC surface.
revoke execute on function handle_bootstrap_owner() from anon, authenticated, public;

drop trigger if exists trg_bootstrap_owner on auth.users;
create trigger trg_bootstrap_owner
  after insert on auth.users
  for each row execute function handle_bootstrap_owner();

-- ---- Pin search_path on all public functions (security lint 0011) ------
alter function has_pricing_access(uuid) set search_path = public;
alter function has_financials_access(uuid) set search_path = public;
alter function can_delete(uuid) set search_path = public;
alter function set_updated_at() set search_path = public;
alter function match_buyers(uuid, text, text, bigint) set search_path = public;
alter function rank_to_tier(integer) set search_path = public;
alter function recompute_title_tier(uuid) set search_path = public;
alter function trg_title_issue_change() set search_path = public;
alter function va_task_allowed(uuid, uuid, text) set search_path = public;
alter function trg_failure_repeat() set search_path = public;
alter function assert_funding_confirmed() set search_path = public;
alter function job_buyer_grade_decay() set search_path = public;
alter function job_deadline_alerts() set search_path = public;
alter function job_escalate_stale_yellow() set search_path = public;
alter function seed_org(uuid, uuid) set search_path = public;
alter function trg_seed_org() set search_path = public;
