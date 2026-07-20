"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Label, Textarea } from "@/components/ui/primitives";
import { gateDispositionSend, gateBlastAnalysis } from "@/domain/engines/gates";
import { fairHousingScreen, hypeScreen, FAIR_HOUSING_BLOCK } from "@/domain/engines/compliance";

const DEFAULT_BLAST = `3/2, 1520 sqft, vacant. Est. repairs $18k–$26k. Conservative ARV $175,000. Asking assignment at $132,000. Closing desk: Lone Star Title. Access: lockbox, code on request. Buyer EM required: $5,000. Photos attached. Buyer to verify all figures independently.`;

export default function DispositionPage() {
  const [hasContract, setHasContract] = useState(true);
  const [assignable, setAssignable] = useState(true);
  const [body, setBody] = useState(DEFAULT_BLAST);
  const [hoursLive, setHoursLive] = useState(60);

  const gate = gateDispositionSend({ hasContract, assignabilityConfirmed: assignable });
  const analysisGate = gateBlastAnalysis({
    hasArvBasis: true,
    hasRepairEstimate: true,
    hasConservativeSpread: true,
    hasDisclosedAssumptions: true,
  });
  const fhHits = fairHousingScreen(body);
  const hypeHits = hypeScreen(body, hoursLive);

  const canSend = gate.ok && analysisGate.ok && fhHits.length === 0;

  return (
    <div>
      <PageHeader title="Disposition workspace" subtitle="220 Rivershade, Spring · deal blast composer" />
      <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Marketing gate</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-[13px] text-fg-muted">
                <input type="checkbox" checked={hasContract} onChange={(e) => setHasContract(e.target.checked)} className="accent-[var(--accent)]" />
                Signed contract on file
              </label>
              <label className="flex items-center gap-2 text-[13px] text-fg-muted">
                <input type="checkbox" checked={assignable} onChange={(e) => setAssignable(e.target.checked)} className="accent-[var(--accent)]" />
                Assignability confirmed
              </label>
            </div>
            <EnforcementBanner tone={gate.ok ? "ok" : "danger"} title={gate.rule}>
              {gate.message}
            </EnforcementBanner>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deal blast composer</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex items-center gap-2 text-[12px] text-fg-muted">
              <Label className="mb-0">Hours live</Label>
              <input
                type="range"
                min={0}
                max={96}
                value={hoursLive}
                onChange={(e) => setHoursLive(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="tabular w-10 text-right">{hoursLive}h</span>
            </div>

            {fhHits.length > 0 && (
              <EnforcementBanner tone="danger" title="Fair-housing screen failed">
                {FAIR_HOUSING_BLOCK}
                <ul className="mt-1 list-disc pl-4">
                  {fhHits.map((h, i) => (
                    <li key={i}>
                      &ldquo;{h.term}&rdquo; — {h.note}
                    </li>
                  ))}
                </ul>
              </EnforcementBanner>
            )}
            {hypeHits.length > 0 && (
              <EnforcementBanner tone="warn" title="Hype filter">
                Deal has been live over 48 hours. Urgency language reads as manufactured scarcity:
                {" "}
                {hypeHits.map((h) => `"${h.term}"`).join(", ")}.
              </EnforcementBanner>
            )}

            <EnforcementBanner tone="warn" title="Broker-line guardrail">
              Marketing property you do not control is the unlicensed-brokerage fact pattern. You are
              marketing an assignable contract, not the property.
            </EnforcementBanner>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiered send</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <TierRow tier="A" label="A-grade matched buyers" unlocked={canSend} note="Sends first" />
            <TierRow tier="B" label="B-grade buyers" unlocked={false} note="Unlocks 4h after A-tier send" />
            <TierRow tier="C" label="C-grade recipients" unlocked={false} note="Requires explicit override" />
            <Button variant={canSend ? "default" : "outline"} disabled={!canSend} className="w-full">
              {canSend ? "Send to A-grade buyers" : "Resolve gates above to send"}
            </Button>
            <div className="rounded border border-border p-2 text-[11px] text-fg-muted">
              Certainty notice sent to competing buyers: &ldquo;Selection on this deal depends on
              certainty as well as price.&rdquo;
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function TierRow({ tier, label, unlocked, note }: { tier: string; label: string; unlocked: boolean; note: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-border px-3 py-2">
      <div className="flex items-center gap-2">
        <Badge tone={tier === "A" ? "ok" : tier === "B" ? "warn" : "danger"}>Grade {tier}</Badge>
        <span className="text-sm text-fg">{label}</span>
      </div>
      <div className="text-right">
        <Badge tone={unlocked ? "ok" : "neutral"}>{unlocked ? "unlocked" : "locked"}</Badge>
        <div className="text-[10px] text-fg-faint">{note}</div>
      </div>
    </div>
  );
}
