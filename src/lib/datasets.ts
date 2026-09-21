/**
 * Real dataset access layer for SmartAgriCare.
 *
 * All values here are derived from the three Kaggle CSVs uploaded for this
 * project and pre-processed into src/data/*.json by scripts/build-datasets.ts.
 * Nothing in this file is synthetic: if a metric cannot be computed from the
 * datasets, callers should show "Data not available" rather than invent one.
 */
import agricultureJson from "@/data/agriculture.json";
import cropYieldJson from "@/data/crop-yield.json";
import livestockJson from "@/data/livestock.json";

export const DATA_SOURCE_NOTE =
  "Data source: Kaggle datasets uploaded for SmartAgriCare. Values are based on historical dataset records and are not live farm sensor readings.";

export const NOT_AVAILABLE = "Data not available";

/* ------------------------------ dataset 1 -------------------------------- */

export interface Farm {
  farmId: string;
  crop: string;
  area: number;
  irrigation: string;
  fertilizer: number;
  pesticide: number;
  yield: number;
  soil: string;
  season: string;
  water: number;
}

export const farms = agricultureJson as Farm[];

const mean = (values: number[]) =>
  values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);

export const farmStats = {
  count: farms.length,
  totalArea: sum(farms.map((f) => f.area)),
  totalWater: sum(farms.map((f) => f.water)),
  totalFertilizer: sum(farms.map((f) => f.fertilizer)),
  totalPesticide: sum(farms.map((f) => f.pesticide)),
  totalYield: sum(farms.map((f) => f.yield)),
  avgArea: mean(farms.map((f) => f.area)),
  avgWater: mean(farms.map((f) => f.water)),
  avgFertilizer: mean(farms.map((f) => f.fertilizer)),
  avgPesticide: mean(farms.map((f) => f.pesticide)),
  avgYield: mean(farms.map((f) => f.yield)),
  cropTypes: [...new Set(farms.map((f) => f.crop))].sort(),
  soilTypes: [...new Set(farms.map((f) => f.soil))].sort(),
  irrigationTypes: [...new Set(farms.map((f) => f.irrigation))].sort(),
  seasons: [...new Set(farms.map((f) => f.season))].sort(),
};

type Agg = "sum" | "avg" | "count";

/** Group rows by a string key and aggregate one numeric field. */
export function groupAggregate<T>(
  rows: T[],
  keyOf: (row: T) => string,
  valueOf: (row: T) => number,
  agg: Agg = "sum",
): { name: string; value: number; count: number }[] {
  const buckets = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const key = keyOf(row);
    const bucket = buckets.get(key) ?? { total: 0, count: 0 };
    bucket.total += valueOf(row);
    bucket.count += 1;
    buckets.set(key, bucket);
  }
  return [...buckets.entries()]
    .map(([name, b]) => ({
      name,
      count: b.count,
      value: agg === "sum" ? b.total : agg === "avg" ? b.total / b.count : b.count,
    }))
    .sort((a, b) => b.value - a.value);
}

/* ------------------------------ dataset 3 -------------------------------- */

export interface CropYieldRow {
  crop: string;
  year: number;
  season: string;
  state: string;
  area: number;
  production: number;
  fertilizer: number;
  pesticide: number;
  yield: number;
}

const cy = cropYieldJson as {
  crops: string[];
  seasons: string[];
  states: string[];
  rows: number[][];
};

export const cropYieldRows: CropYieldRow[] = cy.rows.map((r) => ({
  crop: cy.crops[r[0]]!,
  year: r[1]!,
  season: cy.seasons[r[2]]!,
  state: cy.states[r[3]]!,
  area: r[4]!,
  production: r[5]!,
  fertilizer: r[6]!,
  pesticide: r[7]!,
  yield: r[8]!,
}));

export const cropYieldOptions = {
  crops: [...cy.crops].sort(),
  seasons: [...cy.seasons].sort(),
  states: [...cy.states].sort(),
  years: [...new Set(cropYieldRows.map((r) => r.year))].sort((a, b) => a - b),
};

export interface CropYieldFilter {
  crop?: string;
  season?: string;
  state?: string;
  year?: string;
}

export const ALL = "All";

export function filterCropYield(f: CropYieldFilter): CropYieldRow[] {
  return cropYieldRows.filter(
    (r) =>
      (!f.crop || f.crop === ALL || r.crop === f.crop) &&
      (!f.season || f.season === ALL || r.season === f.season) &&
      (!f.state || f.state === ALL || r.state === f.state) &&
      (!f.year || f.year === ALL || String(r.year) === f.year),
  );
}

/** Bucket rows into bands of an input field and report the average yield per band. */
export function yieldByInputBand(
  rows: CropYieldRow[],
  field: "fertilizer" | "pesticide",
  bands = 6,
): { name: string; value: number; count: number }[] {
  if (!rows.length) return [];
  const values = rows.map((r) => r[field]).sort((a, b) => a - b);
  const max = values[Math.floor(values.length * 0.95)] || values[values.length - 1] || 1;
  const step = max / bands;
  const compact = (n: number) => formatCompact(n);
  return groupAggregate(
    rows,
    (r) => {
      const i = Math.min(bands - 1, Math.floor(r[field] / step));
      return `${compact(i * step)}–${compact((i + 1) * step)}`;
    },
    (r) => r.yield,
    "avg",
  ).sort((a, b) => parseBandStart(a.name) - parseBandStart(b.name));
}

function parseBandStart(name: string) {
  const raw = name.split("–")[0] ?? "0";
  const mult = raw.endsWith("B") ? 1e9 : raw.endsWith("M") ? 1e6 : raw.endsWith("K") ? 1e3 : 1;
  return parseFloat(raw) * mult;
}

/* ------------------------------ dataset 2 -------------------------------- */

const ls = livestockJson as {
  total: number;
  avgTemperature: number;
  avgAge: number;
  animals: string[];
  diseases: string[];
  symptoms: string[];
  animalCounts: number[];
  diseaseCounts: number[];
  diseaseByAnimal: number[][];
  ageHistogram: { age: number; n: number }[];
  tempHistogram: { bin: number; n: number }[];
  combos: { a: number; s: number[]; d: number; n: number; t: number; g: number }[];
};

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const livestockData = {
  total: ls.total,
  avgTemperature: ls.avgTemperature,
  avgAge: ls.avgAge,
  animals: ls.animals.map(title),
  diseases: ls.diseases.map(title),
  symptoms: [...ls.symptoms].sort(),
  animalDistribution: ls.animals
    .map((a, i) => ({ name: title(a), value: ls.animalCounts[i]! }))
    .sort((x, y) => y.value - x.value),
  diseaseDistribution: ls.diseases
    .map((d, i) => ({ name: title(d), value: ls.diseaseCounts[i]! }))
    .sort((x, y) => y.value - x.value),
  diseaseByAnimal: ls.animals.map((a, ai) => {
    const row: Record<string, string | number> = { animal: title(a) };
    ls.diseases.forEach((d, di) => {
      row[title(d)] = ls.diseaseByAnimal[ai]![di]!;
    });
    return row;
  }),
  ageHistogram: ls.ageHistogram.map((r) => ({ name: `${r.age}`, value: r.n })),
  tempHistogram: ls.tempHistogram.map((r) => ({ name: r.bin.toFixed(1), value: r.n })),
};

export interface DatasetMatch {
  disease: string;
  records: number;
  share: number;
  avgTemperature: number;
  avgAge: number;
}

export interface LivestockMatchResult {
  matchedRecords: number;
  exact: boolean;
  matches: DatasetMatch[];
  animal: string;
  symptoms: string[];
}

/**
 * Finds historical records in animal_disease_dataset.csv whose symptom set
 * contains every selected symptom. This is a dataset lookup, never a diagnosis.
 */
export function matchLivestockRecords(
  animal: string,
  selectedSymptoms: string[],
): LivestockMatchResult {
  const animalIdx = ls.animals.indexOf(animal.toLowerCase());
  const symptomIdx = selectedSymptoms
    .map((s) => ls.symptoms.indexOf(s))
    .filter((i) => i >= 0);

  const relevant = ls.combos.filter((c) => animalIdx < 0 || c.a === animalIdx);
  let hits = relevant.filter((c) => symptomIdx.every((s) => c.s.includes(s)));
  let exact = true;
  if (!hits.length && symptomIdx.length) {
    // fall back to records sharing at least one selected symptom
    hits = relevant.filter((c) => symptomIdx.some((s) => c.s.includes(s)));
    exact = false;
  }

  const byDisease = new Map<number, { n: number; t: number; g: number }>();
  for (const c of hits) {
    const b = byDisease.get(c.d) ?? { n: 0, t: 0, g: 0 };
    b.n += c.n;
    b.t += c.t * c.n;
    b.g += c.g * c.n;
    byDisease.set(c.d, b);
  }
  const matchedRecords = [...byDisease.values()].reduce((s, b) => s + b.n, 0);

  const matches: DatasetMatch[] = [...byDisease.entries()]
    .map(([d, b]) => ({
      disease: title(ls.diseases[d]!),
      records: b.n,
      share: matchedRecords ? (b.n / matchedRecords) * 100 : 0,
      avgTemperature: b.n ? b.t / b.n : 0,
      avgAge: b.n ? b.g / b.n : 0,
    }))
    .sort((a, b) => b.records - a.records);

  return { matchedRecords, exact, matches, animal, symptoms: selectedSymptoms };
}

/* ------------------------------ formatting -------------------------------- */

export function formatCompact(n: number, digits = 1): string {
  if (!isFinite(n)) return NOT_AVAILABLE;
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(digits)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(digits)}K`;
  return n.toFixed(abs < 10 ? digits : 0);
}

export function formatNumber(n: number, digits = 2): string {
  if (!isFinite(n)) return NOT_AVAILABLE;
  return n.toLocaleString("en-IN", { maximumFractionDigits: digits });
}
