import { useLanguage } from "../i18n/LanguageContext";
import { omeToFentanylPatch } from "../lib/conversions";
import type { TargetResult } from "../lib/types";

interface Props {
  result: TargetResult | null;
}

export default function ResultsDisplay({ result }: Props) {
  const { t, lang } = useLanguage();

  if (!result) return null;

  const isPatch = result.drug === "fentanyl" && result.route === "patch";
  const drugLabel = t(`drug.${result.drug}`);
  const routeLabel = t(`route.${result.route}`);

  const patchCombo = isPatch ? omeToFentanylPatch(result.reducedOme) : null;

  // Format patch combination as readable string
  function formatPatchCombo() {
    if (!patchCombo || patchCombo.patches.length === 0) return null;
    const parts = patchCombo.patches.map(
      (p) => `${p.count}× ${p.mcgPerHr} mcg/${lang === "hu" ? "óra" : "hr"}`,
    );
    return parts.join(" + ");
  }

  // Translate warning keys that come from computeTargetRegimen
  function translateWarning(w: string): string {
    // Check if it's a translation key (contains dots and matches known patterns)
    if (w.startsWith("gfr.")) {
      return t(w);
    }
    return w;
  }

  return (
    <div className="card results-card">
      <h2>{t("result.title")}</h2>

      <div className="result-grid">
        <div className="result-item">
          <span className="result-label">{t("result.totalOme")}</span>
          <span className="result-value">
            {result.totalOme} {lang === "hu" ? "mg OME/nap" : "mg OME/day"}
          </span>
        </div>

        <div className="result-item">
          <span className="result-label">{t("result.reducedOme")}</span>
          <span className="result-value">
            {result.reducedOme} {lang === "hu" ? "mg OME/nap" : "mg OME/day"}
          </span>
        </div>

        <div className="result-item highlight">
          <span className="result-label">
            {t("result.targetTdd")} ({drugLabel} — {routeLabel})
          </span>
          <span className="result-value large">
            {isPatch
              ? `${result.totalDailyDose} mg OME`
              : `${result.totalDailyDose} mg/${lang === "hu" ? "nap" : "day"}`}
          </span>
        </div>

        {isPatch && patchCombo && patchCombo.patches.length > 0 && (
          <div className="result-item highlight">
            <span className="result-label">{t("result.patchSuggestion")}</span>
            <span className="result-value large">
              {formatPatchCombo()}
            </span>
            <span className="result-note">
              ({lang === "hu" ? "Összesen" : "Total"}: {patchCombo.totalMcgPerHr} mcg/{lang === "hu" ? "óra" : "hr"})
            </span>
          </div>
        )}

        {!isPatch && (
          <div className="result-item">
            <span className="result-label">{t("result.dividedDoses")}</span>
            <span className="result-value">
              {result.dividedDoses.length}× {result.dividedDoses[0]} mg{" "}
              {t("result.perDose")}
            </span>
          </div>
        )}

        {result.breakthroughDose !== null && (
          <div className="result-item">
            <span className="result-label">{t("result.breakthrough")}</span>
            <span className="result-value">
              {result.breakthroughDose}{" "}
              {isPatch ? "mg OME" : "mg"}
            </span>
          </div>
        )}
      </div>

      {result.warnings.length > 0 && (
        <div className="warnings-section">
          <h3>{t("result.warnings")}</h3>
          {result.warnings.map((w, i) => (
            <div key={i} className="warning-box">
              <span className="warning-icon">&#9888;</span>
              <p>{translateWarning(w)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
