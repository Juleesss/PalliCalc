import { useLanguage } from "../i18n/LanguageContext";
import { DRUG_OPTIONS } from "../lib/conversions";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  targetDrug: string;
  targetRoute: string;
  targetFrequency: number;
  reductionPct: number;
  onTargetDrugChange: (drug: string) => void;
  onTargetRouteChange: (route: string) => void;
  onTargetFrequencyChange: (freq: number) => void;
  onReductionChange: (pct: number) => void;
  onCalculate: () => void;
  canCalculate: boolean;
}

export default function TargetRegimen({
  targetDrug,
  targetRoute,
  targetFrequency,
  reductionPct,
  onTargetDrugChange,
  onTargetRouteChange,
  onTargetFrequencyChange,
  onReductionChange,
  onCalculate,
  canCalculate,
}: Props) {
  const { t } = useLanguage();

  const drugOpt = DRUG_OPTIONS.find((d) => d.drug === targetDrug);
  const routes = drugOpt?.routes ?? [];
  const isPatch = targetDrug === "fentanyl" && targetRoute === "patch";

  const freqOptions = [
    { value: 1, labelKey: "freq.q24h" as TranslationKey },
    { value: 2, labelKey: "freq.q12h" as TranslationKey },
    { value: 3, labelKey: "freq.q8h" as TranslationKey },
    { value: 4, labelKey: "freq.q6h" as TranslationKey },
    { value: 6, labelKey: "freq.q4h" as TranslationKey },
  ];

  function handleDrugChange(drug: string) {
    onTargetDrugChange(drug);
    onTargetRouteChange("");
    onTargetFrequencyChange(0);
  }

  function handleRouteChange(route: string) {
    onTargetRouteChange(route);
    if (targetDrug === "fentanyl" && route === "patch") {
      onTargetFrequencyChange(1);
    } else {
      onTargetFrequencyChange(0);
    }
  }

  return (
    <div className="card target-card">
      <h2>{t("target.title")}</h2>

      {/* Target drug */}
      <div className="field">
        <label>{t("target.drug")}</label>
        <select
          value={targetDrug}
          onChange={(e) => handleDrugChange(e.target.value)}
        >
          <option value="">{t("current.selectDrug")}</option>
          {DRUG_OPTIONS.map((d) => (
            <option key={d.drug} value={d.drug}>
              {t(`drug.${d.drug}` as TranslationKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Target route */}
      {targetDrug && (
        <div className="field">
          <label>{t("target.route")}</label>
          <select
            value={targetRoute}
            onChange={(e) => handleRouteChange(e.target.value)}
          >
            <option value="">{t("current.selectRoute")}</option>
            {routes.map((r) => (
              <option key={r} value={r}>
                {t(`route.${r}` as TranslationKey)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Target frequency (not for patches) */}
      {targetDrug && targetRoute && !isPatch && (
        <div className="field">
          <label>{t("target.frequency")}</label>
          <select
            value={targetFrequency}
            onChange={(e) => onTargetFrequencyChange(parseInt(e.target.value))}
          >
            <option value={0}>{t("current.selectFreq")}</option>
            {freqOptions.map((f) => (
              <option key={f.value} value={f.value}>
                {t(f.labelKey)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reduction slider */}
      <div className="field reduction-field">
        <label>
          {t("target.reduction")}: <strong>{reductionPct}%</strong>
        </label>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={reductionPct}
          onChange={(e) => onReductionChange(parseInt(e.target.value))}
          className="slider"
        />
        <div className="slider-labels">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Calculate button */}
      <button
        className="btn-calculate"
        onClick={onCalculate}
        disabled={!canCalculate}
      >
        {t("target.calculate")}
      </button>
    </div>
  );
}
