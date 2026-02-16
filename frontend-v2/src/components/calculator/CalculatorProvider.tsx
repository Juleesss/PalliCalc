// =============================================================================
// PalliCalc v2.0 — Calculator State Management
// Uses React useReducer + Context for all calculator state.
// No external state libraries. Strict TypeScript throughout.
// =============================================================================

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
  type Dispatch,
} from 'react';

import type {
  OpioidInput,
  CalculatorState,
  CalculatorAction,
} from '../../lib/types';
import { findDrugById } from '../../lib/drug-database';

// ---------------------------------------------------------------------------
// GFR Slider Minimum Logic
// ---------------------------------------------------------------------------

/**
 * Determine the minimum reduction percentage enforced by GFR value.
 * - GFR >= 30 (or null): no minimum (0%)
 * - GFR 10-30: minimum 25%
 * - GFR < 10: minimum 50%
 *
 * This function is exported for use by the ReductionSlider and GfrInput
 * components to display the lock note and enforce constraints.
 */
export function getGfrSliderMin(gfr: number | null): number {
  if (gfr === null) return 0;
  if (gfr < 10) return 50;
  if (gfr < 30) return 25;
  return 0;
}

// ---------------------------------------------------------------------------
// ID Generation
// ---------------------------------------------------------------------------

let nextInputId = 1;

function generateInputId(): string {
  return `input-${nextInputId++}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Empty OpioidInput Factory
// ---------------------------------------------------------------------------

/**
 * Create a new empty OpioidInput with default values.
 *
 * Frequency convention:
 * The `frequency` field stores **doses per day** (not hours between doses).
 * - q24h -> frequency = 1
 * - q12h -> frequency = 2  (default)
 * - q8h  -> frequency = 3
 * - q6h  -> frequency = 4
 * - q4h  -> frequency = 6
 * - Patch (q72h) -> special handling, frequency = 1
 *
 * The `doses` array length matches the frequency value (doses per day).
 * Default: q12h = 2 doses per day = [0, 0].
 */
function createEmptyInput(): OpioidInput {
  return {
    id: generateInputId(),
    drug: '',
    route: '',
    frequency: 2, // q12h = 2 doses per day
    doses: [0, 0],
    isAsymmetric: false,
  };
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: CalculatorState = {
  language: 'hu',
  bmi: null,
  gender: null,
  currentDrugs: [createEmptyInput()],
  targetDrug: '',
  targetRoute: '',
  targetFrequency: 2, // q12h = 2 doses per day
  gfr: null,
  reductionPct: 25,
  result: null,
};

// ---------------------------------------------------------------------------
// Helpers: Frequency for patch route
// ---------------------------------------------------------------------------

/**
 * Get the appropriate default frequency (doses per day) for a drug+route.
 * Fentanyl patches are special: 1 application per 72h.
 * The lookup table handles the OME conversion, so we store frequency=1
 * for patches (meaning: one dose value representing the patch strength).
 */
function getDefaultFrequency(drug: string, route: string): number {
  if (drug === 'fentanyl' && route === 'patch') {
    return 1; // Patch: single "dose" entry (mcg/hr strength)
  }
  return 2; // Default to q12h
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    // -----------------------------------------------------------------------
    // Language
    // -----------------------------------------------------------------------
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    // -----------------------------------------------------------------------
    // Patient Parameters
    // -----------------------------------------------------------------------
    case 'SET_BMI':
      return { ...state, bmi: action.payload, result: null };

    case 'SET_GENDER':
      return { ...state, gender: action.payload, result: null };

    // -----------------------------------------------------------------------
    // Current Regimen: ADD_DRUG
    // -----------------------------------------------------------------------
    case 'ADD_DRUG':
      return {
        ...state,
        currentDrugs: [...state.currentDrugs, createEmptyInput()],
        result: null,
      };

    // -----------------------------------------------------------------------
    // Current Regimen: REMOVE_DRUG
    // Never go below 1 input.
    // -----------------------------------------------------------------------
    case 'REMOVE_DRUG': {
      if (state.currentDrugs.length <= 1) {
        return state;
      }
      const remaining = state.currentDrugs.filter(
        (d) => d.id !== action.payload.id,
      );
      return {
        ...state,
        currentDrugs: remaining.length > 0 ? remaining : [createEmptyInput()],
        result: null,
      };
    }

    // -----------------------------------------------------------------------
    // Current Regimen: UPDATE_DRUG
    //
    // Special handling for cascading field resets:
    // - When drug changes: reset route, frequency, doses
    // - When frequency changes: resize doses array
    // - When isAsymmetric toggles: expand/collapse doses array
    // -----------------------------------------------------------------------
    case 'UPDATE_DRUG': {
      const { id, changes } = action.payload;

      const updatedDrugs = state.currentDrugs.map((input) => {
        if (input.id !== id) return input;

        let updated: OpioidInput = { ...input, ...changes };

        // --- When DRUG changes: reset dependent fields ---
        if (
          'drug' in changes &&
          changes.drug !== undefined &&
          changes.drug !== input.drug
        ) {
          const drugDef = findDrugById(changes.drug);
          // Use route from changes (brand auto-populate) or first available
          const newRoute =
            'route' in changes && changes.route
              ? changes.route
              : drugDef?.routes[0] ?? '';

          const newFrequency = getDefaultFrequency(changes.drug, newRoute);

          updated = {
            ...updated,
            route: newRoute,
            frequency: newFrequency,
            doses: new Array(newFrequency).fill(0),
            isAsymmetric: false,
          };

          return updated;
        }

        // --- When ROUTE changes (without drug change) ---
        if (
          'route' in changes &&
          changes.route !== undefined &&
          changes.route !== input.route
        ) {
          const newFrequency = getDefaultFrequency(updated.drug, changes.route);
          if (newFrequency !== updated.frequency) {
            updated = {
              ...updated,
              frequency: newFrequency,
              doses: new Array(newFrequency).fill(0),
              isAsymmetric: false,
            };
            return updated;
          }
        }

        // --- When FREQUENCY changes ---
        if (
          'frequency' in changes &&
          changes.frequency !== undefined &&
          changes.frequency !== input.frequency
        ) {
          const newFreq = changes.frequency;
          const oldDoses = [...updated.doses];

          // Resize doses array: preserve existing, pad with 0
          const newDoses: number[] = [];
          for (let i = 0; i < newFreq; i++) {
            newDoses.push(i < oldDoses.length ? oldDoses[i] : 0);
          }

          updated = {
            ...updated,
            doses: newDoses,
          };

          return updated;
        }

        // --- When isAsymmetric toggles ON ---
        if (
          'isAsymmetric' in changes &&
          changes.isAsymmetric === true &&
          !input.isAsymmetric
        ) {
          const count = updated.frequency;
          const baseDose = updated.doses[0] ?? 0;
          updated = {
            ...updated,
            doses: new Array(count).fill(baseDose),
          };
          return updated;
        }

        // --- When isAsymmetric toggles OFF ---
        if (
          'isAsymmetric' in changes &&
          changes.isAsymmetric === false &&
          input.isAsymmetric
        ) {
          const firstDose = updated.doses[0] ?? 0;
          const count = updated.frequency;
          updated = {
            ...updated,
            doses: new Array(count).fill(firstDose),
          };
          return updated;
        }

        return updated;
      });

      return {
        ...state,
        currentDrugs: updatedDrugs,
        result: null,
      };
    }

    // -----------------------------------------------------------------------
    // Target Regimen: SET_TARGET_DRUG
    //
    // When drug changes:
    // - Set route to first available route for the new drug
    // - Set frequency appropriately (patch = 1, other = 2)
    // - Clear the result
    // -----------------------------------------------------------------------
    case 'SET_TARGET_DRUG': {
      const drugDef = findDrugById(action.payload);
      const defaultRoute = drugDef?.routes[0] ?? '';
      const defaultFrequency = getDefaultFrequency(action.payload, defaultRoute);

      return {
        ...state,
        targetDrug: action.payload,
        targetRoute: defaultRoute,
        targetFrequency: defaultFrequency,
        result: null,
      };
    }

    // -----------------------------------------------------------------------
    // Target Regimen: SET_TARGET_DRUG_WITH_ROUTE (atomic brand selection)
    // -----------------------------------------------------------------------
    case 'SET_TARGET_DRUG_WITH_ROUTE': {
      const { drug, route } = action.payload;
      const defaultFrequency = getDefaultFrequency(drug, route);

      return {
        ...state,
        targetDrug: drug,
        targetRoute: route,
        targetFrequency: defaultFrequency,
        result: null,
      };
    }

    // -----------------------------------------------------------------------
    // Target Regimen: SET_TARGET_ROUTE
    // -----------------------------------------------------------------------
    case 'SET_TARGET_ROUTE': {
      const newFrequency = getDefaultFrequency(state.targetDrug, action.payload);

      return {
        ...state,
        targetRoute: action.payload,
        targetFrequency:
          action.payload === 'patch' || state.targetRoute === 'patch'
            ? newFrequency
            : state.targetFrequency,
        result: null,
      };
    }

    // -----------------------------------------------------------------------
    // Target Regimen: SET_TARGET_FREQUENCY
    // -----------------------------------------------------------------------
    case 'SET_TARGET_FREQUENCY':
      return {
        ...state,
        targetFrequency: action.payload,
        result: null,
      };

    // -----------------------------------------------------------------------
    // Target Regimen: SET_GFR
    //
    // When GFR changes, enforce the slider minimum:
    // - If current reductionPct is below the new GFR-based minimum, bump it up.
    // -----------------------------------------------------------------------
    case 'SET_GFR': {
      const newGfr = action.payload;
      const newMin = getGfrSliderMin(newGfr);
      const adjustedReduction = Math.max(state.reductionPct, newMin);

      return {
        ...state,
        gfr: newGfr,
        reductionPct: adjustedReduction,
        result: null,
      };
    }

    // -----------------------------------------------------------------------
    // Target Regimen: SET_REDUCTION
    //
    // Clamp the value to [getGfrSliderMin(gfr), 70].
    // -----------------------------------------------------------------------
    case 'SET_REDUCTION': {
      const sliderMin = getGfrSliderMin(state.gfr);
      const clamped = Math.min(70, Math.max(sliderMin, action.payload));

      return {
        ...state,
        reductionPct: clamped,
        result: null,
      };
    }

    // -----------------------------------------------------------------------
    // CALCULATE: Store the pre-computed result from the UI layer.
    //
    // The UI layer calls computeTargetRegimen() from ../../lib/conversions
    // and passes the result in the action payload.
    // -----------------------------------------------------------------------
    case 'CALCULATE':
      return {
        ...state,
        result: action.payload,
      };

    // -----------------------------------------------------------------------
    // RESET: Return to initial state, preserving language preference.
    // -----------------------------------------------------------------------
    case 'RESET':
      nextInputId = 1;
      return {
        ...initialState,
        language: state.language,
        currentDrugs: [createEmptyInput()],
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CalculatorContextType {
  state: CalculatorState;
  dispatch: Dispatch<CalculatorAction>;
}

const CalculatorContext = createContext<CalculatorContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider Component
// ---------------------------------------------------------------------------

export interface CalculatorProviderProps {
  children: ReactNode;
}

export function CalculatorProvider({ children }: CalculatorProviderProps) {
  const [state, dispatch] = useReducer(calculatorReducer, undefined, () => ({
    ...initialState,
    currentDrugs: [createEmptyInput()],
  }));

  const contextValue = useMemo<CalculatorContextType>(
    () => ({ state, dispatch }),
    [state, dispatch],
  );

  return (
    <CalculatorContext.Provider value={contextValue}>
      {children}
    </CalculatorContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the calculator state and dispatch from any component
 * within the CalculatorProvider tree.
 *
 * @throws Error if called outside a CalculatorProvider.
 *
 * @example
 * const { state, dispatch } = useCalculator();
 * dispatch({ type: 'SET_BMI', payload: 'low' });
 * dispatch({ type: 'SET_GFR', payload: 25 });
 * // Slider is now locked to min 25%
 */
export function useCalculator(): CalculatorContextType {
  const ctx = useContext(CalculatorContext);
  if (!ctx) {
    throw new Error(
      'useCalculator() must be used within a <CalculatorProvider>. ' +
        'Wrap your calculator UI tree with <CalculatorProvider>.',
    );
  }
  return ctx;
}
