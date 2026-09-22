import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompact } from "@/lib/datasets";

const AXIS = { fontSize: 12, fill: "var(--muted-foreground)" };

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--card-foreground)",
  fontSize: 12,
};

export interface Point {
  name: string;
  value: number;
}

const fmt = (v: number | string) =>
  typeof v === "number" ? formatCompact(v, 2) : String(v);

function Empty({ height }: { height: number }) {
  return (
    <div
      className="grid place-items-center rounded-2xl bg-secondary/40 text-sm text-muted-foreground"
      style={{ height }}
    >
      Data not available for this selection
    </div>
  );
}

export function BarChartView({
  data,
  label = "Value",
  height = 260,
  horizontal = false,
  unit,
}: {
  data: Point[];
  label?: string;
  height?: number;
  horizontal?: boolean;
  unit?: string;
}) {
  if (!data.length) return <Empty height={height} />;

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 16, top: 8 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={fmt} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={AXIS}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={tooltipStyle}
            formatter={(v) => [`${fmt(v as number)}${unit ? ` ${unit}` : ""}`, label]}
          />
          <Bar dataKey="value" radius={[0, 10, 10, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`var(--chart-${(i % 6) + 1})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -8, right: 8, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={fmt} width={54} />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={tooltipStyle}
          formatter={(v) => [`${fmt(v as number)}${unit ? ` ${unit}` : ""}`, label]}
        />
        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={`var(--chart-${(i % 6) + 1})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartView({
  data,
  label = "Value",
  height = 260,
  unit,
  color = "var(--chart-1)",
}: {
  data: Point[];
  label?: string;
  height?: number;
  unit?: string;
  color?: string;
}) {
  if (!data.length) return <Empty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={fmt} width={54} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`${fmt(v as number)}${unit ? ` ${unit}` : ""}`, label]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={3}
          dot={data.length > 30 ? false : { r: 3, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieChartView({
  data,
  label = "Records",
  height = 280,
}: {
  data: Point[];
  label?: string;
  height?: number;
}) {
  if (!data.length) return <Empty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v as number), label]} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          label={({ name }) => name}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={`var(--chart-${(i % 6) + 1})`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GroupedBarChartView({
  data,
  keys,
  xKey,
  height = 300,
}: {
  data: Record<string, string | number>[];
  keys: string[];
  xKey: string;
  height?: number;
}) {
  if (!data.length) return <Empty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={fmt} width={54} />
        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} radius={[6, 6, 0, 0]} fill={`var(--chart-${(i % 6) + 1})`} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
