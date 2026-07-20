"use client";

import Link from "next/link";
import { use, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Label } from "@/components/ui/primitives";
import { MasterChecklistRail } from "@/components/MasterChecklistRail";
import { QualificationPanel } from "@/components/QualificationPanel";
import { DealFolderMeter } from "@/components/DealFolderMeter";
import { getLead } from "@/demo/data";
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  REQUIRED_LEAD_FIELDS,
  type LeadStage,
} from "@/domain/constants";
import { gateIncompleteLeadAdvance, leadSheetComplete, scheduleCadence } from "@/domain/engines/gates";
import { formatCents } from "@/lib/utils";

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lead = getLead(id);
  const [stage, setStage] = useState<LeadStage>(lead?.stage ?? "new");

  if (!lead) {
    return (
      <div className="p-8 text-fg-muted">
        Lead not found. <Link href="/pipeline" className="text-accent">Back to pipeline</Link>
      </div>
    );
  }

  const sheet = leadSheetComplete(lead as unknown as Record<string, unknown>);
  const cadence = scheduleCadence(lead.date_created);

  return (
    <div>
      <PageHeader
        title={lead.property_address}
        subtitle={`${lead.owner_name} · ${lead.lead_source} · created ${lead.date_created}`}
        actions={
          <Badge tone={lead.is_incomplete ? "warn" : "ok"}>
            {lead.is_incomplete ? "Quick-capture (incomplete)" : "Lead sheet complete"}
          </Badge>
        }
      />
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[240px_1fr]">
        {/* Master checklist rail */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <MasterChecklistRail lead={lead} />
        </div>

        <div className="space-y-5">
          {/* Stage advancement with gate */}
          <Card>
            <CardHeader>
              <CardTitle>Stage</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {LEAD_STAGES.map((s) => (
                  <StageChip key={s} stage={s} current={stage} onSelect={setStage} incomplete={lead.is_incomplete} />
                ))}
              </div>
              {(() => {
                const gate = gateIncompleteLeadAdvance(lead.is_incomplete, stage);
                if (!gate.ok) {
                  return (
                    <EnforcementBanner tone="danger" title={gate.rule}>
                      {gate.message}
                    </EnforcementBanner>
                  );
                }
                return null;
              })()}
            </CardBody>
          </Card>

          {/* Lead sheet completeness */}
          {!sheet.complete && (
            <EnforcementBanner tone="warn" title="No contract without a completed lead sheet">
              Missing required fields: {sheet.missing.map((f) => f.replace(/_/g, " ")).join(", ")}. A
              purchase contract cannot be created against this lead until they are filled.
            </EnforcementBanner>
          )}

          {/* Lead sheet summary */}
          <Card>
            <CardHeader>
              <CardTitle>Lead sheet</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
              <Field label="Occupancy" value={lead.occupancy_status} req={REQUIRED_LEAD_FIELDS as unknown as string[]} name="occupancy_status" />
              <Field label="Property type" value={lead.property_type} req={REQUIRED_LEAD_FIELDS as unknown as string[]} name="property_type" />
              <Field label="Beds / baths / sqft" value={`${lead.beds || "—"} / ${lead.baths || "—"} / ${lead.square_feet || "—"}`} />
              <Field label="Year built" value={lead.year_built || "—"} />
              <Field label="Asking price" value={lead.seller_asking_price_cents ? formatCents(lead.seller_asking_price_cents) : "—"} req={REQUIRED_LEAD_FIELDS as unknown as string[]} name="seller_asking_price" />
              <Field label="Timeline" value={lead.seller_timeline} req={REQUIRED_LEAD_FIELDS as unknown as string[]} name="seller_timeline" />
              <Field label="Access" value={lead.access_available} req={REQUIRED_LEAD_FIELDS as unknown as string[]} name="access_available" />
              <Field label="Who must sign" value={lead.who_must_sign ?? ""} req={REQUIRED_LEAD_FIELDS as unknown as string[]} name="who_must_sign" />
              <Field label="Next action" value={lead.next_action ?? ""} req={REQUIRED_LEAD_FIELDS as unknown as string[]} name="next_action" />
              <div className="col-span-2 md:col-span-3">
                <Label>Reason for selling (verbatim)</Label>
                <p className="rounded border border-border bg-bg px-2.5 py-2 text-sm italic text-fg">
                  &ldquo;{lead.reason_for_selling}&rdquo;
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Qualification */}
          <QualificationPanel lead={lead} />

          {/* Follow-up cadence */}
          <Card>
            <CardHeader>
              <CardTitle>Follow-up cadence</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {cadence.map((t) => (
                  <div key={t.dueDate} className="rounded border border-border px-2.5 py-2">
                    <div className="text-xs font-medium text-fg">{t.dueDate}</div>
                    <div className="text-[11px] text-fg-muted">{t.label}</div>
                    <Badge className="mt-1">{t.channel}</Badge>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-fg-faint">
                Auto-scheduled on lead creation. Every logged contact requires a next-touch date
                before the form will save.
              </p>
            </CardBody>
          </Card>

          {/* Deal folder */}
          <DealFolderMeter lead={lead} />
        </div>
      </div>
    </div>
  );
}

function StageChip({
  stage,
  current,
  onSelect,
  incomplete,
}: {
  stage: LeadStage;
  current: LeadStage;
  onSelect: (s: LeadStage) => void;
  incomplete: boolean;
}) {
  const active = stage === current;
  const gate = gateIncompleteLeadAdvance(incomplete, stage);
  const blocked = !gate.ok;
  return (
    <button
      onClick={() => onSelect(stage)}
      disabled={blocked}
      title={blocked ? gate.message : undefined}
      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
        active
          ? "border-accent bg-accent/15 text-accent"
          : blocked
            ? "border-border bg-bg text-fg-faint opacity-50 cursor-not-allowed"
            : "border-border bg-bg text-fg-muted hover:border-border-strong"
      }`}
    >
      {LEAD_STAGE_LABELS[stage]}
    </button>
  );
}

function Field({
  label,
  value,
  req,
  name,
}: {
  label: string;
  value: string | number;
  req?: string[];
  name?: string;
}) {
  const isRequired = req && name && req.includes(name);
  const missing = isRequired && (value === "" || value === "—" || value == null);
  return (
    <div>
      <Label className="mb-0.5">
        {label}
        {isRequired && <span className="ml-1 text-danger">*</span>}
      </Label>
      <div className={`text-sm ${missing ? "text-danger" : "text-fg"}`}>
        {missing ? "missing" : String(value)}
      </div>
    </div>
  );
}
