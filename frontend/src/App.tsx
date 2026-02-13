import { useState, useEffect } from "react";
import { useLanguage } from "./i18n/LanguageContext";
import LanguageToggle from "./components/LanguageToggle";
import PatientParameters from "./components/PatientParameters";
import CurrentRegimen, { createEmptyInput } from "./components/CurrentRegimen";
import TargetRegimen from "./components/TargetRegimen";
import ResultsDisplay from "./components/ResultsDisplay";
import { computeTargetRegimen, getGfrSliderMin } from "./lib/conversions";
import type { OpioidInput, TargetResult } from "./lib/types";
import "./App.css";

function App() {
  const { t } = useLanguage();

  // Patient parameters
  const [bmi, setBmi] = useState("");
  const [gender, setGender] = useState("");
  const [gfr, setGfr] = useState("");

  // Current regimen
  const [inputs, setInputs] = useState<OpioidInput[]>([createEmptyInput()]);

  // Target regimen
  const [targetDrug, setTargetDrug] = useState("");
  const [targetRoute, setTargetRoute] = useState("");
  const [targetFrequency, setTargetFrequency] = useState(0);
  const [reductionPct, setReductionPct] = useState(25);
  const [result, setResult] = useState<TargetResult | null>(null);

  // Enforce slider minimum when GFR changes
  useEffect(() => {
    const gfrNum = gfr === "" ? null : parseFloat(gfr);
    if (gfrNum !== null && !isNaN(gfrNum)) {
      const minReduction = getGfrSliderMin(gfrNum);
      if (reductionPct < minReduction) {
        setReductionPct(minReduction);
      }
    }
  }, [gfr, reductionPct]);

  const isCurrentValid = inputs.some(
    (inp) =>
      inp.drug &&
      inp.route &&
      (inp.drug === "fentanyl" && inp.route === "patch"
        ? inp.doses[0] > 0
        : inp.frequency > 0 && inp.doses.some((d) => d > 0)),
  );

  const isPatch = targetDrug === "fentanyl" && targetRoute === "patch";
  const isTargetValid =
    targetDrug !== "" &&
    targetRoute !== "" &&
    (isPatch || targetFrequency > 0);

  const canCalculate = isCurrentValid && isTargetValid;

  function handleCalculate() {
    if (!canCalculate) return;

    const validInputs = inputs.filter(
      (inp) =>
        inp.drug &&
        inp.route &&
        (inp.drug === "fentanyl" && inp.route === "patch"
          ? inp.doses[0] > 0
          : inp.frequency > 0 && inp.doses.some((d) => d > 0)),
    );

    const gfrNum = gfr === "" ? null : parseFloat(gfr);

    try {
      const res = computeTargetRegimen(
        validInputs,
        targetDrug,
        targetRoute,
        isPatch ? 1 : targetFrequency,
        reductionPct,
        isNaN(gfrNum as number) ? null : gfrNum,
      );
      setResult(res);
    } catch (err) {
      console.error("Calculation error:", err);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>{t("app.title")}</h1>
          <p className="subtitle">{t("app.subtitle")}</p>
          <p className="description">{t("app.description")}</p>
        </div>
        <LanguageToggle />
      </header>

      <main className="app-main">
        {/* 1. Patient Parameters: BMI + Gender (top) */}
        <PatientParameters
          bmi={bmi}
          gender={gender}
          onBmiChange={setBmi}
          onGenderChange={setGender}
        />

        {/* 2. Current Opioid Regimen */}
        <CurrentRegimen inputs={inputs} onInputsChange={setInputs} />

        {/* 3. Target Regimen + GFR + Slider + Calculate */}
        <TargetRegimen
          targetDrug={targetDrug}
          targetRoute={targetRoute}
          targetFrequency={targetFrequency}
          reductionPct={reductionPct}
          gfr={gfr}
          onTargetDrugChange={setTargetDrug}
          onTargetRouteChange={setTargetRoute}
          onTargetFrequencyChange={setTargetFrequency}
          onReductionChange={setReductionPct}
          onGfrChange={setGfr}
          onCalculate={handleCalculate}
          canCalculate={canCalculate}
        />

        {/* 4. Results */}
        <ResultsDisplay result={result} />
      </main>

      <footer className="app-footer">
        <p>{t("misc.disclaimer")}</p>
      </footer>
    </div>
  );
}

export default App;
