import { useMemo } from 'react';
import Card from '../shared/Card.tsx';
import InlineWarning from '../shared/InlineWarning.tsx';
import { useCalculator } from './CalculatorProvider.tsx';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { findDrugById } from '../../lib/drug-database.ts';
import { formatTabletBreakdown, formatPatchCombination, formatFrequency } from '../../lib/formatting.ts';
import type { WarningItem, DoseDistribution, PatchCombination } from '../../lib/types.ts';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OmeSummary({
  totalOme,
  reducedOme,
  reductionPct,
  perDrugOme,
  t,
  lang,
}: {
  totalOme: number;
  reducedOme: number;
  reductionPct: number;
  perDrugOme: readonly { drug: string; route: string; ome: number }[];
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: 'hu' | 'en';
}) {
  return (
    <div className="space-y-1 text-sm text-gray-600">
      <div>{t('results.totalOme', { value: totalOme })}</div>
      {perDrugOme.length > 1 && (
        <div className="text-xs text-gray-500">
          (
          {perDrugOme.map((entry, idx) => {
            const drugDef = findDrugById(entry.drug);
            const name = drugDef
              ? typeof drugDef.displayName === 'object'
                ? drugDef.displayName[lang]
                : drugDef.displayName
              : entry.drug;
            return (
              <span key={`${entry.drug}-${entry.route}`}>
                {idx > 0 ? ' + ' : ''}
                {name} ({entry.route}): {Math.round(entry.ome * 10) / 10}
              </span>
            );
          })}
          )
        </div>
      )}
      <div>
        {t('results.reducedOme', { percent: reductionPct, value: reducedOme })}
      </div>
    </div>
  );
}

function TargetTddDisplay({
  actualTdd,
  drugName,
  isPatch,
  t,
}: {
  actualTdd: number;
  drugName: string;
  isPatch: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div className="py-3">
      <div className="text-2xl font-bold text-blue-700">
        {isPatch
          ? t('results.targetTddPatch', { value: actualTdd })
          : t('results.targetTdd', { value: actualTdd, drug: drugName })}
      </div>
    </div>
  );
}

function PracticalDosingTable({
  dividedDoses,
  targetTdd,
  actualTdd,
  roundingDeltaPct,
  frequency,
  t,
  lang,
}: {
  dividedDoses: readonly DoseDistribution[];
  targetTdd: number;
  actualTdd: number;
  roundingDeltaPct: number;
  frequency: number;
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: 'hu' | 'en';
}) {
  if (dividedDoses.length === 0) return null;

  // Calculate total tablets per day
  const totalTablets = dividedDoses.reduce(
    (sum, dose) =>
      sum + dose.tablets.reduce((ts, tab) => ts + tab.count, 0),
    0,
  );

  const freqLabel = formatFrequency(frequency, lang);

  return (
    <div className="bg-blue-50 rounded-lg p-4 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">
          {t('results.dosingTitle', { frequency: freqLabel })}
        </h3>
        {totalTablets > 0 && (
          <span className="text-xs text-blue-600 font-medium">
            {t('results.tabletsPerDay', { count: totalTablets })}
          </span>
        )}
      </div>

      {/* Dose rows */}
      <div className="divide-y divide-blue-100">
        {dividedDoses.map((dose, idx) => (
          <div
            key={idx}
            className={`py-2 flex items-baseline gap-3 ${
              idx % 2 === 0 ? '' : 'bg-blue-50/50'
            }`}
          >
            <span className="text-sm font-medium text-gray-700 min-w-20">
              {dose.label}:
            </span>
            <span className="text-sm font-bold text-gray-900">
              {dose.totalMg} mg
            </span>
            {dose.tablets.length > 0 && (
              <span className="text-xs text-gray-500">
                ({formatTabletBreakdown(dose.tablets)})
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Rounding footer */}
      {roundingDeltaPct !== 0 && (
        <div className="text-xs text-gray-500 border-t border-blue-100 pt-2">
          {t('results.roundingNote', {
            calculated: targetTdd,
            rounded: actualTdd,
            delta: roundingDeltaPct > 0 ? `+${roundingDeltaPct}` : String(roundingDeltaPct),
          })}
        </div>
      )}
    </div>
  );
}

function PatchCombinationDisplay({
  patchCombination,
  t,
  lang,
}: {
  patchCombination: readonly PatchCombination[];
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: 'hu' | 'en';
}) {
  if (patchCombination.length === 0) return null;

  const totalMcgHr = patchCombination.reduce(
    (sum, p) => sum + p.mcgPerHr * p.count,
    0,
  );

  const has12mcg = patchCombination.some((p) => p.mcgPerHr === 12);

  // Color map for patch sizes
  const patchColorMap: Record<number, string> = {
    12: 'bg-sky-100 border-sky-300 text-sky-800',
    25: 'bg-green-100 border-green-300 text-green-800',
    50: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    75: 'bg-orange-100 border-orange-300 text-orange-800',
    100: 'bg-red-100 border-red-300 text-red-800',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
        {t('results.patch.title')}
      </h3>

      {/* Visual patch cards */}
      <div className="flex flex-wrap gap-2">
        {patchCombination.map((patch, idx) =>
          Array.from({ length: patch.count }).map((_, countIdx) => (
            <div
              key={`${idx}-${countIdx}`}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 ${
                patchColorMap[patch.mcgPerHr] ?? 'bg-gray-100 border-gray-300 text-gray-800'
              }`}
            >
              <span className="text-lg font-bold">{patch.mcgPerHr}</span>
              <span className="text-xs">
                mcg/{lang === 'hu' ? '\u00f3ra' : 'hr'}
              </span>
            </div>
          )),
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-700 space-y-1">
        <div>{t('results.patch.total', { value: totalMcgHr })}</div>
        <div className="text-xs text-gray-500">
          {formatPatchCombination(patchCombination, lang)}
        </div>
        <div className="text-xs text-gray-500">
          {t('results.patch.change')}
        </div>
        {has12mcg && (
          <div className="text-xs text-blue-600">
            {t('results.patch.matrifen')}
          </div>
        )}
      </div>
    </div>
  );
}

function WarningSummary({
  warnings,
  t,
}: {
  warnings: readonly WarningItem[];
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  if (warnings.length === 0) return null;

  // Sort: danger first, then caution, then preferred, then info
  const priorityOrder: Record<string, number> = {
    danger: 0,
    caution: 1,
    preferred: 2,
    info: 3,
  };

  const sorted = [...warnings].sort(
    (a, b) => (priorityOrder[a.type] ?? 99) - (priorityOrder[b.type] ?? 99),
  );

  // Deduplicate by messageKey
  const seen = new Set<string>();
  const unique = sorted.filter((w) => {
    if (seen.has(w.messageKey)) return false;
    seen.add(w.messageKey);
    return true;
  });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
        {t('results.warnings.title')}
      </h3>
      {unique.map((w) => (
        <InlineWarning key={w.messageKey} variant={w.type}>
          {t(w.messageKey, w.params)}
        </InlineWarning>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ResultsCard
// ---------------------------------------------------------------------------

export default function ResultsCard() {
  const { state } = useCalculator();
  const { lang, t } = useLanguage();
  const result = state.result;

  const targetDrugDef = useMemo(
    () => (result?.targetDrug ? findDrugById(result.targetDrug) : undefined),
    [result?.targetDrug],
  );

  const drugName = useMemo(() => {
    if (!targetDrugDef) return '';
    return typeof targetDrugDef.displayName === 'object'
      ? targetDrugDef.displayName[lang]
      : targetDrugDef.displayName;
  }, [targetDrugDef, lang]);

  const isPatch = result?.targetRoute === 'patch';
  const isInjectable =
    result?.targetRoute === 'sc/iv' || result?.targetRoute === 'iv';

  if (!result) {
    return (
      <div id="results-card" aria-live="polite" aria-atomic="true" />
    );
  }

  return (
    <Card title={t('results.title')} id="results-card">
      <div className="space-y-4" aria-live="polite" aria-atomic="true">
        {/* A. OME Summary */}
        <OmeSummary
          totalOme={result.totalOme}
          reducedOme={result.reducedOme}
          reductionPct={result.reductionPct}
          perDrugOme={result.perDrugOme}
          t={t}
          lang={lang}
        />

        {/* B. Target TDD */}
        <TargetTddDisplay
          actualTdd={result.actualTdd}
          drugName={drugName}
          isPatch={!!isPatch}
          t={t}
        />

        {/* C. Practical Dosing Table (non-patch, non-injectable) */}
        {!isPatch && !isInjectable && result.dividedDoses.length > 0 && (
          <PracticalDosingTable
            dividedDoses={result.dividedDoses}
            targetTdd={result.targetTdd}
            actualTdd={result.actualTdd}
            roundingDeltaPct={result.roundingDeltaPct}
            frequency={result.targetFrequency}
            t={t}
            lang={lang}
          />
        )}

        {/* Injectable dosing info */}
        {isInjectable && result.dividedDoses.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-700">
              {result.dividedDoses.map((dose, idx) => (
                <div key={idx}>
                  {t('results.injectable.perDose', {
                    value: parseFloat(dose.totalMg.toFixed(2)),
                  })}
                  {' '}
                  {t('results.injectable.perDay', {
                    count: result.targetFrequency,
                    total: parseFloat(result.actualTdd.toFixed(2)),
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D. Patch Combination Display */}
        {isPatch && (
          <PatchCombinationDisplay
            patchCombination={result.patchCombination}
            t={t}
            lang={lang}
          />
        )}

        {/* F. Warning Summary */}
        <WarningSummary warnings={result.warnings} t={t} />
      </div>
    </Card>
  );
}
