import type { ReactNode } from "react";

import type { Advisory } from "@/lib/advisors";
import { cn } from "@/lib/utils";

export function PageHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 rounded-3xl border border-border bg-card p-6 field-grid shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-3xl">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  note,
  action,
  children,
  className,
}: {
  title?: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Small tag naming the dataset a panel was calculated from. */
export function SourceTag({ label = "Dataset-calculated" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
      {label}
    </span>
  );
}

export function StatCard({
  icon,
  label,
  value,
  detail,
  progress,
  tone = "leaf",
}: {
  icon: string;
  label: string;
  value: string;
  detail?: string;
  progress?: number;
  tone?: "leaf" | "soil" | "water" | "sun";
}) {
  const bar = {
    leaf: "bg-leaf",
    soil: "bg-soil",
    water: "bg-water",
    sun: "bg-sun",
  }[tone];

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
      {typeof progress === "number" && (
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className={cn("h-full rounded-full", bar)} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export function RiskPill({ risk }: { risk: Advisory["risk"] }) {
  const tone =
    risk === "High"
      ? "bg-destructive text-destructive-foreground"
      : risk === "Moderate"
        ? "bg-warning text-warning-foreground"
        : "bg-success text-success-foreground";
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tone)}>{risk}</span>
  );
}

export function AdvisoryCard({ advisory }: { advisory: Advisory }) {
  return (
    <div className="rounded-3xl border-2 border-primary/25 bg-secondary/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <span aria-hidden>{advisory.icon}</span>
          {advisory.heading}
        </h3>
        <RiskPill risk={advisory.risk} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{advisory.message}</p>

      {advisory.facts && advisory.facts.length > 0 && (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {advisory.facts.map((f) => (
            <div key={f.label} className="rounded-2xl bg-background/70 p-3">
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd className="text-lg font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <ul className="mt-4 space-y-2">
        {advisory.actions.map((action) => (
          <li key={action} className="flex gap-2 text-sm text-foreground/85">
            <span className="text-primary" aria-hidden>
              ●
            </span>
            {action}
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        Decision support based on historical dataset records. This is not a diagnosis and does not
        replace a qualified veterinarian or agronomist.
      </p>
    </div>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border bg-muted/60 p-4 text-xs text-muted-foreground">
      {children}
    </p>
  );
}
