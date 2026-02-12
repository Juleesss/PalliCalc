/**
 * OME (Oral Morphine Equivalent) conversion engine.
 *
 * Faithful TypeScript port of the Python ome_core package.
 * All conversion factors follow the Semmelweis University Opioid Rotation Protocol.
 */

import type {
  ConversionEntry,
  FentanylPatchEntry,
  OpioidInput,
  TargetResult,
  DrugOption,
} from "./types";

// ---------------------------------------------------------------------------
// Conversion table (PRD §4)
// ---------------------------------------------------------------------------

export const CONVERSION_TABLE: ConversionEntry[] = [
  { drug: "morphine", route: "oral", factorToOme: 1.0, factorFromOme: 1.0, notes: "Reference standard" },
  { drug: "morphine", route: "sc/iv", factorToOme: 3.0, factorFromOme: 0.333, notes: "Parenteral ~3x more potent" },
  { drug: "oxycodone", route: "oral", factorToOme: 1.5, factorFromOme: 0.666, notes: "~1.5x more potent" },
  { drug: "oxycodone", route: "sc/iv", factorToOme: 3.0, factorFromOme: 0.333, notes: "SC/IV highly potent" },
  { drug: "hydromorphone", route: "oral", factorToOme: 5.0, factorFromOme: 0.2, notes: "5x more potent" },
  { drug: "tramadol", route: "oral", factorToOme: 0.1, factorFromOme: 10.0, notes: "100mg = 10mg morphine" },
  { drug: "tramadol", route: "iv", factorToOme: 0.1, factorFromOme: 10.0, notes: "100mg = 10mg morphine" },
  { drug: "dihydrocodeine", route: "oral", factorToOme: 0.1, factorFromOme: 10.0, notes: "100mg DHC = 10mg morphine" },
  { drug: "fentanyl", route: "sc/iv", factorToOme: 100.0, factorFromOme: 0.01, notes: "Use mcg↔mg carefully" },
  { drug: "fentanyl", route: "patch", factorToOme: 0, factorFromOme: 0, notes: "Use patch lookup table" },
];

export const FENTANYL_PATCH_TABLE: FentanylPatchEntry[] = [
  { mcgPerHr: 12, omeLow: 30, omeHigh: 45 },
  { mcgPerHr: 25, omeLow: 60, omeHigh: 90 },
  { mcgPerHr: 50, omeLow: 120, omeHigh: 150 },
  { mcgPerHr: 75, omeLow: 180, omeHigh: 225 },
  { mcgPerHr: 100, omeLow: 240, omeHigh: 300 },
];

export const DRUG_OPTIONS: DrugOption[] = [
  { drug: "morphine", routes: ["oral", "sc/iv"], unit: "mg" },
  { drug: "oxycodone", routes: ["oral", "sc/iv"], unit: "mg" },
  { drug: "hydromorphone", routes: ["oral"], unit: "mg" },
  { drug: "tramadol", routes: ["oral", "iv"], unit: "mg" },
  { drug: "dihydrocodeine", routes: ["oral"], unit: "mg" },
  { drug: "fentanyl", routes: ["sc/iv", "patch"], unit: "mg" },
];

export const FREQUENCY_OPTIONS = [
  { value: 1, label: "q24h (1×/day)", hours: 24 },
  { value: 2, label: "q12h (2×/day)", hours: 12 },
  { value: 3, label: "q8h (3×/day)", hours: 8 },
  { value: 4, label: "q6h (4×/day)", hours: 6 },
  { value: 6, label: "q4h (6×/day)", hours: 4 },
];

// Warning drugs
const WARNING_DRUGS: Record<string, string> = {
  methadone:
    "Methadone has a complex variable half-life (15-60h). Standard linear conversion is dangerous. Specialist consultation required.",
  nalbuphine:
    "Nalbuphine is a mixed agonist-antagonist. It can precipitate acute withdrawal in patients dependent on pure mu-agonists (e.g. fentanyl, morphine).",
  pethidine:
    "Pethidine metabolite (norpethidine) is neurotoxic. Contraindicated in renal impairment. Avoid for chronic use.",
};

// GFR drug risk
const GFR_DRUG_RISK: Record<string, string> = {
  morphine: "avoid",
  pethidine: "contraindicated",
  codeine: "contraindicated",
  dihydrocodeine: "contraindicated",
  oxycodone: "caution",
  hydromorphone: "caution",
  tramadol: "caution",
  fentanyl: "preferred",
  sufentanil: "preferred",
  methadone: "preferred",
};

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

function findEntry(drug: string, route: string): ConversionEntry {
  const d = drug.toLowerCase();
  const r = route.toLowerCase();
  const entry = CONVERSION_TABLE.find((e) => e.drug === d && e.route === r);
  if (!entry) throw new Error(`No conversion entry for ${drug} (${route})`);
  return entry;
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

export function calculateTdd(input: OpioidInput): number {
  if (input.asymmetrical) {
    return input.doses.reduce((sum, d) => sum + d, 0);
  }
  if (input.doses.length === 0) return 0;
  return input.doses[0] * input.frequency;
}

export function drugDoseToOme(drug: string, route: string, tdd: number): number {
  const entry = findEntry(drug, route);
  if (entry.drug === "fentanyl" && entry.route === "patch") {
    throw new Error("Use fentanylPatchToOme() for transdermal fentanyl");
  }
  return tdd * entry.factorToOme;
}

function patchMidpoint(entry: FentanylPatchEntry): number {
  return (entry.omeLow + entry.omeHigh) / 2;
}

export function fentanylPatchToOme(mcgPerHr: number): number {
  const table = [...FENTANYL_PATCH_TABLE].sort((a, b) => a.mcgPerHr - b.mcgPerHr);

  // Exact match
  for (const entry of table) {
    if (entry.mcgPerHr === mcgPerHr) return patchMidpoint(entry);
  }

  // Below lowest
  if (mcgPerHr < table[0].mcgPerHr) {
    return patchMidpoint(table[0]) * (mcgPerHr / table[0].mcgPerHr);
  }

  // Above highest
  if (mcgPerHr > table[table.length - 1].mcgPerHr) {
    const prev = table[table.length - 2];
    const last = table[table.length - 1];
    const slope = (patchMidpoint(last) - patchMidpoint(prev)) / (last.mcgPerHr - prev.mcgPerHr);
    return patchMidpoint(last) + slope * (mcgPerHr - last.mcgPerHr);
  }

  // Interpolation
  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (lo.mcgPerHr < mcgPerHr && mcgPerHr < hi.mcgPerHr) {
      const t = (mcgPerHr - lo.mcgPerHr) / (hi.mcgPerHr - lo.mcgPerHr);
      return patchMidpoint(lo) + t * (patchMidpoint(hi) - patchMidpoint(lo));
    }
  }

  throw new Error(`Could not convert fentanyl patch ${mcgPerHr} mcg/hr`);
}

export function omeToDrugDose(drug: string, route: string, ome: number): number {
  const entry = findEntry(drug, route);
  return ome * entry.factorFromOme;
}

export function sumOmes(omes: number[]): number {
  return omes.reduce((sum, v) => sum + v, 0);
}

export function applyReduction(ome: number, reductionPct: number): number {
  if (reductionPct < 0 || reductionPct > 100) {
    throw new Error("Reduction percentage must be between 0 and 100");
  }
  return ome * (1 - reductionPct / 100);
}

export function divideDailyDose(tdd: number, frequency: number): number[] {
  if (frequency <= 0) throw new Error("Frequency must be positive");
  const single = Math.round((tdd / frequency) * 100) / 100;
  return Array(frequency).fill(single);
}

// ---------------------------------------------------------------------------
// Warnings
// ---------------------------------------------------------------------------

export function getGfrWarnings(gfr: number): string[] {
  if (gfr < 30) {
    return [
      "GFR < 30 ml/min: High risk of opioid overdose and metabolite accumulation. Morphine and pethidine are particularly dangerous. Consider fentanyl or sufentanil as safer alternatives.",
    ];
  }
  return [];
}

export function getDrugWarnings(drug: string): string[] {
  const warning = WARNING_DRUGS[drug.toLowerCase()];
  return warning ? [warning] : [];
}

// ---------------------------------------------------------------------------
// Full pipeline
// ---------------------------------------------------------------------------

export function computeTargetRegimen(
  inputs: OpioidInput[],
  targetDrug: string,
  targetRoute: string,
  targetFrequency: number,
  reductionPct: number,
  gfr: number | null,
): TargetResult {
  const warnings: string[] = [];

  // GFR warnings
  if (gfr !== null) {
    warnings.push(...getGfrWarnings(gfr));
  }

  // Convert each input to OME
  const omeValues: number[] = [];
  for (const inp of inputs) {
    warnings.push(...getDrugWarnings(inp.drug));

    const tdd = calculateTdd(inp);
    let ome: number;

    if (inp.drug.toLowerCase() === "fentanyl" && inp.route.toLowerCase() === "patch") {
      ome = fentanylPatchToOme(inp.doses[0]);
    } else {
      ome = drugDoseToOme(inp.drug, inp.route, tdd);
    }
    omeValues.push(ome);
  }

  const totalOme = sumOmes(omeValues);
  const reducedOme = applyReduction(totalOme, reductionPct);

  // Target drug warnings
  warnings.push(...getDrugWarnings(targetDrug));

  let targetTdd: number;
  let divided: number[];
  let frequency: number;
  let breakthroughDose: number | null;

  if (targetDrug.toLowerCase() === "fentanyl" && targetRoute.toLowerCase() === "patch") {
    targetTdd = reducedOme;
    divided = [targetTdd];
    frequency = 1;
    breakthroughDose = Math.round((reducedOme / 6) * 100) / 100;
  } else {
    targetTdd = omeToDrugDose(targetDrug, targetRoute, reducedOme);
    divided = divideDailyDose(targetTdd, targetFrequency);
    frequency = targetFrequency;
    breakthroughDose = Math.round((targetTdd / 6) * 100) / 100;
  }

  targetTdd = Math.round(targetTdd * 100) / 100;

  // GFR-specific drug risk warnings
  if (gfr !== null && gfr < 30) {
    for (const inp of inputs) {
      const risk = GFR_DRUG_RISK[inp.drug.toLowerCase()];
      if (risk === "contraindicated") {
        warnings.push(`${inp.drug} is contraindicated with GFR < 30 ml/min.`);
      } else if (risk === "avoid") {
        warnings.push(
          `${inp.drug} should be avoided with GFR < 30 ml/min. Consider fentanyl or sufentanil.`,
        );
      } else if (risk === "caution") {
        warnings.push(
          `${inp.drug} requires dose reduction and careful monitoring with GFR < 30 ml/min.`,
        );
      }
    }
    const targetRisk = GFR_DRUG_RISK[targetDrug.toLowerCase()];
    if (targetRisk === "contraindicated") {
      warnings.push(`Target drug ${targetDrug} is contraindicated with GFR < 30 ml/min.`);
    } else if (targetRisk === "avoid") {
      warnings.push(`Target drug ${targetDrug} should be avoided with GFR < 30 ml/min.`);
    }
  }

  // De-duplicate
  const unique = [...new Set(warnings)];

  return {
    drug: targetDrug,
    route: targetRoute,
    totalDailyDose: targetTdd,
    dividedDoses: divided,
    frequency,
    breakthroughDose,
    warnings: unique,
    totalOme: Math.round(totalOme * 100) / 100,
    reducedOme: Math.round(reducedOme * 100) / 100,
  };
}

/**
 * Find the closest fentanyl patch strength for a given OME/day.
 */
export function omeToFentanylPatch(ome: number): { mcgPerHr: number; range: string } | null {
  const table = [...FENTANYL_PATCH_TABLE].sort((a, b) => a.mcgPerHr - b.mcgPerHr);

  // Find the closest matching entry
  let best = table[0];
  let bestDiff = Math.abs(patchMidpoint(best) - ome);

  for (const entry of table) {
    const diff = Math.abs(patchMidpoint(entry) - ome);
    if (diff < bestDiff) {
      best = entry;
      bestDiff = diff;
    }
  }

  return {
    mcgPerHr: best.mcgPerHr,
    range: `${best.omeLow}-${best.omeHigh} mg OME/day`,
  };
}
