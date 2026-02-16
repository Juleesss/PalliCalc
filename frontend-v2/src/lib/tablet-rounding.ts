// =============================================================================
// PalliCalc v2.0 — Smart Dose Rounding Engine
// Rounds calculated doses to available tablet sizes with asymmetric splits.
// No React imports. Pure functions.
// =============================================================================

import type { TabletCount, DoseDistribution } from './types';
import { findDrugById } from './drug-database';

// ---------------------------------------------------------------------------
// Core Rounding Functions
// ---------------------------------------------------------------------------

/**
 * Round a target mg value to a combination of available tablet sizes.
 * Uses a greedy algorithm, largest tablet first, rounding DOWN.
 *
 * @param targetMg - The ideal dose in mg.
 * @param sizes - Available tablet sizes, will be sorted descending internally.
 * @returns Array of TabletCount representing the tablet combination.
 */
export function roundToTablets(targetMg: number, sizes: number[]): TabletCount[] {
  if (sizes.length === 0 || targetMg <= 0) return [];

  const sortedSizes = [...sizes].sort((a, b) => b - a);
  const result: TabletCount[] = [];
  let remaining = targetMg;

  for (const size of sortedSizes) {
    if (remaining >= size) {
      const count = Math.floor(remaining / size);
      result.push({ mg: size, count });
      remaining -= count * size;
    }
  }

  return result;
}

/**
 * Round UP to the nearest achievable dose using available tablet sizes.
 * Rounds down first, then adds the smallest tablet if there is a remainder.
 */
function roundToTabletsUp(targetMg: number, sizes: number[]): TabletCount[] {
  if (sizes.length === 0 || targetMg <= 0) return [];

  const sortedSizes = [...sizes].sort((a, b) => b - a);
  const smallestSize = sortedSizes[sortedSizes.length - 1];

  // First, round down
  const roundedDown = roundToTablets(targetMg, sizes);
  const totalDown = tabletTotal(roundedDown);

  // If exact match, return as-is
  if (Math.abs(totalDown - targetMg) < 0.001) {
    return roundedDown;
  }

  // Add one smallest tablet to round up
  const roundedUpTotal = totalDown + smallestSize;
  return roundToTablets(roundedUpTotal, sizes);
}

/**
 * Calculate the total mg from a tablet combination.
 */
export function tabletTotal(tablets: readonly TabletCount[]): number {
  return tablets.reduce((sum, t) => sum + t.mg * t.count, 0);
}

// ---------------------------------------------------------------------------
// Main Distribution Algorithm
// ---------------------------------------------------------------------------

/**
 * Distribute a target TDD across multiple doses, rounding to available
 * tablet sizes. Supports asymmetric dosing when equal split is not achievable.
 *
 * Algorithm (from clinical_data_reference.md section 5):
 * 1. Calculate ideal per-dose = targetTdd / numberOfDoses
 * 2. Try symmetric rounding first (all doses equal)
 * 3. If rounding error > 10%, use asymmetric split
 * 4. Prefer rounding DOWN for safety
 * 5. Never round UP by more than 15%
 *
 * @param targetTdd - The calculated total daily dose.
 * @param frequency - Doses per day (e.g. 2 for q12h, 1 for q24h).
 * @param sizes - Available tablet sizes in mg.
 * @param labels - Time-of-day labels for each dose slot. If empty, auto-generated.
 * @returns Array of DoseDistribution objects.
 */
export function distributeToTablets(
  targetTdd: number,
  frequency: number,
  sizes: number[],
  labels: string[],
): DoseDistribution[] {
  if (sizes.length === 0 || targetTdd <= 0 || frequency <= 0) {
    return [];
  }

  const numberOfDoses = frequency;

  // Step 1: Calculate the ideal per-dose amount
  const idealPerDose = targetTdd / numberOfDoses;

  // Step 2: Round down and up for symmetric dosing
  const tabletsDown = roundToTablets(idealPerDose, sizes);
  const tabletsUp = roundToTabletsUp(idealPerDose, sizes);
  const doseDown = tabletTotal(tabletsDown);
  const doseUp = tabletTotal(tabletsUp);

  // Step 3: Check if symmetric rounding (all doses equal) works
  const symmetricDownTotal = doseDown * numberOfDoses;
  const symmetricUpTotal = doseUp * numberOfDoses;

  const symmetricDownError = targetTdd > 0
    ? Math.abs(symmetricDownTotal - targetTdd) / targetTdd
    : 0;
  const symmetricUpError = targetTdd > 0
    ? Math.abs(symmetricUpTotal - targetTdd) / targetTdd
    : 0;

  // Check the 15% round-up limit
  const upDelta = targetTdd > 0 ? (symmetricUpTotal - targetTdd) / targetTdd : 0;
  const symmetricUpAllowed = upDelta <= 0.15;

  // Prefer rounding down; use up only if down error > 10% and up is within limits
  if (symmetricDownError <= 0.10) {
    return createSymmetricDistribution(tabletsDown, doseDown, numberOfDoses, labels);
  }

  if (symmetricUpAllowed && symmetricUpError <= 0.10) {
    return createSymmetricDistribution(tabletsUp, doseUp, numberOfDoses, labels);
  }

  // Step 4: Asymmetric distribution
  // Determine how many doses should be rounded up vs down to get closest to targetTdd
  if (doseUp === doseDown) {
    // Edge case: cannot differentiate (e.g. only one tablet size)
    return createSymmetricDistribution(tabletsDown, doseDown, numberOfDoses, labels);
  }

  const gap = doseUp - doseDown;
  // How many "up" doses do we need?
  // targetTdd = numUp * doseUp + numDown * doseDown
  // targetTdd = numUp * doseUp + (N - numUp) * doseDown
  // targetTdd = numUp * (doseUp - doseDown) + N * doseDown
  // numUp = (targetTdd - N * doseDown) / (doseUp - doseDown)
  const rawNumUp = (targetTdd - numberOfDoses * doseDown) / gap;
  let numUp = Math.round(rawNumUp);
  numUp = Math.max(0, Math.min(numUp, numberOfDoses));

  const numDown = numberOfDoses - numUp;
  const asymmetricTotal = numUp * doseUp + numDown * doseDown;

  // Verify the 15% round-up cap is not exceeded overall
  const asymmetricDelta = targetTdd > 0
    ? (asymmetricTotal - targetTdd) / targetTdd
    : 0;

  if (asymmetricDelta > 0.15) {
    // Reduce numUp by 1 to stay safe
    const safeNumUp = Math.max(0, numUp - 1);
    const safeNumDown = numberOfDoses - safeNumUp;
    return createAsymmetricDistribution(
      tabletsUp, doseUp, safeNumUp,
      tabletsDown, doseDown, safeNumDown,
      numberOfDoses, labels,
    );
  }

  return createAsymmetricDistribution(
    tabletsUp, doseUp, numUp,
    tabletsDown, doseDown, numDown,
    numberOfDoses, labels,
  );
}

/**
 * Create a symmetric distribution (all doses equal).
 */
function createSymmetricDistribution(
  tablets: TabletCount[],
  perDose: number,
  numberOfDoses: number,
  labels: string[],
): DoseDistribution[] {
  const result: DoseDistribution[] = [];
  for (let i = 0; i < numberOfDoses; i++) {
    result.push({
      label: labels[i] ?? `#${i + 1}`,
      totalMg: perDose,
      tablets: [...tablets],
    });
  }
  return result;
}

/**
 * Create an asymmetric distribution where some doses are rounded up and some down.
 * Higher doses are placed earlier in the schedule (morning doses first).
 */
function createAsymmetricDistribution(
  tabletsUp: TabletCount[],
  doseUp: number,
  numUp: number,
  tabletsDown: TabletCount[],
  doseDown: number,
  numDown: number,
  numberOfDoses: number,
  labels: string[],
): DoseDistribution[] {
  const result: DoseDistribution[] = [];

  // Place higher doses first (morning) for clinical convention
  // Exception: for 2-dose schedules (q12h), place lower dose first (morning)
  // and higher dose in evening — this is the safer approach
  if (numberOfDoses === 2 && numUp === 1) {
    // q12h with asymmetric: lower morning, higher evening
    result.push({
      label: labels[0] ?? '#1',
      totalMg: doseDown,
      tablets: [...tabletsDown],
    });
    result.push({
      label: labels[1] ?? '#2',
      totalMg: doseUp,
      tablets: [...tabletsUp],
    });
  } else {
    // General case: higher doses first
    for (let i = 0; i < numUp; i++) {
      result.push({
        label: labels[i] ?? `#${i + 1}`,
        totalMg: doseUp,
        tablets: [...tabletsUp],
      });
    }
    for (let i = 0; i < numDown; i++) {
      result.push({
        label: labels[numUp + i] ?? `#${numUp + i + 1}`,
        totalMg: doseDown,
        tablets: [...tabletsDown],
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Minimum Dose Utilities
// ---------------------------------------------------------------------------

/**
 * Get the minimum available dose for a drug.
 * Returns null if no minimum is defined.
 */
export function getMinimumDose(drugId: string): number | null {
  const drug = findDrugById(drugId);
  if (!drug || !drug.minDose) return null;

  // Return the minimum across all routes
  const mins = Object.values(drug.minDose);
  if (mins.length === 0) return null;

  return Math.min(...mins);
}
