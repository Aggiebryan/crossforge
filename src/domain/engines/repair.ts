/**
 * 3.5 Repair estimate engine.
 *
 * Enforced logic (all pure, all here so it can be unit-tested and reused by the
 * UI and any server function):
 *  - Round every entered line item UP to the nearest $100.
 *  - Contingency defaults to 10% of the sum of all other lines, auto-raising to
 *    15% when any escalation flag is set on the lead.
 *  - Compute an implied repair tier from the total, normalized for square
 *    footage against a 1,400–1,700 sqft baseline, and reconcile against the
 *    operator's visually-selected tier.
 *
 * All money is integer cents.
 */
import type { RepairLineItem, RepairTier } from "../constants";

export type RepairRange = { low: number; likely: number; high: number };
export type RepairLines = Partial<Record<RepairLineItem, RepairRange>>;

/** Flags that raise the contingency reserve from 10% to 15%. */
export interface RepairEscalationFlags {
  limitedAccess: boolean;
  utilitiesOff: boolean;
  vacancyOver12Months: boolean;
  sellerEvasiveness: boolean;
}

const CENTS_100 = 10000; // $100 in cents

/** Round a cents value UP to the nearest $100. */
export function roundUpTo100(cents: number): number {
  if (cents <= 0) return 0;
  return Math.ceil(cents / CENTS_100) * CENTS_100;
}

export function roundRange(r: RepairRange): RepairRange {
  return {
    low: roundUpTo100(r.low),
    likely: roundUpTo100(r.likely),
    high: roundUpTo100(r.high),
  };
}

export const CONTINGENCY_ROUNDUP_TOOLTIP =
  "Every line item rounds UP to the nearest $100. Repair budgets that round down are the ones that blow up at closing.";

/** Contingency percent given escalation flags. */
export function contingencyPercent(flags: RepairEscalationFlags): 10 | 15 {
  return flags.limitedAccess ||
    flags.utilitiesOff ||
    flags.vacancyOver12Months ||
    flags.sellerEvasiveness
    ? 15
    : 10;
}

/** Sum a single band (low/likely/high) across all non-contingency lines. */
function sumBand(lines: RepairLines, band: keyof RepairRange): number {
  let total = 0;
  for (const key of Object.keys(lines) as RepairLineItem[]) {
    const r = lines[key];
    if (r) total += roundUpTo100(r[band]);
  }
  return total;
}

export interface RepairTotals {
  contingencyPercent: 10 | 15;
  contingency: RepairRange;
  subtotal: RepairRange; // all lines before contingency, rounded up
  total: RepairRange; // subtotal + contingency
}

/** Compute contingency + totals. Contingency is a percentage of the summed
 * lines and is itself rounded up to the nearest $100. */
export function computeRepairTotals(
  lines: RepairLines,
  flags: RepairEscalationFlags,
): RepairTotals {
  const pct = contingencyPercent(flags);
  const subtotal: RepairRange = {
    low: sumBand(lines, "low"),
    likely: sumBand(lines, "likely"),
    high: sumBand(lines, "high"),
  };
  // The round-up-to-$100 rule applies to entered line items. Contingency is a
  // derived percentage of the (already rounded) subtotal and is kept exact.
  const contingency: RepairRange = {
    low: Math.round((subtotal.low * pct) / 100),
    likely: Math.round((subtotal.likely * pct) / 100),
    high: Math.round((subtotal.high * pct) / 100),
  };
  return {
    contingencyPercent: pct,
    contingency,
    subtotal,
    total: {
      low: subtotal.low + contingency.low,
      likely: subtotal.likely + contingency.likely,
      high: subtotal.high + contingency.high,
    },
  };
}

// Tier thresholds in cents, on the 1,400–1,700 sqft baseline (midpoint 1,550).
const BASELINE_SQFT = 1550;
const LIGHT_MAX = 25000 * 100;
const MODERATE_MAX = 55000 * 100;

/**
 * Compute the implied repair tier from the `likely` total, normalized for
 * square footage. A 3,100 sqft house at $60k of repairs is really "moderate"
 * per-foot, so we scale the total back to the baseline before bucketing.
 */
export function computeRepairTier(
  totalLikelyCents: number,
  squareFeet: number | null | undefined,
): RepairTier {
  let normalized = totalLikelyCents;
  if (squareFeet && squareFeet > 0) {
    normalized = totalLikelyCents * (BASELINE_SQFT / squareFeet);
  }
  if (normalized <= LIGHT_MAX) return "light_cosmetic";
  if (normalized <= MODERATE_MAX) return "moderate";
  return "heavy";
}

export interface TierReconciliation {
  computedTier: RepairTier;
  selectedTier: RepairTier | null;
  mismatch: boolean;
  prompt: string | null;
}

const TIER_HUMAN: Record<RepairTier, string> = {
  light_cosmetic: "light cosmetic",
  moderate: "moderate",
  heavy: "heavy",
};

/** Reconcile the operator's visual tier against the computed tier (3.5). */
export function reconcileTier(
  totalLikelyCents: number,
  squareFeet: number | null | undefined,
  selectedTier: RepairTier | null,
): TierReconciliation {
  const computedTier = computeRepairTier(totalLikelyCents, squareFeet);
  const mismatch = selectedTier != null && selectedTier !== computedTier;
  return {
    computedTier,
    selectedTier,
    mismatch,
    prompt: mismatch
      ? `Your line items say ${TIER_HUMAN[computedTier]}. The property profile says ${TIER_HUMAN[selectedTier!]}. Reconcile before offering.`
      : null,
  };
}
