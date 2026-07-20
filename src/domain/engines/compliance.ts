/**
 * Section 6 compliance screens: fair-housing term screen on buyer-facing
 * marketing, the disposition hype filter, and the equitable-interest gate.
 */

// ---------------------------------------------------------------------------
// Fair housing — screen buyer-facing marketing copy for protected-class
// language and neighborhood-demographic proxies before sending.
// ---------------------------------------------------------------------------
const FAIR_HOUSING_TERMS: { pattern: RegExp; note: string }[] = [
  { pattern: /\b(christian|muslim|jewish|catholic|church|mosque|synagogue)\b/i, note: "religion" },
  { pattern: /\b(white|black|hispanic|latino|asian|caucasian)\s+(neighborhood|area|community|family|families|tenant|tenants|buyer|buyers)\b/i, note: "race / national origin proxy" },
  { pattern: /\b(no kids|no children|adults only|childless|empty nester)\b/i, note: "familial status" },
  { pattern: /\b(perfect for (a )?(single|young|professional) (man|woman|male|female))\b/i, note: "sex / familial status" },
  { pattern: /\b(handicap|disabled|wheelchair)\b.*\b(not|no|cannot)\b/i, note: "disability" },
  { pattern: /\b(safe|good|nice|desirable)\s+(neighborhood|area|schools?)\b/i, note: "possible demographic proxy — describe the property, not the people" },
  { pattern: /\b(exclusive|restricted)\s+(community|area|neighborhood)\b/i, note: "exclusionary language" },
];

export interface TermScreenHit {
  term: string;
  note: string;
}

export function fairHousingScreen(text: string): TermScreenHit[] {
  const hits: TermScreenHit[] = [];
  for (const { pattern, note } of FAIR_HOUSING_TERMS) {
    const m = text.match(pattern);
    if (m) hits.push({ term: m[0], note });
  }
  return hits;
}

export const FAIR_HOUSING_BLOCK =
  "Marketing copy contains language that reads on a protected class. Describe the property, not the people who should or should not live there.";

// ---------------------------------------------------------------------------
// Hype filter — warn on urgency phrases when a deal has been live > 48 hours.
// ---------------------------------------------------------------------------
const HYPE_PHRASES = [
  "won't last",
  "wont last",
  "first come first served",
  "first come, first served",
  "act now",
  "won't be around",
  "going fast",
  "must go",
];

export function hypeScreen(text: string, hoursLive: number): TermScreenHit[] {
  if (hoursLive <= 48) return [];
  const lower = text.toLowerCase();
  const hits: TermScreenHit[] = [];
  for (const phrase of HYPE_PHRASES) {
    if (lower.includes(phrase)) {
      hits.push({
        term: phrase,
        note: "Urgency language on a deal live over 48 hours reads as manufactured scarcity.",
      });
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Attorney trigger events (Section 6). Four categories that prompt counsel.
// ---------------------------------------------------------------------------
export const ATTORNEY_TRIGGERS = [
  "probate_or_estate_with_unidentified_heirs",
  "title_defect_or_lien_dispute",
  "seller_capacity_or_fraud_concern",
  "novel_or_prohibited_assignment_structure",
] as const;
export type AttorneyTrigger = (typeof ATTORNEY_TRIGGERS)[number];

export const ATTORNEY_TRIGGER_LABELS: Record<AttorneyTrigger, string> = {
  probate_or_estate_with_unidentified_heirs:
    "Probate / estate with unidentified heirs",
  title_defect_or_lien_dispute: "Title defect or lien dispute",
  seller_capacity_or_fraud_concern: "Seller capacity or fraud concern",
  novel_or_prohibited_assignment_structure:
    "Novel or contract-prohibited assignment structure",
};
