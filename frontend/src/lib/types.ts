export interface ConversionEntry {
  drug: string;
  route: string;
  factorToOme: number;
  factorFromOme: number;
  notes: string;
}

export interface FentanylPatchEntry {
  mcgPerHr: number;
  omeLow: number;
  omeHigh: number;
}

export interface OpioidInput {
  id: string;
  drug: string;
  route: string;
  doses: number[];
  frequency: number;
  asymmetrical: boolean;
}

export interface TargetResult {
  drug: string;
  route: string;
  totalDailyDose: number;
  dividedDoses: number[];
  frequency: number;
  breakthroughDose: number | null;
  warnings: string[];
  totalOme: number;
  reducedOme: number;
}

export type DrugRouteKey = string; // "drug|route"

export interface BrandEntry {
  name: string;
  form?: string;
  routeHint?: string;
  naloxoneCombo?: boolean;
}

export interface DrugOption {
  drug: string;
  routes: string[];
  unit: string;
  brands?: BrandEntry[];
}

export interface PatchCombination {
  patches: Array<{ mcgPerHr: number; count: number }>;
  totalMcgPerHr: number;
}
