/**
 * 3.7 Buyer grading, POF validation, nightly decay, disqualifier logic, the
 * match engine's filter/rank, and the certainty score used for buyer selection
 * (3.10). Pure functions; the DB and UI both call these.
 */
import type { BuyerGrade, ExitStrategy, PofStatus, RehabTolerance } from "../constants";

export interface BuyerRecord {
  id: string;
  grade: BuyerGrade;
  pofStatus: PofStatus;
  pofDate: string | null;
  targetZips: string[];
  targetCounties: string[];
  priceRangeLowCents: number;
  priceRangeHighCents: number;
  exitStrategies: ExitStrategy[];
  rehabTolerance: RehabTolerance;
  /** boolean array aligned to BUYER_DISQUALIFIERS */
  disqualifiers: boolean[];
  lastMeaningfulContact: string | null;
  // certainty inputs
  closingsWithOperator?: number;
  verifiedOutsideClosings?: number;
  avgResponseHours?: number | null;
  questionQuality?: number; // 0–3
  earnestMoneyWillingness?: number; // 0–3
  communicationQuality?: number; // 0–3
}

// ---------------------------------------------------------------------------
// Grade A requires POF — validation rule, not a suggestion.
// ---------------------------------------------------------------------------
export const GRADE_A_REQUIRES_POF =
  "Grade A requires proof of funds on file. Without POF, this buyer is a story, not a grade.";

export function canAssignGradeA(pofStatus: PofStatus): boolean {
  return pofStatus === "received";
}

export function validateGrade(
  grade: BuyerGrade,
  pofStatus: PofStatus,
): { ok: boolean; message?: string } {
  if (grade === "A" && !canAssignGradeA(pofStatus)) {
    return { ok: false, message: GRADE_A_REQUIRES_POF };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Disqualifiers — any flag excludes the buyer from counts and pool depth.
// ---------------------------------------------------------------------------
export function isDisqualified(b: Pick<BuyerRecord, "disqualifiers">): boolean {
  return b.disqualifiers.some(Boolean);
}

// ---------------------------------------------------------------------------
// Nightly decay — 90 days of silence drops one grade.
// ---------------------------------------------------------------------------
export const DECAY_DAYS = 90;
export const RESTORE_CONTACT_WINDOW_DAYS = 7;

export function daysSinceContact(
  lastContact: string | null,
  now: Date = new Date(),
): number | null {
  if (!lastContact) return null;
  const d = new Date(lastContact);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function decayGrade(grade: BuyerGrade): BuyerGrade {
  if (grade === "A") return "B";
  if (grade === "B") return "C";
  return "C";
}

/** Returns the buyer's grade after applying decay, or null if no change. */
export function applyDecay(
  b: Pick<BuyerRecord, "grade" | "lastMeaningfulContact">,
  now: Date = new Date(),
): { newGrade: BuyerGrade; reason: string } | null {
  const days = daysSinceContact(b.lastMeaningfulContact, now);
  if (b.grade === "C") return null; // already floor
  if (days == null || days < DECAY_DAYS) return null;
  return {
    newGrade: decayGrade(b.grade),
    reason: `No meaningful contact in ${days} days (≥${DECAY_DAYS}). Auto-downgraded ${b.grade}→${decayGrade(b.grade)}.`,
  };
}

/**
 * Restoration by manual edit alone is blocked; it requires a linked contact
 * note dated within RESTORE_CONTACT_WINDOW_DAYS.
 */
export const GRADE_RESTORE_BLOCKED =
  "Grade cannot be restored by editing. Log a conversation that reconfirms the buy box and capital position within the last 7 days, then the grade unlocks.";

export function canRestoreGrade(
  lastNoteDate: string | null,
  now: Date = new Date(),
): boolean {
  if (!lastNoteDate) return false;
  const d = new Date(lastNoteDate);
  if (Number.isNaN(d.getTime())) return false;
  const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= RESTORE_CONTACT_WINDOW_DAYS;
}

// ---------------------------------------------------------------------------
// Match engine — filter + rank. Given a property, return ranked candidates.
// ---------------------------------------------------------------------------
export interface PropertyMatchCriteria {
  zip: string;
  county?: string | null;
  priceCents: number; // typically the asking / MAO price band anchor
  exitStrategyHint?: ExitStrategy | null;
  repairTier?: RehabTolerance | null; // maps to rehab tolerance
}

export interface MatchedBuyer {
  buyer: BuyerRecord;
  matchScore: number;
  reasons: string[];
}

const GRADE_WEIGHT: Record<BuyerGrade, number> = { A: 100, B: 60, C: 20 };

/**
 * Filter buyers to those whose buy box covers the property, then rank by grade
 * and fit. Disqualified buyers are excluded entirely. This runs against an
 * in-memory candidate set that the DB pre-filters by zip/price via indexes
 * (see the migration) so the two-second requirement holds at scale.
 */
export function matchBuyers(
  buyers: BuyerRecord[],
  crit: PropertyMatchCriteria,
): MatchedBuyer[] {
  const out: MatchedBuyer[] = [];
  for (const b of buyers) {
    if (isDisqualified(b)) continue;

    const zipMatch =
      b.targetZips.includes(crit.zip) ||
      (crit.county ? b.targetCounties.includes(crit.county) : false);
    if (!zipMatch) continue;

    const priceMatch =
      crit.priceCents >= b.priceRangeLowCents && crit.priceCents <= b.priceRangeHighCents;
    if (!priceMatch) continue;

    const reasons: string[] = [];
    let score = GRADE_WEIGHT[b.grade];
    reasons.push(`Grade ${b.grade}`);

    if (b.targetZips.includes(crit.zip)) {
      score += 25;
      reasons.push(`Targets ${crit.zip}`);
    }
    if (crit.exitStrategyHint && b.exitStrategies.includes(crit.exitStrategyHint)) {
      score += 20;
      reasons.push(`Exit: ${crit.exitStrategyHint}`);
    }
    if (crit.repairTier && b.rehabTolerance === crit.repairTier) {
      score += 15;
      reasons.push(`Rehab tolerance: ${crit.repairTier}`);
    }
    if (b.pofStatus === "received") {
      score += 10;
      reasons.push("POF on file");
    }
    out.push({ buyer: b, matchScore: score, reasons });
  }
  return out.sort((a, b) => b.matchScore - a.matchScore);
}

/** Count active A/B buyers matching a property — feeds the thin-pool haircut. */
export function countMatchingABBuyers(
  buyers: BuyerRecord[],
  crit: PropertyMatchCriteria,
): number {
  return matchBuyers(buyers, crit).filter((m) => m.buyer.grade === "A" || m.buyer.grade === "B")
    .length;
}

// ---------------------------------------------------------------------------
// Certainty score (3.10) — ranking by certainty, not headline price.
// ---------------------------------------------------------------------------
export interface CertaintyResult {
  score: number; // 0–100
  components: { label: string; points: number; max: number }[];
}

export function certaintyScore(b: BuyerRecord, now: Date = new Date()): CertaintyResult {
  const components: { label: string; points: number; max: number }[] = [];

  // Verified current POF (0/20)
  const pofFresh =
    b.pofStatus === "received" &&
    (!b.pofDate || daysSinceContact(b.pofDate, now)! <= 30);
  components.push({ label: "Verified current POF", points: pofFresh ? 20 : b.pofStatus === "received" ? 10 : 0, max: 20 });

  // Closing history with this operator (0/20)
  const withOp = Math.min(20, (b.closingsWithOperator ?? 0) * 7);
  components.push({ label: "Closings with this operator", points: withOp, max: 20 });

  // Verifiable outside closings (0/10)
  const outside = Math.min(10, (b.verifiedOutsideClosings ?? 0) * 3);
  components.push({ label: "Verifiable outside closings", points: outside, max: 10 });

  // Response speed (0/15) — same-day (≤8h) is full marks
  let resp = 0;
  if (b.avgResponseHours != null) {
    if (b.avgResponseHours <= 8) resp = 15;
    else if (b.avgResponseHours <= 24) resp = 10;
    else if (b.avgResponseHours <= 48) resp = 5;
  }
  components.push({ label: "Response speed", points: resp, max: 15 });

  // Question quality (0/10)
  components.push({ label: "Question quality", points: Math.round(((b.questionQuality ?? 0) / 3) * 10), max: 10 });

  // Asset-type alignment (0/10) — proxied by having a defined exit strategy set
  components.push({ label: "Asset-type alignment", points: b.exitStrategies.length > 0 ? 10 : 0, max: 10 });

  // Earnest money willingness (0/8)
  components.push({ label: "Earnest money willingness", points: Math.round(((b.earnestMoneyWillingness ?? 0) / 3) * 8), max: 8 });

  // Communication quality (0/7)
  components.push({ label: "Communication quality", points: Math.round(((b.communicationQuality ?? 0) / 3) * 7), max: 7 });

  const score = components.reduce((s, c) => s + c.points, 0);
  return { score, components };
}
