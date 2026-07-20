import { PageHeader } from "@/components/PageHeader";
import { EnforcementBanner } from "@/components/ui/primitives";
import { LeadForm } from "@/components/forms/LeadForm";
import { listLeadSources } from "@/lib/data/leads";
import { isLive } from "@/lib/data/context";

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const sources = await listLeadSources();
  const live = isLive();

  return (
    <div>
      <PageHeader
        title={mode === "quick" ? "Quick Call Capture" : "New seller lead"}
        subtitle={
          mode === "quick"
            ? "Capture the essentials mid-call; complete the full sheet later"
            : "Full lead sheet — required before a contract can be created"
        }
      />
      <div className="mx-auto max-w-3xl p-5">
        {!live && (
          <div className="mb-4">
            <EnforcementBanner tone="warn" title="Demo mode — saving is disabled">
              Add your Supabase URL and anon key to <code>.env.local</code> and sign in to persist
              records. You can still see the form and its validations here.
            </EnforcementBanner>
          </div>
        )}
        <LeadForm sources={sources} live={live} initialMode={mode === "quick" ? "quick" : "full"} />
      </div>
    </div>
  );
}
