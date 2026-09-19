import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Field, inputClass, SubmitButton } from "@/components/farm/form";
import {
  AdvisoryCard,
  Disclaimer,
  PageHeader,
  Panel,
} from "@/components/farm/primitives";
import {
  getCropAdvisory,
  getLivestockAdvisory,
  LIVESTOCK_SYMPTOMS,
  MODEL_METRICS,
  type Advisory,
} from "@/lib/farm-data";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "AI Recommendations for Crops & Livestock — SmartAgriCare" },
      {
        name: "description",
        content:
          "Enter field or animal details and get a structured decision-support recommendation for irrigation and livestock follow-up.",
      },
      { property: "og:title", content: "AI Recommendations for Crops & Livestock — SmartAgriCare" },
      {
        property: "og:description",
        content: "Structured, rule-based recommendations for water stress and livestock health risk.",
      },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const [cropAdvisory, setCropAdvisory] = useState<Advisory | null>(null);
  const [animalAdvisory, setAnimalAdvisory] = useState<Advisory | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const toggle = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="space-y-6">
      <PageHeader
        icon="🧠"
        title="AI Recommendations"
        subtitle="Answer a few questions about the field or the animal and get a clear, structured suggestion you can act on today."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="🌾 Crop & water recommendation" note="Rule-based engine, ready for a real model later">
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setCropAdvisory(
                getCropAdvisory({
                  crop: String(f.get("crop")),
                  soilMoisture: Number(f.get("moisture")),
                  temperature: Number(f.get("temperature")),
                  humidity: Number(f.get("humidity")),
                  rainfallOutlook: String(f.get("rain")) as "none" | "light" | "heavy",
                }),
              );
            }}
          >
            <Field label="Crop type">
              <select name="crop" className={inputClass} defaultValue="Wheat">
                {["Wheat", "Rice", "Soybean", "Cotton", "Maize"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Soil moisture (%)">
              <input name="moisture" type="number" min={0} max={100} defaultValue={26} className={inputClass} />
            </Field>
            <Field label="Temperature (°C)">
              <input name="temperature" type="number" defaultValue={35} className={inputClass} />
            </Field>
            <Field label="Humidity (%)">
              <input name="humidity" type="number" min={0} max={100} defaultValue={45} className={inputClass} />
            </Field>
            <Field label="Rainfall outlook">
              <select name="rain" className={inputClass} defaultValue="none">
                <option value="none">No rain expected</option>
                <option value="light">Light rain</option>
                <option value="heavy">Heavy rain</option>
              </select>
            </Field>
            <div className="flex items-end">
              <SubmitButton>Get recommendation</SubmitButton>
            </div>
            {cropAdvisory && (
              <div className="sm:col-span-2">
                <AdvisoryCard advisory={cropAdvisory} />
              </div>
            )}
          </form>
        </Panel>

        <Panel title="🐄 Livestock recommendation" note="Symptom-based risk flagging, never a diagnosis">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setAnimalAdvisory(
                getLivestockAdvisory({
                  animalType: String(f.get("animalType")),
                  symptoms,
                  duration: String(f.get("duration")) as
                    | "under-1-day"
                    | "1-3-days"
                    | "over-3-days",
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
              <Field label="Duration">
                <select name="duration" className={inputClass} defaultValue="1-3-days">
                  <option value="under-1-day">Less than a day</option>
                  <option value="1-3-days">1–3 days</option>
                  <option value="over-3-days">More than 3 days</option>
                </select>
              </Field>
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium">Symptoms observed</span>
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
            <div className="sm:max-w-xs">
              <SubmitButton>Check livestock risk</SubmitButton>
            </div>
            {animalAdvisory && <AdvisoryCard advisory={animalAdvisory} />}
          </form>
        </Panel>
      </div>

      <Panel title="How these recommendations are produced">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-secondary/50 p-4 text-sm">
            <p className="font-medium">Today: transparent rules</p>
            <p className="mt-1 text-muted-foreground">
              Suggestions come from simple, readable thresholds on the values you enter — no trained
              model is involved yet.
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-4 text-sm">
            <p className="font-medium">Later: trained models</p>
            <p className="mt-1 text-muted-foreground">
              The same forms and result cards can be pointed at a backend service returning the same
              shape, so no redesign is needed.
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Model</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_METRICS.map((m) => (
                <tr key={m.name} className="border-t border-border">
                  <td className="py-2 pr-3">{m.name}</td>
                  <td>{m.accuracy}</td>
                  <td>{m.precision}</td>
                  <td>{m.recall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Performance figures stay blank until real models are trained and evaluated.
        </p>
      </Panel>

      <Disclaimer>
        All outputs are decision support. They are not a diagnosis and do not replace a qualified
        veterinarian or agronomist.
      </Disclaimer>
    </div>
  );
}
