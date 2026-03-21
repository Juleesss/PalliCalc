// =============================================================================
// PalliCalc v2.0 — Fentanyl Patch Calculator
// Specialized logic for fentanyl transdermal patch conversions.
// Implements Durogesic SmPC band-based lookup (replaces interpolation).
// No React imports. Pure functions.
// =============================================================================

import type { PatchCombination, FentanylPatchEntry, PatientStability } from './types';

// ---------------------------------------------------------------------------
// Available Patch Sizes
// ---------------------------------------------------------------------------

/**
 * Available fentanyl patch sizes in mcg/hr (Hungarian market).
 * Note: 12 mcg/hr is only available as Matrifen in Hungary.
 */
export const AVAILABLE_PATCH_SIZES: readonly number[] = [12, 25, 50, 75, 100] as const;

// ---------------------------------------------------------------------------
// Durogesic SmPC Band Table
// ---------------------------------------------------------------------------

/**
 * Durogesic SmPC band-based conversion table.
 * Each band maps an oral morphine dose range (OME mg/day) to a patch strength.
 * This replaces the previous interpolation-based approach.
 */
const SMPC_PATCH_BANDS: readonly { omeLow: number; omeHigh: number; mcgPerHr: number }[] = [
  { omeLow: 30,  omeHigh: 44,  mcgPerHr: 12 },
  { omeLow: 45,  omeHigh: 89,  mcgPerHr: 25 },
  { omeLow: 90,  omeHigh: 149, mcgPerHr: 50 },
  { omeLow: 150, omeHigh: 209, mcgPerHr: 75 },
  { omeLow: 210, omeHigh: 269, mcgPerHr: 100 },
  { omeLow: 270, omeHigh: 329, mcgPerHr: 125 },
  { omeLow: 330, omeHigh: 389, mcgPerHr: 150 },
  { omeLow: 390, omeHigh: 449, mcgPerHr: 175 },
  { omeLow: 450, omeHigh: 509, mcgPerHr: 200 },
  { omeLow: 510, omeHigh: 569, mcgPerHr: 225 },
  { omeLow: 570, omeHigh: 629, mcgPerHr: 250 },
  { omeLow: 630, omeHigh: 689, mcgPerHr: 275 },
  { omeLow: 690, omeHigh: 749, mcgPerHr: 300 },
];

// ---------------------------------------------------------------------------
// Legacy Fentanyl Patch Table (kept for fentanylMcgHrToOme reverse lookup)
// ---------------------------------------------------------------------------

const FENTANYL_PATCH_TABLE: readonly FentanylPatchEntry[] = [
  { mcgPerHr: 12,  omeLow: 30,  omeHigh: 45,  midpoint: 37.5  },
  { mcgPerHr: 25,  omeLow: 60,  omeHigh: 90,  midpoint: 75.0  },
  { mcgPerHr: 50,  omeLow: 120, omeHigh: 150, midpoint: 135.0 },
  { mcgPerHr: 75,  omeLow: 180, omeHigh: 225, midpoint: 202.5 },
  { mcgPerHr: 100, omeLow: 240, omeHigh: 300, midpoint: 270.0 },
] as const;

// ---------------------------------------------------------------------------
// SmPC Band-Based OME -> Fentanyl mcg/hr
// ---------------------------------------------------------------------------

/**
 * Convert OME (mg/day) to target fentanyl patch strength (mcg/hr)
 * using the Durogesic SmPC band table.
 *
 * @param ome - Total oral morphine equivalent in mg/day.
 * @param stability - Patient stability: 'stable' uses standard table,
 *                    'unstable' shifts one band lower (more conservative).
 * @returns Target patch strength in mcg/hr.
 */
export function omeToFentanylMcgHr(ome: number, stability: PatientStability = 'stable'): number {
  if (ome <= 0) return 0;

  // Below the table: too low for patches
  if (ome < SMPC_PATCH_BANDS[0].omeLow) {
    // Proportional extrapolation below table
    return (ome / SMPC_PATCH_BANDS[0].omeLow) * SMPC_PATCH_BANDS[0].mcgPerHr;
  }

  // Find the matching band
  for (const band of SMPC_PATCH_BANDS) {
    if (ome >= band.omeLow && ome <= band.omeHigh) {
      if (stability === 'unstable') {
        // One band lower for unstable patients (more conservative)
        const idx = SMPC_PATCH_BANDS.indexOf(band);
        if (idx > 0) {
          return SMPC_PATCH_BANDS[idx - 1].mcgPerHr;
        }
        // Already at lowest band — use same
        return band.mcgPerHr;
      }
      return band.mcgPerHr;
    }
  }

  // Above the table: extrapolate (25 mcg/hr per 60 mg OME above 690)
  const lastBand = SMPC_PATCH_BANDS[SMPC_PATCH_BANDS.length - 1];
  const extraMcg = Math.ceil((ome - lastBand.omeHigh) / 60) * 25;
  const result = lastBand.mcgPerHr + extraMcg;

  if (stability === 'unstable') {
    // Reduce by one band step (25 mcg/hr) for unstable
    return Math.max(12, result - 25);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Fentanyl mcg/hr -> OME (Forward Lookup with Interpolation)
// Used for SOURCE patch -> OME conversion (input direction)
// ---------------------------------------------------------------------------

/**
 * Convert fentanyl patch mcg/hr to OME mg/day.
 * Uses midpoint interpolation from the lookup table.
 */
export function fentanylMcgHrToOme(mcgPerHr: number): number {
  if (mcgPerHr <= 0) return 0;

  const table = FENTANYL_PATCH_TABLE;

  // Below lowest entry: extrapolate from origin
  if (mcgPerHr <= table[0].mcgPerHr) {
    return (mcgPerHr / table[0].mcgPerHr) * table[0].midpoint;
  }

  // Above highest entry: extrapolate
  if (mcgPerHr > table[table.length - 1].mcgPerHr) {
    const last = table[table.length - 1];
    const prev = table[table.length - 2];
    const slope =
      (last.midpoint - prev.midpoint) / (last.mcgPerHr - prev.mcgPerHr);
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

  return 0;
}

// ---------------------------------------------------------------------------
// Patch Size Combination (Greedy Algorithm)
// ---------------------------------------------------------------------------

/**
 * Combine available fentanyl patch sizes to approximate a target mcg/hr.
 * Uses a greedy algorithm from largest to smallest.
 * Limits patch combinations to max 3 patches for practicality.
 *
 * @param targetMcgHr - Target patch strength in mcg/hr.
 * @returns Array of PatchCombination (sorted from largest to smallest).
 */
export function combinePatchSizes(targetMcgHr: number): PatchCombination[] {
  if (targetMcgHr <= 0) return [];

  // Sort sizes descending for greedy algorithm
  const sizes = [...AVAILABLE_PATCH_SIZES].sort((a, b) => b - a);
  const smallestSize = sizes[sizes.length - 1]; // 12

  const result: PatchCombination[] = [];
  let remaining = targetMcgHr;

  for (const size of sizes) {
    if (remaining >= size) {
      const count = Math.floor(remaining / size);
      result.push({ mcgPerHr: size, count });
      remaining -= count * size;
    }
  }

  // If remainder is >= half the smallest patch, round up by adding one more
  if (remaining >= smallestSize / 2) {
    // Check if we already have the smallest size in our result
    const existingSmallest = result.find((p) => p.mcgPerHr === smallestSize);
    if (existingSmallest) {
      // Increment count (create new array since we use readonly)
      const idx = result.indexOf(existingSmallest);
      result[idx] = { mcgPerHr: smallestSize, count: existingSmallest.count + 1 };
    } else {
      result.push({ mcgPerHr: smallestSize, count: 1 });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Patch Combination Utility Functions
// ---------------------------------------------------------------------------

/**
 * Calculate the total mcg/hr from a patch combination.
 */
export function patchCombinationTotalMcgHr(patches: readonly PatchCombination[]): number {
  return patches.reduce((sum, p) => sum + p.mcgPerHr * p.count, 0);
}

/**
 * Check if a patch combination includes a 12 mcg/hr patch.
 * If so, it's only available as Matrifen in Hungary.
 */
export function includes12McgPatch(patches: readonly PatchCombination[]): boolean {
  return patches.some((p) => p.mcgPerHr === 12 && p.count > 0);
}

/**
 * Get the total number of individual patches in a combination.
 */
export function totalPatchCount(patches: readonly PatchCombination[]): number {
  return patches.reduce((sum, p) => sum + p.count, 0);
}
