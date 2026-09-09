import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DiseaseRiskChart, PredictedYieldChart } from "@/components/farm/charts";
import { AdvisoryCard, Disclaimer, PageHeader, Panel, SampleTag } from "@/components/farm/primitives";
import {
  cropDiseaseGuide,
  cropSuitability,
  getCropAdvisory,
  MODEL_METRICS,
  SAMPLE_NOTE,
  type Advisory,
} from "@/lib/farm-data";

export const Route = createFileRoute("/crops")({
  head: () => ({
    meta: [
      { title: "Crop Health & Disease Support — SmartAgriCare" },
      {
        name: "description",
        content:
          "Monitor crop health, check symptom-based disease guidance, and get fertilizer and crop-suitability suggestions.",
      },
      { property: "og:title", content: "Crop Health & Disease Support — SmartAgriCare" },
      {
        property: "og:description",
        content: "Crop health monitoring, disease guidance and suitability suggestions for your farm.",
      },
    ],
  }),
  component: CropsPage,
});

const CROPS = ["Wheat", "Rice", "Soybean", "Cotton", "Maize"];

function CropsPage() {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="🌾"
        title="Crop Health"
        subtitle="Track plot health, review symptom guidance and plan fertilizer or crop choices. All outputs are decision support, not a confirmed diagnosis."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Predicted yield by crop" note={SAMPLE_NOTE} action={<SampleTag />}>
          <PredictedYieldChart />
        </Panel>
        <Panel title="Crop disease risk breakdown" note={SAMPLE_NOTE} action={<SampleTag />}>
          <DiseaseRiskChart />
        </Panel>
      </div>

      <Panel title="Crop condition check" note="Rule-based helper — swap for a model later">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setAdvisory(
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
              {CROPS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Soil moisture (%)">
            <input name="moisture" type="number" min={0} max={100} defaultValue={28} className={inputClass} />
          </Field>
          <Field label="Temperature (°C)">
            <input name="temperature" type="number" min={-10} max={55} defaultValue={34} className={inputClass} />
          </Field>
          <Field label="Humidity (%)">
            <input name="humidity" type="number" min={0} max={100} defaultValue={52} className={inputClass} />
          </Field>
          <Field label="Rainfall outlook">
            <select name="rain" className={inputClass} defaultValue="none">
              <option value="none">No rain expected</option>
              <option value="light">Light rain</option>
              <option value="heavy">Heavy rain</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button className="min-h-12 w-full rounded-xl bg-primary px-5 font-semibold text-primary-foreground">
              Get recommendation
            </button>
          </div>
        </form>
        {advisory && (
          <div className="mt-5">
            <AdvisoryCard advisory={advisory} />
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Symptom & image reference" note="Visual guide only">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            <span className="text-2xl" aria-hidden>
              📷
            </span>
            {fileName ? (
              <span className="mt-2 font-medium text-foreground">{fileName}</span>
            ) : (
              <span className="mt-2">Upload a leaf photo for your own records</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
          <p className="mt-3 text-xs text-muted-foreground">
            Image analysis is not yet connected. Photos stay in your browser and are only used as a
            visual reminder alongside the reference table.
          </p>
          <ul className="mt-4 space-y-3">
            {cropDiseaseGuide.map((d) => (
              <li key={d.disease} className="rounded-2xl bg-secondary/50 p-4 text-sm">
                <p className="font-semibold">
                  {d.crop} · {d.disease}
                </p>
                <p className="text-muted-foreground">Signs: {d.signs}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d.note}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Crop suitability by soil pH">
            <ul className="space-y-3 text-sm">
              {Object.entries(cropSuitability).map(([band, crops]) => (
                <li key={band} className="rounded-2xl bg-secondary/50 p-4">
                  <p className="font-semibold">{band}</p>
                  <p className="text-muted-foreground">{crops.join(" · ")}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Model performance" note="No trained models connected yet">
            <div className="overflow-x-auto">
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
              Metrics stay blank until real models are trained and evaluated.
            </p>
          </Panel>
        </div>
      </div>

      <Disclaimer>
        Disease references are general guidance. Confirm any suspected outbreak with a qualified
        agronomist or your local agriculture extension officer before applying treatment.
      </Disclaimer>
    </div>
  );
}

export const inputClass =
  "min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
