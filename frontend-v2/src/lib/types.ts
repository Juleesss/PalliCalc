// =============================================================================
// PalliCalc v2.0 — Type Definitions
// Pure TypeScript types for the opioid rotation calculator.
// No React imports. No runtime code. Types only.
// =============================================================================

// ---------------------------------------------------------------------------
// Conversion & Pharmacology Types
// ---------------------------------------------------------------------------

/** A single entry in the OME conversion table. */
export interface ConversionEntry {
  readonly drug: string;
  readonly route: string;
  readonly factorToOme: number;
  readonly factorFromOme: number;
  readonly unit: string;
}

/** A row in the fentanyl patch lookup table. */
export interface FentanylPatchEntry {
  readonly mcgPerHr: number;
  readonly omeLow: number;
  readonly omeHigh: number;
  readonly midpoint: number;
}

/** Methadone Ripamonti conversion tier. */
export interface MethadoneTier {
  readonly omeLow: number;
  readonly omeHigh: number;
  readonly ratio: number; // morphine:methadone ratio (e.g. 4 means divide OME by 4)
}

// ---------------------------------------------------------------------------
// Drug Database Types
// ---------------------------------------------------------------------------

/** A brand-name entry linked to a drug. */
export interface BrandEntry {
  readonly name: string;
  readonly drug: string;
  readonly routeHint?: string;
  readonly form?: string;
}

/** Complete definition of a single opioid drug. */
export interface DrugDefinition {
  readonly id: string;
  readonly displayName: Record<'hu' | 'en', string>;
  readonly routes: readonly string[];
  readonly unit: string;
  readonly brands: readonly BrandEntry[];
  /** Available tablet/formulation sizes per route. Key = route string. */
  readonly tabletSizes: Record<string, readonly number[]>;
  /** Minimum single dose constraint (e.g. OxyContin 10mg). */
  readonly minDose?: Record<string, number>;
  /** Maximum daily dose (e.g. tramadol 400mg). */
  readonly maxDailyDose?: number;
  /** Whether this is a warning drug (methadone, nalbuphine, pethidine). */
  readonly isWarningDrug?: boolean;
  /** Whether this drug is blocked as a conversion target. */
  readonly blockedAsTarget?: boolean;
  /** Whether this drug is blocked as a conversion source. */
  readonly blockedAsSource?: boolean;
}

// ---------------------------------------------------------------------------
// Tablet Rounding Types
// ---------------------------------------------------------------------------

/** A count of tablets at a specific strength. */
export interface TabletCount {
  readonly mg: number;
  readonly count: number;
}

/** A single dose in a dosing schedule (e.g., "Morning: 50mg"). */
export interface DoseDistribution {
  readonly label: string;
  readonly totalMg: number;
  readonly tablets: readonly TabletCount[];
}

/** A fentanyl patch in a combination. */
export interface PatchCombination {
  readonly mcgPerHr: number;
  readonly count: number;
}

// ---------------------------------------------------------------------------
// Warning Types
// ---------------------------------------------------------------------------

/** Severity/type of a clinical warning. */
export type WarningType = 'danger' | 'caution' | 'preferred' | 'info';

/** A single warning item with a translation key. */
export interface WarningItem {
  readonly type: WarningType;
  readonly messageKey: string;
  readonly params?: Record<string, string | number>;
}

/** GFR risk level for a specific drug. */
export type GfrRiskLevel =
  | 'avoid'
  | 'contraindicated'
  | 'caution'
  | 'preferred'
  | 'normal';

// ---------------------------------------------------------------------------
// User Input Types
// ---------------------------------------------------------------------------

/** A single opioid regimen entry from the user. */
export interface OpioidInput {
  readonly id: string;
  readonly drug: string;
  readonly route: string;
  readonly frequency: number; // doses per day (e.g. 2 for q12h, 1 for q24h). Patch = 0.333 (72h).
  readonly doses: readonly number[];
  readonly isAsymmetric: boolean;
}

// ---------------------------------------------------------------------------
// Result Types
// ---------------------------------------------------------------------------

/** The full result of a target regimen computation. */
export interface TargetResult {
  /** Total OME before reduction. */
  readonly totalOme: number;
  /** OME after cross-tolerance reduction. */
  readonly reducedOme: number;
  /** Calculated target TDD (before tablet rounding). */
  readonly targetTdd: number;
  /** Actual TDD after tablet rounding. */
  readonly actualTdd: number;
  /** Divided doses with tablet breakdowns. */
  readonly dividedDoses: readonly DoseDistribution[];
  /** Fentanyl patch combination (only when target is patch). */
  readonly patchCombination: readonly PatchCombination[];
  /** How far the rounded TDD is from the calculated TDD, as a percentage. */
  readonly roundingDeltaPct: number;
  /** All warnings generated during computation. */
  readonly warnings: readonly WarningItem[];
  /** The target drug ID. */
  readonly targetDrug: string;
  /** The target route. */
  readonly targetRoute: string;
  /** The target frequency. */
  readonly targetFrequency: number;
  /** Reduction percentage applied. */
  readonly reductionPct: number;
  /** Whether this is a methadone conversion (Ripamonti). */
  readonly isMethadone: boolean;
  /** Per-source-drug OME breakdown. */
  readonly perDrugOme: readonly { drug: string; route: string; ome: number }[];
}

// ---------------------------------------------------------------------------
// Calculator State Types (for useReducer in the UI layer)
// ---------------------------------------------------------------------------

export type BmiCategory = 'low' | 'normal' | 'high';
export type Gender = 'male' | 'female';
export type Language = 'hu' | 'en';

export interface CalculatorState {
  readonly language: Language;
  readonly bmi: BmiCategory | null;
  readonly gender: Gender | null;
  readonly currentDrugs: readonly OpioidInput[];
  readonly targetDrug: string;
  readonly targetRoute: string;
  readonly targetFrequency: number;
  readonly gfr: number | null;
  readonly reductionPct: number;
  readonly result: TargetResult | null;
}

export type CalculatorAction =
  | { readonly type: 'SET_LANGUAGE'; readonly payload: Language }
  | { readonly type: 'SET_BMI'; readonly payload: BmiCategory | null }
  | { readonly type: 'SET_GENDER'; readonly payload: Gender | null }
  | { readonly type: 'ADD_DRUG' }
  | { readonly type: 'REMOVE_DRUG'; readonly payload: { id: string } }
  | {
      readonly type: 'UPDATE_DRUG';
      readonly payload: { id: string; changes: Partial<{ drug: string; route: string; frequency: number; doses: number[]; isAsymmetric: boolean }> };
    }
  | { readonly type: 'SET_TARGET_DRUG'; readonly payload: string }
  | { readonly type: 'SET_TARGET_DRUG_WITH_ROUTE'; readonly payload: { drug: string; route: string } }
  | { readonly type: 'SET_TARGET_ROUTE'; readonly payload: string }
  | { readonly type: 'SET_TARGET_FREQUENCY'; readonly payload: number }
  | { readonly type: 'SET_GFR'; readonly payload: number | null }
  | { readonly type: 'SET_REDUCTION'; readonly payload: number }
  | { readonly type: 'CALCULATE'; readonly payload: TargetResult }
  | { readonly type: 'RESET' };
