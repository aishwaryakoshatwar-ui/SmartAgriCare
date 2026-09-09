import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Field, inputClass, SubmitButton } from "@/components/farm/form";
import {
  AdvisoryCard,
  Disclaimer,
  PageHeader,
  Panel,
  SampleTag,
  StatCard,
} from "@/components/farm/primitives";
import {
  getLivestockAdvisory,
  LIVESTOCK_SYMPTOMS,
  livestock,
  SAMPLE_NOTE,
  vaccinations,
  vets,
  type Advisory,
} from "@/lib/farm-data";

export const Route = createFileRoute("/livestock")({
  head: () => ({
    meta: [
      { title: "Livestock Health Records & Vet Support — SmartAgriCare" },
      {
        name: "description",
        content:
          "Log animal health records, flag symptom-based risks, track vaccination reminders and reach a veterinarian quickly.",
      },
      { property: "og:title", content: "Livestock Health Records & Vet Support — SmartAgriCare" },
      {
        property: "og:description",
        content: "Animal health logs, vaccination reminders and vet contacts in one place.",
      },
    ],
  }),
  component: LivestockPage,
});

function LivestockPage() {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const toggle = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="space-y-6">
      <PageHeader
        icon="🐄"
        title="Livestock Health"
        subtitle="Keep animal records, flag possible risks early and reach a vet. Nothing here is a diagnosis — a veterinarian always makes the call."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="🐄" label="Animals" value="24" detail="Cows, buffalo and goats" tone="soil" />
        <StatCard icon="⚠️" label="Active alerts" value="2" detail="Flagged for follow-up" tone="sun" />
        <StatCard icon="💉" label="Vaccinations due" value="3" detail="Within the next 2 weeks" tone="leaf" />
      </div>

      <Panel title="Symptom check" note="Rule-based flagging — decision support only">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setAdvisory(
              getLivestockAdvisory({
                animalType: String(f.get("animalType")),
                symptoms,
                duration: String(f.get("duration")) as "under-1-day" | "1-3-days" | "over-3-days",
                notes: String(f.get("notes") ?? ""),
              }),
            );
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Animal type">
              <select name="animalType" className={inputClass} defaultValue="Cow">
                {["Cow", "Buffalo", "Goat", "Sheep", "Poultry"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="How long have you noticed this?">
              <select name="duration" className={inputClass} defaultValue="1-3-days">
                <option value="under-1-day">Less than a day</option>
                <option value="1-3-days">1–3 days</option>
                <option value="over-3-days">More than 3 days</option>
              </select>
            </Field>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium">Observed symptoms</span>
            <div className="flex flex-wrap gap-2">
              {LIVESTOCK_SYMPTOMS.map((s) => {
                const active = symptoms.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggle(s)}
                    aria-pressed={active}
                    className={
                      "min-h-11 rounded-xl border px-4 text-sm font-medium transition-colors " +
                      (active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary/60 text-secondary-foreground")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Notes (optional)">
            <textarea
              name="notes"
              rows={3}
              placeholder="Anything else you noticed — feed changes, injuries, herd contact"
              className="w-full rounded-xl border border-input bg-background p-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </Field>

          <div className="sm:max-w-xs">
            <SubmitButton>Check health risk</SubmitButton>
          </div>
        </form>

        {advisory && (
          <div className="mt-5">
            <AdvisoryCard advisory={advisory} />
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Animal records" note={SAMPLE_NOTE} action={<SampleTag />}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">ID</th>
                  <th>Type</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Last check</th>
                </tr>
              </thead>
              <tbody>
                {livestock.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="py-2.5 font-medium">{a.id}</td>
                    <td>{a.type}</td>
                    <td>{a.age}</td>
                    <td>
                      <span
                        className={
                          "rounded-full px-2.5 py-1 text-xs font-semibold " +
                          (a.status === "Alert"
                            ? "bg-destructive text-destructive-foreground"
                            : a.status === "Watch"
                              ? "bg-warning text-warning-foreground"
                              : "bg-success text-success-foreground")
                        }
                      >
                        {a.status}
                      </span>
                    </td>
                    <td>{a.lastCheck}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="💉 Vaccination & checkup reminders" note={SAMPLE_NOTE}>
            <ul className="space-y-3 text-sm">
              {vaccinations.map((v) => (
                <li key={v.animal + v.vaccine} className="rounded-2xl bg-secondary/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {v.animal} · {v.vaccine}
                    </span>
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-semibold " +
                        (v.status === "Overdue"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-accent text-accent-foreground")
                      }
                    >
                      {v.status}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">Due {v.due}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="🩺 Connect to a vet">
            <ul className="space-y-3">
              {vets.map((v) => (
                <li
                  key={v.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/50 p-4"
                >
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-muted-foreground">{v.role}</p>
                  </div>
                  <a
                    href={`tel:${v.phone.replace(/\s/g, "")}`}
                    className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                  >
                    Call {v.phone}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Demo contacts. Replace them with your own vet and helpline numbers.
            </p>
          </Panel>
        </div>
      </div>

      <Disclaimer>
        SmartAgriCare flags possible risks from what you enter. It does not diagnose illness and does
        not replace examination and treatment by a qualified veterinarian.
      </Disclaimer>
    </div>
  );
}
