/**
 * 3.9 Title triage. Green / yellow / red assessed across three lenses —
 * ownership, liens, property-specific. The FILE takes the WORST tier of the
 * three lenses. This is computed logic, not operator judgment alone.
 */

export type TitleTier = "green" | "yellow" | "red";
export type TitleLens = "ownership" | "liens" | "property_specific";

const TIER_RANK: Record<TitleTier, number> = { green: 0, yellow: 1, red: 2 };

export interface TitleIssue {
  category: TitleLens;
  severity: TitleTier; // per-issue assessed severity
  issue: string;
  cureRealisticInWindow: boolean;
  buyerWillStillPerform: boolean;
}

export interface LensTiers {
  ownership: TitleTier;
  liens: TitleTier;
  property_specific: TitleTier;
}

/** Compute each lens's tier as the worst severity among its issues. */
export function computeLensTiers(issues: TitleIssue[]): LensTiers {
  const lens: LensTiers = { ownership: "green", liens: "green", property_specific: "green" };
  for (const issue of issues) {
    if (TIER_RANK[issue.severity] > TIER_RANK[lens[issue.category]]) {
      lens[issue.category] = issue.severity;
    }
  }
  return lens;
}

/** File tier = worst lens. */
export function computeFileTier(lensTiers: LensTiers): TitleTier {
  const worst = Math.max(
    TIER_RANK[lensTiers.ownership],
    TIER_RANK[lensTiers.liens],
    TIER_RANK[lensTiers.property_specific],
  );
  return (Object.keys(TIER_RANK) as TitleTier[]).find((t) => TIER_RANK[t] === worst)!;
}

export function fileTierFromIssues(issues: TitleIssue[]): {
  lensTiers: LensTiers;
  fileTier: TitleTier;
} {
  const lensTiers = computeLensTiers(issues);
  return { lensTiers, fileTier: computeFileTier(lensTiers) };
}

/**
 * A yellow file that has not moved toward green by the end of the due-diligence
 * window is auto-flagged red with a prompt to terminate.
 */
export const YELLOW_STALE_TERMINATE_PROMPT =
  "This file was yellow at the end of the diligence window and has not moved toward green. Terminate, or document why you are keeping earnest money exposed on an uncured file.";

export function autoEscalateStaleYellow(
  currentTier: TitleTier,
  dueDiligenceEnded: boolean,
): { tier: TitleTier; prompt: string | null } {
  if (currentTier === "yellow" && dueDiligenceEnded) {
    return { tier: "red", prompt: YELLOW_STALE_TERMINATE_PROMPT };
  }
  return { tier: currentTier, prompt: null };
}

/**
 * Title opening is expected the SAME day the contract is signed. A later
 * opened_date carries a permanent variance flag.
 */
export function titleOpeningVariance(
  contractSignedDate: string,
  openedDate: string | null,
): { hasVariance: boolean; daysLate: number } {
  if (!openedDate) return { hasVariance: false, daysLate: 0 };
  const signed = new Date(contractSignedDate + "T00:00:00Z").getTime();
  const opened = new Date(openedDate + "T00:00:00Z").getTime();
  const daysLate = Math.round((opened - signed) / (1000 * 60 * 60 * 24));
  return { hasVariance: daysLate > 0, daysLate: Math.max(0, daysLate) };
}
