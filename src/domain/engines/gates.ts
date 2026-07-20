/**
 * Section 4 enforced business rules — the six no-cross gates, the master
 * checklist gate, follow-up cadence scheduling, closing/income recognition,
 * and the tax reserve. Each gate returns a named, visible enforcement message
 * so the operator learns the rule from the block.
 */
import {
  FOLLOWUP_CADENCE,
  MASTER_CHECKLIST,
  REQUIRED_LEAD_FIELDS,
  type LeadStage,
  type MasterChecklistItem,
} from "../constants";
import { stageIndex } from "../constants";

export interface GateResult {
  ok: boolean;
  rule: string;
  message: string;
}

// ---------------------------------------------------------------------------
// No-cross rule #1 — no contract without a completed lead sheet.
// ---------------------------------------------------------------------------
export function leadSheetComplete(lead: Record<string, unknown>): {
  complete: boolean;
  missing: string[];
} {
  const missing = REQUIRED_LEAD_FIELDS.filter((f) => {
    const v = lead[f];
    return v == null || v === "" || (typeof v === "number" && Number.isNaN(v));
  });
  return { complete: missing.length === 0, missing: [...missing] };
}

export function gateContractCreation(lead: Record<string, unknown>): GateResult {
  const { complete, missing } = leadSheetComplete(lead);
  return {
    ok: complete,
    rule: "No contract without a completed lead sheet",
    message: complete
      ? "Lead sheet complete."
      : `Lead sheet is incomplete. Missing: ${missing.join(", ")}. You cannot sign a purchase contract off a half-filled sheet.`,
  };
}

/** A quick-capture (incomplete) lead cannot advance past `contact_made`. */
export function gateIncompleteLeadAdvance(
  isIncomplete: boolean,
  targetStage: LeadStage,
): GateResult {
  const blocked = isIncomplete && stageIndex(targetStage) > stageIndex("contact_made");
  return {
    ok: !blocked,
    rule: "Complete the lead sheet before advancing",
    message: blocked
      ? "This lead came in through quick capture and the full sheet is not done. It cannot move past Contact made until the lead sheet is complete."
      : "OK",
  };
}

// ---------------------------------------------------------------------------
// No-cross rule #2 — no earnest money without confirmed title contact and
// written escrow instructions, with a verified-wire confirmation.
// ---------------------------------------------------------------------------
export interface EarnestMoneyGateInput {
  hasVerifiedTitleContact: boolean;
  hasEscrowInstructionsFile: boolean;
  wireVerifiedByPhone: boolean;
}

export function gateEarnestMoney(i: EarnestMoneyGateInput): GateResult {
  const ok = i.hasVerifiedTitleContact && i.hasEscrowInstructionsFile && i.wireVerifiedByPhone;
  const reasons: string[] = [];
  if (!i.hasVerifiedTitleContact) reasons.push("no verified title contact");
  if (!i.hasEscrowInstructionsFile) reasons.push("no uploaded escrow instructions");
  if (!i.wireVerifiedByPhone) reasons.push("wire instructions not confirmed by phone to a known number");
  return {
    ok,
    rule: "No earnest money without confirmed title contact and written escrow instructions",
    message: ok
      ? "Escrow verified. Wire confirmed by phone."
      : `Blocked: ${reasons.join("; ")}. Wire fraud is the fastest way to lose real money on a deal.`,
  };
}

// ---------------------------------------------------------------------------
// No-cross rule #3 — no marketing until a valid assignable contract exists.
// ---------------------------------------------------------------------------
export function gateDispositionSend(input: {
  hasContract: boolean;
  assignabilityConfirmed: boolean;
}): GateResult {
  const ok = input.hasContract && input.assignabilityConfirmed;
  return {
    ok,
    rule: "No property marketed until a valid assignable contract exists",
    message: ok
      ? "Assignable contract on file. Marketing permitted."
      : "Marketing property you do not control is the unlicensed-brokerage fact pattern. Attach a signed contract with assignability confirmed before you send anything to buyers.",
  };
}

// ---------------------------------------------------------------------------
// No-cross rule #4 — no deal sent to buyers without a written deal analysis.
// ---------------------------------------------------------------------------
export function gateBlastAnalysis(input: {
  hasArvBasis: boolean;
  hasRepairEstimate: boolean;
  hasConservativeSpread: boolean;
  hasDisclosedAssumptions: boolean;
}): GateResult {
  const ok =
    input.hasArvBasis &&
    input.hasRepairEstimate &&
    input.hasConservativeSpread &&
    input.hasDisclosedAssumptions;
  return {
    ok,
    rule: "No deal sent to buyers without a written deal analysis",
    message: ok
      ? "Deal analysis complete."
      : "The blast needs a written analysis: ARV basis, repair estimate, conservative spread, and disclosed assumptions. Pricing off a hunch is how you lose the buyer's trust and the deal.",
  };
}

// ---------------------------------------------------------------------------
// No-cross rule #5 — no fee counted as income until the closing wire clears.
// ---------------------------------------------------------------------------
export function gateIncomeRecognition(fundingConfirmed: boolean): GateResult {
  return {
    ok: fundingConfirmed,
    rule: "No fee counted as income until the closing wire clears",
    message: fundingConfirmed
      ? "Funding confirmed. Income may be recognized."
      : "This fee cannot be recorded as income until the closing desk confirms the wire has funded. Expected closings are not revenue.",
  };
}

// ---------------------------------------------------------------------------
// No-cross rule #6 — no deal closed without assignment fee and seller
// disclosure documented in the file.
// ---------------------------------------------------------------------------
export function gateDealClose(input: {
  assignmentFeeDocumented: boolean;
  sellerDisclosureDocumented: boolean;
}): GateResult {
  const ok = input.assignmentFeeDocumented && input.sellerDisclosureDocumented;
  return {
    ok,
    rule: "No deal closed without the assignment fee and seller disclosure documented",
    message: ok
      ? "Assignment fee and seller disclosure on file."
      : "The file is missing the documented assignment fee and/or the signed seller disclosure. Close is blocked until both are in the deal folder.",
  };
}

// ---------------------------------------------------------------------------
// 4.2 Master checklist gate — all 19 items before a deal is "Closed".
// ---------------------------------------------------------------------------
export type MasterChecklistState = Partial<Record<MasterChecklistItem, string | null>>;

export function masterChecklistComplete(state: MasterChecklistState): {
  complete: boolean;
  done: number;
  total: number;
  missing: MasterChecklistItem[];
} {
  const missing = MASTER_CHECKLIST.filter((i) => !state[i]);
  return {
    complete: missing.length === 0,
    done: MASTER_CHECKLIST.length - missing.length,
    total: MASTER_CHECKLIST.length,
    missing: [...missing],
  };
}

export function gateMarkClosed(state: MasterChecklistState): GateResult {
  const { complete, done, total } = masterChecklistComplete(state);
  return {
    ok: complete,
    rule: "A deal is not Closed until all nineteen master-checklist items are done",
    message: complete
      ? "All 19 checklist items complete."
      : `${done}/${total} checklist items complete. This deal cannot be marked Closed until all nineteen are checked, including the post-close review.`,
  };
}

// ---------------------------------------------------------------------------
// 4.3 Follow-up cadence — schedule touches on lead creation.
// ---------------------------------------------------------------------------
export interface ScheduledTouch {
  dueDate: string; // YYYY-MM-DD
  label: string;
  channel: string;
}

export function scheduleCadence(leadCreatedDate: string): ScheduledTouch[] {
  return FOLLOWUP_CADENCE.map((step) => {
    const d = new Date(leadCreatedDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + step.dayOffset);
    return { dueDate: d.toISOString().slice(0, 10), label: step.label, channel: step.channel };
  });
}

/** Every logged contact requires a next-touch date before the form will save. */
export function requireNextTouch(nextTouchDate: string | null | undefined): GateResult {
  const ok = Boolean(nextTouchDate);
  return {
    ok,
    rule: "Every logged contact requires a next-touch date",
    message: ok ? "OK" : "Set a next-touch date. A contact with no next step is a dropped lead.",
  };
}

// ---------------------------------------------------------------------------
// 3.11 Tax reserve — computed on funding confirmation.
// ---------------------------------------------------------------------------
export const DEFAULT_TAX_RESERVE_PCT = 30;

export function taxReserveCents(grossFeeCents: number, pct: number = DEFAULT_TAX_RESERVE_PCT): number {
  return Math.round((grossFeeCents * pct) / 100);
}

export function gateCompleteWithTaxReserve(taxReserveTaskOpen: boolean): GateResult {
  return {
    ok: !taxReserveTaskOpen,
    rule: "Tax reserve must be moved before the deal is complete",
    message: taxReserveTaskOpen
      ? "The tax-reserve transfer task is still open. Move the reserve before marking this deal complete — the money that is not set aside is the money you spend."
      : "Tax reserve moved.",
  };
}
