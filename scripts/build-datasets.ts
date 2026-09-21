/**
 * Builds compact JSON datasets in src/data/ from the uploaded Kaggle CSVs.
 * Run: bun scripts/build-datasets.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SRC = "/mnt/user-uploads";
const OUT = "src/data";
mkdirSync(OUT, { recursive: true });

function parseCsv(path: string): string[][] {
  const text = readFileSync(path, "utf8").trim();
  return text.split(/\r?\n/).map((line) => {
    const cells: string[] = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    return cells.map((c) => c.replace(/\s+/g, " ").trim());
  });
}

const round = (n: number, d = 2) => Number(n.toFixed(d));

/* ------------------------------- dataset 1 ------------------------------- */
{
  const [, ...rows] = parseCsv(`${SRC}/agriculture_dataset.csv`);
  const farms = rows
    .filter((r) => r[0])
    .map((r) => ({
      farmId: r[0],
      crop: r[1],
      area: Number(r[2]),
      irrigation: r[3],
      fertilizer: Number(r[4]),
      pesticide: Number(r[5]),
      yield: Number(r[6]),
      soil: r[7],
      season: r[8],
      water: Number(r[9]),
    }));
  writeFileSync(`${OUT}/agriculture.json`, JSON.stringify(farms));
  console.log("agriculture rows:", farms.length);
}

/* ------------------------------- dataset 3 ------------------------------- */
{
  const [, ...rows] = parseCsv(`${SRC}/crop_yield.csv`);
  const crops: string[] = [];
  const states: string[] = [];
  const seasons: string[] = [];
  const idx = (arr: string[], v: string) => {
    let i = arr.indexOf(v);
    if (i === -1) i = arr.push(v) - 1;
    return i;
  };
  const out: number[][] = [];
  for (const r of rows) {
    if (!r[0] || r.length < 9) continue;
    out.push([
      idx(crops, r[0]),
      Number(r[1]),
      idx(seasons, r[2]),
      idx(states, r[3]),
      round(Number(r[4]), 0),
      round(Number(r[5]), 0),
      round(Number(r[6]), 0),
      round(Number(r[7]), 0),
      round(Number(r[8]), 3),
    ]);
  }
  writeFileSync(
    `${OUT}/crop-yield.json`,
    JSON.stringify({ crops, seasons, states, rows: out }),
  );
  console.log("crop yield rows:", out.length, "crops:", crops.length, "states:", states.length);
}

/* ------------------------------- dataset 2 ------------------------------- */
{
  const [, ...rows] = parseCsv(`${SRC}/animal_disease_dataset.csv`);
  const animals: string[] = [];
  const diseases: string[] = [];
  const symptoms: string[] = [];
  const idx = (arr: string[], v: string) => {
    let i = arr.indexOf(v);
    if (i === -1) i = arr.push(v) - 1;
    return i;
  };

  const ageCount = new Map<number, number>();
  const tempCount = new Map<number, number>();
  const animalCount = new Map<number, number>();
  const diseaseCount = new Map<number, number>();
  const pairCount = new Map<string, number>();
  const combos = new Map<string, { a: number; s: number[]; d: number; n: number; t: number; g: number }>();
  let total = 0;
  let tempSum = 0;
  let ageSum = 0;

  for (const r of rows) {
    if (!r[0] || r.length < 7) continue;
    total++;
    const a = idx(animals, r[0]);
    const age = Number(r[1]);
    const temp = Number(r[2]);
    const s = [r[3], r[4], r[5]].filter(Boolean).map((x) => idx(symptoms, x));
    const d = idx(diseases, r[6]);
    tempSum += temp;
    ageSum += age;
    ageCount.set(age, (ageCount.get(age) ?? 0) + 1);
    const bin = Math.floor(temp * 2) / 2;
    tempCount.set(bin, (tempCount.get(bin) ?? 0) + 1);
    animalCount.set(a, (animalCount.get(a) ?? 0) + 1);
    diseaseCount.set(d, (diseaseCount.get(d) ?? 0) + 1);
    pairCount.set(`${a}|${d}`, (pairCount.get(`${a}|${d}`) ?? 0) + 1);

    const sorted = [...new Set(s)].sort((x, y) => x - y);
    const key = `${a}|${sorted.join(",")}|${d}`;
    const c = combos.get(key);
    if (c) {
      c.n++;
      c.t += temp;
      c.g += age;
    } else {
      combos.set(key, { a, s: sorted, d, n: 1, t: temp, g: age });
    }
  }

  const payload = {
    total,
    avgTemperature: round(tempSum / total, 2),
    avgAge: round(ageSum / total, 2),
    animals,
    diseases,
    symptoms,
    animalCounts: animals.map((_, i) => animalCount.get(i) ?? 0),
    diseaseCounts: diseases.map((_, i) => diseaseCount.get(i) ?? 0),
    diseaseByAnimal: animals.map((_, a) => diseases.map((_, d) => pairCount.get(`${a}|${d}`) ?? 0)),
    ageHistogram: [...ageCount.entries()].sort((x, y) => x[0] - y[0]).map(([age, n]) => ({ age, n })),
    tempHistogram: [...tempCount.entries()].sort((x, y) => x[0] - y[0]).map(([bin, n]) => ({ bin, n })),
    combos: [...combos.values()].map((c) => ({
      a: c.a,
      s: c.s,
      d: c.d,
      n: c.n,
      t: round(c.t / c.n, 2),
      g: round(c.g / c.n, 1),
    })),
  };
  writeFileSync(`${OUT}/livestock.json`, JSON.stringify(payload));
  console.log(
    "livestock rows:",
    total,
    "symptoms:",
    symptoms.length,
    "combos:",
    payload.combos.length,
  );
}
