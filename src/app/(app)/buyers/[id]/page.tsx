import Link from "next/link";
import { getBuyerView } from "@/lib/data/buyers";
import { BuyerDetailClient } from "./BuyerDetailClient";

export default async function BuyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { buyer } = await getBuyerView(id);

  if (!buyer) {
    return (
      <div className="p-8 text-fg-muted">
        Buyer not found.{" "}
        <Link href="/buyers" className="text-accent">
          Back to buyers
        </Link>
      </div>
    );
  }
  return <BuyerDetailClient buyer={buyer} />;
}
