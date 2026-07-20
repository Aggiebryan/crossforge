import Link from "next/link";
import { getLeadView } from "@/lib/data/leads";
import { LeadDetailClient } from "./LeadDetailClient";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lead, live } = await getLeadView(id);

  if (!lead) {
    return (
      <div className="p-8 text-fg-muted">
        Lead not found.{" "}
        <Link href="/pipeline" className="text-accent">
          Back to pipeline
        </Link>
      </div>
    );
  }
  return <LeadDetailClient lead={lead} live={live} />;
}
