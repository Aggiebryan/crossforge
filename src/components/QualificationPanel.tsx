"use client";

import { useState } from "react";
import {
  QUALIFICATION_PILLARS,
  RED_FLAGS,
  type QualificationPillar,
} from "@/domain/constants";
import { assessPillars, assessRedFlags } from "@/domain/engines/qualification";
import { Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Label, Textarea } from "@/components/ui/primitives";
import type { DemoLead } from "@/demo/data";

const PILLAR_LABELS: Record<QualificationPillar, string> = {
  motivation: "Motivation",
  timeline: "Timeline",
  authority: "Authority",
  condition: "Condition",
  price_flexibility: "Price flexibility",
};

// Seed pillar scores by lead rating so the demo shows realistic states.
function seedScores(rating: string): Record<QualificationPillar, number> {
  const base = rating === "strong" ? 3 : rating === "medium" ? 2 : 0;
  const s = {} as Record<QualificationPillar, number>;
  for (const p of QUALIFICATION_PILLARS) s[p] = base;
  if (rating === "weak") {
    s.motivation = 1;
    s.timeline = 0;
    s.authority = 0;
  }
  return s;
}

export function QualificationPanel({ lead }: { lead: DemoLead }) {
  const [scores, setScores] = useState(seedScores(lead.lead_rating));
  const [flags, setFlags] = useState<boolean[]>(
    RED_FLAGS.map((_, i) =>
      lead.is_incomplete ? i === 2 || i === 6 : false,
    ),
  );
  const [override, setOverride] = useState("");

  const pillarAssessment = assessPillars(scores);
  const redFlagGate = assessRedFlags(flags, override);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Qualification — five pillars</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        {pillarAssessment.weak && (
          <EnforcementBanner tone="warn" title={pillarAssessment.banner!}>
            Two or more pillars scored 0. Consider routing this lead to Long-term nurture rather
            than spending acquisition time on it.
          </EnforcementBanner>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {QUALIFICATION_PILLARS.map((p) => (
            <div key={p} className="rounded border border-border p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-fg">{PILLAR_LABELS[p]}</span>
                <span className={`text-xs font-semibold tabular ${scores[p] === 0 ? "text-danger" : "text-fg-muted"}`}>
                  {scores[p]}/3
                </span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setScores({ ...scores, [p]: n })}
                    className={`h-6 flex-1 rounded text-[11px] transition ${
                      scores[p] === n
                        ? n === 0
                          ? "bg-danger text-white"
                          : "bg-accent text-accent-fg"
                        : "bg-bg-elev-2 text-fg-muted hover:bg-border"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Red flag checklist */}
        <div>
          <Label>Red flag checklist</Label>
          <div className="space-y-1.5">
            {RED_FLAGS.map((flag, i) => (
              <label key={i} className="flex items-start gap-2 text-[13px] text-fg-muted">
                <input
                  type="checkbox"
                  checked={flags[i]}
                  onChange={() => {
                    const next = [...flags];
                    next[i] = !next[i];
                    setFlags(next);
                  }}
                  className="mt-0.5 accent-[var(--danger)]"
                />
                <span className={flags[i] ? "text-danger" : ""}>{flag}</span>
              </label>
            ))}
          </div>
        </div>

        {redFlagGate.count >= 2 && (
          <div className="space-y-2">
            <EnforcementBanner
              tone={redFlagGate.blocked ? "danger" : "warn"}
              title={
                redFlagGate.blocked
                  ? "Advancement to Offer pending is blocked"
                  : "Advancing on a written override"
              }
            >
              {redFlagGate.message}
            </EnforcementBanner>
            <div>
              <Label>Written override justification (required to advance)</Label>
              <Textarea
                rows={2}
                value={override}
                onChange={(e) => setOverride(e.target.value)}
                placeholder="Explain why this lead can advance despite the red flags. This is permanently logged."
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
