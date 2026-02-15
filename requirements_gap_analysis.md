# PalliCalc Requirements Gap Analysis & Reimplementation Specification

**Date:** 2026-02-15
**Author:** QA & Requirements Agent
**Purpose:** Comprehensive gap analysis comparing user requirements (3 rounds of feedback) against the current implementation. This document serves as the definitive specification for the reimplementation.

---

## Table of Contents

1. [Complete Requirements Traceability Matrix](#1-complete-requirements-traceability-matrix)
2. [Bug Report](#2-bug-report)
3. [Missing Features List](#3-missing-features-list)
4. [What Worked Well](#4-what-worked-well)
5. [What Was Wrong and Must Change](#5-what-was-wrong-and-must-change)
6. [Clinical Accuracy Issues](#6-clinical-accuracy-issues)
7. [User Experience Issues](#7-user-experience-issues)
8. [Acceptance Criteria for Reimplementation](#8-acceptance-criteria-for-reimplementation)
9. [Edge Cases and Scenarios](#9-edge-cases-and-scenarios)
10. [Priority Ordering](#10-priority-ordering)

---

## 1. Complete Requirements Traceability Matrix

### Email 1 -- Original Requirements

| ID | Original (HU) | Translation (EN) | Status | Evidence from Code | What Needs to Change |
|----|----------------|-------------------|--------|-------------------|---------------------|
| R1.1 | "kattintasal kivalaszthato legyen a gyogyszer" | Drug selectable by clicking | IMPLEMENTED | `DrugSelect` component in `CurrentRegimen.tsx` uses `<select>` dropdown | Working, but needs brand name improvements (see R2.4-R2.6) |
| R1.2 | "Beirhato a dozis" | Dose input field | IMPLEMENTED | Numeric `<input>` in `CurrentRegimen.tsx` line 333-341 | Working correctly |
| R1.3 | "Naponta tobbszori azonos dozisa adasa eseten automatikusan szamolja a napi adagot" | Auto-calculate daily total for same dose multiple times | IMPLEMENTED | `calculateTdd()` in `conversions.ts` line 133-139 multiplies dose by frequency | Working correctly |
| R1.4 | "Kerdezzen ra, hogy azonos-e a dozis, ha nem be lehessen irni" | Ask if doses are same; if not, allow different input | IMPLEMENTED | Asymmetrical dosing toggle checkbox in `CurrentRegimen.tsx` line 288-300, expands to per-dose inputs | Working correctly |
| R1.5 | "6-8-12-24-72 oras adagolast is tudjon" | Support 6, 8, 12, 24, 72 hour dosing intervals | IMPLEMENTED | `getFrequencyOptions()` in `CurrentRegimen.tsx` returns q24h/q12h/q8h/q6h/q4h options; q72h for patches | User asked for 6-8-12-24-72 hours. Code has q4h (6x/day) which is 4-hourly, NOT 6-hourly. The user said "6 oras" meaning every 6 hours (q6h = 4x/day). This is actually correct in the code as value=4 maps to q6h. Also includes q4h (value=6) which user did not explicitly request but is clinically useful. OK. |
| R1.6 | "Barmelyik gyogyszerrol barmelyikre valtson" | Switch from ANY drug to ANY drug | PARTIALLY | Can switch between 6 drugs (morphine, oxycodone, hydromorphone, tramadol, dihydrocodeine, fentanyl). Missing: codeine (mentioned in GFR warnings but not in drug list) | Add codeine to drug list. Methadone and nalbuphine are warning-only which is correct per PRD. |
| R1.7 | "Mivel nincs a maior opiatoknak plafon effektusa ezert barmekkora dozist be lehessen irni" | No ceiling for major opioids - allow any dose | IMPLEMENTED | `<input type="number" min="0" step="any">` with no max constraint | Working correctly |
| R1.8 | "Tobb gyogyszer egyuttes hasznalata eseten is lehessen egy masikra valtani" | Multiple drugs simultaneously convertible to single target | IMPLEMENTED | "Add Drug" button in `CurrentRegimen.tsx`; `computeTargetRegimen()` sums all OMEs | Working correctly |
| R1.9 | "Szazalekos aranyban -amit az atvaltas kero hatarozza meg- lehessen csokkenteni a dozist" | Percentage-based dose reduction by user | IMPLEMENTED | Slider in `TargetRegimen.tsx` with range 0-70%, step 5% | Working correctly |
| R1.10 | "Kerjen GFR adatot, amennyiben az kisebb mint 30% hivja fel a program a figyelmet az opioid tuladagolas veszelyere" | Ask GFR; if <30, warn about overdose risk | BUGGY | GFR input exists in `TargetRegimen.tsx`; warning triggers at GFR<30. BUT the warning text does not match what user specified in Email 3. | Must fix warning text (see R3.5, R3.6) |

### Email 2 -- Bug Fixes & New Features

| ID | Original (HU) | Translation (EN) | Status | Evidence from Code | What Needs to Change |
|----|----------------|-------------------|--------|-------------------|---------------------|
| R2.1 | "Az adagolasi gyakorisagnal a 12 orat valasztom akkor reggel es del jelenik meg! A delit valtoztatsd estere!" | 12-hour frequency shows "Morning and Noon" - should be "Morning and Evening" | IMPLEMENTED (FIXED) | `getDoseLabelsForFrequency(2)` returns `["dose.morning", "dose.evening"]` in `CurrentRegimen.tsx` line 19 | Fixed in current code. Preserve. |
| R2.2 | "atszamitasnal, ha fentanyl TDTt valasztok, akkor a javasolt tapasz nem jo! 100-75-50-25-12 mkrgrammos tapaszok vannak, ezekbol rakja ossze a gep a javasolt adagot!" | Fentanyl TDT patch calculation wrong - must combine from 100/75/50/25/12 mcg patches | IMPLEMENTED | `combinePatchSizes()` in `conversions.ts` line 396-419 uses greedy algorithm with sizes [100, 75, 50, 25, 12] | Implemented but needs verification of correctness for edge cases. The greedy algorithm may not always produce optimal combinations. |
| R2.3 | "A %-os dozis csokkentesnel a kurzor mehessen 70%-ig!" | Dose reduction slider should go up to 70% | IMPLEMENTED | `max="70"` in `TargetRegimen.tsx` line 206 | Working correctly |
| R2.4 | "A gyogyszertari neve es a hatoanyag neve is legyen valaszthato!" | Drug selection by BOTH active ingredient AND brand name | PARTIALLY | `DRUG_OPTIONS` in `conversions.ts` has brands for oxycodone and fentanyl only. Missing: morphine, hydromorphone, tramadol, dihydrocodeine, codeine brands. | Must add Hungarian brand names for ALL drugs |
| R2.5 | "Akar ugy, hogy a hatoanyag neve alatt megjelennek a gyogyszertari nevek" | Brand names listed under active ingredients in dropdown | IMPLEMENTED | `<optgroup>` structure in `DrugSelect` component with brands as sub-options | Working correctly for drugs that have brands defined |
| R2.6 | Specific brand name mappings for Oxycodone, Oxycodone+Naloxone, Fentanyl TDT/oral/injection | Brand name mappings provided | PARTIALLY | Oxycodone brands present (10 entries). Fentanyl brands present (11 entries). But user reported in Email 3 that "Fentanyl brand names still not recognized" | Investigate and fix fentanyl brand recognition issue. Likely a duplicate "Fentanyl Sandoz" entry (one for patch, one for injection) causing value collision in `<select>`. |
| R2.7 | "A beteg adatoknal legyen BMI is: BMI harom valaszthato <18; BMI 19-26; BMI 26<" | BMI input with three categories | IMPLEMENTED | `PatientParameters.tsx` with "low"/"normal"/"high" options | Note: User wrote "<18" in one place and "<19" in another. PRD uses <19. Code uses <19. Keep <19. |
| R2.8 | "Elejen legyen, a GFR helyen a BMI; a GFRt tedd az opioid valasztas utan!" | BMI at TOP, GFR moved AFTER opioid selection | IMPLEMENTED | BMI is in `PatientParameters` (rendered first); GFR is inside `TargetRegimen` (after drug selection) | Working correctly |
| R2.9 | "Neme: Ferfi/No. Ha a not valasztja, jelezze: A kiszamolt dozis valtoztathato lehet akar naponta is ha premenopausaban van a beteg! Ezert oralis gyogyszer adagolas ajanlott!" | Gender input with premenopause warning for female | IMPLEMENTED | Gender selector in `PatientParameters.tsx` with female warning | Working correctly |
| R2.10 | "Az alacsony (<30) GFR eseten a rotalando opioid szerint jelenjen meg az a felirat amelyik oda vonatkozik: Morfin es Kodein: Kerulendo... Oxikodon es Hidromorfon: ovatosan... fentanil a valasztando szer" | GFR <30: drug-specific warnings | IMPLEMENTED | `computeTargetRegimen()` adds `gfr.drug.avoid`, `gfr.drug.caution`, `gfr.drug.preferred` keys based on target drug | Translation keys exist in `translations.ts`. Working. |
| R2.11 | "GFR <10: Legalabb 50%-kal javasolt csokkenteni a dozist! Figyeljen a dozirozasra: lassu dozisemeles javasolt!" | GFR <10: 50% dose reduction, slow titration | IMPLEMENTED | `gfr.below10.warning` translation key exists; slider locks to min 50% for GFR<10 | Working correctly |
| R2.12 | "ha a GFR 10-30 ml/min CrCl eseten 25%-kal... ne engedje lejebb a kurzort!" | GFR 10-30: slider locked at minimum 25% | IMPLEMENTED | `getGfrSliderMin()` returns 25 for GFR 10-30 in `conversions.ts` line 234 | Working correctly |
| R2.13 | "GFR <10 ml/min eseten 50%-kal... ne engedje lejebb a kurzort!" | GFR <10: slider locked at minimum 50% | IMPLEMENTED | `getGfrSliderMin()` returns 50 for GFR<10 in `conversions.ts` line 233 | Working correctly |

### Email 3 -- Final Bug Fixes & Refinements

| ID | Original (HU) | Translation (EN) | Status | Evidence from Code | What Needs to Change |
|----|----------------|-------------------|--------|-------------------|---------------------|
| R3.1 | "Fentanyl gyogyszertari neveit nem ismeri fel ellenorizd!" | Fentanyl brand names still not recognized - CHECK ALL | BUGGY | Likely caused by duplicate "Fentanyl Sandoz" entries in `DRUG_OPTIONS` (line 73 for patch, line 80 for injection). When both have `value="fentanyl|patch"` or `value="fentanyl|sc/iv"`, the `<select>` may have issues with identical display text or value resolution. | Fix: Ensure each brand has a unique combination of display name + form text. "Fentanyl Sandoz (tapasz)" vs "Fentanyl Sandoz (injectio)" should be distinguishable. Verify all brand-to-route mappings work end-to-end. |
| R3.2 | "Az oxycontin oralis adagolasanal 10 mg-os a legkisebb dozis magyarorszagon!" | OxyContin oral minimum dose is 10mg in Hungary | NOT IMPLEMENTED | No minimum dose validation anywhere in the codebase. No tablet size data defined. | Must add minimum dose validation for OxyContin (10mg) and ideally for all drugs with known minimum available doses in Hungary. |
| R3.3 | "Az adagolasnal kerekitsen a gep, es aszerint adja ki (pl, ha 108,5mg oxycontin a napi adag, akkor reggel 50 este 60mg javasolt) [5 es 6 tabl/nap]" | Dose rounding needed (108.5mg oxycontin -> morning 50mg + evening 60mg, = 5 and 6 tablets/day) | NOT IMPLEMENTED | `divideDailyDose()` in `conversions.ts` simply divides TDD equally. No rounding to tablet sizes. No unequal morning/evening split. No tablet count output. | Must implement: (1) Available tablet sizes per drug, (2) Smart rounding to nearest tablet-achievable dose, (3) Unequal split for non-round TDD, (4) Output showing number of tablets per dose. |
| R3.4 | "Az attoreso fajdalomra adhato maximalis dozisra az adhato maximalis osszadagot irja ki, ha ennel tobb kell, akkor alap dozis emelendo!" | Breakthrough pain: show maximum total daily dose; if more needed, "base dose needs increasing" | NOT IMPLEMENTED | Current code calculates breakthrough dose as TDD/6 but does NOT show maximum total daily breakthrough dose. No "base dose needs increasing" warning. | Must implement: (1) Show that breakthrough max = 6 x (TDD/6) = TDD, meaning if patient needs more breakthrough doses than what sums to TDD, base dose should be increased. (2) Add explicit text: "Ha ennnel tobb szukseges, az alapdozis emelendo!" |
| R3.5 | 'GFR < 30: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! 25-50%-os doziscsokkentes javasolt a rotaciokor!"' | GFR <30 warning text must be EXACTLY this Hungarian text | BUGGY | Current `patient.gfr.warning` HU text: "Magas opioid tuladagolas es metabolit-felhalmozodas kockazata. Sulyos mellekhatásokhoz (legzesdepresszio, szedacio, neurotoxicitas) vezethet." This does NOT match user's required text. | Must change to EXACTLY: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! 25-50%-os doziscsokkentes javasolt a rotaciokor!" |
| R3.6 | 'GFR < 10: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! Legalabb 50%-os doziscsokkentes javasolt a rotaciokor!"' | GFR <10 warning text must be EXACTLY this Hungarian text | BUGGY | Current `gfr.below10.warning` HU text: "GFR < 10: Legalabb 50%-os doziscsokkentes javasolt es lassu dozisemeles (titralás)!" This does NOT match. | Must change to EXACTLY: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! Legalabb 50%-os doziscsokkentes javasolt a rotaciokor!" |

---

## 2. Bug Report

### BUG-001: GFR <30 Warning Text Incorrect
- **Description:** The Hungarian GFR <30 warning text does not match the user's exact specification.
- **Root Cause:** In `translations.ts` line 84, the `patient.gfr.warning` HU value is: "GFR < 30 ml/perc: Magas opioid tuladagolas es metabolit-felhalmozodas kockazata. Sulyos mellekhatásokhoz (legzesdepresszio, szedacio, neurotoxicitas) vezethet."
- **Required Fix:** Change to: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! 25-50%-os doziscsokkentes javasolt a rotaciokor!"
- **Priority:** CRITICAL -- User explicitly specified exact text twice, indicating this matters to them clinically.

### BUG-002: GFR <10 Warning Text Incorrect
- **Description:** The Hungarian GFR <10 warning text does not match the user's exact specification.
- **Root Cause:** In `translations.ts` line 102, the `gfr.below10.warning` HU value is: "GFR < 10: Legalabb 50%-os doziscsokkentes javasolt es lassu dozisemeles (titralás)!"
- **Required Fix:** Change to: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! Legalabb 50%-os doziscsokkentes javasolt a rotaciokor!"
- **Priority:** CRITICAL -- Same as BUG-001.

### BUG-003: Fentanyl Brand Names Not Recognized
- **Description:** User reports fentanyl brand names are not recognized. When selecting a fentanyl brand, the route may not auto-populate correctly.
- **Root Cause:** Two issues identified:
  1. Duplicate "Fentanyl Sandoz" entries in `DRUG_OPTIONS` (line 73 for patch with form "tapasz", line 80 for injection with form "injectio"). The `<select>` `value` attribute uses `fentanyl|patch` and `fentanyl|sc/iv` which are unique, but the display might confuse users.
  2. The `DrugSelect` component sets `value={inp.drug}` (just the drug name, e.g., "fentanyl") as the select value, but brand options have compound values like `fentanyl|patch`. This means after selecting a brand, the select value is set to "fentanyl" (just the drug), which does NOT match any brand option's value. The select then shows the first option with value "fentanyl" (the generic one), not the brand that was selected. This creates the appearance that brand names "don't work."
  3. The `handleDrugSelect` function in `CurrentRegimen.tsx` calls `updateInput(index, { drug })` with just the drug name, then uses `setTimeout` to set the route. But `updateInput` resets route to "" when drug changes, so the setTimeout race condition may or may not work depending on React's batching behavior.
- **Required Fix:** Restructure the select value handling so brand selection reliably sets both drug AND route. Remove reliance on `setTimeout`. Ensure the select's controlled value properly reflects the current drug+route combination.
- **Priority:** HIGH -- User flagged this in two separate emails.

### BUG-004: No Dose Rounding to Available Tablet Sizes
- **Description:** Calculated doses produce non-practical numbers (e.g., 108.5mg) that cannot be administered with available tablet sizes.
- **Root Cause:** `divideDailyDose()` in `conversions.ts` simply divides TDD by frequency and rounds to 2 decimal places. No awareness of available tablet sizes.
- **Required Fix:** Implement tablet size database and smart rounding. For example, 108.5mg oxycodone q12h should produce morning 50mg (5x10mg) + evening 60mg (6x10mg).
- **Priority:** CRITICAL -- Directly affects clinical usability. A doctor cannot prescribe 54.25mg of a tablet.

### BUG-005: No Unequal Dose Splitting for Output
- **Description:** When TDD cannot be evenly divided into available tablet sizes, the system should suggest unequal morning/evening doses.
- **Root Cause:** `divideDailyDose()` always returns equal doses. No logic for asymmetrical output.
- **Required Fix:** Implement smart splitting: round down for one dose, round up for the other, both to nearest available tablet size, maintaining TDD as close to target as possible.
- **Priority:** CRITICAL -- User's explicit example: 108.5mg -> 50mg morning + 60mg evening.

### BUG-006: Breakthrough Pain Maximum Not Shown
- **Description:** User wants to see the maximum total daily breakthrough dose and a warning that if more is needed, base dose must increase.
- **Root Cause:** `ResultsDisplay.tsx` shows a single breakthrough dose (TDD/6) but not the maximum daily total or the escalation warning.
- **Required Fix:** Show: breakthrough single dose = TDD/6, maximum daily breakthrough total, and add text: "Ha ennnel tobb szukseges, az alapdozis emelendo!" / "If more is needed, the base dose needs increasing!"
- **Priority:** HIGH -- Clinical safety feature.

### BUG-007: OxyContin Minimum Dose Not Enforced
- **Description:** In Hungary, the minimum available OxyContin (oxycodone oral retard) dose is 10mg. The system does not enforce or warn about this.
- **Root Cause:** No minimum dose validation in the codebase. No tablet size data at all.
- **Required Fix:** Define minimum available doses per drug/formulation for the Hungarian market. Warn if calculated dose is below minimum. For OxyContin specifically, minimum = 10mg.
- **Priority:** HIGH -- Country-specific regulatory requirement.

---

## 3. Missing Features List

### FEAT-001: Tablet Size Database
- **Description:** A comprehensive database of available tablet/formulation sizes for each drug on the Hungarian market.
- **User's exact words:** "Az adagolasnal kerekitsen a gep, es aszerint adja ki (pl, ha 108,5mg oxycontin a napi adag, akkor reggel 50 este 60mg javasolt) [5 es 6 tabl/nap]"
- **Implementation complexity:** MEDIUM -- Requires data research and a rounding algorithm. Known Hungarian tablet sizes include:
  - **OxyContin (oxycodone retard):** 10mg, 20mg, 40mg, 80mg
  - **Codoxy Rapid (oxycodone IR):** 5mg, 10mg, 20mg
  - **Targin (oxycodone+naloxone):** 5/2.5mg, 10/5mg, 20/10mg, 40/20mg
  - **Morphine oral (e.g., M-Eslon):** 10mg, 30mg, 60mg, 100mg, 200mg
  - **Morphine IR (Sevredol):** 10mg, 20mg
  - **Tramadol:** 50mg, 100mg, 150mg, 200mg (retard); 50mg (IR capsule)
  - **Hydromorphone (Jurnista):** 4mg, 8mg, 16mg, 32mg, 64mg
  - **Dihydrocodeine (DHC Continus):** 60mg, 90mg, 120mg
  - **Fentanyl patches:** 12, 25, 50, 75, 100 mcg/hr
  - **Fentanyl oral (Effentora):** 100mcg, 200mcg, 400mcg, 600mcg, 800mcg
  - **Fentanyl oral (Abstral):** 100mcg, 200mcg, 300mcg, 400mcg, 600mcg, 800mcg
  - **Fentanyl oral (Actiq):** 200mcg, 400mcg, 600mcg, 800mcg, 1200mcg, 1600mcg
  - (These need to be verified against current Hungarian OGYEI/NEAK databases)

### FEAT-002: Smart Dose Rounding Algorithm
- **Description:** Round calculated doses to achievable combinations of available tablet sizes.
- **User's exact words:** "[5 es 6 tabl/nap]" -- user expects to see tablet counts
- **Implementation complexity:** MEDIUM -- Algorithm must find nearest achievable dose using available tablet sizes, with preference for simple combinations.

### FEAT-003: Practical Dosing Output (Tablet Counts)
- **Description:** Show output not just as "50mg" but as "50mg (5x10mg tabletta)" telling the clinician exactly how many tablets of what strength.
- **User's exact words:** "reggel 50 este 60mg javasolt [5 es 6 tabl/nap]"
- **Implementation complexity:** LOW once tablet size database exists.

### FEAT-004: Breakthrough Pain Maximum and Escalation Warning
- **Description:** Display maximum total daily breakthrough dose and "base dose needs increasing" warning.
- **User's exact words:** "Az attoreso fajdalomra adhato maximalis dozisra az adhato maximalis osszadagot irja ki, ha ennel tobb kell, akkor alap dozis emelendo!"
- **Implementation complexity:** LOW -- Simple calculation (TDD/6 per dose, max 6 doses/day = TDD total; if needing more = base dose escalation needed).

### FEAT-005: Missing Brand Names for Morphine
- **Description:** Morphine has no brand names in the dropdown. Hungarian market brands include:
  - **M-Eslon** (retard kapszula) -- oral
  - **Sevredol** (filmtabletta) -- oral IR
  - **Morphine HCl** injection
- **User's exact words:** "Ha van mas otleted orommel veszem!" (If you have other ideas, I'm happy to hear them)
- **Implementation complexity:** LOW

### FEAT-006: Missing Brand Names for Hydromorphone
- **Description:** Hydromorphone has no brand names. Hungarian market brands include:
  - **Jurnista** (retard tabletta) -- oral
  - **Palladone** (kapszula) -- oral (if available)
- **User's exact words:** Implied by R2.4 "active ingredient AND brand name"
- **Implementation complexity:** LOW

### FEAT-007: Missing Brand Names for Tramadol
- **Description:** Tramadol is the MOST prescribed opioid in Hungary (per the Semmelweis analysis) yet has NO brand names in the dropdown. Hungarian market brands include:
  - **Tramadol-ratiopharm** (retard tabletta)
  - **Tramadol Stada** (kapszula)
  - **Contramal** (kapszula, csepp, injekció)
  - **Tramundin Retard** (retard tabletta)
  - **Zaldiar** (tramadol + paracetamol -- if included)
  - **Doreta** (tramadol + paracetamol)
  - **Skudexum** (tramadol + dexketoprofen)
- **User's exact words:** Implied by R2.4
- **Implementation complexity:** LOW

### FEAT-008: Missing Brand Names for Dihydrocodeine
- **Description:** Dihydrocodeine has no brand names. Hungarian market:
  - **DHC Continus** (retard tabletta) -- oral
- **User's exact words:** Implied by R2.4
- **Implementation complexity:** LOW

### FEAT-009: Codeine as a Selectable Drug
- **Description:** Codeine is mentioned in GFR warnings ("Morfin es Kodein: Kerulendo") but is NOT in the drug list and cannot be selected. It should be a selectable source drug for conversion.
- **User's exact words:** "Morfin es Kodein: Kerulendo, mivel aktiv metabolitjaik felhalmozodnak"
- **Implementation complexity:** LOW -- Add to CONVERSION_TABLE with appropriate factor (codeine oral factor ~0.1, similar to tramadol: 100mg codeine ~ 10mg morphine, varying by source -- some say 0.15). Hungarian brands: **Codeine phosphate** tablets (30mg). Often in combination products (e.g., with paracetamol).
- **Clinical note:** Conversion factor for codeine varies. Scottish guidelines suggest codeine 60mg oral ~ morphine 6mg oral (factor ~0.1). Australian EPC workbook suggests similar. Use 0.1 as conservative factor.

### FEAT-010: Codeine Brand Names
- **Description:** If codeine is added as a drug, brand names for Hungary should include:
  - **Coderit** (if available)
  - **Codeine-containing combination products** (note: may need separate handling)
- **Implementation complexity:** LOW

---

## 4. What Worked Well (Preserve in Reimplementation)

The following features are correctly implemented and must be preserved:

### 4.1 Core OME Conversion Pipeline
- `calculateTdd()`, `drugDoseToOme()`, `omeToDrugDose()`, `sumOmes()`, `applyReduction()` -- all mathematically correct.
- The `computeTargetRegimen()` pipeline correctly chains: inputs -> TDD -> OME -> sum -> reduce -> target dose.
- **Evidence:** Conversion factors match the PRD table and Semmelweis protocol document (Section 6.2).

### 4.2 Fentanyl Patch Lookup Table
- `FENTANYL_PATCH_TABLE` with 5 standard sizes and OME ranges matches the PRD (Section 4.2) and Semmelweis protocol.
- `fentanylPatchToOme()` uses midpoint interpolation which is a reasonable clinical approach.
- `combinePatchSizes()` greedy algorithm produces valid combinations.

### 4.3 Asymmetrical Dosing Toggle
- The checkbox-based asymmetrical dosing with per-dose inputs works correctly.
- The 12-hour labels (Morning/Evening) have been fixed from the Email 2 bug.
- `getDoseLabelsForFrequency()` produces clinically appropriate labels.

### 4.4 BMI Selector with Warnings
- Three-option BMI selector (< 19, 19-26, > 26) with appropriate warning texts in Hungarian and English.
- Warning text content matches the user's clinical rationale.
- Position at top of form matches user's request.

### 4.5 Gender Selector with Premenopause Warning
- Female warning about premenopause dose fluctuation and oral administration recommendation.
- Text matches user's specification.

### 4.6 GFR Slider Locking Mechanism
- `getGfrSliderMin()` correctly returns 25 for GFR 10-30 and 50 for GFR<10.
- Slider `min` attribute dynamically adjusts.
- `useEffect` in `App.tsx` enforces minimum when GFR changes.

### 4.7 GFR Drug-Specific Warnings
- Three-tier warning system (avoid/caution/preferred) based on target drug.
- Translation keys with appropriate Hungarian text for each tier.
- Triggers correctly when GFR < 30.

### 4.8 Oxycodone+Naloxone Brand Handling
- `naloxoneCombo: true` flag on Targin/Oxynal/Oxynador brands correctly treats them as oxycodone for conversion purposes.
- Display shows "+ Naloxon" suffix.

### 4.9 Warning Drugs System
- Methadone, nalbuphine, pethidine produce warnings when selected.
- Clinically appropriate warning text about complex pharmacology.

### 4.10 Bilingual (HU/EN) Interface
- Complete translation system with context-based language switching.
- Hungarian as default language.
- All UI elements have both HU and EN translations.

### 4.11 Multi-Drug Input
- "Add Drug" and "Remove" buttons for multiple concurrent opioid inputs.
- All are summed to single OME baseline before target calculation.

### 4.12 Card-Based Layout
- Patient Parameters, Current Regimen, Target Regimen, Results as separate cards.
- Mobile-friendly structure.

---

## 5. What Was Wrong and Must Change

### 5.1 GFR Warning Texts (BUG-001, BUG-002)
- **Current:** "Magas opioid tuladagolas es metabolit-felhalmozodas kockazata. Sulyos mellekhatásokhoz (legzesdepresszio, szedacio, neurotoxicitas) vezethet."
- **Required for GFR<30:** "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! 25-50%-os doziscsokkentes javasolt a rotaciokor!"
- **Required for GFR<10:** "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! Legalabb 50%-os doziscsokkentes javasolt a rotaciokor!"
- **Key differences:** "Magas" -> "Nagy"; removed specific side effects list "(legzesdepresszio, szedacio, neurotoxicitas)"; added dose reduction recommendation "25-50%-os doziscsokkentes javasolt" / "Legalabb 50%-os doziscsokkentes javasolt."

### 5.2 Dose Output Format
- **Current:** Shows only raw mg values with equal divisions (e.g., "2x 54.25mg per dose").
- **Required:** Show rounded doses in available tablet sizes with tablet counts (e.g., "Reggel 50mg (5x10mg OxyContin), Este 60mg (6x10mg OxyContin)").
- **This is the single biggest gap** -- it renders the calculator clinically unusable for practical prescribing.

### 5.3 Breakthrough Pain Display
- **Current:** Shows single breakthrough dose (TDD/6) only.
- **Required:** Must also show maximum total daily breakthrough dose and the escalation warning.

### 5.4 Brand Name Select Value Handling
- **Current:** `DrugSelect` sets `value={inp.drug}` (e.g., "fentanyl") but brand options have compound values (e.g., "fentanyl|patch"). This means the select's controlled value never matches the brand option value, causing the UI to not reflect the selected brand.
- **Required:** After selecting a brand, the drug AND route should be set correctly and the select should visually reflect the brand choice. Consider storing the brand name as part of the input state, or using a different select architecture.

### 5.5 Missing Codeine in Drug List
- **Current:** Codeine appears in GFR warning logic (`GFR_DRUG_RISK` has "codeine: contraindicated") but cannot be selected as a source or target drug.
- **Required:** Add codeine as a selectable drug with appropriate conversion factor.

### 5.6 Results Display Divided Doses
- **Current:** `ResultsDisplay.tsx` line 84 shows `{result.dividedDoses.length}x {result.dividedDoses[0]} mg per dose` -- assumes all divided doses are equal.
- **Required:** Must handle unequal divided doses with labeled outputs (Reggel/Este/etc.) and tablet counts.

---

## 6. Clinical Accuracy Issues

### 6.1 Fentanyl SC/IV Conversion Factor
- **Current code:** `factorToOme: 100.0` (meaning 1mg fentanyl IV = 100mg oral morphine).
- **Semmelweis document (Section 6.2):** States "100mcg SC Fentanyl ~ 10-15mg Oral Morphine" which gives a factor of 0.10-0.15 per mcg, or 100-150 per mg. The code uses 100, which is the lower bound.
- **Scottish guidelines:** Similar range.
- **Assessment:** The factor of 100 is conservative and acceptable. However, the Semmelweis document notes "Multiply Fentanyl (mcg) by 0.15" which would give factor 150 per mg. There is a discrepancy.
- **Recommendation:** Use 100 as a conservative, safe estimate. Document the range. Consider adding a note that some protocols use up to 150.

### 6.2 Morphine SC/IV Conversion Factor
- **Current code:** `factorToOme: 3.0` (SC morphine is 3x more potent than oral).
- **Semmelweis document:** States "Multiply SC dose by 2-3" giving a range of 2-3x.
- **Assessment:** Using 3 is the upper bound. Scottish guidelines typically use 2 for SC and 3 for IV. Using a single "sc/iv" route with factor 3 may overestimate SC potency.
- **Recommendation:** Consider splitting SC and IV routes for morphine, or use 2.5 as a middle ground, or keep 3 as a conservative factor (which actually means LESS of the new drug, i.e., safer). Document.

### 6.3 Oxycodone SC/IV Conversion Factor
- **Current code:** `factorToOme: 3.0` for oxycodone SC/IV.
- **Semmelweis document:** States "Multiply SC dose by 3-4."
- **Assessment:** Using 3 is conservative/safe. Acceptable.

### 6.4 Fentanyl Oral/Mucosal Factor
- **Current code:** `factorToOme: 50.0` (1mg buccal fentanyl = 50mg oral morphine).
- **Notes in code:** "~50% bioavailability of IV. Primarily for breakthrough pain."
- **Clinical reality:** Transmucosal fentanyl dosing does NOT correlate linearly with oral morphine dose. Buccal fentanyl products like Effentora and Abstral are titrated individually regardless of baseline opioid dose. Using a linear conversion factor for these is clinically problematic.
- **Recommendation:** Add a prominent warning when converting TO or FROM oral/mucosal fentanyl that states: "Az attoreso fajdalomra hasznalt transzmukozalis fentanil adagolas egyeni titralas alapjan tortenik, nem linearis atszamitas alapjan. Az itt megadott adag csak tajekoztatasi celra szolgal."
- **Priority:** HIGH -- Potential patient safety issue.

### 6.5 Breakthrough Dose Calculation
- **Current code:** Breakthrough = TDD/6 (1/6th of total daily dose).
- **Semmelweis document (Section 6.1):** Step 5: "Calculate the new breakthrough dose (1/6th of the new Total Daily Dose)."
- **Assessment:** Correct per protocol. However, for fentanyl patches the breakthrough dose should be calculated differently -- typically as oral morphine equivalent, not as a fraction of the patch dose.
- **Current handling for patches:** `breakthroughDose = reducedOme / 6` -- this gives the breakthrough in mg OME which is correct.

### 6.6 Tramadol IV vs Oral Conversion
- **Current code:** Tramadol has routes "oral" and "iv", both with factor 0.1.
- **Clinical reality:** Tramadol IV has approximately the same bioavailability as oral (both ~70-100%). Using the same factor is acceptable.
- **Assessment:** Correct.

### 6.7 Missing Hydromorphone Parenteral Route
- **Current code:** Hydromorphone only has "oral" route.
- **Clinical reality:** Hydromorphone SC/IV is used and has a conversion factor of approximately 5-10x more potent than oral morphine (some sources say oral hydromorphone = 5x morphine, parenteral hydromorphone = 15-20x morphine).
- **Recommendation:** Consider adding hydromorphone SC/IV route if available in Hungary. Check if Dilaudid injection or similar is on the Hungarian market.

### 6.8 Codeine Conversion Factor
- **Not implemented.** If added, recommended factor: 0.1 (100mg codeine ~ 10mg oral morphine). Some sources use 0.15. The conservative 0.1 is safer for rotation purposes.

---

## 7. User Experience Issues

### 7.1 No Visual Feedback of TDD During Input
- **Issue:** The user enters doses and frequency but does not see the calculated TDD until they hit "Calculate." There is no real-time feedback showing "Your current total daily dose is X mg."
- **Impact:** Users cannot verify their input is correct before proceeding.
- **Recommendation:** Show a real-time TDD and OME summary below each drug entry card.

### 7.2 Select Dropdown UX on Mobile
- **Issue:** The `<select>` element with `<optgroup>` may have poor UX on mobile devices. Long brand names like "Oxikodon-HCL/Naloxon-HCL Neuraxpharm" may be truncated.
- **Impact:** Brand names are the primary way Hungarian clinicians think about drugs (not generic names). If they can't read the brand name, the feature is useless.
- **Recommendation:** Consider a searchable combobox or modal-based drug picker for mobile, with clear display of brand + generic + formulation.

### 7.3 No Confirmation or Summary Before Calculate
- **Issue:** No review step. User clicks Calculate and gets results. If they made an error, they must scroll back up.
- **Impact:** In clinical settings, speed matters, but so does accuracy.
- **Recommendation:** Show a brief summary of inputs above the Calculate button.

### 7.4 Warning Box Styling Inconsistency
- **Issue:** BMI and gender warnings use class `warning-orange`, GFR warnings use `warning-box` without the orange modifier. The PRD specifies "Red for GFR warnings, Orange for BMI/Gender."
- **Recommendation:** Ensure consistent color coding per PRD Section 5, point 3.

### 7.5 Results Card Lacks Practical Context
- **Issue:** Results show raw numbers (OME, TDD, divided doses) but no practical prescription-style output. A clinician needs something like: "Irjon fel: OxyContin 40mg ret. tbl. 1x1 reggel + OxyContin 40mg ret. tbl. 1x1 + OxyContin 20mg ret. tbl. 1x1 este."
- **Recommendation:** Add a "Prescription suggestion" section showing drug name, formulation, tablet strength, tablet count, and timing.

### 7.6 No Reset/Clear Button
- **Issue:** No way to clear the form and start a new calculation without refreshing the page.
- **Recommendation:** Add a "New Calculation" / "Uj szamitas" button.

### 7.7 Disclaimer Position and Emphasis
- **Issue:** Disclaimer is in the footer, easily missed. For a medical tool, the disclaimer should be more prominent.
- **Recommendation:** Consider showing the disclaimer on first load or as part of the results card.

### 7.8 No Print/Export Capability
- **Issue:** User mentioned deploying to a website ("nem engedheto ki a honlapra"). After getting results, clinicians may want to print or save. No print-friendly output exists.
- **Recommendation:** Add a "Print Results" button that generates a clean printable summary. Low priority for MVP but useful.

---

## 8. Acceptance Criteria for Reimplementation

Each acceptance criterion is a specific, testable condition that must pass.

### AC-001: Dose Rounding to Tablet Sizes
- **WHEN** user converts to oxycodone oral q12h and the calculated TDD is 108.5mg,
- **THEN** the output MUST show: "Reggel: 50mg (5x10mg), Este: 60mg (6x10mg)" (or similar achievable combination summing to ~110mg).
- **AND** the total displayed dose should note the rounding adjustment.

### AC-002: OxyContin Minimum Dose
- **WHEN** user converts to oxycodone oral and the calculated per-dose amount is below 10mg,
- **THEN** the system MUST show a warning: "Az OxyContin legkisebb elerheto adagja Magyarorszagon 10mg."
- **AND** suggest the minimum achievable dose of 10mg.

### AC-003: GFR <30 Warning Text (Hungarian)
- **WHEN** GFR value of 25 is entered,
- **THEN** the displayed Hungarian warning MUST read EXACTLY: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! 25-50%-os doziscsokkentes javasolt a rotaciokor!"
- (Using the exact Unicode characters from the user's email, including accented characters.)

### AC-004: GFR <10 Warning Text (Hungarian)
- **WHEN** GFR value of 8 is entered,
- **THEN** the displayed Hungarian warning MUST read EXACTLY: "Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! Legalabb 50%-os doziscsokkentes javasolt a rotaciokor!"
- **AND** the GFR<30 warning should also be displayed (since <10 is also <30).

### AC-005: GFR <30 + Morphine Target Warning
- **WHEN** GFR=25 is entered AND target drug is morphine,
- **THEN** the warning MUST include: "KERULENDO! A morfin/kodein aktiv metabolitjai felhalmozodnak..."
- **AND** MUST suggest fentanyl as safer alternative.

### AC-006: GFR <30 + Fentanyl Target
- **WHEN** GFR=25 is entered AND target drug is fentanyl,
- **THEN** the message MUST include: "ELONYOS VALASZTAS. A fentanil a legbiztonsagosabb szer veseelegtelensegben..."

### AC-007: GFR Slider Lock at 25% for GFR 10-30
- **WHEN** GFR value of 20 is entered,
- **THEN** the reduction slider MUST NOT allow values below 25%.
- **AND** the slider minimum should visually indicate 25%.

### AC-008: GFR Slider Lock at 50% for GFR <10
- **WHEN** GFR value of 5 is entered,
- **THEN** the reduction slider MUST NOT allow values below 50%.

### AC-009: 12-Hour Dosing Labels
- **WHEN** user selects q12h (12-hour) frequency and enables asymmetrical dosing,
- **THEN** the labels MUST read "Reggel" (Morning) and "Este" (Evening), NOT "Del" (Noon).

### AC-010: Fentanyl Patch Combination
- **WHEN** target drug is fentanyl transdermal and calculated target is 137 mcg/hr,
- **THEN** output MUST show a combination from available sizes (100+25+12 = 137 mcg/hr, or nearest achievable like 100+50 = 150 mcg/hr).
- **AND** each patch in the combination must be from {12, 25, 50, 75, 100} mcg/hr.

### AC-011: Fentanyl Brand Name Selection
- **WHEN** user selects "Durogesic" from the drug dropdown,
- **THEN** the drug MUST be set to "fentanyl" AND route MUST auto-populate to "patch" (transdermal).
- **AND** the UI must visually show "Durogesic" as the selected item.

### AC-012: Fentanyl Sandoz Disambiguation
- **WHEN** user opens the drug dropdown,
- **THEN** "Fentanyl Sandoz (tapasz)" and "Fentanyl Sandoz (injectio)" must appear as TWO DISTINCT options.
- **AND** selecting each must set the correct route (patch vs sc/iv respectively).

### AC-013: Multiple Drugs to Single Target
- **WHEN** user enters Tramadol 100mg q8h (TDD=300mg, OME=30mg) AND Oxycodone 20mg q12h (TDD=40mg, OME=60mg),
- **THEN** total OME MUST equal 90mg.
- **AND** converting to morphine oral with 25% reduction: reduced OME = 67.5mg, target morphine TDD = 67.5mg.

### AC-014: BMI <19 Warning
- **WHEN** user selects BMI < 19,
- **THEN** a warning box (orange-colored) MUST appear with text about lower tolerance and higher toxicity risk.

### AC-015: Female Gender Warning
- **WHEN** user selects "No" (Female),
- **THEN** a warning MUST appear about premenopause dose fluctuations and oral administration recommendation.

### AC-016: Reduction Slider Range
- **THEN** the slider MUST have range 0% to 70%, with step size of 5%.
- **AND** the current value MUST be displayed numerically.

### AC-017: No Ceiling Dose Validation
- **WHEN** user enters morphine 5000mg q24h,
- **THEN** the system MUST accept this input without error (no upper limit validation).

### AC-018: Breakthrough Pain Output
- **WHEN** target TDD is 60mg morphine oral,
- **THEN** breakthrough dose MUST show: "10mg" (TDD/6).
- **AND** maximum daily breakthrough total MUST be shown.
- **AND** warning text: "Ha ennnel tobb szukseges, az alapdozis emelendo!"

### AC-019: Practical Dosing with Tablet Count
- **WHEN** target is oxycodone oral, TDD = 30mg, frequency = q12h,
- **THEN** output MUST show: divided dose = 15mg per dose.
- **AND** practical output: "1x10mg + 1x5mg tabletta" or similar (pending tablet size data for available IR oxycodone).

### AC-020: Tramadol Brand Names Visible
- **WHEN** user opens drug dropdown,
- **THEN** under "Tramadol" heading, Hungarian brand names (Contramal, Tramadol-ratiopharm, etc.) MUST appear as selectable options.

### AC-021: Language Toggle
- **WHEN** user switches from HU to EN,
- **THEN** ALL text in the application MUST switch to English, including drug names, warnings, labels, and results.
- **AND** switching back to HU MUST restore all Hungarian text.

### AC-022: Methadone Warning
- **WHEN** user selects methadone as source or target drug,
- **THEN** a prominent warning MUST appear about complex pharmacokinetics and specialist consultation requirement.
- **AND** the system should NOT perform standard linear conversion (or if it does, the warning must be impossible to miss).

### AC-023: Patch to Oral Morphine Conversion
- **WHEN** user enters fentanyl patch 50 mcg/hr as source,
- **THEN** the OME MUST be calculated as midpoint of range: (120+150)/2 = 135 mg OME/day.
- **AND** converting to morphine oral with 0% reduction: target TDD = 135mg morphine.

### AC-024: Oral Morphine to Patch Conversion
- **WHEN** user enters morphine oral 120mg/day as source and target is fentanyl patch,
- **THEN** the system MUST convert to approximate patch size(s).
- **AND** output should show achievable patch combination (e.g., 50mcg/hr patch, based on lookup table where 50mcg = 120-150mg OME).

---

## 9. Edge Cases and Scenarios

### EC-001: Multiple Source Drugs to Single Target
- **Scenario:** Patient on tramadol 200mg q8h (TDD=600mg, OME=60mg) + fentanyl patch 25mcg/hr (OME=75mg midpoint) + morphine SC 10mg q4h (TDD=60mg, OME=180mg).
- **Total OME:** 60 + 75 + 180 = 315mg
- **Target:** Oxycodone oral, 25% reduction.
- **Expected:** Reduced OME = 236.25mg, target oxycodone TDD = 236.25 * 0.666 = 157.3mg.
- **Practical output:** With q12h: ~78.6mg per dose -> rounded to 80mg (2x40mg tablets) per dose = 160mg/day.

### EC-002: Fentanyl Patch to Oral Morphine
- **Scenario:** Patient on fentanyl 75mcg/hr patch.
- **OME:** (180+225)/2 = 202.5mg
- **Target:** Morphine oral, 30% reduction.
- **Expected:** 202.5 * 0.7 = 141.75mg morphine/day.
- **With q12h:** 70.875mg per dose -> round to 70mg (e.g., 1x60mg + 1x10mg M-Eslon) morning and evening, or 60mg morning + 80mg evening.

### EC-003: Oral Morphine to Fentanyl Patch
- **Scenario:** Patient on morphine oral 360mg/day.
- **OME:** 360mg.
- **Target:** Fentanyl patch, 25% reduction.
- **Expected:** Reduced OME = 270mg. Patch table: 100mcg = 240-300mg OME (midpoint 270). So target = 100mcg/hr patch.
- **Output:** "1x 100 mcg/ora tapasz"

### EC-004: Very High Doses (No Ceiling)
- **Scenario:** Morphine oral 2000mg/day.
- **Target:** Fentanyl patch, 25% reduction.
- **Reduced OME:** 1500mg. Above the 100mcg patch range. Extrapolation needed.
- **Expected:** Multiple patches. The algorithm must handle doses above the lookup table range using extrapolation.

### EC-005: Very Low Doses (Below Minimum Tablet)
- **Scenario:** Tramadol 50mg q8h (TDD=150mg, OME=15mg) -> convert to oxycodone oral with 50% reduction.
- **Reduced OME:** 7.5mg. Target oxycodone TDD = 7.5 * 0.666 = 5mg.
- **Issue:** OxyContin minimum is 10mg. With q12h that would be 2.5mg per dose, well below the minimum 10mg tablet.
- **Expected:** Warning about minimum dose. Suggest 10mg q24h as the lowest practical regimen.

### EC-006: GFR < 10 with Morphine as Target
- **Scenario:** GFR = 5, target drug = morphine.
- **Expected warnings:** (1) GFR<30 general warning with exact Hungarian text, (2) GFR<10 warning with exact text, (3) Drug-specific "KERULENDO" warning for morphine, (4) Fentanyl suggested as safer alternative.
- **Expected slider:** Minimum 50% reduction enforced.

### EC-007: Asymmetrical Dosing with Multiple Drugs
- **Scenario:** Drug 1: Morphine oral, q12h, asymmetrical: morning 30mg, evening 40mg (TDD=70mg, OME=70mg). Drug 2: Tramadol oral, q8h, symmetrical: 100mg each (TDD=300mg, OME=30mg).
- **Total OME:** 100mg.
- **Target:** Oxycodone oral, 0% reduction, q12h.
- **Expected:** Target TDD = 100 * 0.666 = 66.6mg -> 33.3mg per dose -> round to 30mg morning + 40mg evening (or 30mg + 30mg + remainder as extra).

### EC-008: Brand Name Selection Auto-Populating Route
- **Scenario:** User selects "Effentora (buccalis)" from dropdown.
- **Expected:** Drug = fentanyl, route auto-set to "oral/mucosal". User should NOT have to manually select route.
- **Scenario:** User selects "Durogesic" from dropdown.
- **Expected:** Drug = fentanyl, route auto-set to "patch". Frequency auto-set to q72h.

### EC-009: Oxycodone+Naloxone Conversion
- **Scenario:** User selects "Targin (retard tabletta)", enters 20mg q12h.
- **Expected:** Converts as oxycodone oral. TDD = 40mg. OME = 40 * 1.5 = 60mg.
- **Note:** The naloxone component does NOT affect the OME calculation (it's for gut motility, not analgesia).

### EC-010: Switching Between Same Drug Different Routes
- **Scenario:** Morphine SC 30mg q8h (TDD=90mg, OME=270mg) -> target morphine oral.
- **Expected:** Target = 270 * 1.0 = 270mg oral morphine/day (before reduction).
- **This tests correct handling of TO and FROM factors for the same drug.**

### EC-011: Zero Dose or Empty Inputs
- **Scenario:** User adds a drug entry but leaves dose as 0 or empty.
- **Expected:** System should skip this entry in calculation. Should NOT crash or produce NaN.

### EC-012: Fentanyl Patch as Both Source and Target
- **Scenario:** Patient on fentanyl 50mcg/hr patch, switching to fentanyl 25mcg/hr patch (dose reduction).
- **Expected:** OME = 135mg (midpoint of 50mcg range). With 25% reduction -> 101.25mg. Back to patches -> ~40mcg/hr -> suggest 25+12 = 37mcg/hr or 50mcg/hr single patch.

### EC-013: All Frequency Options
- **Scenario:** Morphine oral 60mg at each of the following frequencies:
  - q24h (1x/day): TDD = 60mg
  - q12h (2x/day): TDD = 120mg
  - q8h (3x/day): TDD = 180mg
  - q6h (4x/day): TDD = 240mg
  - q4h (6x/day): TDD = 360mg
- **Each must calculate correctly.**

### EC-014: Dose Rounding for Non-Standard TDD
- **Scenario:** Target oxycodone oral TDD = 73mg, q12h.
- **Available OxyContin tablets:** 10, 20, 40, 80mg.
- **Expected:** 73/2 = 36.5mg per dose. Round down to 30mg (1x20 + 1x10) morning, round up to 40mg (1x40) evening. Total = 70mg. OR: 40mg morning + 40mg evening = 80mg.
- **The algorithm should find the combination closest to the target TDD using available tablets, preferring to stay close to or slightly below the calculated dose (safety).**

### EC-015: Tramadol Maximum Dose Consideration
- **Scenario:** Converting to tramadol oral, calculated TDD = 600mg.
- **Clinical note:** Tramadol max recommended dose is 400mg/day (ceiling effect, seizure risk).
- **Expected:** Warning that calculated dose exceeds recommended maximum of 400mg/day for tramadol.
- **Note:** This is an enhancement not explicitly requested, but clinically important. Consider implementing.

---

## 10. Priority Ordering

### Tier 1: CRITICAL (Must be done before any release)

| # | Item | Type | Rationale |
|---|------|------|-----------|
| 1 | BUG-004/005: Dose rounding to tablet sizes + unequal splitting + tablet counts | Feature + Bug | User's most emphasized pain point. Renders the calculator practically unusable without it. |
| 2 | BUG-001/002: GFR warning text corrections | Bug | User explicitly provided exact text twice. Clinical accuracy. Trivial to fix. |
| 3 | BUG-003: Fentanyl brand name recognition | Bug | Reported in 2 of 3 emails. Trust issue. |
| 4 | FEAT-001: Tablet size database for Hungarian market | Feature | Required for dose rounding. Foundation feature. |
| 5 | BUG-007: OxyContin 10mg minimum dose enforcement | Bug | Country-specific clinical constraint. |
| 6 | BUG-006: Breakthrough pain maximum + escalation warning | Bug | Clinical safety feature. |

### Tier 2: HIGH (Should be done before release)

| # | Item | Type | Rationale |
|---|------|------|-----------|
| 7 | FEAT-007: Tramadol brand names | Feature | Most prescribed opioid in Hungary. Glaring omission. |
| 8 | FEAT-005: Morphine brand names | Feature | Second most important opioid for rotation. |
| 9 | FEAT-006: Hydromorphone brand names | Feature | Completeness of brand name feature. |
| 10 | FEAT-008: Dihydrocodeine brand names | Feature | Completeness. |
| 11 | FEAT-009/010: Add codeine as selectable drug with brands | Feature | Referenced in GFR warnings but not selectable. Logical inconsistency. |
| 12 | 5.4: Fix DrugSelect value handling | Bug | Brand selection UX is broken. |
| 13 | 7.1: Real-time TDD/OME feedback during input | UX | Helps clinicians verify inputs. |

### Tier 3: MEDIUM (Should be done but not blocking)

| # | Item | Type | Rationale |
|---|------|------|-----------|
| 14 | 6.4: Transmucosal fentanyl titration warning | Clinical | Patient safety for a tricky conversion. |
| 15 | 6.7: Hydromorphone parenteral route | Clinical | If available in Hungary. |
| 16 | 7.4: Warning color coding consistency (orange vs red) | UX | PRD specified this. |
| 17 | 7.5: Prescription-style output format | UX | Major clinical usability improvement. |
| 18 | 7.6: Reset/Clear button | UX | Convenience. |
| 19 | EC-015: Tramadol maximum dose warning | Clinical | Safety enhancement. |

### Tier 4: LOW (Nice to have)

| # | Item | Type | Rationale |
|---|------|------|-----------|
| 20 | 7.2: Searchable combobox for drug selection | UX | Mobile UX improvement. |
| 21 | 7.3: Input summary before calculate | UX | Error prevention. |
| 22 | 7.7: More prominent disclaimer | UX | Legal protection. |
| 23 | 7.8: Print/export capability | UX | Useful but out of scope for MVP. |
| 24 | 6.1/6.2/6.3: Conversion factor range documentation | Clinical | Transparency about factor choices. |

---

## Appendix A: Exact Hungarian Warning Texts Required

The following texts must appear EXACTLY as written (preserving accented characters):

### GFR < 30 General Warning:
```
Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! 25-50%-os doziscsokkentes javasolt a rotaciokor!
```

### GFR < 10 General Warning:
```
Nagy az opioid tuladagolas es metabolit-felhalmozodas kockazata, ami sulyos mellekhatásokhoz vezethet! Legalabb 50%-os doziscsokkentes javasolt a rotaciokor!
```

### GFR < 30 Drug-Specific -- Morphine/Codeine:
```
KERULENDO! A morfin/kodein aktiv metabolitjai felhalmozodnak (neurotoxicitas/szedacio). Fontolja meg a fentanil alkalmazasat -- nincs aktiv metabolitja, biztonsagosabb veseeelegtelensegben.
```

### GFR < 30 Drug-Specific -- Oxycodone/Hydromorphone:
```
OVATOSAN! Csokkentett dozisban es ritkitott gyakorisaggal alkalmazando. Szoros monitorizalas szukseges.
```

### GFR < 30 Drug-Specific -- Fentanyl:
```
ELONYOS VALASZTAS. A fentanil a legbiztonsagosabb szer veseeelegtelensegben (nincs aktiv metabolitja).
```

### BMI < 19 Warning:
```
Figyelem: Kisebb lehet a tolerancia es magasabb a toxicitasi kockazat. Alacsony BMI eseten a lipofil opioidok (fentanil, metadon) nem tudnak nagy mennyisegben felhalmozodni a zsirszövetben, igy magasabb plazmakoncentracio alakulhat ki. Fokozott legzesdepresszio kockazata.
```

### BMI > 26 Warning:
```
A teljes testsúlyra torteno adagolas könnyen tuladagolashoz vezethet! Javasoljuk, hogy az idealis testtomeg (IBW) alapjan hatarozza meg a doziscsokkenteset. A zsirszövetben felhalmozodott szer lassabban szabadul fel (depohatás), ami kesleltett eliminaciot es fokozott legzesdepresszio-kockazatot okoz.
```

### Female Gender Warning:
```
A kiszamolt dozis valtoztathato lehet akar naponta is, ha premenopausaban van a beteg! Az osztrogen/progeszteron ingadozasok befolyasoljak az endogen opioid rendszert es a mu-receptor elerhetoseget. Oralis gyogyszer adagolas ajanlott a rugalmassag erdekeben.
```

### Breakthrough Escalation Warning:
```
Ha ennel tobb szukseges, az alapdozis emelendo!
```

**Note:** The above texts should be cross-checked against the user's original emails character-by-character. The user's emails contain proper Hungarian diacritical marks (a, e, i, o, u, o, u, o, u) that must be preserved exactly.

---

## Appendix B: Proposed Tablet Size Database Structure

```typescript
interface TabletSize {
  drugKey: string;       // e.g., "oxycodone"
  route: string;         // e.g., "oral"
  brandName?: string;    // e.g., "OxyContin"
  formulation: string;   // e.g., "retard filmtabletta"
  strengths: number[];   // e.g., [10, 20, 40, 80] in mg
  unit: string;          // e.g., "mg"
  isRetard: boolean;     // extended release?
  minimumDose?: number;  // minimum single dose in Hungary
}
```

Example data:
```typescript
const TABLET_SIZES: TabletSize[] = [
  {
    drugKey: "oxycodone",
    route: "oral",
    brandName: "OxyContin",
    formulation: "retard filmtabletta",
    strengths: [10, 20, 40, 80],
    unit: "mg",
    isRetard: true,
    minimumDose: 10,
  },
  {
    drugKey: "morphine",
    route: "oral",
    brandName: "M-Eslon",
    formulation: "retard kapszula",
    strengths: [10, 30, 60, 100, 200],
    unit: "mg",
    isRetard: true,
    minimumDose: 10,
  },
  // ... etc
];
```

---

## Appendix C: Smart Dose Rounding Algorithm (Proposed)

```
Input: targetTDD (mg), frequency (int), availableStrengths (number[])
Output: doses (array of {label, mg, tablets[]})

1. Calculate rawPerDose = targetTDD / frequency
2. Find nearest achievable dose from availableStrengths combinations:
   a. Sort strengths descending
   b. For each dose slot, use greedy algorithm to find tablet combination
   c. Round to nearest achievable: preferably round DOWN for safety
3. If frequency = 2 (q12h) and TDD doesn't divide evenly:
   a. Morning dose = floor(TDD/2) rounded down to nearest achievable
   b. Evening dose = TDD - morning dose, rounded to nearest achievable
   c. OR: both rounded such that total is closest to original TDD
4. For each dose, produce tablet breakdown: "2x40mg + 1x10mg"
5. If any dose < minimum available dose, warn user
6. Return structured output with labels (Reggel/Este/etc.), mg, and tablet breakdown
```

---

## Appendix D: Files Requiring Changes

| File | Changes Required |
|------|-----------------|
| `frontend/src/lib/conversions.ts` | Add codeine to CONVERSION_TABLE; add tablet size database; implement smart rounding; add all brand names for all drugs; fix breakthrough calculation |
| `frontend/src/lib/types.ts` | Add TabletSize type; extend TargetResult with tabletBreakdown; add breakthroughMax field |
| `frontend/src/i18n/translations.ts` | Fix GFR warning texts (BUG-001, BUG-002); add breakthrough escalation warning; add minimum dose warning; add new drug translations |
| `frontend/src/components/CurrentRegimen.tsx` | Fix DrugSelect value handling for brands; add real-time TDD display |
| `frontend/src/components/TargetRegimen.tsx` | Fix DrugSelect for target brands; ensure GFR warning uses correct text |
| `frontend/src/components/ResultsDisplay.tsx` | Implement practical dosing output with tablet counts; implement unequal dose display; add breakthrough maximum; add escalation warning |
| `frontend/src/App.css` (or equivalent) | Fix warning color coding (red vs orange) |

---

**END OF GAP ANALYSIS**

This document must be treated as the definitive specification for the reimplementation. Every item marked CRITICAL or HIGH must be addressed before release. The deadline is February 21, 2026, 12:00 (Monday).
