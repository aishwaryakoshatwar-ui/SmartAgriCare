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
    return cells.map((c) => c.trim());
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
  console.log("agriculture rows", farms.length);
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
    const crop = r[0].replace(/\s+/g, " ").trim();
    const season = r[2].replace(/\s+/g, " ").trim();
    const state = r[3].replace(/\s+/g, " ").trim();
    out.push([
      idx(crops, crop),
      Number(r[1]),
      idx(seasons, season),
      idx(states, state),
      round(Number(r[4]), 0),
      round(Number(r[5]), 0),
      round(Number(r[6]), 0),
      round(Number(r[7]), 0),
      round(Number(r[8]), 4),
    ]);
  }
  crops.sort();
  states.sort();
  // re-index after sorting is complex; keep insertion order instead
  writeFileSync(
    `${OUT}/crop-yield.json`,
    JSON.stringify({ crops: undefined }),
  );
  console.log("placeholder", out.length);
}
