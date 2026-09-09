import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SoilMoistureChart } from "@/components/farm/charts";
import { Field, inputClass, SubmitButton } from "@/components/farm/form";
import {
  AdvisoryCard,
  Disclaimer,
  PageHeader,
  Panel,
  SampleTag,
  StatCard,
} from "@/components/farm/primitives";
import { getCropAdvisory, SAMPLE_NOTE, soilReadings, type Advisory } from "@/lib/farm-data";

export const Route = createFileRoute("/water")({
  head: () => ({
    meta: [
      { title: "Smart Water & Irrigation Planning — SmartAgriCare" },
      {
        name: "description",
        content:
          "Track soil moisture, get irrigation timing suggestions and spot water-usage savings across your plots.",
      },
      { property: "og:title", content: "Smart Water & Irrigation Planning — SmartAgriCare" },
      {
        property: "og:description",
        content: "Soil moisture tracking with irrigation and water-saving recommendations.",
      },
    ],
  }),
  component: WaterPage,
});

const savings = [
  {
    title: "Shift irrigation to early morning",
    detail: "Evaporation losses drop noticeably when irrigating before 8AM or after 6PM.",
  },
  {
    title: "Mulch Plot C",
    detail: "Plot C loses moisture fastest. Straw mulch can slow surface drying.",
  },
  {
    title: "Check drip line pressure",
    detail: "Uneven emitter flow is a common source of silent water waste.",
  },
];

function WaterPage() {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="💧"
        title="Water Management"
        subtitle="See how moisture is trending and decide when irrigation is worth the water and the diesel."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="🛢️" label="Water storage" value="46%" progress={46} detail="Tank + canal share" tone="water" />
        <StatCard icon="💧" label="Used this week" value="18,400 L" detail="Across all plots" tone="water" />
        <StatCard icon="📉" label="Lowest plot moisture" value="22%" detail="Plot C — below 30% threshold" progress={22} tone="soil" />
      </div>

      <Panel title="Soil moisture 8AM–4PM" note={SAMPLE_NOTE} action={<SampleTag />}>
        <SoilMoistureChart />
      </Panel>

      <Panel title="Should I irrigate today?" note="Rule-based irrigation helper">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
          <Field label="Crop">
            <select name="crop" className={inputClass} defaultValue="Maize">
              {["Wheat", "Rice", "Soybean", "Cotton", "Maize"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Soil moisture (%)">
            <input name="moisture" type="number" min={0} max={100} defaultValue={24} className={inputClass} />
          </Field>
          <Field label="Temperature (°C)">
            <input name="temperature" type="number" defaultValue={36} className={inputClass} />
          </Field>
          <Field label="Humidity (%)">
            <input name="humidity" type="number" min={0} max={100} defaultValue={40} className={inputClass} />
          </Field>
          <Field label="Rainfall outlook">
            <select name="rain" className={inputClass} defaultValue="none">
              <option value="none">No rain expected</option>
              <option value="light">Light rain</option>
              <option value="heavy">Heavy rain</option>
            </select>
          </Field>
          <div className="flex items-end">
            <SubmitButton>Check water stress</SubmitButton>
          </div>
        </form>
        {advisory && (
          <div className="mt-5">
            <AdvisoryCard advisory={advisory} />
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Plot moisture status" note={SAMPLE_NOTE} action={<SampleTag />}>
          <ul className="space-y-3">
            {soilReadings.map((r) => (
              <li key={r.plot} className="rounded-2xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.plot}</span>
                  <span className="text-sm text-muted-foreground">{r.moisture}% moisture</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-water" style={{ width: `${r.moisture}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.moisture < 30 ? "Below the 30% comfort threshold — consider irrigation." : "Within the comfort range."}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Water-saving opportunities">
          <ul className="space-y-3">
            {savings.map((s) => (
              <li key={s.title} className="rounded-2xl bg-secondary/50 p-4">
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Disclaimer>
        Thresholds used here are generic defaults for demonstration. Match them to your crop stage and
        local extension guidance before relying on them.
      </Disclaimer>
    </div>
  );
}
