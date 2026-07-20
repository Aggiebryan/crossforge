"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Label, Input, Textarea } from "@/components/ui/primitives";
import { gateIncomeRecognition, gateCompleteWithTaxReserve, taxReserveCents, DEFAULT_TAX_RESERVE_PCT } from "@/domain/engines/gates";
import { useCan } from "@/components/RoleContext";
import { formatCents, dollarsToCents, daysBetween } from "@/lib/utils";

const PRECLOSE = ["Confirm buyer POF and EM posted", "Assignment agreement executed", "Title clear to close", "Buyer & closer aligned on figures", "Seller confirmed to sign"];
const DAYOF = ["Wire instructions verified", "Signing scheduled", "Closer confirms funding path", "Assignment fee on settlement statement"];
const POSTCLOSE = ["Funding confirmed", "Assignment fee received", "Deal folder complete", "Tax reserve moved", "Post-close review"];

export default function ClosingPage() {
  const can = useCan();
  const [fundingConfirmed, setFundingConfirmed] = useState(false);
  const [grossFee, setGrossFee] = useState("24000");
  const [taxMoved, setTaxMoved] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  const grossFeeCents = dollarsToCents(grossFee);
  const incomeGate = gateIncomeRecognition(fundingConfirmed);
  const reserve = taxReserveCents(grossFeeCents);
  const taxGate = gateCompleteWithTaxReserve(fundingConfirmed && !taxMoved);

  const leadToContract = daysBetween("2026-06-25", "2026-07-08");
  const contractToPlacement = daysBetween("2026-07-08", "2026-07-15");
  const contractToClose = daysBetween("2026-07-08", "2026-07-20");

  const canComplete = fundingConfirmed && taxMoved && reviewDone;

  return (
    <div>
      <PageHeader title="Closing workspace" subtitle="220 Rivershade, Spring · assigned" />
      <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Three-stage checklist</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Stage title="Pre-close" items={PRECLOSE} allDone />
            <Stage title="Day-of" items={DAYOF} allDone={false} />
            <Stage title="Post-close" items={POSTCLOSE} allDone={false} />
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Funding confirmation & income</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {can.financials && (
                <div>
                  <Label>Gross fee</Label>
                  <Input value={grossFee} onChange={(e) => setGrossFee(e.target.value)} />
                </div>
              )}
              <label className="flex items-center gap-2 text-[13px] text-fg-muted">
                <input type="checkbox" checked={fundingConfirmed} onChange={(e) => setFundingConfirmed(e.target.checked)} className="accent-[var(--ok)]" />
                Closing desk confirms the wire has funded
              </label>
              <EnforcementBanner tone={incomeGate.ok ? "ok" : "danger"} title={incomeGate.rule}>
                {incomeGate.message}
              </EnforcementBanner>
              {can.financials && (
                <Button variant={incomeGate.ok ? "ok" : "outline"} disabled={!incomeGate.ok}>
                  Record {formatCents(grossFeeCents)} as income
                </Button>
              )}
            </CardBody>
          </Card>

          {fundingConfirmed && (
            <Card className={taxMoved ? "" : "border-warn/40"}>
              <CardHeader>
                <CardTitle>Tax reserve</CardTitle>
              </CardHeader>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">Required transfer ({DEFAULT_TAX_RESERVE_PCT}% of gross fee)</span>
                  <span className="tabular font-semibold text-fg">{formatCents(reserve)}</span>
                </div>
                <label className="flex items-center gap-2 text-[13px] text-fg-muted">
                  <input type="checkbox" checked={taxMoved} onChange={(e) => setTaxMoved(e.target.checked)} className="accent-[var(--ok)]" />
                  Tax reserve transferred
                </label>
                {!taxGate.ok && (
                  <EnforcementBanner tone="warn" title={taxGate.rule}>
                    {taxGate.message}
                  </EnforcementBanner>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Post-closing review</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <Metric label="Lead → contract" value={`${leadToContract}d`} />
                <Metric label="Contract → placement" value={`${contractToPlacement}d`} />
                <Metric label="Contract → close" value={`${contractToClose}d`} />
              </div>
              <p className="text-[11px] text-fg-faint">Days auto-calculate from stage timestamps.</p>
              <Label>What nearly caused failure on this deal</Label>
              <Textarea rows={2} placeholder="Be honest — this feeds the SOP defect process." />
              <Label>What should change next time</Label>
              <Textarea rows={2} />
              <label className="flex items-center gap-2 text-[13px] text-fg-muted">
                <input type="checkbox" checked={reviewDone} onChange={(e) => setReviewDone(e.target.checked)} className="accent-[var(--ok)]" />
                Post-close review complete (required within 48h of funding)
              </label>
              <EnforcementBanner tone={canComplete ? "ok" : "danger"} title="Mark deal complete">
                {canComplete
                  ? "All gates cleared. This deal can be marked complete."
                  : "Deal cannot be marked complete until funding is confirmed, the tax reserve is moved, and the post-close review is done."}
              </EnforcementBanner>
              <Button variant={canComplete ? "ok" : "outline"} disabled={!canComplete} className="w-full">
                Mark deal complete
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stage({ title, items, allDone }: { title: string; items: string[]; allDone: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-xs font-semibold text-fg">{title}</span>
        <Badge tone={allDone ? "ok" : "neutral"}>{allDone ? "complete" : "in progress"}</Badge>
      </div>
      <div className="space-y-1">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className={`h-3 w-3 rounded-full border ${allDone ? "border-ok bg-ok" : "border-border"}`} />
            <span className={allDone ? "text-fg" : "text-fg-muted"}>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border p-2 text-center">
      <div className="text-lg font-semibold tabular text-fg">{value}</div>
      <div className="text-[10px] text-fg-muted">{label}</div>
    </div>
  );
}
