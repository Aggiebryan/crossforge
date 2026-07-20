"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DEMO_BUYERS, DEMO_LEADS } from "@/demo/data";
import { LEAD_STAGE_LABELS } from "@/domain/constants";

interface Item {
  label: string;
  sub: string;
  href: string;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const items = useMemo<Item[]>(() => {
    const leads: Item[] = DEMO_LEADS.map((l) => ({
      label: l.property_address,
      sub: `Lead · ${l.owner_name} · ${LEAD_STAGE_LABELS[l.stage]}`,
      href: `/pipeline/${l.id}`,
    }));
    const buyers: Item[] = DEMO_BUYERS.map((b) => ({
      label: b.name,
      sub: `Buyer · Grade ${b.grade}`,
      href: `/buyers/${b.id}`,
    }));
    const pages: Item[] = [
      { label: "Dashboard", sub: "Page", href: "/" },
      { label: "Seller pipeline", sub: "Page", href: "/pipeline" },
      { label: "Buyers", sub: "Page", href: "/buyers" },
      { label: "Underwriting", sub: "Page", href: "/underwriting" },
      { label: "KPIs", sub: "Page", href: "/kpi" },
    ];
    return [...leads, ...buyers, ...pages];
  }, []);

  const filtered = items.filter(
    (i) =>
      q.trim() === "" ||
      (i.label + " " + i.sub).toLowerCase().includes(q.toLowerCase()),
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-border-strong bg-bg-elev shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Jump to lead, buyer, or page…"
          className="w-full rounded-t-lg bg-transparent px-4 py-3 text-sm text-fg placeholder:text-fg-faint focus:outline-none"
        />
        <div className="max-h-80 overflow-y-auto border-t border-border">
          {filtered.slice(0, 12).map((i) => (
            <button
              key={i.href + i.label}
              onClick={() => {
                router.push(i.href);
                onClose();
                setQ("");
              }}
              className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-bg-elev-2"
            >
              <span className="text-sm text-fg">{i.label}</span>
              <span className="text-[11px] text-fg-faint">{i.sub}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-fg-faint">No matches.</div>
          )}
        </div>
      </div>
    </div>
  );
}
