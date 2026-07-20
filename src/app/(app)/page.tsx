import { listLeads } from "@/lib/data/leads";
import { listBuyers } from "@/lib/data/buyers";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const [{ leads, live }, { buyers }] = await Promise.all([listLeads(), listBuyers()]);
  return <DashboardClient leads={leads} buyers={buyers} live={live} />;
}
