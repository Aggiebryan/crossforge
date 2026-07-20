import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getContext, isLive } from "./context";
import { DEMO_BUYERS, getBuyer as getDemoBuyer, type DemoBuyer } from "@/demo/data";
import { validateGrade } from "@/domain/engines/buyers";
import type { BuyerGrade, ExitStrategy, PofStatus, RehabTolerance } from "@/domain/constants";
import type { Database } from "@/lib/supabase/database.types";

type BuyerInsert = Database["public"]["Tables"]["buyers"]["Insert"];

export type BuyerView = DemoBuyer;

interface BuyerRow {
  id: string;
  buyer_name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  buyer_type: string | null;
  buyer_grade: BuyerGrade;
  proof_of_funds_status: PofStatus;
  proof_of_funds_date: string | null;
  target_zips: string[];
  target_counties: string[];
  price_range_low_cents: number | null;
  price_range_high_cents: number | null;
  exit_strategies: ExitStrategy[];
  rehab_tolerance: RehabTolerance | null;
  disqualifiers: boolean[];
  last_meaningful_contact: string | null;
}

function rowToView(r: BuyerRow): BuyerView {
  return {
    id: r.id,
    name: r.buyer_name,
    company: r.company_name,
    phone: r.phone ?? "",
    buyerType: r.buyer_type ?? "other",
    grade: r.buyer_grade,
    pofStatus: r.proof_of_funds_status,
    pofDate: r.proof_of_funds_date,
    targetZips: r.target_zips ?? [],
    targetCounties: r.target_counties ?? [],
    priceRangeLowCents: r.price_range_low_cents ?? 0,
    priceRangeHighCents: r.price_range_high_cents ?? 0,
    exitStrategies: r.exit_strategies ?? [],
    rehabTolerance: r.rehab_tolerance ?? "moderate",
    disqualifiers:
      r.disqualifiers?.length === 8
        ? r.disqualifiers
        : [false, false, false, false, false, false, false, false],
    lastMeaningfulContact: r.last_meaningful_contact,
  };
}

const BUYER_SELECT =
  "id, buyer_name, company_name, phone, email, buyer_type, buyer_grade, proof_of_funds_status, proof_of_funds_date, target_zips, target_counties, price_range_low_cents, price_range_high_cents, exit_strategies, rehab_tolerance, disqualifiers, last_meaningful_contact";

export async function listBuyers(): Promise<{ buyers: BuyerView[]; live: boolean }> {
  const ctx = await getContext();
  if (!isLive() || !ctx) return { buyers: DEMO_BUYERS, live: false };
  const supabase = await createClient();
  const { data } = await supabase
    .from("buyers")
    .select(BUYER_SELECT)
    .is("deleted_at", null)
    .order("buyer_name");
  return { buyers: (data ?? []).map((r) => rowToView(r as unknown as BuyerRow)), live: true };
}

export async function getBuyerView(id: string): Promise<{ buyer: BuyerView | null; live: boolean }> {
  const ctx = await getContext();
  if (!isLive() || !ctx) return { buyer: getDemoBuyer(id) ?? null, live: false };
  const supabase = await createClient();
  const { data } = await supabase
    .from("buyers")
    .select(BUYER_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return { buyer: data ? rowToView(data as unknown as BuyerRow) : null, live: true };
}

export interface CreateBuyerInput {
  buyer_name: string;
  company_name?: string;
  phone?: string;
  email?: string;
  buyer_type?: string;
  buyer_grade: BuyerGrade;
  proof_of_funds_status: PofStatus;
  proof_of_funds_date?: string | null;
  target_zips: string[];
  target_counties: string[];
  price_range_low_cents: number;
  price_range_high_cents: number;
  exit_strategies: ExitStrategy[];
  rehab_tolerance: RehabTolerance;
  last_meaningful_contact?: string | null;
  disqualifiers?: boolean[];
}

export async function createBuyer(input: CreateBuyerInput): Promise<{ id: string }> {
  const ctx = await getContext();
  if (!ctx) throw new Error("Not signed in. Add your Supabase keys and sign in to save records.");

  // Grade A requires POF — enforce server-side, not just in the UI.
  const gradeCheck = validateGrade(input.buyer_grade, input.proof_of_funds_status);
  if (!gradeCheck.ok) throw new Error(gradeCheck.message);

  const supabase = await createClient();
  const row = {
    org_id: ctx.orgId,
    created_by: ctx.userId,
    ...input,
    disqualifiers: input.disqualifiers ?? [false, false, false, false, false, false, false, false],
  };
  const { data, error } = await supabase
    .from("buyers")
    .insert(row as unknown as BuyerInsert)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string };
}
