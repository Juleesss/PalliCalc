export type Lang = "hu" | "en";

const translations = {
  // App header
  "app.title": {
    hu: "PalliCalc",
    en: "PalliCalc",
  },
  "app.subtitle": {
    hu: "Opioid Rotációs Kalkulátor",
    en: "Opioid Rotation Calculator",
  },
  "app.description": {
    hu: "Palliatív ellátó csapatok számára",
    en: "For palliative care teams",
  },

  // Language toggle
  "lang.hu": { hu: "Magyar", en: "Hungarian" },
  "lang.en": { hu: "Angol", en: "English" },

  // Patient parameters
  "patient.title": {
    hu: "Beteg paraméterek",
    en: "Patient Parameters",
  },
  "patient.gfr": {
    hu: "GFR (ml/perc)",
    en: "GFR (ml/min)",
  },
  "patient.gfr.placeholder": {
    hu: "pl. 60",
    en: "e.g. 60",
  },
  "patient.gfr.warning": {
    hu: "GFR < 30 ml/perc: Magas opioid túladagolás és metabolit-felhalmozódás kockázata. A morfin és a petidin különösen veszélyes. Fontolja meg a fentanil vagy szufentanil alkalmazását biztonságosabb alternatívaként.",
    en: "GFR < 30 ml/min: High risk of opioid overdose and metabolite accumulation. Morphine and pethidine are particularly dangerous. Consider fentanyl or sufentanil as safer alternatives.",
  },

  // Current regimen
  "current.title": {
    hu: "Jelenlegi opioid kezelés",
    en: "Current Opioid Regimen",
  },
  "current.drug": {
    hu: "Gyógyszer",
    en: "Drug",
  },
  "current.route": {
    hu: "Beviteli út",
    en: "Route",
  },
  "current.dose": {
    hu: "Egyszeri adag",
    en: "Single dose",
  },
  "current.frequency": {
    hu: "Adagolási gyakoriság",
    en: "Dosing frequency",
  },
  "current.asymmetrical": {
    hu: "Eltérő adagok napközben?",
    en: "Asymmetrical dosing throughout the day?",
  },
  "current.addDrug": {
    hu: "+ Gyógyszer hozzáadása",
    en: "+ Add Drug",
  },
  "current.remove": {
    hu: "Eltávolítás",
    en: "Remove",
  },
  "current.tdd": {
    hu: "Napi összdózis (TDD)",
    en: "Total Daily Dose (TDD)",
  },
  "current.ome": {
    hu: "Orális morfin ekvivalens",
    en: "Oral Morphine Equivalent",
  },
  "current.totalOme": {
    hu: "Összes OME",
    en: "Total OME",
  },
  "current.selectDrug": {
    hu: "Válasszon gyógyszert...",
    en: "Select drug...",
  },
  "current.selectRoute": {
    hu: "Válasszon beviteli utat...",
    en: "Select route...",
  },
  "current.selectFreq": {
    hu: "Válasszon gyakoriságot...",
    en: "Select frequency...",
  },

  // Dose labels for asymmetrical
  "dose.morning": { hu: "Reggel", en: "Morning" },
  "dose.noon": { hu: "Dél", en: "Noon" },
  "dose.afternoon": { hu: "Délután", en: "Afternoon" },
  "dose.evening": { hu: "Este", en: "Evening" },
  "dose.night": { hu: "Éjjel", en: "Night" },
  "dose.dose": { hu: "Adag", en: "Dose" },

  // Target regimen
  "target.title": {
    hu: "Cél opioid és rotációs beállítások",
    en: "Target Opioid & Rotation Settings",
  },
  "target.drug": {
    hu: "Cél gyógyszer",
    en: "Target Drug",
  },
  "target.route": {
    hu: "Beviteli út",
    en: "Route",
  },
  "target.frequency": {
    hu: "Adagolási gyakoriság",
    en: "Dosing frequency",
  },
  "target.reduction": {
    hu: "Inkomplett kereszttolerancia csökkentés",
    en: "Incomplete cross-tolerance reduction",
  },
  "target.calculate": {
    hu: "Számítás",
    en: "Calculate",
  },

  // Results
  "result.title": {
    hu: "Eredmények",
    en: "Results",
  },
  "result.totalOme": {
    hu: "Összes jelenlegi OME",
    en: "Total Current OME",
  },
  "result.reducedOme": {
    hu: "Csökkentett OME",
    en: "Reduced OME",
  },
  "result.targetTdd": {
    hu: "Cél napi összdózis",
    en: "Target Total Daily Dose",
  },
  "result.dividedDoses": {
    hu: "Elosztott adagok",
    en: "Divided Doses",
  },
  "result.breakthrough": {
    hu: "Áttörő fájdalom dózis (TDD 1/6-a)",
    en: "Breakthrough dose (1/6 of TDD)",
  },
  "result.patchSuggestion": {
    hu: "Javasolt tapasz erősség",
    en: "Suggested patch strength",
  },
  "result.warnings": {
    hu: "Figyelmeztetések",
    en: "Warnings",
  },
  "result.perDose": {
    hu: "adagonként",
    en: "per dose",
  },

  // Routes
  "route.oral": { hu: "Orális (szájon át)", en: "Oral" },
  "route.sc/iv": { hu: "SC / IV (parenterális)", en: "SC / IV (parenteral)" },
  "route.iv": { hu: "IV (intravénás)", en: "IV (intravenous)" },
  "route.patch": { hu: "Transzdermális tapasz", en: "Transdermal patch" },

  // Frequencies
  "freq.q24h": { hu: "24 óránként (1×/nap)", en: "Every 24h (1×/day)" },
  "freq.q12h": { hu: "12 óránként (2×/nap)", en: "Every 12h (2×/day)" },
  "freq.q8h": { hu: "8 óránként (3×/nap)", en: "Every 8h (3×/day)" },
  "freq.q6h": { hu: "6 óránként (4×/nap)", en: "Every 6h (4×/day)" },
  "freq.q4h": { hu: "4 óránként (6×/nap)", en: "Every 4h (6×/day)" },
  "freq.q72h": { hu: "72 óránként (tapasz)", en: "Every 72h (patch)" },

  // Drug names
  "drug.morphine": { hu: "Morfin", en: "Morphine" },
  "drug.oxycodone": { hu: "Oxikodon", en: "Oxycodone" },
  "drug.hydromorphone": { hu: "Hidromorfon", en: "Hydromorphone" },
  "drug.tramadol": { hu: "Tramadol", en: "Tramadol" },
  "drug.dihydrocodeine": { hu: "Dihidrokodein", en: "Dihydrocodeine" },
  "drug.fentanyl": { hu: "Fentanil", en: "Fentanyl" },
  "drug.methadone": { hu: "Metadon", en: "Methadone" },
  "drug.nalbuphine": { hu: "Nalbufin", en: "Nalbuphine" },
  "drug.pethidine": { hu: "Petidin", en: "Pethidine" },

  // Units
  "unit.mg": { hu: "mg", en: "mg" },
  "unit.mcg": { hu: "mcg", en: "mcg" },
  "unit.mcg_hr": { hu: "mcg/óra", en: "mcg/hr" },
  "unit.mg_day": { hu: "mg/nap", en: "mg/day" },
  "unit.ome_day": { hu: "mg OME/nap", en: "mg OME/day" },

  // Misc
  "misc.yes": { hu: "Igen", en: "Yes" },
  "misc.no": { hu: "Nem", en: "No" },
  "misc.warning": { hu: "Figyelmeztetés", en: "Warning" },
  "misc.disclaimer": {
    hu: "Ez az eszköz klinikai döntéstámogató segédeszköz. A végső dózis meghatározása mindig az orvos felelőssége. Betegadat nem kerül tárolásra.",
    en: "This tool is a clinical decision support aid. Final dosing decisions are always the clinician's responsibility. No patient data is stored.",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || key;
}

export default translations;
