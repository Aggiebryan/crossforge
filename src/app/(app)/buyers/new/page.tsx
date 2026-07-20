import { PageHeader } from "@/components/PageHeader";
import { EnforcementBanner } from "@/components/ui/primitives";
import { BuyerForm } from "@/components/forms/BuyerForm";
import { isLive } from "@/lib/data/context";

export default function NewBuyerPage() {
  const live = isLive();
  return (
    <div>
      <PageHeader title="New buyer" subtitle="Grade A requires proof of funds — enforced on save" />
      <div className="mx-auto max-w-3xl p-5">
        {!live && (
          <div className="mb-4">
            <EnforcementBanner tone="warn" title="Demo mode — saving is disabled">
              Add your Supabase keys to <code>.env.local</code> and sign in to persist buyers.
            </EnforcementBanner>
          </div>
        )}
        <BuyerForm live={live} />
      </div>
    </div>
  );
}
