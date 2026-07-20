/**
 * 3.3 Qualification. Five pillars scored 0–3, the two-pillars-absent warning,
 * and the red-flag gate that blocks advancement to Offer pending.
 */
import { QUALIFICATION_PILLARS, type QualificationPillar } from "../constants";

export type PillarScores = Record<QualificationPillar, number>;

export const WEAK_LEAD_BANNER = "Weak lead: two or more pillars absent";

export interface PillarAssessment {
  absentCount: number;
  weak: boolean;
  banner: string | null;
  suggestNurture: boolean;
}

/** A pillar is "absent" when scored 0. Two or more absent = weak lead. */
export function assessPillars(scores: Partial<PillarScores>): PillarAssessment {
  const absentCount = QUALIFICATION_PILLARS.reduce(
    (n, p) => n + ((scores[p] ?? 0) === 0 ? 1 : 0),
    0,
  );
  const weak = absentCount >= 2;
  return {
    absentCount,
    weak,
    banner: weak ? WEAK_LEAD_BANNER : null,
    suggestNurture: weak,
  };
}

// ---------------------------------------------------------------------------
// Red-flag gate. Two or more red flags block advancement to Offer pending
// without an explicit, written override.
// ---------------------------------------------------------------------------
export const RED_FLAG_GATE_THRESHOLD = 2;

export function redFlagCount(flags: boolean[]): number {
  return flags.filter(Boolean).length;
}

export interface RedFlagGate {
  count: number;
  blocked: boolean;
  message: string | null;
}

export function assessRedFlags(
  flags: boolean[],
  overrideJustification?: string | null,
): RedFlagGate {
  const count = redFlagCount(flags);
  const overThreshold = count >= RED_FLAG_GATE_THRESHOLD;
  const hasOverride = Boolean(overrideJustification && overrideJustification.trim().length >= 10);
  return {
    count,
    blocked: overThreshold && !hasOverride,
    message: overThreshold
      ? hasOverride
        ? `Advancing with ${count} red flags on a written override.`
        : `${count} red flags checked. Advancement to Offer pending is blocked until you write a justification. Red flags are how deals lose earnest money.`
      : null,
  };
}
