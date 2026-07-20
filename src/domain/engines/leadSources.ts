/**
 * 3.12 Lead-source scorecard. Cost-per-contract is the headline; raw lead count
 * is deliberately demoted. Tiering + verdict are computed, not hand-assigned.
 */

export interface SourceMonth {
  month: string; // YYYY-MM
  spendCents: number;
  leadsGenerated: number;
  qualifiedLeads: number;
  contractsSigned: number;
  dealsClosed: number;
  grossFeesCents: number;
}

export interface SourceScorecard {
  costPerLeadCents: number | null;
  costPerQualifiedLeadCents: number | null;
  costPerContractCents: number | null;
  contractRate: number | null; // contracts / qualified
  closeRate: number | null; // closed / contracts
  qualifiedRate: number | null; // qualified / leads
}

function ratio(n: number, d: number): number | null {
  return d > 0 ? n / d : null;
}

export function scoreMonth(m: SourceMonth): SourceScorecard {
  return {
    costPerLeadCents: m.leadsGenerated > 0 ? Math.round(m.spendCents / m.leadsGenerated) : null,
    costPerQualifiedLeadCents:
      m.qualifiedLeads > 0 ? Math.round(m.spendCents / m.qualifiedLeads) : null,
    costPerContractCents:
      m.contractsSigned > 0 ? Math.round(m.spendCents / m.contractsSigned) : null,
    contractRate: ratio(m.contractsSigned, m.qualifiedLeads),
    closeRate: ratio(m.dealsClosed, m.contractsSigned),
    qualifiedRate: ratio(m.qualifiedLeads, m.leadsGenerated),
  };
}

export type SourceTier = "tier_1" | "tier_2" | "tier_3";
export type SourceVerdict = "keep" | "cut" | "test_further";

export interface SourceTiering {
  tier: SourceTier;
  verdict: SourceVerdict;
  rationale: string;
}

/**
 * Tier 1: repeatable qualified leads AND closed deals across multiple months.
 * Tier 2: some opportunity, inconsistent.
 * Tier 3: weak results.
 */
export function tierSource(months: SourceMonth[]): SourceTiering {
  const monthsWithQualified = months.filter((m) => m.qualifiedLeads > 0).length;
  const totalClosed = months.reduce((s, m) => s + m.dealsClosed, 0);
  const totalContracts = months.reduce((s, m) => s + m.contractsSigned, 0);
  const totalQualified = months.reduce((s, m) => s + m.qualifiedLeads, 0);

  if (monthsWithQualified >= 2 && totalClosed >= 1) {
    return {
      tier: "tier_1",
      verdict: "keep",
      rationale: "Repeatable qualified leads and at least one closed deal across multiple months.",
    };
  }
  if (totalContracts >= 1 || totalQualified >= 2) {
    return {
      tier: "tier_2",
      verdict: "test_further",
      rationale: "Some opportunity but inconsistent. Give it a defined test budget before deciding.",
    };
  }
  return {
    tier: "tier_3",
    verdict: "cut",
    rationale: "Weak results. Raw lead count is not production.",
  };
}
