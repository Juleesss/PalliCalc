import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  bmi: string;
  gender: string;
  onBmiChange: (value: string) => void;
  onGenderChange: (value: string) => void;
}

export default function PatientParameters({
  bmi,
  gender,
  onBmiChange,
  onGenderChange,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="card patient-card">
      <h2>{t("patient.title")}</h2>

      {/* BMI selector */}
      <div className="field">
        <label htmlFor="bmi-input">{t("patient.bmi")}</label>
        <select
          id="bmi-input"
          value={bmi}
          onChange={(e) => onBmiChange(e.target.value)}
        >
          <option value="">{t("patient.bmi.select")}</option>
          <option value="low">{t("patient.bmi.low")}</option>
          <option value="normal">{t("patient.bmi.normal")}</option>
          <option value="high">{t("patient.bmi.high")}</option>
        </select>
      </div>

      {bmi === "low" && (
        <div className="warning-box warning-orange">
          <span className="warning-icon">&#9888;</span>
          <p>{t("patient.bmi.warning.low")}</p>
        </div>
      )}

      {bmi === "high" && (
        <div className="warning-box warning-orange">
          <span className="warning-icon">&#9888;</span>
          <p>{t("patient.bmi.warning.high")}</p>
        </div>
      )}

      {/* Gender selector */}
      <div className="field">
        <label htmlFor="gender-input">{t("patient.gender")}</label>
        <select
          id="gender-input"
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
        >
          <option value="">{t("patient.gender.select")}</option>
          <option value="male">{t("patient.gender.male")}</option>
          <option value="female">{t("patient.gender.female")}</option>
        </select>
      </div>

      {gender === "female" && (
        <div className="warning-box warning-orange">
          <span className="warning-icon">&#9888;</span>
          <p>{t("patient.gender.warning.female")}</p>
        </div>
      )}
    </div>
  );
}
