"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardBody, CardHeader, CardTitle, EnforcementBanner, Input, Label } from "@/components/ui/primitives";
import {
  BUYER_GRADES,
  POF_STATUS,
  EXIT_STRATEGY,
  REHAB_TOLERANCE,
  BUYER_TYPES,
  type BuyerGrade,
  type ExitStrategy,
  type PofStatus,
  type RehabTolerance,
} from "@/domain/constants";
import { validateGrade } from "@/domain/engines/buyers";
import { dollarsToCents } from "@/lib/utils";
import { createBuyerAction } from "@/app/(app)/buyers/actions";

export function BuyerForm({ live }: { live: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    buyer_name: "",
    company_name: "",
    phone: "",
    email: "",
    buyer_type: "flipper",
    buyer_grade: "C" as BuyerGrade,
    proof_of_funds_status: "none" as PofStatus,
    proof_of_funds_date: "",
    target_zips: "",
    target_counties: "",
    price_low: "",
    price_high: "",
    exit_strategies: [] as ExitStrategy[],
    rehab_tolerance: "moderate" as RehabTolerance,
    last_meaningful_contact: "",
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  // Live grade/POF validation feedback (also enforced server-side).
  const gradeCheck = validateGrade(f.buyer_grade, f.proof_of_funds_status);

  function toggleExit(x: ExitStrategy) {
    set(
      "exit_strategies",
      f.exit_strategies.includes(x)
        ? f.exit_strategies.filter((e) => e !== x)
        : [...f.exit_strategies, x],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.buyer_name.trim()) {
      setError("Buyer name is required.");
      return;
    }
    if (!gradeCheck.ok) {
      setError(gradeCheck.message ?? "Invalid grade.");
      return;
    }
    setSaving(true);
    const res = await createBuyerAction({
      buyer_name: f.buyer_name,
      company_name: f.company_name || undefined,
      phone: f.phone || undefined,
      email: f.email || undefined,
      buyer_type: f.buyer_type,
      buyer_grade: f.buyer_grade,
      proof_of_funds_status: f.proof_of_funds_status,
      proof_of_funds_date: f.proof_of_funds_date || null,
      target_zips: f.target_zips.split(",").map((s) => s.trim()).filter(Boolean),
      target_counties: f.target_counties.split(",").map((s) => s.trim()).filter(Boolean),
      price_range_low_cents: f.price_low ? dollarsToCents(f.price_low) : 0,
      price_range_high_cents: f.price_high ? dollarsToCents(f.price_high) : 0,
      exit_strategies: f.exit_strategies,
      rehab_tolerance: f.rehab_tolerance,
      last_meaningful_contact: f.last_meaningful_contact || null,
    });
    if (res.ok && res.id) {
      router.push(`/buyers/${res.id}`);
    } else {
      setError(res.error ?? "Failed to save.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Buyer name" req value={f.buyer_name} onChange={(v) => set("buyer_name", v)} />
          <Field label="Company" value={f.company_name} onChange={(v) => set("company_name", v)} />
          <Field label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
          <Field label="Email" value={f.email} onChange={(v) => set("email", v)} />
          <Select label="Buyer type" value={f.buyer_type} onChange={(v) => set("buyer_type", v)} options={BUYER_TYPES} />
          <Select label="Rehab tolerance" value={f.rehab_tolerance} onChange={(v) => set("rehab_tolerance", v as RehabTolerance)} options={REHAB_TOLERANCE} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade & proof of funds</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select label="Grade" value={f.buyer_grade} onChange={(v) => set("buyer_grade", v as BuyerGrade)} options={BUYER_GRADES} />
            <Select label="POF status" value={f.proof_of_funds_status} onChange={(v) => set("proof_of_funds_status", v as PofStatus)} options={POF_STATUS} />
            <Field label="POF date" type="date" value={f.proof_of_funds_date} onChange={(v) => set("proof_of_funds_date", v)} />
          </div>
          {!gradeCheck.ok && (
            <EnforcementBanner tone="danger" title="Grade A requires proof of funds">
              {gradeCheck.message}
            </EnforcementBanner>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buy box</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Target ZIPs (comma-separated)" value={f.target_zips} onChange={(v) => set("target_zips", v)} />
          <Field label="Target counties (comma-separated)" value={f.target_counties} onChange={(v) => set("target_counties", v)} />
          <Field label="Price range low ($)" value={f.price_low} onChange={(v) => set("price_low", v)} />
          <Field label="Price range high ($)" value={f.price_high} onChange={(v) => set("price_high", v)} />
          <Field label="Last meaningful contact" type="date" value={f.last_meaningful_contact} onChange={(v) => set("last_meaningful_contact", v)} />
          <div>
            <Label>Exit strategies</Label>
            <div className="flex flex-wrap gap-1.5">
              {EXIT_STRATEGY.map((x) => (
                <button
                  type="button"
                  key={x}
                  onClick={() => toggleExit(x)}
                  className={`rounded border px-2 py-1 text-[11px] ${
                    f.exit_strategies.includes(x)
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border text-fg-muted"
                  }`}
                >
                  {x.replace(/_/g, " ")}
                </button>
              ))}
            </div>
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
          {saving ? "Saving…" : "Create buyer"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/buyers")}>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  req?: boolean;
  type?: string;
}) {
  return (
    <div>
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
