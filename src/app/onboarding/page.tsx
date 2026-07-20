"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button, Input, Label } from "@/components/ui/primitives";
import { bootstrapOrgAction } from "@/app/auth/actions";

export default function OnboardingPage() {
  const [name, setName] = useState("Crossforge Capital, LLC");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await bootstrapOrgAction(name);
    if (res.ok) {
      window.location.href = "/";
    } else {
      setError(res.error ?? "Could not create the organization.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-bg-elev p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold text-fg">Set up your organization</span>
        </div>
        <p className="mb-4 text-xs text-fg-muted">
          Your account isn&apos;t attached to an organization yet. Create one to become its
          Owner/Operator. This seeds the 18 pipeline stages and your template library.
        </p>
        <form onSubmit={create} className="space-y-3">
          <div>
            <Label>Organization name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {error && <p className="text-xs text-warn">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create organization"}
          </Button>
        </form>
      </div>
    </div>
  );
}
