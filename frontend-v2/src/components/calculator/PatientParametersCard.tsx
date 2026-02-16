import { useMemo } from 'react';
import Card from '../shared/Card.tsx';
import TappableChipGroup from '../shared/TappableChipGroup.tsx';
import InlineWarning from '../shared/InlineWarning.tsx';
import { useCalculator } from './CalculatorProvider.tsx';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { getBmiWarnings, getGenderWarnings } from '../../lib/warnings.ts';
import type { BmiCategory, Gender } from '../../lib/types.ts';

export default function PatientParametersCard() {
  const { state, dispatch } = useCalculator();
  const { t } = useLanguage();

  const bmiOptions = useMemo(
    () => [
      { value: 'low', label: t('patient.bmi.low') },
      { value: 'normal', label: t('patient.bmi.normal') },
      { value: 'high', label: t('patient.bmi.high') },
    ],
    [t],
  );

  const genderOptions = useMemo(
    () => [
      { value: 'male', label: t('patient.gender.male') },
      { value: 'female', label: t('patient.gender.female') },
    ],
    [t],
  );

  const bmiWarnings = useMemo(
    () => (state.bmi ? getBmiWarnings(state.bmi) : []),
    [state.bmi],
  );

  const genderWarnings = useMemo(
    () => (state.gender ? getGenderWarnings(state.gender) : []),
    [state.gender],
  );

  return (
    <Card title={t('patient.title')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* BMI Section */}
        <div className="space-y-2">
          <TappableChipGroup
            label={t('patient.bmi')}
            options={bmiOptions}
            value={state.bmi}
            onChange={(val) =>
              dispatch({ type: 'SET_BMI', payload: val as BmiCategory })
            }
          />
          {bmiWarnings.map((w) => (
            <InlineWarning key={w.messageKey} variant={w.type}>
              {t(w.messageKey, w.params)}
            </InlineWarning>
          ))}
        </div>

        {/* Gender Section */}
        <div className="space-y-2">
          <TappableChipGroup
            label={t('patient.gender')}
            options={genderOptions}
            value={state.gender}
            onChange={(val) =>
              dispatch({ type: 'SET_GENDER', payload: val as Gender })
            }
          />
          {genderWarnings.map((w) => (
            <InlineWarning key={w.messageKey} variant={w.type}>
              {t(w.messageKey, w.params)}
            </InlineWarning>
          ))}
        </div>
      </div>
    </Card>
  );
}
