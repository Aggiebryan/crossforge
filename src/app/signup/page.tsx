"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button, Input, Label } from "@/components/ui/primitives";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/config";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!SUPABASE_CONFIGURED) {
      setMsg("Supabase isn't configured in this environment. Add your keys to .env.local to enable accounts.");
      return;
    }
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMsg(error.message);
      } else if (data.session) {
        window.location.href = "/";
      } else {
        setMsg("Check your email to confirm your account, then sign in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-bg-elev p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold text-fg">Crossforge Capital, LLC</span>
        </div>
        <p className="mb-4 text-xs text-fg-muted">
          Create your operator account. The first owner is provisioned automatically; teammates are
          added by the owner.
        </p>
        <form onSubmit={signUp} className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@org.com" />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="At least 6 characters" />
          </div>
          {msg && <p className="text-xs text-warn">{msg}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
        <div className="mt-4 border-t border-border pt-4 text-center">
          <Link href="/login" className="text-xs text-accent hover:underline">
            Already have an account? Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
