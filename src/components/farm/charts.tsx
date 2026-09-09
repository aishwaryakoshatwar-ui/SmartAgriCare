import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  diseaseRisk,
  expenses,
  predictedYield,
  soilMoistureDay,
  weatherForecast,
  yieldTrend,
} from "@/lib/farm-data";

const AXIS = { fontSize: 12, fill: "var(--muted-foreground)" };

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--card-foreground)",
  fontSize: 12,
};

export function YieldTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={yieldTrend} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="season" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} unit="t" />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} t/ha`, "Yield"]} />
        <Line
          type="monotone"
          dataKey="yield"
          stroke="var(--chart-1)"
          strokeWidth={3}
          dot={{ r: 4, fill: "var(--chart-1)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PredictedYieldChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={predictedYield} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="crop" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} unit="t" />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v} t/ha`, "Predicted"]}
        />
        <Bar dataKey="yield" radius={[10, 10, 0, 0]}>
          {predictedYield.map((_, i) => (
            <Cell key={i} fill={`var(--chart-${(i % 6) + 1})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SoilMoistureChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={soilMoistureDay} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="time" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} unit="%" domain={[0, 60]} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Moisture"]} />
        <Line
          type="monotone"
          dataKey="moisture"
          stroke="var(--chart-3)"
          strokeWidth={3}
          dot={{ r: 4, fill: "var(--chart-3)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DiseaseRiskChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={diseaseRisk} layout="vertical" margin={{ left: 10, right: 16 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="level" tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v} plots`, "Plots"]}
        />
        <Bar dataKey="plots" radius={[0, 10, 10, 0]}>
          {diseaseRisk.map((_, i) => (
            <Cell key={i} fill={`var(--chart-${(i % 6) + 1})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ExpensePieChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${v}`, "Spend"]} />
        <Pie
          data={expenses}
          dataKey="amount"
          nameKey="category"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          label={({ name }) => name}
          labelLine={false}
        >
          {expenses.map((_, i) => (
            <Cell key={i} fill={`var(--chart-${(i % 6) + 1})`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RainForecastChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={weatherForecast} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} unit="%" />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v}%`, "Rain chance"]}
        />
        <Bar dataKey="rain" radius={[10, 10, 0, 0]} fill="var(--chart-3)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
