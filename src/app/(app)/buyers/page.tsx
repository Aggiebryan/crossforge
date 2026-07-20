"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, CardBody, CardHeader, CardTitle, EnforcementBanner } from "@/components/ui/primitives";
import { GradeBadge } from "@/components/Badges";
import { DEMO_BUYERS, DEMO_LEADS } from "@/demo/data";
import { isDisqualified, matchBuyers, daysSinceContact, applyDecay } from "@/domain/engines/buyers";
import { formatCents } from "@/lib/utils";
import { Zap } from "lucide-react";

const NOW = new Date("2026-07-20T12:00:00Z");

export default function BuyersPage() {
  const [matchLeadId, setMatchLeadId] = useState<string>("");
  const [matchMs, setMatchMs] = useState<number | null>(null);
  const [matches, setMatches] = useState<ReturnType<typeof matchBuyers> | null>(null);

  function runMatch(leadId: string) {
    setMatchLeadId(leadId);
    const lead = DEMO_LEADS.find((l) => l.id === leadId)!;
    const t0 = performance.now();
    const result = matchBuyers(DEMO_BUYERS, {
      zip: lead.zip,
      county: lead.county,
      priceCents: lead.seller_asking_price_cents || 150_000_00,
      exitStrategyHint: null,
      repairTier: null,
    });
    const t1 = performance.now();
    setMatches(result);
    setMatchMs(t1 - t0);
  }

  return (
    <div>
      <PageHeader
        title="Buyer list"
        subtitle={`${DEMO_BUYERS.filter((b) => !isDisqualified(b)).length} active · ${DEMO_BUYERS.filter((b) => isDisqualified(b)).length} disqualified (excluded from counts)`}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={matchLeadId}
              onChange={(e) => e.target.value && runMatch(e.target.value)}
              className="rounded-md border border-border bg-bg-elev px-2 py-1 text-xs text-fg"
            >
              <option value="">Match to property…</option>
              {DEMO_LEADS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.street}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {matches && (
          <Card className="border-accent/40">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" /> Match short list
                </span>
                <Badge tone={matchMs !== null && matchMs < 2000 ? "ok" : "danger"}>
                  {matchMs?.toFixed(1)} ms {matchMs !== null && matchMs < 2000 ? "· under 2s" : ""}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {matches.length === 0 && (
                <p className="text-sm text-fg-faint">No buyers match this property&apos;s zip and price band.</p>
              )}
              {matches.map((m) => {
                const b = DEMO_BUYERS.find((x) => x.id === m.buyer.id)!;
                return (
                  <Link
                    key={m.buyer.id}
                    href={`/buyers/${m.buyer.id}`}
                    className="flex items-center justify-between rounded border border-border px-3 py-2 hover:bg-bg-elev-2"
                  >
                    <div className="flex items-center gap-2">
                      <GradeBadge grade={m.buyer.grade} />
                      <span className="text-sm text-fg">{b.name}</span>
                      <span className="text-[11px] text-fg-faint">{m.reasons.join(" · ")}</span>
                    </div>
                    <span className="text-xs tabular text-fg-muted">score {m.matchScore}</span>
                  </Link>
                );
              })}
            </CardBody>
          </Card>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bg-elev text-left text-xs text-fg-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Buyer</th>
                <th className="px-3 py-2 font-medium">Grade</th>
                <th className="px-3 py-2 font-medium">POF</th>
                <th className="px-3 py-2 font-medium">Buy box</th>
                <th className="px-3 py-2 font-medium">Price band</th>
                <th className="px-3 py-2 font-medium">Last contact</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_BUYERS.map((b) => {
                const dq = isDisqualified(b);
                const days = daysSinceContact(b.lastMeaningfulContact, NOW);
                const decay = applyDecay(b, NOW);
                return (
                  <tr key={b.id} className={`border-t border-border hover:bg-bg-elev-2 ${dq ? "opacity-50" : ""}`}>
                    <td className="px-3 py-2">
                      <Link href={`/buyers/${b.id}`} className="text-accent hover:underline">
                        {b.name}
                      </Link>
                      <div className="text-[11px] text-fg-faint">{b.buyerType}</div>
                    </td>
                    <td className="px-3 py-2">
                      <GradeBadge grade={b.grade} />
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={b.pofStatus === "received" ? "ok" : b.pofStatus === "pending" ? "warn" : "danger"}>
                        {b.pofStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-fg-muted">
                      {b.targetZips.slice(0, 3).join(", ")}
                    </td>
                    <td className="px-3 py-2 tabular text-fg-muted">
                      {formatCents(b.priceRangeLowCents)}–{formatCents(b.priceRangeHighCents)}
                    </td>
                    <td className="px-3 py-2 text-fg-muted">
                      {days == null ? "—" : `${days}d ago`}
                    </td>
                    <td className="px-3 py-2">
                      {dq ? (
                        <Badge tone="danger">Disqualified</Badge>
                      ) : decay ? (
                        <Badge tone="warn">Re-verify due</Badge>
                      ) : (
                        <Badge tone="ok">Active</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <EnforcementBanner tone="ok" title="A real buyer list is a match engine, not a contact list.">
          The practical test: match any property to a ranked short list in under two seconds.
          Disqualified buyers are excluded from counts and from the pricing engine&apos;s buyer-pool
          depth calculation.
        </EnforcementBanner>
      </div>
    </div>
  );
}
