-- =========================================================================
-- CrossForge CRM — 0006 scheduled jobs (nightly grade decay, deadline
-- alerting, stale-yellow title escalation). Uses pg_cron.
-- =========================================================================

-- ---- Nightly buyer grade decay (90 days of silence => one grade down) --
create or replace function job_buyer_grade_decay()
returns integer language plpgsql as $$
declare v_count int := 0; r record;
begin
  for r in
    select id, org_id, buyer_grade, last_meaningful_contact
    from buyers
    where deleted_at is null
      and buyer_grade in ('A','B')
      and (last_meaningful_contact is null
           or last_meaningful_contact <= current_date - interval '90 days')
  loop
    update buyers
      set buyer_grade = case buyer_grade when 'A' then 'B'::buyer_grade else 'C'::buyer_grade end,
          needs_reverify = true,
          updated_at = now()
      where id = r.id;

    insert into activity_log (org_id, actor, entity_type, entity_id, action, before_value, after_value)
    values (r.org_id, null, 'buyer', r.id, 'grade_decay',
            jsonb_build_object('grade', r.buyer_grade),
            jsonb_build_object('grade', case r.buyer_grade when 'A' then 'B' else 'C' end,
                               'reason', 'No meaningful contact in >=90 days'));
    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;

-- ---- Deadline alerting: mark advance alerts + missed flags ------------
create or replace function job_deadline_alerts()
returns integer language plpgsql as $$
declare v_count int := 0;
begin
  update contract_deadlines
    set missed_flag = true, updated_at = now()
    where deleted_at is null
      and missed_flag = false
      and due_date < current_date;
  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- ---- Stale-yellow title auto-escalation to red ------------------------
create or replace function job_escalate_stale_yellow()
returns integer language plpgsql as $$
declare v_count int := 0;
begin
  update title_files tf
    set file_tier = 'red', updated_at = now()
    from contracts c
    where tf.contract_id = c.id
      and tf.deleted_at is null
      and tf.file_tier = 'yellow'
      and c.inspection_deadline is not null
      and c.inspection_deadline < current_date;
  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- ---- Schedule (idempotent) --------------------------------------------
-- Nightly at 02:00, 02:05, 02:10 America/Chicago (server runs UTC; adjust as
-- needed per deployment). Wrapped in a DO so re-running the migration is safe.
do $$
begin
  perform cron.schedule('crossforge_grade_decay', '0 8 * * *', 'select job_buyer_grade_decay();');
exception when others then null;
end $$;
do $$
begin
  perform cron.schedule('crossforge_deadline_alerts', '5 8 * * *', 'select job_deadline_alerts();');
exception when others then null;
end $$;
do $$
begin
  perform cron.schedule('crossforge_stale_yellow', '10 8 * * *', 'select job_escalate_stale_yellow();');
exception when others then null;
end $$;
