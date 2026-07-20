import { Badge } from "@/components/ui/primitives";
import { LEAD_STAGE_LABELS, type LeadStage } from "@/domain/constants";

export function GradeBadge({ grade }: { grade: "A" | "B" | "C" }) {
  const tone = grade === "A" ? "ok" : grade === "B" ? "warn" : "danger";
  return <Badge tone={tone}>Grade {grade}</Badge>;
}

export function StageBadge({ stage }: { stage: LeadStage }) {
  return <Badge>{LEAD_STAGE_LABELS[stage]}</Badge>;
}

export function RatingBadge({ rating }: { rating: string }) {
  const tone = rating === "strong" ? "ok" : rating === "medium" ? "warn" : "danger";
  return <Badge tone={tone}>{rating}</Badge>;
}
