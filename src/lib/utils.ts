import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** All money is stored as integer cents. Format for display. */
export function formatCents(
  cents: number | null | undefined,
  opts: { withCents?: boolean } = {},
): string {
  if (cents == null || Number.isNaN(cents)) return "—";
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.withCents ? 2 : 0,
    maximumFractionDigits: opts.withCents ? 2 : 0,
  });
}

/** Parse a user-entered dollar string into integer cents. */
export function dollarsToCents(input: string | number): number {
  const n = typeof input === "number" ? input : parseFloat(input.replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}
