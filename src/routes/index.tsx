import { createFileRoute, Link } from "@tanstack/react-router";

import { YieldTrendChart } from "@/components/farm/charts";
import { Panel, SampleTag, StatCard } from "@/components/farm/primitives";
import { alerts, farmSummary, SAMPLE_NOTE, weatherNow } from "@/lib/farm-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartAgriCare — Farm Dashboard for Crops, Soil & Livestock" },
      {
        name: "description",
        content:
          "One dashboard for crop health, soil, water, weather, livestock and farm costs, with rule-based decision support for farmers.",
      },
      { property: "og:title", content: "SmartAgriCare — Farm Decision-Support Dashboard" },
      {
        property: "og:description",
        content:
          "Smart Farming. Healthy Livestock. Sustainable Future. Track crops, soil, water, weather, animals and expenses in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 field-grid shadow-[var(--shadow-card)]">
        <SampleTag />
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Good day, Aishwarya 👋</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Here is today&apos;s snapshot of your farm — soil to cattle, weather to wealth.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon="🌾"
          label="Crop Health"
          value={`${farmSummary.cropHealth}%`}
          detail="Across 22 monitored plots"
          progress={farmSummary.cropHealth}
          tone="leaf"
        />
        <StatCard
          icon="🌱"
          label="Soil Health"
          value={farmSummary.soilStatus}
          detail="Plot C needs attention"
          progress={62}
          tone="soil"
        />
        <StatCard
          icon="💧"
          label="Water Level"
          value={`${farmSummary.waterLevel}%`}
          detail="Storage tank + canal share"
          progress={farmSummary.waterLevel}
          tone="water"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="🌦️ Weather" note={weatherNow.location}>
          <p className="text-4xl font-semibold">{weatherNow.temperature}°C</p>
          <p className="text-sm text-muted-foreground">{weatherNow.condition}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-muted-foreground">Humidity</dt>
              <dd className="text-lg font-semibold">{weatherNow.humidity}%</dd>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-muted-foreground">Rain chance</dt>
              <dd className="text-lg font-semibold">{weatherNow.rainProbability}%</dd>
            </div>
          </dl>
          <Link to="/weather" className="mt-4 inline-block text-sm font-medium text-primary">
            View 7-day outlook →
          </Link>
        </Panel>

        <Panel title="🐄 Livestock" note="Herd overview">
          <p className="text-4xl font-semibold">{farmSummary.animals}</p>
          <p className="text-sm text-muted-foreground">animals in the herd</p>
          <div className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm">
            <span className="font-semibold text-destructive">
              {farmSummary.animalAlerts} active health alerts
            </span>
            <p className="mt-1 text-muted-foreground">
              Review flagged animals and contact a vet if needed.
            </p>
          </div>
          <Link to="/livestock" className="mt-4 inline-block text-sm font-medium text-primary">
            Open livestock health →
          </Link>
        </Panel>

        <Panel title="🧠 AI Recommendation" note="Rule-based decision support">
          <div className="rounded-2xl border-2 border-primary/25 bg-secondary/50 p-4">
            <p className="text-sm leading-relaxed">
              ⚠️ Soil moisture is decreasing. Consider irrigation based on current conditions, and
              re-check Plot C moisture this evening.
            </p>
          </div>
          <Link
            to="/recommendations"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Get a recommendation
          </Link>
        </Panel>
      </div>

      <Panel title="Crop Yield Trend" note={SAMPLE_NOTE} action={<SampleTag />}>
        <YieldTrendChart />
      </Panel>

      <Panel title="🔔 Latest alerts" action={<Link to="/alerts" className="text-sm font-medium text-primary">See all</Link>}>
        <ul className="space-y-3">
          {alerts.slice(0, 3).map((a) => (
            <li key={a.id} className="flex gap-3 rounded-2xl bg-secondary/50 p-4">
              <span className="text-xl" aria-hidden>
                {a.icon}
              </span>
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
