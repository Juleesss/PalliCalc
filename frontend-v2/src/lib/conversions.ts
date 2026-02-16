// =============================================================================
// PalliCalc v2.0 — OME Conversion Engine
// Pure math functions for opioid rotation calculations.
// No React imports. No side effects.
// =============================================================================

import type {
  ConversionEntry,
  FentanylPatchEntry,
  MethadoneTier,
  OpioidInput,
  PatchCombination,
  TargetResult,
  WarningItem,
  DoseDistribution,
  TabletCount,
} from './types';
import { getTabletSizes, getIrTabletSizes } from './drug-database';
import { distributeToTablets, roundToTablets, tabletTotal } from './tablet-rounding';
import { combinePatchSizes, omeToFentanylMcgHr } from './patch-calculator';
import {
  getDrugWarnings,
  getGfrWarnings,
  getGfrDrugAdvice,
  getMinDoseWarning,
  getGfrSliderMin,
} from './warnings';

// ---------------------------------------------------------------------------
// Conversion Table (PRD section 4.2 / clinical_data_reference section 1.2)
// ---------------------------------------------------------------------------

export const CONVERSION_TABLE: readonly ConversionEntry[] = [
  { drug: 'morphine',       route: 'oral',          factorToOme: 1.0,   factorFromOme: 1.0,     unit: 'mg' },
  { drug: 'morphine',       route: 'sc/iv',         factorToOme: 3.0,   factorFromOme: 0.333,   unit: 'mg' },
  { drug: 'oxycodone',      route: 'oral',          factorToOme: 1.5,   factorFromOme: 0.667,   unit: 'mg' },
  { drug: 'oxycodone',      route: 'sc/iv',         factorToOme: 3.0,   factorFromOme: 0.333,   unit: 'mg' },
  { drug: 'hydromorphone',  route: 'oral',          factorToOme: 5.0,   factorFromOme: 0.2,     unit: 'mg' },
  { drug: 'hydromorphone',  route: 'sc/iv',         factorToOme: 15.0,  factorFromOme: 0.067,   unit: 'mg' },
  { drug: 'tramadol',       route: 'oral',          factorToOme: 0.1,   factorFromOme: 10.0,    unit: 'mg' },
  { drug: 'tramadol',       route: 'iv',            factorToOme: 0.1,   factorFromOme: 10.0,    unit: 'mg' },
  { drug: 'codeine',        route: 'oral',          factorToOme: 0.1,   factorFromOme: 10.0,    unit: 'mg' },
  { drug: 'dihydrocodeine', route: 'oral',          factorToOme: 0.1,   factorFromOme: 10.0,    unit: 'mg' },
  { drug: 'fentanyl',       route: 'sc/iv',         factorToOme: 100.0, factorFromOme: 0.01,    unit: 'mg' },
  { drug: 'fentanyl',       route: 'oral/mucosal',  factorToOme: 50.0,  factorFromOme: 0.02,    unit: 'mg' },
  // Fentanyl patch uses lookup table, not a linear factor.
  // Oxycodone+naloxone uses the same factor as oxycodone (naloxone is local gut action).
  { drug: 'oxycodone-naloxone', route: 'oral',      factorToOme: 1.5,   factorFromOme: 0.667,   unit: 'mg' },
] as const;

// ---------------------------------------------------------------------------
// Fentanyl Patch Lookup Table (PRD section 4.3 / clinical_data_reference section 2)
// ---------------------------------------------------------------------------

export const FENTANYL_PATCH_TABLE: readonly FentanylPatchEntry[] = [
  { mcgPerHr: 12,  omeLow: 30,  omeHigh: 45,  midpoint: 37.5  },
  { mcgPerHr: 25,  omeLow: 60,  omeHigh: 90,  midpoint: 75.0  },
  { mcgPerHr: 50,  omeLow: 120, omeHigh: 150, midpoint: 135.0 },
  { mcgPerHr: 75,  omeLow: 180, omeHigh: 225, midpoint: 202.5 },
  { mcgPerHr: 100, omeLow: 240, omeHigh: 300, midpoint: 270.0 },
] as const;

// ---------------------------------------------------------------------------
// Methadone Ripamonti Tiers (clinical_data_reference section 10)
// ---------------------------------------------------------------------------

export const METHADONE_RIPAMONTI_TIERS: readonly MethadoneTier[] = [
  { omeLow: 30,  omeHigh: 90,   ratio: 4 },
  { omeLow: 91,  omeHigh: 300,  ratio: 6 },
  { omeLow: 301, omeHigh: Infinity, ratio: 8 },
] as const;

// ---------------------------------------------------------------------------
// Core Calculation Functions
// ---------------------------------------------------------------------------

/**
 * Calculate Total Daily Dose from per-dose values.
 * - Symmetric: single dose * frequency (doses/day)
 * - Asymmetric: sum of all individual doses
 */
export function calculateTdd(
  doses: readonly number[],
  frequency: number,
  isAsymmetric: boolean,
): number {
  if (isAsymmetric) {
    return doses.reduce((sum, d) => sum + (d || 0), 0);
  }
  const singleDose = doses[0] || 0;
  // frequency is doses per day. For patches (72h), frequency is stored as
  // a special value; patch dose IS the dose, TDD is handled via lookup.
  return singleDose * frequency;
}

/**
 * Look up the conversion entry for a drug + route.
 * Oxycodone-naloxone maps to its own entry (same factor as oxycodone).
 */
export function findConversion(drug: string, route: string): ConversionEntry | undefined {
  return CONVERSION_TABLE.find(
    (e) => e.drug === drug && e.route === route,
  );
}

/**
 * Convert a drug TDD to Oral Morphine Equivalent (OME).
 * For fentanyl patches, use fentanylPatchToOme() instead.
 */
export function drugDoseToOme(drug: string, route: string, tdd: number): number {
  if (drug === 'fentanyl' && route === 'patch') {
    return fentanylPatchToOme(tdd);
  }
  const entry = findConversion(drug, route);
  if (!entry) {
    return 0;
  }
  return tdd * entry.factorToOme;
}

/**
 * Convert fentanyl patch mcg/hr to OME mg/day using midpoint interpolation.
 */
export function fentanylPatchToOme(mcgPerHr: number): number {
  if (mcgPerHr <= 0) return 0;

  const table = FENTANYL_PATCH_TABLE;

  // Below lowest entry: linear extrapolation from origin to first entry
  if (mcgPerHr <= table[0].mcgPerHr) {
    return (mcgPerHr / table[0].mcgPerHr) * table[0].midpoint;
  }

  // Above highest entry: linear extrapolation from last two entries
  if (mcgPerHr > table[table.length - 1].mcgPerHr) {
    const last = table[table.length - 1];
    const prev = table[table.length - 2];
    const slope = (last.midpoint - prev.midpoint) / (last.mcgPerHr - prev.mcgPerHr);
    return last.midpoint + slope * (mcgPerHr - last.mcgPerHr);
  }

  // Interpolate between two bracketing entries
  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (mcgPerHr >= lo.mcgPerHr && mcgPerHr <= hi.mcgPerHr) {
      const fraction = (mcgPerHr - lo.mcgPerHr) / (hi.mcgPerHr - lo.mcgPerHr);
      return lo.midpoint + fraction * (hi.midpoint - lo.midpoint);
    }
  }

  // Fallback (should not reach here)
  return 0;
}

/**
 * Convert OME to a target drug TDD.
 * For fentanyl patches, use omeToFentanylPatch() instead.
 */
export function omeToDrugDose(drug: string, route: string, ome: number): number {
  if (drug === 'fentanyl' && route === 'patch') {
    return omeToFentanylPatch(ome);
  }
  const entry = findConversion(drug, route);
  if (!entry) {
    return 0;
  }
  return ome * entry.factorFromOme;
}

/**
 * Convert OME to fentanyl patch mcg/hr using reverse lookup with interpolation.
 */
export function omeToFentanylPatch(ome: number): number {
  return omeToFentanylMcgHr(ome);
}

/**
 * Apply cross-tolerance reduction.
 */
export function applyReduction(ome: number, reductionPct: number): number {
  return ome * (1 - reductionPct / 100);
}

/**
 * Convert OME to methadone dose using Ripamonti non-linear tiers.
 */
export function omeToMethadone(ome: number): number {
  if (ome <= 0) return 0;

  for (const tier of METHADONE_RIPAMONTI_TIERS) {
    if (ome >= tier.omeLow && ome <= tier.omeHigh) {
      return ome / tier.ratio;
    }
  }
  // If below minimum tier, use the first tier ratio
  if (ome < METHADONE_RIPAMONTI_TIERS[0].omeLow) {
    return ome / METHADONE_RIPAMONTI_TIERS[0].ratio;
  }
  return ome / METHADONE_RIPAMONTI_TIERS[METHADONE_RIPAMONTI_TIERS.length - 1].ratio;
}

// ---------------------------------------------------------------------------
// Master Computation Pipeline
// ---------------------------------------------------------------------------

/**
 * Compute the full target regimen from user inputs.
 * This is the master function that runs the entire OME pipeline:
 *   current drugs -> sum OME -> reduce -> convert to target -> round -> output
 */
export function computeTargetRegimen(
  inputs: readonly OpioidInput[],
  targetDrug: string,
  targetRoute: string,
  targetFrequency: number,
  reductionPct: number,
  gfr: number | null = null,
  _bmi: string | null = null,
  _gender: string | null = null,
): TargetResult {
  const warnings: WarningItem[] = [];
  const perDrugOme: { drug: string; route: string; ome: number }[] = [];

  // -----------------------------------------------------------------------
  // Step 1: Calculate OME for each source drug
  // -----------------------------------------------------------------------
  let totalOme = 0;

  for (const input of inputs) {
    if (!input.drug || !input.route) continue;

    const tdd = calculateTdd(input.doses, input.frequency, input.isAsymmetric);
    if (tdd <= 0) continue;

    const ome = drugDoseToOme(input.drug, input.route, tdd);
    totalOme += ome;
    perDrugOme.push({ drug: input.drug, route: input.route, ome });

    // Source drug warnings
    const sourceWarnings = getDrugWarnings(input.drug, false);
    warnings.push(...sourceWarnings);
  }

  // -----------------------------------------------------------------------
  // Step 2: Apply cross-tolerance reduction (with GFR floor enforcement)
  // -----------------------------------------------------------------------
  const gfrMinReduction = getGfrSliderMin(gfr);
  const effectiveReduction = Math.max(reductionPct, gfrMinReduction);
  const reducedOme = applyReduction(totalOme, effectiveReduction);

  // -----------------------------------------------------------------------
  // Step 3: GFR warnings
  // -----------------------------------------------------------------------
  if (gfr !== null) {
    warnings.push(...getGfrWarnings(gfr));
    warnings.push(...getGfrDrugAdvice(targetDrug, gfr));
  }

  // -----------------------------------------------------------------------
  // Step 4: Target drug warnings
  // -----------------------------------------------------------------------
  warnings.push(...getDrugWarnings(targetDrug, true));

  // -----------------------------------------------------------------------
  // Step 5: Convert reduced OME to target drug
  // -----------------------------------------------------------------------
  const isMethadone = targetDrug === 'methadone';
  const isPatch = targetRoute === 'patch';
  const isInjectable = targetRoute === 'sc/iv' || targetRoute === 'iv';

  let targetTdd: number;
  let actualTdd: number;
  let dividedDoses: DoseDistribution[] = [];
  let patchCombination: PatchCombination[] = [];
  let roundingDeltaPct = 0;

  if (isMethadone) {
    // Methadone: use Ripamonti non-linear conversion
    targetTdd = omeToMethadone(reducedOme);
    actualTdd = targetTdd;

    // Try to round to methadone tablet sizes
    const sizes = getTabletSizes('methadone', 'oral');
    if (sizes.length > 0 && targetFrequency > 0) {
      dividedDoses = distributeToTablets(targetTdd, targetFrequency, sizes, []);
      actualTdd = dividedDoses.reduce((sum, d) => sum + d.totalMg, 0);
      roundingDeltaPct = targetTdd > 0 ? ((actualTdd - targetTdd) / targetTdd) * 100 : 0;
    }
  } else if (isPatch) {
    // Fentanyl patch: reverse lookup -> combine patch sizes
    const targetMcgHr = omeToFentanylMcgHr(reducedOme);
    patchCombination = combinePatchSizes(targetMcgHr);
    const actualMcgHr = patchCombination.reduce((sum, p) => sum + p.mcgPerHr * p.count, 0);
    targetTdd = targetMcgHr; // For patches, "TDD" is mcg/hr
    actualTdd = actualMcgHr;
    roundingDeltaPct = targetMcgHr > 0 ? ((actualMcgHr - targetMcgHr) / targetMcgHr) * 100 : 0;
  } else {
    // Standard drug: linear conversion + tablet rounding
    targetTdd = omeToDrugDose(targetDrug, targetRoute, reducedOme);

    if (isInjectable) {
      // Injectable: no rounding needed, exact dose
      actualTdd = targetTdd;
      const perDose = targetFrequency > 0 ? targetTdd / targetFrequency : targetTdd;
      dividedDoses = [{
        label: '',
        totalMg: perDose,
        tablets: [],
      }];
    } else {
      // Oral: round to available tablet sizes
      const sizes = getTabletSizes(targetDrug, targetRoute);
      if (sizes.length > 0 && targetFrequency > 0) {
        dividedDoses = distributeToTablets(targetTdd, targetFrequency, sizes, []);
        actualTdd = dividedDoses.reduce((sum, d) => sum + d.totalMg, 0);
        roundingDeltaPct = targetTdd > 0 ? ((actualTdd - targetTdd) / targetTdd) * 100 : 0;
      } else {
        actualTdd = targetTdd;
      }
    }

    // Check tramadol max dose
    if (targetDrug === 'tramadol' && actualTdd > 400) {
      warnings.push({
        type: 'danger',
        messageKey: 'warning.tramadol.maxDose',
        params: { dose: Math.round(actualTdd) },
      });
    }

    // Check minimum dose per administration
    if (dividedDoses.length > 0) {
      for (const dose of dividedDoses) {
        const minWarn = getMinDoseWarning(targetDrug, dose.totalMg);
        if (minWarn) {
          warnings.push(minWarn);
          break; // Only warn once
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Step 6: Breakthrough dose calculation
  // -----------------------------------------------------------------------
  let breakthroughSingleDose = 0;
  let breakthroughMaxDaily = 0;
  let breakthroughTablets: TabletCount[] = [];

  if (isPatch) {
    // For patch: breakthrough is in oral morphine mg
    // Breakthrough = reducedOme / 6
    breakthroughSingleDose = reducedOme / 6;
    // Round to morphine IR tablet sizes
    const morphineIrSizes = getIrTabletSizes('morphine');
    if (morphineIrSizes.length > 0) {
      breakthroughTablets = roundToTablets(breakthroughSingleDose, morphineIrSizes);
      breakthroughSingleDose = tabletTotal(breakthroughTablets);
    }
    breakthroughMaxDaily = breakthroughSingleDose * 6;
  } else if (!isMethadone && !isInjectable) {
    // For oral drugs: breakthrough = actualTdd / 6, rounded to IR tablets
    breakthroughSingleDose = actualTdd / 6;
    const irSizes = getIrTabletSizes(targetDrug);
    if (irSizes.length > 0) {
      breakthroughTablets = roundToTablets(breakthroughSingleDose, irSizes);
      breakthroughSingleDose = tabletTotal(breakthroughTablets);
    }
    breakthroughMaxDaily = breakthroughSingleDose * 6;
  } else if (isInjectable) {
    // Injectable breakthrough: exact dose, TDD / 6
    breakthroughSingleDose = actualTdd / 6;
    breakthroughMaxDaily = breakthroughSingleDose * 6;
  }

  // Escalation warning always added for breakthrough
  if (breakthroughMaxDaily > 0) {
    warnings.push({
      type: 'info',
      messageKey: 'warning.breakthrough.escalation',
    });
  }

  return {
    totalOme: Math.round(totalOme * 100) / 100,
    reducedOme: Math.round(reducedOme * 100) / 100,
    targetTdd: Math.round(targetTdd * 100) / 100,
    actualTdd: Math.round(actualTdd * 100) / 100,
    dividedDoses,
    breakthroughSingleDose: Math.round(breakthroughSingleDose * 100) / 100,
    breakthroughMaxDaily: Math.round(breakthroughMaxDaily * 100) / 100,
    breakthroughTablets,
    patchCombination,
    roundingDeltaPct: Math.round(roundingDeltaPct * 10) / 10,
    warnings,
    targetDrug,
    targetRoute,
    targetFrequency,
    reductionPct: effectiveReduction,
    isMethadone,
    perDrugOme,
  };
}
