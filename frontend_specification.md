# PalliCalc Frontend Specification

## Comprehensive Frontend/UX Specification for the Opioid Rotation Calculator Reimplementation

**Version:** 2.0
**Date:** 2026-02-15
**Status:** Draft for PRD Integration
**Target Users:** Hungarian adult palliative mobile teams (field clinicians using phones/tablets)

---

## Table of Contents

1. [Technology Stack Recommendation](#1-technology-stack-recommendation)
2. [Component Architecture](#2-component-architecture)
3. [UI Flow Specification](#3-ui-flow-specification)
4. [Drug Selection UX](#4-drug-selection-ux)
5. [Dose Input and Output UX](#5-dose-input-and-output-ux)
6. [Warning System Design](#6-warning-system-design)
7. [Fentanyl Patch Output Display](#7-fentanyl-patch-output-display)
8. [Responsive Design Specification](#8-responsive-design-specification)
9. [i18n Architecture](#9-i18n-architecture)
10. [Accessibility Requirements](#10-accessibility-requirements)
11. [Offline/PWA Considerations](#11-offlinepwa-considerations)
12. [Performance Requirements](#12-performance-requirements)

---

## 1. Technology Stack Recommendation

### 1.1 Core Framework

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **React 19 + TypeScript** | Already in use; stable, well-supported, excellent ecosystem |
| Build Tool | **Vite 7** | Already in use; fast HMR, tree-shaking, native ESM |
| Styling | **Tailwind CSS v4** | Utility-first, mobile-first by design, zero runtime, tiny output via purging |
| Headless Components | **Headless UI v2** (by Tailwind Labs) | Unstyled, accessible, composable primitives (Combobox, Listbox, Dialog, Switch) |
| PWA | **vite-plugin-pwa** (Workbox) | Zero-config service worker generation, offline caching, auto-update prompts |
| State | **React built-in (useState/useReducer + Context)** | No external state library needed; the app is a single calculator form |

### 1.2 Rationale for Tailwind CSS over Current Approach

The current implementation uses a single monolithic `App.css` file with custom CSS variables. While functional, this approach leads to:
- Style duplication across components
- Difficult-to-maintain responsive breakpoints
- No design system enforcement
- Inconsistent spacing, sizing, and color usage

Tailwind CSS addresses all of these problems:
- **Mobile-first responsive utilities** (`sm:`, `md:`, `lg:` breakpoint prefixes)
- **Design tokens built in** (spacing scale, color palette, font sizes)
- **Purged CSS** results in a production bundle under 10 KB
- **Composable with Headless UI** for accessible, unstyled interactive components

### 1.3 Rationale for Headless UI over Native HTML Elements

The current implementation uses native `<select>` with `<optgroup>` for drug selection. This is the root cause of the most critical UX problem: **drug dropdowns are nearly unusable on mobile**. Native `<select>` elements:
- Cannot be searched/filtered
- Render differently across browsers and OSes
- Do not support rich content (icons, subtitles, grouped layouts with visual hierarchy)
- Are difficult to style consistently

Headless UI's `Combobox` component solves this by providing:
- A fully searchable, filterable dropdown
- Complete WAI-ARIA compliance (keyboard navigation, screen reader support)
- Full styling control via Tailwind classes
- Mobile-friendly: can display all options on focus/click, not just on typing

### 1.4 Libraries NOT Recommended

| Library | Reason for Exclusion |
|---------|---------------------|
| Material UI / Ant Design / Chakra UI | Too heavy (100+ KB); impose opinionated design systems; overkill for a single-page calculator |
| Redux / Zustand / Jotai | Unnecessary for a form-based SPA with no complex state graphs |
| React Router | Single page; no routing needed |
| Framer Motion | Animation library adds weight; CSS transitions via Tailwind are sufficient |

### 1.5 Retained Technologies

- **React 19** (keep)
- **TypeScript** (keep; strict mode enabled)
- **Vite 7** (keep)
- **gh-pages** (keep for deployment)

### 1.6 New Dependencies Summary

```
npm install tailwindcss @tailwindcss/vite @headlessui/react
npm install -D vite-plugin-pwa
```

Estimated additional bundle size: ~8 KB gzipped (Headless UI tree-shakes to only used components; Tailwind CSS purges to only used classes).

---

## 2. Component Architecture

### 2.1 Current Architecture Problems

The current component tree is flat and tightly coupled:

```
App.tsx (all state lives here, 135 lines)
  +-- PatientParameters.tsx (native <select>)
  +-- CurrentRegimen.tsx (inline DrugSelect using <select> + <optgroup>, 358 lines)
  +-- TargetRegimen.tsx (duplicated DrugSelect logic, 236 lines)
  +-- ResultsDisplay.tsx (raw numbers, no practical dosing, 115 lines)
  +-- LanguageToggle.tsx
```

**Problems:**
1. Drug selection logic is duplicated between `CurrentRegimen.tsx` and `TargetRegimen.tsx`
2. All state is lifted to `App.tsx`, creating prop-drilling 3+ levels deep
3. The `DrugSelect` component is inlined in `CurrentRegimen.tsx` rather than being a reusable component
4. No separation between "presentational" and "logic" layers
5. Result display has no rounding/formatting logic
6. No available-tablet-size data exists in the system

### 2.2 Proposed Component Architecture

```
App.tsx
  +-- AppShell/
  |     +-- Header.tsx (title, subtitle, language toggle)
  |     +-- Footer.tsx (disclaimer)
  |
  +-- Calculator/ (main calculator orchestrator)
  |     +-- CalculatorProvider.tsx (React Context for all calculator state + useReducer)
  |     |
  |     +-- PatientParametersCard.tsx
  |     |     +-- BmiSelector.tsx (3 tappable buttons, not <select>)
  |     |     +-- GenderSelector.tsx (2 tappable buttons, not <select>)
  |     |     +-- InlineWarning.tsx (reusable, color-coded)
  |     |
  |     +-- CurrentRegimenCard.tsx
  |     |     +-- DrugEntryList.tsx (manages array of current drugs)
  |     |     |     +-- DrugEntry.tsx (single drug input group)
  |     |     |           +-- DrugCombobox.tsx** (shared, searchable, Headless UI Combobox)
  |     |     |           +-- RouteSelector.tsx (tappable chips/buttons)
  |     |     |           +-- FrequencySelector.tsx (tappable chips/buttons)
  |     |     |           +-- DoseInputGroup.tsx
  |     |     |           |     +-- SingleDoseInput.tsx (symmetric)
  |     |     |           |     +-- AsymmetricDoseInputs.tsx (per-time-of-day)
  |     |     |           +-- AsymmetricToggle.tsx (Headless UI Switch)
  |     |     +-- AddDrugButton.tsx
  |     |
  |     +-- TargetRegimenCard.tsx
  |     |     +-- DrugCombobox.tsx** (same shared component)
  |     |     +-- RouteSelector.tsx (tappable chips)
  |     |     +-- FrequencySelector.tsx (tappable chips)
  |     |     +-- GfrInput.tsx
  |     |     |     +-- GfrWarningBanner.tsx
  |     |     |     +-- GfrDrugAdvice.tsx (drug-specific dynamic text)
  |     |     +-- ReductionSlider.tsx
  |     |     +-- CalculateButton.tsx
  |     |
  |     +-- ResultsCard.tsx
  |           +-- OmeSummary.tsx (total OME, reduced OME)
  |           +-- TargetDoseDisplay.tsx
  |           |     +-- PracticalDosingTable.tsx** (smart rounding to tablet sizes)
  |           |     +-- PatchCombinationDisplay.tsx** (visual patch output)
  |           +-- BreakthroughDoseDisplay.tsx** (with max daily limit)
  |           +-- WarningSummary.tsx (aggregated color-coded warnings)
  |
  +-- shared/
  |     +-- DrugCombobox.tsx (Headless UI Combobox, shared between current + target)
  |     +-- InlineWarning.tsx (reusable warning component)
  |     +-- TappableChip.tsx (reusable button-like selector)
  |     +-- TappableChipGroup.tsx (radio-button-like group of chips)
  |     +-- Card.tsx (base card container)
  |     +-- NumberInput.tsx (enhanced numeric input with units)
  |
  +-- i18n/
  |     +-- LanguageContext.tsx (unchanged pattern, enhanced with interpolation)
  |     +-- translations/
  |           +-- hu.ts (Hungarian translations)
  |           +-- en.ts (English translations)
  |           +-- index.ts (type-safe key definitions)
  |
  +-- lib/ (pure business logic, no React dependencies)
  |     +-- types.ts
  |     +-- conversions.ts (OME math engine; keep existing validated logic)
  |     +-- drug-database.ts (DRUG_OPTIONS, brand mappings, available tablet sizes)
  |     +-- tablet-rounding.ts** (NEW: smart rounding to available tablet sizes)
  |     +-- formatting.ts** (NEW: practical dosing string generation)
  |     +-- warnings.ts (extracted from conversions.ts)
  |     +-- patch-calculator.ts (extracted from conversions.ts)
```

**Key files marked with `**` are NEW functionality that does not exist in the current codebase.**

### 2.3 State Management: CalculatorProvider

Instead of lifting all state to `App.tsx` and prop-drilling, use a dedicated `CalculatorProvider` with `useReducer`:

```typescript
// Simplified type sketch
interface CalculatorState {
  // Patient
  bmi: 'low' | 'normal' | 'high' | null;
  gender: 'male' | 'female' | null;

  // Current regimen
  currentDrugs: OpioidInput[];

  // Target regimen
  targetDrug: string;
  targetRoute: string;
  targetFrequency: number;
  gfr: number | null;
  reductionPct: number;

  // Results (computed, not stored — derived on calculate)
  result: TargetResult | null;
}

type CalculatorAction =
  | { type: 'SET_BMI'; payload: ... }
  | { type: 'SET_GENDER'; payload: ... }
  | { type: 'ADD_DRUG'; }
  | { type: 'REMOVE_DRUG'; payload: { id: string } }
  | { type: 'UPDATE_DRUG'; payload: { id: string; changes: Partial<OpioidInput> } }
  | { type: 'SET_TARGET_DRUG'; payload: ... }
  | { type: 'SET_GFR'; payload: ... }
  | { type: 'SET_REDUCTION'; payload: ... }
  | { type: 'CALCULATE'; }
  | { type: 'RESET'; };
```

This eliminates the prop-drilling problem and makes the state machine explicit and testable.

### 2.4 Real-Time Calculation vs. Button-Triggered

**Recommendation: Hybrid approach.**

- **Real-time OME preview**: As the user fills in current drugs, show a running "Current Total OME" counter at the bottom of the Current Regimen card. This gives immediate feedback without requiring a button press.
- **Button-triggered final calculation**: The full target dose calculation (with rounding, tablet suggestions, patch combinations, warnings) should still be triggered by an explicit "Calculate" button press. Reasons:
  1. Medical calculators should require an intentional action before presenting clinical advice
  2. Prevents confusing partial/changing results while the user is still entering data
  3. Follows the pattern established by MDCalc and similar trusted medical tools

---

## 3. UI Flow Specification

### 3.1 Page Layout Overview

The entire calculator fits on a single scrollable page. No wizard, no tabs, no multi-step navigation. Reasons:
- Field clinicians need to see the whole picture at once
- Scrolling is natural on mobile; modal/wizard UX adds cognitive overhead
- The form is not long enough to justify breaking into steps (4 cards total)

**Visual Layout (top to bottom):**

```
+------------------------------------------+
|  HEADER: PalliCalc + Language Toggle     |
+------------------------------------------+
|  CARD 1: Patient Parameters              |
|    [BMI: 3 tappable buttons]             |
|    [Gender: 2 tappable buttons]          |
|    (inline warnings appear here)         |
+------------------------------------------+
|  CARD 2: Current Opioid Regimen          |
|    [Drug Entry 1]                        |
|    [Drug Entry 2] (if added)             |
|    [+ Add Drug button]                   |
|    Running OME total (subtle, gray)      |
+------------------------------------------+
|  CARD 3: Target Opioid & Safety          |
|    [Target Drug ComboBox]                |
|    [Route chips]                         |
|    [Frequency chips]                     |
|    [GFR input]                           |
|    [GFR warnings]                        |
|    [Reduction slider]                    |
|    [CALCULATE button - full width, bold] |
+------------------------------------------+
|  CARD 4: Results (appears after calc)    |
|    [OME Summary]                         |
|    [TARGET DOSE - large, prominent]      |
|    [Practical Dosing Table]              |
|    [Breakthrough Dose + Max Daily]       |
|    [Patch Combination (if applicable)]   |
|    [Warning Summary]                     |
+------------------------------------------+
|  FOOTER: Disclaimer                      |
+------------------------------------------+
```

### 3.2 Detailed User Journey

**Step 1: App Opens**
- App loads instantly (< 1 second on 3G)
- Hungarian language by default
- All cards visible but collapsed/minimal
- No login screen, no splash screen, no onboarding

**Step 2: Patient Parameters (Top Card)**
- User taps one of three BMI range buttons: `< 19` | `19-26` | `> 26`
  - Selected button is visually highlighted (filled primary color)
  - If `< 19` or `> 26`, an orange warning box slides in below with clinical explanation
- User taps one of two Gender buttons: `Ferfi` | `No`
  - If `No` (Female), an orange warning box slides in with hormonal considerations
- These are intentionally large tappable targets (minimum 48px height) for gloved/hurried hands

**Step 3: Current Opioid Regimen (Middle Card)**
- One drug entry is shown by default
- User taps the drug combobox:
  - A searchable overlay opens (bottom sheet on mobile, dropdown on desktop)
  - User can type to filter by active ingredient name OR brand name
  - Results are grouped: active ingredient as bold header, brand names indented below
  - Tapping a brand name auto-selects the drug AND auto-populates the route
  - Tapping an active ingredient name selects only the drug (route must be chosen)
- After drug is selected:
  - Route options appear as tappable chips (e.g., `Oral` | `SC/IV`)
  - If route was auto-populated by brand selection, it is pre-highlighted
- After route is selected:
  - Frequency options appear as tappable chips (e.g., `12h` | `8h` | `6h` | `24h`)
  - For fentanyl patch: frequency is auto-set to 72h and hidden
- After frequency is selected:
  - A single dose input field appears with the appropriate unit label
  - A toggle appears: "Eltero adagok napkozben?" (Asymmetrical dosing?)
  - If toggled ON:
    - Multiple dose inputs appear, one per administration time
    - Each is labeled with the correct time of day (see Section 5 for label mapping)
- User can tap "+ Gyogyszer hozzaadasa" to add another drug entry
- A subtle running total at the bottom shows: `Jelenlegi osszes OME: 180 mg/nap`

**Step 4: Target Opioid & Safety (Bottom Card)**
- Same DrugCombobox for target drug selection
- Same Route chips and Frequency chips
- GFR input field appears:
  - Numeric input with clear label: "GFR (ml/perc)"
  - Placeholder text: "pl. 60"
  - If GFR < 30: red warning banner slides in
  - If GFR < 10: additional severe warning
  - Drug-specific GFR advice appears based on the selected target drug
- Reduction slider:
  - Horizontal slider, 0% to 70%, step 5%, default 25%
  - Large thumb (28px) for easy touch interaction
  - Current value displayed prominently above slider
  - If GFR enforces a minimum, slider is locked and a note explains why
- Large blue "SZAMITAS" (Calculate) button spans full width
  - Disabled (grayed out) until all required fields are filled
  - On tap: page auto-scrolls to the Results card

**Step 5: Results (Appears After Calculation)**
- Results card slides in (or becomes visible) with a subtle animation
- Display order:
  1. **OME Summary** (secondary info, smaller text):
     - `Jelenlegi osszes OME: 270 mg/nap`
     - `Csokkentett OME (25%): 202.5 mg/nap`
  2. **Target Daily Dose** (PRIMARY display, large bold text):
     - `Cel napi osszadag: 135 mg Oxikodon/nap`
  3. **Practical Dosing Table** (the key new feature):
     - Shows exactly how to divide the dose into available tablet sizes
     - See Section 5.5 for detailed specification
  4. **Breakthrough Dose** (with max daily):
     - `Attoreses fajdalom dozis: 22.5 mg`
     - `Maximalis napi attoreses osszadag: 6 x 22.5 mg = 135 mg`
     - `Ha ennel tobb szukseges: alap dozis emelendo!`
  5. **Patch Combination** (only for fentanyl patch target):
     - Visual display of patch combination (see Section 7)
  6. **Warnings Summary** (color-coded):
     - Red boxes for GFR/danger warnings
     - Orange boxes for BMI/gender warnings
     - Green boxes for "preferred" drug notes

---

## 4. Drug Selection UX

### 4.1 Current Problem Analysis

The existing `DrugSelect` component uses native HTML `<select>` with `<optgroup>`:

```html
<select>
  <optgroup label="Fentanil">
    <option value="fentanyl">Fentanil</option>
    <option value="fentanyl|patch">Durogesic</option>
    <option value="fentanyl|patch">Dolforin</option>
    ...
  </optgroup>
</select>
```

**Problems:**
1. On mobile, this opens the OS native picker which cannot be searched
2. With 30+ options across 6 drug groups, scrolling through the native picker is tedious
3. Brand names like "Durogesic" do not visually indicate they are fentanyl products
4. The `value="fentanyl|patch"` encoding is fragile and hard to debug
5. Users cannot type "Duro" to jump to "Durogesic"

### 4.2 Proposed Solution: DrugCombobox Component

Build a custom `DrugCombobox` using Headless UI's `Combobox` primitive with Tailwind styling.

**Behavior:**

1. **Resting state**: Looks like a standard input with a dropdown arrow icon and placeholder text "Keressen gyogyszert..." (Search for a drug...)

2. **On tap/click**:
   - The input becomes active/focused
   - A dropdown panel appears showing ALL drugs grouped by active ingredient
   - On mobile (<640px): this renders as a bottom sheet that slides up from the bottom of the screen, occupying ~60% of screen height
   - On desktop (>=640px): this renders as a standard dropdown below the input

3. **Typing to filter**:
   - As the user types, the list filters in real-time
   - Matching is case-insensitive and accent-insensitive (critical for Hungarian: a/a, e/e, o/o, u/u)
   - Matches against BOTH active ingredient name AND brand name
   - Example: typing "oxy" shows: Oxikodon (header) with all its brands; typing "targ" shows: Targin under Oxikodon + Naloxon

4. **Display structure for each group**:
   ```
   OXIKODON (Oxycodone)           <-- bold, slightly larger
     OxyContin (retard filmtabletta)    <-- indented, normal weight
     Codoxy (retard tabletta)
     Codoxy Rapid
     Reltebon (retard tabletta)
     Oxycodone Sandoz (kemeny kapszula)
     Oxycodone Vitabalans
   OXIKODON + NALOXON             <-- separate group header
     Targin (retard tabletta)     [+Naloxon]  <-- badge
     Oxynal (retard tabletta)     [+Naloxon]
     Oxynador                     [+Naloxon]
   ```

5. **Selection behavior**:
   - If user selects an **active ingredient header** (e.g., "Oxikodon"):
     - `drug` is set to `"oxycodone"`
     - Route must be manually selected in the next step
   - If user selects a **brand name** (e.g., "Durogesic"):
     - `drug` is set to `"fentanyl"`
     - `route` is auto-populated to `"patch"` (from the brand's `routeHint`)
     - The route selector shows `patch` already highlighted

6. **Accessibility**:
   - Full keyboard navigation (arrow keys to move, Enter to select, Escape to close)
   - `aria-label="Gyogyszer valasztas"` (Drug selection)
   - Each option has an `aria-description` with the form/route info
   - Screen reader announces the group header when entering a new group

### 4.3 Drug Database Structure

Move the drug options data into a dedicated `drug-database.ts` file with an enhanced structure:

```typescript
export interface AvailableTabletSize {
  mg: number;
  form: string;         // e.g., "retard filmtabletta", "tabletta"
  brandName?: string;   // e.g., "OxyContin" — if size is brand-specific
}

export interface BrandEntry {
  name: string;
  form?: string;        // e.g., "retard filmtabletta"
  routeHint?: string;   // auto-populate route on selection
  naloxoneCombo?: boolean;
}

export interface DrugDefinition {
  id: string;                    // e.g., "oxycodone"
  routes: string[];              // e.g., ["oral", "sc/iv"]
  unit: string;                  // e.g., "mg"
  brands?: BrandEntry[];
  availableTabletSizes?: Record<string, AvailableTabletSize[]>;
  // keyed by route, e.g., { "oral": [{ mg: 5 }, { mg: 10 }, { mg: 20 }, { mg: 40 }, { mg: 80 }] }
}
```

### 4.4 Available Tablet Sizes (New Data)

This is critical new data that must be populated for the smart rounding feature. Based on Hungarian market availability:

| Drug | Route | Available Sizes (mg) |
|------|-------|---------------------|
| Morphine | Oral | 10, 20, 30, 60, 100, 200 |
| Morphine | SC/IV | Any (injectable, continuously titratable) |
| Oxycodone | Oral | 5, 10, 20, 40, 80 (OxyContin); 5, 10, 20 (Codoxy Rapid) |
| Hydromorphone | Oral | 2, 4, 8, 16, 32 |
| Tramadol | Oral | 50, 100, 150, 200 (retard); 50 (capsule) |
| Dihydrocodeine | Oral | 60, 90, 120 |
| Fentanyl | Patch | 12, 25, 50, 75, 100 (mcg/hr) |
| Fentanyl | Oral/Mucosal | 100, 200, 400, 600, 800 (mcg) |
| Fentanyl | SC/IV | Any (injectable, continuously titratable) |

**Note:** For injectable routes (SC/IV), rounding to tablet sizes is not applicable; the exact calculated dose is displayed.

### 4.5 Route and Frequency as Tappable Chips

Replace native `<select>` for route and frequency with **TappableChipGroup** components:

```
Route: [ Oral ]  [ SC/IV ]  [ Tapasz ]  [ Mucosal ]
                   ^^^^^^^^ (highlighted when selected)

Freq:  [ 24h ]  [ 12h ]  [ 8h ]  [ 6h ]
                 ^^^^^ (highlighted)
```

**Chip design specifications:**
- Minimum height: 48px (touch target)
- Minimum width: 64px
- Border radius: 24px (pill shape)
- Unselected: white background, gray border, gray text
- Selected: primary blue background, white text
- Transition: 150ms ease

This directly addresses the user requirement: "kattintassal kivalaszthato" (selectable by clicking/tapping).

---

## 5. Dose Input and Output UX

### 5.1 Dose Input Field

**Enhanced `NumberInput` component:**
- Uses `type="text"` with `inputMode="decimal"` (NOT `type="number"`)
  - Reason: `type="number"` on mobile shows different keyboards across OS versions and can strip leading zeros or mishandle decimals with comma separators (Hungarian locale uses comma as decimal separator)
- Custom validation: accept only digits, single decimal point or comma
- Automatic conversion of comma to period for internal calculation
- Large font size (1.25rem / 20px) for readability
- Unit label displayed inside the input as a suffix badge (e.g., `[  135  ] mg`)
- Clear/reset button (small X) inside the input when it has a value

### 5.2 Asymmetric Dosing Toggle and Labels

**Toggle design:** Use Headless UI `Switch` component instead of a native checkbox. Visual design: a sliding toggle switch (like iOS) with the label "Eltero adagok napkozben?" next to it.

**Time-of-day labels by frequency:**

| Frequency | Doses/Day | Labels (HU) | Labels (EN) |
|-----------|-----------|-------------|-------------|
| q24h (1x) | 1 | Reggel | Morning |
| q12h (2x) | 2 | Reggel, Este | Morning, Evening |
| q8h (3x) | 3 | Reggel, Delutan, Ejjel | Morning, Afternoon, Night |
| q6h (4x) | 4 | Reggel, Del, Delutan, Este | Morning, Noon, Afternoon, Evening |
| q4h (6x) | 6 | 06:00, 10:00, 14:00, 18:00, 22:00, 02:00 | Same (24h clock) |
| q72h (patch) | 1 | Tapasz dozis | Patch dose |

**Important fix:** The current code correctly maps q12h to "Morning/Evening" (not "Morning/Noon"). This must be preserved in the reimplementation.

**Layout for asymmetric inputs on mobile:**
- Stack vertically (one column) on screens < 480px
- Two columns on screens >= 480px
- Each input has its time-of-day label above it

### 5.3 Running OME Total (Real-time Preview)

At the bottom of the Current Regimen card, display a live-updating total:

```
+----------------------------------------------+
| Jelenlegi osszes OME: 270 mg/nap             |
| (Morfin oral: 180 + Oxikodon oral: 90)       |
+----------------------------------------------+
```

- Updates on every dose change (debounced by 300ms to avoid flicker)
- Light gray background, small text, non-intrusive
- Shows breakdown per drug if multiple drugs are entered
- Shows "---" if inputs are incomplete

### 5.4 Smart Rounding Algorithm (NEW — `tablet-rounding.ts`)

This is the most important new feature. The user explicitly requested: "Az adagolasnal kerekitsen a gep" (The machine should round the dosing).

**Algorithm specification:**

Given:
- `targetTDD`: the calculated total daily dose in mg (e.g., 108.5 mg oxycodone)
- `frequency`: doses per day (e.g., 2 for q12h)
- `availableSizes`: array of available tablet sizes in mg (e.g., [5, 10, 20, 40, 80])

**Step 1: Calculate the ideal per-dose amount**
```
idealPerDose = targetTDD / frequency
// Example: 108.5 / 2 = 54.25 mg per dose
```

**Step 2: Find the nearest achievable dose for each administration**

For symmetric dosing (all doses equal):
```
roundedPerDose = findNearestAchievable(idealPerDose, availableSizes)
// 54.25 -> 50 mg (2x20 + 1x10) or 55 mg (2x20 + 1x10 + 1x5)
// Choose the nearest: 55 mg
actualTDD = roundedPerDose * frequency
```

For asymmetric dosing (user's explicit request for oxycodone example):
```
If targetTDD = 108.5 mg, frequency = 2 (morning/evening):
  - Total must be close to 108.5, but each dose must be achievable with tablets
  - Morning: 50 mg (2x20 + 1x10)
  - Evening: 60 mg (3x20)
  - Actual TDD: 110 mg (slightly above target; clinically acceptable)

Alternatively:
  - Morning: 50 mg
  - Evening: 50 mg
  - Actual TDD: 100 mg (below target; may be more conservative)
```

**Step 3: Smart distribution algorithm**

```typescript
function distributeToTablets(
  targetTDD: number,
  frequency: number,
  sizes: number[]  // sorted descending, e.g., [80, 40, 20, 10, 5]
): DoseDistribution[] {
  // 1. Calculate base per-dose
  const basePerDose = targetTDD / frequency;

  // 2. Round each dose down to nearest achievable
  const roundedDown = roundToTablets(basePerDose, sizes, 'down');
  const roundedUp = roundToTablets(basePerDose, sizes, 'up');

  // 3. If symmetric rounding is close enough (within 10%), use it
  if (Math.abs(roundedDown * frequency - targetTDD) / targetTDD < 0.1) {
    return Array(frequency).fill({ totalMg: roundedDown, tablets: breakdown(roundedDown, sizes) });
  }

  // 4. Otherwise, distribute asymmetrically:
  //    Some doses get roundedUp, others roundedDown, to get closest to targetTDD
  const numUp = Math.round((targetTDD - roundedDown * frequency) / (roundedUp - roundedDown));
  const numDown = frequency - numUp;

  const doses: DoseDistribution[] = [];
  // Assign higher doses to morning/first doses (clinical convention)
  for (let i = 0; i < frequency; i++) {
    const mg = i < numUp ? roundedUp : roundedDown;
    doses.push({ totalMg: mg, tablets: breakdown(mg, sizes) });
  }
  return doses;
}

function roundToTablets(targetMg: number, sizes: number[], direction: 'up' | 'down'): number {
  // Find the combination of tablets closest to targetMg
  // using a greedy algorithm with the available sizes
  let remaining = targetMg;
  let total = 0;
  for (const size of sizes) {  // sizes sorted descending
    const count = Math.floor(remaining / size);
    total += count * size;
    remaining -= count * size;
  }
  if (direction === 'up' && remaining > 0) {
    total += sizes[sizes.length - 1]; // add one smallest tablet
  }
  return total;
}

function breakdown(totalMg: number, sizes: number[]): TabletCount[] {
  // Break down a total mg into fewest tablets
  const result: TabletCount[] = [];
  let remaining = totalMg;
  for (const size of sizes) {  // sizes sorted descending
    if (remaining >= size) {
      const count = Math.floor(remaining / size);
      result.push({ mg: size, count });
      remaining -= count * size;
    }
  }
  return result;
}
```

### 5.5 Practical Dosing Display (Result Output)

**This is the most critical new UI element.** The user explicitly requested output like "reggel 50mg, este 60mg" instead of raw decimal numbers.

**Display format for non-patch drugs:**

```
+--------------------------------------------------+
| CEL NAPI OSSZADAG                                |
| 110 mg Oxikodon / nap                            |
+--------------------------------------------------+
| ADAGOLASI JAVASLAT (q12h)          5 tabl./nap   |
|                                                   |
| Reggel:  50 mg   (2x 20mg + 1x 10mg)            |
| Este:    60 mg   (3x 20mg)                       |
|                                                   |
| Szamitott: 108.5 mg -> Kerekitve: 110 mg (+1.4%) |
+--------------------------------------------------+
```

**Visual design:**
- The "ADAGOLASI JAVASLAT" section has a distinct background (light blue)
- Each dose line shows:
  - Time of day label (Reggel/Este/etc.)
  - Total mg for that dose (bold)
  - Tablet breakdown in parentheses (normal weight, slightly smaller text)
- A subtle footer line shows the rounding delta (how far from the raw calculated value)
- Total daily tablet count shown in the top-right corner

**For injectable routes (SC/IV):**
- No rounding is needed; show the exact calculated dose
- Display: "0.5 mg/adag, 4x/nap = 2 mg/nap"

### 5.6 Breakthrough Dose Display (Enhanced)

**Current problem:** The app shows only a single breakthrough dose number. The user requested the maximum total daily breakthrough dose be displayed, with guidance on when to escalate.

**Proposed display:**

```
+--------------------------------------------------+
| ATTORESES FAJDALOM                               |
|                                                   |
| Egyszeri dozis: 18 mg Oxikodon                   |
|   (1x 10mg + 1x 5mg + tores: ~3mg elteres)      |
|                                                   |
| Max. napi attoreses osszadag: 6 x 18 mg = 108 mg |
|                                                   |
| ⚠ Ha 24 ora alatt 4-nel tobb attoreses dozisra   |
|   van szukseg: az alap dozis emelenedo!           |
+--------------------------------------------------+
```

**Logic:**
- Breakthrough dose = TDD / 6 (standard clinical formula)
- Round to available tablet sizes (same algorithm as regular dosing)
- Max daily breakthrough = 6 x breakthrough dose (can administer up to 6 times)
- Warning text: if more than 4 breakthrough doses are needed in 24 hours, the base dose should be increased

---

## 6. Warning System Design

### 6.1 Warning Categories and Color Coding

| Category | Color | Background | Border | Icon | Use Case |
|----------|-------|-----------|--------|------|----------|
| **Danger** | Red | `#fef2f2` | `#ef4444` | Red triangle | GFR < 30, drug contraindications |
| **Caution** | Orange | `#fffbeb` | `#f59e0b` | Orange triangle | BMI warnings, gender warnings, drug caution |
| **Preferred** | Green | `#f0fdf4` | `#22c55e` | Green checkmark | Fentanyl preferred in renal failure |
| **Info** | Blue | `#eff6ff` | `#2563eb` | Blue circle-i | Dose rounding notes, general info |

### 6.2 Warning Placement Taxonomy

**Inline warnings** (appear immediately next to the relevant input):
- BMI < 19 or > 26: orange box below the BMI selector
- Gender = Female: orange box below the gender selector
- GFR < 30: red box below the GFR input field
- GFR < 10: additional red box with stronger language

**Dynamic drug-specific warnings** (appear when GFR + drug combination triggers them):
- Placed between the GFR input and the reduction slider
- Morphine/Codeine selected + GFR < 30: red "KERULENDO" box
- Oxycodone/Hydromorphone selected + GFR < 30: orange "OVATOSAN" box
- Fentanyl selected + GFR < 30: green "ELONYOS VALASZTAS" box

**Result summary warnings** (aggregated in the Results card):
- All warnings that were shown inline during input are collected and re-displayed in a summary section at the bottom of the results
- This ensures the clinician sees ALL relevant warnings in one place when reviewing the calculation

### 6.3 Warning Persistence

- **All warnings are persistent** (not dismissable). Medical warnings should never be "swiped away" or "closed" by the user. They remain visible as long as the triggering condition exists.
- If the user changes an input that resolves a warning condition, the warning disappears automatically (e.g., changing GFR from 25 to 60 removes the GFR < 30 warning).

### 6.4 GFR Warning Text (Corrected per User Feedback)

The user provided exact Hungarian text that differs from what the current app shows. These are the corrected texts:

**GFR < 30 ml/perc (General):**
```
HU: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatokhoz vezethet! 25-50%-os doziscsokkentes javasolt a rotaciokor!"
EN: "High risk of opioid overdose and metabolite accumulation, which can lead to severe side effects! 25-50% dose reduction recommended during rotation!"
```

**GFR < 10 ml/perc (General):**
```
HU: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatokhoz vezethet! Legalabb 50%-os doziscsokkentes javasolt a rotaciokor!"
EN: "High risk of opioid overdose and metabolite accumulation, which can lead to severe side effects! At least 50% dose reduction recommended during rotation!"
```

**GFR < 30, Morphine/Codeine selected:**
```
HU: "KERULENDO! Aktiv metabolitjaik (pl. morfin-6-glukuronid) felhalmozodnak. Fontolja meg a fentanil alkalmazasat — nincs aktiv metabolitja, biztonsagosabb veseeelegtelensegben."
EN: "AVOID! Active metabolites (e.g., morphine-6-glucuronide) accumulate. Consider fentanyl — no active metabolites, safest choice in renal failure."
```

**GFR < 30, Oxycodone/Hydromorphone selected:**
```
HU: "OVATOSAN! Csokkentett dozisban es ritkitott gyakorisaggal alkalmazando. Szoros monitorozas szukseges."
EN: "USE CAUTION! Reduce dose and frequency. Close monitoring required."
```

**GFR < 30, Fentanyl selected:**
```
HU: "ELONYOS VALASZTAS. A fentanil a legbiztonsagosabb szer veseeelegtelensegben (nincs aktiv metabolitja)."
EN: "PREFERRED. Fentanyl is the safest choice in renal failure (no active metabolites)."
```

### 6.5 Methadone and Nalbuphine Special Warnings

**Methadone** (if ever added to the calculator or selected):
- Hard red warning: "A metadon osszetett, valtozo felezes ideju gyogyszer (15-60 ora). A standard linearis konverzio veszelyes es specialista bevonasa szukseges."
- The calculator should NOT perform automatic methadone conversion. Display the warning and stop.

**Nalbuphine** (if ever added):
- Orange warning: "A nalbufin kevert agonista-antagonista opioid. Alkalmazasa akut megvonasi tuneteket valthat ki mu-agonista fuggoseg eseten (pl. fentanil, morfin)."

---

## 7. Fentanyl Patch Output Display

### 7.1 Current Problem

The current `ResultsDisplay` shows patch combinations as text: "1x 100 mcg/ora + 1x 50 mcg/ora". While technically correct, this is not visually clear enough for quick clinical decisions.

### 7.2 Proposed Visual Design

**Patch combination display:**

```
+--------------------------------------------------+
| JAVASOLT TAPASZ KOMBINACIO                        |
|                                                   |
|  +---------+  +---------+                         |
|  |  100    |  |   50    |                         |
|  | mcg/ora |  | mcg/ora |                         |
|  +---------+  +---------+                         |
|                                                   |
| Osszes: 150 mcg/ora                               |
| Csere: 72 orankent                                |
+--------------------------------------------------+
```

**Design:**
- Each patch is represented as a visual card/badge:
  - Rounded rectangle with a subtle border
  - Patch size in large bold text (e.g., "100")
  - "mcg/ora" below in smaller text
  - If count > 1: show a small counter badge (e.g., "2x" in the corner)
- Patches are displayed in a horizontal row (flex wrap for mobile)
- Below the patches: total mcg/hr and change interval
- Color coding for patch sizes (optional, for quick visual identification):
  - 12 mcg/hr: light blue
  - 25 mcg/hr: light green
  - 50 mcg/hr: light yellow
  - 75 mcg/hr: light orange
  - 100 mcg/hr: light red

### 7.3 Patch Size Selection Algorithm

The existing `combinePatchSizes` function in `conversions.ts` uses a greedy algorithm and is functionally correct. It should be retained. The only enhancement needed is to also report the delta from the ideal target:

```typescript
// Enhanced return type
export interface PatchCombination {
  patches: Array<{ mcgPerHr: number; count: number }>;
  totalMcgPerHr: number;
  targetMcgPerHr: number;  // NEW: what the calculation called for
  deltaPercent: number;     // NEW: how far off we are
}
```

### 7.4 Breakthrough Dose for Patch Patients

When the target is a fentanyl patch, the breakthrough dose should be expressed in oral morphine equivalent, since breakthrough pain medication for patch patients is typically given as oral morphine:

```
Attoreses fajdalom dozis: 30 mg oralis Morfin
(A teljes csökkentett OME 1/6-a)
```

---

## 8. Responsive Design Specification

### 8.1 Breakpoint System

Using Tailwind's default breakpoint system (mobile-first):

| Breakpoint | Width | Target Device | Layout Changes |
|-----------|-------|--------------|----------------|
| Default (base) | 0-479px | Small phones | Single column, full-width cards, stacked inputs |
| `sm` | 480-639px | Large phones | Dose inputs in 2-column grid |
| `md` | 640-767px | Small tablets | Cards get more padding, max-width container |
| `lg` | 768-1023px | Tablets landscape | Two-column layout possible for side-by-side cards |
| `xl` | 1024px+ | Desktop | Centered container (max-width 640px), similar to mobile |

### 8.2 Mobile-First Design Decisions

**All interactive elements must meet minimum touch target sizes:**
- Minimum 44x44 CSS pixels (WCAG 2.1 AAA) — we target the higher standard
- Recommended 48x48 CSS pixels for primary actions
- Minimum 8px spacing between adjacent touch targets

**Specific mobile optimizations:**
- Header is sticky on mobile (position: sticky, top: 0)
- Drug combobox opens as a bottom sheet on mobile (< 640px)
- Numeric inputs trigger the numeric keyboard (`inputMode="decimal"`)
- Reduction slider thumb is 28px diameter (already in current CSS; keep this)
- "Calculate" button has padding of 16px vertical, full width
- Cards have 16px padding on mobile, 24px on tablet+
- Font sizes:
  - Body text: 16px (never below 14px on mobile)
  - Labels: 12px uppercase
  - Result values: 20px bold
  - Result target dose: 24px bold (the primary output number)

### 8.3 Bottom Sheet Pattern for Mobile Drug Selection

When the `DrugCombobox` opens on mobile:

```
+------------------------------------------+
|                                          |
|  (dimmed overlay)                        |
|                                          |
+------------------------------------------+
| --- (drag handle) ---                    |
| Keressen gyogyszert...  [___________]    |
|                                          |
| MORFIN                                   |
|   Morfin (oralis)                        |
|   Morfin (SC/IV)                         |
| OXIKODON                                 |
|   OxyContin (retard filmtabletta)        |
|   Codoxy (retard tabletta)               |
|   Codoxy Rapid                           |
|   ...                                    |
| FENTANIL                                 |
|   Durogesic (tapasz)                     |
|   ...                                    |
+------------------------------------------+
```

- Sheet covers bottom 60-70% of viewport
- Scrollable list inside the sheet
- Search input at top of the sheet (auto-focused)
- Dimmed backdrop; tapping backdrop closes the sheet
- Swipe-down gesture to close

### 8.4 Desktop Layout

On desktop/large screens (>= 768px), the app remains a single centered column at max-width 640px. There is no need for a multi-column layout because:
1. The calculator is inherently sequential (parameters -> current -> target -> results)
2. A narrow column is easier to scan for clinical data
3. It matches the mobile experience, reducing cognitive load for users who switch between devices

---

## 9. i18n Architecture

### 9.1 Current Implementation Assessment

The current `translations.ts` file uses a flat key-value object with inline `{ hu: "...", en: "..." }` pairs. This works but has limitations:
- All translations are in a single 295-line file (will grow)
- No string interpolation support (e.g., cannot insert a variable into a translation)
- No pluralization support
- Type safety is limited (keys are strings, not validated at compile time)

### 9.2 Proposed i18n Architecture

**Keep the lightweight approach.** Do NOT add a heavy i18n library like `react-i18next` or `i18next`. The app has only two languages and will not grow beyond that. Instead, enhance the existing pattern:

**File structure:**

```
src/i18n/
  index.ts          -- exports useLanguage hook and LanguageProvider
  types.ts          -- TypeScript types for translation keys
  hu.ts             -- Hungarian translations (flat object)
  en.ts             -- English translations (flat object)
  LanguageContext.tsx -- Provider and hook (enhanced)
```

**Translation file format:**

```typescript
// hu.ts
export const hu = {
  // App
  "app.title": "PalliCalc",
  "app.subtitle": "Opioid Rotacios Kalkulator",

  // Interpolation uses {placeholder} syntax
  "result.roundingNote": "Szamitott: {calculated} mg -> Kerekitve: {rounded} mg ({delta}%)",
  "result.breakthroughMax": "Max. napi attoreses osszadag: {count} x {dose} mg = {total} mg",

  // ... etc
} as const;

export type TranslationKey = keyof typeof hu;
```

**Enhanced `t()` function with interpolation:**

```typescript
function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template = translations[lang][key] || key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}
```

### 9.3 Language Toggle Design

- **Position:** Top-right corner of the header
- **Design:** Two pill-shaped buttons side by side: `[HU]` `[EN]`
- **Default:** Hungarian (`hu`)
- **Behavior:** Immediate language switch on tap; no page reload
- **Persistence:** Store selected language in `localStorage`; restore on next visit

### 9.4 Translation Key Naming Convention

```
{section}.{subsection}.{element}

Examples:
  patient.bmi.warning.low
  result.dosing.morning
  gfr.drug.avoid
  drug.oxycodone
  route.oral
  freq.q12h
```

### 9.5 All Clinical Warning Texts Must Be Bilingual

Every warning string must exist in both `hu.ts` and `en.ts`. No hardcoded English-only strings in the business logic layer. The current `conversions.ts` has some warnings in English only (e.g., the `WARNING_DRUGS` record). These must be moved to translation keys.

---

## 10. Accessibility Requirements

### 10.1 WCAG 2.1 AA Compliance Target

The app must meet WCAG 2.1 Level AA as a minimum. Key requirements:

### 10.2 Specific Requirements

**Color and Contrast:**
- All text must have a contrast ratio of at least 4.5:1 against its background (AA)
- Large text (18px+ or 14px+ bold) must have at least 3:1 contrast ratio
- Warning colors must not be the SOLE indicator — icons and text labels must also convey meaning
- Test the entire app in high contrast mode (Windows High Contrast Mode, macOS Increase Contrast)

**Keyboard Navigation:**
- All interactive elements must be focusable and operable via keyboard
- Tab order must follow visual order (top to bottom, left to right)
- Custom components (DrugCombobox, TappableChipGroup, ReductionSlider) must support:
  - `Tab` to focus
  - `Arrow keys` to navigate options
  - `Enter`/`Space` to select
  - `Escape` to close dropdowns
- Visible focus indicators (2px blue outline) on all interactive elements

**ARIA Labels:**
- `DrugCombobox`: `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-label="Gyogyszer valasztas"`
- `TappableChipGroup`: `role="radiogroup"` with each chip as `role="radio"`, `aria-checked`
- `ReductionSlider`: `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label`
- Warning boxes: `role="alert"` for dynamic warnings that appear based on input changes
- Results section: `aria-live="polite"` so screen readers announce when results appear

**Screen Reader Support:**
- All form fields must have associated `<label>` elements (not just visual labels)
- Drug groups in the combobox should be announced: "Oxikodon csoport, 6 marka" (Oxycodone group, 6 brands)
- Results should be structured with semantic HTML (`<dl>`, `<dt>`, `<dd>` for label/value pairs)

**Touch Targets:**
- Minimum 44x44 CSS pixels for all interactive elements
- 48x48 CSS pixels recommended for primary actions (Calculate button, drug selection chips)
- 8px minimum spacing between adjacent targets

### 10.3 Testing Plan

- Automated: ESLint plugin `eslint-plugin-jsx-a11y`
- Manual: Test with VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android)
- Color: Test with simulated color blindness (protanopia, deuteranopia, tritanopia) using browser devtools

---

## 11. Offline/PWA Considerations

### 11.1 Why PWA Matters

Palliative field teams operate in home settings where cellular connectivity may be unreliable. The app must work 100% offline after the first load. Since all calculation logic is client-side and there is no backend, this is achievable with a simple caching strategy.

### 11.2 Implementation with vite-plugin-pwa

Add `vite-plugin-pwa` to the Vite config:

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'PalliCalc - Opioid Rotacios Kalkulator',
        short_name: 'PalliCalc',
        description: 'Opioid rotacios kalkulator palliativ ellato csapatok szamara',
        theme_color: '#2563eb',
        background_color: '#f4f6f9',
        display: 'standalone',
        orientation: 'any',
        start_url: '/PalliCalc/',
        scope: '/PalliCalc/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Cache everything; the entire app is static
        runtimeCaching: [],
      },
    }),
  ],
  base: '/PalliCalc/',
});
```

### 11.3 Service Worker Strategy

- **Pre-caching:** All static assets (HTML, CSS, JS, fonts, icons) are pre-cached during the service worker installation
- **Update strategy:** `autoUpdate` — when a new version is deployed, the service worker updates in the background and the next page load uses the new version
- **No runtime caching needed:** There are no API calls or dynamic data fetches
- **Offline indicator:** Show a subtle badge in the header when the app is offline (detected via `navigator.onLine` + `online`/`offline` events)

### 11.4 "Add to Home Screen" Support

The PWA manifest enables "Add to Home Screen" on both Android and iOS:
- Android: Chrome will show an install banner automatically if the PWA criteria are met
- iOS: Safari supports PWA via manual "Add to Home Screen" — the manifest provides the correct name and icon

### 11.5 App Shell Architecture

The entire app is a single HTML file with inline critical CSS. The shell loads instantly from cache:

```
Index.html (cached) -> renders app shell -> hydrates React -> ready
```

Total time from cache: < 100ms.

---

## 12. Performance Requirements

### 12.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.0s on 3G | Lighthouse |
| Largest Contentful Paint (LCP) | < 1.5s on 3G | Lighthouse |
| Time to Interactive (TTI) | < 2.0s on 3G | Lighthouse |
| Total Bundle Size (gzipped) | < 60 KB | Build output |
| Total Bundle Size (uncompressed) | < 200 KB | Build output |
| Lighthouse Performance Score | > 95 | Lighthouse |
| Lighthouse Accessibility Score | > 95 | Lighthouse |
| Lighthouse PWA Score | Pass all audits | Lighthouse |
| Calculation time | < 50ms | Performance.now() |
| Input response latency | < 100ms | User perception |

### 12.2 Bundle Size Budget

| Module | Estimated Size (gzipped) |
|--------|-------------------------|
| React + ReactDOM | ~40 KB |
| Headless UI (tree-shaken: Combobox, Switch, Listbox) | ~5 KB |
| Tailwind CSS (purged) | ~8 KB |
| Application code (components + logic) | ~10 KB |
| vite-plugin-pwa runtime | ~1 KB |
| **Total** | **~64 KB** |

This is well within the budget. For comparison, the current app without Tailwind or Headless UI is approximately 45 KB gzipped.

### 12.3 Optimization Strategies

1. **Tailwind CSS purging:** Only classes actually used in the source code are included in the production build. This reduces CSS from ~3 MB (full Tailwind) to ~8 KB.

2. **Tree-shaking:** Headless UI exports individual components; Vite will only bundle the ones we import (Combobox, Switch, Listbox).

3. **No lazy loading needed:** The app is a single page with no routes. All components are needed immediately. Code splitting would add complexity without benefit.

4. **Font optimization:** Use the system font stack (already in use):
   ```css
   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...
   ```
   This loads zero font files.

5. **No images:** The app uses no images (icons are inline SVG or Unicode characters). This eliminates image loading overhead entirely.

6. **Pre-computation:** The drug database and conversion tables are static data compiled into the JavaScript bundle. No JSON fetching at runtime.

### 12.4 Development Performance

- **Hot Module Replacement (HMR):** Vite provides < 50ms HMR for React components
- **Build time:** Target < 5 seconds for a full production build
- **TypeScript type checking:** Run separately via `tsc -b` (already in the build script)

---

## Appendix A: Migration Path from Current to Proposed Architecture

### Phase 1: Infrastructure (Day 1)
1. Install Tailwind CSS v4, Headless UI v2, vite-plugin-pwa
2. Configure Tailwind in `vite.config.ts`
3. Set up PWA manifest and icons
4. Split translations into `hu.ts` and `en.ts` files
5. Add interpolation support to the `t()` function

### Phase 2: Shared Components (Day 1-2)
1. Build `TappableChip` and `TappableChipGroup` components
2. Build `DrugCombobox` component (replaces both current drug selects)
3. Build `InlineWarning` component (replaces ad-hoc warning boxes)
4. Build `NumberInput` component (enhanced numeric input)
5. Build `Card` base component

### Phase 3: Calculator State (Day 2)
1. Create `CalculatorProvider` with `useReducer`
2. Define all actions and the reducer function
3. Migrate state from `App.tsx` into the provider

### Phase 4: Component Migration (Day 2-3)
1. Rewrite `PatientParametersCard` using TappableChipGroup
2. Rewrite `CurrentRegimenCard` using DrugCombobox + chips
3. Rewrite `TargetRegimenCard` using DrugCombobox + chips + enhanced GFR
4. Add the `drug-database.ts` file with available tablet sizes

### Phase 5: Smart Rounding and Results (Day 3-4)
1. Implement `tablet-rounding.ts` (new)
2. Implement `formatting.ts` (new)
3. Build `PracticalDosingTable` component
4. Build `PatchCombinationDisplay` component
5. Build `BreakthroughDoseDisplay` component with max daily
6. Rewrite `ResultsCard` with all new sub-components

### Phase 6: Polish and Testing (Day 4-5)
1. Correct all GFR warning texts per user feedback
2. Verify all brand names are recognized and auto-populate routes correctly
3. Test asymmetric dosing for all frequency options
4. Test patch combination output for various OME values
5. Test smart rounding for all drugs and their available tablet sizes
6. Accessibility audit (keyboard navigation, screen reader, contrast)
7. PWA testing (install, offline, update)
8. Cross-browser testing (Chrome, Safari, Firefox on mobile)

---

## Appendix B: Detailed Available Tablet Size Data for Hungarian Market

This data must be validated with the user (Dr. Niedermüller) before implementation. The following is based on publicly available Hungarian pharmacy data:

### Morphine (Oral)
| Brand | Form | Available Sizes |
|-------|------|----------------|
| Sevredol | tabletta | 10 mg, 20 mg |
| M-Eslon | retard kapszula | 10 mg, 30 mg, 60 mg, 100 mg, 200 mg |
| MST Continus | retard tabletta | 10 mg, 30 mg, 60 mg, 100 mg, 200 mg |

### Oxycodone (Oral)
| Brand | Form | Available Sizes |
|-------|------|----------------|
| OxyContin | retard filmtabletta | 5 mg, 10 mg, 20 mg, 40 mg, 80 mg |
| Codoxy | retard tabletta | 5 mg, 10 mg, 20 mg, 40 mg, 80 mg |
| Codoxy Rapid | tabletta | 5 mg, 10 mg, 20 mg |
| Reltebon | retard tabletta | 5 mg, 10 mg, 20 mg, 40 mg |
| Oxycodone Sandoz | kemeny kapszula | 5 mg, 10 mg, 20 mg |
| Targin (+ naloxon) | retard tabletta | 5/2.5 mg, 10/5 mg, 20/10 mg, 40/20 mg |

### Hydromorphone (Oral)
| Brand | Form | Available Sizes |
|-------|------|----------------|
| Jurnista | retard tabletta | 4 mg, 8 mg, 16 mg, 32 mg |
| Palladone | kapszula | 1.3 mg, 2.6 mg |

### Tramadol (Oral)
| Brand | Form | Available Sizes |
|-------|------|----------------|
| Tramadol retard | retard tabletta | 50 mg, 100 mg, 150 mg, 200 mg |
| Tramadol | kapszula | 50 mg |
| Tramadol cseppek | oldat | Continuously titratable |

### Fentanyl (Transdermal Patch)
| Available Sizes |
|----------------|
| 12 mcg/hr, 25 mcg/hr, 50 mcg/hr, 75 mcg/hr, 100 mcg/hr |

### Fentanyl (Oral/Mucosal)
| Brand | Form | Available Sizes |
|-------|------|----------------|
| Effentora | buccalis tabletta | 100 mcg, 200 mcg, 400 mcg, 600 mcg, 800 mcg |
| Abstral | nyelv alatti tabletta | 100 mcg, 200 mcg, 300 mcg, 400 mcg, 600 mcg, 800 mcg |
| Actiq | szopogato | 200 mcg, 400 mcg, 600 mcg, 800 mcg, 1200 mcg, 1600 mcg |

---

## Appendix C: Design Tokens (Tailwind Configuration)

These values should be configured in the Tailwind CSS configuration or as CSS custom properties to maintain design consistency:

```typescript
// tailwind.config.ts (or inline CSS theme extension)
{
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#eff6ff',
        },
        danger: {
          bg: '#fef2f2',
          border: '#ef4444',
          text: '#991b1b',
        },
        caution: {
          bg: '#fffbeb',
          border: '#f59e0b',
          text: '#92400e',
        },
        success: {
          bg: '#f0fdf4',
          border: '#22c55e',
          text: '#166534',
        },
        surface: '#ffffff',
        background: '#f4f6f9',
        text: {
          DEFAULT: '#1e293b',
          secondary: '#64748b',
        },
        border: '#e2e8f0',
      },
      borderRadius: {
        card: '12px',
        chip: '24px',
        input: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-lg': '0 4px 12px rgba(0,0,0,0.1)',
      },
      fontSize: {
        'result-primary': ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'result-secondary': ['1.1rem', { lineHeight: '1.4', fontWeight: '600' }],
        'label': ['0.8rem', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0.02em' }],
      },
    },
  },
}
```

---

## Appendix D: Reference UX Patterns from Existing Medical Calculators

The following UX patterns from established medical calculators informed this specification:

1. **MDCalc**: Single-page form with instant results; input fields are simple and large; results are prominently displayed with evidence summaries. We adopt their pattern of showing results immediately below the form.

2. **eviQ Opioid Conversion Calculator**: Step-by-step conversion flow; shows intermediate values (OME) alongside final results; includes safety warnings inline. We adopt their transparency about intermediate calculation steps.

3. **Pain Data Opioid Calculator**: Supports multiple concurrent opioids; shows per-drug OME breakdown. We adopt their multi-drug input pattern.

4. **General mobile medical app patterns**: Large touch targets (48px+), high contrast text, no reliance on color alone for conveying information, system font usage for fast rendering.

---

*End of Frontend Specification*
