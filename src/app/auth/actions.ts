"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Create an org and make the current user its owner (first-run onboarding). */
export async function bootstrapOrgAction(
  name: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  // Cast: create_org_and_join was added after the types snapshot was generated.
  const { error } = await supabase.rpc("create_org_and_join" as never, { p_name: name } as never);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
