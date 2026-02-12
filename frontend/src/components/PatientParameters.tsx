import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  gfr: string;
  onGfrChange: (value: string) => void;
}

export default function PatientParameters({ gfr, onGfrChange }: Props) {
  const { t } = useLanguage();
  const gfrNum = gfr === "" ? null : parseFloat(gfr);
  const showWarning = gfrNum !== null && !isNaN(gfrNum) && gfrNum < 30;

  return (
    <div className="card patient-card">
      <h2>{t("patient.title")}</h2>

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
          className={showWarning ? "input-warning" : ""}
        />
      </div>

      {showWarning && (
        <div className="warning-box">
          <span className="warning-icon">&#9888;</span>
          <p>{t("patient.gfr.warning")}</p>
        </div>
      )}
    </div>
  );
}
