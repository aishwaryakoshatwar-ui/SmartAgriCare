import { createFileRoute } from "@tanstack/react-router";

import { RainForecastChart } from "@/components/farm/charts";
import { Disclaimer, PageHeader, Panel, SampleTag, StatCard } from "@/components/farm/primitives";
import { SAMPLE_NOTE, weatherForecast, weatherNow } from "@/lib/farm-data";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather Intelligence for Field Work — SmartAgriCare" },
      {
        name: "description",
        content:
          "Current conditions, a 7-day outlook and weather-based farming tips with alerts for heavy rain, heatwaves and frost.",
      },
      { property: "og:title", content: "Weather Intelligence for Field Work — SmartAgriCare" },
      {
        property: "og:description",
        content: "Weather-driven farming tips and extreme-condition alerts for your fields.",
      },
    ],
  }),
  component: WeatherPage,
});

const tips = [
  { icon: "🌡️", title: "Heat stress ahead", body: "Wednesday peaks at 37°C. Water livestock more often and shift heavy field work to early morning." },
  { icon: "🌧️", title: "Heavy rain Friday", body: "80% rain chance. Postpone spraying and fertilizer top-dressing, and clear field drainage channels." },
  { icon: "🌬️", title: "Spraying window", body: "Tuesday morning has low wind and no rain — the most suitable window this week for foliar spray." },
  { icon: "❄️", title: "No frost risk", body: "Night temperatures stay above 22°C this week, so frost protection is not needed." },
];

function WeatherPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon="🌦️"
        title="Weather Intelligence"
        subtitle="Plan irrigation, spraying and harvest around the weather, and get a heads-up on extreme conditions."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-1" title="Right now" note={weatherNow.location}>
          <p className="text-5xl font-semibold">{weatherNow.temperature}°C</p>
          <p className="mt-1 text-muted-foreground">{weatherNow.condition}</p>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-muted-foreground">Humidity</dt>
              <dd className="text-lg font-semibold">{weatherNow.humidity}%</dd>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-muted-foreground">Rain chance</dt>
              <dd className="text-lg font-semibold">{weatherNow.rainProbability}%</dd>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-muted-foreground">Wind</dt>
              <dd className="text-lg font-semibold">{weatherNow.wind} km/h</dd>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-muted-foreground">Feels like</dt>
              <dd className="text-lg font-semibold">{weatherNow.temperature + 2}°C</dd>
            </div>
          </dl>
        </Panel>

        <Panel className="lg:col-span-2" title="Rain probability this week" note={SAMPLE_NOTE} action={<SampleTag />}>
          <RainForecastChart />
        </Panel>
      </div>

      <Panel title="7-day outlook" note={SAMPLE_NOTE} action={<SampleTag />}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {weatherForecast.map((d) => (
            <div key={d.day} className="rounded-2xl bg-secondary/50 p-4 text-center">
              <p className="font-semibold">{d.day}</p>
              <p className="mt-2 text-2xl">{d.rain > 60 ? "🌧️" : d.rain > 30 ? "🌦️" : "☀️"}</p>
              <p className="mt-2 text-sm font-medium">
                {d.high}° / {d.low}°
              </p>
              <p className="text-xs text-muted-foreground">{d.rain}% rain</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon="🔥" label="Heat alert" value="Wed" detail="37°C expected — heat stress likely" tone="sun" />
        <StatCard icon="🌊" label="Heavy rain alert" value="Fri" detail="80% rain chance — check drainage" tone="water" />
      </div>

      <Panel title="Weather-based farming tips">
        <ul className="grid gap-3 sm:grid-cols-2">
          {tips.map((t) => (
            <li key={t.title} className="rounded-2xl bg-secondary/50 p-4">
              <p className="font-medium">
                <span aria-hidden>{t.icon}</span> {t.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Disclaimer>
        Weather values shown are illustrative demo data. Connect a live weather service before using
        this page for real field decisions.
      </Disclaimer>
    </div>
  );
}
