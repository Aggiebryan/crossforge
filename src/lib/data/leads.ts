import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getContext, isLive } from "./context";
import { DEMO_LEADS, getLead as getDemoLead, type DemoLead } from "@/demo/data";
import { scheduleCadence, leadSheetComplete } from "@/domain/engines/gates";
import type { LeadStage } from "@/domain/constants";
import type { Database } from "@/lib/supabase/database.types";

type SellerLeadInsert = Database["public"]["Tables"]["seller_leads"]["Insert"];

export type LeadView = DemoLead;

interface LeadRow {
  id: string;
  property_address: string | null;
  street: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  zip: string | null;
  owner_name: string | null;
  phone_1: string | null;
  occupancy_status: string | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  square_feet: number | null;
  year_built: number | null;
  reason_for_selling: string | null;
  seller_timeline: string | null;
  seller_asking_price_cents: number | null;
  access_available: string | null;
  who_must_sign: string | null;
  lead_rating: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  next_touch_date: string | null;
  stage: LeadStage;
  is_incomplete: boolean;
  flag_limited_access: boolean;
  flag_utilities_off: boolean;
  flag_vacancy_over_12mo: boolean;
  flag_seller_evasive: boolean;
  date_created: string;
  lead_sources: { name: string } | { name: string }[] | null;
}

function rowToView(r: LeadRow): LeadView {
  const src = Array.isArray(r.lead_sources) ? r.lead_sources[0] : r.lead_sources;
  return {
    id: r.id,
    property_address: r.property_address ?? "",
    street: r.street ?? "",
    city: r.city ?? "",
    county: r.county ?? "",
    state: r.state ?? "",
    zip: r.zip ?? "",
    owner_name: r.owner_name ?? "",
    phone_1: r.phone_1 ?? "",
    occupancy_status: r.occupancy_status ?? "unknown",
    property_type: r.property_type ?? "other",
    beds: r.beds ?? 0,
    baths: r.baths ?? 0,
    square_feet: r.square_feet ?? 0,
    year_built: r.year_built ?? 0,
    reason_for_selling: r.reason_for_selling ?? "",
    seller_timeline: r.seller_timeline ?? "",
    seller_asking_price_cents: r.seller_asking_price_cents ?? 0,
    access_available: r.access_available ?? "unknown",
    who_must_sign: r.who_must_sign,
    lead_rating: r.lead_rating ?? "medium",
    next_action: r.next_action,
    follow_up_date: r.follow_up_date,
    next_touch_date: r.next_touch_date,
    stage: r.stage,
    is_incomplete: r.is_incomplete,
    lead_source: src?.name ?? "—",
    flag_limited_access: r.flag_limited_access,
    flag_utilities_off: r.flag_utilities_off,
    flag_vacancy_over_12mo: r.flag_vacancy_over_12mo,
    flag_seller_evasive: r.flag_seller_evasive,
    date_created: r.date_created,
  };
}

const LEAD_SELECT =
  "id, property_address, street, city, county, state, zip, owner_name, phone_1, occupancy_status, property_type, beds, baths, square_feet, year_built, reason_for_selling, seller_timeline, seller_asking_price_cents, access_available, who_must_sign, lead_rating, next_action, follow_up_date, next_touch_date, stage, is_incomplete, flag_limited_access, flag_utilities_off, flag_vacancy_over_12mo, flag_seller_evasive, date_created, lead_sources(name)";

export async function listLeads(): Promise<{ leads: LeadView[]; live: boolean }> {
  const ctx = await getContext();
  if (!isLive() || !ctx) return { leads: DEMO_LEADS, live: false };
  const supabase = await createClient();
  const { data } = await supabase
    .from("seller_leads")
    .select(LEAD_SELECT)
    .is("deleted_at", null)
    .order("date_created", { ascending: false });
  return { leads: (data ?? []).map((r) => rowToView(r as unknown as LeadRow)), live: true };
}

export async function getLeadView(id: string): Promise<{ lead: LeadView | null; live: boolean }> {
  const ctx = await getContext();
  if (!isLive() || !ctx) return { lead: getDemoLead(id) ?? null, live: false };
  const supabase = await createClient();
  const { data } = await supabase
    .from("seller_leads")
    .select(LEAD_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return { lead: data ? rowToView(data as unknown as LeadRow) : null, live: true };
}

export interface LeadSourceView {
  id: string;
  name: string;
  channel: string | null;
}

export async function listLeadSources(): Promise<LeadSourceView[]> {
  const ctx = await getContext();
  if (!isLive() || !ctx) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("lead_sources")
    .select("id, name, channel")
    .is("deleted_at", null)
    .eq("active", true)
    .order("name");
  return (data ?? []) as LeadSourceView[];
}

// --------------------------------------------------------------------------
// Writes
// --------------------------------------------------------------------------

export interface CreateLeadInput {
  lead_source_id: string;
  property_address: string;
  street?: string;
  city?: string;
  county?: string;
  state?: string;
  zip?: string;
  owner_name: string;
  phone_1?: string;
  email?: string;
  occupancy_status: string;
  property_type: string;
  beds?: number | null;
  baths?: number | null;
  square_feet?: number | null;
  year_built?: number | null;
  condition_notes?: string;
  mortgage_payoff_estimate_cents?: number | null;
  reason_for_selling: string;
  seller_timeline: string;
  seller_asking_price_cents: number;
  how_seller_arrived_at_price?: string;
  access_available: string;
  who_must_sign: string;
  lead_rating?: string;
  next_action: string;
  follow_up_date: string;
  flag_limited_access?: boolean;
  flag_utilities_off?: boolean;
  flag_vacancy_over_12mo?: boolean;
  flag_seller_evasive?: boolean;
}

/** Insert a full lead, then create its deal folder, cadence touches, and the
 * first master-checklist item. Returns the new lead id. */
export async function createLead(
  input: CreateLeadInput,
  quick = false,
): Promise<{ id: string }> {
  const ctx = await getContext();
  if (!ctx) throw new Error("Not signed in. Add your Supabase keys and sign in to save records.");
  const supabase = await createClient();

  const row = {
    org_id: ctx.orgId,
    created_by: ctx.userId,
    ...input,
    next_touch_date: input.follow_up_date,
    is_incomplete: quick,
    stage: "new" as LeadStage,
  };

  const { data, error } = await supabase
    .from("seller_leads")
    // Cast: the input carries enum values as strings (validated by the DB enums).
    .insert(row as unknown as SellerLeadInsert)
    .select("id, org_id, date_created, street")
    .single();
  if (error) throw new Error(error.message);
  const lead = data as { id: string; org_id: string; date_created: string };

  // Deal folder (storage prefix is {org_id}/{lead_id} — matches storage RLS).
  await supabase.from("deal_folders").insert({
    org_id: ctx.orgId,
    created_by: ctx.userId,
    seller_lead_id: lead.id,
    storage_prefix: `${ctx.orgId}/${lead.id}`,
  });

  // Follow-up cadence touches.
  const touches = scheduleCadence(lead.date_created).map((t) => ({
    org_id: ctx.orgId,
    created_by: ctx.userId,
    seller_lead_id: lead.id,
    due_date: t.dueDate,
    channel: t.channel,
    label: t.label,
  }));
  if (touches.length) await supabase.from("lead_touches").insert(touches);

  // Master checklist: lead entered.
  await supabase.from("deal_checklist").insert({
    org_id: ctx.orgId,
    created_by: ctx.userId,
    seller_lead_id: lead.id,
    item_code: "lead_entered",
    completed_at: new Date().toISOString(),
  });

  return { id: lead.id };
}

export async function createLeadSource(name: string, channel: string): Promise<{ id: string }> {
  const ctx = await getContext();
  if (!ctx) throw new Error("Not signed in.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_sources")
    .insert({ org_id: ctx.orgId, created_by: ctx.userId, name, channel: channel || null })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string };
}

/** Update a lead's stage (logged). Enforces the incomplete-lead gate. */
export async function updateLeadStage(id: string, stage: LeadStage): Promise<void> {
  const ctx = await getContext();
  if (!ctx) throw new Error("Not signed in.");
  const supabase = await createClient();
  const { data: before } = await supabase
    .from("seller_leads")
    .select("stage, is_incomplete")
    .eq("id", id)
    .single();
  const { error } = await supabase.from("seller_leads").update({ stage }).eq("id", id);
  if (error) throw new Error(error.message);
  await supabase.from("activity_log").insert({
    org_id: ctx.orgId,
    actor: ctx.userId,
    entity_type: "seller_lead",
    entity_id: id,
    action: "stage_change",
    before_value: before ?? null,
    after_value: { stage },
  });
}

export { leadSheetComplete };
