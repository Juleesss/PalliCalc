// =============================================================================
// PalliCalc v2.0 — Fentanyl Patch Calculator
// Specialized logic for fentanyl transdermal patch conversions.
// No React imports. Pure functions.
// =============================================================================

import type { PatchCombination, FentanylPatchEntry } from './types';

// ---------------------------------------------------------------------------
// Available Patch Sizes
// ---------------------------------------------------------------------------

/**
 * Available fentanyl patch sizes in mcg/hr (Hungarian market).
 * Note: 12 mcg/hr is only available as Matrifen in Hungary.
 */
export const AVAILABLE_PATCH_SIZES: readonly number[] = [12, 25, 50, 75, 100] as const;

// ---------------------------------------------------------------------------
// Fentanyl Patch Table (from PRD section 4.3)
// ---------------------------------------------------------------------------

const FENTANYL_PATCH_TABLE: readonly FentanylPatchEntry[] = [
  { mcgPerHr: 12,  omeLow: 30,  omeHigh: 45,  midpoint: 37.5  },
  { mcgPerHr: 25,  omeLow: 60,  omeHigh: 90,  midpoint: 75.0  },
  { mcgPerHr: 50,  omeLow: 120, omeHigh: 150, midpoint: 135.0 },
  { mcgPerHr: 75,  omeLow: 180, omeHigh: 225, midpoint: 202.5 },
  { mcgPerHr: 100, omeLow: 240, omeHigh: 300, midpoint: 270.0 },
] as const;

// ---------------------------------------------------------------------------
// OME -> Fentanyl mcg/hr (Reverse Lookup with Interpolation)
// ---------------------------------------------------------------------------

/**
 * Convert OME (mg/day) to target fentanyl patch strength (mcg/hr).
 * Uses linear interpolation between table entries.
 *
 * Algorithm (clinical_data_reference.md section 2.2):
 * 1. Find which range the OME falls into.
 * 2. Interpolate linearly between the two bracketing midpoints.
 * 3. For values below or above the table, extrapolate linearly.
 */
export function omeToFentanylMcgHr(ome: number): number {
  if (ome <= 0) return 0;

  const table = FENTANYL_PATCH_TABLE;

  // Below the lowest entry: extrapolate from origin to first midpoint
  if (ome <= table[0].midpoint) {
    // Linear from (0 OME = 0 mcg/hr) to (37.5 OME = 12 mcg/hr)
    return (ome / table[0].midpoint) * table[0].mcgPerHr;
  }

  // Above the highest entry: extrapolate from last two entries
  if (ome > table[table.length - 1].midpoint) {
    const last = table[table.length - 1];
    const prev = table[table.length - 2];
    const slope =
      (last.mcgPerHr - prev.mcgPerHr) / (last.midpoint - prev.midpoint);
    return last.mcgPerHr + slope * (ome - last.midpoint);
  }

  // Interpolate between two bracketing entries
  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (ome >= lo.midpoint && ome <= hi.midpoint) {
      const fraction = (ome - lo.midpoint) / (hi.midpoint - lo.midpoint);
      return lo.mcgPerHr + fraction * (hi.mcgPerHr - lo.mcgPerHr);
    }
  }

  // Fallback (should not reach)
  return 0;
}

// ---------------------------------------------------------------------------
// Fentanyl mcg/hr -> OME (Forward Lookup with Interpolation)
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
 *
 * Algorithm (clinical_data_reference.md section 2.2):
 * 1. Start with the largest available patch size (100 mcg/hr).
 * 2. Use as many of each size as fit.
 * 3. Work down to smaller sizes.
 * 4. If remaining >= half the smallest patch (6 mcg/hr), add one 12 mcg/hr patch.
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
