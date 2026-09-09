/**
 * SmartAgriCare sample data + rule-based decision-support logic.
 *
 * ALL data in this file is ILLUSTRATIVE sample data, not real farm readings.
 * The recommendation functions are deterministic rule-based helpers designed to
 * be swapped later for a real backend/ML service (e.g. Python/FastAPI) without
 * changing the UI: keep the input/output shapes below stable.
 */

export const SAMPLE_NOTE = "Illustrative sample data — not real farm readings.";

export const MODEL_METRICS = [
  { name: "Crop disease model", accuracy: "—", precision: "—", recall: "—" },
  { name: "Water stress model", accuracy: "—", precision: "—", recall: "—" },
  { name: "Livestock risk model", accuracy: "—", precision: "—", recall: "—" },
] as const;

export const farmSummary = {
  cropHealth: 82,
  soilStatus: "Moderate",
  waterLevel: 46,
  animals: 24,
  animalAlerts: 2,
};

export const weatherNow = {
  location: "Demo Farm, Sample District",
  temperature: 34,
  humidity: 58,
  rainProbability: 20,
  condition: "Partly cloudy",
  wind: 12,
};

export const weatherForecast = [
  { day: "Mon", high: 34, low: 24, rain: 20 },
  { day: "Tue", high: 36, low: 25, rain: 10 },
  { day: "Wed", high: 37, low: 26, rain: 5 },
  { day: "Thu", high: 33, low: 24, rain: 55 },
  { day: "Fri", high: 30, low: 23, rain: 80 },
  { day: "Sat", high: 31, low: 23, rain: 40 },
  { day: "Sun", high: 33, low: 24, rain: 15 },
];

export const yieldTrend = [
  { season: "2021", yield: 3.1 },
  { season: "2022", yield: 3.4 },
  { season: "2023", yield: 3.2 },
  { season: "2024", yield: 3.9 },
  { season: "2025", yield: 4.1 },
  { season: "2026", yield: 4.4 },
];

export const predictedYield = [
  { crop: "Wheat", yield: 4.2 },
  { crop: "Rice", yield: 5.1 },
  { crop: "Soybean", yield: 2.6 },
  { crop: "Cotton", yield: 1.9 },
  { crop: "Maize", yield: 4.8 },
];

export const soilMoistureDay = [
  { time: "8AM", moisture: 42 },
  { time: "9AM", moisture: 41 },
  { time: "10AM", moisture: 39 },
  { time: "11AM", moisture: 36 },
  { time: "12PM", moisture: 33 },
  { time: "1PM", moisture: 31 },
  { time: "2PM", moisture: 29 },
  { time: "3PM", moisture: 28 },
  { time: "4PM", moisture: 27 },
];

export const diseaseRisk = [
  { level: "Healthy", plots: 12 },
  { level: "Low", plots: 6 },
  { level: "Medium", plots: 3 },
  { level: "High", plots: 1 },
];

export const expenses = [
  { category: "Seeds", amount: 18000 },
  { category: "Fertilizer", amount: 26500 },
  { category: "Water", amount: 9400 },
  { category: "Feed", amount: 31000 },
  { category: "Medicine", amount: 7600 },
  { category: "Other", amount: 11200 },
];

export const soilReadings = [
  { plot: "Plot A", ph: 6.4, moisture: 31, n: 42, p: 18, k: 120 },
  { plot: "Plot B", ph: 7.8, moisture: 48, n: 60, p: 26, k: 150 },
  { plot: "Plot C", ph: 5.4, moisture: 22, n: 28, p: 12, k: 95 },
];

export const livestock = [
  { id: "C-101", type: "Cow", age: "4 yrs", status: "Healthy", lastCheck: "12 Aug 2026" },
  { id: "C-108", type: "Cow", age: "6 yrs", status: "Watch", lastCheck: "28 Aug 2026" },
  { id: "B-204", type: "Buffalo", age: "3 yrs", status: "Healthy", lastCheck: "02 Sep 2026" },
  { id: "G-317", type: "Goat", age: "2 yrs", status: "Alert", lastCheck: "06 Sep 2026" },
];

export const vaccinations = [
  { animal: "C-101", vaccine: "FMD booster", due: "20 Sep 2026", status: "Upcoming" },
  { animal: "B-204", vaccine: "Deworming", due: "11 Sep 2026", status: "Due soon" },
  { animal: "G-317", vaccine: "PPR vaccine", due: "02 Sep 2026", status: "Overdue" },
];

export const vets = [
  { name: "Dr. A. Sharma", role: "Large animal veterinarian", phone: "+91 90000 00001" },
  { name: "District Veterinary Hospital", role: "24x7 emergency care", phone: "+91 90000 00002" },
  { name: "Livestock Helpline", role: "Government advisory line", phone: "1962" },
];

export const alerts = [
  {
    id: 1,
    icon: "💧",
    title: "Soil moisture below threshold — Plot C",
    body: "Moisture at 22% against a 30% configured threshold. Consider irrigation.",
    severity: "high" as const,
    time: "20 min ago",
  },
  {
    id: 2,
    icon: "🌦️",
    title: "Heavy rain expected Friday",
    body: "80% rain probability. Plan to postpone spraying and check field drainage.",
    severity: "medium" as const,
    time: "2 hours ago",
  },
  {
    id: 3,
    icon: "🐄",
    title: "Animal G-317 flagged for follow-up",
    body: "Logged symptoms suggest a possible health risk. Veterinary review recommended.",
    severity: "high" as const,
    time: "5 hours ago",
  },
  {
    id: 4,
    icon: "🌱",
    title: "Plot C soil pH is acidic",
    body: "pH 5.4. A liming or organic amendment plan may help before the next sowing.",
    severity: "medium" as const,
    time: "Yesterday",
  },
  {
    id: 5,
    icon: "💰",
    title: "Fertilizer spend above seasonal average",
    body: "Fertilizer is 26% of tracked costs. Review split-dose application to reduce waste.",
    severity: "low" as const,
    time: "2 days ago",
  },
];

/* ----------------------------- decision support ----------------------------- */

export type RiskLevel = "Low" | "Moderate" | "High";

export interface CropAdvisoryInput {
  crop: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  rainfallOutlook: "none" | "light" | "heavy";
}

export interface Advisory {
  icon: string;
  heading: string;
  risk: RiskLevel;
  message: string;
  actions: string[];
}

/** Rule-based stand-in for a future water-stress model. */
export function getCropAdvisory(input: CropAdvisoryInput): Advisory {
  let score = 0;
  if (input.soilMoisture < 25) score += 3;
  else if (input.soilMoisture < 35) score += 2;
  else if (input.soilMoisture < 45) score += 1;

  if (input.temperature >= 38) score += 2;
  else if (input.temperature >= 32) score += 1;

  if (input.humidity < 35) score += 1;
  if (input.rainfallOutlook === "none") score += 1;
  if (input.rainfallOutlook === "heavy") score -= 2;

  const risk: RiskLevel = score >= 5 ? "High" : score >= 3 ? "Moderate" : "Low";
  const actions: string[] = [];

  if (risk === "High") {
    actions.push("Consider irrigation within the next 24 hours if water is available.");
    actions.push("Irrigate early morning or evening to reduce evaporation losses.");
  } else if (risk === "Moderate") {
    actions.push("Re-check soil moisture this evening before deciding on irrigation.");
    actions.push("Mulching may help the field retain moisture.");
  } else {
    actions.push("Current readings suggest no immediate irrigation is needed.");
  }

  if (input.rainfallOutlook === "heavy") {
    actions.push("Rain is expected — check drainage and hold back on irrigation.");
  }
  if (input.humidity > 75 && input.temperature > 26) {
    actions.push(
      `Warm and humid conditions can favour fungal disease in ${input.crop.toLowerCase()} — scout leaves for early spots.`,
    );
  }

  return {
    icon: risk === "Low" ? "🌾" : "⚠️",
    heading: `Water Stress Risk: ${risk}`,
    risk,
    message:
      risk === "Low"
        ? `Reported conditions for ${input.crop} look stable. Keep monitoring soil moisture and the weather outlook.`
        : `Soil moisture is below the configured comfort range and current weather conditions indicate increased water stress for ${input.crop}. Consider irrigation and continue monitoring soil moisture.`,
    actions,
  };
}

export interface LivestockAdvisoryInput {
  animalType: string;
  symptoms: string[];
  duration: "under-1-day" | "1-3-days" | "over-3-days";
  notes?: string;
}

export const LIVESTOCK_SYMPTOMS = [
  "Reduced feed intake",
  "Fever / warm to touch",
  "Lethargy",
  "Coughing",
  "Nasal discharge",
  "Limping",
  "Drop in milk yield",
  "Diarrhoea",
  "Skin lesions",
] as const;

const HIGH_SIGNAL = new Set([
  "Fever / warm to touch",
  "Diarrhoea",
  "Nasal discharge",
  "Skin lesions",
]);

/** Rule-based stand-in for a future livestock risk model. Never a diagnosis. */
export function getLivestockAdvisory(input: LivestockAdvisoryInput): Advisory {
  let score = input.symptoms.length;
  score += input.symptoms.filter((s) => HIGH_SIGNAL.has(s)).length;
  if (input.duration === "1-3-days") score += 1;
  if (input.duration === "over-3-days") score += 2;

  const risk: RiskLevel = score >= 5 ? "High" : score >= 2 ? "Moderate" : "Low";
  const actions = [
    "Record today's observation in the animal's health log.",
    "Ensure clean drinking water and comfortable shade or shelter.",
  ];
  if (risk !== "Low") {
    actions.unshift("Isolate the affected animal if it is safe and practical to do so.");
    actions.push("Consult a qualified veterinarian for examination and advice.");
  }
  if (input.symptoms.includes("Drop in milk yield")) {
    actions.push("Note milk yield daily so a vet can see the trend.");
  }

  return {
    icon: "🐄",
    heading: "Livestock Health Alert",
    risk,
    message:
      risk === "Low"
        ? `The entered observations for the ${input.animalType.toLowerCase()} are limited. Keep monitoring and log any change — this is decision support, not a diagnosis.`
        : `The entered symptoms indicate a potential health risk for this ${input.animalType.toLowerCase()}. Isolate the affected animal if appropriate and consult a qualified veterinarian. This is decision support, not a diagnosis.`,
    actions,
  };
}

export interface SoilInput {
  ph: number;
  moisture: number;
  n: number;
  p: number;
  k: number;
}

export function getSoilAssessment(input: SoilInput) {
  const notes: string[] = [];
  let score = 100;

  if (input.ph < 5.8) {
    score -= 25;
    notes.push("Soil is acidic. Liming or compost may help move pH towards 6.0–7.0.");
  } else if (input.ph > 7.6) {
    score -= 20;
    notes.push("Soil is alkaline. Organic matter or gypsum may help balance pH.");
  } else {
    notes.push("pH is within a generally favourable range for most field crops.");
  }

  if (input.moisture < 25) {
    score -= 20;
    notes.push("Moisture is low — irrigation may be needed before the next growth stage.");
  } else if (input.moisture > 65) {
    score -= 10;
    notes.push("Moisture is high — check drainage to avoid waterlogging.");
  }

  if (input.n < 40) {
    score -= 15;
    notes.push("Nitrogen looks low. Consider a split urea dose or a legume cover crop.");
  }
  if (input.p < 15) {
    score -= 10;
    notes.push("Phosphorus looks low. A DAP or rock phosphate top-up may be considered.");
  }
  if (input.k < 110) {
    score -= 10;
    notes.push("Potassium looks low. Muriate of potash or wood ash may be considered.");
  }

  score = Math.max(10, Math.min(100, score));
  const status = score >= 75 ? "Good" : score >= 50 ? "Moderate" : "Needs attention";
  return { score, status, notes };
}

export const cropSuitability: Record<string, string[]> = {
  "Acidic (pH < 6)": ["Rice", "Groundnut", "Potato"],
  "Neutral (pH 6–7.5)": ["Wheat", "Maize", "Soybean", "Cotton"],
  "Alkaline (pH > 7.5)": ["Barley", "Mustard", "Sugarbeet"],
};

export const cropDiseaseGuide = [
  {
    crop: "Wheat",
    disease: "Yellow rust",
    signs: "Yellow-orange stripes along leaf veins",
    note: "Common in cool, humid spells. Field confirmation by an agronomist is advised.",
  },
  {
    crop: "Rice",
    disease: "Blast",
    signs: "Diamond-shaped grey lesions on leaves",
    note: "Favoured by high humidity and dense canopy.",
  },
  {
    crop: "Cotton",
    disease: "Leaf curl",
    signs: "Upward curling and thickened veins",
    note: "Whitefly-linked. Monitor pest counts weekly.",
  },
  {
    crop: "Maize",
    disease: "Fall armyworm damage",
    signs: "Ragged holes and sawdust-like frass in whorls",
    note: "Scout whorls early morning for larvae.",
  },
];
