import { Link } from "@tanstack/react-router";
import { Bell, Menu, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { alerts } from "@/lib/farm-data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: "🏡" },
  { to: "/crops", label: "Crop Health", icon: "🌾" },
  { to: "/soil", label: "Soil", icon: "🌱" },
  { to: "/water", label: "Water", icon: "💧" },
  { to: "/livestock", label: "Livestock", icon: "🐄" },
  { to: "/weather", label: "Weather", icon: "🌦️" },
  { to: "/expenses", label: "Expenses", icon: "💰" },
  { to: "/recommendations", label: "AI Advisor", icon: "🧠" },
  { to: "/alerts", label: "Alerts", icon: "🔔" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            className="grid size-11 place-items-center rounded-2xl border border-border text-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary text-xl text-primary-foreground">
              🌿
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold">SmartAgriCare</span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Smart Farming. Healthy Livestock. Sustainable Future.
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/alerts"
              aria-label="Notifications"
              className="relative grid size-11 place-items-center rounded-2xl border border-border transition-colors hover:bg-secondary"
            >
              <Bell className="size-5" />
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[11px] font-semibold text-destructive-foreground">
                {alerts.length}
              </span>
            </Link>
            <button
              aria-label="Profile"
              className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground"
            >
              <UserRound className="size-5" />
            </button>
          </div>
        </div>

        <nav
          className={cn(
            "mx-auto max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:flex",
            open ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : "hidden lg:flex",
          )}
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}
              className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-transparent bg-secondary/60 px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">{children}</main>

      <footer className="border-t border-border/70 bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <p className="font-medium text-foreground">
            From Soil to Cattle, Weather to Wealth — One Smart Platform for the Entire Farm.
          </p>
          <p className="mt-2 max-w-3xl">
            SmartAgriCare is a decision-support prototype. All figures shown are illustrative sample
            data. Outputs are recommendations only and do not replace professional veterinary or
            agronomic advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
