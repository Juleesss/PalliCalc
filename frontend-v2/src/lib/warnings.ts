// =============================================================================
// PalliCalc v2.0 — Warning Logic
// All clinical warning generation for GFR, BMI, gender, drug-specific,
// formulation frequency, single-dose max, and component clarifications.
// No React imports. Pure functions. All text uses translation keys.
// =============================================================================

import type { WarningItem, GfrRiskLevel } from './types';

// ---------------------------------------------------------------------------
// GFR Drug Risk Matrix (clinical_data_reference.md section 7.2)
// ---------------------------------------------------------------------------

const GFR_DRUG_RISK: Record<string, GfrRiskLevel> = {
  morphine:        'avoid',
  codeine:         'avoid',
  dihydrocodeine:  'avoid',
  pethidine:       'contraindicated',
  oxycodone:       'caution',
  hydromorphone:   'caution',
  tramadol:        'caution',
  tapentadol:      'caution',
  fentanyl:        'preferred',
  methadone:       'preferred', // preferred for renal, but specialist-only caveats
  'oxycodone-naloxone': 'caution', // same as oxycodone
};

// ---------------------------------------------------------------------------
// GFR General Warnings
// ---------------------------------------------------------------------------

/**
 * Get general GFR-based warnings.
 * When GFR < 10, only show the stricter warning (50% minimum).
 * When GFR 10-29, show the 25-50% warning.
 */
export function getGfrWarnings(gfr: number | null): WarningItem[] {
  if (gfr === null || gfr >= 30) return [];

  // GFR < 10: only the stricter warning (at least 50% reduction)
  if (gfr < 10) {
    return [{
      type: 'danger',
      messageKey: 'warning.gfr.below10',
    }];
  }

  // GFR 10-29: standard warning (25-50% reduction)
  return [{
    type: 'danger',
    messageKey: 'warning.gfr.below30',
  }];
}

// ---------------------------------------------------------------------------
// GFR Drug-Specific Advice
// ---------------------------------------------------------------------------

/**
 * Get drug-specific GFR advice for a target drug.
 * Only produces warnings when GFR < 30.
 */
export function getGfrDrugAdvice(drugId: string, gfr: number | null): WarningItem[] {
  if (gfr === null || gfr >= 30) return [];

  const riskLevel = GFR_DRUG_RISK[drugId];
  if (!riskLevel || riskLevel === 'normal') return [];

  const warnings: WarningItem[] = [];

  switch (riskLevel) {
    case 'avoid':
      warnings.push({
        type: 'danger',
        messageKey: 'warning.gfr.drug.avoid',
        params: { drug: drugId },
      });
      break;

    case 'contraindicated':
      warnings.push({
        type: 'danger',
        messageKey: 'warning.gfr.drug.contraindicated',
        params: { drug: drugId },
      });
      break;

    case 'caution':
      warnings.push({
        type: 'caution',
        messageKey: 'warning.gfr.drug.caution',
        params: { drug: drugId },
      });
      break;

    case 'preferred':
      warnings.push({
        type: 'preferred',
        messageKey: 'warning.gfr.drug.preferred',
        params: { drug: drugId },
      });
      break;
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// GFR Slider Constraints
// ---------------------------------------------------------------------------

/**
 * Get the minimum allowed reduction percentage based on GFR.
 *
 * - GFR >= 30 (or null): 0% minimum
 * - GFR 10-29: 25% minimum
 * - GFR < 10: 50% minimum
 */
export function getGfrSliderMin(gfr: number | null): number {
  if (gfr === null) return 0;
  if (gfr < 10) return 50;
  if (gfr < 30) return 25;
  return 0;
}

// ---------------------------------------------------------------------------
// BMI Warnings
// ---------------------------------------------------------------------------

/**
 * Get BMI-based warnings.
 *
 * @param bmi - BMI category: 'low' (<19), 'normal' (19-26), 'high' (>26), or null.
 */
export function getBmiWarnings(bmi: string | null): WarningItem[] {
  if (!bmi) return [];

  switch (bmi) {
    case 'low':
      return [{
        type: 'caution',
        messageKey: 'warning.bmi.low',
      }];

    case 'high':
      return [{
        type: 'caution',
        messageKey: 'warning.bmi.high',
      }];

    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Gender Warnings
// ---------------------------------------------------------------------------

/**
 * Get gender-based warnings.
 *
 * @param gender - 'male', 'female', or null.
 */
export function getGenderWarnings(gender: string | null): WarningItem[] {
  if (gender === 'female') {
    return [{
      type: 'caution',
      messageKey: 'warning.gender.female',
    }];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Drug-Specific Warnings
// ---------------------------------------------------------------------------

/**
 * Get warnings for a specific drug based on whether it is used as
 * a source (current) or target drug.
 */
export function getDrugWarnings(drugId: string, isTarget: boolean): WarningItem[] {
  const warnings: WarningItem[] = [];

  switch (drugId) {
    // ----- METHADONE -----
    case 'methadone':
      warnings.push({
        type: 'danger',
        messageKey: 'warning.drug.methadone',
      });
      break;

    // ----- NALBUPHINE -----
    case 'nalbuphine':
      if (isTarget) {
        warnings.push({
          type: 'danger',
          messageKey: 'warning.drug.nalbuphine.target',
        });
      } else {
        warnings.push({
          type: 'danger',
          messageKey: 'warning.drug.nalbuphine.source',
        });
      }
      break;

    // ----- PETHIDINE -----
    case 'pethidine':
      if (isTarget) {
        warnings.push({
          type: 'danger',
          messageKey: 'warning.drug.pethidine.target',
        });
      } else {
        warnings.push({
          type: 'danger',
          messageKey: 'warning.drug.pethidine.source',
        });
      }
      break;

    // ----- OXYCODONE + NALOXONE: component clarification -----
    case 'oxycodone-naloxone':
      warnings.push({
        type: 'info',
        messageKey: 'warning.drug.oxycodone_naloxone.hepatic',
      });
      if (isTarget) {
        warnings.push({
          type: 'info',
          messageKey: 'warning.drug.oxycodone_naloxone.component',
        });
      }
      break;

    default:
      break;
  }

  return warnings;
}

/**
 * Get route-specific drug warnings.
 * Separated from getDrugWarnings to allow route info.
 */
export function getDrugRouteWarnings(drugId: string, route: string, _isTarget: boolean): WarningItem[] {
  const warnings: WarningItem[] = [];

  // Transmucosal fentanyl: individual titration warning
  if (drugId === 'fentanyl' && route === 'oral/mucosal') {
    warnings.push({
      type: 'caution',
      messageKey: 'warning.drug.fentanyl.mucosal',
    });
  }

  // Oral hydromorphone: hydration warning
  if (drugId === 'hydromorphone' && route === 'oral') {
    warnings.push({
      type: 'caution',
      messageKey: 'warning.drug.hydromorphone.hydration',
    });
  }

  // Fentanyl patch clinical alerts
  if (drugId === 'fentanyl' && route === 'patch') {
    warnings.push({
      type: 'info',
      messageKey: 'patch.onset',
    });
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Minimum Dose Warning
// ---------------------------------------------------------------------------

/**
 * Check if a calculated dose falls below the minimum available dose
 * for a drug and generate a warning if so.
 */
export function getMinDoseWarning(drugId: string, calculatedDose: number): WarningItem | null {
  // Drug-specific minimum doses
  const minDoses: Record<string, { minMg: number; messageKey: string }> = {
    oxycodone: {
      minMg: 10,
      messageKey: 'warning.drug.oxycodone.minOxyContin',
    },
    morphine: {
      minMg: 10,
      messageKey: 'warning.drug.minDose',
    },
    hydromorphone: {
      minMg: 4,
      messageKey: 'warning.drug.minDose',
    },
  };

  const entry = minDoses[drugId];
  if (!entry) return null;

  if (calculatedDose > 0 && calculatedDose < entry.minMg) {
    return {
      type: 'caution',
      messageKey: entry.messageKey,
      params: {
        calculated: Math.round(calculatedDose * 10) / 10,
        min: entry.minMg,
      },
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Single-Dose Maximum Warning
// ---------------------------------------------------------------------------

/**
 * Check if a single dose exceeds the per-administration maximum.
 */
export function getSingleDoseMaxWarning(drugId: string, singleDoseMg: number): WarningItem | null {
  const limits: Record<string, number> = {
    dihydrocodeine: 120,
    tramadol: 200,
  };

  const maxDose = limits[drugId];
  if (!maxDose) return null;

  if (singleDoseMg > maxDose) {
    return {
      type: 'danger',
      messageKey: 'warning.drug.singleDoseMax',
      params: {
        dose: Math.round(singleDoseMg),
        max: maxDose,
      },
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Oxycodone High-Dose Info Warning
// ---------------------------------------------------------------------------

/**
 * Info-level warning for high oxycodone or oxycodone-naloxone doses.
 * No hard cap (individualized per SmPC), but clinician should be aware.
 */
export function getHighDoseWarning(drugId: string, dailyDoseMg: number): WarningItem | null {
  if (drugId === 'oxycodone' && dailyDoseMg > 160) {
    return {
      type: 'info',
      messageKey: 'warning.drug.oxycodone.highDose',
      params: { dose: Math.round(dailyDoseMg) },
    };
  }
  if (drugId === 'oxycodone-naloxone' && dailyDoseMg > 80) {
    return {
      type: 'info',
      messageKey: 'warning.drug.oxycodone_naloxone.highDose',
      params: { dose: Math.round(dailyDoseMg) },
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Formulation Frequency Validation
// ---------------------------------------------------------------------------

/**
 * Warn if the selected frequency is inappropriate for the formulation type.
 */
export function getFrequencyWarnings(
  drugId: string,
  route: string,
  frequency: number,
  formulations: readonly { type: string; validFrequencies?: readonly number[] }[],
): WarningItem[] {
  const warnings: WarningItem[] = [];

  if (route === 'patch' || route === 'sc/iv' || route === 'iv') return warnings;

  // Check if frequency is appropriate for any formulation
  const retardFormulations = formulations.filter((f) => f.type === 'retard');
  const irFormulations = formulations.filter((f) => f.type === 'ir');

  // If there are retard formulations and frequency > q12h (frequency > 2)
  if (retardFormulations.length > 0 && irFormulations.length === 0 && frequency > 2) {
    warnings.push({
      type: 'caution',
      messageKey: 'warning.freq.retardTooFrequent',
    });
  }

  // If there are only IR formulations and frequency = q24h (frequency = 1)
  if (irFormulations.length > 0 && retardFormulations.length === 0 && frequency === 1) {
    warnings.push({
      type: 'caution',
      messageKey: 'warning.freq.irTooInfrequent',
    });
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Methadone Safety Warning (online calculator)
// ---------------------------------------------------------------------------

/**
 * Warning that methadone conversion via online calculators is unsafe.
 */
export function getMethadoneSafetyWarning(): WarningItem {
  return {
    type: 'danger',
    messageKey: 'warning.drug.methadone.onlineUnsafe',
  };
}

// ---------------------------------------------------------------------------
// Dose Rounded Up To Minimum Warning
// ---------------------------------------------------------------------------

/**
 * Warning when dose was rounded up to the minimum achievable tablet size.
 */
export function getDoseRoundedUpWarning(targetMg: number, actualMg: number): WarningItem {
  return {
    type: 'caution',
    messageKey: 'warning.dose.roundedUpToMin',
    params: {
      target: Math.round(targetMg * 10) / 10,
      actual: Math.round(actualMg),
    },
  };
}

// ---------------------------------------------------------------------------
// MST Continus IV→PO Note
// ---------------------------------------------------------------------------

/**
 * When switching morphine from IV to oral retard (MST Continus),
 * SmPC recommends 100% dose increase.
 */
export function getMstContinusIvToPoWarning(
  sourceDrugs: readonly { drug: string; route: string }[],
  targetDrug: string,
  targetRoute: string,
): WarningItem | null {
  if (targetDrug !== 'morphine' || targetRoute !== 'oral') return null;

  const hasMorphineIv = sourceDrugs.some(
    (s) => s.drug === 'morphine' && (s.route === 'sc/iv' || s.route === 'iv'),
  );
  if (!hasMorphineIv) return null;

  return {
    type: 'info',
    messageKey: 'warning.drug.morphine.ivToPo',
  };
}

// ---------------------------------------------------------------------------
// Tramadol Ceiling Warning
// ---------------------------------------------------------------------------

/**
 * Check if tramadol exceeds the 400mg/day ceiling.
 */
export function getTramadolCeilingWarning(dailyDoseMg: number): WarningItem | null {
  if (dailyDoseMg > 400) {
    return {
      type: 'danger',
      messageKey: 'warning.drug.tramadol.max',
      params: { dose: Math.round(dailyDoseMg) },
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Aggregate Warnings
// ---------------------------------------------------------------------------

/**
 * Collect all patient-parameter warnings (BMI, gender).
 * This does not include GFR or drug warnings.
 */
export function getPatientWarnings(
  bmi: string | null,
  gender: string | null,
): WarningItem[] {
  return [
    ...getBmiWarnings(bmi),
    ...getGenderWarnings(gender),
  ];
}

/**
 * Check if a drug is blocked as a target (calculation should not proceed).
 */
export function isBlockedAsTarget(drugId: string): boolean {
  return drugId === 'nalbuphine' || drugId === 'pethidine';
}

/**
 * Check if a drug is blocked as a source (cannot convert its dose to OME reliably).
 */
export function isBlockedAsSource(_drugId: string): boolean {
  // No drugs are hard-blocked as source; nalbuphine and pethidine
  // show warnings but are allowed for entry per clinical reference.
  return false;
}
