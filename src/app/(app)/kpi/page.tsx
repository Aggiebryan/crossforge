"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, CardBody, CardHeader, CardTitle, EnforcementBanner } from "@/components/ui/primitives";
import { tierSource, scoreMonth, type SourceMonth } from "@/domain/engines/leadSources";
import { formatCents } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCan } from "@/components/RoleContext";

const PIPELINE_HEALTH = [
  { stage: "New", count: 12 },
  { stage: "Contact", count: 9 },
  { stage: "Qualified", count: 5 },
  { stage: "Offer", count: 4 },
  { stage: "Contract", count: 2 },
  { stage: "Disposition", count: 1 },
  { stage: "Closed", count: 3 },
];

const CONTRACT_TREND = [
  { wk: "W1", signed: 1, placed: 1 },
  { wk: "W2", signed: 2, placed: 1 },
  { wk: "W3", signed: 1, placed: 2 },
  { wk: "W4", signed: 3, placed: 2 },
];

const SOURCE_MONTHS: Record<string, SourceMonth[]> = {
  "Direct mail — absentee": [
    { month: "2026-05", spendCents: 180000, leadsGenerated: 60, qualifiedLeads: 7, contractsSigned: 2, dealsClosed: 1, grossFeesCents: 2200000 },
    { month: "2026-06", spendCents: 180000, leadsGenerated: 55, qualifiedLeads: 6, contractsSigned: 1, dealsClosed: 1, grossFeesCents: 1400000 },
  ],
  "PPC — Google": [
    { month: "2026-05", spendCents: 250000, leadsGenerated: 30, qualifiedLeads: 3, contractsSigned: 1, dealsClosed: 0, grossFeesCents: 0 },
    { month: "2026-06", spendCents: 250000, leadsGenerated: 28, qualifiedLeads: 2, contractsSigned: 0, dealsClosed: 0, grossFeesCents: 0 },
  ],
  "Cold call": [
    { month: "2026-06", spendCents: 400000, leadsGenerated: 220, qualifiedLeads: 1, contractsSigned: 0, dealsClosed: 0, grossFeesCents: 0 },
  ],
};

export default function KpiPage() {
  const can = useCan();
  const [advanced, setAdvanced] = useState(false);

  return (
    <div>
      <PageHeader
        title="KPI dashboard"
        subtitle="Answer three questions without arithmetic: enough activity, activity→contracts, contracts→margin"
        actions={
          <button
            onClick={() => setAdvanced((a) => !a)}
            className="rounded-md border border-border px-3 py-1 text-xs text-fg-muted hover:bg-bg-elev-2"
          >
            {advanced ? "Hide advanced" : "Advanced"}
          </button>
        }
      />
      <div className="p-5 space-y-5">
        {/* Tier: Daily */}
        <Tier title="Daily">
          <Metric label="Leads contacted" value="14" />
          <Metric label="Conversations completed" value="6" />
          <Metric label="Offers prepared" value="2" />
        </Tier>

        {/* Tier: Weekly */}
        <Tier title="Weekly">
          <Metric label="Contracts signed" value="3" />
          <Metric label="Contracts placed" value="2" />
          <Metric label="Contracts canceled" value="1" sub="cause: title defect" tone="danger" />
          <Metric label="Avg days contract→close (30d)" value="14" />
        </Tier>

        {/* Tier: Financial (gated) */}
        {can.pricing ? (
          <Tier title="Financial">
            <Metric label="Cost per lead" value="$28" />
            <Metric label="Cost per qualified lead" value="$257" />
            <Metric label="Cost per contract" value="$1,200" tone="accent" headline />
            <Metric label="Avg assignment fee" value={formatCents(1800000)} />
          </Tier>
        ) : (
          <EnforcementBanner tone="warn" title="Financial metrics hidden">
            Your role does not have access to financials. Cost-per-contract and margin are visible to
            Owner/Operator, Acquisitions, and Dispositions only.
          </EnforcementBanner>
        )}

        {/* Tier: Operational */}
        <Tier title="Operational">
          <Metric label="Follow-up backlog" value="4" tone="warn" />
          <Metric label="Earnest money at risk" value={formatCents(500000)} tone="danger" />
          <Metric label="Active buyers (A/B)" value="3" />
          <Metric label="Disqualified buyers" value="1" />
        </Tier>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline health by stage</CardTitle>
            </CardHeader>
            <CardBody style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PIPELINE_HEALTH}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--fg-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--fg-muted)" }} />
                  <Tooltip contentStyle={{ background: "var(--bg-elev)", border: "1px solid var(--border)", fontSize: 12 }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contracts signed vs. placed</CardTitle>
            </CardHeader>
            <CardBody style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CONTRACT_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="wk" tick={{ fontSize: 11, fill: "var(--fg-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--fg-muted)" }} />
                  <Tooltip contentStyle={{ background: "var(--bg-elev)", border: "1px solid var(--border)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="signed" stroke="var(--accent)" strokeWidth={2} />
                  <Line type="monotone" dataKey="placed" stroke="var(--ok)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnostics</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            <Diagnostic ok text="Contact target hit and conversations tracking — list is performing." />
            <Diagnostic ok={false} text="Cold call: 220 leads, 1 qualified. Conversations happening but no qualified leads → flag the script." />
            <Diagnostic ok={false} text="PPC: qualified leads holding but contract rate dropping → flag underwriting or negotiation." />
          </CardBody>
        </Card>

        {/* Lead source scorecards */}
        {can.pricing && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Object.entries(SOURCE_MONTHS).map(([name, months]) => {
              const t = tierSource(months);
              const latest = scoreMonth(months[months.length - 1]);
              return (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xs">
                      <span>{name}</span>
                      <Badge tone={t.tier === "tier_1" ? "ok" : t.tier === "tier_2" ? "warn" : "danger"}>
                        {t.verdict}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="text-[10px] uppercase tracking-wide text-fg-muted">Cost per contract</div>
                    <div className="text-2xl font-semibold tabular text-fg">
                      {latest.costPerContractCents != null ? formatCents(latest.costPerContractCents) : "—"}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-fg-faint">
                      <span>Leads: {months.reduce((s, m) => s + m.leadsGenerated, 0)}</span>
                      <span>Qualified: {months.reduce((s, m) => s + m.qualifiedLeads, 0)}</span>
                      <span>Contracts: {months.reduce((s, m) => s + m.contractsSigned, 0)}</span>
                      <span>Closed: {months.reduce((s, m) => s + m.dealsClosed, 0)}</span>
                    </div>
                    <p className="mt-2 text-[10px] text-fg-muted">{t.rationale}</p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {advanced && (
          <Card>
            <CardHeader>
              <CardTitle>Advanced metrics</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="Response rate" value="42%" />
              <Metric label="Conversation quality" value="3.1/5" />
              <Metric label="Close rate" value="33%" />
              <Metric label="Consistency (mo)" value="4/6" />
              <Metric label="Avg EM per contract" value={formatCents(500000)} />
              <Metric label="Deals in nurture" value="1" />
              <Metric label="Title yellow files" value="1" tone="warn" />
              <Metric label="SOP defect tickets" value="0" />
            </CardBody>
          </Card>
        )}

        <p className="text-center text-[11px] text-fg-faint">
          Default dashboard capped near 20 metrics. A dashboard with sixty numbers gets reviewed by
          nobody.
        </p>
      </div>
    </div>
  );
}

function Tier({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">{title}</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{children}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  tone,
  headline,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "danger" | "warn" | "accent";
  headline?: boolean;
}) {
  const color = tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : tone === "accent" ? "text-accent" : "text-fg";
  return (
    <Card className={headline ? "border-accent/40" : ""}>
      <CardBody>
        <div className="text-[11px] text-fg-muted">{label}</div>
        <div className={`text-xl font-semibold tabular ${color}`}>{value}</div>
        {sub && <div className="text-[10px] text-fg-faint">{sub}</div>}
      </CardBody>
    </Card>
  );
}

function Diagnostic({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2 text-[13px]">
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${ok ? "bg-ok" : "bg-warn"}`} />
      <span className={ok ? "text-fg-muted" : "text-fg"}>{text}</span>
    </div>
  );
}
