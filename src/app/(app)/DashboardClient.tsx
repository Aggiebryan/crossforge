"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EnforcementBanner } from "@/components/ui/primitives";
import { applyDecay, type BuyerRecord } from "@/domain/engines/buyers";
import { LEAD_STAGE_LABELS } from "@/domain/constants";
import { formatCents, formatDate } from "@/lib/utils";
import { AlertTriangle, CircleDollarSign, PhoneCall, Plus, Timer, Zap, UserPlus } from "lucide-react";
import type { LeadView } from "@/lib/data/leads";
import type { BuyerView } from "@/lib/data/buyers";

const TODAY = "2026-07-20";

export function DashboardClient({
  leads,
  buyers,
  live,
}: {
  leads: LeadView[];
  buyers: BuyerView[];
  live: boolean;
}) {
  const [priorities, setPriorities] = useState(["", "", ""]);

  const derived = useMemo(() => {
    const now = new Date(TODAY + "T12:00:00Z");
    const abandoned = leads.filter(
      (l) => (l.stage === "follow_up" || l.stage === "long_term_nurture") && !l.next_touch_date,
    );
    const followupsDue = leads.filter((l) => l.next_touch_date === TODAY);
    const contracts = leads.filter((l) => l.stage === "under_contract" || l.stage === "title_opened");
    const offers = leads.filter((l) => l.stage === "offer_pending" || l.stage === "qualified");
    const reverify = buyers.map((b) => ({ b, d: applyDecay(b as BuyerRecord, now) })).filter((x) => x.d);
    const activeContact = leads.filter((l) => l.stage === "attempting_contact" || l.stage === "contact_made");
    const emAtRiskCents = 0;
    const emReserveThreshold = 10_000_00;
    return { abandoned, followupsDue, contracts, offers, reverify, activeContact, emAtRiskCents, emReserveThreshold };
  }, [leads, buyers]);

  return (
    <div>
      <PageHeader
        title="Daily Operator Dashboard"
        subtitle={`${new Date(TODAY + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · ${live ? "live data" : "demo data"}`}
        actions={
          <Link href="/pipeline/new">
            <Button className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New lead
            </Button>
          </Link>
        }
      />
      <div className="p-5 space-y-5">
        {/* Quick actions — the primary "add to the CRM" entry points. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ActionTile
            href="/pipeline/new"
            icon={<Plus className="h-5 w-5" />}
            title="New seller lead"
            desc="Full lead sheet for a property / seller"
            tone="accent"
          />
          <ActionTile
            href="/pipeline/new?mode=quick"
            icon={<Zap className="h-5 w-5" />}
            title="Quick call capture"
            desc="Log the essentials mid-call"
            tone="neutral"
          />
          <ActionTile
            href="/buyers/new"
            icon={<UserPlus className="h-5 w-5" />}
            title="New buyer"
            desc="Add a buyer and buy box"
            tone="neutral"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ThreeQ q="Are we producing enough activity?" value={`${derived.followupsDue.length} follow-ups due today`} tone={derived.followupsDue.length > 0 ? "ok" : "warn"} detail={`${derived.activeContact.length} leads in active contact`} />
          <ThreeQ q="Is the activity producing contracts?" value={`${derived.contracts.length} active contracts`} tone={derived.contracts.length > 0 ? "ok" : "warn"} detail={`${derived.offers.length} offers in flight`} />
          <ThreeQ q="Are the contracts producing margin?" value={`${leads.filter((l) => l.stage === "closed").length} closed`} tone="ok" detail={`${leads.length} total leads in system`} />
        </div>

        <Card className={derived.emAtRiskCents > derived.emReserveThreshold ? "border-danger/50" : ""}>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${derived.emAtRiskCents > derived.emReserveThreshold ? "bg-danger-bg text-danger" : "bg-ok-bg text-ok"}`}>
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-fg-muted">Earnest money at risk</div>
                <div className="text-2xl font-semibold tabular text-fg">{formatCents(derived.emAtRiskCents)}</div>
              </div>
            </div>
            <div className="text-xs text-fg-muted sm:text-right">
              EM committed on contracts where diligence has expired or title is unresolved.
              <br />
              Reserve threshold: {formatCents(derived.emReserveThreshold)} ·{" "}
              {derived.emAtRiskCents > derived.emReserveThreshold ? (
                <span className="text-danger font-medium">Over exposure — protect the deposit.</span>
              ) : (
                <span className="text-ok font-medium">Within reserve.</span>
              )}
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top three priorities today</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {priorities.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-fg-faint">{i + 1}</span>
                  <input
                    value={p}
                    onChange={(e) => {
                      const next = [...priorities];
                      next[i] = e.target.value;
                      setPriorities(next);
                    }}
                    placeholder="Set before opening the inbox…"
                    className="flex-1 rounded border border-border bg-bg px-2 py-1 text-sm text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none"
                  />
                </div>
              ))}
            </CardBody>
          </Card>

          <QueueCard
            title="Same-day follow-up"
            icon={<PhoneCall className="h-4 w-4 text-accent" />}
            empty="No follow-ups due today."
            items={derived.followupsDue.map((l) => ({ href: `/pipeline/${l.id}`, primary: l.property_address, secondary: l.next_action ?? LEAD_STAGE_LABELS[l.stage] }))}
          />

          <QueueCard
            title="Contracts needing attention"
            icon={<Timer className="h-4 w-4 text-warn" />}
            empty="No active contracts."
            items={derived.contracts.map((l) => ({ href: `/pipeline/${l.id}`, primary: l.property_address, secondary: LEAD_STAGE_LABELS[l.stage] }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className={derived.abandoned.length ? "border-warn/40" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warn" /> Abandoned leads queue
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {derived.abandoned.length === 0 && <p className="text-sm text-fg-faint">No abandoned leads.</p>}
              {derived.abandoned.map((l) => (
                <Link key={l.id} href={`/pipeline/${l.id}`} className="flex items-center justify-between rounded border border-border px-3 py-2 hover:bg-bg-elev-2">
                  <div>
                    <div className="text-sm text-fg">{l.property_address}</div>
                    <div className="text-xs text-fg-muted">{LEAD_STAGE_LABELS[l.stage]} · no next-touch date set</div>
                  </div>
                  <Badge tone="warn">Set next touch</Badge>
                </Link>
              ))}
            </CardBody>
          </Card>

          <Card className={derived.reverify.length ? "border-warn/40" : ""}>
            <CardHeader>
              <CardTitle>Buyer re-verify queue</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {derived.reverify.length === 0 && <p className="text-sm text-fg-faint">No buyers pending re-verification.</p>}
              {derived.reverify.map(({ b, d }) => (
                <Link key={b.id} href={`/buyers/${b.id}`} className="flex items-center justify-between rounded border border-border px-3 py-2 hover:bg-bg-elev-2">
                  <div>
                    <div className="text-sm text-fg">{(b as BuyerView).name}</div>
                    <div className="text-xs text-fg-muted">{d!.reason}</div>
                  </div>
                  <Badge tone="warn">Re-verify</Badge>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>

        <EnforcementBanner tone="ok" title="Two pipelines run in parallel.">
          The dashboard shows seller activity and buyer readiness side by side. When one side goes
          quiet, deals stall. Keep both moving.
        </EnforcementBanner>
      </div>
    </div>
  );
}

function ActionTile({
  href,
  icon,
  title,
  desc,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: "accent" | "neutral";
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg border p-4 transition hover:border-border-strong ${
        tone === "accent" ? "border-accent/50 bg-accent/10" : "border-border bg-bg-elev"
      }`}
    >
      <div className={`rounded-md p-2 ${tone === "accent" ? "bg-accent text-accent-fg" : "bg-bg-elev-2 text-fg-muted"}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-fg">{title}</div>
        <div className="text-[11px] text-fg-muted">{desc}</div>
      </div>
    </Link>
  );
}

function ThreeQ({ q, value, detail, tone }: { q: string; value: string; detail: string; tone: "ok" | "warn" | "danger" }) {
  const toneMap = { ok: "text-ok", warn: "text-warn", danger: "text-danger" };
  return (
    <Card>
      <CardBody>
        <div className="text-xs text-fg-muted">{q}</div>
        <div className={`mt-1 text-lg font-semibold ${toneMap[tone]}`}>{value}</div>
        <div className="mt-0.5 text-xs text-fg-faint">{detail}</div>
      </CardBody>
    </Card>
  );
}

function QueueCard({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: { href: string; primary: string; secondary: string }[]; empty: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-2">
        {items.length === 0 && <p className="text-sm text-fg-faint">{empty}</p>}
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="block rounded border border-border px-3 py-2 hover:bg-bg-elev-2">
            <div className="text-sm text-fg">{it.primary}</div>
            <div className="text-xs text-fg-muted">{it.secondary}</div>
          </Link>
        ))}
      </CardBody>
    </Card>
  );
}
