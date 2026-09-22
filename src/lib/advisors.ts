/**
 * Decision-support helpers for SmartAgriCare.
 *
 * Every number used below is computed from the uploaded Kaggle datasets
 * (see src/lib/datasets.ts). Nothing here is a diagnosis, a prediction or a
 * live sensor reading — outputs are comparisons against historical records.
 */
import {
  cropYieldRows,
  farms,
  farmStats,
  formatCompact,
  formatNumber,
  groupAggregate,
  livestockData,
  matchLivestockRecords,
  type Farm,
  type LivestockMatchResult,
} from "@/lib/datasets";

export type RiskLevel = "Low" | "Moderate" | "High";

export interface Advisory {
  icon: string;
  heading: string;
  risk: RiskLevel;
  message: string;
  actions: string[];
  facts?: { label: string; value: string }[];
}

/* ------------------------------ water advisory ---------------------------- */

const mean = (v: number[]) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0);

export interface WaterAdvisoryInput {
  crop: string;
  irrigation: string;
  season: string;
  plannedWater: number;
}

/** Compares a planned water volume against matching records in agriculture_dataset.csv. */
export function getWaterAdvisory(input: WaterAdvisoryInput): Advisory {
  const matches = farms.filter(
    (f) =>
      f.crop === input.crop && f.irrigation === input.irrigation && f.season === input.season,
  );
  const cropMatches = farms.filter((f) => f.crop === input.crop);
  const basis: Farm[] = matches.length ? matches : cropMatches.length ? cropMatches : farms;
  const basisLabel = matches.length
    ? `${matches.length} ${input.crop} farm(s) using ${input.irrigation} irrigation in ${input.season}`
    : cropMatches.length
      ? `${cropMatches.length} ${input.crop} farm(s) in the dataset`
      : `all ${farms.length} farms in the dataset`;

  const avgWater = mean(basis.map((f) => f.water));
  const ratio = avgWater ? input.plannedWater / avgWater : 1;
  const risk: RiskLevel = ratio >= 1.25 ? "High" : ratio >= 1.05 ? "Moderate" : "Low";

  const actions: string[] = [];
  if (risk === "High") {
    actions.push(
      `Planned use is about ${Math.round((ratio - 1) * 100)}% above the dataset average for this combination.`,
    );
    actions.push("Review irrigation scheduling and check for leaks or uneven emitter flow.");
  } else if (risk === "Moderate") {
    actions.push("Planned use is slightly above the historical average for comparable farms.");
  } else {
    actions.push("Planned use is in line with or below comparable historical records.");
  }

  const dripAvg = mean(
    farms.filter((f) => f.crop === input.crop && f.irrigation === "Drip").map((f) => f.water),
  );
  if (dripAvg && input.irrigation !== "Drip" && dripAvg < avgWater) {
    actions.push(
      `Dataset records for ${input.crop} under drip irrigation average ${formatCompact(dripAvg)} m³ — lower than the ${formatCompact(avgWater)} m³ average for your selection.`,
    );
  }

  return {
    icon: risk === "Low" ? "💧" : "⚠️",
    heading: `Water use vs dataset: ${risk} deviation`,
    risk,
    message: `Compared against ${basisLabel} in agriculture_dataset.csv. This is a historical comparison, not a live soil-moisture reading.`,
    actions,
    facts: [
      { label: "Your planned usage", value: `${formatNumber(input.plannedWater, 0)} m³` },
      { label: "Dataset average", value: `${formatNumber(avgWater, 0)} m³` },
      { label: "Records compared", value: String(basis.length) },
    ],
  };
}

/* ------------------------------ crop advisory ----------------------------- */

export interface CropQuery {
  crop: string;
  state: string;
  season: string;
}

/** Summarises historical records for a crop from crop_yield.csv + agriculture_dataset.csv. */
export function getCropAdvisory(q: CropQuery): Advisory {
  const rows = cropYieldRows.filter(
    (r) =>
      r.crop === q.crop &&
      (q.state === "All" || r.state === q.state) &&
      (q.season === "All" || r.season === q.season),
  );

  if (!rows.length) {
    return {
      icon: "🌾",
      heading: "No matching historical records",
      risk: "Low",
      message:
        "crop_yield.csv contains no records for this crop, state and season combination, so no statistics can be calculated. Data not available.",
      actions: ["Try a wider selection, for example 'All' states or 'All' seasons."],
    };
  }

  const avgYield = mean(rows.map((r) => r.yield));
  const allCropAvg = mean(cropYieldRows.filter((r) => r.crop === q.crop).map((r) => r.yield));
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
  const recent = rows.filter((r) => r.year >= (years[years.length - 3] ?? 0));
  const early = rows.filter((r) => r.year <= (years[2] ?? 0));
  const trend = mean(recent.map((r) => r.yield)) - mean(early.map((r) => r.yield));

  const ratio = allCropAvg ? avgYield / allCropAvg : 1;
  const risk: RiskLevel = ratio < 0.75 ? "High" : ratio < 0.95 ? "Moderate" : "Low";

  const bestState = groupAggregate(
    cropYieldRows.filter((r) => r.crop === q.crop),
    (r) => r.state,
    (r) => r.yield,
    "avg",
  )[0];

  const actions: string[] = [];
  actions.push(
    trend >= 0
      ? `Recorded yield trended up by ${formatCompact(trend, 2)} over the dataset period for this selection.`
      : `Recorded yield trended down by ${formatCompact(Math.abs(trend), 2)} over the dataset period for this selection.`,
  );
  if (bestState) {
    actions.push(
      `Highest recorded average for ${q.crop} is in ${bestState.name} at ${formatCompact(bestState.value, 2)}.`,
    );
  }
  actions.push(
    "These are historical dataset statistics — combine them with local agronomy advice before planning.",
  );

  const agri = farms.filter((f) => f.crop.toLowerCase() === q.crop.toLowerCase());
  if (agri.length) {
    actions.push(
      `agriculture_dataset.csv holds ${agri.length} farm record(s) for ${q.crop}, averaging ${formatNumber(mean(agri.map((f) => f.fertilizer)), 2)} t fertilizer and ${formatNumber(mean(agri.map((f) => f.water)), 0)} m³ water.`,
    );
  }

  return {
    icon: risk === "Low" ? "🌾" : "⚠️",
    heading: `Recorded yield vs crop average: ${risk} gap`,
    risk,
    message: `Based on ${rows.length} historical records for ${q.crop} in crop_yield.csv (${years[0]}–${years[years.length - 1]}). Historical dataset information, not a live field measurement.`,
    actions,
    facts: [
      { label: "Records matched", value: formatNumber(rows.length, 0) },
      { label: "Average yield (selection)", value: formatCompact(avgYield, 2) },
      { label: "Average yield (all states)", value: formatCompact(allCropAvg, 2) },
      { label: "Total production", value: formatCompact(rows.reduce((s, r) => s + r.production, 0)) },
    ],
  };
}

/* --------------------------- livestock advisory --------------------------- */

export interface LivestockAdvisory extends Advisory {
  match: LivestockMatchResult;
}

/** Dataset lookup against animal_disease_dataset.csv — never a diagnosis. */
export function getLivestockAdvisory(
  animal: string,
  symptoms: string[],
): LivestockAdvisory {
  const match = matchLivestockRecords(animal, symptoms);
  const top = match.matches[0];
  const share = top?.share ?? 0;
  const risk: RiskLevel =
    !symptoms.length ? "Low" : share >= 60 ? "High" : share >= 35 ? "Moderate" : "Low";

  const actions: string[] = [];
  if (!symptoms.length) {
    actions.push("Select at least one observed symptom to search the historical records.");
  } else {
    if (!match.exact) {
      actions.push(
        "No record contains all selected symptoms together — results below cover records sharing at least one of them.",
      );
    }
    actions.push("Record today's observation, temperature and feed intake in the animal's log.");
    actions.push("Isolate the affected animal if it is safe and practical to do so.");
    actions.push("Consult a qualified veterinarian — a dataset match is not a diagnosis.");
  }

  return {
    icon: "🐄",
    heading: "Dataset-based risk match",
    risk,
    message: symptoms.length
      ? `${formatNumber(match.matchedRecords, 0)} historical ${animal.toLowerCase()} record(s) in animal_disease_dataset.csv share these symptoms. Possible condition based on historical dataset matches — not a confirmed veterinary diagnosis.`
      : `animal_disease_dataset.csv holds ${formatNumber(livestockData.total, 0)} records. Choose the symptoms you can see to search them.`,
    actions,
    facts: top
      ? [
          { label: "Most frequent match", value: top.disease },
          { label: "Share of matched records", value: `${top.share.toFixed(1)}%` },
          { label: "Avg recorded temperature", value: `${top.avgTemperature.toFixed(1)} °F` },
          { label: "Avg recorded age", value: `${top.avgAge.toFixed(1)} yrs` },
        ]
      : [],
    match,
  };
}

/* --------------------------------- alerts --------------------------------- */

export interface DatasetAlert {
  id: string;
  icon: string;
  title: string;
  body: string;
  severity: "high" | "medium" | "low";
  source: string;
}

function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[i] ?? 0;
}

/** Alerts derived only from thresholds calculated on the uploaded datasets. */
export function buildDatasetAlerts(): DatasetAlert[] {
  const out: DatasetAlert[] = [];

  const waterP90 = percentile(farms.map((f) => f.water), 90);
  farms
    .filter((f) => f.water >= waterP90)
    .sort((a, b) => b.water - a.water)
    .slice(0, 3)
    .forEach((f) =>
      out.push({
        id: `water-${f.farmId}`,
        icon: "💧",
        title: `High water usage recorded — ${f.farmId}`,
        body: `${formatNumber(f.water, 0)} m³ on ${formatNumber(f.area, 1)} acres of ${f.crop} (${f.irrigation}). That is in the top 10% of recorded water usage across the ${farms.length} farms in the dataset.`,
        severity: "high",
        source: "agriculture_dataset.csv",
      }),
    );

  const yieldP10 = percentile(farms.map((f) => f.yield), 10);
  farms
    .filter((f) => f.yield <= yieldP10)
    .sort((a, b) => a.yield - b.yield)
    .slice(0, 3)
    .forEach((f) =>
      out.push({
        id: `yield-${f.farmId}`,
        icon: "🌾",
        title: `Low recorded yield — ${f.farmId}`,
        body: `${formatNumber(f.yield, 2)} t of ${f.crop} on ${f.soil} soil, against a dataset average of ${formatNumber(farmStats.avgYield, 2)} t. This sits in the bottom 10% of recorded yields.`,
        severity: "medium",
        source: "agriculture_dataset.csv",
      }),
    );

  const fertP90 = percentile(farms.map((f) => f.fertilizer), 90);
  farms
    .filter((f) => f.fertilizer >= fertP90)
    .sort((a, b) => b.fertilizer - a.fertilizer)
    .slice(0, 2)
    .forEach((f) =>
      out.push({
        id: `fert-${f.farmId}`,
        icon: "🌱",
        title: `High fertilizer use recorded — ${f.farmId}`,
        body: `${formatNumber(f.fertilizer, 2)} t applied against a dataset average of ${formatNumber(farmStats.avgFertilizer, 2)} t, with a recorded yield of ${formatNumber(f.yield, 2)} t.`,
        severity: "medium",
        source: "agriculture_dataset.csv",
      }),
    );

  livestockData.animalDistribution.forEach((a) => {
    const row = livestockData.diseaseByAnimal.find((r) => r["animal"] === a.name);
    if (!row) return;
    const entries = Object.entries(row).filter(([k]) => k !== "animal") as [string, number][];
    const top = entries.sort((x, y) => y[1] - x[1])[0];
    if (!top) return;
    const share = (top[1] / a.value) * 100;
    out.push({
      id: `animal-${a.name}`,
      icon: "🐄",
      title: `${top[0]} is the most recorded condition for ${a.name.toLowerCase()}s`,
      body: `${formatNumber(top[1], 0)} of ${formatNumber(a.value, 0)} ${a.name.toLowerCase()} records (${share.toFixed(1)}%) list ${top[0].toLowerCase()}. Use the livestock symptom search before calling your vet.`,
      severity: share >= 30 ? "high" : "low",
      source: "animal_disease_dataset.csv",
    });
  });

  return out;
}

export const datasetAlerts = buildDatasetAlerts();
