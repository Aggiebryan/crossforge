/**
 * 3.8 Deadline engine. On contract creation the system calendars six deadlines
 * and fires an alert three BUSINESS days in advance and again on the day.
 * Missed deadlines raise a red persistent flag.
 *
 * Dates here are handled as calendar dates (YYYY-MM-DD). Business timezone is
 * applied by the caller; the arithmetic below is day-based and tz-agnostic.
 */

export type DeadlineKind =
  | "earnest_money_due"
  | "inspection_deadline"
  | "title_objection_deadline"
  | "buyer_marketing_start"
  | "final_buyer_selection_deadline"
  | "closing_date";

export const DEADLINE_LABELS: Record<DeadlineKind, string> = {
  earnest_money_due: "Earnest money due",
  inspection_deadline: "Inspection / due-diligence deadline",
  title_objection_deadline: "Title objection deadline",
  buyer_marketing_start: "Buyer marketing start",
  final_buyer_selection_deadline: "Final buyer selection deadline",
  closing_date: "Closing date",
};

export const ALERT_LEAD_BUSINESS_DAYS = 3;

function isWeekend(d: Date): boolean {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

/** Add N calendar days to a YYYY-MM-DD date, returning YYYY-MM-DD. */
export function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Subtract N business days (skipping weekends) from a date. */
export function subtractBusinessDays(dateISO: string, businessDays: number): string {
  const d = new Date(dateISO + "T00:00:00Z");
  let remaining = businessDays;
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() - 1);
    if (!isWeekend(d)) remaining--;
  }
  return d.toISOString().slice(0, 10);
}

export interface ContractDeadlineInput {
  contractSignedDate: string; // YYYY-MM-DD
  earnestMoneyDueDate: string;
  inspectionPeriodDays: number; // >= 7, warn under 10
  titleObjectionDate?: string | null;
  targetBuyerPlacementDate?: string | null;
  closingDate: string;
}

export interface CalendaredDeadline {
  kind: DeadlineKind;
  dueDate: string;
  advanceAlertDate: string; // 3 business days before
  label: string;
}

/**
 * Produce the six calendared deadlines with their advance-alert dates.
 * inspection_deadline is computed as signed + inspectionPeriodDays.
 * buyer_marketing_start defaults to the contract signed date (marketing begins
 * the moment there is an assignable contract).
 */
export function calendarDeadlines(i: ContractDeadlineInput): CalendaredDeadline[] {
  const inspectionDeadline = addDays(i.contractSignedDate, i.inspectionPeriodDays);
  const titleObjection = i.titleObjectionDate ?? inspectionDeadline;
  const buyerMarketingStart = i.contractSignedDate;
  const finalSelection =
    i.targetBuyerPlacementDate ?? subtractBusinessDays(i.closingDate, 5);

  const rows: { kind: DeadlineKind; dueDate: string }[] = [
    { kind: "earnest_money_due", dueDate: i.earnestMoneyDueDate },
    { kind: "inspection_deadline", dueDate: inspectionDeadline },
    { kind: "title_objection_deadline", dueDate: titleObjection },
    { kind: "buyer_marketing_start", dueDate: buyerMarketingStart },
    { kind: "final_buyer_selection_deadline", dueDate: finalSelection },
    { kind: "closing_date", dueDate: i.closingDate },
  ];

  return rows.map((r) => ({
    kind: r.kind,
    dueDate: r.dueDate,
    advanceAlertDate: subtractBusinessDays(r.dueDate, ALERT_LEAD_BUSINESS_DAYS),
    label: DEADLINE_LABELS[r.kind],
  }));
}

export const INSPECTION_MIN_DAYS = 7;
export const INSPECTION_WARN_UNDER_DAYS = 10;

export function inspectionPeriodWarning(days: number): string | null {
  if (days < INSPECTION_MIN_DAYS)
    return `Inspection period below the ${INSPECTION_MIN_DAYS}-day minimum. This is not enough time to open title, inspect, and place a buyer.`;
  if (days < INSPECTION_WARN_UNDER_DAYS)
    return `Inspection period under ${INSPECTION_WARN_UNDER_DAYS} days is tight. Confirm you can complete diligence and buyer placement in time.`;
  return null;
}

export type DeadlineStatus = "clear" | "approaching" | "due" | "missed";

/** Status of a single deadline relative to today. */
export function deadlineStatus(
  d: Pick<CalendaredDeadline, "dueDate" | "advanceAlertDate">,
  today: string,
): DeadlineStatus {
  if (today > d.dueDate) return "missed";
  if (today === d.dueDate) return "due";
  if (today >= d.advanceAlertDate) return "approaching";
  return "clear";
}
