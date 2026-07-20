"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Input, Label, Textarea } from "@/components/ui/primitives";
import {
  OCCUPANCY_STATUS,
  PROPERTY_TYPE,
  ACCESS_AVAILABLE,
  LEAD_RATING,
} from "@/domain/constants";
import { dollarsToCents } from "@/lib/utils";
import { createLeadAction, createLeadSourceAction } from "@/app/(app)/pipeline/actions";
import type { LeadSourceView } from "@/lib/data/leads";

type Mode = "full" | "quick";

export function LeadForm({
  sources,
  live,
  initialMode,
}: {
  sources: LeadSourceView[];
  live: boolean;
  initialMode: Mode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [srcList, setSrcList] = useState(sources);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    lead_source_id: sources[0]?.id ?? "",
    property_address: "",
    street: "",
    city: "",
    county: "",
    state: "TX",
    zip: "",
    owner_name: "",
    phone_1: "",
    email: "",
    occupancy_status: "unknown",
    property_type: "single_family",
    beds: "",
    baths: "",
    square_feet: "",
    year_built: "",
    condition_notes: "",
    mortgage_payoff: "",
    reason_for_selling: "",
    seller_timeline: "",
    seller_asking_price: "",
    how_seller_arrived_at_price: "",
    access_available: "unknown",
    who_must_sign: "",
    lead_rating: "medium",
    next_action: "",
    follow_up_date: "",
    flag_limited_access: false,
    flag_utilities_off: false,
    flag_vacancy_over_12mo: false,
    flag_seller_evasive: false,
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  // Required fields differ by mode. Full = the guidebook's required lead-sheet
  // set; quick = the essentials that make a usable callback record.
  const requiredFull = [
    "lead_source_id",
    "property_address",
    "owner_name",
    "reason_for_selling",
    "seller_timeline",
    "seller_asking_price",
    "who_must_sign",
    "next_action",
    "follow_up_date",
  ] as const;
  const requiredQuick = [
    "property_address",
    "owner_name",
    "phone_1",
    "reason_for_selling",
    "next_action",
    "follow_up_date",
  ] as const;

  const required = mode === "full" ? requiredFull : requiredQuick;
  const missing = required.filter((k) => !String(f[k as keyof typeof f]).trim());

  async function addSource() {
    const name = window.prompt("New lead source name (e.g. Direct mail — absentee)");
    if (!name) return;
    const res = await createLeadSourceAction(name, "");
    if (res.ok && res.id) {
      const next = { id: res.id, name, channel: null };
      setSrcList((s) => [...s, next]);
      set("lead_source_id", res.id);
    } else {
      setError(res.error ?? "Could not add source.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (missing.length) {
      setError(`Missing required field(s): ${missing.map((m) => m.replace(/_/g, " ")).join(", ")}`);
      return;
    }
    setSaving(true);
    const input = {
      lead_source_id: f.lead_source_id,
      property_address: f.property_address,
      street: f.street || undefined,
      city: f.city || undefined,
      county: f.county || undefined,
      state: f.state || undefined,
      zip: f.zip || undefined,
      owner_name: f.owner_name,
      phone_1: f.phone_1 || undefined,
      email: f.email || undefined,
      occupancy_status: f.occupancy_status,
      property_type: f.property_type,
      beds: f.beds ? Number(f.beds) : null,
      baths: f.baths ? Number(f.baths) : null,
      square_feet: f.square_feet ? Number(f.square_feet) : null,
      year_built: f.year_built ? Number(f.year_built) : null,
      condition_notes: f.condition_notes || undefined,
      mortgage_payoff_estimate_cents: f.mortgage_payoff ? dollarsToCents(f.mortgage_payoff) : null,
      reason_for_selling: f.reason_for_selling,
      seller_timeline: f.seller_timeline,
      seller_asking_price_cents: f.seller_asking_price ? dollarsToCents(f.seller_asking_price) : 0,
      how_seller_arrived_at_price: f.how_seller_arrived_at_price || undefined,
      access_available: f.access_available,
      who_must_sign: f.who_must_sign,
      lead_rating: f.lead_rating,
      next_action: f.next_action,
      follow_up_date: f.follow_up_date,
      flag_limited_access: f.flag_limited_access,
      flag_utilities_off: f.flag_utilities_off,
      flag_vacancy_over_12mo: f.flag_vacancy_over_12mo,
      flag_seller_evasive: f.flag_seller_evasive,
    };
    const res = await createLeadAction(input, mode === "quick");
    if (res.ok && res.id) {
      router.push(`/pipeline/${res.id}`);
    } else {
      setError(res.error ?? "Failed to save.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex rounded-md border border-border p-0.5 w-fit">
        {(["full", "quick"] as Mode[]).map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => setMode(m)}
            className={`rounded px-3 py-1 text-xs font-medium ${mode === m ? "bg-accent text-accent-fg" : "text-fg-muted"}`}
          >
            {m === "full" ? "Full lead sheet" : "Quick capture"}
          </button>
        ))}
      </div>

      {mode === "quick" && (
        <EnforcementBanner tone="warn" title="Quick capture creates an incomplete lead">
          The record is flagged incomplete and cannot advance past Contact made until the full sheet
          is finished.
        </EnforcementBanner>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Property & owner</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Property address" req value={f.property_address} onChange={(v) => set("property_address", v)} className="sm:col-span-2" />
          <Field label="Street" value={f.street} onChange={(v) => set("street", v)} />
          <Field label="City" value={f.city} onChange={(v) => set("city", v)} />
          <Field label="County" value={f.county} onChange={(v) => set("county", v)} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="State" value={f.state} onChange={(v) => set("state", v)} />
            <Field label="ZIP" value={f.zip} onChange={(v) => set("zip", v)} />
          </div>
          <Field label="Owner name" req value={f.owner_name} onChange={(v) => set("owner_name", v)} />
          <Field label="Phone" req={mode === "quick"} value={f.phone_1} onChange={(v) => set("phone_1", v)} />
          <div className="sm:col-span-2 flex items-end gap-2">
            <div className="flex-1">
              <Label>Lead source {mode === "full" && <span className="text-danger">*</span>}</Label>
              <select
                value={f.lead_source_id}
                onChange={(e) => set("lead_source_id", e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg"
              >
                <option value="">Select a source…</option>
                {srcList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {live && (
              <Button type="button" variant="outline" onClick={addSource}>
                + Add source
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {mode === "full" && (
        <Card>
          <CardHeader>
            <CardTitle>Property detail & condition</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Select label="Occupancy" value={f.occupancy_status} onChange={(v) => set("occupancy_status", v)} options={OCCUPANCY_STATUS} />
            <Select label="Property type" value={f.property_type} onChange={(v) => set("property_type", v)} options={PROPERTY_TYPE} />
            <Field label="Beds" value={f.beds} onChange={(v) => set("beds", v)} type="number" />
            <Field label="Baths" value={f.baths} onChange={(v) => set("baths", v)} type="number" />
            <Field label="Square feet" value={f.square_feet} onChange={(v) => set("square_feet", v)} type="number" />
            <Field label="Year built" value={f.year_built} onChange={(v) => set("year_built", v)} type="number" />
            <Select label="Access" value={f.access_available} onChange={(v) => set("access_available", v)} options={ACCESS_AVAILABLE} />
            <Select label="Lead rating" value={f.lead_rating} onChange={(v) => set("lead_rating", v)} options={LEAD_RATING} />
            <div className="col-span-2 sm:col-span-4">
              <Label>Condition notes</Label>
              <Textarea rows={2} value={f.condition_notes} onChange={(e) => set("condition_notes", e.target.value)} />
            </div>
            <Field label="Mortgage payoff estimate ($)" value={f.mortgage_payoff} onChange={(v) => set("mortgage_payoff", v)} className="col-span-2" />
            <Field label="Who must sign" req value={f.who_must_sign} onChange={(v) => set("who_must_sign", v)} className="col-span-2" />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Motivation & pricing</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Reason for selling (verbatim) <span className="text-danger">*</span></Label>
            <Textarea rows={2} value={f.reason_for_selling} onChange={(e) => set("reason_for_selling", e.target.value)} placeholder="Store the seller's own words — do not paraphrase." />
          </div>
          <Field label="Seller timeline" req={mode === "full"} value={f.seller_timeline} onChange={(v) => set("seller_timeline", v)} />
          <Field label="Asking price ($)" req={mode === "full"} value={f.seller_asking_price} onChange={(v) => set("seller_asking_price", v)} />
          {mode === "full" && (
            <Field label="How seller arrived at price" value={f.how_seller_arrived_at_price} onChange={(v) => set("how_seller_arrived_at_price", v)} className="sm:col-span-2" />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flags & next step</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <Check label="Limited access" checked={f.flag_limited_access} onChange={(v) => set("flag_limited_access", v)} />
            <Check label="Utilities off at walkthrough" checked={f.flag_utilities_off} onChange={(v) => set("flag_utilities_off", v)} />
            <Check label="Vacancy over 12 months" checked={f.flag_vacancy_over_12mo} onChange={(v) => set("flag_vacancy_over_12mo", v)} />
            <Check label="Seller evasiveness noted" checked={f.flag_seller_evasive} onChange={(v) => set("flag_seller_evasive", v)} />
          </div>
          <p className="text-[11px] text-fg-faint">These flags raise the repair contingency to 15% in underwriting.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Next action" req value={f.next_action} onChange={(v) => set("next_action", v)} />
            <Field label="Follow-up date" req type="date" value={f.follow_up_date} onChange={(v) => set("follow_up_date", v)} />
          </div>
        </CardBody>
      </Card>

      {error && (
        <EnforcementBanner tone="danger" title="Cannot save yet">
          {error}
        </EnforcementBanner>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "quick" ? "Save quick capture" : "Create lead"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/pipeline")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  req,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  req?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>
        {label} {req && <span className="text-danger">*</span>}
      </Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-fg-muted">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--accent)]" />
      {label}
    </label>
  );
}
