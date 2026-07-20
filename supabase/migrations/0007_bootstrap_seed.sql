-- =========================================================================
-- CrossForge CRM — 0007 org bootstrap + seed
-- A function that seeds the 18 fixed stages, TX state rules, and starter
-- script templates whenever an org is created. Stages are seeded from the DB
-- (not hardcoded in the client); admins may rename labels but not add/delete.
-- =========================================================================

create or replace function seed_org(p_org uuid, p_actor uuid)
returns void language plpgsql as $$
begin
  -- 18 lead stages, exact order.
  insert into lead_stages (org_id, code, label, sort_order, created_by) values
    (p_org,'new','New',1,p_actor),
    (p_org,'skip_traced','Skip traced',2,p_actor),
    (p_org,'attempting_contact','Attempting contact',3,p_actor),
    (p_org,'contact_made','Contact made',4,p_actor),
    (p_org,'follow_up','Follow-up',5,p_actor),
    (p_org,'qualified','Qualified',6,p_actor),
    (p_org,'offer_pending','Offer pending',7,p_actor),
    (p_org,'offer_made','Offer made',8,p_actor),
    (p_org,'negotiating','Negotiating',9,p_actor),
    (p_org,'contract_sent','Contract sent',10,p_actor),
    (p_org,'under_contract','Under contract',11,p_actor),
    (p_org,'title_opened','Title opened',12,p_actor),
    (p_org,'disposition_active','Disposition active',13,p_actor),
    (p_org,'assigned','Assigned',14,p_actor),
    (p_org,'double_close_pending','Double-close pending',15,p_actor),
    (p_org,'closed','Closed',16,p_actor),
    (p_org,'dead','Dead',17,p_actor),
    (p_org,'long_term_nurture','Long-term nurture',18,p_actor)
  on conflict (org_id, code) do nothing;

  -- Texas is the primary operating state; do not hardcode into shared logic.
  insert into state_rules (org_id, state_code, disclosure_requirements, licensing_notes, registration_requirements, created_by)
  values (p_org, 'TX',
    'Equitable-interest disclosure required. Seller must acknowledge the buyer''s interest may be assigned and the buyer acts as a principal, not an agent.',
    'Wholesaling of equitable interest is permitted when marketing the contract/equitable interest, not the property itself. Marketing property you do not control is the unlicensed-brokerage fact pattern.',
    'No statewide wholesaler registration as of build date; verify municipal requirements.',
    p_actor)
  on conflict (org_id, state_code) do nothing;

  -- Starter script/template library.
  insert into templates (org_id, key, title, body, created_by) values
    (p_org,'cold_call_opener','Cold call opener','Hi, is this {{owner_name}}? My name is {{operator_name}} — I''m a local buyer looking at {{property_address}}. Do you have two minutes?',p_actor),
    (p_org,'how_got_number','"How did you get my number"','Totally fair question. Your property came up in public records as one that might fit what I buy. If now''s not a good time I''m happy to try later — are you open to a cash offer at all?',p_actor),
    (p_org,'what_offering','"What are you offering"','I''d love to give you a real number, not a guess. Can I ask a few quick questions about the condition so the offer holds up? I don''t like retrading.',p_actor),
    (p_org,'title_opening_email','Title opening email','{{title_company}}, please open title on {{property_address}}. Buyer: {{buyer_entity}}. Seller: {{owner_name}}. Contract price {{purchase_price}}. Closing {{closing_date}}. EM {{earnest_money}} due {{em_due_date}}. Contract and disclosure attached. Please confirm receipt and file number.',p_actor),
    (p_org,'deal_blast','Deal blast','{{beds}}/{{baths}}, {{sqft}} sqft, {{occupancy}}. Est. repairs {{repair_range}}. Conservative ARV {{arv_conservative}}. Asking {{asking_structure}}. Closing desk {{closing_desk}}. Access {{access}}. Buyer EM required {{buyer_em}}. Photos attached. Buyer to verify all figures independently.',p_actor),
    (p_org,'certainty_notice','Certainty notice to competing buyers','Selection on this deal depends on certainty as well as price. Proof of funds, earnest money posture, and a track record of closing carry as much weight as the headline number.',p_actor)
  on conflict do nothing;
end $$;

-- Auto-seed when an org is inserted.
create or replace function trg_seed_org()
returns trigger language plpgsql as $$
begin
  perform seed_org(new.id, new.created_by);
  return new;
end $$;
create trigger trg_orgs_seed after insert on orgs
  for each row execute function trg_seed_org();
