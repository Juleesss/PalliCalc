// =============================================================================
// PalliCalc v2.0 — Display Formatting Engine
// Generates human-readable strings for dosing output.
// No React imports. Pure functions.
// =============================================================================

import type { TabletCount, DoseDistribution, PatchCombination } from './types';

// ---------------------------------------------------------------------------
// Dose Labels by Frequency
// ---------------------------------------------------------------------------

/** Time-of-day labels for different dosing frequencies. */
const DOSE_LABELS: Record<string, Record<number, readonly string[]>> = {
  hu: {
    1:  ['Reggel'],
    2:  ['Reggel', 'Este'],
    3:  ['Reggel', 'Délután', 'Éjjel'],
    4:  ['Reggel', 'Dél', 'Délután', 'Este'],
    6:  ['06:00', '10:00', '14:00', '18:00', '22:00', '02:00'],
  },
  en: {
    1:  ['Morning'],
    2:  ['Morning', 'Evening'],
    3:  ['Morning', 'Afternoon', 'Night'],
    4:  ['Morning', 'Noon', 'Afternoon', 'Evening'],
    6:  ['06:00', '10:00', '14:00', '18:00', '22:00', '02:00'],
  },
};

/**
 * Get time-of-day labels for a given dosing frequency.
 *
 * @param frequency - Doses per day (1, 2, 3, 4, or 6).
 * @param lang - Language code ('hu' or 'en').
 * @returns Array of label strings.
 */
export function getDoseLabels(frequency: number, lang: 'hu' | 'en'): string[] {
  const labels = DOSE_LABELS[lang]?.[frequency];
  if (labels) {
    return [...labels];
  }

  // Fallback: generate numbered labels
  const result: string[] = [];
  for (let i = 1; i <= frequency; i++) {
    result.push(`#${i}`);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tablet Breakdown Formatting
// ---------------------------------------------------------------------------

/**
 * Format a tablet combination into a readable string.
 * Example: "2x 20mg + 1x 10mg Codoxy retard"
 *
 * @param tablets - The tablet breakdown.
 * @param brandName - Optional brand name to append.
 * @returns Formatted string.
 */
export function formatTabletBreakdown(
  tablets: readonly TabletCount[],
  brandName?: string,
): string {
  if (tablets.length === 0) return '';

  const parts = tablets.map((t) => {
    if (t.count === 1) {
      return `1\u00D7 ${formatNumber(t.mg)}mg`;
    }
    return `${t.count}\u00D7 ${formatNumber(t.mg)}mg`;
  });

  let result = parts.join(' + ');
  if (brandName) {
    result += ` ${brandName}`;
  }
  return result;
}

/**
 * Format a complete dose schedule for display.
 * Returns a multi-line string for the practical dosing table.
 *
 * @param doses - Array of DoseDistribution objects.
 * @param brandName - Optional brand name.
 * @returns Formatted string.
 */
export function formatDoseSchedule(
  doses: readonly DoseDistribution[],
  brandName?: string,
): string {
  if (doses.length === 0) return '';

  const lines = doses.map((dose) => {
    const tabletStr = formatTabletBreakdown(dose.tablets, brandName);
    if (tabletStr) {
      return `${dose.label}: ${formatNumber(dose.totalMg)} mg (${tabletStr})`;
    }
    return `${dose.label}: ${formatNumber(dose.totalMg)} mg`;
  });

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Patch Formatting
// ---------------------------------------------------------------------------

/**
 * Format a fentanyl patch combination for display.
 * Example: "1x 100 mcg/ora + 1x 50 mcg/ora"
 *
 * @param patches - Array of PatchCombination.
 * @param lang - Language for unit display.
 * @returns Formatted string.
 */
export function formatPatchCombination(
  patches: readonly PatchCombination[],
  lang: 'hu' | 'en' = 'hu',
): string {
  if (patches.length === 0) return '';

  const unit = lang === 'hu' ? 'mcg/\u00F3ra' : 'mcg/hr';

  const parts = patches.map((p) => {
    if (p.count === 1) {
      return `1\u00D7 ${p.mcgPerHr} ${unit}`;
    }
    return `${p.count}\u00D7 ${p.mcgPerHr} ${unit}`;
  });

  return parts.join(' + ');
}

/**
 * Calculate total mcg/hr from a patch combination.
 */
export function patchCombinationTotal(patches: readonly PatchCombination[]): number {
  return patches.reduce((sum, p) => sum + p.mcgPerHr * p.count, 0);
}

// ---------------------------------------------------------------------------
// Number Formatting
// ---------------------------------------------------------------------------

/**
 * Format a number for display.
 * Removes unnecessary decimal places: 50.0 -> "50", 50.5 -> "50.5".
 */
export function formatNumber(value: number): string {
  // Round to 1 decimal place
  const rounded = Math.round(value * 10) / 10;

  // If it's a whole number, display without decimals
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }

  return rounded.toString();
}

/**
 * Format a percentage with sign.
 * Example: 1.4 -> "+1.4%", -2.3 -> "-2.3%"
 */
export function formatDelta(deltaPct: number): string {
  const rounded = Math.round(deltaPct * 10) / 10;
  const sign = rounded >= 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

// ---------------------------------------------------------------------------
// Summary Formatting
// ---------------------------------------------------------------------------

/**
 * Calculate total daily tablet count from a dose distribution.
 */
export function totalDailyTabletCount(doses: readonly DoseDistribution[]): number {
  return doses.reduce(
    (sum, dose) => sum + dose.tablets.reduce((s, t) => s + t.count, 0),
    0,
  );
}

/**
 * Format the rounding note line.
 * Example: "Szamitott: 108.5 mg -> Kerekitve: 110 mg (+1.4%)"
 */
export function formatRoundingNote(
  calculated: number,
  rounded: number,
  deltaPct: number,
  lang: 'hu' | 'en',
): string {
  const calcStr = formatNumber(calculated);
  const roundStr = formatNumber(rounded);
  const deltaStr = formatDelta(deltaPct);

  if (lang === 'hu') {
    return `Sz\u00E1m\u00EDtott: ${calcStr} mg \u2192 Kerek\u00EDtve: ${roundStr} mg (${deltaStr})`;
  }
  return `Calculated: ${calcStr} mg \u2192 Rounded: ${roundStr} mg (${deltaStr})`;
}

/**
 * Format frequency as a human-readable interval string.
 * Example: 2 -> "12 óránként" / "every 12 hours"
 */
export function formatFrequency(frequency: number, lang: 'hu' | 'en'): string {
  const intervals: Record<number, Record<string, string>> = {
    1: { hu: '24 \u00F3r\u00E1nk\u00E9nt', en: 'every 24 hours' },
    2: { hu: '12 \u00F3r\u00E1nk\u00E9nt', en: 'every 12 hours' },
    3: { hu: '8 \u00F3r\u00E1nk\u00E9nt', en: 'every 8 hours' },
    4: { hu: '6 \u00F3r\u00E1nk\u00E9nt', en: 'every 6 hours' },
    6: { hu: '4 \u00F3r\u00E1nk\u00E9nt', en: 'every 4 hours' },
  };

  return intervals[frequency]?.[lang] ?? `${frequency}x/${lang === 'hu' ? 'nap' : 'day'}`;
}
