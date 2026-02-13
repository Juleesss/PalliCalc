import { useLanguage } from "../i18n/LanguageContext";
import { DRUG_OPTIONS } from "../lib/conversions";
import type { OpioidInput } from "../lib/types";

interface Props {
  inputs: OpioidInput[];
  onInputsChange: (inputs: OpioidInput[]) => void;
}

/**
 * Return the correct dose labels for a given frequency.
 * For frequency=2 (q12h): Morning + Evening (not Noon).
 */
function getDoseLabelsForFrequency(frequency: number): string[] {
  switch (frequency) {
    case 1:
      return ["dose.morning"];
    case 2:
      return ["dose.morning", "dose.evening"];
    case 3:
      return ["dose.morning", "dose.afternoon", "dose.night"];
    case 4:
      return ["dose.morning", "dose.noon", "dose.afternoon", "dose.evening"];
    case 6:
      return [
        "dose.morning",
        "dose.noon",
        "dose.afternoon",
        "dose.evening",
        "dose.night",
        "dose.dose",
      ];
    default:
      return Array.from({ length: frequency }, () => `dose.dose`);
  }
}

function getFrequencyOptions(drug: string, route: string) {
  if (drug === "fentanyl" && route === "patch") {
    return [{ value: 1, labelKey: "freq.q72h" }];
  }
  return [
    { value: 1, labelKey: "freq.q24h" },
    { value: 2, labelKey: "freq.q12h" },
    { value: 3, labelKey: "freq.q8h" },
    { value: 4, labelKey: "freq.q6h" },
    { value: 6, labelKey: "freq.q4h" },
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

/** Render drug options with brand names as optgroups */
function DrugSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (drug: string, routeHint?: string) => void;
  placeholder: string;
}) {
  const { t } = useLanguage();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val) {
      onChange("", undefined);
      return;
    }
    // Compound value: "drug|routeHint" or just "drug"
    const parts = val.split("|");
    onChange(parts[0], parts[1] || undefined);
  }

  return (
    <select value={value} onChange={handleChange}>
      <option value="">{placeholder}</option>
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
  );
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

  function handleDrugSelect(index: number, drug: string, routeHint?: string) {
    if (!drug) {
      updateInput(index, { drug: "", route: "", frequency: 0, doses: [0], asymmetrical: false });
      return;
    }
    updateInput(index, { drug });
    // If brand provided a route hint, auto-set route
    if (routeHint) {
      const drugOpt = DRUG_OPTIONS.find((d) => d.drug === drug);
      if (drugOpt && drugOpt.routes.includes(routeHint)) {
        // Use setTimeout to ensure drug state is set first
        setTimeout(() => {
          updateInput(index, { route: routeHint });
        }, 0);
      }
    }
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
        const doseLabels = getDoseLabelsForFrequency(inp.frequency);

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

            {/* Drug selection with brand names */}
            <div className="field">
              <label>{t("current.drug")}</label>
              <DrugSelect
                value={inp.drug}
                onChange={(drug, routeHint) => handleDrugSelect(idx, drug, routeHint)}
                placeholder={t("current.selectDrug")}
              />
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
                      {t(`route.${r}`)}
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
                        {di < doseLabels.length
                          ? t(doseLabels[di])
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
