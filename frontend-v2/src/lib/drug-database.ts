// =============================================================================
// PalliCalc v2.0 — Drug Database
// Complete Hungarian opioid drug registry with brands, tablet sizes,
// formulation types (retard/IR), and splittability data.
// No React imports. Pure data and lookup functions.
// =============================================================================

import type { DrugDefinition, BrandEntry, FormulationSizes } from './types';

// ---------------------------------------------------------------------------
// Warning Drugs
// ---------------------------------------------------------------------------

export const WARNING_DRUGS: readonly string[] = [
  'methadone',
  'nalbuphine',
  'pethidine',
] as const;

export function isWarningDrug(drugId: string): boolean {
  return WARNING_DRUGS.includes(drugId);
}

// ---------------------------------------------------------------------------
// Complete Drug Database
// ---------------------------------------------------------------------------

export const DRUG_DATABASE: readonly DrugDefinition[] = [
  // =========================================================================
  // MORPHINE (Morfin) — ATC: N02AA01
  // =========================================================================
  {
    id: 'morphine',
    displayName: { hu: 'Morfin', en: 'Morphine' },
    routes: ['oral', 'sc/iv'],
    unit: 'mg',
    brands: [
      { name: 'MST Continus', drug: 'morphine', routeHint: 'oral', form: 'retard filmtabletta' },
      { name: 'Sevredol', drug: 'morphine', routeHint: 'oral', form: 'filmtabletta (IR)' },
      { name: 'Morphine Kalceks', drug: 'morphine', routeHint: 'sc/iv', form: 'oldatos injekció' },
      { name: 'Morphinum Hydrochloricum TEVA', drug: 'morphine', routeHint: 'sc/iv', form: 'oldatos injekció' },
    ],
    tabletSizes: {
      'oral': [10, 20, 30, 60, 100],  // Combined retard + IR sizes
    },
    formulations: {
      'oral': [
        { type: 'retard', sizes: [10, 30, 60, 100], splittable: [], validFrequencies: [1, 2], suitableFor: 'baseline' },
        { type: 'ir', sizes: [10, 20], splittable: [10, 20], validFrequencies: [3, 4, 6], suitableFor: 'breakthrough' },
      ],
    },
    minDose: {
      'oral': 10,  // Smallest MST Continus
    },
  },

  // =========================================================================
  // OXYCODONE (Oxikodon) — ATC: N02AA05
  // Oxycodone Sandoz and Vitabalans REMOVED (no longer available in Hungary)
  // =========================================================================
  {
    id: 'oxycodone',
    displayName: { hu: 'Oxikodon', en: 'Oxycodone' },
    routes: ['oral', 'sc/iv'],
    unit: 'mg',
    brands: [
      { name: 'OxyContin', drug: 'oxycodone', routeHint: 'oral', form: 'retard filmtabletta' },
      { name: 'Codoxy', drug: 'oxycodone', routeHint: 'oral', form: 'retard tabletta' },
      { name: 'Codoxy Rapid', drug: 'oxycodone', routeHint: 'oral', form: 'filmtabletta (IR)' },
      { name: 'Reltebon', drug: 'oxycodone', routeHint: 'oral', form: 'retard tabletta' },
    ],
    tabletSizes: {
      'oral': [5, 10, 20, 40, 80],  // Combined retard + IR sizes
    },
    formulations: {
      'oral': [
        { type: 'retard', sizes: [10, 20, 40, 80], splittable: [], validFrequencies: [1, 2], suitableFor: 'baseline' },
        { type: 'ir', sizes: [5, 10, 20], splittable: [5, 10, 20], validFrequencies: [3, 4, 6], suitableFor: 'breakthrough' },
      ],
    },
    minDose: {
      'oral': 10,  // OxyContin minimum dose in Hungary (user requirement)
    },
  },

  // =========================================================================
  // OXYCODONE + NALOXONE (Oxikodon + Naloxon) — ATC: N02AA55
  // Only Oxynador currently available. Targin, Oxynal, Neuraxpharm REMOVED.
  // Calculation refers to oxycodone component only.
  // =========================================================================
  {
    id: 'oxycodone-naloxone',
    displayName: { hu: 'Oxikodon + Naloxon', en: 'Oxycodone + Naloxone' },
    routes: ['oral'],
    unit: 'mg',
    brands: [
      { name: 'Oxynador', drug: 'oxycodone-naloxone', routeHint: 'oral', form: 'retard tabletta' },
    ],
    tabletSizes: {
      'oral': [5, 10, 20, 40],  // Oxynador (oxycodone component)
    },
    formulations: {
      'oral': [
        { type: 'retard', sizes: [5, 10, 20, 40], splittable: [], validFrequencies: [1, 2], suitableFor: 'baseline' },
      ],
    },
    minDose: {
      'oral': 5,
    },
  },

  // =========================================================================
  // FENTANYL (Fentanil) — ATC: N02AB03 (patch), N01AH01 (injection)
  // SC/IV input in mcg (unitPerRoute override)
  // =========================================================================
  {
    id: 'fentanyl',
    displayName: { hu: 'Fentanil', en: 'Fentanyl' },
    routes: ['patch', 'oral/mucosal', 'sc/iv'],
    unit: 'mg', // Default unit; SC/IV overridden to mcg via unitPerRoute
    unitPerRoute: {
      'sc/iv': 'mcg',  // Clinicians use micrograms for injectable fentanyl
    },
    brands: [
      // Transdermal patches (TDT)
      { name: 'Durogesic', drug: 'fentanyl', routeHint: 'patch', form: 'transzdermális tapasz' },
      { name: 'Dolforin', drug: 'fentanyl', routeHint: 'patch', form: 'transzdermális tapasz' },
      { name: 'Matrifen', drug: 'fentanyl', routeHint: 'patch', form: 'transzdermális mátrix tapasz' },
      { name: 'Fentanyl Sandoz (tapasz)', drug: 'fentanyl', routeHint: 'patch', form: 'transzdermális mátrix tapasz' },
      { name: 'Fentanyl-ratiopharm', drug: 'fentanyl', routeHint: 'patch', form: 'transzdermális tapasz' },
      // Oral / Mucosal
      { name: 'Effentora', drug: 'fentanyl', routeHint: 'oral/mucosal', form: 'buccális tabletta' },
      { name: 'Abstral', drug: 'fentanyl', routeHint: 'oral/mucosal', form: 'szublinguális tabletta' },
      { name: 'Actiq', drug: 'fentanyl', routeHint: 'oral/mucosal', form: 'szopogató tabletta' },
      // Injectable — "(injectio)" removed per feedback, form already says "oldatos injekció"
      { name: 'Fentanyl Kalceks', drug: 'fentanyl', routeHint: 'sc/iv', form: 'oldatos injekció' },
      { name: 'Fentanyl-Richter', drug: 'fentanyl', routeHint: 'sc/iv', form: 'oldatos injekció' },
      { name: 'Fentanyl Sandoz', drug: 'fentanyl', routeHint: 'sc/iv', form: 'oldatos injekció' },
    ],
    tabletSizes: {
      'patch': [12, 25, 50, 75, 100],  // mcg/hr
    },
  },

  // =========================================================================
  // HYDROMORPHONE (Hidromorfon) — ATC: N02AA03
  // Brands REMOVED (Jurnista, Palladone no longer available in Hungary).
  // Drug itself kept with conversion factors.
  // =========================================================================
  {
    id: 'hydromorphone',
    displayName: { hu: 'Hidromorfon', en: 'Hydromorphone' },
    routes: ['oral', 'sc/iv'],
    unit: 'mg',
    brands: [],  // Jurnista and Palladone no longer available in Hungary
    tabletSizes: {
      'oral': [4, 8, 16, 32],  // Retained for calculation purposes
    },
    formulations: {
      'oral': [
        { type: 'retard', sizes: [4, 8, 16, 32], splittable: [], validFrequencies: [1], suitableFor: 'baseline' },
      ],
    },
    minDose: {
      'oral': 4,
    },
  },

  // =========================================================================
  // TRAMADOL — ATC: N02AX02
  // Added IR 50mg formulation and maxSingleDose
  // =========================================================================
  {
    id: 'tramadol',
    displayName: { hu: 'Tramadol', en: 'Tramadol' },
    routes: ['oral', 'iv'],
    unit: 'mg',
    brands: [
      { name: 'Contramal', drug: 'tramadol', routeHint: 'oral', form: 'kemény kapszula / retard' },
      { name: 'Contramal injekció', drug: 'tramadol', routeHint: 'iv', form: 'oldatos injekció' },
      { name: 'Adamon', drug: 'tramadol', routeHint: 'oral', form: 'retard kapszula' },
      { name: 'Ralgen', drug: 'tramadol', routeHint: 'oral', form: 'kemény kapszula' },
      { name: 'Ralgen SR', drug: 'tramadol', routeHint: 'oral', form: 'retard tabletta' },
      { name: 'Tramadol AL', drug: 'tramadol', routeHint: 'oral', form: 'kemény kapszula' },
      { name: 'Tramadol Kalceks', drug: 'tramadol', routeHint: 'iv', form: 'oldatos injekció' },
      { name: 'Tramadol Vitabalans', drug: 'tramadol', routeHint: 'oral', form: 'tabletta' },
      { name: 'Tramadol Zentiva', drug: 'tramadol', routeHint: 'oral', form: 'kemény kapszula' },
      { name: 'Tramadolor', drug: 'tramadol', routeHint: 'oral', form: 'kemény kapszula / retard' },
    ],
    tabletSizes: {
      'oral': [50, 100, 150, 200],  // Combined IR + retard sizes
    },
    formulations: {
      'oral': [
        { type: 'retard', sizes: [100, 150, 200], splittable: [], validFrequencies: [1, 2], suitableFor: 'baseline' },
        { type: 'ir', sizes: [50], splittable: [], validFrequencies: [3, 4, 6], suitableFor: 'both' },  // capsule, not splittable
      ],
    },
    maxDailyDose: 400,
    maxSingleDose: 200,
  },

  // =========================================================================
  // DIHYDROCODEINE (Dihidrokodein) — ATC: N02AA08
  // Added maxSingleDose 120mg
  // =========================================================================
  {
    id: 'dihydrocodeine',
    displayName: { hu: 'Dihidrokodein', en: 'Dihydrocodeine' },
    routes: ['oral'],
    unit: 'mg',
    brands: [
      { name: 'DHC Continus', drug: 'dihydrocodeine', routeHint: 'oral', form: 'retard tabletta' },
    ],
    tabletSizes: {
      'oral': [60],  // Only 60mg confirmed in Hungary
    },
    formulations: {
      'oral': [
        { type: 'retard', sizes: [60], splittable: [], validFrequencies: [1, 2, 3], suitableFor: 'baseline' },
      ],
    },
    maxDailyDose: 240,
    maxSingleDose: 120,
  },

  // =========================================================================
  // CODEINE (Kodein) — ATC: N02AA59
  // Added brands (Talvosilen Forte, Parcodin) and maxDailyDose
  // =========================================================================
  {
    id: 'codeine',
    displayName: { hu: 'Kodein', en: 'Codeine' },
    routes: ['oral'],
    unit: 'mg',
    brands: [
      { name: 'Talvosilen Forte', drug: 'codeine', routeHint: 'oral', form: '500mg/30mg kemény kapszula' },
      { name: 'Parcodin', drug: 'codeine', routeHint: 'oral', form: '500mg/30mg tabletta (tartós termékhiány)', unavailable: true },
    ],
    tabletSizes: {
      'oral': [30],  // 30mg codeine component (Talvosilen Forte capsule)
    },
    formulations: {
      'oral': [
        { type: 'ir', sizes: [30], splittable: [], validFrequencies: [3, 4, 6], suitableFor: 'both' },  // capsule, not splittable
      ],
    },
    maxDailyDose: 240,
  },

  // =========================================================================
  // TAPENTADOL (Tapentadol) — ATC: N02AX06
  // New drug: 0.4 toOME factor. Available in neighboring countries.
  // No brand names in Hungary. Tablet sizes from Palexia retard.
  // =========================================================================
  {
    id: 'tapentadol',
    displayName: { hu: 'Tapentadol', en: 'Tapentadol' },
    routes: ['oral'],
    unit: 'mg',
    brands: [],  // Not available in Hungary, but available in neighboring countries
    tabletSizes: {
      'oral': [50, 100, 150, 200, 250],  // Palexia retard
    },
    formulations: {
      'oral': [
        { type: 'retard', sizes: [50, 100, 150, 200, 250], splittable: [], validFrequencies: [1, 2], suitableFor: 'baseline' },
      ],
    },
  },

  // =========================================================================
  // METHADONE (Metadon) — ATC: N07BC02 — WARNING DRUG
  // =========================================================================
  {
    id: 'methadone',
    displayName: { hu: 'Metadon', en: 'Methadone' },
    routes: ['oral'],
    unit: 'mg',
    brands: [
      { name: 'Metadon EP', drug: 'methadone', routeHint: 'oral', form: 'tabletta' },
      { name: 'Methasan', drug: 'methadone', routeHint: 'oral', form: 'koncentrátum belsőleges oldathoz' },
    ],
    tabletSizes: {
      'oral': [5, 10, 20, 40],  // Metadon EP
    },
    formulations: {
      'oral': [
        { type: 'ir', sizes: [5, 10, 20, 40], splittable: [5, 10, 20, 40], validFrequencies: [1, 2, 3], suitableFor: 'both' },
      ],
    },
    isWarningDrug: true,
  },

  // =========================================================================
  // NALBUPHINE (Nalbufin) — ATC: N02AF02 — WARNING DRUG
  // =========================================================================
  {
    id: 'nalbuphine',
    displayName: { hu: 'Nalbufin', en: 'Nalbuphine' },
    routes: ['sc/iv'],
    unit: 'mg',
    brands: [
      { name: 'Nalpain', drug: 'nalbuphine', routeHint: 'sc/iv', form: 'oldatos injekció' },
    ],
    tabletSizes: {},
    isWarningDrug: true,
    blockedAsTarget: true,
  },

  // =========================================================================
  // PETHIDINE (Petidin) — ATC: N02AB02 — WARNING DRUG
  // =========================================================================
  {
    id: 'pethidine',
    displayName: { hu: 'Petidin', en: 'Pethidine' },
    routes: ['sc/iv'],
    unit: 'mg',
    brands: [
      { name: 'Pethidine', drug: 'pethidine', routeHint: 'sc/iv', form: 'injekció' },
    ],
    tabletSizes: {},
    isWarningDrug: true,
    blockedAsTarget: true,
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup Functions
// ---------------------------------------------------------------------------

/**
 * Find a drug definition by its ID.
 */
export function findDrugById(id: string): DrugDefinition | undefined {
  return DRUG_DATABASE.find((d) => d.id === id);
}

/**
 * Find a drug definition by a brand name.
 * Returns the drug and the matching brand entry.
 */
export function findDrugByBrand(
  brandName: string,
): { drug: DrugDefinition; brand: BrandEntry } | undefined {
  const normalizedSearch = brandName.toLowerCase().trim();
  for (const drug of DRUG_DATABASE) {
    for (const brand of drug.brands) {
      if (brand.name.toLowerCase() === normalizedSearch) {
        return { drug, brand };
      }
    }
  }
  return undefined;
}

/**
 * Get available tablet sizes for a drug and route.
 * Returns sizes sorted ascending. Includes both retard and IR sizes.
 */
export function getTabletSizes(drugId: string, route: string): number[] {
  const drug = findDrugById(drugId);
  if (!drug) return [];

  const sizes = drug.tabletSizes[route];
  if (!sizes || sizes.length === 0) return [];

  return [...sizes].sort((a, b) => a - b);
}

/**
 * Get formulation-specific tablet sizes for a drug and route.
 */
export function getFormulations(drugId: string, route: string): readonly FormulationSizes[] {
  const drug = findDrugById(drugId);
  if (!drug?.formulations) return [];
  return drug.formulations[route] ?? [];
}

/**
 * Get the effective unit for a drug + route combination.
 * Falls back to the drug's default unit.
 */
export function getDrugUnit(drugId: string, route: string): string {
  const drug = findDrugById(drugId);
  if (!drug) return 'mg';
  return drug.unitPerRoute?.[route] ?? drug.unit;
}

/**
 * Get all brand entries across all drugs, flattened.
 * Useful for the searchable combobox.
 */
export function getAllBrands(): readonly { drug: DrugDefinition; brand: BrandEntry }[] {
  const result: { drug: DrugDefinition; brand: BrandEntry }[] = [];
  for (const drug of DRUG_DATABASE) {
    for (const brand of drug.brands) {
      result.push({ drug, brand });
    }
  }
  return result;
}
