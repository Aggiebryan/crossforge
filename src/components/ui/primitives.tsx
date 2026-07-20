import * as React from "react";
import { cn } from "@/lib/utils";

/* Minimal shadcn-style primitives styled for a dense dark operator UI. */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-bg-elev", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3 border-b border-border", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold tracking-tight text-fg", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

type BtnVariant = "default" | "danger" | "ghost" | "outline" | "ok";
export function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const variants: Record<BtnVariant, string> = {
    default: "bg-accent text-accent-fg hover:opacity-90",
    danger: "bg-danger text-white hover:opacity-90",
    ok: "bg-ok text-white hover:opacity-90",
    ghost: "bg-transparent text-fg-muted hover:bg-bg-elev-2 hover:text-fg",
    outline: "border border-border-strong bg-transparent text-fg hover:bg-bg-elev-2",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium text-fg-muted mb-1", className)}
      {...props}
    />
  );
}

type Tone = "neutral" | "danger" | "warn" | "ok" | "accent";
export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    neutral: "bg-bg-elev-2 text-fg-muted border-border",
    danger: "bg-danger-bg text-danger border-danger/40",
    warn: "bg-warn-bg text-warn border-warn/40",
    ok: "bg-ok-bg text-ok border-ok/40",
    accent: "bg-accent/15 text-accent border-accent/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Enforcement banner — states the consequence, per the product tone. */
export function EnforcementBanner({
  tone = "danger",
  title,
  children,
}: {
  tone?: "danger" | "warn" | "ok";
  title: string;
  children?: React.ReactNode;
}) {
  const map = {
    danger: "border-danger/50 bg-danger-bg text-danger",
    warn: "border-warn/50 bg-warn-bg text-warn",
    ok: "border-ok/50 bg-ok-bg text-ok",
  };
  return (
    <div className={cn("rounded-md border px-3 py-2 text-sm", map[tone])}>
      <div className="font-semibold">{title}</div>
      {children && <div className="mt-0.5 text-[13px] opacity-90">{children}</div>}
    </div>
  );
}
