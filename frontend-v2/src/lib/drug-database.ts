// =============================================================================
// PalliCalc v2.0 — Drug Database
// Complete Hungarian opioid drug registry with brands and tablet sizes.
// No React imports. Pure data and lookup functions.
// =============================================================================

import type { DrugDefinition, BrandEntry } from './types';

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
      'oral': [10, 30, 60, 100],  // MST Continus retard
    },
    irTabletSizes: {
      'oral': [10],  // Sevredol IR — only 10mg confirmed in HU
    },
    minDose: {
      'oral': 10,  // Smallest MST Continus
    },
  },

  // =========================================================================
  // OXYCODONE (Oxikodon) — ATC: N02AA05
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
      { name: 'Oxycodone Sandoz', drug: 'oxycodone', routeHint: 'oral', form: 'kemény kapszula (IR)' },
      { name: 'Oxycodone Vitabalans', drug: 'oxycodone', routeHint: 'oral', form: 'filmtabletta (IR)' },
    ],
    tabletSizes: {
      'oral': [5, 10, 20, 40, 80],  // Codoxy retard has full range
    },
    irTabletSizes: {
      'oral': [5, 10, 20],  // Codoxy Rapid / Oxycodone Sandoz
    },
    minDose: {
      'oral': 10,  // OxyContin minimum dose in Hungary (user requirement)
    },
  },

  // =========================================================================
  // OXYCODONE + NALOXONE (Oxikodon + Naloxon) — ATC: N02AA55
  // =========================================================================
  {
    id: 'oxycodone-naloxone',
    displayName: { hu: 'Oxikodon + Naloxon', en: 'Oxycodone + Naloxone' },
    routes: ['oral'],
    unit: 'mg',
    brands: [
      { name: 'Targin', drug: 'oxycodone-naloxone', routeHint: 'oral', form: 'retard tabletta' },
      { name: 'Oxynal', drug: 'oxycodone-naloxone', routeHint: 'oral', form: 'retard tabletta' },
      { name: 'Oxynador', drug: 'oxycodone-naloxone', routeHint: 'oral', form: 'retard tabletta' },
      { name: 'Oxikodon-HCL/Naloxon-HCL Neuraxpharm', drug: 'oxycodone-naloxone', routeHint: 'oral', form: 'retard tabletta' },
    ],
    tabletSizes: {
      'oral': [5, 10, 20, 40],  // Targin / Oxynal / Neuraxpharm (oxycodone component)
    },
    irTabletSizes: {
      // No dedicated IR form for oxy+nal; use oxycodone IR for breakthrough
      'oral': [5, 10, 20],
    },
    minDose: {
      'oral': 5,
    },
  },

  // =========================================================================
  // FENTANYL (Fentanil) — ATC: N02AB03 (patch), N01AH01 (injection)
  // =========================================================================
  {
    id: 'fentanyl',
    displayName: { hu: 'Fentanil', en: 'Fentanyl' },
    routes: ['patch', 'oral/mucosal', 'sc/iv'],
    unit: 'mg', // SC/IV and oral/mucosal in mg; patch in mcg/hr (handled specially)
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
      // Injectable
      { name: 'Fentanyl Kalceks', drug: 'fentanyl', routeHint: 'sc/iv', form: 'oldatos injekció' },
      { name: 'Fentanyl-Richter', drug: 'fentanyl', routeHint: 'sc/iv', form: 'oldatos injekció' },
      { name: 'Fentanyl Sandoz (injectio)', drug: 'fentanyl', routeHint: 'sc/iv', form: 'oldatos injekció' },
    ],
    tabletSizes: {
      'patch': [12, 25, 50, 75, 100],  // mcg/hr
    },
    irTabletSizes: {},
  },

  // =========================================================================
  // HYDROMORPHONE (Hidromorfon) — ATC: N02AA03
  // =========================================================================
  {
    id: 'hydromorphone',
    displayName: { hu: 'Hidromorfon', en: 'Hydromorphone' },
    routes: ['oral', 'sc/iv'],
    unit: 'mg',
    brands: [
      { name: 'Jurnista', drug: 'hydromorphone', routeHint: 'oral', form: 'retard tabletta (OROS)' },
      { name: 'Palladone', drug: 'hydromorphone', routeHint: 'oral', form: 'kapszula' },
    ],
    tabletSizes: {
      'oral': [4, 8, 16, 32],  // Jurnista retard (q24h)
    },
    irTabletSizes: {
      'oral': [1.3, 2.6],  // Palladone IR (limited availability)
    },
    minDose: {
      'oral': 4,  // Jurnista minimum
    },
  },

  // =========================================================================
  // TRAMADOL — ATC: N02AX02
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
      'oral': [100, 150, 200],  // Retard formulations
    },
    irTabletSizes: {
      'oral': [50],  // Contramal / Ralgen / etc. IR capsule
    },
    maxDailyDose: 400,
  },

  // =========================================================================
  // DIHYDROCODEINE (Dihidrokodein) — ATC: N02AA08
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
    irTabletSizes: {},
  },

  // =========================================================================
  // CODEINE (Kodein) — ATC: N02AA59
  // =========================================================================
  {
    id: 'codeine',
    displayName: { hu: 'Kodein', en: 'Codeine' },
    routes: ['oral'],
    unit: 'mg',
    brands: [],
    tabletSizes: {
      'oral': [15, 30, 60],  // Common codeine tablet sizes
    },
    irTabletSizes: {
      'oral': [15, 30],
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
    irTabletSizes: {},
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
    irTabletSizes: {},
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
    irTabletSizes: {},
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
 * Returns sizes sorted ascending.
 */
export function getTabletSizes(drugId: string, route: string): number[] {
  const drug = findDrugById(drugId);
  if (!drug) return [];

  const sizes = drug.tabletSizes[route];
  if (!sizes || sizes.length === 0) return [];

  return [...sizes].sort((a, b) => a - b);
}

/**
 * Get IR (immediate-release) tablet sizes for breakthrough dosing.
 * Falls back to checking the same drug's IR sizes, then the regular sizes.
 */
export function getIrTabletSizes(drugId: string): number[] {
  const drug = findDrugById(drugId);
  if (!drug) return [];

  // Check IR tablet sizes for oral route (most common for breakthrough)
  const irSizes = drug.irTabletSizes?.['oral'];
  if (irSizes && irSizes.length > 0) {
    return [...irSizes].sort((a, b) => a - b);
  }

  // Fallback: for oxycodone-naloxone, use oxycodone IR
  if (drugId === 'oxycodone-naloxone') {
    return getIrTabletSizes('oxycodone');
  }

  return [];
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
