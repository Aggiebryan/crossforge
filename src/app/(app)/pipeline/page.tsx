import { listLeads } from "@/lib/data/leads";
import { PipelineClient } from "./PipelineClient";

export default async function PipelinePage() {
  const { leads, live } = await listLeads();
  return <PipelineClient leads={leads} live={live} />;
}
