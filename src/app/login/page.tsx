"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button, Input, Label } from "@/components/ui/primitives";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!SUPABASE_CONFIGURED) {
      setError("Supabase is not configured in this environment. Explore the app directly — the demo dataset is loaded.");
      return;
    }
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-bg-elev p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold text-fg">CrossForge CRM</span>
        </div>
        <p className="mb-4 text-xs text-fg-muted">
          The single system of record for a contract wholesaling operation. MFA is required on all
          accounts.
        </p>
        <form onSubmit={signIn} className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@org.com" />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>
          {error && <p className="text-xs text-warn">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 border-t border-border pt-4 text-center">
          <Link href="/" className="text-xs text-accent hover:underline">
            Explore the demo without signing in →
          </Link>
        </div>
      </div>
    </div>
  );
}
