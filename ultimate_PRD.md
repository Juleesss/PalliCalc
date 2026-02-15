# PalliCalc v2.0 — Ultimate Product Requirements Document

**Product:** PalliCalc — Opioid Rotation Calculator for Palliative Mobile Teams
**Version:** 2.0 (Full Reimplementation)
**Date:** 2026-02-15
**Deadline:** 2026-02-21, Monday 12:00
**Target Users:** Adult Palliative Mobile Team, Hungary (Semmelweis University)
**Architecture:** Client-side-only SPA, no backend, no data storage

**Supporting Documents (the clinical and technical truth):**
- `clinical_data_reference.md` — Definitive pharmacology data, conversion factors, brand names, tablet sizes
- `frontend_specification.md` — Detailed frontend/UX specification
- `requirements_gap_analysis.md` — Complete traceability of user requirements and acceptance criteria

---

## 1. Executive Summary

PalliCalc is a mobile-first, offline-capable web calculator that helps palliative care professionals convert one or more current opioid regimens into a single target opioid dose using the Oral Morphine Equivalent (OME) model. It includes safety mechanisms for dose reduction (incomplete cross-tolerance), renal impairment (GFR), BMI-based warnings, and gender-specific dosing considerations.

**Why reimplementation:** The previous version had critical gaps:
1. No dose rounding to available tablet sizes (clinicians got unusable decimal doses)
2. No practical dosing output (no tablet counts, no unequal morning/evening splits)
3. Incorrect GFR warning texts (user provided exact text twice, was not followed)
4. Fentanyl brand names not recognized due to select component bugs
5. Missing brand names for morphine, tramadol, hydromorphone, dihydrocodeine
6. No breakthrough pain maximum display or escalation warning
7. No minimum dose enforcement (OxyContin 10mg minimum in Hungary)

---

## 2. Core Technical Constraints

- **No Backend / Zero Database:** All calculations client-side in TypeScript. No patient data stored or transmitted. GDPR-compliant by design.
- **Mobile-First UI:** Optimized for phones/tablets used by field teams. Minimum 48px touch targets. Big tappable buttons ("kattintással kiválasztható").
- **Offline-Capable (PWA):** Must work 100% offline after first load via service worker.
- **Framework:** React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + Headless UI v2.
- **No heavy libraries:** No Material UI, no Redux, no React Router. Keep bundle < 65KB gzipped.

---

## 3. User Flow & Features

### 3.1 Page Layout (Single Scrollable Page, 4 Cards)

```
HEADER: PalliCalc + Language Toggle [HU] [EN]
─────────────────────────────────────────────
CARD 1: Patient Parameters
  [BMI: 3 tappable buttons]  [Gender: 2 tappable buttons]
  (inline orange warnings appear here)
─────────────────────────────────────────────
CARD 2: Current Opioid Regimen
  [Drug Entry 1: searchable combobox → route chips → freq chips → dose]
  [Drug Entry 2] (if added)
  [+ Add Drug]
  Running OME total: 180 mg/nap
─────────────────────────────────────────────
CARD 3: Target Opioid & Safety
  [Target Drug: searchable combobox]
  [Route chips]  [Frequency chips]
  [GFR input]  [GFR warnings]
  [Reduction slider: 0-70%]
  [SZÁMÍTÁS button — full width]
─────────────────────────────────────────────
CARD 4: Results (appears after calculation)
  [OME Summary]
  [TARGET DOSE — large, prominent]
  [Practical Dosing Table with tablet counts]
  [Breakthrough Dose + Max Daily + Escalation Warning]
  [Patch Combination (if applicable)]
  [Warning Summary — color coded]
─────────────────────────────────────────────
FOOTER: Disclaimer
```

### 3.2 Step 1 — Patient Parameters (Top Card)

#### BMI Input
- **Three tappable buttons** (not a dropdown): `< 19` | `19–26` | `> 26`
- **BMI < 19 Warning (orange):**
  - HU: "Figyeljen a dozírozásra, mert kisebb lehet a tolerancia és magasabb toxicitási kockázat! Alacsony BMI esetén a lipofil opioidok (fentanil, metadon) nem tudnak nagy mennyiségben felhalmozódni a zsírszövetben, így magasabb plazmakoncentráció alakulhat ki. Fokozott légzésdepresszió kockázata."
  - EN: "Pay attention to dosing — tolerance may be lower and toxicity risk is higher. In low BMI patients, lipophilic opioids (fentanyl, methadone) cannot accumulate in fat tissue, leading to higher plasma concentrations. Risk of respiratory depression is higher."
- **BMI > 26 Warning (orange):**
  - HU: "A teljes testsúlyra történő adagolás könnyen túladagoláshoz vezethet! Javasoljuk, hogy az ideális testtömeg (IBW) alapján határozza meg a dóziscsökkentést. A zsírszövetben felhalmozódott szer lassabban szabadul fel (depóhatás), ami késleltetett eliminációt és fokozott légzésdepresszió-kockázatot okoz."
  - EN: "Dosing based on total body weight may lead to overdose. Base reduction on Ideal Body Weight (IBW). Lipophilic opioids accumulate in fat tissue causing delayed elimination (depot effect) and increased respiratory depression risk."

#### Gender Input
- **Two tappable buttons**: `Férfi` | `Nő`
- **Female Warning (orange):**
  - HU: "A kiszámolt dózis változtatandó lehet akár naponta is, ha premenopausában van a beteg! Az ösztrogén/progeszteron ingadozások befolyásolják az endogén opioid rendszert és a mu-receptor elérhetőségét. Orális gyógyszer adagolás ajánlott a rugalmasság érdekében."
  - EN: "Dose requirements may fluctuate daily due to hormonal cycle (premenopause). Oral administration is recommended for flexibility."

### 3.3 Step 2 — Current Opioid Regimen (Middle Card)

#### Drug Selection — Searchable Combobox (NOT native select)
- Opens as bottom sheet on mobile, dropdown on desktop
- Searchable by active ingredient name OR brand name (accent-insensitive)
- Grouped display: active ingredient as header, brand names indented below
- Selecting a brand auto-populates both drug AND route
- See `clinical_data_reference.md` §3 for complete brand name registry

#### Route Selection — Tappable Chips
- Display available routes as pill-shaped buttons: `Orális` | `SC/IV` | `Tapasz` | `Mukozális`
- Pre-highlighted when auto-populated by brand selection

#### Frequency Selection — Tappable Chips
- Options: `24h` | `12h` | `8h` | `6h` | `4h`
- For fentanyl patch: auto-set to 72h, hidden
- No dropdown — tappable buttons

#### Dose Input
- Single numeric input with unit label (mg, mcg/hr)
- Uses `inputMode="decimal"` for mobile numeric keyboard
- No maximum validation (no ceiling for major opioids)

#### Asymmetrical Dosing Toggle
- Toggle switch: "Eltérő adagok napközben?"
- When ON, shows per-time-of-day dose inputs with correct labels:
  - q24h (1x): Reggel
  - q12h (2x): **Reggel, Este** (NOT Reggel, Dél)
  - q8h (3x): Reggel, Délután, Éjjel
  - q6h (4x): Reggel, Dél, Délután, Este
  - q4h (6x): 06:00, 10:00, 14:00, 18:00, 22:00, 02:00

#### Multi-Drug Support
- "+ Gyógyszer hozzáadása" button to add concurrent opioids
- All converted to OME and summed automatically
- Running OME total displayed at bottom of card (real-time, debounced 300ms)

### 3.4 Step 3 — Target Opioid & Safety (Bottom Card)

#### Target Drug Selection
- Same searchable combobox as current regimen
- Must support switching from ANY drug to ANY drug

#### GFR Input (positioned AFTER opioid selection)
- Numeric input field: "GFR (ml/perc)" / "GFR (ml/min)"
- **GFR < 30 Warning (red):**
  - HU: "Nagy az opioid túladagolás és metabolit-felhalmozódás kockázata, ami súlyos mellékhatásokhoz vezethet! 25-50%-os dóziscsökkentés javasolt a rotációkor!"
  - EN: "High risk of opioid overdose and metabolite accumulation, which may lead to severe side effects! 25-50% dose reduction recommended during rotation!"
- **GFR < 10 Warning (red):**
  - HU: "Nagy az opioid túladagolás és metabolit-felhalmozódás kockázata, ami súlyos mellékhatásokhoz vezethet! Legalább 50%-os dóziscsökkentés javasolt a rotációkor!"
  - EN: "High risk of opioid overdose and metabolite accumulation, which may lead to severe side effects! At least 50% dose reduction recommended during rotation!"

#### GFR Drug-Specific Warnings (dynamic, based on target drug)
- **Morphine/Codeine/Dihydrocodeine + GFR < 30 (red):**
  - HU: "Kerülendő! Az aktív metabolitok (pl. morfin-6-glükuronid) felhalmozódnak, ami neurotoxicitást és szedációt okozhat."
  - EN: "AVOID! Active metabolites accumulate. Consider fentanyl as safer alternative."
- **Oxycodone/Hydromorphone + GFR < 30 (orange):**
  - HU: "Óvatosan alkalmazandó! Csökkentett dózisban és ritkított gyakorisággal alkalmazandó, szoros monitorozás mellett."
  - EN: "USE CAUTION! Reduce dose and frequency. Monitor closely."
- **Fentanyl + GFR < 30 (green):**
  - HU: "Biztonságosabb alternatíva! Mivel nincs aktív metabolitja, a fentanil a választandó szer veseelégtelenségben."
  - EN: "PREFERRED! Fentanyl is the drug of choice in renal impairment (no active metabolites)."

#### Cross-Tolerance Reduction Slider
- Range: 0% – 70%, Step: 5%, Default: 25%
- **GFR-based slider locking:**
  - GFR 10–30: minimum **25%** (slider cannot go below)
  - GFR < 10: minimum **50%** (slider cannot go below)
- Display current value prominently above slider
- Note when locked: "A GFR érték alapján a minimális csökkentés: 25%/50%"

#### Calculate Button
- Full-width, prominent blue button: "SZÁMÍTÁS" / "CALCULATE"
- Disabled (grayed) until all required fields are filled
- On tap: auto-scroll to Results card

### 3.5 Step 4 — Results (Appears After Calculation)

#### OME Summary (secondary info)
- "Jelenlegi összes OME: 270 mg/nap"
- "Csökkentett OME (25%): 202.5 mg/nap"

#### Target Daily Dose (PRIMARY — large, bold)
- "Cél napi összdózis: 135 mg Oxikodon/nap"

#### Practical Dosing Table (CRITICAL NEW FEATURE)
For non-injectable, non-patch drugs:
```
ADAGOLÁSI JAVASLAT (12 óránként)              5 tabl./nap
─────────────────────────────────────────────────────────
Reggel:  50 mg   (2× 20mg + 1× 10mg Codoxy retard)
Este:    60 mg   (3× 20mg Codoxy retard)
─────────────────────────────────────────────────────────
Számított: 108.5 mg → Kerekítve: 110 mg (+1.4%)
```

- Smart rounding to available Hungarian tablet sizes
- Unequal morning/evening split when TDD doesn't divide evenly
- Tablet breakdown per dose with brand name and count
- Rounding delta displayed (how far from calculated value)
- See `clinical_data_reference.md` §4 and §5 for tablet sizes and rounding algorithm

#### Breakthrough Pain Dose (ENHANCED)
```
ÁTTÖRÉSES FÁJDALOM
─────────────────────────────────────────────────────────
Egyszeri dózis: 18 mg Oxikodon (1× 10mg + 1× 5mg)
Max. napi áttöréses összadag: 6 × 18 mg = 108 mg
─────────────────────────────────────────────────────────
⚠ Ha ennél több szükséges, az alap dózis emelendő!
```

- Single breakthrough dose = TDD / 6 (rounded to available IR tablets)
- Maximum daily breakthrough total = single dose × 6
- Escalation warning always shown

#### Fentanyl Patch Combination (when target is patch)
- Visual patch cards showing each patch size
- Available sizes: 12, 25, 50, 75, 100 mcg/hr
- Greedy algorithm: largest to smallest to reach target
- Show total mcg/hr and 72-hour change schedule
- Note: 12mcg/hr only available as Matrifen in Hungary

#### Warning Summary
- All applicable warnings collected and displayed, color-coded:
  - **Red** — GFR warnings, drug contraindications
  - **Orange** — BMI warnings, gender warnings, drug caution
  - **Green** — Preferred drug notes (fentanyl in renal failure)
- Non-dismissable (persistent while triggering condition exists)

---

## 4. Pharmacological Logic & Data Model

### 4.1 OME Conversion Flow
```
For each current drug:
  TDD = dose × frequency (symmetric) OR sum of all doses (asymmetric)
  OME = TDD × factor_to_ome (standard drugs)
       OR lookup_table(mcg/hr) (fentanyl patch)

Total OME = sum of all drug OMEs
Reduced OME = Total OME × (1 - reduction%)
  [reduction% enforced by GFR slider lock]

Target TDD = Reduced OME × factor_from_ome (standard drugs)
            OR reverse_lookup → patch combination (fentanyl patch)
            OR Ripamonti non-linear conversion (methadone)

Divided doses = smart_round(Target TDD, frequency, available_tablet_sizes)
Breakthrough = Target TDD / 6, rounded to available IR tablet size
```

### 4.2 Conversion Table (Adopted Factors)

| Drug | Route | Factor TO OME | Factor FROM OME | Unit |
|:--|:--|:--|:--|:--|
| Morphine | Oral | 1.0 | 1.0 | mg |
| Morphine | SC/IV | 3.0 | 0.333 | mg |
| Oxycodone | Oral | 1.5 | 0.667 | mg |
| Oxycodone | SC/IV | 3.0 | 0.333 | mg |
| Hydromorphone | Oral | 5.0 | 0.2 | mg |
| Hydromorphone | SC/IV | 15.0 | 0.067 | mg |
| Tramadol | Oral | 0.1 | 10.0 | mg |
| Tramadol | IV | 0.1 | 10.0 | mg |
| Codeine | Oral | 0.1 | 10.0 | mg |
| Dihydrocodeine | Oral | 0.1 | 10.0 | mg |
| Fentanyl | SC/IV | 100.0 | 0.01 | mg |
| Fentanyl | Oral/Mucosal | 50.0 | 0.02 | mg |
| Fentanyl | Patch | LOOKUP TABLE | LOOKUP TABLE | mcg/hr |

### 4.3 Fentanyl Patch Lookup Table

| Patch (mcg/hr) | OME Low (mg/day) | OME High (mg/day) | Midpoint |
|:--|:--|:--|:--|
| 12 | 30 | 45 | 37.5 |
| 25 | 60 | 90 | 75.0 |
| 50 | 120 | 150 | 135.0 |
| 75 | 180 | 225 | 202.5 |
| 100 | 240 | 300 | 270.0 |

Available patch sizes for combination: **12, 25, 50, 75, 100 mcg/hr**

### 4.4 Available Tablet Sizes (Hungarian Market)

| Drug | Route | Available Strengths |
|:--|:--|:--|
| Morphine oral retard | Oral | 10, 30, 60, 100 mg (MST Continus) |
| Morphine IR | Oral | 10 mg (Sevredol) |
| Oxycodone retard | Oral | 5, 10, 20, 40, 80 mg (Codoxy) |
| Oxycodone IR | Oral | 5, 10, 20 mg (Codoxy Rapid / Sandoz) |
| Oxycodone+Naloxone retard | Oral | 5, 10, 20, 40 mg (Targin) |
| Hydromorphone retard | Oral | 4, 8, 16, 32 mg (Jurnista) |
| Tramadol retard | Oral | 100, 150, 200 mg |
| Tramadol IR | Oral | 50 mg |
| Dihydrocodeine retard | Oral | 60 mg (DHC Continus) |
| Fentanyl patch | TDT | 12, 25, 50, 75, 100 mcg/hr |

**OxyContin minimum dose: 10mg** (user-specified requirement for Hungary)

### 4.5 Smart Dose Rounding Algorithm

1. Calculate ideal per-dose: `targetTDD / frequency`
2. Find nearest achievable dose using available tablet sizes (greedy algorithm, largest to smallest)
3. If equal dosing works (rounding error < 10%): use equal doses
4. Otherwise: asymmetric split — lower dose for some slots, higher for others, closest to target TDD
5. Prefer rounding DOWN for safety
6. Never round up by more than 15%
7. Display: tablet counts + actual TDD + delta from calculated TDD
8. If any dose < minimum available: warn and suggest minimum

### 4.6 Breakthrough Pain Rules

- Single breakthrough dose = **TDD / 6**
- Round to nearest available IR tablet size
- Maximum daily breakthrough total = **6 × single breakthrough dose**
- If patient needs more than this: display "Az alap dózis emelendő!" / "Base dose needs increasing!"

### 4.7 Warning/Excluded Drugs

- **Methadone:** Non-linear conversion using Ripamonti method (see `clinical_data_reference.md` §10). Hard warning about specialist consultation, QTc monitoring, 5-7 day equilibration.
- **Nalbuphine:** Block calculation. Cannot be used for rotation from pure mu-agonists (precipitates withdrawal).
- **Pethidine:** Block as target drug. Neurotoxic metabolite (norpethidine). Warn when used as source.

### 4.8 Brand Name Registry

Complete Hungarian brand names for ALL drugs. See `clinical_data_reference.md` §3 for full registry including:
- **Morphine:** MST Continus, Sevredol, Morphine Kalceks
- **Oxycodone:** OxyContin, Codoxy, Codoxy Rapid, Reltebon, Oxycodone Sandoz, Oxycodone Vitabalans
- **Oxycodone+Naloxone:** Targin, Oxynal, Oxynador, Neuraxpharm
- **Fentanyl TDT:** Durogesic, Dolforin, Matrifen, Fentanyl Sandoz MAT, Fentanyl-ratiopharm
- **Fentanyl Oral:** Effentora, Abstral, Actiq
- **Fentanyl Injection:** Fentanyl Kalceks, Fentanyl-Richter, Fentanyl Sandoz (injectio)
- **Tramadol:** Contramal, Adamon, Ralgen, Tramadol AL, Tramadol Kalceks, etc.
- **Hydromorphone:** Jurnista, Palladone
- **Dihydrocodeine:** DHC Continus

**Critical:** "Fentanyl Sandoz" exists as BOTH patch and injection — must be disambiguated as "Fentanyl Sandoz (tapasz)" and "Fentanyl Sandoz (injectio)".

---

## 5. Technology Stack

| Layer | Technology | Rationale |
|:--|:--|:--|
| Framework | React 19 + TypeScript (strict) | Stable, well-supported |
| Build | Vite 7 | Fast HMR, tree-shaking |
| Styling | Tailwind CSS v4 | Mobile-first utilities, <10KB purged |
| Components | Headless UI v2 | Accessible Combobox, Switch, Listbox |
| PWA | vite-plugin-pwa | Offline service worker |
| State | useReducer + Context | No external state library needed |
| Deployment | gh-pages | GitHub Pages static hosting |

**Bundle budget:** < 65KB gzipped total.

---

## 6. Component Architecture

```
App.tsx
  Header.tsx (title + LanguageToggle)
  CalculatorProvider.tsx (useReducer state management)
    PatientParametersCard.tsx
      BmiSelector.tsx (3 tappable chips)
      GenderSelector.tsx (2 tappable chips)
      InlineWarning.tsx
    CurrentRegimenCard.tsx
      DrugEntry.tsx (repeatable)
        DrugCombobox.tsx (shared, searchable, Headless UI)
        RouteSelector.tsx (tappable chips)
        FrequencySelector.tsx (tappable chips)
        DoseInputGroup.tsx
        AsymmetricToggle.tsx
      AddDrugButton.tsx
      RunningOmeTotal.tsx
    TargetRegimenCard.tsx
      DrugCombobox.tsx (shared)
      RouteSelector.tsx
      FrequencySelector.tsx
      GfrInput.tsx + GfrWarningBanner.tsx + GfrDrugAdvice.tsx
      ReductionSlider.tsx
      CalculateButton.tsx
    ResultsCard.tsx
      OmeSummary.tsx
      PracticalDosingTable.tsx (NEW — smart rounding + tablet counts)
      BreakthroughDoseDisplay.tsx (NEW — with max daily + escalation)
      PatchCombinationDisplay.tsx (enhanced visual)
      WarningSummary.tsx (color-coded aggregation)
  Footer.tsx (disclaimer)

lib/ (pure logic, no React)
  types.ts
  conversions.ts (OME math engine — keep validated logic)
  drug-database.ts (drugs, brands, tablet sizes)
  tablet-rounding.ts (NEW — smart rounding algorithm)
  formatting.ts (NEW — dosing string generation)
  warnings.ts (extracted, bilingual)
  patch-calculator.ts (extracted)

i18n/
  hu.ts + en.ts (separate files, with interpolation support)
  LanguageContext.tsx
```

---

## 7. UI/UX Specifications

### 7.1 Drug Selection — Searchable Combobox
- Replaces native `<select>` — the #1 UX complaint
- On mobile: opens as bottom sheet (60% viewport height)
- On desktop: standard dropdown
- Accent-insensitive filtering (á/a, é/e, ö/o, ü/u)
- Groups: active ingredient as bold header, brands indented below
- Brand selection auto-populates drug + route

### 7.2 Route and Frequency — Tappable Chips
- Pill-shaped buttons (min 48px height, 64px width)
- Selected state: primary blue fill, white text
- Unselected: white fill, gray border

### 7.3 Color System
- **Red (danger):** `bg: #fef2f2, border: #ef4444` — GFR warnings, contraindications
- **Orange (caution):** `bg: #fffbeb, border: #f59e0b` — BMI, gender, drug caution
- **Green (preferred):** `bg: #f0fdf4, border: #22c55e` — Safe choice notes
- **Blue (info):** `bg: #eff6ff, border: #2563eb` — General information

### 7.4 Warning Behavior
- All warnings are **persistent** (not dismissable)
- Disappear automatically when triggering condition is resolved
- Inline warnings next to inputs + aggregated summary in results

### 7.5 Responsive Breakpoints
| Breakpoint | Width | Behavior |
|:--|:--|:--|
| Base | 0-479px | Single column, stacked, bottom-sheet combobox |
| sm | 480-639px | Dose inputs in 2-column grid |
| md | 640-767px | More padding, max-width container |
| lg/xl | 768px+ | Centered single column (max-width 640px) |

### 7.6 Accessibility (WCAG 2.1 AA)
- All interactive elements: keyboard navigable, ARIA labeled
- Combobox: `role="combobox"`, `aria-expanded`, arrow key navigation
- Chips: `role="radiogroup"` + `role="radio"`, `aria-checked`
- Warnings: `role="alert"` for dynamic warnings
- Results: `aria-live="polite"`
- 4.5:1 contrast ratio minimum
- 48px minimum touch targets

### 7.7 i18n
- Hungarian default, English secondary
- Separate `hu.ts` and `en.ts` files
- String interpolation: `{placeholder}` syntax in templates
- Language stored in localStorage, persisted across sessions
- ALL warning texts bilingual — no hardcoded English in business logic

---

## 8. Preserved Features (from v1)

These features work correctly and MUST be preserved:
1. Core OME conversion pipeline (calculateTdd, drugDoseToOme, sumOmes, applyReduction)
2. Fentanyl patch lookup table with midpoint interpolation
3. Patch combination greedy algorithm (combinePatchSizes)
4. Asymmetrical dosing toggle with per-dose inputs
5. 12-hour labels: Morning/Evening (not Morning/Noon)
6. BMI 3-category selector with clinical warnings
7. Gender selector with premenopause warning
8. GFR slider locking: 25% for GFR 10-30, 50% for GFR < 10
9. GFR drug-specific warnings (avoid/caution/preferred)
10. Oxycodone+Naloxone handled as oxycodone for OME conversion
11. Warning drugs system (methadone, nalbuphine, pethidine)
12. Multi-drug input summed to single OME baseline
13. Card-based layout structure
14. Bilingual HU/EN interface

---

## 9. New Features (v2)

| # | Feature | Priority | Description |
|:--|:--|:--|:--|
| 1 | **Smart dose rounding** | CRITICAL | Round to available Hungarian tablet sizes with unequal splits |
| 2 | **Practical dosing output** | CRITICAL | Tablet counts per dose with brand names |
| 3 | **Correct GFR warning texts** | CRITICAL | Exact Hungarian text as specified by user |
| 4 | **Searchable drug combobox** | HIGH | Replace native select, fix brand recognition |
| 5 | **Complete brand name registry** | HIGH | All drugs, all brands for Hungarian market |
| 6 | **Breakthrough max + escalation** | HIGH | Show max daily breakthrough, "base dose increase" warning |
| 7 | **OxyContin minimum dose** | HIGH | 10mg minimum enforcement for Hungary |
| 8 | **Codeine as selectable drug** | HIGH | Referenced in GFR warnings but missing from drug list |
| 9 | **Running OME total** | HIGH | Real-time OME preview during input |
| 10 | **Hydromorphone SC/IV route** | MEDIUM | New parenteral route (factor 15.0) |
| 11 | **Transmucosal fentanyl warning** | MEDIUM | Individual titration, not linear conversion |
| 12 | **Tramadol max dose warning** | MEDIUM | Warn when calculated > 400mg/day |
| 13 | **PWA offline support** | MEDIUM | Service worker + manifest for installability |
| 14 | **Reset/Clear button** | LOW | Start new calculation without page refresh |

---

## 10. Acceptance Criteria (Must Pass)

See `requirements_gap_analysis.md` §8 for 24 detailed acceptance criteria. Key ones:

| AC | Test |
|:--|:--|
| AC-001 | 108.5mg oxycodone q12h → "Reggel: 50mg (5×10mg), Este: 60mg (6×10mg)" |
| AC-003 | GFR=25 → exact Hungarian text: "Nagy az opioid túladagolás..." |
| AC-004 | GFR=8 → exact text with "Legalább 50%-os..." |
| AC-009 | q12h asymmetric → labels "Reggel" and "Este" |
| AC-010 | Fentanyl patch target → combination from {12,25,50,75,100} |
| AC-011 | Selecting "Durogesic" → drug=fentanyl, route=patch (auto) |
| AC-012 | "Fentanyl Sandoz (tapasz)" ≠ "Fentanyl Sandoz (injectio)" — distinct options |
| AC-017 | 5000mg morphine → accepted (no ceiling) |
| AC-018 | Breakthrough = TDD/6 + max daily + escalation warning |

---

## 11. Out of Scope

- User authentication/login
- Patient data storage or persistence
- PDF report generation (browser print is sufficient)
- Inventory/stock management
- Backend API of any kind
- Methadone automatic conversion (show warning + Ripamonti table only)
- Nalbuphine/Pethidine as target drugs (blocked with warning)

---

## 12. Performance Targets

| Metric | Target |
|:--|:--|
| First Contentful Paint | < 1.0s on 3G |
| Time to Interactive | < 2.0s on 3G |
| Total Bundle (gzipped) | < 65 KB |
| Lighthouse Performance | > 95 |
| Lighthouse Accessibility | > 95 |
| Calculation time | < 50ms |

---

## 13. Reference Documents

- `clinical_data_reference.md` — Complete pharmacology data (conversion factors, brand names, tablet sizes, GFR matrix, methadone rules)
- `frontend_specification.md` — Detailed UX specification (component architecture, responsive design, accessibility, PWA)
- `requirements_gap_analysis.md` — Full traceability matrix, bug reports, acceptance criteria, edge cases
- `user_requirements.md` — Original user emails (ground truth)
- `Opioid Usage Analysis_ Semmelweis University.md` — Clinical context and background

---

*This PRD supersedes all previous PRD.md and prd_changes.md documents. It is the single source of truth for the v2.0 reimplementation.*
