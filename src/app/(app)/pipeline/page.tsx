"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/primitives";
import { DEMO_LEADS } from "@/demo/data";
import { LEAD_STAGES, LEAD_STAGE_LABELS } from "@/domain/constants";
import { cn, formatCents } from "@/lib/utils";

// Kanban shows the working stages; terminal states get their own columns too.
const KANBAN_STAGES = LEAD_STAGES;

export default function PipelinePage() {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  return (
    <div>
      <PageHeader
        title="Seller pipeline"
        subtitle="18 fixed stages · drag-to-advance is gated by validations"
        actions={
          <div className="flex rounded-md border border-border p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium",
                view === "kanban" ? "bg-accent text-accent-fg" : "text-fg-muted",
              )}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium",
                view === "table" ? "bg-accent text-accent-fg" : "text-fg-muted",
              )}
            >
              Table
            </button>
          </div>
        }
      />
      {view === "kanban" ? <Kanban /> : <Table />}
    </div>
  );
}

function Kanban() {
  return (
    <div className="overflow-x-auto p-4">
      <div className="flex gap-3" style={{ minWidth: "max-content" }}>
        {KANBAN_STAGES.map((stage) => {
          const leads = DEMO_LEADS.filter((l) => l.stage === stage);
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-fg-muted">
                  {LEAD_STAGE_LABELS[stage]}
                </span>
                <span className="text-[11px] text-fg-faint">{leads.length}</span>
              </div>
              <div className="space-y-2">
                {leads.map((l) => (
                  <Link
                    key={l.id}
                    href={`/pipeline/${l.id}`}
                    className="block rounded-md border border-border bg-bg-elev p-3 hover:border-border-strong"
                  >
                    <div className="text-sm font-medium text-fg leading-tight">
                      {l.street}
                    </div>
                    <div className="text-xs text-fg-muted">
                      {l.city}, {l.state} {l.zip}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs tabular text-fg-muted">
                        {l.seller_asking_price_cents
                          ? formatCents(l.seller_asking_price_cents)
                          : "—"}
                      </span>
                      <div className="flex gap-1">
                        {l.is_incomplete && <Badge tone="warn">Incomplete</Badge>}
                        <RatingBadge rating={l.lead_rating} />
                      </div>
                    </div>
                  </Link>
                ))}
                {leads.length === 0 && (
                  <div className="rounded-md border border-dashed border-border py-6 text-center text-[11px] text-fg-faint">
                    empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Table() {
  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-elev text-left text-xs text-fg-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Property</th>
              <th className="px-3 py-2 font-medium">Owner</th>
              <th className="px-3 py-2 font-medium">Stage</th>
              <th className="px-3 py-2 font-medium">Rating</th>
              <th className="px-3 py-2 font-medium">Asking</th>
              <th className="px-3 py-2 font-medium">Next touch</th>
              <th className="px-3 py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_LEADS.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-bg-elev-2">
                <td className="px-3 py-2">
                  <Link href={`/pipeline/${l.id}`} className="text-accent hover:underline">
                    {l.property_address}
                  </Link>
                </td>
                <td className="px-3 py-2 text-fg-muted">{l.owner_name}</td>
                <td className="px-3 py-2">
                  <Badge>{LEAD_STAGE_LABELS[l.stage]}</Badge>
                </td>
                <td className="px-3 py-2">
                  <RatingBadge rating={l.lead_rating} />
                </td>
                <td className="px-3 py-2 tabular text-fg-muted">
                  {l.seller_asking_price_cents ? formatCents(l.seller_asking_price_cents) : "—"}
                </td>
                <td className="px-3 py-2 text-fg-muted">
                  {l.next_touch_date ?? <span className="text-warn">unset</span>}
                </td>
                <td className="px-3 py-2 text-fg-muted">{l.lead_source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RatingBadge({ rating }: { rating: string }) {
  const tone = rating === "strong" ? "ok" : rating === "medium" ? "warn" : "danger";
  return <Badge tone={tone}>{rating}</Badge>;
}
