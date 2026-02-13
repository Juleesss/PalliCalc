import { useLanguage } from "../i18n/LanguageContext";
import { DRUG_OPTIONS, getGfrSliderMin } from "../lib/conversions";

interface Props {
  targetDrug: string;
  targetRoute: string;
  targetFrequency: number;
  reductionPct: number;
  gfr: string;
  onTargetDrugChange: (drug: string) => void;
  onTargetRouteChange: (route: string) => void;
  onTargetFrequencyChange: (freq: number) => void;
  onReductionChange: (pct: number) => void;
  onGfrChange: (value: string) => void;
  onCalculate: () => void;
  canCalculate: boolean;
}

export default function TargetRegimen({
  targetDrug,
  targetRoute,
  targetFrequency,
  reductionPct,
  gfr,
  onTargetDrugChange,
  onTargetRouteChange,
  onTargetFrequencyChange,
  onReductionChange,
  onGfrChange,
  onCalculate,
  canCalculate,
}: Props) {
  const { t } = useLanguage();

  const drugOpt = DRUG_OPTIONS.find((d) => d.drug === targetDrug);
  const routes = drugOpt?.routes ?? [];
  const isPatch = targetDrug === "fentanyl" && targetRoute === "patch";

  const freqOptions = [
    { value: 1, labelKey: "freq.q24h" },
    { value: 2, labelKey: "freq.q12h" },
    { value: 3, labelKey: "freq.q8h" },
    { value: 4, labelKey: "freq.q6h" },
    { value: 6, labelKey: "freq.q4h" },
  ];

  // GFR parsing and slider locking
  const gfrNum = gfr === "" ? null : parseFloat(gfr);
  const gfrValid = gfrNum !== null && !isNaN(gfrNum);
  const showGfrWarning = gfrValid && gfrNum! < 30;
  const sliderMin = getGfrSliderMin(gfrValid ? gfrNum : null);

  function handleDrugChange(drug: string) {
    onTargetDrugChange(drug);
    onTargetRouteChange("");
    onTargetFrequencyChange(0);
  }

  function handleDrugSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val) {
      handleDrugChange("");
      return;
    }
    const parts = val.split("|");
    const drug = parts[0];
    const routeHint = parts[1] || undefined;

    handleDrugChange(drug);
    if (routeHint) {
      const opt = DRUG_OPTIONS.find((d) => d.drug === drug);
      if (opt && opt.routes.includes(routeHint)) {
        setTimeout(() => {
          handleRouteChange(routeHint);
        }, 0);
      }
    }
  }

  function handleRouteChange(route: string) {
    onTargetRouteChange(route);
    if (targetDrug === "fentanyl" && route === "patch") {
      onTargetFrequencyChange(1);
    } else {
      onTargetFrequencyChange(0);
    }
  }

  function handleSliderChange(value: number) {
    onReductionChange(Math.max(value, sliderMin));
  }

  return (
    <div className="card target-card">
      <h2>{t("target.title")}</h2>

      {/* Target drug with brand names */}
      <div className="field">
        <label>{t("target.drug")}</label>
        <select value={targetDrug} onChange={handleDrugSelect}>
          <option value="">{t("current.selectDrug")}</option>
          {DRUG_OPTIONS.map((d) => {
            const drugLabel = t(`drug.${d.drug}`);
            const hasBrands = d.brands && d.brands.length > 0;

            if (!hasBrands) {
              return (
                <option key={d.drug} value={d.drug}>
                  {drugLabel}
                </option>
              );
            }

            return (
              <optgroup key={d.drug} label={drugLabel}>
                <option value={d.drug}>{drugLabel}</option>
                {d.brands!.map((brand, i) => {
                  const routeVal = brand.routeHint
                    ? `${d.drug}|${brand.routeHint}`
                    : d.drug;
                  const suffix = brand.naloxoneCombo
                    ? ` [${t("brand.naloxoneCombo")}]`
                    : "";
                  const formStr = brand.form ? ` (${brand.form})` : "";
                  return (
                    <option key={`${d.drug}-${i}`} value={routeVal}>
                      {brand.name}
                      {formStr}
                      {suffix}
                    </option>
                  );
                })}
              </optgroup>
            );
          })}
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
                {t(`route.${r}`)}
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

      {/* GFR input (moved here — after opioid selection) */}
      <div className="field">
        <label htmlFor="gfr-input">{t("patient.gfr")}</label>
        <input
          id="gfr-input"
          type="number"
          inputMode="decimal"
          min="0"
          max="200"
          step="1"
          value={gfr}
          onChange={(e) => onGfrChange(e.target.value)}
          placeholder={t("patient.gfr.placeholder")}
          className={showGfrWarning ? "input-warning" : ""}
        />
      </div>

      {showGfrWarning && (
        <div className="warning-box">
          <span className="warning-icon">&#9888;</span>
          <p>{t("patient.gfr.warning")}</p>
        </div>
      )}

      {/* Reduction slider */}
      <div className="field reduction-field">
        <label>
          {t("target.reduction")}: <strong>{reductionPct}%</strong>
        </label>
        <input
          type="range"
          min={sliderMin}
          max="70"
          step="5"
          value={Math.max(reductionPct, sliderMin)}
          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          className="slider"
        />
        <div className="slider-labels">
          <span>{sliderMin > 0 ? `${sliderMin}%` : "0%"}</span>
          <span>35%</span>
          <span>70%</span>
        </div>
        {sliderMin > 0 && (
          <p className="slider-lock-note">
            {t("gfr.slider.locked")} {sliderMin}%
          </p>
        )}
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
