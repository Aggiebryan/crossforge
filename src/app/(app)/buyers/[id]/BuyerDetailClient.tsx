"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GradeBadge } from "@/components/Badges";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Label, Textarea } from "@/components/ui/primitives";
import {
  validateGrade,
  applyDecay,
  daysSinceContact,
  canRestoreGrade,
  certaintyScore,
  isDisqualified,
  GRADE_RESTORE_BLOCKED,
  DECAY_DAYS,
} from "@/domain/engines/buyers";
import { BUYER_DISQUALIFIERS, BUYER_GRADES, type BuyerGrade } from "@/domain/constants";
import { formatCents } from "@/lib/utils";
import type { BuyerView } from "@/lib/data/buyers";

const NOW = new Date("2026-07-20T12:00:00Z");

export function BuyerDetailClient({ buyer }: { buyer: BuyerView }) {
  const [grade, setGrade] = useState<BuyerGrade>(buyer.grade);
  const [noteDate, setNoteDate] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState("");

  const days = daysSinceContact(buyer.lastMeaningfulContact, NOW);
  const decay = applyDecay(buyer, NOW);
  const gradeValidation = validateGrade(grade, buyer.pofStatus);
  const certainty = certaintyScore(buyer, NOW);
  const countdown = days == null ? null : DECAY_DAYS - days;

  const wantsRestore = decay != null && grade !== decay.newGrade && grade !== "C";
  const restoreAllowed = canRestoreGrade(noteDate, NOW);

  return (
    <div>
      <PageHeader
        title={buyer.name}
        subtitle={`${buyer.company ?? buyer.buyerType} · ${buyer.phone}`}
        actions={<GradeBadge grade={buyer.grade} />}
      />
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Grade</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex gap-2">
                {BUYER_GRADES.map((g) => {
                  const wouldBeValid = validateGrade(g, buyer.pofStatus).ok;
                  return (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      disabled={!wouldBeValid}
                      title={!wouldBeValid ? "Grade A requires proof of funds on file" : undefined}
                      className={`flex-1 rounded border px-3 py-2 text-sm font-medium ${
                        grade === g
                          ? "border-accent bg-accent/15 text-accent"
                          : wouldBeValid
                            ? "border-border text-fg-muted hover:bg-bg-elev-2"
                            : "border-border text-fg-faint opacity-40 cursor-not-allowed"
                      }`}
                    >
                      Grade {g}
                    </button>
                  );
                })}
              </div>
              {!gradeValidation.ok && (
                <EnforcementBanner tone="danger" title="Grade A requires proof of funds">
                  {gradeValidation.message}
                </EnforcementBanner>
              )}
              {decay && (
                <EnforcementBanner tone="warn" title="Auto-downgraded by the nightly decay job">
                  {decay.reason} This buyer is in the Re-verify queue.
                </EnforcementBanner>
              )}
              {wantsRestore && (
                <div className="rounded border border-border p-3">
                  <div className="text-xs font-medium text-fg">Restore grade</div>
                  <p className="mt-1 text-[12px] text-fg-muted">{GRADE_RESTORE_BLOCKED}</p>
                  <Label className="mt-2">Logged conversation (reconfirms buy box + capital)</Label>
                  <Textarea
                    rows={2}
                    value={noteBody}
                    onChange={(e) => {
                      setNoteBody(e.target.value);
                      setNoteDate("2026-07-20");
                    }}
                    placeholder="Spoke with buyer; reconfirmed zip focus, price band, and current POF."
                  />
                  <Button className="mt-2" disabled={!restoreAllowed || noteBody.trim().length < 10}>
                    {restoreAllowed ? "Log note & restore grade" : "Note required within 7 days"}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buy box</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
              <KV label="Target zips" value={buyer.targetZips.join(", ") || "—"} />
              <KV label="Counties" value={buyer.targetCounties.join(", ") || "—"} />
              <KV label="Price band" value={`${formatCents(buyer.priceRangeLowCents)}–${formatCents(buyer.priceRangeHighCents)}`} />
              <KV label="Exit strategies" value={buyer.exitStrategies.join(", ") || "—"} />
              <KV label="Rehab tolerance" value={buyer.rehabTolerance} />
              <KV label="Buyer type" value={buyer.buyerType} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disqualifier checklist</CardTitle>
            </CardHeader>
            <CardBody className="space-y-1.5">
              {BUYER_DISQUALIFIERS.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px]">
                  <span className={`h-3.5 w-3.5 rounded border ${buyer.disqualifiers[i] ? "border-danger bg-danger" : "border-border"}`} />
                  <span className={buyer.disqualifiers[i] ? "text-danger" : "text-fg-muted"}>{d}</span>
                </div>
              ))}
              {isDisqualified(buyer) && (
                <div className="pt-2">
                  <EnforcementBanner tone="danger" title="Excluded from list counts and pool depth">
                    A disqualified buyer does not count toward buyer-pool depth in the pricing engine.
                  </EnforcementBanner>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Proof of funds</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Status</span>
                <Badge tone={buyer.pofStatus === "received" ? "ok" : buyer.pofStatus === "pending" ? "warn" : "danger"}>{buyer.pofStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Dated</span>
                <span className="text-fg">{buyer.pofDate ?? "—"}</span>
              </div>
            </CardBody>
          </Card>

          <Card className={countdown != null && countdown <= 0 ? "border-warn/40" : ""}>
            <CardHeader>
              <CardTitle>Contact recency</CardTitle>
            </CardHeader>
            <CardBody className="text-sm">
              <div className="text-2xl font-semibold tabular text-fg">{days == null ? "—" : `${days}d`}</div>
              <div className="text-xs text-fg-muted">since last meaningful contact</div>
              {countdown != null && (
                <div className={`mt-2 text-xs ${countdown <= 0 ? "text-warn" : "text-fg-muted"}`}>
                  {countdown <= 0 ? "Past the 90-day decay threshold." : `${countdown} days until auto-decay.`}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Certainty score</span>
                <Badge tone={certainty.score >= 70 ? "ok" : certainty.score >= 40 ? "warn" : "danger"}>{certainty.score}/100</Badge>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-1">
              {certainty.components.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-[12px]">
                  <span className="text-fg-muted">{c.label}</span>
                  <span className="tabular text-fg">
                    {c.points}/{c.max}
                  </span>
                </div>
              ))}
              <p className="pt-1 text-[10px] text-fg-faint">Buyers rank by certainty, not headline price.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="mb-0.5">{label}</Label>
      <div className="text-sm text-fg">{value}</div>
    </div>
  );
}
