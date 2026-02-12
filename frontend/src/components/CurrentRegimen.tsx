import { useLanguage } from "../i18n/LanguageContext";
import { DRUG_OPTIONS } from "../lib/conversions";
import type { OpioidInput } from "../lib/types";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  inputs: OpioidInput[];
  onInputsChange: (inputs: OpioidInput[]) => void;
}

const DOSE_LABELS: TranslationKey[] = [
  "dose.morning",
  "dose.noon",
  "dose.afternoon",
  "dose.evening",
  "dose.night",
  "dose.dose",
];

function getFrequencyOptions(drug: string, route: string) {
  if (drug === "fentanyl" && route === "patch") {
    return [{ value: 1, labelKey: "freq.q72h" as TranslationKey }];
  }
  return [
    { value: 1, labelKey: "freq.q24h" as TranslationKey },
    { value: 2, labelKey: "freq.q12h" as TranslationKey },
    { value: 3, labelKey: "freq.q8h" as TranslationKey },
    { value: 4, labelKey: "freq.q6h" as TranslationKey },
    { value: 6, labelKey: "freq.q4h" as TranslationKey },
  ];
}

let nextId = 1;

function createEmptyInput(): OpioidInput {
  return {
    id: String(nextId++),
    drug: "",
    route: "",
    doses: [0],
    frequency: 0,
    asymmetrical: false,
  };
}

export default function CurrentRegimen({ inputs, onInputsChange }: Props) {
  const { t, lang } = useLanguage();

  function updateInput(index: number, partial: Partial<OpioidInput>) {
    const updated = inputs.map((inp, i) => {
      if (i !== index) return inp;
      const merged = { ...inp, ...partial };

      // When drug changes, reset route and frequency
      if (partial.drug !== undefined && partial.drug !== inp.drug) {
        merged.route = "";
        merged.frequency = 0;
        merged.doses = [0];
        merged.asymmetrical = false;
      }

      // When route changes, reset frequency
      if (partial.route !== undefined && partial.route !== inp.route) {
        if (merged.drug === "fentanyl" && partial.route === "patch") {
          merged.frequency = 1;
        } else {
          merged.frequency = 0;
        }
        merged.doses = [0];
        merged.asymmetrical = false;
      }

      // When frequency changes and asymmetrical, adjust doses array
      if (partial.frequency !== undefined && merged.asymmetrical) {
        const newLen = partial.frequency;
        const currentDoses = merged.doses;
        merged.doses = Array.from({ length: newLen }, (_, i) => currentDoses[i] ?? 0);
      }

      // When toggling asymmetrical
      if (partial.asymmetrical !== undefined) {
        if (partial.asymmetrical && merged.frequency > 0) {
          merged.doses = Array.from({ length: merged.frequency }, () => merged.doses[0] || 0);
        } else {
          merged.doses = [merged.doses[0] || 0];
        }
      }

      return merged;
    });
    onInputsChange(updated);
  }

  function addInput() {
    onInputsChange([...inputs, createEmptyInput()]);
  }

  function removeInput(index: number) {
    if (inputs.length <= 1) return;
    onInputsChange(inputs.filter((_, i) => i !== index));
  }

  function updateDose(inputIndex: number, doseIndex: number, value: number) {
    const inp = inputs[inputIndex];
    const newDoses = [...inp.doses];
    newDoses[doseIndex] = value;
    updateInput(inputIndex, { doses: newDoses });
  }

  const isPatch = (inp: OpioidInput) =>
    inp.drug === "fentanyl" && inp.route === "patch";

  return (
    <div className="card current-card">
      <h2>{t("current.title")}</h2>

      {inputs.map((inp, idx) => {
        const drugOpt = DRUG_OPTIONS.find((d) => d.drug === inp.drug);
        const routes = drugOpt?.routes ?? [];
        const freqOptions = inp.drug && inp.route
          ? getFrequencyOptions(inp.drug, inp.route)
          : [];
        const unit = isPatch(inp) ? "mcg/hr" : (drugOpt?.unit ?? "mg");

        return (
          <div key={inp.id} className="drug-entry">
            {inputs.length > 1 && (
              <button
                className="btn-remove"
                onClick={() => removeInput(idx)}
                aria-label={t("current.remove")}
              >
                &times;
              </button>
            )}

            {/* Drug selection */}
            <div className="field">
              <label>{t("current.drug")}</label>
              <select
                value={inp.drug}
                onChange={(e) => updateInput(idx, { drug: e.target.value })}
              >
                <option value="">{t("current.selectDrug")}</option>
                {DRUG_OPTIONS.map((d) => (
                  <option key={d.drug} value={d.drug}>
                    {t(`drug.${d.drug}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Route selection */}
            {inp.drug && (
              <div className="field">
                <label>{t("current.route")}</label>
                <select
                  value={inp.route}
                  onChange={(e) => updateInput(idx, { route: e.target.value })}
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

            {/* Frequency */}
            {inp.drug && inp.route && !isPatch(inp) && (
              <div className="field">
                <label>{t("current.frequency")}</label>
                <select
                  value={inp.frequency}
                  onChange={(e) =>
                    updateInput(idx, { frequency: parseInt(e.target.value) })
                  }
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

            {/* Asymmetrical dosing toggle */}
            {inp.drug && inp.route && inp.frequency > 0 && !isPatch(inp) && (
              <div className="field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={inp.asymmetrical}
                    onChange={(e) =>
                      updateInput(idx, { asymmetrical: e.target.checked })
                    }
                  />
                  {t("current.asymmetrical")}
                </label>
              </div>
            )}

            {/* Dose input(s) */}
            {inp.drug && inp.route && (isPatch(inp) || inp.frequency > 0) && (
              <div className="doses-section">
                {inp.asymmetrical ? (
                  inp.doses.map((dose, di) => (
                    <div key={di} className="field dose-field">
                      <label>
                        {di < DOSE_LABELS.length
                          ? t(DOSE_LABELS[di])
                          : `${t("dose.dose")} ${di + 1}`}{" "}
                        ({unit})
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        value={dose || ""}
                        onChange={(e) =>
                          updateDose(idx, di, parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  ))
                ) : (
                  <div className="field dose-field">
                    <label>
                      {isPatch(inp)
                        ? `${t("current.dose")} (${lang === "hu" ? "mcg/óra" : "mcg/hr"})`
                        : `${t("current.dose")} (${unit})`}
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={inp.doses[0] || ""}
                      onChange={(e) =>
                        updateDose(idx, 0, parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button className="btn-add" onClick={addInput}>
        {t("current.addDrug")}
      </button>
    </div>
  );
}

export { createEmptyInput };
