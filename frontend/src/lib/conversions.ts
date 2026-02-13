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
  PatchCombination,
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
  { drug: "fentanyl", route: "oral/mucosal", factorToOme: 50.0, factorFromOme: 0.02, notes: "Buccal/sublingual ~50% bioavailability of IV. Primarily for breakthrough pain." },
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
  {
    drug: "oxycodone",
    routes: ["oral", "sc/iv"],
    unit: "mg",
    brands: [
      { name: "OxyContin", form: "retard filmtabletta", routeHint: "oral" },
      { name: "Codoxy", form: "retard tabletta", routeHint: "oral" },
      { name: "Codoxy Rapid", routeHint: "oral" },
      { name: "Reltebon", form: "retard tabletta", routeHint: "oral" },
      { name: "Oxycodone Sandoz", form: "kemény kapszula & tabletta", routeHint: "oral" },
      { name: "Oxycodone Vitabalans", routeHint: "oral" },
      { name: "Targin", form: "retard tabletta", routeHint: "oral", naloxoneCombo: true },
      { name: "Oxynal", form: "retard tabletta", routeHint: "oral", naloxoneCombo: true },
      { name: "Oxynador", routeHint: "oral", naloxoneCombo: true },
      { name: "Oxikodon-HCL/Naloxon-HCL Neuraxpharm", routeHint: "oral", naloxoneCombo: true },
    ],
  },
  { drug: "hydromorphone", routes: ["oral"], unit: "mg" },
  { drug: "tramadol", routes: ["oral", "iv"], unit: "mg" },
  { drug: "dihydrocodeine", routes: ["oral"], unit: "mg" },
  {
    drug: "fentanyl",
    routes: ["sc/iv", "patch", "oral/mucosal"],
    unit: "mg",
    brands: [
      { name: "Durogesic", routeHint: "patch" },
      { name: "Dolforin", routeHint: "patch" },
      { name: "Matrifen", routeHint: "patch" },
      { name: "Fentanyl Sandoz", form: "tapasz", routeHint: "patch" },
      { name: "Fentanyl-ratiopharm", routeHint: "patch" },
      { name: "Effentora", form: "buccalis", routeHint: "oral/mucosal" },
      { name: "Abstral", form: "sublinguális", routeHint: "oral/mucosal" },
      { name: "Actiq", form: "szopogató", routeHint: "oral/mucosal" },
      { name: "Fentanyl-Richter", routeHint: "sc/iv" },
      { name: "Fentanyl Kalceks", routeHint: "sc/iv" },
      { name: "Fentanyl Sandoz", form: "injectio", routeHint: "sc/iv" },
    ],
  },
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
// GFR-based slider minimum
// ---------------------------------------------------------------------------

export function getGfrSliderMin(gfr: number | null): number {
  if (gfr === null || isNaN(gfr)) return 0;
  if (gfr < 10) return 50;
  if (gfr < 30) return 25;
  return 0;
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

  // GFR-specific drug risk warnings for target drug
  if (gfr !== null && gfr < 30) {
    const td = targetDrug.toLowerCase();
    if (td === "morphine" || td === "codeine" || td === "dihydrocodeine") {
      warnings.push(
        `gfr.drug.avoid`,
      );
    } else if (td === "oxycodone" || td === "hydromorphone") {
      warnings.push(
        `gfr.drug.caution`,
      );
    } else if (td === "fentanyl") {
      warnings.push(
        `gfr.drug.preferred`,
      );
    }

    // Source drug warnings
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
  }

  // GFR < 10 general warning
  if (gfr !== null && gfr < 10) {
    warnings.push(`gfr.below10.warning`);
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
 * Convert OME/day to target mcg/hr using reverse interpolation of patch table.
 */
export function omeToTargetMcgPerHr(ome: number): number {
  const table = [...FENTANYL_PATCH_TABLE].sort((a, b) => a.mcgPerHr - b.mcgPerHr);

  if (ome <= 0) return 0;

  // Below lowest
  if (ome <= patchMidpoint(table[0])) {
    return Math.round(table[0].mcgPerHr * ome / patchMidpoint(table[0]));
  }

  // Above highest — extrapolate
  const last = table[table.length - 1];
  if (ome >= patchMidpoint(last)) {
    const prev = table[table.length - 2];
    const slope =
      (last.mcgPerHr - prev.mcgPerHr) /
      (patchMidpoint(last) - patchMidpoint(prev));
    return Math.round(last.mcgPerHr + slope * (ome - patchMidpoint(last)));
  }

  // Interpolate between entries
  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (ome >= patchMidpoint(lo) && ome <= patchMidpoint(hi)) {
      const frac =
        (ome - patchMidpoint(lo)) / (patchMidpoint(hi) - patchMidpoint(lo));
      return Math.round(lo.mcgPerHr + frac * (hi.mcgPerHr - lo.mcgPerHr));
    }
  }

  return Math.round(ome / 2.7); // fallback average ratio
}

const AVAILABLE_PATCH_SIZES = [100, 75, 50, 25, 12];

/**
 * Combine standard patch sizes (100, 75, 50, 25, 12 mcg/hr) to reach target.
 * Uses greedy algorithm from largest to smallest.
 */
export function combinePatchSizes(targetMcgPerHr: number): PatchCombination {
  const patches: Array<{ mcgPerHr: number; count: number }> = [];
  let remaining = targetMcgPerHr;

  for (const size of AVAILABLE_PATCH_SIZES) {
    if (remaining >= size) {
      const count = Math.floor(remaining / size);
      patches.push({ mcgPerHr: size, count });
      remaining -= count * size;
    }
  }

  // If remainder >= half of smallest patch, round up
  if (remaining >= 6) {
    patches.push({ mcgPerHr: 12, count: 1 });
  }

  const totalMcgPerHr = patches.reduce(
    (sum, p) => sum + p.mcgPerHr * p.count,
    0,
  );

  return { patches, totalMcgPerHr };
}

/**
 * Find the best fentanyl patch combination for a given OME/day.
 */
export function omeToFentanylPatch(ome: number): PatchCombination {
  const targetMcg = omeToTargetMcgPerHr(ome);
  return combinePatchSizes(targetMcg);
}
