import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SoilMoistureChart } from "@/components/farm/charts";
import { Field, inputClass, SubmitButton } from "@/components/farm/form";
import { Disclaimer, PageHeader, Panel, SampleTag, StatCard } from "@/components/farm/primitives";
import { cropSuitability, getSoilAssessment, SAMPLE_NOTE, soilReadings } from "@/lib/farm-data";

export const Route = createFileRoute("/soil")({
  head: () => ({
    meta: [
      { title: "Soil Health & Nutrient Assessment — SmartAgriCare" },
      {
        name: "description",
        content:
          "Enter pH, moisture and NPK values to get a soil-quality assessment with fertilizer and organic amendment suggestions.",
      },
      { property: "og:title", content: "Soil Health & Nutrient Assessment — SmartAgriCare" },
      {
        property: "og:description",
        content: "Soil parameter tracking with plain-language amendment suggestions for each plot.",
      },
    ],
  }),
  component: SoilPage,
});

function SoilPage() {
  const [result, setResult] = useState<ReturnType<typeof getSoilAssessment> | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="🌱"
        title="Soil Monitoring"
        subtitle="Log soil parameters per plot and see where nutrients or pH may need attention before the next sowing."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="🧪" label="Average pH" value="6.5" detail="Across 3 plots" tone="soil" />
        <StatCard icon="💧" label="Average moisture" value="34%" detail="Latest readings" progress={34} tone="water" />
        <StatCard icon="🌿" label="Organic matter" value="1.8%" detail="Below target of 2.5%" progress={45} tone="leaf" />
      </div>

      <Panel title="Soil moisture over the day" note={SAMPLE_NOTE} action={<SampleTag />}>
        <SoilMoistureChart />
      </Panel>

      <Panel title="Assess a soil sample" note="Rule-based assessment — no lab report is replaced">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setResult(
              getSoilAssessment({
                ph: Number(f.get("ph")),
                moisture: Number(f.get("moisture")),
                n: Number(f.get("n")),
                p: Number(f.get("p")),
                k: Number(f.get("k")),
              }),
            );
          }}
        >
          <Field label="pH">
            <input name="ph" type="number" step="0.1" min={3} max={10} defaultValue={6.4} className={inputClass} />
          </Field>
          <Field label="Moisture (%)">
            <input name="moisture" type="number" min={0} max={100} defaultValue={31} className={inputClass} />
          </Field>
          <Field label="Nitrogen (kg/ha)">
            <input name="n" type="number" min={0} defaultValue={42} className={inputClass} />
          </Field>
          <Field label="Phosphorus (kg/ha)">
            <input name="p" type="number" min={0} defaultValue={18} className={inputClass} />
          </Field>
          <Field label="Potassium (kg/ha)">
            <input name="k" type="number" min={0} defaultValue={120} className={inputClass} />
          </Field>
          <div className="flex items-end">
            <SubmitButton>Assess soil</SubmitButton>
          </div>
        </form>

        {result && (
          <div className="mt-5 rounded-3xl border-2 border-primary/25 bg-secondary/50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">🌱 Soil quality: {result.status}</h3>
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                Score {result.score}/100
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {result.notes.map((n) => (
                <li key={n} className="flex gap-2">
                  <span className="text-primary" aria-hidden>
                    ●
                  </span>
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              Suggestions are decision support based on the values you entered. Confirm dosage with a
              soil-testing lab or agronomist.
            </p>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Plot readings" note={SAMPLE_NOTE} action={<SampleTag />}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Plot</th>
                  <th>pH</th>
                  <th>Moisture</th>
                  <th>N</th>
                  <th>P</th>
                  <th>K</th>
                </tr>
              </thead>
              <tbody>
                {soilReadings.map((r) => (
                  <tr key={r.plot} className="border-t border-border">
                    <td className="py-2.5 font-medium">{r.plot}</td>
                    <td>{r.ph}</td>
                    <td>{r.moisture}%</td>
                    <td>{r.n}</td>
                    <td>{r.p}</td>
                    <td>{r.k}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Crop suitability by pH band">
          <ul className="space-y-3 text-sm">
            {Object.entries(cropSuitability).map(([band, crops]) => (
              <li key={band} className="rounded-2xl bg-secondary/50 p-4">
                <p className="font-semibold">{band}</p>
                <p className="text-muted-foreground">{crops.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Disclaimer>
        Soil figures shown here are illustrative. Use a certified soil test before making large
        fertilizer purchases.
      </Disclaimer>
    </div>
  );
}
