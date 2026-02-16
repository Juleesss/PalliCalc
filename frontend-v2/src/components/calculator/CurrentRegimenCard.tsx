import { useMemo, useState, useEffect } from 'react';
import Card from '../shared/Card.tsx';
import DrugEntry from './DrugEntry.tsx';
import { useCalculator } from './CalculatorProvider.tsx';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { calculateTdd, drugDoseToOme } from '../../lib/conversions.ts';
import { findDrugById } from '../../lib/drug-database.ts';

export default function CurrentRegimenCard() {
  const { state, dispatch } = useCalculator();
  const { lang, t } = useLanguage();

  // Calculate OME (instant, for debounce input)
  const omeBreakdownRaw = useMemo(() => {
    const entries: { label: string; ome: number }[] = [];
    let total = 0;

    for (const input of state.currentDrugs) {
      if (!input.drug || !input.route) continue;

      const tdd = calculateTdd(input.doses, input.frequency, input.isAsymmetric);
      if (tdd <= 0) continue;

      const ome = drugDoseToOme(input.drug, input.route, tdd);
      if (ome <= 0) continue;

      const drugDef = findDrugById(input.drug);
      const drugName = drugDef
        ? typeof drugDef.displayName === 'object'
          ? drugDef.displayName[lang]
          : drugDef.displayName
        : input.drug;

      const routeLabel = input.route === 'patch' ? '' : ` (${input.route})`;
      entries.push({
        label: `${drugName}${routeLabel}`,
        ome: Math.round(ome * 10) / 10,
      });
      total += ome;
    }

    return { entries, total: Math.round(total * 10) / 10 };
  }, [state.currentDrugs, lang]);

  // Debounce the OME display by 300ms
  const [omeBreakdown, setOmeBreakdown] = useState(omeBreakdownRaw);
  useEffect(() => {
    const timer = setTimeout(() => setOmeBreakdown(omeBreakdownRaw), 300);
    return () => clearTimeout(timer);
  }, [omeBreakdownRaw]);

  const handleAddDrug = () => {
    dispatch({ type: 'ADD_DRUG' });
  };

  const handleRemoveDrug = (id: string) => {
    dispatch({ type: 'REMOVE_DRUG', payload: { id } });
  };

  return (
    <Card title={t('current.title')}>
      <div className="space-y-3">
        {state.currentDrugs.map((input, idx) => (
          <DrugEntry
            key={input.id}
            index={idx}
            input={input}
            showRemove={state.currentDrugs.length > 1}
            onRemove={() => handleRemoveDrug(input.id)}
          />
        ))}

        {/* Add Drug Button */}
        <button
          type="button"
          onClick={handleAddDrug}
          className="w-full h-12 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('a11y.addDrug')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="text-sm font-medium">{t('current.addDrug')}</span>
        </button>

        {/* Running OME Total */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            {omeBreakdown.total > 0
              ? t('current.omeTotal', { value: omeBreakdown.total })
              : t('current.omeTotalEmpty')}
          </div>
          {omeBreakdown.entries.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              (
              {omeBreakdown.entries
                .map((e) => `${e.label}: ${e.ome}`)
                .join(' + ')}
              )
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
