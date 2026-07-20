import { describe, it, expect } from "vitest";
import {
  roundUpTo100,
  contingencyPercent,
  computeRepairTotals,
  computeRepairTier,
  reconcileTier,
  simplifiedMao,
  fullStackMao,
  computeTightening,
  buildOfferBand,
  exceedsWalkAway,
  ONE_BUYER_MARKET_BANNER,
  validateGrade,
  applyDecay,
  canRestoreGrade,
  matchBuyers,
  countMatchingABBuyers,
  certaintyScore,
  calendarDeadlines,
  deadlineStatus,
  subtractBusinessDays,
  inspectionPeriodWarning,
  fileTierFromIssues,
  autoEscalateStaleYellow,
  titleOpeningVariance,
  assessPillars,
  assessRedFlags,
  fairHousingScreen,
  hypeScreen,
  buildFilename,
  addressToken,
  tierSource,
  gateContractCreation,
  gateIncompleteLeadAdvance,
  gateEarnestMoney,
  gateDispositionSend,
  gateIncomeRecognition,
  gateMarkClosed,
  masterChecklistComplete,
  taxReserveCents,
  scheduleCadence,
  type BuyerRecord,
  type TitleIssue,
} from "./index";
import { MASTER_CHECKLIST } from "../constants";

const $ = (dollars: number) => dollars * 100;

describe("repair estimate (3.5)", () => {
  it("rounds every line item up to the nearest $100", () => {
    expect(roundUpTo100($(1) + 1)).toBe($(100)); // $1.01 -> $100
    expect(roundUpTo100(1201_00)).toBe(1300_00);
    expect(roundUpTo100(1200_00)).toBe(1200_00);
  });

  it("contingency defaults to 10% and auto-raises to 15% on escalation flags", () => {
    const none = { limitedAccess: false, utilitiesOff: false, vacancyOver12Months: false, sellerEvasiveness: false };
    expect(contingencyPercent(none)).toBe(10);
    expect(contingencyPercent({ ...none, limitedAccess: true })).toBe(15);
    expect(contingencyPercent({ ...none, utilitiesOff: true })).toBe(15);
    expect(contingencyPercent({ ...none, vacancyOver12Months: true })).toBe(15);
    expect(contingencyPercent({ ...none, sellerEvasiveness: true })).toBe(15);
  });

  it("computes contingency as a percentage of summed lines", () => {
    const totals = computeRepairTotals(
      { roof: { low: $(1000), likely: $(1000), high: $(1000) }, kitchen: { low: $(1000), likely: $(1000), high: $(1000) } },
      { limitedAccess: false, utilitiesOff: false, vacancyOver12Months: false, sellerEvasiveness: false },
    );
    expect(totals.subtotal.likely).toBe($(2000));
    expect(totals.contingencyPercent).toBe(10);
    expect(totals.contingency.likely).toBe($(200));
    expect(totals.total.likely).toBe($(2200));
  });

  it("raised contingency flows through totals", () => {
    const totals = computeRepairTotals(
      { roof: { low: $(1000), likely: $(1000), high: $(1000) } },
      { limitedAccess: true, utilitiesOff: false, vacancyOver12Months: false, sellerEvasiveness: false },
    );
    expect(totals.contingencyPercent).toBe(15);
    expect(totals.contingency.likely).toBe($(150));
  });
});

describe("repair tier reconciliation (3.5)", () => {
  it("buckets by tier normalized for sqft", () => {
    expect(computeRepairTier($(20000), 1550)).toBe("light_cosmetic");
    expect(computeRepairTier($(40000), 1550)).toBe("moderate");
    expect(computeRepairTier($(70000), 1550)).toBe("heavy");
    // 3100 sqft at $60k normalizes to ~$30k/baseline -> moderate
    expect(computeRepairTier($(60000), 3100)).toBe("moderate");
  });

  it("prompts on mismatch between line items and selected tier", () => {
    const r = reconcileTier($(70000), 1550, "light_cosmetic");
    expect(r.computedTier).toBe("heavy");
    expect(r.mismatch).toBe(true);
    expect(r.prompt).toContain("Reconcile before offering");
  });

  it("no prompt when tiers agree", () => {
    expect(reconcileTier($(40000), 1550, "moderate").mismatch).toBe(false);
  });
});

describe("MAO engine (3.6)", () => {
  it("simplified form", () => {
    const r = simplifiedMao({
      arvConservativeCents: $(200000),
      buyPercentage: 70,
      repairsLikelyCents: $(40000),
      wholesalerFeeCents: $(10000),
    });
    expect(r.maxBuyerPurchasePriceCents).toBe($(100000)); // 200k*.7 - 40k
    expect(r.maoCents).toBe($(90000));
  });

  it("full-stack form subtracts all cost stacks", () => {
    const r = fullStackMao({
      projectedInvestorValueCents: $(200000),
      acquisitionClosingCostsCents: $(3000),
      holdingCostsCents: $(5000),
      financingCostsCents: $(7000),
      resaleClosingCostsCents: $(12000),
      repairsLikelyCents: $(40000),
      riskReserveCents: $(5000),
      buyerRequiredMarginCents: $(30000),
      wholesalerFeeCents: $(10000),
    });
    expect(r.totalDealCostsCents).toBe($(27000));
    expect(r.maoCents).toBe($(88000));
  });

  it("thin buyer pool triggers the one-buyer-market banner and haircut", () => {
    const t = computeTightening({
      messyTitle: false, messyTitleHaircutCents: 0,
      difficultTenantsOrUnverified: false, difficultTenantsHaircutCents: 0,
      overheatedSubmarket: false, overheatedHaircutCents: 0,
      matchingABBuyerCount: 1, thinPoolHaircutCents: $(5000),
    });
    expect(t.thinBuyerPool).toBe(true);
    expect(t.thinBuyerPoolBanner).toBe(ONE_BUYER_MARKET_BANNER);
    expect(t.totalHaircutCents).toBe($(5000));
  });

  it("offer band locks walk-away to the tightened MAO and hard-stops above it", () => {
    const band = buildOfferBand($(90000), $(5000));
    expect(band.walkAwayCents).toBe($(85000));
    expect(band.idealOfferCents).toBeLessThan(band.walkAwayCents);
    expect(exceedsWalkAway($(85001), band.walkAwayCents)).toBe(true);
    expect(exceedsWalkAway($(85000), band.walkAwayCents)).toBe(false);
  });
});

describe("buyer grading & decay (3.7)", () => {
  it("prevents grade A without POF", () => {
    expect(validateGrade("A", "none").ok).toBe(false);
    expect(validateGrade("A", "pending").ok).toBe(false);
    expect(validateGrade("A", "received").ok).toBe(true);
    expect(validateGrade("B", "none").ok).toBe(true);
  });

  it("decays an A buyer with 91 days of silence to B", () => {
    const now = new Date("2026-07-20T00:00:00Z");
    const d = applyDecay({ grade: "A", lastMeaningfulContact: "2026-04-20" }, now); // 91 days
    expect(d?.newGrade).toBe("B");
    expect(d?.reason).toContain("91 days");
  });

  it("does not decay within 90 days", () => {
    const now = new Date("2026-07-20T00:00:00Z");
    expect(applyDecay({ grade: "A", lastMeaningfulContact: "2026-06-20" }, now)).toBeNull();
  });

  it("restoration requires a note within 7 days", () => {
    const now = new Date("2026-07-20T00:00:00Z");
    expect(canRestoreGrade("2026-07-18", now)).toBe(true);
    expect(canRestoreGrade("2026-07-01", now)).toBe(false);
    expect(canRestoreGrade(null, now)).toBe(false);
  });
});

describe("buyer match engine (3.7)", () => {
  const mk = (over: Partial<BuyerRecord>): BuyerRecord => ({
    id: "b", grade: "A", pofStatus: "received", pofDate: "2026-07-15",
    targetZips: ["77380"], targetCounties: ["Montgomery"],
    priceRangeLowCents: $(50000), priceRangeHighCents: $(150000),
    exitStrategies: ["flip"], rehabTolerance: "moderate",
    disqualifiers: [false, false, false, false, false, false, false, false],
    lastMeaningfulContact: "2026-07-15", ...over,
  });

  it("filters by zip and price band, excludes disqualified, ranks by grade", () => {
    const buyers = [
      mk({ id: "a-fit", grade: "A" }),
      mk({ id: "b-fit", grade: "B" }),
      mk({ id: "wrong-zip", targetZips: ["00000"], targetCounties: [] }),
      mk({ id: "wrong-price", priceRangeLowCents: $(200000), priceRangeHighCents: $(300000) }),
      mk({ id: "dq", disqualifiers: [true, false, false, false, false, false, false, false] }),
    ];
    const matched = matchBuyers(buyers, { zip: "77380", county: "Montgomery", priceCents: $(100000), exitStrategyHint: "flip", repairTier: "moderate" });
    const ids = matched.map((m) => m.buyer.id);
    expect(ids).toContain("a-fit");
    expect(ids).toContain("b-fit");
    expect(ids).not.toContain("wrong-zip");
    expect(ids).not.toContain("wrong-price");
    expect(ids).not.toContain("dq");
    expect(matched[0].buyer.id).toBe("a-fit"); // A ranks above B
  });

  it("counts matching A/B buyers for the thin-pool test", () => {
    const buyers = [mk({ id: "a" }), mk({ id: "b", grade: "B" }), mk({ id: "c", grade: "C", pofStatus: "none" })];
    expect(countMatchingABBuyers(buyers, { zip: "77380", priceCents: $(100000) })).toBe(2);
  });

  it("certainty score rewards POF, history, and responsiveness", () => {
    const strong = certaintyScore(mk({ closingsWithOperator: 3, avgResponseHours: 4, questionQuality: 3, earnestMoneyWillingness: 3, communicationQuality: 3 }), new Date("2026-07-20T00:00:00Z"));
    const weak = certaintyScore(mk({ pofStatus: "none", pofDate: null, closingsWithOperator: 0, avgResponseHours: 72, questionQuality: 0 }), new Date("2026-07-20T00:00:00Z"));
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.score).toBeLessThanOrEqual(100);
  });
});

describe("deadline engine (3.8)", () => {
  it("calendars six deadlines with 3-business-day advance alerts", () => {
    const rows = calendarDeadlines({
      contractSignedDate: "2026-07-20", // Monday
      earnestMoneyDueDate: "2026-07-23",
      inspectionPeriodDays: 10,
      closingDate: "2026-08-20",
    });
    expect(rows).toHaveLength(6);
    const inspection = rows.find((r) => r.kind === "inspection_deadline")!;
    expect(inspection.dueDate).toBe("2026-07-30");
    // advance alert is 3 business days before the due date
    expect(inspection.advanceAlertDate).toBe(subtractBusinessDays("2026-07-30", 3));
  });

  it("subtractBusinessDays skips weekends", () => {
    // 2026-07-20 is a Monday; 3 business days before is prior Wednesday 2026-07-15
    expect(subtractBusinessDays("2026-07-20", 3)).toBe("2026-07-15");
  });

  it("flags status transitions", () => {
    const d = { dueDate: "2026-07-20", advanceAlertDate: "2026-07-15" };
    expect(deadlineStatus(d, "2026-07-10")).toBe("clear");
    expect(deadlineStatus(d, "2026-07-16")).toBe("approaching");
    expect(deadlineStatus(d, "2026-07-20")).toBe("due");
    expect(deadlineStatus(d, "2026-07-21")).toBe("missed");
  });

  it("warns on short inspection periods", () => {
    expect(inspectionPeriodWarning(5)).toContain("minimum");
    expect(inspectionPeriodWarning(8)).toContain("tight");
    expect(inspectionPeriodWarning(14)).toBeNull();
  });
});

describe("title triage (3.9)", () => {
  it("file takes the worst lens — clean ownership+liens, serious property defect => red", () => {
    const issues: TitleIssue[] = [
      { category: "property_specific", severity: "red", issue: "Open permit / unpermitted addition", cureRealisticInWindow: false, buyerWillStillPerform: false },
    ];
    const { lensTiers, fileTier } = fileTierFromIssues(issues);
    expect(lensTiers.ownership).toBe("green");
    expect(lensTiers.liens).toBe("green");
    expect(lensTiers.property_specific).toBe("red");
    expect(fileTier).toBe("red");
  });

  it("worst-lens with a yellow property issue is yellow, not green", () => {
    const issues: TitleIssue[] = [
      { category: "property_specific", severity: "yellow", issue: "Survey gap", cureRealisticInWindow: true, buyerWillStillPerform: true },
    ];
    expect(fileTierFromIssues(issues).fileTier).toBe("yellow");
  });

  it("auto-escalates a stale yellow file to red at end of diligence", () => {
    const r = autoEscalateStaleYellow("yellow", true);
    expect(r.tier).toBe("red");
    expect(r.prompt).toContain("Terminate");
  });

  it("flags a title-opening variance when opened after signing", () => {
    expect(titleOpeningVariance("2026-07-20", "2026-07-22").hasVariance).toBe(true);
    expect(titleOpeningVariance("2026-07-20", "2026-07-20").hasVariance).toBe(false);
  });
});

describe("qualification (3.3)", () => {
  it("two-or-more absent pillars triggers the weak-lead banner", () => {
    const r = assessPillars({ motivation: 0, timeline: 0, authority: 2, condition: 2, price_flexibility: 2 });
    expect(r.weak).toBe(true);
    expect(r.banner).toBe("Weak lead: two or more pillars absent");
  });

  it("one absent pillar is not weak", () => {
    expect(assessPillars({ motivation: 0, timeline: 2, authority: 2, condition: 2, price_flexibility: 2 }).weak).toBe(false);
  });

  it("two red flags block advancement without a written override", () => {
    const flags = [true, true, false, false, false, false, false, false, false];
    expect(assessRedFlags(flags).blocked).toBe(true);
    expect(assessRedFlags(flags, "Confirmed heirs signed; attorney engaged.").blocked).toBe(false);
    expect(assessRedFlags(flags, "no").blocked).toBe(true); // too short to count
  });
});

describe("compliance screens (Section 6)", () => {
  it("fair-housing screen catches protected-class proxies", () => {
    expect(fairHousingScreen("Great home in a safe neighborhood").length).toBeGreaterThan(0);
    expect(fairHousingScreen("Perfect for a Christian family").length).toBeGreaterThan(0);
    expect(fairHousingScreen("3 bed 2 bath, 1500 sqft, needs roof").length).toBe(0);
  });

  it("hype filter only fires after 48 hours live", () => {
    expect(hypeScreen("Won't last!", 20)).toHaveLength(0);
    expect(hypeScreen("Won't last!", 60).length).toBeGreaterThan(0);
  });
});

describe("file naming (3.13)", () => {
  it("builds the enforced filename and target folder", () => {
    const f = buildFilename("ExecutedContract", "123 Main St", "2026-03-11", "pdf");
    expect(f.filename).toBe("2026-03-11_123MainSt_ExecutedContract.pdf");
    expect(f.folder).toBe("03 Contract");
  });

  it("addressToken strips punctuation and camelizes", () => {
    expect(addressToken("123 Main St.")).toBe("123MainSt");
  });

  it("rejects unknown document types", () => {
    expect(() => buildFilename("Whatever", "1 A St", "2026-01-01")).toThrow();
  });
});

describe("lead source tiering (3.12)", () => {
  it("tier 1 requires repeatable qualified leads and a close", () => {
    const t = tierSource([
      { month: "2026-05", spendCents: $(1000), leadsGenerated: 40, qualifiedLeads: 5, contractsSigned: 1, dealsClosed: 1, grossFeesCents: $(12000) },
      { month: "2026-06", spendCents: $(1000), leadsGenerated: 42, qualifiedLeads: 4, contractsSigned: 1, dealsClosed: 0, grossFeesCents: 0 },
    ]);
    expect(t.tier).toBe("tier_1");
    expect(t.verdict).toBe("keep");
  });

  it("weak results get cut", () => {
    const t = tierSource([{ month: "2026-06", spendCents: $(2000), leadsGenerated: 100, qualifiedLeads: 0, contractsSigned: 0, dealsClosed: 0, grossFeesCents: 0 }]);
    expect(t.tier).toBe("tier_3");
    expect(t.verdict).toBe("cut");
  });
});

describe("six no-cross gates + master checklist (Section 4)", () => {
  it("#1 blocks contract creation on an incomplete lead sheet", () => {
    expect(gateContractCreation({ property_address: "1 A St" }).ok).toBe(false);
  });

  it("#1 quick-capture lead cannot advance past contact_made", () => {
    expect(gateIncompleteLeadAdvance(true, "qualified").ok).toBe(false);
    expect(gateIncompleteLeadAdvance(true, "contact_made").ok).toBe(true);
    expect(gateIncompleteLeadAdvance(false, "qualified").ok).toBe(true);
  });

  it("#2 blocks earnest money without title contact + escrow + verified wire", () => {
    expect(gateEarnestMoney({ hasVerifiedTitleContact: true, hasEscrowInstructionsFile: true, wireVerifiedByPhone: false }).ok).toBe(false);
    expect(gateEarnestMoney({ hasVerifiedTitleContact: true, hasEscrowInstructionsFile: true, wireVerifiedByPhone: true }).ok).toBe(true);
  });

  it("#3 blocks disposition send without an assignable contract", () => {
    expect(gateDispositionSend({ hasContract: false, assignabilityConfirmed: false }).ok).toBe(false);
    expect(gateDispositionSend({ hasContract: true, assignabilityConfirmed: false }).ok).toBe(false);
    expect(gateDispositionSend({ hasContract: true, assignabilityConfirmed: true }).ok).toBe(true);
  });

  it("#5 blocks income recognition before funding confirmation", () => {
    expect(gateIncomeRecognition(false).ok).toBe(false);
    expect(gateIncomeRecognition(true).ok).toBe(true);
  });

  it("mark-closed gate requires all 19 checklist items", () => {
    const partial = Object.fromEntries(MASTER_CHECKLIST.slice(0, 18).map((k) => [k, "2026-07-20"]));
    expect(gateMarkClosed(partial).ok).toBe(false);
    expect(masterChecklistComplete(partial).done).toBe(18);
    const full = Object.fromEntries(MASTER_CHECKLIST.map((k) => [k, "2026-07-20"]));
    expect(gateMarkClosed(full).ok).toBe(true);
  });

  it("tax reserve computes at 30% by default", () => {
    expect(taxReserveCents($(10000))).toBe($(3000));
    expect(taxReserveCents($(10000), 25)).toBe($(2500));
  });

  it("schedules the follow-up cadence from lead creation", () => {
    const touches = scheduleCadence("2026-07-20");
    expect(touches[0].dueDate).toBe("2026-07-20");
    expect(touches.find((t) => t.label.includes("Re-engagement"))?.dueDate).toBe("2026-08-03"); // +14
  });
});
