import { useMemo, useCallback } from 'react';
import { Switch } from '@headlessui/react';
import DrugCombobox from '../shared/DrugCombobox.tsx';
import TappableChipGroup from '../shared/TappableChipGroup.tsx';
import NumberInput from '../shared/NumberInput.tsx';
import { useCalculator } from './CalculatorProvider.tsx';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { findDrugById } from '../../lib/drug-database.ts';
import { getDoseLabels } from '../../lib/formatting.ts';
import type { OpioidInput } from '../../lib/types.ts'; // used in DrugEntryProps

interface DrugEntryProps {
  readonly index: number;
  readonly input: OpioidInput;
  readonly onRemove?: () => void;
  readonly showRemove: boolean;
}

// Map route id to the correct translation key from hu.ts/en.ts
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
const FREQUENCY_VALUES = [
  { value: '1', label: '24h' },
  { value: '2', label: '12h' },
  { value: '3', label: '8h' },
  { value: '4', label: '6h' },
  { value: '6', label: '4h' },
];

export default function DrugEntry({
  index,
  input,
  onRemove,
  showRemove,
}: DrugEntryProps) {
  const { dispatch } = useCalculator();
  const { lang, t } = useLanguage();

  const drugDef = useMemo(
    () => (input.drug ? findDrugById(input.drug) : undefined),
    [input.drug],
  );

  const isPatch = input.route === 'patch';

  // Route options based on selected drug
  const routeOptions = useMemo(() => {
    if (!drugDef) return [];
    return drugDef.routes.map((route) => ({
      value: route as string,
      label: t(getRouteTranslationKey(route as string)),
    }));
  }, [drugDef, t]);

  // Dose labels for asymmetric dosing
  const doseLabels = useMemo(() => {
    if (!input.isAsymmetric) return [];
    return getDoseLabels(input.frequency, lang);
  }, [input.isAsymmetric, input.frequency, lang]);

  // Unit for dose input
  const doseUnit = useMemo(() => {
    if (!drugDef) return t('current.dose.unit.mg');
    if (isPatch) return t('current.dose.unit.mcg');
    return drugDef.unit;
  }, [drugDef, isPatch, t]);

  const handleDrugChange = useCallback(
    (drugId: string, route?: string) => {
      const changes: Record<string, unknown> = { drug: drugId };
      if (route) {
        changes.route = route;
        if (route === 'patch') {
          changes.frequency = 1;
          changes.isAsymmetric = false;
          changes.doses = [0];
        }
      }
      dispatch({
        type: 'UPDATE_DRUG',
        payload: { id: input.id, changes },
      });
    },
    [dispatch, input.id],
  );

  const handleRouteChange = useCallback(
    (route: string) => {
      const changes: Record<string, unknown> = { route };
      if (route === 'patch') {
        changes.frequency = 1;
        changes.isAsymmetric = false;
        changes.doses = [0];
      }
      dispatch({
        type: 'UPDATE_DRUG',
        payload: { id: input.id, changes },
      });
    },
    [dispatch, input.id],
  );

  const handleFrequencyChange = useCallback(
    (value: string) => {
      const freq = parseInt(value, 10);
      dispatch({
        type: 'UPDATE_DRUG',
        payload: { id: input.id, changes: { frequency: freq } },
      });
    },
    [dispatch, input.id],
  );

  const handleDoseChange = useCallback(
    (doseIndex: number, value: number) => {
      const newDoses = [...input.doses];
      newDoses[doseIndex] = value;
      dispatch({
        type: 'UPDATE_DRUG',
        payload: { id: input.id, changes: { doses: newDoses } },
      });
    },
    [dispatch, input.id, input.doses],
  );

  const handleAsymmetricToggle = useCallback(
    (checked: boolean) => {
      dispatch({
        type: 'UPDATE_DRUG',
        payload: { id: input.id, changes: { isAsymmetric: checked } },
      });
    },
    [dispatch, input.id],
  );

  return (
    <div className="relative space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Remove button */}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={t('a11y.removeDrug')}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Drug Entry Label */}
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {t('current.drug')} {index + 1}
      </div>

      {/* Drug Selection */}
      <DrugCombobox
        value={input.drug || null}
        onChange={handleDrugChange}
        label={t('current.drug')}
        placeholder={t('current.searchDrug')}
      />

      {/* Route Selection */}
      {drugDef && routeOptions.length > 0 && (
        <TappableChipGroup
          label={t('current.route')}
          options={routeOptions}
          value={input.route || null}
          onChange={handleRouteChange}
        />
      )}

      {/* Frequency Selection (hidden for patches) */}
      {input.route && !isPatch && (
        <TappableChipGroup
          label={t('current.frequency')}
          options={FREQUENCY_VALUES}
          value={String(input.frequency)}
          onChange={handleFrequencyChange}
        />
      )}

      {/* Patch frequency note */}
      {isPatch && (
        <div className="text-xs text-gray-500 italic">
          {t('freq.72h')}
        </div>
      )}

      {/* Dose Input */}
      {input.route && (
        <div className="space-y-2">
          {!input.isAsymmetric ? (
            /* Single dose input */
            <NumberInput
              value={input.doses[0] || 0}
              onChange={(val) => handleDoseChange(0, val)}
              unit={doseUnit}
              label={t('current.dose')}
              placeholder="0"
            />
          ) : (
            /* Asymmetric dose inputs */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doseLabels.map((labelText, idx) => (
                <NumberInput
                  key={`${input.id}-dose-${idx}`}
                  value={input.doses[idx] || 0}
                  onChange={(val) => handleDoseChange(idx, val)}
                  unit={doseUnit}
                  label={labelText}
                  placeholder="0"
                />
              ))}
            </div>
          )}

          {/* Asymmetric toggle (not for patches) */}
          {!isPatch && (
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={input.isAsymmetric}
                onChange={handleAsymmetricToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  input.isAsymmetric ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    input.isAsymmetric ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </Switch>
              <span className="text-sm text-gray-600">
                {t('current.asymmetric.question')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
