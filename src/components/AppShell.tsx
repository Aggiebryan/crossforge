"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileSignature,
  Send,
  CheckSquare,
  BarChart3,
  Columns3,
  ClipboardList,
  Command,
  Sun,
  Moon,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./CommandPalette";
import { RoleContext, type Role } from "./RoleContext";
import { ROLE_LABELS, ROLES } from "@/domain/constants";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/day", label: "Day view", icon: ClipboardList },
  { href: "/pipeline", label: "Seller pipeline", icon: Columns3 },
  { href: "/buyers", label: "Buyers", icon: Users },
  { href: "/underwriting", label: "Underwriting", icon: Calculator },
  { href: "/contracts", label: "Contracts & title", icon: FileSignature },
  { href: "/disposition", label: "Disposition", icon: Send },
  { href: "/closing", label: "Closing", icon: CheckSquare },
  { href: "/kpi", label: "KPIs", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [role, setRole] = useState<Role>("owner_operator");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <div className="flex h-screen overflow-hidden bg-bg text-fg">
        <aside className="hidden md:flex w-56 flex-col border-r border-border bg-bg-elev shrink-0">
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-accent" />
              <span className="font-semibold tracking-tight">CrossForge</span>
            </div>
            <p className="mt-1 text-[11px] text-fg-faint leading-tight">
              The system is stronger than the operator&apos;s emotion on a bad day.
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium transition",
                    active
                      ? "bg-accent/15 text-accent border-r-2 border-accent"
                      : "text-fg-muted hover:bg-bg-elev-2 hover:text-fg",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3 space-y-2">
            <label className="block text-[10px] uppercase tracking-wide text-fg-faint">
              View as role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-md border border-border bg-bg px-2 py-1 text-xs text-fg"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex flex-1 items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-fg-muted hover:bg-bg-elev-2"
              >
                <Command className="h-3 w-3" /> Jump… <span className="ml-auto opacity-60">⌘K</span>
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-md border border-border p-1.5 text-fg-muted hover:bg-bg-elev-2"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </RoleContext.Provider>
  );
}
