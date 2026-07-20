"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Label, Input } from "@/components/ui/primitives";
import {
  calendarDeadlines,
  deadlineStatus,
  inspectionPeriodWarning,
} from "@/domain/engines/deadlines";
import { fileTierFromIssues, titleOpeningVariance, type TitleIssue, type TitleTier } from "@/domain/engines/title";
import { gateEarnestMoney } from "@/domain/engines/gates";
import { CONTRACT_PACKET_DOCS, CONTRACT_PACKET_LABELS } from "@/domain/constants";
import { formatDate } from "@/lib/utils";

const TODAY = "2026-07-20";

export default function ContractsPage() {
  return (
    <div>
      <PageHeader title="Contracts & title" subtitle="123 Main St, Conroe · under contract" />
      <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
        <DeadlineEngine />
        <EarnestMoneyGate />
        <PacketChecklist />
        <TitleTriage />
      </div>
    </div>
  );
}

function DeadlineEngine() {
  const [inspectionDays, setInspectionDays] = useState(10);
  const deadlines = calendarDeadlines({
    contractSignedDate: "2026-07-14",
    earnestMoneyDueDate: "2026-07-21",
    inspectionPeriodDays: inspectionDays,
    closingDate: "2026-08-20",
  });
  const warning = inspectionPeriodWarning(inspectionDays);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deadline engine</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="mb-0">Inspection period (days)</Label>
          <Input
            type="number"
            value={inspectionDays}
            onChange={(e) => setInspectionDays(parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>
        {warning && (
          <EnforcementBanner tone="warn" title="Inspection period">
            {warning}
          </EnforcementBanner>
        )}
        <div className="space-y-1.5">
          {deadlines.map((d) => {
            const status = deadlineStatus(d, TODAY);
            const tone = status === "missed" ? "danger" : status === "due" || status === "approaching" ? "warn" : "ok";
            return (
              <div key={d.kind} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
                <div>
                  <div className="text-fg">{d.label}</div>
                  <div className="text-[11px] text-fg-faint">
                    Alert 3 business days prior: {formatDate(d.advanceAlertDate)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="tabular text-fg">{formatDate(d.dueDate)}</div>
                  <Badge tone={tone}>{status}</Badge>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-fg-faint">
          Six deadlines auto-calendared on contract creation. Each fires 3 business days ahead and
          again on the day. A missed deadline is a red persistent flag that needs a written note to
          dismiss.
        </p>
      </CardBody>
    </Card>
  );
}

function EarnestMoneyGate() {
  const [titleContact, setTitleContact] = useState(true);
  const [escrowFile, setEscrowFile] = useState(false);
  const [wireVerified, setWireVerified] = useState(false);
  const gate = gateEarnestMoney({
    hasVerifiedTitleContact: titleContact,
    hasEscrowInstructionsFile: escrowFile,
    wireVerifiedByPhone: wireVerified,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnest money release gate</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <Toggle label="Verified title contact on file" checked={titleContact} onChange={setTitleContact} />
        <Toggle label="Escrow instructions uploaded" checked={escrowFile} onChange={setEscrowFile} />
        <Toggle
          label="Wire instructions verified by phone to a previously known number"
          checked={wireVerified}
          onChange={setWireVerified}
        />
        <EnforcementBanner tone={gate.ok ? "ok" : "danger"} title={gate.rule}>
          {gate.message}
        </EnforcementBanner>
        <Button variant={gate.ok ? "default" : "outline"} disabled={!gate.ok}>
          Mark earnest money sent
        </Button>
      </CardBody>
    </Card>
  );
}

function PacketChecklist() {
  const [attached, setAttached] = useState<Record<string, boolean>>({
    purchase_contract: true,
    equitable_interest_disclosure: true,
    assignment_agreement: false,
    earnest_money_instructions: false,
    inspection_addendum: true,
    access_authorization: true,
    cancellation_release: false,
  });
  const lastReview = "2025-05-01"; // >12 months old
  const monthsOld = 14;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract packet (7 documents)</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2">
        {CONTRACT_PACKET_DOCS.map((doc) => (
          <label key={doc} className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={attached[doc] ?? false}
              onChange={() => setAttached({ ...attached, [doc]: !attached[doc] })}
              className="accent-[var(--accent)]"
            />
            <span className={attached[doc] ? "text-fg" : "text-fg-muted"}>
              {CONTRACT_PACKET_LABELS[doc]}
            </span>
            {attached[doc] && <Badge tone="ok" className="ml-auto">attached</Badge>}
          </label>
        ))}
        {monthsOld > 12 && (
          <EnforcementBanner tone="warn" title="Packet templates need legal review">
            Last legal review of the packet templates was {formatDate(lastReview)} ({monthsOld}{" "}
            months ago). Over 12 months — route the templates to counsel.
          </EnforcementBanner>
        )}
      </CardBody>
    </Card>
  );
}

function TitleTriage() {
  const issues: TitleIssue[] = [
    {
      category: "ownership",
      severity: "green",
      issue: "Single owner, clean vesting deed",
      cureRealisticInWindow: true,
      buyerWillStillPerform: true,
    },
    {
      category: "liens",
      severity: "green",
      issue: "Payoff obtained, no additional liens",
      cureRealisticInWindow: true,
      buyerWillStillPerform: true,
    },
    {
      category: "property_specific",
      severity: "red",
      issue: "Unpermitted addition + open code violation on the garage conversion",
      cureRealisticInWindow: false,
      buyerWillStillPerform: false,
    },
  ];
  const { lensTiers, fileTier } = fileTierFromIssues(issues);
  const variance = titleOpeningVariance("2026-07-14", "2026-07-16");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Title file triage</span>
          <TierBadge tier={fileTier} />
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <LensCell label="Ownership" tier={lensTiers.ownership} />
          <LensCell label="Liens" tier={lensTiers.liens} />
          <LensCell label="Property-specific" tier={lensTiers.property_specific} />
        </div>
        <EnforcementBanner
          tone={fileTier === "red" ? "danger" : fileTier === "yellow" ? "warn" : "ok"}
          title={`File is ${fileTier.toUpperCase()} — worst of the three lenses`}
        >
          Clean ownership and clean liens, but a serious property-specific defect drags the whole
          file to {fileTier}. The file takes the worst lens; it is computed, not operator judgment.
        </EnforcementBanner>
        {variance.hasVariance && (
          <EnforcementBanner tone="warn" title="Title opening variance (permanent)">
            Title opened {variance.daysLate} day(s) after the contract was signed. Title should open
            the same day.
          </EnforcementBanner>
        )}
        <div className="space-y-1.5">
          {issues.map((i, idx) => (
            <div key={idx} className="flex items-start gap-2 rounded border border-border px-3 py-2 text-[12px]">
              <TierBadge tier={i.severity} />
              <div>
                <div className="text-fg">{i.issue}</div>
                <div className="text-[11px] text-fg-faint">
                  Cure realistic: {i.cureRealisticInWindow ? "yes" : "no"} · Buyer performs:{" "}
                  {i.buyerWillStillPerform ? "yes" : "no"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-fg-muted">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--accent)]" />
      {label}
    </label>
  );
}

function TierBadge({ tier }: { tier: TitleTier }) {
  const tone = tier === "green" ? "ok" : tier === "yellow" ? "warn" : "danger";
  return <Badge tone={tone}>{tier}</Badge>;
}

function LensCell({ label, tier }: { label: string; tier: TitleTier }) {
  const bg = tier === "green" ? "bg-ok-bg" : tier === "yellow" ? "bg-warn-bg" : "bg-danger-bg";
  const fg = tier === "green" ? "text-ok" : tier === "yellow" ? "text-warn" : "text-danger";
  return (
    <div className={`rounded border border-border p-2 ${bg}`}>
      <div className="text-[10px] text-fg-muted">{label}</div>
      <div className={`text-sm font-semibold ${fg}`}>{tier}</div>
    </div>
  );
}
