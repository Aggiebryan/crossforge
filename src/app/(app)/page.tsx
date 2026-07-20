"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, CardBody, CardHeader, CardTitle, EnforcementBanner } from "@/components/ui/primitives";
import { DEMO_BUYERS, DEMO_LEADS } from "@/demo/data";
import { applyDecay } from "@/domain/engines/buyers";
import { LEAD_STAGE_LABELS } from "@/domain/constants";
import { formatCents, formatDate } from "@/lib/utils";
import { AlertTriangle, CircleDollarSign, PhoneCall, Timer } from "lucide-react";

const TODAY = "2026-07-20";

export default function DashboardPage() {
  const [priorities, setPriorities] = useState(["", "", ""]);

  const derived = useMemo(() => {
    const now = new Date(TODAY + "T12:00:00Z");
    // Abandoned leads: follow_up / long_term_nurture with no next_touch_date.
    const abandoned = DEMO_LEADS.filter(
      (l) =>
        (l.stage === "follow_up" || l.stage === "long_term_nurture") && !l.next_touch_date,
    );
    // Same-day follow-up.
    const followupsDue = DEMO_LEADS.filter((l) => l.next_touch_date === TODAY);
    // Contracts needing attention (under_contract / title_opened).
    const contracts = DEMO_LEADS.filter(
      (l) => l.stage === "under_contract" || l.stage === "title_opened",
    );
    // Offers to prepare.
    const offers = DEMO_LEADS.filter(
      (l) => l.stage === "offer_pending" || l.stage === "qualified",
    );
    // Buyer re-verify queue (decay).
    const reverify = DEMO_BUYERS.map((b) => ({ b, d: applyDecay(b, now) })).filter((x) => x.d);
    // Earnest money at risk: EM on contracts where diligence expired or title
    // unresolved. Demo: the under-contract deal with utilities off / vacancy.
    const emAtRiskCents = 5_000_00; // L-1001 committed EM, title still open
    const emReserveThreshold = 10_000_00;

    return { abandoned, followupsDue, contracts, offers, reverify, emAtRiskCents, emReserveThreshold };
  }, []);

  return (
    <div>
      <PageHeader
        title="Daily Operator Dashboard"
        subtitle={`${new Date(TODAY + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · America/Chicago`}
      />
      <div className="p-5 space-y-5">
        {/* Three questions, answered without arithmetic */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ThreeQ
            q="Are we producing enough activity?"
            value={`${derived.followupsDue.length} follow-ups due today`}
            tone={derived.followupsDue.length > 0 ? "ok" : "warn"}
            detail={`${DEMO_LEADS.filter((l) => l.stage === "attempting_contact" || l.stage === "contact_made").length} leads in active contact`}
          />
          <ThreeQ
            q="Is the activity producing contracts?"
            value={`${derived.contracts.length} active contracts`}
            tone={derived.contracts.length > 0 ? "ok" : "warn"}
            detail={`${derived.offers.length} offers in flight`}
          />
          <ThreeQ
            q="Are the contracts producing margin?"
            value={`${formatCents(24_000_00)} projected fees`}
            tone="ok"
            detail="1 deal in disposition, 1 under contract"
          />
        </div>

        {/* Earnest money at risk — top-line placement (4.5) */}
        <Card className={derived.emAtRiskCents > derived.emReserveThreshold ? "border-danger/50" : ""}>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${derived.emAtRiskCents > derived.emReserveThreshold ? "bg-danger-bg text-danger" : "bg-warn-bg text-warn"}`}
              >
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-fg-muted">
                  Earnest money at risk
                </div>
                <div className="text-2xl font-semibold tabular text-fg">
                  {formatCents(derived.emAtRiskCents)}
                </div>
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
          {/* Top three priorities */}
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

          {/* Leads requiring same-day follow-up */}
          <QueueCard
            title="Same-day follow-up"
            icon={<PhoneCall className="h-4 w-4 text-accent" />}
            empty="No follow-ups due today."
            items={derived.followupsDue.map((l) => ({
              href: `/pipeline/${l.id}`,
              primary: l.property_address,
              secondary: l.next_action ?? LEAD_STAGE_LABELS[l.stage],
            }))}
          />

          {/* Deadlines today or tomorrow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-warn" /> Deadlines today / tomorrow
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <DeadlineRow label="EM due — 123 Main St" date="2026-07-21" tone="warn" />
              <DeadlineRow label="Inspection deadline — 123 Main St" date="2026-07-24" tone="warn" />
              <DeadlineRow label="Final buyer selection — 220 Rivershade" date="2026-07-20" tone="danger" />
            </CardBody>
          </Card>
        </div>

        {/* Abandoned leads + Re-verify queue */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className={derived.abandoned.length ? "border-warn/40" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warn" /> Abandoned leads queue
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {derived.abandoned.length === 0 && (
                <p className="text-sm text-fg-faint">No abandoned leads.</p>
              )}
              {derived.abandoned.map((l) => (
                <Link
                  key={l.id}
                  href={`/pipeline/${l.id}`}
                  className="flex items-center justify-between rounded border border-border px-3 py-2 hover:bg-bg-elev-2"
                >
                  <div>
                    <div className="text-sm text-fg">{l.property_address}</div>
                    <div className="text-xs text-fg-muted">
                      {LEAD_STAGE_LABELS[l.stage]} · no next-touch date set
                    </div>
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
              {derived.reverify.length === 0 && (
                <p className="text-sm text-fg-faint">No buyers pending re-verification.</p>
              )}
              {derived.reverify.map(({ b, d }) => (
                <Link
                  key={b.id}
                  href={`/buyers/${b.id}`}
                  className="flex items-center justify-between rounded border border-border px-3 py-2 hover:bg-bg-elev-2"
                >
                  <div>
                    <div className="text-sm text-fg">{b.name}</div>
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

function ThreeQ({
  q,
  value,
  detail,
  tone,
}: {
  q: string;
  value: string;
  detail: string;
  tone: "ok" | "warn" | "danger";
}) {
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

function QueueCard({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: { href: string; primary: string; secondary: string }[];
  empty: string;
}) {
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
          <Link
            key={it.href}
            href={it.href}
            className="block rounded border border-border px-3 py-2 hover:bg-bg-elev-2"
          >
            <div className="text-sm text-fg">{it.primary}</div>
            <div className="text-xs text-fg-muted">{it.secondary}</div>
          </Link>
        ))}
      </CardBody>
    </Card>
  );
}

function DeadlineRow({ label, date, tone }: { label: string; date: string; tone: "warn" | "danger" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg">{label}</span>
      <Badge tone={tone}>{formatDate(date)}</Badge>
    </div>
  );
}
