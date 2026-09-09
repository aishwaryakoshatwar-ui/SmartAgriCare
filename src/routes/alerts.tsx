import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Disclaimer, PageHeader, Panel } from "@/components/farm/primitives";
import { alerts } from "@/lib/farm-data";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Farm Alerts & Reminders — SmartAgriCare" },
      {
        name: "description",
        content:
          "One feed for irrigation, weather, soil, livestock and cost alerts so nothing on the farm gets missed.",
      },
      { property: "og:title", content: "Farm Alerts & Reminders — SmartAgriCare" },
      {
        property: "og:description",
        content: "Priority alerts across crops, water, soil, weather, livestock and expenses.",
      },
    ],
  }),
  component: AlertsPage,
});

const FILTERS = ["All", "High", "Medium", "Low"] as const;

function AlertsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = alerts.filter((a) => filter === "All" || a.severity === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <PageHeader
        icon="🔔"
        title="Alerts"
        subtitle="Everything that needs a decision today — irrigation, weather, soil, animals and costs, in one feed."
      />

      <Panel
        title="Priority feed"
        action={
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "min-h-11 rounded-xl border px-4 text-sm font-medium transition-colors " +
                  (filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary/60 text-secondary-foreground")
                }
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        <ul className="space-y-3">
          {shown.map((a) => (
            <li
              key={a.id}
              className="flex gap-4 rounded-2xl border border-border bg-secondary/40 p-4"
            >
              <span className="text-2xl" aria-hidden>
                {a.icon}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{a.title}</p>
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-xs font-semibold " +
                      (a.severity === "high"
                        ? "bg-destructive text-destructive-foreground"
                        : a.severity === "medium"
                          ? "bg-warning text-warning-foreground"
                          : "bg-success text-success-foreground")
                    }
                  >
                    {a.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{a.time}</p>
              </div>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="rounded-2xl bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
              No alerts at this level right now.
            </li>
          )}
        </ul>
      </Panel>

      <Disclaimer>
        Alerts shown are illustrative examples generated from sample thresholds, not live sensor
        readings.
      </Disclaimer>
    </div>
  );
}
