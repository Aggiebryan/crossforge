"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Input, Label } from "@/components/ui/primitives";
import { DEMO_BUYERS, DEMO_LEADS } from "@/demo/data";
import {
  REPAIR_LINE_ITEMS,
  REPAIR_LINE_LABELS,
  REPAIR_TIERS,
  REPAIR_TIER_LABELS,
  BUY_PERCENTAGE_PRESETS,
  type RepairTier,
} from "@/domain/constants";
import {
  computeRepairTotals,
  reconcileTier,
  CONTINGENCY_ROUNDUP_TOOLTIP,
  type RepairLines,
} from "@/domain/engines/repair";
import {
  simplifiedMao,
  fullStackMao,
  computeTightening,
  buildOfferBand,
  exceedsWalkAway,
  WALK_AWAY_HARDSTOP_BODY,
  WALK_AWAY_HARDSTOP_TITLE,
} from "@/domain/engines/mao";
import { countMatchingABBuyers } from "@/domain/engines/buyers";
import { dollarsToCents, formatCents } from "@/lib/utils";

export default function UnderwritingPage() {
  const [leadId, setLeadId] = useState("L-1005");
  const lead = DEMO_LEADS.find((l) => l.id === leadId)!;

  // Repair worksheet state (dollars entered; converted to cents).
  const [lines, setLines] = useState<Record<string, { low: string; likely: string; high: string }>>(
    () => seedRepairLines(),
  );
  const [selectedTier, setSelectedTier] = useState<RepairTier | null>("light_cosmetic");

  // Escalation flags come from the lead.
  const flags = {
    limitedAccess: lead.flag_limited_access,
    utilitiesOff: lead.flag_utilities_off,
    vacancyOver12Months: lead.flag_vacancy_over_12mo,
    sellerEvasiveness: lead.flag_seller_evasive,
  };

  const repairLinesCents: RepairLines = useMemo(() => {
    const out: RepairLines = {};
    for (const item of REPAIR_LINE_ITEMS) {
      const v = lines[item];
      if (v && (v.low || v.likely || v.high)) {
        out[item] = {
          low: dollarsToCents(v.low || "0"),
          likely: dollarsToCents(v.likely || "0"),
          high: dollarsToCents(v.high || "0"),
        };
      }
    }
    return out;
  }, [lines]);

  const totals = computeRepairTotals(repairLinesCents, flags);
  const tierRec = reconcileTier(totals.total.likely, lead.square_feet, selectedTier);

  // MAO inputs
  const [arvConservative, setArvConservative] = useState("175000");
  const [buyPct, setBuyPct] = useState(70);
  const [wholesalerFee, setWholesalerFee] = useState("12000");

  const arvCents = dollarsToCents(arvConservative);
  const feeCents = dollarsToCents(wholesalerFee);

  const simple = simplifiedMao({
    arvConservativeCents: arvCents,
    buyPercentage: buyPct,
    repairsLikelyCents: totals.total.likely,
    wholesalerFeeCents: feeCents,
  });

  const full = fullStackMao({
    projectedInvestorValueCents: arvCents,
    acquisitionClosingCostsCents: dollarsToCents("3000"),
    holdingCostsCents: dollarsToCents("6000"),
    financingCostsCents: dollarsToCents("8000"),
    resaleClosingCostsCents: dollarsToCents("11000"),
    repairsLikelyCents: totals.total.likely,
    riskReserveCents: dollarsToCents("5000"),
    buyerRequiredMarginCents: dollarsToCents("28000"),
    wholesalerFeeCents: feeCents,
  });

  // Thin buyer pool — count active A/B buyers matching this zip + price band.
  const matchingAB = countMatchingABBuyers(DEMO_BUYERS, {
    zip: lead.zip,
    county: lead.county,
    priceCents: simple.maoCents,
  });

  const tightening = computeTightening({
    messyTitle: lead.flag_seller_evasive,
    messyTitleHaircutCents: lead.flag_seller_evasive ? dollarsToCents("4000") : 0,
    difficultTenantsOrUnverified: lead.flag_limited_access,
    difficultTenantsHaircutCents: lead.flag_limited_access ? dollarsToCents("3000") : 0,
    overheatedSubmarket: false,
    overheatedHaircutCents: 0,
    matchingABBuyerCount: matchingAB,
    thinPoolHaircutCents: matchingAB <= 1 ? dollarsToCents("5000") : 0,
  });

  const band = buildOfferBand(simple.maoCents, tightening.totalHaircutCents);

  // Offer entry with hard-stop
  const [offerEntry, setOfferEntry] = useState("");
  const [justification, setJustification] = useState("");
  const offerCents = offerEntry ? dollarsToCents(offerEntry) : 0;
  const over = offerEntry !== "" && exceedsWalkAway(offerCents, band.walkAwayCents);

  return (
    <div>
      <PageHeader
        title="Underwriting workspace"
        subtitle={`${lead.property_address} · walk-away always visible in red`}
        actions={
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="rounded-md border border-border bg-bg-elev px-2 py-1 text-xs text-fg"
          >
            {DEMO_LEADS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.street}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
        {/* Left: comps/ARV summary */}
        <Card>
          <CardHeader>
            <CardTitle>Comps & ARV basis</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <Label>ARV conservative</Label>
                <Input value={arvConservative} onChange={(e) => setArvConservative(e.target.value)} />
              </div>
              <div>
                <Label>Wholesaler fee</Label>
                <Input value={wholesalerFee} onChange={(e) => setWholesalerFee(e.target.value)} />
              </div>
              <div>
                <Label>Sqft (for tier)</Label>
                <div className="rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm tabular text-fg-muted">
                  {lead.square_feet}
                </div>
              </div>
            </div>
            <div>
              <Label>Buy percentage</Label>
              <div className="flex gap-1.5">
                {BUY_PERCENTAGE_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setBuyPct(p.value)}
                    className={`flex-1 rounded border px-2 py-1.5 text-xs ${
                      buyPct === p.value
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border text-fg-muted hover:bg-bg-elev-2"
                    }`}
                  >
                    {p.label} {p.value}%
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded border border-border bg-bg p-2 text-[11px] text-fg-muted">
              Comps table (min 3, target 5) attaches here. Manual entry is always supported as the
              fallback path when a data provider is unavailable.
            </div>
          </CardBody>
        </Card>

        {/* Right: repair worksheet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Repair worksheet</span>
              <Badge tone={totals.contingencyPercent === 15 ? "warn" : "neutral"}>
                Contingency {totals.contingencyPercent}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-bg-elev text-left text-fg-muted">
                  <tr>
                    <th className="py-1 font-medium">Line</th>
                    <th className="py-1 font-medium">Low</th>
                    <th className="py-1 font-medium">Likely</th>
                    <th className="py-1 font-medium">High</th>
                  </tr>
                </thead>
                <tbody>
                  {REPAIR_LINE_ITEMS.map((item) => (
                    <tr key={item} className="border-t border-border">
                      <td className="py-1 pr-2 text-fg-muted">{REPAIR_LINE_LABELS[item]}</td>
                      {(["low", "likely", "high"] as const).map((band) => (
                        <td key={band} className="py-0.5 pr-1">
                          <input
                            value={lines[item]?.[band] ?? ""}
                            onChange={(e) =>
                              setLines({
                                ...lines,
                                [item]: { ...lines[item], [band]: e.target.value },
                              })
                            }
                            placeholder="0"
                            className="w-16 rounded border border-border bg-bg px-1 py-0.5 text-right tabular text-fg focus:border-accent focus:outline-none"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-border-strong font-medium text-fg-muted">
                    <td className="py-1" title={CONTINGENCY_ROUNDUP_TOOLTIP}>
                      Contingency ({totals.contingencyPercent}%)
                    </td>
                    <td className="py-1 text-right tabular">{formatCents(totals.contingency.low)}</td>
                    <td className="py-1 text-right tabular">{formatCents(totals.contingency.likely)}</td>
                    <td className="py-1 text-right tabular">{formatCents(totals.contingency.high)}</td>
                  </tr>
                  <tr className="border-t border-border-strong font-semibold text-fg">
                    <td className="py-1">Total</td>
                    <td className="py-1 text-right tabular">{formatCents(totals.total.low)}</td>
                    <td className="py-1 text-right tabular">{formatCents(totals.total.likely)}</td>
                    <td className="py-1 text-right tabular">{formatCents(totals.total.high)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-[10px] text-fg-faint" title={CONTINGENCY_ROUNDUP_TOOLTIP}>
              Every entered line rounds up to the nearest $100. Contingency auto-raises to 15% on
              limited access, utilities off, 12-month vacancy, or seller evasiveness.
            </p>

            {/* Tier reconciliation */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-fg-muted">Visual tier:</span>
              {REPAIR_TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className={`rounded border px-2 py-0.5 text-[11px] ${
                    selectedTier === t
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border text-fg-muted"
                  }`}
                >
                  {REPAIR_TIER_LABELS[t]}
                </button>
              ))}
            </div>
            {tierRec.mismatch && (
              <div className="mt-2">
                <EnforcementBanner tone="warn" title="Repair tier mismatch">
                  {tierRec.prompt}
                </EnforcementBanner>
              </div>
            )}
          </CardBody>
        </Card>

        {/* MAO both forms */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>MAO engine — both forms, side by side</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-border p-3">
              <div className="mb-2 text-xs font-semibold text-fg">Simplified</div>
              <Calc label="ARV conservative × buy %" value={formatCents(Math.round((arvCents * buyPct) / 100))} sub={`${formatCents(arvCents)} × ${buyPct}%`} />
              <Calc label="− Repairs (likely)" value={`(${formatCents(totals.total.likely)})`} />
              <Calc label="Max buyer purchase price" value={formatCents(simple.maxBuyerPurchasePriceCents)} strong />
              <Calc label="− Wholesaler fee" value={`(${formatCents(feeCents)})`} />
              <Calc label="MAO" value={formatCents(simple.maoCents)} strong />
            </div>
            <div className="rounded border border-border p-3">
              <div className="mb-2 text-xs font-semibold text-fg">Full stack</div>
              <Calc label="Projected investor value" value={formatCents(arvCents)} />
              <Calc label="− Deal costs (acq/hold/fin/resale)" value={`(${formatCents(full.totalDealCostsCents)})`} />
              <Calc label="− Repairs" value={`(${formatCents(totals.total.likely)})`} />
              <Calc label="− Risk reserve" value={`(${formatCents(dollarsToCents("5000"))})`} />
              <Calc label="− Buyer required margin" value={`(${formatCents(dollarsToCents("28000"))})`} />
              <Calc label="− Wholesaler fee" value={`(${formatCents(feeCents)})`} />
              <Calc label="MAO" value={formatCents(full.maoCents)} strong />
            </div>
          </CardBody>
        </Card>

        {/* Tightening + offer band pinned */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Tightening adjustments & offer band</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {tightening.thinBuyerPoolBanner && (
              <EnforcementBanner tone="danger" title="One-buyer market">
                {tightening.thinBuyerPoolBanner} Only {matchingAB} matching A/B buyer(s) in {lead.zip}.
              </EnforcementBanner>
            )}
            {tightening.adjustments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tightening.adjustments.map((a) => (
                  <Badge key={a.reason} tone="warn">
                    {a.reason}: −{formatCents(a.amountCents)}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <OfferNum label="Ideal offer" cents={band.idealOfferCents} tone="ok" />
              <OfferNum label="Acceptable offer" cents={band.acceptableOfferCents} tone="neutral" />
              <OfferNum label="Walk-away (MAO)" cents={band.walkAwayCents} tone="danger" />
            </div>

            <div className="rounded border border-border p-3">
              <Label>Offer entry</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={offerEntry}
                  onChange={(e) => setOfferEntry(e.target.value)}
                  placeholder="Enter offer in dollars"
                  className={over ? "border-danger" : ""}
                />
                <span className="text-xs text-fg-muted">
                  Walk-away <span className="font-semibold text-danger">{formatCents(band.walkAwayCents)}</span>
                </span>
              </div>
              {over && (
                <div className="mt-2 rounded-md border border-danger bg-danger-bg p-3">
                  <div className="text-sm font-semibold text-danger">{WALK_AWAY_HARDSTOP_TITLE}</div>
                  <p className="mt-1 text-[12px] text-danger/90">{WALK_AWAY_HARDSTOP_BODY}</p>
                  <Label className="mt-2">Written justification (permanently logged)</Label>
                  <Input
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Why does this deal justify paying above the walk-away number?"
                  />
                  <Button
                    variant="danger"
                    className="mt-2"
                    disabled={justification.trim().length < 10}
                  >
                    Log override and proceed
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function seedRepairLines(): Record<string, { low: string; likely: string; high: string }> {
  return {
    roof: { low: "3000", likely: "4500", high: "6000" },
    kitchen: { low: "5000", likely: "7000", high: "9000" },
    flooring: { low: "2500", likely: "3200", high: "4000" },
    paint_drywall: { low: "2000", likely: "2800", high: "3500" },
  };
}

function Calc({ label, value, sub, strong }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-0.5 ${strong ? "border-t border-border mt-1 pt-1" : ""}`}>
      <span className={`text-[12px] ${strong ? "font-semibold text-fg" : "text-fg-muted"}`} title={sub}>
        {label}
      </span>
      <span className={`tabular text-[13px] ${strong ? "font-semibold text-fg" : "text-fg-muted"}`}>
        {value}
      </span>
    </div>
  );
}

function OfferNum({ label, cents, tone }: { label: string; cents: number; tone: "ok" | "neutral" | "danger" }) {
  const color = tone === "ok" ? "text-ok" : tone === "danger" ? "text-danger" : "text-fg";
  return (
    <div className="rounded border border-border p-3 text-center">
      <div className="text-[11px] text-fg-muted">{label}</div>
      <div className={`text-lg font-semibold tabular ${color}`}>{formatCents(cents)}</div>
    </div>
  );
}
