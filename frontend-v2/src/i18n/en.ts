// =============================================================================
// PalliCalc v2.0 — English Translations
// Complete English translation file for the opioid rotation calculator.
// Every key in hu.ts MUST have a corresponding key here.
// =============================================================================

const en: Record<string, string> = {
  // ---------------------------------------------------------------------------
  // App Chrome
  // ---------------------------------------------------------------------------
  'app.title': 'PalliCalc',
  'app.subtitle': 'Opioid Rotation Calculator',
  'app.disclaimer':
    'This application is a clinical decision support tool. All dose adjustments must be approved by the treating physician. Individual patient factors and clinical judgment always override calculator suggestions.',
  'app.lang.hu': 'HU',
  'app.lang.en': 'EN',
  'app.reset': 'New Calculation',
  'app.version': 'v2.0',
  'app.offline': 'Offline',

  // ---------------------------------------------------------------------------
  // Patient Parameters
  // ---------------------------------------------------------------------------
  'patient.title': 'Patient Parameters',
  'patient.bmi': 'BMI',
  'patient.bmi.low': '< 19',
  'patient.bmi.normal': '19\u201326',
  'patient.bmi.high': '> 26',
  'patient.gender': 'Gender',
  'patient.gender.male': 'Male',
  'patient.gender.female': 'Female',

  // ---------------------------------------------------------------------------
  // BMI Warnings
  // ---------------------------------------------------------------------------
  'warning.bmi.low':
    'Pay attention to dosing \u2014 tolerance may be lower and toxicity risk is higher. In low BMI patients, lipophilic opioids (fentanyl, methadone) cannot accumulate in fat tissue, leading to higher plasma concentrations. Risk of respiratory depression is higher.',
  'warning.bmi.high':
    'Dosing based on total body weight may lead to overdose. Base reduction on Ideal Body Weight (IBW). Lipophilic opioids accumulate in fat tissue causing delayed elimination (depot effect) and increased respiratory depression risk.',

  // ---------------------------------------------------------------------------
  // Gender Warnings
  // ---------------------------------------------------------------------------
  'warning.gender.female':
    'Dose requirements may fluctuate daily due to hormonal cycle (premenopause). Estrogen/progesterone fluctuations affect the endogenous opioid system and mu-receptor availability. Oral administration is recommended for flexibility.',

  // ---------------------------------------------------------------------------
  // Current Regimen
  // ---------------------------------------------------------------------------
  'current.title': 'Current Opioid Regimen',
  'current.addDrug': '+ Add Drug',
  'current.removeDrug': 'Remove',
  'current.asymmetric': 'Unequal doses',
  'current.asymmetric.question': 'Unequal doses throughout the day?',
  'current.omeTotal': 'Total OME: {value} mg/day',
  'current.omeTotalEmpty': 'Total OME: ---',
  'current.drug': 'Drug',
  'current.route': 'Route',
  'current.frequency': 'Frequency',
  'current.dose': 'Dose',
  'current.dose.unit.mg': 'mg',
  'current.dose.unit.mcg': 'mcg/hr',
  'current.searchDrug': 'Search by name or brand...',
  'current.selectDrug': 'Select a drug...',
  'current.perDrugOme': '{drug} ({route}): {ome} mg',
  'current.noDrugSelected': 'No drug selected',

  // ---------------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------------
  'route.oral': 'Oral',
  'route.sc_iv': 'SC/IV',
  'route.patch': 'Patch',
  'route.mucosal': 'Mucosal',
  'route.iv': 'IV',
  'route.oral_mucosal': 'Mucosal',

  // ---------------------------------------------------------------------------
  // Frequencies
  // ---------------------------------------------------------------------------
  'freq.24h': 'Every 24 hours',
  'freq.12h': 'Every 12 hours',
  'freq.8h': 'Every 8 hours',
  'freq.6h': 'Every 6 hours',
  'freq.4h': 'Every 4 hours',
  'freq.72h': 'Every 72 hours',
  'freq.short.24h': '24h',
  'freq.short.12h': '12h',
  'freq.short.8h': '8h',
  'freq.short.6h': '6h',
  'freq.short.4h': '4h',
  'freq.short.72h': '72h',

  // ---------------------------------------------------------------------------
  // Dose Labels (time of day)
  // ---------------------------------------------------------------------------
  'dose.label.morning': 'Morning',
  'dose.label.evening': 'Evening',
  'dose.label.afternoon': 'Afternoon',
  'dose.label.night': 'Night',
  'dose.label.noon': 'Noon',
  'dose.label.patch': 'Patch dose',
  'dose.label.0600': '06:00',
  'dose.label.1000': '10:00',
  'dose.label.1400': '14:00',
  'dose.label.1800': '18:00',
  'dose.label.2200': '22:00',
  'dose.label.0200': '02:00',

  // ---------------------------------------------------------------------------
  // Target Regimen
  // ---------------------------------------------------------------------------
  'target.title': 'Target Opioid',
  'target.drug': 'Target Drug',
  'target.route': 'Route',
  'target.frequency': 'Frequency',
  'target.gfr': 'GFR',
  'target.gfrUnit': 'ml/min',
  'target.gfrPlaceholder': 'e.g. 60',
  'target.reduction': 'Dose Reduction',
  'target.reductionValue': '{value}%',
  'target.reductionLock': 'GFR-based minimum reduction: {min}%',
  'target.calculate': 'CALCULATE',
  'target.calculateDisabled': 'Fill in all required fields',
  'target.selectDrug': 'Select a target drug...',

  // ---------------------------------------------------------------------------
  // GFR Warnings (EXACT translations of user-specified Hungarian text)
  // ---------------------------------------------------------------------------
  'warning.gfr.below30':
    'High risk of opioid overdose and metabolite accumulation, which may lead to severe side effects! 25-50% dose reduction recommended during rotation!',
  'warning.gfr.below10':
    'High risk of opioid overdose and metabolite accumulation, which may lead to severe side effects! At least 50% dose reduction recommended during rotation!',

  // ---------------------------------------------------------------------------
  // GFR Drug-Specific Warnings
  // ---------------------------------------------------------------------------
  'warning.gfr.drug.avoid':
    'AVOID! Active metabolites accumulate, causing neurotoxicity and sedation.',
  'warning.gfr.drug.contraindicated':
    'CONTRAINDICATED in renal impairment! Active metabolites accumulate.',
  'warning.gfr.drug.caution':
    'USE CAUTION! Reduce dose and frequency. Monitor closely.',
  'warning.gfr.drug.preferred':
    'PREFERRED! Fentanyl is the drug of choice in renal impairment (no active metabolites).',

  // ---------------------------------------------------------------------------
  // Drug-Specific Warnings
  // ---------------------------------------------------------------------------
  'warning.drug.methadone':
    'WARNING: Methadone has non-linear pharmacokinetics. The calculated dose is for reference only \u2014 titration should be performed by a specialist with ECG (QTc) monitoring, allowing 5-7 days for steady state.',
  'warning.drug.methadone.accumulation':
    'Methadone has a long half-life and may accumulate. Repeated daily administration of a single symptom-relieving dose can lead to accumulation and death!',
  'warning.drug.methadone.restricted':
    'Rotation to methadone is only allowed when the OME value is exactly 10 mg.',
  'warning.drug.nalbuphine.source':
    'Warning: Nalbuphine is a partial agonist/antagonist. Switching from a pure mu-agonist may precipitate withdrawal symptoms.',
  'warning.drug.nalbuphine.target':
    'Nalbuphine CANNOT be used as a target drug in opioid rotation! Its partial agonist/antagonist action may precipitate withdrawal.',
  'warning.drug.pethidine.target':
    'Pethidine is NOT recommended as a target drug! Its neurotoxic metabolite (norpethidine) accumulates, especially in renal impairment.',
  'warning.drug.pethidine.source':
    'Warning: Pethidine produces a neurotoxic metabolite (norpethidine). Long-term use is not recommended.',
  'warning.drug.tramadol.max':
    'Warning: The maximum daily dose of tramadol is 400mg. The calculated dose exceeds this limit.',
  'warning.drug.dhc.max':
    'There is insufficient clinical experience with DHC doses above 240 mg/day. A dose of 5 mg/kg body weight can already be lethal.',
  'warning.drug.hydromorphone.hydration':
    'Rotation to oral hydromorphone is recommended only in well-hydrated patients. Ensure adequate daily fluid intake!',
  'warning.drug.fentanyl.mucosal':
    'Transmucosal fentanyl requires individual titration \u2014 it cannot be linearly converted from other opioids.',
  'warning.drug.minDose':
    'The minimum available dose is {min} mg. The calculated dose ({calculated} mg) is below this.',
  'warning.drug.oxycodone.minOxyContin':
    'The smallest available OxyContin dose in Hungary is 10 mg.',
  'warning.drug.minorOpioid.exceedsMax':
    'The calculated dose ({dose} mg/day) exceeds the maximum daily dose for this drug ({max} mg). Rotation to a minor opioid is not recommended at this dose level.',
  'warning.drug.oxycodone_naloxone.hepatic':
    'Oxycodone+naloxone combination is contraindicated in moderate-to-severe hepatic impairment! Use pure oxycodone or another opioid in such cases.',

  // ---------------------------------------------------------------------------
  // Fentanyl Patch Notes
  // ---------------------------------------------------------------------------
  'patch.onset':
    'Fentanyl patches take 12-24 hours to reach therapeutic levels. The previous opioid should be continued for 12 hours after application.',
  'patch.removal':
    'A subcutaneous depot effect persists for 12-24 hours after patch removal.',
  'patch.heat':
    'External heat sources (fever >39\u00b0C, heating pads) can dramatically increase absorption.',
  'patch.matrifen12':
    '12 mcg/hr patch: Matrifen',

  // ---------------------------------------------------------------------------
  // Results
  // ---------------------------------------------------------------------------
  'results.title': 'Results',
  'results.totalOme': 'Current total OME: {value} mg/day',
  'results.reducedOme': 'Reduced OME ({percent}%): {value} mg/day',
  'results.targetTdd': 'Target daily dose: {value} mg {drug}/day',
  'results.targetTddPatch': 'Target: {value} mcg/hr fentanyl patch',
  'results.dosingTitle': 'DOSING SUGGESTION ({frequency})',
  'results.tabletsPerDay': '{count} tab./day',
  'results.roundingNote': 'Calculated: {calculated} mg \u2192 Rounded: {rounded} mg ({delta}%)',
  'results.patch.title': 'PATCH COMBINATION',
  'results.patch.total': 'Total: {value} mcg/hr',
  'results.patch.change': 'Patch change every 72 hours',
  'results.patch.matrifen': '12 mcg/hr patch: Matrifen',
  'results.patch.single': '{count}\u00d7 {size} mcg/hr',
  'results.warnings.title': 'WARNINGS',
  'results.injectable.perDose': '{value} mg/dose',
  'results.injectable.perDay': '{count}\u00d7/day = {total} mg/day',
  'results.methadone.ripamonti': 'Ripamonti method ({ratio}:1 ratio)',
  'results.methadone.note': 'Methadone titration should be done under specialist supervision!',
  'results.noResult': 'Press CALCULATE to view results.',

  // Dosing detail format
  'results.dosing.tablets': '{count}\u00d7 {mg}mg',
  'results.dosing.tabletsBrand': '{count}\u00d7 {mg}mg {brand}',

  // ---------------------------------------------------------------------------
  // Drug Display Names (English)
  // ---------------------------------------------------------------------------
  'drug.morphine': 'Morphine',
  'drug.oxycodone': 'Oxycodone',
  'drug.oxycodone-naloxone': 'Oxycodone/Naloxone',
  'drug.fentanyl': 'Fentanyl',
  'drug.hydromorphone': 'Hydromorphone',
  'drug.tramadol': 'Tramadol',
  'drug.codeine': 'Codeine',
  'drug.dihydrocodeine': 'Dihydrocodeine',
  'drug.methadone': 'Methadone',
  'drug.nalbuphine': 'Nalbuphine',
  'drug.pethidine': 'Pethidine',

  // ---------------------------------------------------------------------------
  // Validation Messages
  // ---------------------------------------------------------------------------
  'validation.required': 'Required field',
  'validation.invalidNumber': 'Invalid number',
  'validation.selectDrug': 'Select a drug',
  'validation.selectRoute': 'Select a route',
  'validation.enterDose': 'Enter a dose',
  'validation.noSourceDrug': 'At least one source drug is required',
  'validation.noTargetDrug': 'Select a target drug',
  'validation.blockedTarget': 'This drug cannot be used as a target drug.',
  'validation.zeroOme': 'Current regimen OME is 0. Please check doses.',

  // ---------------------------------------------------------------------------
  // Accessibility Labels
  // ---------------------------------------------------------------------------
  'a11y.drugSearch': 'Drug search',
  'a11y.bmiSelector': 'BMI range selection',
  'a11y.genderSelector': 'Gender selection',
  'a11y.routeSelector': 'Route of administration selection',
  'a11y.frequencySelector': 'Dosing frequency selection',
  'a11y.reductionSlider': 'Dose reduction percentage setting',
  'a11y.gfrInput': 'GFR value input',
  'a11y.doseInput': 'Dose input',
  'a11y.resultsRegion': 'Calculation results',
  'a11y.warningsRegion': 'Clinical warnings',
  'a11y.languageToggle': 'Language toggle',
  'a11y.removeDrug': 'Remove drug',
  'a11y.addDrug': 'Add drug',

  // ---------------------------------------------------------------------------
  // Drug Combobox Fallbacks
  // ---------------------------------------------------------------------------
  'drug.select': 'Select drug',
  'drug.searchPlaceholder': 'Search...',
  'drug.noResults': 'No results found',
};

export default en;
