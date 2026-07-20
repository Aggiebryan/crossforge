"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  MASTER_CHECKLIST,
  MASTER_CHECKLIST_LABELS,
  stageIndex,
  type MasterChecklistItem,
} from "@/domain/constants";
import { gateMarkClosed } from "@/domain/engines/gates";
import type { DemoLead } from "@/demo/data";
import { Badge, EnforcementBanner } from "@/components/ui/primitives";

// Map each checklist item to the earliest stage by which it should be done, so
// a lead's stage seeds a realistic completion state in the demo.
const ITEM_STAGE_GATE: Record<MasterChecklistItem, number> = {
  lead_entered: stageIndex("new"),
  contact_attempted: stageIndex("attempting_contact"),
  seller_qualified: stageIndex("qualified"),
  property_reviewed: stageIndex("qualified"),
  deal_sheet_completed: stageIndex("offer_pending"),
  offer_band_approved: stageIndex("offer_made"),
  contract_signed: stageIndex("under_contract"),
  deadlines_calendared: stageIndex("under_contract"),
  title_opened: stageIndex("title_opened"),
  buyer_type_identified: stageIndex("disposition_active"),
  deal_package_completed: stageIndex("disposition_active"),
  buyers_contacted: stageIndex("disposition_active"),
  proof_of_funds_received: stageIndex("assigned"),
  buyer_selected: stageIndex("assigned"),
  closing_coordinated: stageIndex("assigned"),
  deal_funded: stageIndex("closed"),
  tax_reserve_moved: stageIndex("closed"),
  kpi_updated: stageIndex("closed"),
  post_close_review_completed: stageIndex("closed"),
};

export function MasterChecklistRail({ lead }: { lead: DemoLead }) {
  const seeded = useMemo(() => {
    const s: Partial<Record<MasterChecklistItem, string | null>> = {};
    const li = stageIndex(lead.stage);
    for (const item of MASTER_CHECKLIST) {
      if (ITEM_STAGE_GATE[item] <= li && lead.stage !== "dead") {
        s[item] = lead.date_created;
      }
    }
    return s;
  }, [lead]);

  const [state, setState] = useState(seeded);

  function toggle(item: MasterChecklistItem) {
    setState((prev) => ({ ...prev, [item]: prev[item] ? null : "2026-07-20" }));
  }

  const gate = gateMarkClosed(state);

  return (
    <div className="rounded-lg border border-border bg-bg-elev">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-fg">Master checklist</span>
        <Badge tone={gate.ok ? "ok" : "neutral"}>
          {MASTER_CHECKLIST.length - gateMarkClosedMissing(state)}/{MASTER_CHECKLIST.length}
        </Badge>
      </div>
      <ol className="p-2">
        {MASTER_CHECKLIST.map((item, idx) => {
          const done = Boolean(state[item]);
          return (
            <li key={item} className="relative flex items-start gap-2 pl-1">
              {idx < MASTER_CHECKLIST.length - 1 && (
                <span
                  className={`absolute left-[13px] top-6 h-full w-px ${done ? "bg-ok/40" : "bg-border"}`}
                />
              )}
              <button
                onClick={() => toggle(item)}
                className={`z-10 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                  done ? "border-ok bg-ok text-white" : "border-border-strong bg-bg text-transparent"
                }`}
              >
                <Check className="h-3 w-3" />
              </button>
              <div className="pb-2">
                <div className={`text-[12px] leading-tight ${done ? "text-fg" : "text-fg-muted"}`}>
                  {MASTER_CHECKLIST_LABELS[item]}
                </div>
                {done && <div className="text-[10px] text-fg-faint">{state[item]}</div>}
              </div>
            </li>
          );
        })}
      </ol>
      {!gate.ok && (
        <div className="border-t border-border p-2">
          <EnforcementBanner tone="danger" title="Not closeable">
            {gate.message}
          </EnforcementBanner>
        </div>
      )}
    </div>
  );
}

function gateMarkClosedMissing(state: Partial<Record<MasterChecklistItem, string | null>>): number {
  return MASTER_CHECKLIST.filter((i) => !state[i]).length;
}
