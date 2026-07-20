/**
 * 3.6 MAO engine — both the simplified and full-stack forms, plus the
 * tightening adjustments and the three-number offer band whose walk-away number
 * is locked to the MAO.
 *
 * All money is integer cents. buy_percentage is a whole-number percent.
 */

export interface SimplifiedMaoInput {
  arvConservativeCents: number;
  buyPercentage: number; // 60–80
  repairsLikelyCents: number;
  wholesalerFeeCents: number;
}

export interface SimplifiedMaoResult {
  maxBuyerPurchasePriceCents: number;
  maoCents: number;
}

export function simplifiedMao(i: SimplifiedMaoInput): SimplifiedMaoResult {
  const pct = clampBuyPercentage(i.buyPercentage);
  const maxBuyerPurchasePriceCents = Math.round(
    (i.arvConservativeCents * pct) / 100 - i.repairsLikelyCents,
  );
  return {
    maxBuyerPurchasePriceCents,
    maoCents: maxBuyerPurchasePriceCents - i.wholesalerFeeCents,
  };
}

export function clampBuyPercentage(pct: number): number {
  return Math.min(80, Math.max(60, pct));
}

export interface FullStackMaoInput {
  projectedInvestorValueCents: number; // ARV the buyer underwrites to
  acquisitionClosingCostsCents: number;
  holdingCostsCents: number;
  financingCostsCents: number;
  resaleClosingCostsCents: number;
  repairsLikelyCents: number;
  riskReserveCents: number;
  buyerRequiredMarginCents: number;
  wholesalerFeeCents: number;
}

export interface FullStackMaoResult {
  totalDealCostsCents: number;
  maoCents: number;
}

export function fullStackMao(i: FullStackMaoInput): FullStackMaoResult {
  const totalDealCostsCents =
    i.acquisitionClosingCostsCents +
    i.holdingCostsCents +
    i.financingCostsCents +
    i.resaleClosingCostsCents;
  const maoCents =
    i.projectedInvestorValueCents -
    totalDealCostsCents -
    i.repairsLikelyCents -
    i.riskReserveCents -
    i.buyerRequiredMarginCents -
    i.wholesalerFeeCents;
  return { totalDealCostsCents, maoCents };
}

// ---------------------------------------------------------------------------
// Tightening adjustments — each reduces the MAO and logs a reason.
// ---------------------------------------------------------------------------
export interface TighteningInput {
  messyTitle: boolean;
  messyTitleHaircutCents: number; // operator-selectable, default $3k–$5k
  difficultTenantsOrUnverified: boolean;
  difficultTenantsHaircutCents: number;
  overheatedSubmarket: boolean;
  overheatedHaircutCents: number;
  /** Count of active A/B buyers matching this zip + price band, disqualifiers
   * already removed. Drives the one-buyer-market banner. */
  matchingABBuyerCount: number;
  thinPoolHaircutCents: number;
}

export interface TighteningAdjustment {
  reason: string;
  amountCents: number;
}

export interface TighteningResult {
  adjustments: TighteningAdjustment[];
  totalHaircutCents: number;
  thinBuyerPool: boolean;
  thinBuyerPoolBanner: string | null;
}

export const MESSY_TITLE_HAIRCUT_MIN = 3000 * 100;
export const MESSY_TITLE_HAIRCUT_MAX = 5000 * 100;
export const ONE_BUYER_MARKET_BANNER =
  "One-buyer market. A one-buyer market does not pay full spread.";

export function computeTightening(i: TighteningInput): TighteningResult {
  const adjustments: TighteningAdjustment[] = [];
  if (i.messyTitle && i.messyTitleHaircutCents > 0) {
    adjustments.push({
      reason: "Messy title (probate/heirs/liens/HOA)",
      amountCents: i.messyTitleHaircutCents,
    });
  }
  if (i.difficultTenantsOrUnverified && i.difficultTenantsHaircutCents > 0) {
    adjustments.push({
      reason: "Difficult tenants or unverified condition (limited access)",
      amountCents: i.difficultTenantsHaircutCents,
    });
  }
  if (i.overheatedSubmarket && i.overheatedHaircutCents > 0) {
    adjustments.push({
      reason: "Overheated submarket (stale comps / >15% 6-mo movement)",
      amountCents: i.overheatedHaircutCents,
    });
  }
  const thinBuyerPool = i.matchingABBuyerCount <= 1;
  if (thinBuyerPool && i.thinPoolHaircutCents > 0) {
    adjustments.push({
      reason: "Thin buyer pool (≤1 matching A/B buyer)",
      amountCents: i.thinPoolHaircutCents,
    });
  }
  return {
    adjustments,
    totalHaircutCents: adjustments.reduce((s, a) => s + a.amountCents, 0),
    thinBuyerPool,
    thinBuyerPoolBanner: thinBuyerPool ? ONE_BUYER_MARKET_BANNER : null,
  };
}

// ---------------------------------------------------------------------------
// Offer band — three numbers, walk-away locked to (tightened) MAO.
// ---------------------------------------------------------------------------
export interface OfferBand {
  idealOfferCents: number;
  acceptableOfferCents: number;
  /** Absolute walk-away number. Equals the MAO after tightening. Locked. */
  walkAwayCents: number;
}

/**
 * Build an offer band from a base MAO and total tightening haircut.
 * Ideal = 88% of walk-away, Acceptable = 95% of walk-away by default; both are
 * suggestions the operator can edit, but walk-away is the tightened MAO and is
 * not editable downward-only enforcement lives in `exceedsWalkAway`.
 */
export function buildOfferBand(
  baseMaoCents: number,
  totalHaircutCents: number,
  ratios: { ideal: number; acceptable: number } = { ideal: 0.88, acceptable: 0.95 },
): OfferBand {
  const walkAwayCents = Math.max(0, baseMaoCents - totalHaircutCents);
  return {
    idealOfferCents: Math.round(walkAwayCents * ratios.ideal),
    acceptableOfferCents: Math.round(walkAwayCents * ratios.acceptable),
    walkAwayCents,
  };
}

/** The hard stop. Any offer above the walk-away number requires a written,
 * permanently-logged justification. */
export function exceedsWalkAway(offerCents: number, walkAwayCents: number): boolean {
  return offerCents > walkAwayCents;
}

export const WALK_AWAY_HARDSTOP_TITLE =
  "This offer exceeds the walk-away number.";
export const WALK_AWAY_HARDSTOP_BODY =
  "The walk-away number is the most you can pay and still make this deal work. Exceeding it requires a written justification that is permanently logged. The number does not move because you want the deal.";
