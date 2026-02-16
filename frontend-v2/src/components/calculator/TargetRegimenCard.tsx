import { useMemo, useCallback } from 'react';
import Card from '../shared/Card.tsx';
import DrugCombobox from '../shared/DrugCombobox.tsx';
import TappableChipGroup from '../shared/TappableChipGroup.tsx';
import NumberInput from '../shared/NumberInput.tsx';
import InlineWarning from '../shared/InlineWarning.tsx';
import { useCalculator } from './CalculatorProvider.tsx';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import type { Language } from '../../lib/types.ts';
import { findDrugById } from '../../lib/drug-database.ts';
import { computeTargetRegimen, calculateTdd, drugDoseToOme } from '../../lib/conversions.ts';
import {
  getGfrWarnings,
  getGfrDrugAdvice,
  getGfrSliderMin,
} from '../../lib/warnings.ts';

// Map route id to the correct translation key
function getRouteTranslationKey(route: string): string {
  const routeKeyMap: Record<string, string> = {
    oral: 'route.oral',
    'sc/iv': 'route.sc_iv',
    iv: 'route.iv',
    patch: 'route.patch',
    'oral/mucosal': 'route.oral_mucosal',
  };
  return routeKeyMap[route] ?? route;
}

// Frequency options for non-patch routes
const FREQUENCY_OPTIONS = [
  { value: '1', label: '24h' },
  { value: '2', label: '12h' },
  { value: '3', label: '8h' },
  { value: '4', label: '6h' },
  { value: '6', label: '4h' },
];

// Drugs excluded as target (nalbuphine, pethidine)
const TARGET_EXCLUDED_DRUGS = ['nalbuphine', 'pethidine'] as const;

export default function TargetRegimenCard() {
  const { state, dispatch } = useCalculator();
  const { lang, t } = useLanguage();

  const targetDrugDef = useMemo(
    () => (state.targetDrug ? findDrugById(state.targetDrug) : undefined),
    [state.targetDrug],
  );

  const isPatch = state.targetRoute === 'patch';

  // Route options for target drug
  const routeOptions = useMemo(() => {
    if (!targetDrugDef) return [];
    return targetDrugDef.routes.map((route) => ({
      value: route as string,
      label: t(getRouteTranslationKey(route as string)),
    }));
  }, [targetDrugDef, t]);

  // GFR warnings
  const gfrWarnings = useMemo(
    () => getGfrWarnings(state.gfr),
    [state.gfr],
  );

  // GFR drug-specific advice
  const gfrDrugAdvice = useMemo(
    () => (state.targetDrug ? getGfrDrugAdvice(state.targetDrug, state.gfr) : []),
    [state.targetDrug, state.gfr],
  );

  // GFR slider minimum
  const gfrSliderMin = useMemo(
    () => getGfrSliderMin(state.gfr),
    [state.gfr],
  );

  // Effective reduction (enforced by GFR min)
  const effectiveReduction = Math.max(state.reductionPct, gfrSliderMin);

  // Is calculate button enabled?
  const canCalculate = useMemo(() => {
    // At least one drug with dose > 0
    const hasValidInput = state.currentDrugs.some((d) => {
      if (!d.drug || !d.route) return false;
      const tdd = calculateTdd(d.doses, d.frequency, d.isAsymmetric);
      return tdd > 0;
    });
    // Target drug and route must be selected
    const hasTarget = state.targetDrug !== '' && state.targetRoute !== '';
    return hasValidInput && hasTarget;
  }, [state.currentDrugs, state.targetDrug, state.targetRoute]);

  // Handle target drug change
  const handleTargetDrugChange = useCallback(
    (drugId: string, route?: string) => {
      if (route) {
        dispatch({ type: 'SET_TARGET_DRUG_WITH_ROUTE', payload: { drug: drugId, route } });
      } else {
        dispatch({ type: 'SET_TARGET_DRUG', payload: drugId });
      }
    },
    [dispatch],
  );

  // Handle GFR change
  const handleGfrChange = useCallback(
    (value: number) => {
      dispatch({ type: 'SET_GFR', payload: value >= 0 ? value : null });
    },
    [dispatch],
  );

  // Handle reduction change
  const handleReductionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      dispatch({ type: 'SET_REDUCTION', payload: Math.max(value, gfrSliderMin) });
    },
    [dispatch, gfrSliderMin],
  );

  // Handle Calculate
  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;

    // Verify total OME > 0
    let totalOme = 0;
    for (const input of state.currentDrugs) {
      if (!input.drug || !input.route) continue;
      const tdd = calculateTdd(input.doses, input.frequency, input.isAsymmetric);
      if (tdd > 0) {
        totalOme += drugDoseToOme(input.drug, input.route, tdd);
      }
    }
    if (totalOme <= 0) return;

    const result = computeTargetRegimen(
      state.currentDrugs,
      state.targetDrug,
      state.targetRoute,
      state.targetFrequency,
      effectiveReduction,
      state.gfr,
      state.bmi,
      state.gender,
      lang as Language,
    );

    dispatch({ type: 'CALCULATE', payload: result });

    // Scroll to results
    setTimeout(() => {
      document
        .getElementById('results-card')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [
    canCalculate,
    state.currentDrugs,
    state.targetDrug,
    state.targetRoute,
    state.targetFrequency,
    effectiveReduction,
    state.gfr,
    state.bmi,
    state.gender,
    lang,
    dispatch,
  ]);

  return (
    <Card title={t('target.title')}>
      <div className="space-y-4">
        {/* Target Drug Selection */}
        <DrugCombobox
          value={state.targetDrug || null}
          onChange={handleTargetDrugChange}
          label={t('target.drug')}
          placeholder={t('target.selectDrug')}
          excludeDrugs={TARGET_EXCLUDED_DRUGS}
        />

        {/* Route Selection */}
        {targetDrugDef && routeOptions.length > 0 && (
          <TappableChipGroup
            label={t('target.route')}
            options={routeOptions}
            value={state.targetRoute || null}
            onChange={(val) =>
              dispatch({ type: 'SET_TARGET_ROUTE', payload: val })
            }
          />
        )}

        {/* Frequency Selection (hidden for patches) */}
        {state.targetRoute && !isPatch && (
          <TappableChipGroup
            label={t('target.frequency')}
            options={FREQUENCY_OPTIONS}
            value={String(state.targetFrequency)}
            onChange={(val) =>
              dispatch({
                type: 'SET_TARGET_FREQUENCY',
                payload: parseInt(val, 10),
              })
            }
          />
        )}

        {/* Patch frequency note */}
        {isPatch && (
          <div className="text-xs text-gray-500 italic">
            {t('freq.72h')}
          </div>
        )}

        {/* GFR Input */}
        <div className="space-y-2">
          <NumberInput
            value={state.gfr ?? 0}
            onChange={handleGfrChange}
            unit={t('target.gfrUnit')}
            label={t('target.gfr')}
            placeholder={t('target.gfrPlaceholder')}
            min={0}
          />

          {/* GFR general warnings */}
          {gfrWarnings.map((w) => (
            <InlineWarning key={w.messageKey} variant={w.type}>
              {t(w.messageKey, w.params)}
            </InlineWarning>
          ))}

          {/* GFR drug-specific advice */}
          {gfrDrugAdvice.map((w) => (
            <InlineWarning key={w.messageKey} variant={w.type}>
              {t(w.messageKey, w.params)}
            </InlineWarning>
          ))}
        </div>

        {/* Cross-tolerance Reduction Slider */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t('target.reduction')}
          </label>

          <div className="text-center">
            <span className="text-2xl font-bold text-blue-700">
              {t('target.reductionValue', { value: effectiveReduction })}
            </span>
          </div>

          <input
            type="range"
            min={gfrSliderMin}
            max={70}
            step={5}
            value={effectiveReduction}
            onChange={handleReductionChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-7
              [&::-webkit-slider-thumb]:w-7
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-blue-600
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md
              [&::-moz-range-thumb]:h-7
              [&::-moz-range-thumb]:w-7
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-blue-600
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:shadow-md"
            aria-label={t('a11y.reductionSlider')}
            aria-valuemin={gfrSliderMin}
            aria-valuemax={70}
            aria-valuenow={effectiveReduction}
          />

          <div className="flex justify-between text-xs text-gray-400">
            <span>{gfrSliderMin}%</span>
            <span>70%</span>
          </div>

          {/* GFR slider lock note */}
          {gfrSliderMin > 0 && (
            <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              {t('target.reductionLock', { min: gfrSliderMin })}
            </div>
          )}
        </div>

        {/* Calculate Button */}
        <button
          type="button"
          onClick={handleCalculate}
          disabled={!canCalculate}
          className={`
            w-full py-4 text-lg font-bold rounded-xl
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${
              canCalculate
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {t('target.calculate')}
        </button>
      </div>
    </Card>
  );
}
