import { listBuyers } from "@/lib/data/buyers";
import { listLeads } from "@/lib/data/leads";
import { BuyersClient } from "./BuyersClient";

export default async function BuyersPage() {
  const [{ buyers, live }, { leads }] = await Promise.all([listBuyers(), listLeads()]);
  return <BuyersClient buyers={buyers} leads={leads} live={live} />;
}
