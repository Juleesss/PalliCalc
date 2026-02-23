# PalliCalc v2.0 — Clinical Verification Guide

**Purpose:** This document contains every conversion factor, lookup table, warning rule, and rounding algorithm used by PalliCalc. A clinician can use this to quickly verify that the calculator's logic matches accepted clinical practice.

**Last updated:** 2026-02-16

---

## Table of Contents

1. [OME Conversion Factors](#1-ome-conversion-factors)
2. [Fentanyl Patch Lookup Table](#2-fentanyl-patch-lookup-table)
3. [Methadone — Ripamonti Non-Linear Conversion](#3-methadone--ripamonti-non-linear-conversion)
4. [Drug Database — Available Formulations in Hungary](#4-drug-database--available-formulations-in-hungary)
5. [Dose Rounding Algorithm](#5-dose-rounding-algorithm)
6. [Breakthrough Dose Calculation](#6-breakthrough-dose-calculation)
7. [GFR-Based Safety Logic](#7-gfr-based-safety-logic)
8. [BMI and Gender Warnings](#8-bmi-and-gender-warnings)
9. [Drug-Specific Warnings](#9-drug-specific-warnings)
10. [Blocked Drugs](#10-blocked-drugs)
11. [Complete Calculation Pipeline](#11-complete-calculation-pipeline)
12. [Worked Examples](#12-worked-examples)

---

## 1. OME Conversion Factors

All conversions use **Oral Morphine Equivalent (OME)** as the intermediate unit.

| Drug | Route | Factor TO OME | Factor FROM OME | Unit |
|------|-------|:---:|:---:|:---:|
| **Morphine** | Oral | 1.0 | 1.0 | mg |
| **Morphine** | SC/IV | 3.0 | 0.333 | mg |
| **Oxycodone** | Oral | 1.5 | 0.667 | mg |
| **Oxycodone** | SC/IV | 3.0 | 0.333 | mg |
| **Oxycodone + Naloxone** | Oral | 1.5 | 0.667 | mg |
| **Hydromorphone** | Oral | 5.0 | 0.2 | mg |
| **Hydromorphone** | SC/IV | 15.0 | 0.067 | mg |
| **Tramadol** | Oral | 0.1 | 10.0 | mg |
| **Tramadol** | IV | 0.1 | 10.0 | mg |
| **Codeine** | Oral | 0.1 | 10.0 | mg |
| **Dihydrocodeine** | Oral | 0.1 | 10.0 | mg |
| **Fentanyl** | SC/IV | 100.0 | 0.01 | mg |
| **Fentanyl** | Oral/Mucosal | 50.0 | 0.02 | mg |
| **Fentanyl** | Patch | *Lookup table (see §2)* | *Lookup table* | mcg/hr |
| **Pethidine** | Oral | 0.1 | 10.0 | mg |
| **Pethidine** | SC/IV | 0.3 | 3.333 | mg |

**How to read:** A `factorToOme` of 1.5 for oral oxycodone means: `oxycodone dose × 1.5 = OME`. Conversely, `OME × 0.667 = oxycodone dose`.

**Notes:**
- Oxycodone + Naloxone uses the same factor as oxycodone (naloxone acts locally in the gut, does not affect systemic opioid potency)
- Fentanyl patch uses a non-linear lookup table, not a simple factor
- Pethidine conversions are approximate and flagged as unreliable

---

## 2. Fentanyl Patch Lookup Table

Fentanyl transdermal patches are **not** converted linearly. The calculator uses this lookup table with midpoint interpolation:

| Patch Strength (mcg/hr) | OME Range (mg/day) | Midpoint OME (mg/day) |
|:---:|:---:|:---:|
| 12 | 30 – 45 | 37.5 |
| 25 | 60 – 90 | 75.0 |
| 50 | 120 – 150 | 135.0 |
| 75 | 180 – 225 | 202.5 |
| 100 | 240 – 300 | 270.0 |

### Patch → OME (Source conversion)
When a patient is ON a fentanyl patch, the **midpoint** OME value is used. For values between standard patch sizes, linear interpolation is applied between the two nearest midpoints.

### OME → Patch (Target conversion)
When converting TO a fentanyl patch:
1. The OME value is interpolated between midpoints to find the ideal mcg/hr
2. Available patch sizes are combined using a greedy algorithm (largest first)
3. If the remainder is ≥ 6 mcg/hr (half of smallest 12 mcg/hr patch), an additional 12 mcg/hr patch is added

### Available Patch Sizes in Hungary
12, 25, 50, 75, 100 mcg/hr

**Note:** The 12 mcg/hr patch is only available as **Matrifen** in Hungary.

---

## 3. Methadone — Ripamonti Non-Linear Conversion

Methadone conversion uses the **Ripamonti method** with non-linear, tiered ratios. The morphine:methadone ratio **increases** at higher OME levels.

| OME Range (mg/day) | Morphine:Methadone Ratio | Methadone Dose |
|:---:|:---:|:---:|
| 30 – 90 | 4:1 | OME ÷ 4 |
| 91 – 300 | 6:1 | OME ÷ 6 |
| > 300 | 8:1 | OME ÷ 8 |

**Example:** OME of 200 mg/day → Tier 2 (91–300) → 200 ÷ 6 = 33.3 mg methadone/day

**Critical warning:** Methadone has a long and variable half-life (15–60 hours), non-linear pharmacokinetics, and QTc prolongation risk. The calculator always displays:
> *"The calculated dose is for reference only — titration should be performed by a specialist with ECG (QTc) monitoring, allowing 5-7 days for steady state."*

---

## 4. Drug Database — Available Formulations in Hungary

### Morphine (Morfin)
| Brand Name | Form | Route |
|---|---|---|
| MST Continus | Retard filmtabletta | Oral |
| Sevredol | Filmtabletta (IR) | Oral |
| Morphine Kalceks | Oldatos injekció | SC/IV |
| Morphinum Hydrochloricum TEVA | Oldatos injekció | SC/IV |

**Retard tablet sizes:** 10, 30, 60, 100 mg
**IR tablet sizes:** 10 mg (Sevredol)
**Minimum dose:** 10 mg (oral)

---

### Oxycodone (Oxikodon)
| Brand Name | Form | Route |
|---|---|---|
| OxyContin | Retard filmtabletta | Oral |
| Codoxy | Retard tabletta | Oral |
| Codoxy Rapid | Filmtabletta (IR) | Oral |
| Reltebon | Retard tabletta | Oral |
| Oxycodone Sandoz | Kemény kapszula (IR) | Oral |
| Oxycodone Vitabalans | Filmtabletta (IR) | Oral |

**Retard tablet sizes:** 5, 10, 20, 40, 80 mg
**IR tablet sizes:** 5, 10, 20 mg
**Minimum dose:** 10 mg (oral) — OxyContin minimum in Hungary

---

### Oxycodone + Naloxone (Oxikodon + Naloxon)
| Brand Name | Form | Route |
|---|---|---|
| Targin | Retard tabletta | Oral |
| Oxynal | Retard tabletta | Oral |
| Oxynador | Retard tabletta | Oral |
| Oxikodon-HCL/Naloxon-HCL Neuraxpharm | Retard tabletta | Oral |

**Retard tablet sizes (oxycodone component):** 5, 10, 20, 40 mg
**IR for breakthrough:** Uses oxycodone IR tablets (5, 10, 20 mg)
**Minimum dose:** 5 mg (oral)

---

### Fentanyl (Fentanil)
| Brand Name | Form | Route |
|---|---|---|
| Durogesic | Transzdermális tapasz | Patch |
| Dolforin | Transzdermális tapasz | Patch |
| Matrifen | Transzdermális mátrix tapasz | Patch |
| Fentanyl Sandoz (tapasz) | Transzdermális mátrix tapasz | Patch |
| Fentanyl-ratiopharm | Transzdermális tapasz | Patch |
| Effentora | Buccális tabletta | Oral/Mucosal |
| Abstral | Szublinguális tabletta | Oral/Mucosal |
| Actiq | Szopogató tabletta | Oral/Mucosal |
| Fentanyl Kalceks | Oldatos injekció | SC/IV |
| Fentanyl-Richter | Oldatos injekció | SC/IV |
| Fentanyl Sandoz (injectio) | Oldatos injekció | SC/IV |

**Patch sizes:** 12, 25, 50, 75, 100 mcg/hr

**Important:** Fentanyl Sandoz exists as BOTH a patch ("tapasz") and an injection ("injectio") — the calculator disambiguates these.

---

### Hydromorphone (Hidromorfon)
| Brand Name | Form | Route |
|---|---|---|
| Jurnista | Retard tabletta (OROS) | Oral |
| Palladone | Kapszula | Oral |

**Retard tablet sizes:** 4, 8, 16, 32 mg (Jurnista, q24h)
**IR tablet sizes:** 1.3, 2.6 mg (Palladone, limited availability)
**Minimum dose:** 4 mg (oral)

---

### Tramadol
| Brand Name | Form | Route |
|---|---|---|
| Contramal | Kemény kapszula / retard | Oral |
| Contramal injekció | Oldatos injekció | IV |
| Adamon | Retard kapszula | Oral |
| Ralgen | Kemény kapszula | Oral |
| Ralgen SR | Retard tabletta | Oral |
| Tramadol AL | Kemény kapszula | Oral |
| Tramadol Kalceks | Oldatos injekció | IV |
| Tramadol Vitabalans | Tabletta | Oral |
| Tramadol Zentiva | Kemény kapszula | Oral |
| Tramadolor | Kemény kapszula / retard | Oral |

**Retard tablet sizes:** 100, 150, 200 mg
**IR tablet sizes:** 50 mg
**Maximum daily dose:** 400 mg/day

---

### Dihydrocodeine (Dihidrokodein)
| Brand Name | Form | Route |
|---|---|---|
| DHC Continus | Retard tabletta | Oral |

**Retard tablet sizes:** 60 mg (only size confirmed in Hungary)

---

### Codeine (Kodein)
No specific branded formulations listed.
**Tablet sizes:** 15, 30, 60 mg
**IR tablet sizes:** 15, 30 mg

---

### Methadone (Metadon) — WARNING DRUG
| Brand Name | Form | Route |
|---|---|---|
| Metadon EP | Tabletta | Oral |
| Methasan | Koncentrátum belsőleges oldathoz | Oral |

**Tablet sizes:** 5, 10, 20, 40 mg

---

### Nalbuphine (Nalbufin) — WARNING DRUG
| Brand Name | Form | Route |
|---|---|---|
| Nalpain | Oldatos injekció | SC/IV |

**Blocked as target** — cannot be used as conversion target.

---

### Pethidine (Petidin) — WARNING DRUG
| Brand Name | Form | Route |
|---|---|---|
| Pethidine | Injekció | SC/IV |

**Blocked as target** — cannot be used as conversion target.

---

## 5. Dose Rounding Algorithm

When converting to an oral target drug, the calculator rounds the calculated dose to combinations of available tablet sizes.

### Algorithm Steps

1. **Calculate ideal per-dose:** TDD ÷ number of daily doses
2. **Try symmetric rounding (all doses equal):**
   - Round DOWN to nearest tablet combination (greedy: largest tablet first)
   - Round UP by adding smallest available tablet
   - If rounding-down error ≤ 10%: use symmetric round-down
   - If rounding-up error ≤ 10% AND total increase ≤ 15%: use symmetric round-up
3. **If symmetric fails, use asymmetric split:**
   - Some doses get the rounded-up amount, others get rounded-down
   - Higher doses placed in the morning by convention
   - Exception for q12h: lower dose in morning, higher in evening (safer approach)
4. **Overall safety cap:** Total daily dose after rounding may not exceed the calculated TDD by more than 15%

### Tablet Combination Logic (Greedy Algorithm)
For a target of e.g. 70 mg with available sizes [10, 30, 60, 100]:
- 60 mg × 1 = 60, remainder 10
- 10 mg × 1 = 10, remainder 0
- **Result:** 1× 60mg + 1× 10mg = 70 mg

### Dose Labels
| Frequency | Hungarian Labels | English Labels |
|---|---|---|
| q24h (1×/day) | Reggel | Morning |
| q12h (2×/day) | Reggel, Este | Morning, Evening |
| q8h (3×/day) | Reggel, Délután, Éjjel | Morning, Afternoon, Night |
| q6h (4×/day) | Reggel, Dél, Délután, Este | Morning, Noon, Afternoon, Evening |
| q4h (6×/day) | 06:00, 10:00, 14:00, 18:00, 22:00, 02:00 | Same |

---

## 6. Breakthrough Dose Calculation

**Formula: Breakthrough single dose = TDD ÷ 6**

Maximum daily breakthrough administrations: 6 (i.e., max daily breakthrough = TDD)

### By Target Drug Type

| Target Type | Breakthrough Formula | Rounded To |
|---|---|---|
| **Oral drugs** | actualTDD ÷ 6 | IR tablet sizes of same drug |
| **Fentanyl patch** | reducedOME ÷ 6 | Oral morphine IR tablets (10 mg) |
| **Injectable** | actualTDD ÷ 6 | Exact (no rounding) |
| **Methadone** | Not calculated | (specialist-managed) |

### IR Tablet Sizes for Breakthrough Rounding

| Drug | IR Sizes (mg) |
|---|---|
| Morphine | 10 |
| Oxycodone | 5, 10, 20 |
| Oxycodone + Naloxone | Uses oxycodone IR: 5, 10, 20 |
| Hydromorphone | 1.3, 2.6 |
| Tramadol | 50 |
| Codeine | 15, 30 |

**Escalation warning:** Always displayed: *"If more is needed, the base dose should be increased!"*

---

## 7. GFR-Based Safety Logic

### 7.1 General GFR Warnings

| GFR Range | Warning |
|---|---|
| **≥ 30** | No warning |
| **10 – 29** | "High risk of opioid overdose and metabolite accumulation — 25-50% dose reduction recommended!" |
| **< 10** | Both the above warning PLUS: "At least 50% dose reduction recommended during rotation!" |

**Important:** GFR < 10 shows BOTH warnings (stacked), not just the more severe one.

### 7.2 Mandatory Minimum Dose Reduction (Slider Lock)

| GFR Range | Minimum Reduction % |
|:---:|:---:|
| ≥ 30 (or unset) | 0% |
| 10 – 29 | 25% |
| < 10 | 50% |

The calculator enforces this minimum — the user cannot set a lower reduction when GFR is entered.

### 7.3 GFR Drug Risk Matrix

| Drug | Risk at GFR < 30 | Rationale |
|---|:---:|---|
| **Morphine** | AVOID | Active metabolite (M6G) accumulates → neurotoxicity, sedation |
| **Codeine** | AVOID | Active metabolites accumulate |
| **Dihydrocodeine** | AVOID | Active metabolites accumulate |
| **Pethidine** | CONTRAINDICATED | Norpethidine accumulation → seizures |
| **Oxycodone** | CAUTION | Reduce dose, monitor closely |
| **Hydromorphone** | CAUTION | Reduce dose, monitor closely |
| **Tramadol** | CAUTION | Reduce dose, monitor closely |
| **Oxycodone + Naloxone** | CAUTION | Same as oxycodone |
| **Fentanyl** | PREFERRED | No active metabolites — drug of choice in renal impairment |
| **Methadone** | PREFERRED | Safe for renal patients, but specialist-only caveats |

---

## 8. BMI and Gender Warnings

### BMI Categories and Warnings

| BMI | Category | Warning |
|:---:|---|---|
| < 19 | Low | Lipophilic opioids cannot accumulate in fat → higher plasma concentrations → increased respiratory depression risk. Consider lower doses. |
| 19 – 26 | Normal | No warning |
| > 26 | High | Dosing by total body weight risks overdose. Use Ideal Body Weight (IBW). Depot effect from fat accumulation → delayed elimination. |

### Gender Warning

| Gender | Warning |
|---|---|
| Male | No warning |
| Female | Dose may fluctuate daily in premenopausal patients. Estrogen/progesterone affect endogenous opioid system and mu-receptor availability. Oral route recommended for dosing flexibility. |

---

## 9. Drug-Specific Warnings

### Always-Shown Warnings

| Drug | Context | Warning |
|---|---|---|
| **Methadone** | Any use | Non-linear pharmacokinetics. Dose is reference only. Specialist titration with ECG (QTc) monitoring required. Allow 5-7 days for steady state. |
| **Oxycodone + Naloxone** | Any use | Contraindicated in moderate-to-severe hepatic impairment. Use pure oxycodone or another opioid instead. |

### Source-Only Warnings (When Drug Is Current Regimen)

| Drug | Warning |
|---|---|
| **Nalbuphine** | Partial agonist/antagonist. Switching from pure mu-agonist may precipitate withdrawal. |
| **Pethidine** | Produces neurotoxic metabolite (norpethidine). Long-term use not recommended. |

### Target-Only Warnings (When Drug Is Conversion Target)

| Drug | Warning |
|---|---|
| **Nalbuphine** | BLOCKED. Cannot be used as target — precipitated withdrawal risk. |
| **Pethidine** | BLOCKED. Norpethidine accumulation, especially in renal impairment. |
| **Fentanyl (mucosal)** | Individual titration required — cannot linearly convert from other opioids. |
| **Fentanyl (patch)** | Takes 12-24 hours to reach therapeutic levels. Continue previous opioid for 12 hours after application. |

### Dose Threshold Warnings

| Drug | Condition | Warning |
|---|---|---|
| **Tramadol** | Calculated TDD > 400 mg | Maximum daily dose exceeded. |
| **Oxycodone** | Single dose < 10 mg | OxyContin minimum in Hungary is 10 mg. |
| **Morphine** | Single dose < 10 mg | Below minimum available dose. |
| **Hydromorphone** | Single dose < 4 mg | Below minimum available dose (Jurnista). |

---

## 10. Blocked Drugs

| Drug | Blocked As Source? | Blocked As Target? |
|---|:---:|:---:|
| Nalbuphine | No (warning only) | **YES** |
| Pethidine | No (warning only) | **YES** |
| All others | No | No |

When a drug is blocked as target, the calculator will not perform the conversion and displays an error message.

---

## 11. Complete Calculation Pipeline

```
Step 1: CALCULATE SOURCE OME
   For each current drug:
      TDD = dose × frequency  (or sum of asymmetric doses)
      OME = TDD × factorToOme  (or patch lookup table)
   Total OME = sum of all source OMEs

Step 2: APPLY REDUCTION
   Effective reduction = max(user slider %, GFR minimum %)
   Reduced OME = Total OME × (1 - reduction/100)

Step 3: CONVERT TO TARGET DRUG
   If methadone:  Target TDD = Ripamonti(Reduced OME)
   If patch:      Target mcg/hr = reverse patch lookup(Reduced OME)
   Otherwise:     Target TDD = Reduced OME × factorFromOme

Step 4: ROUND TO TABLETS
   If oral:       Apply rounding algorithm (§5) to available tablet sizes
   If patch:      Combine available patch sizes (greedy algorithm)
   If injectable: Use exact calculated dose (no rounding)

Step 5: CALCULATE BREAKTHROUGH
   Single dose = Actual TDD ÷ 6
   Round to IR tablet sizes
   Max daily = single dose × 6

Step 6: GENERATE WARNINGS
   Collect: GFR warnings + GFR drug advice + drug warnings +
            route warnings + BMI warnings + gender warnings +
            min dose warnings + tramadol ceiling + breakthrough escalation
```

---

## 12. Worked Examples

### Example 1: Oral Morphine → Oral Oxycodone

**Patient:** MST Continus 60 mg q12h, GFR = 45, no BMI/gender data, 25% reduction

1. **Source TDD:** 60 mg × 2 = 120 mg morphine oral/day
2. **Source OME:** 120 × 1.0 = **120 mg OME/day**
3. **GFR check:** 45 ≥ 30 → no GFR floor, user reduction of 25% stands
4. **Reduced OME:** 120 × (1 - 0.25) = **90 mg OME/day**
5. **Target TDD:** 90 × 0.667 = **60.03 mg oxycodone/day**
6. **Rounding (q12h, sizes: 5,10,20,40,80):**
   - Ideal per-dose: 60.03 ÷ 2 = 30.015 mg
   - Round down: 1× 20mg + 1× 10mg = 30 mg (error: 0.05% ✓)
   - **Result:** Reggel 30 mg, Este 30 mg → TDD = 60 mg
7. **Breakthrough:** 60 ÷ 6 = 10 mg → 1× 10mg Codoxy Rapid
8. **Warnings:** None (GFR is normal for oxycodone)

---

### Example 2: Fentanyl Patch → Oral Morphine

**Patient:** Durogesic 75 mcg/hr patch, GFR = 22, 25% reduction

1. **Source OME:** Lookup 75 mcg/hr → midpoint **202.5 mg OME/day**
2. **GFR check:** 22 < 30 → minimum reduction = 25%. User's 25% = effective 25%.
3. **Reduced OME:** 202.5 × 0.75 = **151.875 mg OME/day**
4. **Target TDD:** 151.875 × 1.0 = **151.875 mg morphine oral/day**
5. **Rounding (q12h, sizes: 10,30,60,100):**
   - Ideal per-dose: 75.9 mg
   - Round down: 1× 60mg + 1× 10mg = 70 mg → TDD = 140 mg (error: 7.8% ✓)
   - **Result:** Reggel 70 mg, Este 70 mg → TDD = 140 mg
6. **Breakthrough:** 140 ÷ 6 = 23.3 mg → 2× 10mg = 20 mg Sevredol
7. **Warnings:**
   - GFR < 30: metabolite accumulation risk, 25-50% reduction recommended
   - Morphine: AVOID in renal impairment (M6G accumulation)

---

### Example 3: Multiple Sources → Fentanyl Patch

**Patient:** Tramadol 100mg q8h oral + Morphine SC 10mg q6h, GFR = 8, 50% reduction

1. **Source 1 TDD:** Tramadol 100 × 3 = 300 mg oral/day → OME: 300 × 0.1 = **30 mg**
2. **Source 2 TDD:** Morphine SC 10 × 4 = 40 mg SC/day → OME: 40 × 3.0 = **120 mg**
3. **Total OME:** 30 + 120 = **150 mg OME/day**
4. **GFR check:** 8 < 10 → minimum reduction = 50%. User's 50% matches.
5. **Reduced OME:** 150 × 0.50 = **75 mg OME/day**
6. **Target mcg/hr:** Lookup 75 OME → midpoint matches exactly → **25 mcg/hr**
7. **Patch combination:** 1× 25 mcg/hr
8. **Breakthrough:** 75 ÷ 6 = 12.5 mg oral morphine → 1× 10mg Sevredol = 10 mg
9. **Warnings:**
   - GFR < 30: 25-50% reduction recommended
   - GFR < 10: at least 50% reduction recommended
   - Fentanyl: PREFERRED for renal impairment
   - Patch onset: 12-24 hours to therapeutic level

---

### Example 4: Oral Oxycodone → Methadone

**Patient:** OxyContin 80mg q12h, no GFR, 30% reduction

1. **Source TDD:** 80 × 2 = 160 mg oxycodone oral/day
2. **Source OME:** 160 × 1.5 = **240 mg OME/day**
3. **Reduced OME:** 240 × 0.70 = **168 mg OME/day**
4. **Methadone (Ripamonti):** 168 falls in tier 91–300 → ratio 6:1 → 168 ÷ 6 = **28 mg methadone/day**
5. **Rounding (q8h, sizes: 5,10,20,40):**
   - Ideal per-dose: 28 ÷ 3 = 9.33 mg
   - Round down: 1× 5mg = 5 mg (error: 46% — too high)
   - Round up: 1× 10mg = 10 mg (error: 7.1% ✓, but asymmetric needed)
   - **Result:** Reggel 10 mg, Délután 10 mg, Éjjel 10 mg → TDD = 30 mg
6. **Warnings:**
   - Methadone: non-linear PK, specialist titration, ECG monitoring, 5-7 day steady state

---

*This document is generated from the PalliCalc v2.0 source code and should be reviewed periodically against current clinical guidelines.*
