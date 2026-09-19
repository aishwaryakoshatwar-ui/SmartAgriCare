import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ExpensePieChart } from "@/components/farm/charts";
import { Field, inputClass, SubmitButton } from "@/components/farm/form";
import { Disclaimer, PageHeader, Panel, SampleTag, StatCard } from "@/components/farm/primitives";
import { expenses as seedExpenses, SAMPLE_NOTE } from "@/lib/farm-data";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Farm Expenses & Income Estimate — SmartAgriCare" },
      {
        name: "description",
        content:
          "Track seed, fertilizer, water, feed and medicine costs, estimate income and spot cost-saving opportunities.",
      },
      { property: "og:title", content: "Farm Expenses & Income Estimate — SmartAgriCare" },
      {
        property: "og:description",
        content: "Input-cost tracking and simple income estimates for the whole farm.",
      },
    ],
  }),
  component: ExpensesPage,
});

const CATEGORIES = ["Seeds", "Fertilizer", "Water", "Feed", "Medicine", "Other"];
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function ExpensesPage() {
  const [rows, setRows] = useState(seedExpenses);
  const [yieldTonnes, setYieldTonnes] = useState(42);
  const [pricePerTonne, setPricePerTonne] = useState(3200);

  const total = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);
  const income = yieldTonnes * pricePerTonne;
  const profit = income - total;
  const biggest = useMemo(
    () => [...rows].sort((a, b) => b.amount - a.amount)[0] ?? { category: "—", amount: 0 },
    [rows],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon="💰"
        title="Farm Expenses"
        subtitle="Add what you spend, estimate what the season may return, and see where costs are concentrated."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="🧾" label="Total input cost" value={inr(total)} detail="This season so far" tone="soil" />
        <StatCard icon="📈" label="Estimated income" value={inr(income)} detail={`${yieldTonnes} t × ${inr(pricePerTonne)}`} tone="leaf" />
        <StatCard
          icon={profit >= 0 ? "✅" : "⚠️"}
          label="Estimated margin"
          value={inr(profit)}
          detail={profit >= 0 ? "Income above tracked costs" : "Costs above estimated income"}
          tone="sun"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Expense breakdown" note={SAMPLE_NOTE} action={<SampleTag />}>
          <ExpensePieChart />
        </Panel>

        <Panel title="Cost by category">
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.category} className="rounded-2xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.category}</span>
                  <span>{inr(r.amount)}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.round((r.amount / total) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {Math.round((r.amount / total) * 100)}% of tracked spend
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Add an expense">
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const category = String(f.get("category"));
              const amount = Number(f.get("amount"));
              if (!amount) return;
              setRows((prev) =>
                prev.map((r) => (r.category === category ? { ...r, amount: r.amount + amount } : r)),
              );
              e.currentTarget.reset();
            }}
          >
            <Field label="Category">
              <select name="category" className={inputClass} defaultValue="Seeds">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Amount (₹)">
              <input name="amount" type="number" min={0} placeholder="2500" className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <SubmitButton>Add to this season</SubmitButton>
            </div>
          </form>
        </Panel>

        <Panel title="Estimate production income">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Expected production (tonnes)">
              <input
                type="number"
                min={0}
                value={yieldTonnes}
                onChange={(e) => setYieldTonnes(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Expected price (₹ / tonne)">
              <input
                type="number"
                min={0}
                value={pricePerTonne}
                onChange={(e) => setPricePerTonne(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="mt-4 rounded-2xl bg-secondary/50 p-4 text-sm">
            <p>
              Estimated income <strong>{inr(income)}</strong> against tracked costs of{" "}
              <strong>{inr(total)}</strong>.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Cost-saving opportunities">
        <ul className="space-y-3 text-sm">
          <li className="rounded-2xl bg-secondary/50 p-4">
            <p className="font-medium">
              {biggest.category} is your largest cost at {inr(biggest.amount)}
            </p>
            <p className="text-muted-foreground">
              Compare supplier rates and bulk options before the next purchase cycle.
            </p>
          </li>
          <li className="rounded-2xl bg-secondary/50 p-4">
            <p className="font-medium">Split fertilizer doses</p>
            <p className="text-muted-foreground">
              Applying in stages instead of one heavy dose often reduces runoff and total quantity used.
            </p>
          </li>
          <li className="rounded-2xl bg-secondary/50 p-4">
            <p className="font-medium">Log medicine use per animal</p>
            <p className="text-muted-foreground">
              Per-animal records make it easier to spot repeat treatments worth discussing with your vet.
            </p>
          </li>
        </ul>
      </Panel>

      <Disclaimer>
        Starting figures are illustrative sample data. Entries you add stay in this browser session
        only — connect a backend later to keep records between visits.
      </Disclaimer>
    </div>
  );
}
