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
  "patient.bmi": {
    hu: "BMI",
    en: "BMI",
  },
  "patient.bmi.low": {
    hu: "< 19 (sovány)",
    en: "< 19 (underweight)",
  },
  "patient.bmi.normal": {
    hu: "19–26 (normál)",
    en: "19–26 (normal)",
  },
  "patient.bmi.high": {
    hu: "> 26 (túlsúlyos)",
    en: "> 26 (overweight)",
  },
  "patient.bmi.select": {
    hu: "Válasszon BMI tartományt...",
    en: "Select BMI range...",
  },
  "patient.bmi.warning.low": {
    hu: "Figyelem: Kisebb lehet a tolerancia és magasabb a toxicitási kockázat. Alacsony BMI esetén a lipofil opioidok (fentanil, metadon) nem tudnak nagy mennyiségben felhalmozódni a zsírszövetben, így magasabb plazmakoncentráció alakulhat ki. Fokozott légzésdepresszió kockázata.",
    en: "Caution: Lower tolerance and higher toxicity risk. In low BMI patients, lipophilic opioids (fentanyl, methadone) cannot accumulate in fat tissue, leading to higher plasma concentrations. Risk of respiratory depression is higher.",
  },
  "patient.bmi.warning.high": {
    hu: "A teljes testsúlyra történő adagolás könnyen túladagoláshoz vezethet! Javasoljuk, hogy az ideális testtömeg (IBW) alapján határozza meg a dóziscsökkentést. A zsírszövetben felhalmozódott szer lassabban szabadul fel (depóhatás), ami késleltetett eliminációt és fokozott légzésdepresszió-kockázatot okoz.",
    en: "Dosing based on total body weight may lead to overdose. Base reduction on Ideal Body Weight (IBW). Lipophilic opioids accumulate in fat tissue causing delayed elimination (depot effect) and increased risk of respiratory depression.",
  },
  "patient.gender": {
    hu: "Nem",
    en: "Gender",
  },
  "patient.gender.select": {
    hu: "Válasszon...",
    en: "Select...",
  },
  "patient.gender.male": {
    hu: "Férfi",
    en: "Male",
  },
  "patient.gender.female": {
    hu: "Nő",
    en: "Female",
  },
  "patient.gender.warning.female": {
    hu: "A kiszámolt dózis változtatandó lehet akár naponta is, ha premenopausában van a beteg! Az ösztrogén/progeszteron ingadozások befolyásolják az endogén opioid rendszert és a mu-receptor elérhetőségét. Orális gyógyszer adagolás ajánlott a rugalmasság érdekében.",
    en: "Dose requirements may fluctuate daily due to hormonal cycle (premenopause). Estrogen/progesterone fluctuations affect the endogenous opioid system and mu-receptor availability. Oral administration is recommended for flexibility.",
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
    hu: "GFR < 30 ml/perc: Magas opioid túladagolás és metabolit-felhalmozódás kockázata. Súlyos mellékhatásokhoz (légzésdepresszió, szedáció, neurotoxicitás) vezethet.",
    en: "GFR < 30 ml/min: High risk of opioid overdose and metabolite accumulation. May lead to severe side effects (respiratory depression, sedation, neurotoxicity).",
  },

  // GFR drug-specific warnings
  "gfr.drug.avoid": {
    hu: "KERÜLENDŐ! A morfin/kodein aktív metabolitjai felhalmozódnak (neurotoxicitás/szedáció). Fontolja meg a fentanil alkalmazását — nincs aktív metabolitja, biztonságosabb veseelégtelenségben.",
    en: "AVOID. Active metabolites of morphine/codeine accumulate (neurotoxicity/sedation). Consider fentanyl — no active metabolites, safest choice in renal failure.",
  },
  "gfr.drug.caution": {
    hu: "ÓVATOSAN! Csökkentett dózisban és ritkított gyakorisággal alkalmazandó. Szoros monitorozás szükséges.",
    en: "USE CAUTION. Reduce dose and frequency. Monitor closely.",
  },
  "gfr.drug.preferred": {
    hu: "ELŐNYÖS VÁLASZTÁS. A fentanil a legbiztonságosabb szer veseelégtelenségben (nincs aktív metabolitja).",
    en: "PREFERRED. Fentanyl is the safest choice in renal failure (no active metabolites).",
  },
  "gfr.below10.warning": {
    hu: "GFR < 10: Legalább 50%-os dóziscsökkentés javasolt és lassú dózisemelés (titrálás)!",
    en: "GFR < 10: Suggest 50% dose reduction and slow titration.",
  },
  "gfr.slider.locked": {
    hu: "A GFR érték alapján a minimális csökkentés",
    en: "Based on GFR value, minimum reduction is",
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
    hu: "Javasolt tapasz kombináció",
    en: "Suggested patch combination",
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
  "route.oral/mucosal": { hu: "Orális / mukozális (buccalis/szublinguális)", en: "Oral / Mucosal (buccal/sublingual)" },

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

  // Brand name labels
  "brand.naloxoneCombo": { hu: "+ Naloxon", en: "+ Naloxone" },

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

export function t(key: string, lang: Lang): string {
  const entry = (translations as Record<string, Record<string, string>>)[key];
  if (!entry) return key;
  return entry[lang] || key;
}

export default translations;
