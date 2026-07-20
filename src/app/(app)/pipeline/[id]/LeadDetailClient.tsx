"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Label } from "@/components/ui/primitives";
import { MasterChecklistRail } from "@/components/MasterChecklistRail";
import { QualificationPanel } from "@/components/QualificationPanel";
import { DealFolderMeter } from "@/components/DealFolderMeter";
import { LEAD_STAGES, LEAD_STAGE_LABELS, type LeadStage } from "@/domain/constants";
import { gateIncompleteLeadAdvance, leadSheetComplete, scheduleCadence } from "@/domain/engines/gates";
import { formatCents } from "@/lib/utils";
import { updateStageAction } from "../actions";
import type { LeadView } from "@/lib/data/leads";

export function LeadDetailClient({ lead, live }: { lead: LeadView; live: boolean }) {
  const [stage, setStage] = useState<LeadStage>(lead.stage);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sheet = leadSheetComplete(lead as unknown as Record<string, unknown>);
  const cadence = scheduleCadence(lead.date_created);

  function changeStage(target: LeadStage) {
    const gate = gateIncompleteLeadAdvance(lead.is_incomplete, target);
    if (!gate.ok) return;
    setStage(target);
    setError(null);
    if (live) {
      startTransition(async () => {
        const res = await updateStageAction(lead.id, target);
        if (!res.ok) {
          setError(res.error ?? "Failed to save stage.");
          setStage(lead.stage);
        }
      });
    }
  }

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
        <div className="lg:sticky lg:top-20 lg:self-start">
          <MasterChecklistRail lead={lead} />
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Stage {pending && <span className="text-[11px] text-fg-faint">saving…</span>}</span>
                {live && <Badge tone="ok">live</Badge>}
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {LEAD_STAGES.map((s) => {
                  const gate = gateIncompleteLeadAdvance(lead.is_incomplete, s);
                  const blocked = !gate.ok;
                  const active = s === stage;
                  return (
                    <button
                      key={s}
                      onClick={() => changeStage(s)}
                      disabled={blocked || pending}
                      title={blocked ? gate.message : undefined}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                        active
                          ? "border-accent bg-accent/15 text-accent"
                          : blocked
                            ? "border-border bg-bg text-fg-faint opacity-50 cursor-not-allowed"
                            : "border-border bg-bg text-fg-muted hover:border-border-strong"
                      }`}
                    >
                      {LEAD_STAGE_LABELS[s]}
                    </button>
                  );
                })}
              </div>
              {lead.is_incomplete && (
                <EnforcementBanner tone="warn" title="Complete the lead sheet before advancing">
                  This lead came in through quick capture. It cannot move past Contact made until the
                  full sheet is complete.
                </EnforcementBanner>
              )}
              {error && (
                <EnforcementBanner tone="danger" title="Stage not saved">
                  {error}
                </EnforcementBanner>
              )}
            </CardBody>
          </Card>

          {!sheet.complete && (
            <EnforcementBanner tone="warn" title="No contract without a completed lead sheet">
              Missing required fields: {sheet.missing.map((f) => f.replace(/_/g, " ")).join(", ")}. A
              purchase contract cannot be created against this lead until they are filled.
            </EnforcementBanner>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lead sheet</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
              <Field label="Occupancy" value={lead.occupancy_status} />
              <Field label="Property type" value={lead.property_type} />
              <Field label="Beds / baths / sqft" value={`${lead.beds || "—"} / ${lead.baths || "—"} / ${lead.square_feet || "—"}`} />
              <Field label="Year built" value={lead.year_built || "—"} />
              <Field label="Asking price" value={lead.seller_asking_price_cents ? formatCents(lead.seller_asking_price_cents) : "—"} />
              <Field label="Timeline" value={lead.seller_timeline} />
              <Field label="Access" value={lead.access_available} />
              <Field label="Who must sign" value={lead.who_must_sign ?? ""} />
              <Field label="Next action" value={lead.next_action ?? ""} />
              <div className="col-span-2 md:col-span-3">
                <Label>Reason for selling (verbatim)</Label>
                <p className="rounded border border-border bg-bg px-2.5 py-2 text-sm italic text-fg">
                  &ldquo;{lead.reason_for_selling}&rdquo;
                </p>
              </div>
            </CardBody>
          </Card>

          <QualificationPanel lead={lead} />

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

          <DealFolderMeter lead={lead} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  const missing = value === "" || value === "—" || value == null;
  return (
    <div>
      <Label className="mb-0.5">{label}</Label>
      <div className={`text-sm ${missing ? "text-fg-faint" : "text-fg"}`}>{missing ? "—" : String(value)}</div>
    </div>
  );
}
