import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getContext, isLive } from "@/lib/data/context";
import { createClient } from "@/lib/supabase/server";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  let orgName: string | null = null;
  let email: string | null = null;

  if (isLive()) {
    // Middleware already redirects unauthenticated users to /login. Here we
    // catch the authenticated-but-no-org case and send them to onboarding.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const ctx = await getContext();
      if (!ctx) redirect("/onboarding");
      orgName = ctx.orgName;
      email = ctx.email;
    }
  }

  return (
    <AppShell orgName={orgName} email={email}>
      {children}
    </AppShell>
  );
}
