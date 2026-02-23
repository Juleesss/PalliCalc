// =============================================================================
// PalliCalc v2.0 — Hungarian Translations (DEFAULT LANGUAGE)
// Complete Hungarian translation file for the opioid rotation calculator.
// Every user-visible string in the application MUST have an entry here.
// =============================================================================

const hu: Record<string, string> = {
  // ---------------------------------------------------------------------------
  // App Chrome
  // ---------------------------------------------------------------------------
  'app.title': 'PalliCalc',
  'app.subtitle': 'Opioid Rotációs Kalkulátor',
  'app.disclaimer':
    'Ez az alkalmazás klinikai döntéstámogató eszköz. Minden dózismódosítást a kezelőorvos feladata jóváhagyni. Az egyéni betegváltozók és a klinikai megítélés mindig felülírják a kalkulátor javaslatait.',
  'app.lang.hu': 'HU',
  'app.lang.en': 'EN',
  'app.reset': 'Új számítás',
  'app.version': 'v2.0',
  'app.offline': 'Offline',

  // ---------------------------------------------------------------------------
  // Patient Parameters
  // ---------------------------------------------------------------------------
  'patient.title': 'Beteg paraméterek',
  'patient.bmi': 'BMI',
  'patient.bmi.low': '< 19',
  'patient.bmi.normal': '19–26',
  'patient.bmi.high': '> 26',
  'patient.gender': 'Nem',
  'patient.gender.male': 'Férfi',
  'patient.gender.female': 'Nő',

  // ---------------------------------------------------------------------------
  // BMI Warnings (EXACT text from user)
  // ---------------------------------------------------------------------------
  'warning.bmi.low':
    'Figyeljen a dozírozásra, mert kisebb lehet a tolerancia és magasabb toxicitási kockázat! Alacsony BMI esetén a lipofil opioidok (fentanil, metadon) nem tudnak nagy mennyiségben felhalmozódni a zsírszövetben, így magasabb plazmakoncentráció alakulhat ki. Fokozott légzésdepresszió kockázata.',
  'warning.bmi.high':
    'A teljes testsúlyra történő adagolás könnyen túladagoláshoz vezethet! Javasoljuk, hogy az ideális testtömeg (IBW) alapján határozza meg a dóziscsökkentést. A zsírszövetben felhalmozódott szer lassabban szabadul fel (depóhatás), ami késleltetett eliminációt és fokozott légzésdepresszió-kockázatot okoz.',

  // ---------------------------------------------------------------------------
  // Gender Warnings (EXACT text from user)
  // ---------------------------------------------------------------------------
  'warning.gender.female':
    'A kiszámolt dózis változtatandó lehet akár naponta is, ha premenopausában van a beteg! Az ösztrogén/progeszteron ingadozások befolyásolják az endogén opioid rendszert és a mu-receptor elérhetőségét. Orális gyógyszer adagolás ajánlott a rugalmasság érdekében.',

  // ---------------------------------------------------------------------------
  // Current Regimen
  // ---------------------------------------------------------------------------
  'current.title': 'Jelenlegi opioid kezelés',
  'current.addDrug': '+ Gyógyszer hozzáadása',
  'current.removeDrug': 'Eltávolítás',
  'current.asymmetric': 'Eltérő adagok',
  'current.asymmetric.question': 'Eltérő adagok napközben?',
  'current.omeTotal': 'Összes OME: {value} mg/nap',
  'current.omeTotalEmpty': 'Összes OME: ---',
  'current.drug': 'Gyógyszer',
  'current.route': 'Beviteli mód',
  'current.frequency': 'Gyakoriság',
  'current.dose': 'Dózis',
  'current.dose.unit.mg': 'mg',
  'current.dose.unit.mcg': 'mcg/óra',
  'current.searchDrug': 'Keresés név vagy márka alapján...',
  'current.selectDrug': 'Válasszon gyógyszert...',
  'current.perDrugOme': '{drug} ({route}): {ome} mg',
  'current.noDrugSelected': 'Nincs gyógyszer kiválasztva',

  // ---------------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------------
  'route.oral': 'Orális',
  'route.sc_iv': 'SC/IV',
  'route.patch': 'Tapasz',
  'route.mucosal': 'Mukozális',
  'route.iv': 'IV',
  'route.oral_mucosal': 'Mukozális',

  // ---------------------------------------------------------------------------
  // Frequencies
  // ---------------------------------------------------------------------------
  'freq.24h': '24 óránként',
  'freq.12h': '12 óránként',
  'freq.8h': '8 óránként',
  'freq.6h': '6 óránként',
  'freq.4h': '4 óránként',
  'freq.72h': '72 óránként',
  'freq.short.24h': '24h',
  'freq.short.12h': '12h',
  'freq.short.8h': '8h',
  'freq.short.6h': '6h',
  'freq.short.4h': '4h',
  'freq.short.72h': '72h',

  // ---------------------------------------------------------------------------
  // Dose Labels (time of day)
  // ---------------------------------------------------------------------------
  'dose.label.morning': 'Reggel',
  'dose.label.evening': 'Este',
  'dose.label.afternoon': 'Délután',
  'dose.label.night': 'Éjjel',
  'dose.label.noon': 'Dél',
  'dose.label.patch': 'Tapasz dózis',
  'dose.label.0600': '06:00',
  'dose.label.1000': '10:00',
  'dose.label.1400': '14:00',
  'dose.label.1800': '18:00',
  'dose.label.2200': '22:00',
  'dose.label.0200': '02:00',

  // ---------------------------------------------------------------------------
  // Target Regimen
  // ---------------------------------------------------------------------------
  'target.title': 'Cél opioid',
  'target.drug': 'Cél gyógyszer',
  'target.route': 'Beviteli mód',
  'target.frequency': 'Gyakoriság',
  'target.gfr': 'GFR',
  'target.gfrUnit': 'ml/perc',
  'target.gfrPlaceholder': 'pl. 60',
  'target.reduction': 'Dóziscsökkentés',
  'target.reductionValue': '{value}%',
  'target.reductionLock': 'GFR érték alapján min. csökkentés: {min}%',
  'target.calculate': 'SZÁMÍTÁS',
  'target.calculateDisabled': 'Töltse ki a szükséges mezőket',
  'target.selectDrug': 'Válasszon cél gyógyszert...',

  // ---------------------------------------------------------------------------
  // GFR Warnings (CRITICAL — EXACT text from user — BUG-001 / BUG-002 fixes)
  // ---------------------------------------------------------------------------
  'warning.gfr.below30':
    'Nagy az opioid túladagolás és metabolit-felhalmozódás kockázata, ami súlyos mellékhatásokhoz vezethet! 25-50%-os dóziscsökkentés javasolt a rotációkor!',
  'warning.gfr.below10':
    'Nagy az opioid túladagolás és metabolit-felhalmozódás kockázata, ami súlyos mellékhatásokhoz vezethet! Legalább 50%-os dóziscsökkentés javasolt a rotációkor!',

  // ---------------------------------------------------------------------------
  // GFR Drug-Specific Warnings (EXACT text from user)
  // ---------------------------------------------------------------------------
  'warning.gfr.drug.avoid':
    'Kerülendő! Az aktív metabolitok (pl. morfin-6-glükuronid) felhalmozódnak, ami neurotoxicitást és szedációt okozhat.',
  'warning.gfr.drug.contraindicated':
    'Kontraindikált veseelégtelenségben! Az aktív metabolitok felhalmozódnak.',
  'warning.gfr.drug.caution':
    'Óvatosan alkalmazandó! Csökkentett dózisban és ritkított gyakorisággal alkalmazandó, szoros monitorozás mellett.',
  'warning.gfr.drug.preferred':
    'Biztonságosabb alternatíva! Mivel nincs aktív metabolitja, a fentanil a választandó szer veseelégtelenségben.',

  // ---------------------------------------------------------------------------
  // Drug-Specific Warnings
  // ---------------------------------------------------------------------------
  'warning.drug.methadone':
    'FIGYELEM: A metadon nem-lineáris farmakokinetikával rendelkezik. A számított dózis csak tájékoztató jellegű — a beállítást szakorvos végezze, EKG (QTc) monitorozás mellett, 5-7 napos egyensúlyi idő figyelembevételével.',
  'warning.drug.methadone.accumulation':
    'A metadon felezési ideje hosszú, ezért akkumulálódhat. Egyetlen, a tüneteket enyhítő dózis naponta történő ismétlődő bevétele akkumulációhoz és halálhoz vezethet!',
  'warning.drug.methadone.restricted':
    'Metadonra történő rotáció csak akkor engedélyezett, ha az OME érték pontosan 10 mg.',
  'warning.drug.nalbuphine.source':
    'Figyelem: A nalbufin parciális agonista/antagonista. Tiszta mu-agonistáról történő váltáskor megvonási tüneteket okozhat.',
  'warning.drug.nalbuphine.target':
    'A nalbufin NEM használható célgyógyszerként opioid rotációban! Parciális agonista/antagonista hatása miatt precipitált megvonást okozhat.',
  'warning.drug.pethidine.target':
    'A petidin NEM ajánlott célgyógyszerként! Neurotoxikus metabolitja (norpetidin) felhalmozódik, különösen veseelégtelenségben.',
  'warning.drug.pethidine.source':
    'Figyelem: A petidin neurotoxikus metabolitot (norpetidin) termel. Hosszú távú használata nem javasolt.',
  'warning.drug.tramadol.max':
    '400 mg tramadol hidrokloridnak megfelelő teljes napi adagokat nem szabad túllépni.',
  'warning.drug.dhc.max':
    'A napi 240 mg feletti DHC adagolásáról nincs elegendő klinikai tapasztalat. 5 mg/ttkg dózis már letális lehet.',
  'warning.drug.hydromorphone.hydration':
    'A hidromorfon orális rotációja csak megfelelően hidratált betegek esetén javasolt. Biztosítson megfelelő napi folyadékbevitelt!',
  'warning.drug.fentanyl.mucosal':
    'A transzmukozális fentanil egyéni titrálást igényel — nem konvertálható lineárisan más opioidokról.',
  'warning.drug.minDose':
    'A minimális elérhető dózis {min} mg. A számított dózis ({calculated} mg) ez alatt van.',
  'warning.drug.oxycodone.minOxyContin':
    'Az OxyContin legkisebb elérhető adagja Magyarországon 10 mg.',
  'warning.drug.minorOpioid.exceedsMax':
    'A számított dózis ({dose} mg/nap) meghaladja a gyógyszer maximális napi adagját ({max} mg). Minor opioidra történő rotáció nem javasolt ilyen dózis mellett.',
  'warning.drug.oxycodone_naloxone.hepatic':
    'Oxikodon+naloxon kombináció közepesen súlyos vagy súlyos májkárosodás esetén ellenjavallt! Ilyen esetben tiszta oxikodon vagy más opioid alkalmazandó.',

  // ---------------------------------------------------------------------------
  // Fentanyl Patch Notes
  // ---------------------------------------------------------------------------
  'patch.onset':
    'A fentanil tapasz terápiás szintet 12-24 óra alatt ér el. Az előző opioidot a felragasztás után 12 óráig folytatni kell.',
  'patch.removal':
    'A tapasz eltávolítása után 12-24 órán át szubkután depó hatás érvényesül.',
  'patch.heat':
    'Külső hőforrás (láz >39°C, melegítőpárna) drámaian fokozhatja a felszívódást.',
  'patch.matrifen12':
    '12 mcg/óra tapasz: Matrifen',

  // ---------------------------------------------------------------------------
  // Results
  // ---------------------------------------------------------------------------
  'results.title': 'Eredmény',
  'results.totalOme': 'Jelenlegi összes OME: {value} mg/nap',
  'results.reducedOme': 'Csökkentett OME ({percent}%): {value} mg/nap',
  'results.targetTdd': 'Cél napi dózis: {value} mg {drug}/nap',
  'results.targetTddPatch': 'Cél: {value} mcg/óra fentanil tapasz',
  'results.dosingTitle': 'ADAGOLÁSI JAVASLAT ({frequency})',
  'results.tabletsPerDay': '{count} tabl./nap',
  'results.roundingNote': 'Számított: {calculated} mg \u2192 Kerekítve: {rounded} mg ({delta}%)',
  'results.patch.title': 'TAPASZ KOMBINÁCIÓ',
  'results.patch.total': 'Összesen: {value} mcg/óra',
  'results.patch.change': 'Tapaszcsere 72 óránként',
  'results.patch.matrifen': '12 mcg/óra tapasz: Matrifen',
  'results.patch.single': '{count}\u00d7 {size} mcg/óra',
  'results.warnings.title': 'FIGYELMEZTETÉSEK',
  'results.injectable.perDose': '{value} mg/adag',
  'results.injectable.perDay': '{count}\u00d7/nap = {total} mg/nap',
  'results.methadone.ripamonti': 'Ripamonti módszer ({ratio}:1 arány)',
  'results.methadone.note': 'A metadon beállítása szakorvosi felügyelet mellett történjen!',
  'results.noResult': 'Nyomja meg a SZÁMÍTÁS gombot az eredmény megjelenítéséhez.',

  // Dosing detail format
  'results.dosing.tablets': '{count}\u00d7 {mg}mg',
  'results.dosing.tabletsBrand': '{count}\u00d7 {mg}mg {brand}',

  // ---------------------------------------------------------------------------
  // Drug Display Names (Hungarian)
  // ---------------------------------------------------------------------------
  'drug.morphine': 'Morfin',
  'drug.oxycodone': 'Oxikodon',
  'drug.oxycodone-naloxone': 'Oxikodon/Naloxon',
  'drug.fentanyl': 'Fentanil',
  'drug.hydromorphone': 'Hidromorfon',
  'drug.tramadol': 'Tramadol',
  'drug.codeine': 'Kodein',
  'drug.dihydrocodeine': 'Dihidrokodein',
  'drug.methadone': 'Metadon',
  'drug.nalbuphine': 'Nalbufin',
  'drug.pethidine': 'Petidin',

  // ---------------------------------------------------------------------------
  // Validation Messages
  // ---------------------------------------------------------------------------
  'validation.required': 'Kötelező mező',
  'validation.invalidNumber': 'Érvénytelen szám',
  'validation.selectDrug': 'Válasszon gyógyszert',
  'validation.selectRoute': 'Válasszon beviteli módot',
  'validation.enterDose': 'Adjon meg dózist',
  'validation.noSourceDrug': 'Legalább egy forrás gyógyszer szükséges',
  'validation.noTargetDrug': 'Válasszon cél gyógyszert',
  'validation.blockedTarget': 'Ez a gyógyszer nem használható célgyógyszerként.',
  'validation.zeroOme': 'A jelenlegi kezelés OME értéke 0. Ellenőrizze a dózisokat.',

  // ---------------------------------------------------------------------------
  // Accessibility Labels
  // ---------------------------------------------------------------------------
  'a11y.drugSearch': 'Gyógyszer keresés',
  'a11y.bmiSelector': 'BMI tartomány kiválasztása',
  'a11y.genderSelector': 'Nem kiválasztása',
  'a11y.routeSelector': 'Beviteli mód kiválasztása',
  'a11y.frequencySelector': 'Adagolási gyakoriság kiválasztása',
  'a11y.reductionSlider': 'Dóziscsökkentés százalékos beállítása',
  'a11y.gfrInput': 'GFR érték megadása',
  'a11y.doseInput': 'Dózis megadása',
  'a11y.resultsRegion': 'Számítási eredmények',
  'a11y.warningsRegion': 'Klinikai figyelmeztetések',
  'a11y.languageToggle': 'Nyelv váltás',
  'a11y.removeDrug': 'Gyógyszer eltávolítása',
  'a11y.addDrug': 'Gyógyszer hozzáadása',

  // ---------------------------------------------------------------------------
  // Drug Combobox Fallbacks
  // ---------------------------------------------------------------------------
  'drug.select': 'Gyógyszer kiválasztása',
  'drug.searchPlaceholder': 'Keresés...',
  'drug.noResults': 'Nincs találat',
};

export default hu;
export type TranslationKey = keyof typeof hu;
