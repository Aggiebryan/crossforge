import "server-only";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/config";
import type { Role } from "@/domain/constants";

export interface AppContext {
  userId: string;
  email: string | null;
  orgId: string;
  role: Role;
  orgName: string;
}

/**
 * Resolve the signed-in user and their org membership. Returns null when
 * Supabase is not configured (demo mode) or the user is unauthenticated /
 * has no membership yet. RLS still enforces org scoping on every query — this
 * is for convenience (org_id on inserts, role-aware UI), not security.
 */
export async function getContext(): Promise<AppContext | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role, orgs(name)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const orgs = membership.orgs as unknown as { name: string } | { name: string }[] | null;
  const orgName = Array.isArray(orgs) ? (orgs[0]?.name ?? "") : (orgs?.name ?? "");

  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: membership.org_id,
    role: membership.role as Role,
    orgName,
  };
}

/** True when the app should read/write the live database rather than demo data. */
export function isLive(): boolean {
  return SUPABASE_CONFIGURED;
}
