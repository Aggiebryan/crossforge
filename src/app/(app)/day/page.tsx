"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/primitives";
import { Lock, Sun, Users, Calculator, Moon } from "lucide-react";

export default function DayViewPage() {
  const [opps, setOpps] = useState<string[]>(["", "", ""]);
  const [risks, setRisks] = useState<string[]>(["", "", ""]);
  const [nn, setNn] = useState({ followup: false, pipeline: false, underwriting: false, buyer: false });

  const priorityListExists = opps.some((o) => o.trim()) || risks.some((r) => r.trim());

  return (
    <div>
      <PageHeader
        title="Time-blocked day"
        subtitle="Four blocks reflecting when sellers, buyers, and closers are actually reachable"
      />
      <div className="p-5 space-y-5">
        {/* Non-negotiables */}
        <Card>
          <CardHeader>
            <CardTitle>Four daily non-negotiables</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <NN label="Lead follow-up" checked={nn.followup} onChange={(v) => setNn({ ...nn, followup: v })} />
            <NN label="Pipeline review" checked={nn.pipeline} onChange={(v) => setNn({ ...nn, pipeline: v })} />
            <NN label="One real underwriting decision" checked={nn.underwriting} onChange={(v) => setNn({ ...nn, underwriting: v })} />
            <NN label="One buyer touchpoint" checked={nn.buyer} onChange={(v) => setNn({ ...nn, buyer: v })} />
          </CardBody>
        </Card>

        {/* Morning block: review only */}
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-warn" /> Morning — review only
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-[12px] text-fg-muted">
              New leads, follow-ups due, contract deadlines, buyer replies, flagged title issues.
              Output the day&apos;s top 3–5 opportunities and top 3–5 risks. Outbound work is locked
              until the priority list exists.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ListBuilder title="Top opportunities" values={opps} setValues={setOpps} tone="ok" />
              <ListBuilder title="Top risks" values={risks} setValues={setRisks} tone="danger" />
            </div>
          </CardBody>
        </Card>

        {/* Locked outbound blocks */}
        <BlockCard
          icon={<Users className="h-4 w-4 text-accent" />}
          title="Midday — seller-facing"
          desc="Outbound calls, second and third attempts, qualification conversations, property research."
          locked={!priorityListExists}
        />
        <BlockCard
          icon={<Calculator className="h-4 w-4 text-accent" />}
          title="Afternoon — underwriting & buyer-facing"
          desc="Deal sheets, offer bands, buyer calls, title follow-ups, deal blasts."
          locked={!priorityListExists}
        />
        <BlockCard
          icon={<Moon className="h-4 w-4 text-fg-muted" />}
          title="End of day — CRM & KPIs"
          desc="CRM updates, KPI entry, next-day calendaring."
          locked={false}
        />
      </div>
    </div>
  );
}

function NN({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded border px-2.5 py-2 text-[12px] ${checked ? "border-ok/50 bg-ok-bg text-ok" : "border-border text-fg-muted"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--ok)]" />
      {label}
    </label>
  );
}

function ListBuilder({ title, values, setValues, tone }: { title: string; values: string[]; setValues: (v: string[]) => void; tone: "ok" | "danger" }) {
  return (
    <div>
      <div className={`mb-1 text-xs font-medium ${tone === "ok" ? "text-ok" : "text-danger"}`}>{title}</div>
      <div className="space-y-1">
        {values.map((v, i) => (
          <input
            key={i}
            value={v}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              setValues(next);
            }}
            placeholder={`${title} ${i + 1}`}
            className="w-full rounded border border-border bg-bg px-2 py-1 text-sm text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none"
          />
        ))}
      </div>
    </div>
  );
}

function BlockCard({ icon, title, desc, locked }: { icon: React.ReactNode; title: string; desc: string; locked: boolean }) {
  return (
    <Card className={locked ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {icon} {title}
          </span>
          {locked && (
            <span className="flex items-center gap-1 text-[11px] text-warn">
              <Lock className="h-3 w-3" /> Locked until priority list exists
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardBody>
        <p className="text-[12px] text-fg-muted">{desc}</p>
      </CardBody>
    </Card>
  );
}
