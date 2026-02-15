# PalliCalc Clinical Data Reference

**Version:** 1.0
**Date:** 2026-02-15
**Purpose:** Definitive clinical pharmacology reference for the PalliCalc opioid rotation calculator. This document is THE single source of truth for all conversion factors, drug data, warning texts, and dosing logic used in the application.

**Sources cross-referenced:**
- Semmelweis University Opioid Rotation Protocol (Dr. Niedermüller, 2025)
- Scottish Palliative Care Guidelines (rightdecisions.scot.nhs.uk)
- Eastern Palliative Care Victoria, Australia (epcvic.org.au, August 2024 workbook)
- eviQ Cancer Treatments Online (eviq.org.au, v3, December 2023)
- PHARMINDEX Online Hungary (pharmindex-online.hu, accessed February 2026)
- WHO Guidelines for Cancer Pain Management
- Ripamonti et al. (J Clin Oncol, 1998) for methadone conversion

---

## 1. Complete Conversion Factor Table

### 1.1 Conversion Factor Definitions

The application uses **Oral Morphine Equivalent (OME)** as the universal "currency" for all conversions.

- **Factor TO OME (factor_to_ome):** Multiply the drug's TDD by this factor to get OME mg/day.
  - Formula: `OME (mg/day) = Drug TDD (mg/day) x factor_to_ome`
- **Factor FROM OME (factor_from_ome):** Multiply the OME by this factor to get the target drug's TDD.
  - Formula: `Target TDD (mg/day) = OME (mg/day) x factor_from_ome`
- **Relationship:** `factor_from_ome = 1 / factor_to_ome` (mathematically reciprocal)

### 1.2 Master Conversion Table

| Drug | Route | Factor TO OME | Factor FROM OME | Unit | Scottish | Australian (eviQ) | Semmelweis | ADOPTED | Notes |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **Morphine** | Oral | 1.0 | 1.0 | mg | 1.0 | 1.0 | 1.0 | **1.0** | Reference standard. All sources agree. |
| **Morphine** | SC/IV | 3.0 | 0.333 | mg | 2.0 (Scottish says divide oral by 2) | 3.0 | 2-3 (range) | **3.0** | **DISCREPANCY:** Scottish uses 2:1 (oral:parenteral), eviQ and most Australian/international sources use 3:1. Semmelweis cites 2-3x range. We adopt **3.0** per eviQ (updated Dec 2023 from 2.5 to 3.0) as the more conservative factor. This means 30mg oral morphine = 10mg SC/IV morphine. |
| **Oxycodone** | Oral | 1.5 | 0.667 | mg | 2.0 (Scottish: 10mg oral morphine = 5mg oral oxycodone, so oxy is 2x potent) | 1.5 | 1.5 | **1.5** | **DISCREPANCY:** Scottish guidelines use a ratio of 2:1 (morphine:oxycodone), making oxycodone 2x potent. eviQ, Semmelweis, and most international sources use 1.5x. We adopt **1.5** as used by Semmelweis, eviQ, and the majority of sources. This is the more conservative (safer) approach when converting TO oxycodone. |
| **Oxycodone** | SC/IV | 3.0 | 0.333 | mg | 3-4 (Scottish: divide oral morphine by 4 for SC oxy) | 2.5 | 3-4 (range) | **3.0** | **DISCREPANCY:** Scottish uses ~4:1, eviQ uses 2.5. Semmelweis cites 3-4x range. We adopt **3.0** as a middle-ground conservative estimate. |
| **Hydromorphone** | Oral | 5.0 | 0.2 | mg | 5-7.5 (Scottish: 10mg morphine = 1.3-2mg HM) | 5.0 | 5.0 | **5.0** | Scottish gives a wider range (5-7.5x). eviQ updated from 6.0 to 5.0 in Dec 2023. Semmelweis uses 5.0. All converging on **5.0**. |
| **Hydromorphone** | SC/IV | 15.0 | 0.067 | mg | 10 (Scottish: 15mg oral morphine = 1mg SC HM) | 15.0 | N/A | **15.0** | eviQ uses 15.0. Scottish says approximately 10 (oral morphine 15mg = HM SC 1mg). Adopt **15.0** per eviQ. |
| **Tramadol** | Oral | 0.1 | 10.0 | mg | 0.1 (400mg tramadol = 40mg morphine) | 0.2 | 0.1 | **0.1** | **DISCREPANCY:** eviQ uses 0.2 (i.e., tramadol is more potent in their model). Scottish and Semmelweis agree on 0.1 (100mg tramadol = 10mg morphine). We adopt **0.1** per Semmelweis/Scottish, which is the more conservative approach. |
| **Tramadol** | IV | 0.1 | 10.0 | mg | 0.1 | 0.2 | 0.1 | **0.1** | Same rationale as oral tramadol. |
| **Codeine** | Oral | 0.1 | 10.0 | mg | 0.1 (240mg codeine = 24mg morphine) | 0.125 | N/A | **0.1** | Scottish: divide by 10. eviQ: multiply by 0.125 (slightly more potent). Adopt **0.1** per Scottish/Semmelweis. Not commonly used in PalliCalc as a primary conversion drug, but included for completeness. |
| **Dihydrocodeine** | Oral | 0.1 | 10.0 | mg | 0.1 (240mg DHC = 24mg morphine) | N/A | 0.1 | **0.1** | All sources agree. 240mg DHC/day = 24mg oral morphine/day. |
| **Fentanyl** | SC/IV | 100.0 | 0.01 | mg (input as mg, calculations internally in mg) | See note | See note | 100 | **100.0** | Fentanyl is ~100x more potent than oral morphine. 100mcg (0.1mg) SC fentanyl approximately equals 10mg oral morphine. Scottish says 30mg oral morphine = 1mg SC alfentanil (fentanyl is ~3x alfentanil potency). Semmelweis confirms factor of 100. **IMPORTANT:** Input unit for SC/IV fentanyl in the app is mg, NOT mcg. The factor of 100 converts mg fentanyl to mg oral morphine equivalent. |
| **Fentanyl** | Oral/Mucosal | 50.0 | 0.02 | mg | N/A (not directly addressed in Scottish conversion tables) | N/A | 50 | **50.0** | Buccal/sublingual fentanyl has approximately 50% bioavailability compared to IV. Therefore factor is ~half of SC/IV (100/2 = 50). **IMPORTANT:** Transmucosal fentanyl products (Effentora, Abstral, Actiq) are primarily for breakthrough pain and should NOT be used for regular dosing conversion. The user may be entering these for informational purposes. |
| **Fentanyl** | Patch (TDT) | LOOKUP | LOOKUP | mcg/hr | See Section 2 | See Section 2 | See Section 2 | **LOOKUP TABLE** | Fentanyl patches use a non-linear lookup table, not a simple multiplication factor. See Section 2. |
| **Tapentadol** | Oral | 0.3 | 3.33 | mg | N/A | 0.3 | N/A | **0.3** | Per eviQ. Not currently in the Hungarian formulary for palliative use but included for future-proofing. |
| **Buprenorphine** | Patch (TDT) | 2.0 | 0.5 | mcg/hr to mg/day | Scottish: 5mcg/hr = 12mg morphine/day | 2.0 (eviQ, updated from 2.5) | N/A | **NOT INCLUDED** | Buprenorphine is a partial agonist and NOT commonly used in Hungarian palliative care for rotation. Excluded from PalliCalc scope. |

### 1.3 Discrepancy Summary and Rationale

| Drug/Route | Scottish Factor | eviQ Factor | Semmelweis Factor | PalliCalc Adopted | Rationale |
|:---|:---|:---|:---|:---|:---|
| Morphine SC/IV | 2.0 | 3.0 | 2-3 | **3.0** | More conservative when converting FROM parenteral; aligns with eviQ Dec 2023 update |
| Oxycodone Oral | 2.0 | 1.5 | 1.5 | **1.5** | More conservative when converting TO oxycodone; Semmelweis protocol uses 1.5 |
| Oxycodone SC/IV | 3-4 | 2.5 | 3-4 | **3.0** | Middle ground; conservative |
| Tramadol Oral/IV | 0.1 | 0.2 | 0.1 | **0.1** | More conservative; Semmelweis protocol |
| Hydromorphone Oral | 5-7.5 | 5.0 | 5.0 | **5.0** | eviQ updated from 6 to 5; consensus forming |

**Guiding principle for discrepancies:** When sources disagree, PalliCalc adopts the factor recommended by the Semmelweis University protocol as the primary authority, cross-checked against eviQ (the most recently updated source). The application always errs on the side of patient safety (lower dose output) when there is ambiguity.

---

## 2. Complete Fentanyl Patch Lookup Table

### 2.1 Patch-to-OME Conversion Table

Fentanyl patches are dosed in mcg/hr and deliver drug over 72 hours. The relationship between patch strength and oral morphine equivalent is **non-linear** and must use a lookup table.

| Patch Strength (mcg/hr) | OME Low (mg/day) | OME High (mg/day) | OME Midpoint (mg/day) | Suggested Breakthrough Dose (1/6 of midpoint, oral morphine mg) | Source Concordance |
|:---|:---|:---|:---|:---|:---|
| **12** | 30 | 45 | 37.5 | 5-8 mg | Scottish: 30-60mg. Semmelweis: 30-45mg. eviQ: ~45mg (12 x 3.6). Adopted: 30-45 (conservative end of Scottish range) |
| **25** | 60 | 90 | 75.0 | 10-15 mg | Scottish: 60-90mg. Semmelweis: 60-90mg. eviQ: ~90mg (25 x 3.6). All agree. |
| **37** | 90 | 120 | 105.0 | 15-20 mg | Scottish includes 37.5 mcg/hr patch (matrix only). Interpolated from table. Not all brands available at this strength in Hungary -- only Matrifen has 12mcg in HU. |
| **50** | 120 | 150 | 135.0 | 20-25 mg | Scottish: 120-180mg. Semmelweis: 120-150mg. eviQ: ~180mg (50 x 3.6). **DISCREPANCY:** Scottish/eviQ suggest higher range. Adopted: 120-150 (Semmelweis). |
| **75** | 180 | 225 | 202.5 | 30-38 mg | Scottish: 240-300mg. Semmelweis: 180-225mg. **DISCREPANCY:** Scottish significantly higher. Adopted: 180-225 (Semmelweis). |
| **100** | 240 | 300 | 270.0 | 40-50 mg | Scottish: 360mg. Semmelweis: 240-300mg. **DISCREPANCY:** Scottish higher. Adopted: 240-300 (Semmelweis). |

**Note on discrepancies:** The Scottish guidelines produce higher OME equivalents at higher patch strengths than Semmelweis. This is because Scottish guidelines use a conversion ratio that makes fentanyl appear less potent (thus more morphine equivalent per mcg/hr). The Semmelweis/Australian ranges are more widely cited in international literature. We adopt the Semmelweis values.

### 2.2 Conversion Algorithm (TO fentanyl patch)

When converting FROM OME to a target fentanyl patch:

1. Calculate reduced OME (after cross-tolerance reduction).
2. Look up the patch table to find which range the OME falls into.
3. Use linear interpolation between table entries for intermediate values.
4. The result is a target mcg/hr value.
5. Combine available patch sizes (100, 75, 50, 25, 12 mcg/hr) using a greedy algorithm from largest to smallest to approximate the target.
6. If remainder is >= 6 mcg/hr (half the smallest patch), round up by adding a 12mcg/hr patch.

### 2.3 Conversion Algorithm (FROM fentanyl patch)

When converting from a fentanyl patch to another drug:

1. User enters patch strength in mcg/hr.
2. If multiple patches, user can enter the sum (e.g., 100 + 50 = 150 mcg/hr).
3. Look up the midpoint OME for the exact patch strength. For non-standard combinations, use interpolation/extrapolation.
4. The resulting OME is then converted to the target drug using the standard factor.

### 2.4 Clinical Alerts for Fentanyl Patches

- **Onset delay:** Fentanyl patches take 12-24 hours to reach therapeutic serum levels after application. When switching TO a patch, the previous opioid must be continued for 12 hours (immediate-release) or given as the final dose (modified-release q12h).
- **Offset depot:** When switching FROM a patch, a subcutaneous depot remains for 12-24 hours after removal. The new opioid should be started cautiously or delayed.
- **Steady state:** Full steady state is reached at 72 hours.
- **Heat warning:** Application of external heat (heating pads, fever >39C, hot baths) can dramatically increase absorption and cause fatal overdose.
- **Patch change frequency:** Every 72 hours (3 days), NOT 48 hours.
- **Minimum stable dose:** Fentanyl patches should generally only be initiated for patients already on a stable opioid dose equivalent to at least 30mg oral morphine/day (the 12mcg/hr patch equivalent).

---

## 3. Complete Hungarian Brand Name Registry

### 3.1 Morphine (Morfin) -- ATC: N02AA01

| Brand Name | Formulation | Route | Available Strengths | Formulation Type | Notes |
|:---|:---|:---|:---|:---|:---|
| **MST Continus** | Retard filmtabletta (modified-release film-coated tablet) | Oral | 10, 30, 60, 100 mg | Modified-release (q12h) | Primary extended-release morphine in Hungary |
| **Sevredol** | Filmtabletta (immediate-release film-coated tablet) | Oral | 10 mg | Immediate-release (q4h) | Only 10mg strength confirmed in PHARMINDEX HU. Used for breakthrough pain or dose titration. |
| **Morphine Kalceks** | Oldatos injekció (solution for injection) | SC/IV | 10 mg/ml (2ml, 10ml ampoules) | Injectable | Parenteral morphine |
| **Morphinum Hydrochloricum TEVA** | Oldatos injekció (solution for injection) | SC/IV | 10 mg/ml, 20 mg/ml | Injectable | Parenteral morphine |

### 3.2 Oxycodone (Oxikodon) -- ATC: N02AA05

| Brand Name | Formulation | Route | Available Strengths | Formulation Type | Notes |
|:---|:---|:---|:---|:---|:---|
| **OxyContin** | Retard filmtabletta | Oral | **10, 20 mg** | Modified-release (q12h) | **Only 10mg and 20mg confirmed in HU PHARMINDEX.** User confirmed 10mg is minimum in Hungary. |
| **Codoxy** | Retard tabletta | Oral | 5, 10, 20, 40, 80 mg | Modified-release (q12h) | Full range available. Most complete oxycodone line in Hungary. |
| **Codoxy Rapid** | Filmtabletta | Oral | 10 mg | Immediate-release | For breakthrough or titration |
| **Reltebon** | Retard tabletta | Oral | 10, 20, 40, 80 mg | Modified-release (q12h) | Alternative to Codoxy retard |
| **Oxycodone Sandoz** | Kemény kapszula (hard capsule) | Oral | 5, 10, 20 mg | Immediate-release capsule | Hard capsules, not retard |
| **Oxycodone Vitabalans** | Filmtabletta | Oral | 5, 10 mg | Immediate-release tablet | Lower-dose range only |

### 3.3 Oxycodone + Naloxone (Oxikodon + Naloxon) -- ATC: N02AA55

Uses the **same OME conversion factor as Oxycodone** (factor_to_ome = 1.5). The naloxone component acts locally in the gut to reduce opioid-induced constipation and does not affect systemic analgesia (due to high first-pass hepatic metabolism). **CONTRAINDICATED in moderate-to-severe hepatic impairment** -- see Section 12.

| Brand Name | Formulation | Route | Available Strengths (oxy/nal) | Formulation Type | Notes |
|:---|:---|:---|:---|:---|:---|
| **Targin** | Retard tabletta | Oral | 5/2.5, 10/5, 20/10, 40/20 mg | Modified-release (q12h) | Most widely prescribed oxy+nal in Hungary. Only the oxycodone component is used for OME calculation. |
| **Oxynal** | Retard tabletta | Oral | 5/2.5, 10/5, 20/10, 40/20 mg | Modified-release (q12h) | Generic alternative to Targin |
| **Oxynador** | Retard tabletta | Oral | 10/5, 20/10 mg | Modified-release (q12h) | Confirmed in PHARMINDEX HU at these two strengths |
| **Oxikodon-HCL/Naloxon-HCL Neuraxpharm** | Retard tabletta | Oral | 5/2.5, 10/5, 20/10, 40/20 mg | Modified-release (q12h) | Generic |

### 3.4 Fentanyl Transdermal (TDT) -- ATC: N02AB03

| Brand Name | Formulation | Route | Available Strengths (mcg/hr) | Notes |
|:---|:---|:---|:---|:---|
| **Durogesic** | Transzdermális tapasz | Patch | 25, 50, 75, 100 | Original brand. No 12mcg in Hungary for this brand. |
| **Dolforin** | Transzdermális tapasz | Patch | 25, 50, 75, 100 | No 12mcg confirmed |
| **Matrifen** | Transzdermális mátrix tapasz | Patch | **12**, 25, 50, 75, 100 | **Only brand with 12mcg/hr patch in Hungary.** Matrix patch technology. |
| **Fentanyl Sandoz MAT** | Transzdermális mátrix tapasz | Patch | 25, 50, 75, 100 | Matrix technology. "MAT" designator. |
| **Fentanyl-ratiopharm** | Transzdermális tapasz | Patch | 25, 50, 75, 100 | No 12mcg confirmed |

**CRITICAL NOTE on 12 mcg/hr patches:** Only **Matrifen** currently lists the 12 mcg/hr strength in the Hungarian PHARMINDEX database. When the calculator suggests a 12 mcg/hr patch, the UI should note that only Matrifen is available at this strength.

### 3.5 Fentanyl Oral/Mucosal -- ATC: N02AB03

| Brand Name | Formulation | Route | Available Strengths | Notes |
|:---|:---|:---|:---|:---|
| **Effentora** | Buccalis tabletta (buccal tablet) | Oral/Mucosal | 100, 200, 400, 600, 800 mcg | EMA-authorized. **Availability in Hungary is uncertain/limited.** The Semmelweis analysis specifically noted the absence of transmucosal fentanyl products in the Hungarian market. Not found in PHARMINDEX HU database. |
| **Abstral** | Szublinguális tabletta (sublingual tablet) | Oral/Mucosal | 100, 200, 300, 400, 600, 800 mcg | EMA-authorized. **Same availability concern as Effentora.** |
| **Actiq** | Szopogató tabletta (lozenge/lollipop) | Oral/Mucosal | 200, 400, 600, 800, 1200, 1600 mcg | EMA-authorized. **Same availability concern.** |

**IMPORTANT:** The Semmelweis University analysis (Section 5) explicitly identifies the **absence of rapid-onset transmucosal fentanyl formulations in Hungary** as a critical gap. While these products have EMA marketing authorization valid across the EU, they may not be actively marketed or reimbursed in Hungary. The user's requirement to include these brand names suggests they may be available through individual import or hospital pharmacy channels. The app should include them but may want to flag their limited availability.

### 3.6 Fentanyl Injectable -- ATC: N01AH01

| Brand Name | Formulation | Route | Available Strengths | Notes |
|:---|:---|:---|:---|:---|
| **Fentanyl Kalceks** | Oldatos injekció | SC/IV | 50 mcg/ml (2ml, 10ml ampoules) | Confirmed in PHARMINDEX HU. Primary injectable fentanyl. |
| **Fentanyl-Richter** | Oldatos injekció | SC/IV | 50 mcg/ml | Gedeon Richter product. May not currently appear in PHARMINDEX but listed by user. |
| **Fentanyl Sandoz** | Oldatos injekció | SC/IV | 50 mcg/ml | Note: "Fentanyl Sandoz" exists as BOTH a patch (MAT) and an injection. The app must disambiguate by formulation/route. |

### 3.7 Hydromorphone (Hidromorfon) -- ATC: N02AA03

| Brand Name | Formulation | Route | Available Strengths | Notes |
|:---|:---|:---|:---|:---|
| **Jurnista** | Retard tabletta (OROS technology) | Oral | 4, 8, 16, 32, 64 mg | 24-hour modified release. **Availability in Hungary not confirmed in PHARMINDEX.** May require individual import. |
| **Palladone / Palladone SR** | Kapszula / retard kapszula | Oral | 1.3, 2.6 mg (IR); 2, 4, 8, 16, 24 mg (SR) | Available in some EU countries. **Not confirmed in Hungarian PHARMINDEX.** |

**NOTE:** Hydromorphone availability in Hungary is limited. The user's requirements include it as a conversion target, so it must be in the calculator, but the UI should indicate that commercial availability may be limited and prescribing may require special authorization.

### 3.8 Tramadol -- ATC: N02AX02

| Brand Name | Formulation | Route | Available Strengths | Notes |
|:---|:---|:---|:---|:---|
| **Contramal** | Kemény kapszula (IR) | Oral | 50 mg | Immediate-release |
| **Contramal** | Retard tabletta (MR) | Oral | 100, 150, 200 mg | Modified-release |
| **Contramal** | Cseppek (oral drops) | Oral | 100 mg/ml | Liquid formulation |
| **Contramal** | Kúp (suppository) | Rectal | 100 mg | Rectal formulation |
| **Contramal** | Oldatos injekció | IV/IM | 50 mg/ml | Injectable |
| **Adamon** | Retard kapszula (MR) | Oral | 50, 100, 150 mg | Modified-release capsule |
| **Ralgen** | Kemény kapszula (IR) | Oral | 50 mg | Immediate-release |
| **Ralgen SR** | Retard tabletta (MR) | Oral | 100, 150, 200 mg | Modified-release |
| **Tramadol AL** | Kemény kapszula | Oral | 50 mg | Immediate-release |
| **Tramadol Kalceks** | Oldatos injekció/infúzió | IV | 50 mg/ml | Injectable |
| **Tramadol Vitabalans** | Tabletta | Oral | 50 mg | Immediate-release |
| **Tramadol Zentiva** | Kemény kapszula | Oral | 50 mg | Immediate-release |
| **Tramadol Zentiva** | Cseppek (oral drops) | Oral | 100 mg/ml | Liquid formulation |
| **Tramadolor** | Kemény kapszula | Oral | 50 mg | Immediate-release |
| **Tramadolor** | Módosított hatóanyagleadású tabletta (MR) | Oral | 100, 150, 200 mg | Modified-release |

### 3.9 Dihydrocodeine (Dihidrokodein) -- ATC: N02AA08

| Brand Name | Formulation | Route | Available Strengths | Notes |
|:---|:---|:---|:---|:---|
| **DHC Continus** | Retard tabletta | Oral | 60 mg | Only 60mg confirmed in PHARMINDEX HU. Internationally available as 60, 90, 120mg. |

### 3.10 Methadone (Metadon) -- ATC: N07BC02

| Brand Name | Formulation | Route | Available Strengths | Notes |
|:---|:---|:---|:---|:---|
| **Metadon EP** | Tabletta | Oral | 5, 10, 20, 40 mg | Manufactured by ExtractumPharma. Available in Hungary. Primarily used for opioid substitution therapy but also for pain management under specialist supervision. |
| **Methasan** | Koncentrátum belsőleges oldathoz (concentrate for oral solution) | Oral | 10 mg/ml | Liquid formulation for substitution therapy. |

### 3.11 Nalbuphine (Nalbufin) -- ATC: N02AF02

| Brand Name | Formulation | Route | Available Strengths | Notes |
|:---|:---|:---|:---|:---|
| **Nalpain** | Oldatos injekció | SC/IV/IM | 10 mg/ml | **WARNING DRUG.** Mixed agonist-antagonist. See Section 11. |

### 3.12 Pethidine (Petidin) -- ATC: N02AB02

| Brand Name | Formulation | Route | Available Strengths | Notes |
|:---|:---|:---|:---|:---|
| **Pethidine (hospital supply)** | Injekció | IM/IV | 50 mg/ml (typically) | **WARNING DRUG.** Not found in current PHARMINDEX consumer database; likely restricted to hospital pharmacy supply. See Section 11. |

---

## 4. Available Tablet/Patch Sizes per Drug (for Dose Rounding)

This section is **CRITICAL** for the dose rounding algorithm. The calculator must know every commercially available strength to suggest practical dosing.

### 4.1 Morphine Oral

| Formulation | Available Sizes (mg) | Typical Dosing Frequency |
|:---|:---|:---|
| MST Continus (retard) | **10, 30, 60, 100** | q12h |
| Sevredol (IR) | **10** | q4-6h (breakthrough) |

### 4.2 Oxycodone Oral (Pure)

| Formulation | Available Sizes (mg) | Typical Dosing Frequency |
|:---|:---|:---|
| OxyContin (retard) | **10, 20** | q12h |
| Codoxy (retard) | **5, 10, 20, 40, 80** | q12h |
| Codoxy Rapid (IR) | **10** | q4-6h (breakthrough) |
| Reltebon (retard) | **10, 20, 40, 80** | q12h |
| Oxycodone Sandoz (kapszula, IR) | **5, 10, 20** | q4-6h |
| Oxycodone Vitabalans (tabletta, IR) | **5, 10** | q4-6h |

**Effective oxycodone retard strengths available:** 5, 10, 20, 40, 80 mg
**Effective oxycodone IR strengths available:** 5, 10, 20 mg
**Minimum available retard dose:** 5 mg (Codoxy). **OxyContin minimum is 10 mg** (per user requirement).

### 4.3 Oxycodone+Naloxone Oral

| Formulation | Available Sizes (oxycodone mg) | Typical Dosing Frequency |
|:---|:---|:---|
| Targin / Oxynal / Neuraxpharm (retard) | **5, 10, 20, 40** (oxycodone component) | q12h |
| Oxynador (retard) | **10, 20** (oxycodone component) | q12h |

**Effective oxycodone+naloxone retard strengths:** 5, 10, 20, 40 mg (oxycodone component)

### 4.4 Hydromorphone Oral

| Formulation | Available Sizes (mg) | Typical Dosing Frequency |
|:---|:---|:---|
| Jurnista (retard, OROS) | **4, 8, 16, 32, 64** | q24h |
| Palladone SR (retard) | **2, 4, 8, 16, 24** | q12h |
| Palladone IR | **1.3, 2.6** | q4-6h |

**Note:** Hungarian availability is uncertain. If used, round to available strengths.

### 4.5 Tramadol Oral

| Formulation | Available Sizes (mg) | Typical Dosing Frequency |
|:---|:---|:---|
| Contramal/Ralgen/Tramadol AL/etc. (IR kapszula) | **50** | q4-6h |
| Contramal/Ralgen SR/Tramadolor (MR tabletta) | **100, 150, 200** | q12h |
| Adamon (MR kapszula) | **50, 100, 150** | q12h |

**Maximum daily dose:** 400 mg (ceiling effect; seizure risk above this).

### 4.6 Dihydrocodeine Oral

| Formulation | Available Sizes (mg) | Typical Dosing Frequency |
|:---|:---|:---|
| DHC Continus (retard) | **60** | q12h |

### 4.7 Fentanyl Patches

| Available Sizes (mcg/hr) |
|:---|
| **12** (Matrifen only), **25, 50, 75, 100** |

### 4.8 Methadone Oral

| Formulation | Available Sizes (mg) | Typical Dosing Frequency |
|:---|:---|:---|
| Metadon EP (tabletta) | **5, 10, 20, 40** | Complex -- see Section 10 |

---

## 5. Dose Rounding Logic Specification

### 5.1 Purpose

The user explicitly requested that the calculator **round calculated doses to available tablet sizes** and suggest **asymmetrical dosing** when needed (e.g., 50mg morning + 60mg evening for a 110mg/day TDD).

### 5.2 Algorithm for q12h Dosing (Most Common)

**Input:** Target TDD (mg/day) for a given drug, frequency = 2 (q12h).

**Step 1:** Determine the set of available tablet strengths for the target drug formulation. Example for oxycodone retard: [5, 10, 20, 40, 80].

**Step 2:** Calculate the ideal single dose: `ideal_dose = TDD / 2`.

**Step 3:** Find the nearest available dose combinations:
- `dose_low = largest combination of available tablets <= ideal_dose`
- `dose_high = smallest combination of available tablets >= ideal_dose`

**Step 4:** Check if equal dosing works:
- If `dose_low * 2 == TDD` or `dose_high * 2 == TDD`, use equal dosing.
- If not, use asymmetrical dosing.

**Step 5:** For asymmetrical dosing:
- Morning dose = `dose_low` (rounded down to nearest available combination)
- Evening dose = `TDD - dose_low` (rounded up, using available tablets)
- Verify that evening dose can be achieved with available tablets.
- If not, try the reverse (higher morning, lower evening).
- If neither works perfectly, find the closest combination where `morning + evening` is closest to TDD, preferring to round DOWN for safety.

**Step 6:** Calculate tablet count per dose and display.

### 5.3 Practical Example

- Target: Oxycodone retard 108.5 mg/day, q12h
- Ideal single dose: 54.25 mg
- Available strengths: 5, 10, 20, 40, 80 mg
- Morning: 50 mg (40 + 10) = 2 tablets
- Evening: 60 mg (40 + 20) = 2 tablets
- Total: 110 mg/day (4 tablets/day)
- Alternative: Morning 40mg (1 tablet), Evening 60mg (40+20, 2 tablets) = 100mg/day
- **Best fit:** 50mg + 60mg = 110mg/day (closest to 108.5, rounding up slightly for efficacy)

### 5.4 Rounding Rules

1. **Never round up by more than 15%** of the calculated dose. If the nearest available combination exceeds +15%, round DOWN and flag that the dose may be subtherapeutic.
2. **Prefer fewer tablets** when two combinations yield the same total dose.
3. **For breakthrough dosing**, always round to the nearest available IR tablet strength, rounding DOWN for safety.
4. **Display the actual TDD** alongside the ideal TDD, so the clinician sees the discrepancy.

### 5.5 Minimum Dose Rules

| Drug | Route | Minimum Dose | Source |
|:---|:---|:---|:---|
| OxyContin | Oral (retard) | **10 mg** | User requirement: "10 mg-os a legkisebb dózis Magyarországon" |
| Codoxy | Oral (retard) | 5 mg | Smallest available retard strength |
| MST Continus | Oral (retard) | 10 mg | Smallest available retard strength |
| Fentanyl patch | TDT | 12 mcg/hr | Smallest available patch |

---

## 6. Breakthrough Pain Dosing Rules

### 6.1 Calculation

Breakthrough dose = **1/6 of the Total Daily Dose (TDD)** of the regular opioid.

This is the standard used by Scottish, Australian, and Semmelweis guidelines. Some guidelines cite 1/6 to 1/10; PalliCalc uses 1/6 as the standard.

Formula: `breakthrough_single_dose = TDD / 6`

### 6.2 Maximum Total Daily Breakthrough Dose

The user explicitly requested that the app display the **maximum total daily breakthrough dose** and warn when more is needed.

- **Maximum breakthrough doses per day:** 6 (industry standard -- if a patient needs more than 6 breakthrough doses per day, the base dose needs increasing).
- **Maximum total daily breakthrough dose:** `breakthrough_single_dose x 6 = TDD` (i.e., the total breakthrough allowance equals the regular TDD).
- **Warning threshold:** If the patient is using >= 4 breakthrough doses per day (or total breakthrough >= 2/3 of TDD), display:

**Hungarian:**
> "Az áttöréses fájdalom csillapítására felhasznált adag megközelíti a maximális napi mennyiséget. Az alap dózis emelése javasolt!"

**English:**
> "Breakthrough pain dosing is approaching the maximum daily allowance. Base dose increase is recommended!"

### 6.3 Breakthrough Dose Display Format

Display both:
1. **Single breakthrough dose** (rounded to nearest available IR tablet or injectable dose)
2. **Maximum total daily breakthrough allowance** (single dose x 6)
3. **Warning if exceeded:** "Alap dózis emelendő!" / "Base dose needs increasing!"

### 6.4 Breakthrough Formulation Matching

| Base Drug | Recommended Breakthrough Drug | Route |
|:---|:---|:---|
| Morphine oral retard | Morphine oral IR (Sevredol) | Oral |
| Oxycodone oral retard | Oxycodone IR (Codoxy Rapid, Oxycodone Sandoz) | Oral |
| Fentanyl patch | Oral morphine IR OR transmucosal fentanyl (if available) | Oral/Mucosal |
| Hydromorphone oral retard | Hydromorphone IR (if available) OR morphine IR | Oral |
| Any SC/IV drug | Same drug SC/IV bolus | SC/IV |

---

## 7. GFR Safety Matrix

### 7.1 GFR Warning Texts (User-Specified)

**GFR < 30 ml/min -- General Warning:**

**Hungarian (exact text from user):**
> "Nagy az opioid túladagolás és metabolit-felhalmozódás kockázata, ami súlyos mellékhatásokhoz vezethet! 25-50%-os doziscsökkentés javasolt a rotációkor!"

**English:**
> "High risk of opioid overdose and metabolite accumulation, which may lead to severe side effects! 25-50% dose reduction is recommended during rotation!"

**GFR < 10 ml/min -- General Warning:**

**Hungarian (exact text from user):**
> "Nagy az opioid túladagolás és metabolit-felhalmozódás kockázata, ami súlyos mellékhatásokhoz vezethet! Legalább 50%-os doziscsökkentés javasolt a rotációkor!"

**English:**
> "High risk of opioid overdose and metabolite accumulation, which may lead to severe side effects! At least 50% dose reduction is recommended during rotation!"

### 7.2 Drug-Specific GFR Matrix

| Drug | GFR >= 30 | GFR 10-30 | GFR < 10 | Risk Category |
|:---|:---|:---|:---|:---|
| **Morphine** | Normal dosing | **AVOID.** Reduce 25-50%. Active metabolites (M3G, M6G) accumulate. | **AVOID.** Reduce >=50%. Extreme accumulation risk. | `avoid` |
| **Codeine** | Normal dosing | **CONTRAINDICATED.** Metabolites accumulate unpredictably. | **CONTRAINDICATED.** | `contraindicated` |
| **Dihydrocodeine** | Normal dosing | **CONTRAINDICATED.** Similar metabolite risk as codeine. | **CONTRAINDICATED.** | `contraindicated` |
| **Pethidine** | **AVOID** (generally) | **CONTRAINDICATED.** Norpethidine causes seizures. | **CONTRAINDICATED.** | `contraindicated` |
| **Oxycodone** | Normal dosing | **CAUTION.** Reduce dose and frequency. Monitor closely. | **CAUTION.** Reduce >=50%. Less neurotoxic than morphine. | `caution` |
| **Hydromorphone** | Normal dosing | **CAUTION.** Accumulates less than morphine but still requires dose reduction. | **CAUTION.** Reduce >=50%. | `caution` |
| **Tramadol** | Normal dosing | **CAUTION.** Reduce dose. Active metabolite (O-desmethyltramadol) accumulates. Seizure risk. | **CAUTION.** Reduce >=50%. Max 200mg/day. | `caution` |
| **Fentanyl** | Normal dosing | **PREFERRED.** No active metabolites. Safest strong opioid in renal failure. | **PREFERRED.** Still reduce dose per GFR general warning. Patch absorption may vary in uremic patients. | `preferred` |
| **Sufentanil** | Normal dosing | **PREFERRED.** Liver-metabolized, inactive metabolites. | **PREFERRED.** | `preferred` |
| **Methadone** | Normal dosing | **PREFERRED** (for renal safety). Liver-metabolized, fecal excretion. **BUT** difficult to titrate. | **PREFERRED** (for renal safety, but specialist only). | `preferred` (with caveats) |

### 7.3 Drug-Specific Warning Texts

**When GFR < 30 and target drug is morphine/codeine/dihydrocodeine:**

**Hungarian:**
> "Kerülendő! Az aktív metabolitok (pl. morfin-6-glükuronid) felhalmozódnak, ami neurotoxicitást és szedációt okozhat."

**English:**
> "AVOID! Active metabolites (e.g., morphine-6-glucuronide) accumulate, which may cause neurotoxicity and sedation."

**When GFR < 30 and target drug is oxycodone/hydromorphone:**

**Hungarian:**
> "Óvatosan alkalmazandó! GFR <30 ml/min esetén csökkentett dózisban és ritkított gyakorisággal használható, szoros monitorozás mellett."

**English:**
> "USE CAUTION! With GFR <30 ml/min, use reduced dose and extended intervals with close monitoring."

**When GFR < 30 and target drug is fentanyl:**

**Hungarian:**
> "Biztonságosabb alternatíva! Mivel nincs aktív metabolitja, a fentanil a választandó szer veseelégtelenségben."

**English:**
> "PREFERRED alternative! Fentanyl is the drug of choice in renal impairment as it has no active metabolites."

### 7.4 GFR-Based Slider Constraints

| GFR Range | Minimum Reduction (Slider Lock) | Maximum Reduction |
|:---|:---|:---|
| >= 30 | 0% (no minimum) | 70% |
| 10-30 | **25%** (slider cannot go below 25%) | 70% |
| < 10 | **50%** (slider cannot go below 50%) | 70% |

---

## 8. BMI Warning Texts

### 8.1 BMI < 19 (Underweight / Alultáplált)

**Hungarian (from user):**
> "Figyeljen a dozírozásra, mert kisebb lehet a tolerancia és magasabb toxicitási kockázat!"

**English:**
> "Pay attention to dosing -- tolerance may be lower and toxicity risk is higher!"

**Clinical Rationale (Hungarian, from user):**
> "Kevesebb zsírszövet-raktár: Az alacsony BMI-vel rendelkező személyeknél kevesebb a zsírszövet, ami azt jelenti, hogy a lipofil opioidok (pl. fentanil, metadon) nem tudnak nagy mennyiségben felhalmozódni. Gyorsabb hatáskezdet, de gyorsabb kiürülés. Fokozott túladagolási kockázat. Malnutrició hatása: csökkentheti a gyógyszerek metabolizmusát a májban."

**Clinical Rationale (English):**
> "Low fat stores: In underweight individuals, lipophilic opioids (e.g., fentanyl, methadone) cannot accumulate in fat tissue, leading to faster onset but higher plasma concentrations (small volume of distribution). Malnutrition may reduce hepatic metabolism, increasing the amount of active drug in circulation. Risk of respiratory depression is higher."

### 8.2 BMI 19-26 (Normal / Normál)

No warning displayed. Normal dosing parameters apply.

### 8.3 BMI > 26 (Overweight/Obese / Túlsúlyos)

**Hungarian (from user):**
> "A csökkentés nélküli opioid rotációval történő adagolás könnyen túladagoláshoz vezethet! Azt ajánluk, hogy az adagolás csökkentésének meghatározásához először a beteg számára ideális testtömeg és a jelenlegi testtömeg százalékos arányát vegye alapul!"

**English:**
> "Dosing without reduction during opioid rotation may easily lead to overdose! We recommend basing the dose reduction on the percentage ratio between the patient's ideal body weight and current body weight!"

**Clinical Rationale (Hungarian, from user):**
> "Megnövekedett eloszlási térfogat a lipofil opioidok esetén. Hosszabb felezési idő (depóhatás). Fokozott légzésdepresszió kockázat az alvási apnoé és a légzőrendszeri változások miatt. Teljes testsúlyra (TBW) történő adagolás könnyen túladagoláshoz vezethet."

**Clinical Rationale (English):**
> "Increased volume of distribution for lipophilic drugs. Longer half-life due to fat depot effect (delayed elimination). Higher risk of respiratory depression due to sleep apnea and respiratory changes. Dosing based on total body weight (TBW) may easily lead to overdose."

---

## 9. Gender-Specific Warnings

### 9.1 Male (Férfi)

No gender-specific warning displayed.

### 9.2 Female (Nő)

**Hungarian (from user):**
> "A kiszámolt dózis változtatandó lehet akár naponta is, ha premenopausában van a beteg! Ezért orális gyógyszer adagolás ajánlott!"

**English:**
> "The calculated dose may need to be adjusted even daily if the patient is premenopausal! Therefore oral drug administration is recommended!"

**Clinical Rationale (Hungarian, from user):**
> "Az ösztrogén és a progeszteron szintjének változása befolyásolja az endogén opioid rendszer aktivitását. A ciklus bizonyos szakaszaiban a nők szervezetében kevésbé aktív a mu-opioid rendszer, ami csökkenti a külsőleg bevitt morfium hatékonyságát. A nőkben gyakran magasabb plazmakoncentráció alakul ki az eltérő eloszlási térfogat miatt, valamint az agyi mu-opioid receptorok (MOR) száma és elérhetősége is változhat a reproduktív korban lévő nőkben."

**Clinical Rationale (English):**
> "Fluctuations in estrogen and progesterone levels affect the activity of the endogenous opioid system. During certain phases of the menstrual cycle, the mu-opioid system is less active in women, reducing the efficacy of exogenously administered morphine. Women often develop higher plasma concentrations due to different volumes of distribution, and the number and availability of brain mu-opioid receptors (MOR) may also change in women of reproductive age."

**Clinical implication for PalliCalc:** When the user selects "Female," the app should recommend oral formulations (which allow easier daily dose adjustments) over transdermal patches (which cannot be easily adjusted day-to-day).

---

## 10. Methadone Special Rules

### 10.1 Non-Linear Conversion (Ripamonti Method)

Methadone conversion is **non-linear** -- the morphine-to-methadone ratio increases as the morphine dose increases. Standard linear conversion is **DANGEROUS** and must never be used.

**Ripamonti Ratios (Morphine:Methadone):**

| Daily Oral Morphine Equivalent (mg) | Morphine:Methadone Ratio | Methadone Daily Dose Calculation |
|:---|:---|:---|
| 30-90 mg | **4:1** | Methadone = OME / 4 |
| 91-300 mg | **6:1** | Methadone = OME / 6 |
| > 300 mg | **8:1** | Methadone = OME / 8 |

**Alternative: Mercadante Method (more conservative):**

| Daily Oral Morphine Equivalent (mg) | Morphine:Methadone Ratio |
|:---|:---|
| 30-90 mg | **4:1** |
| 91-300 mg | **8:1** |
| > 300 mg | **12:1** |

**Alternative: Ayonrinde Method (most granular):**

| Daily Oral Morphine Equivalent (mg) | Morphine:Methadone Ratio |
|:---|:---|
| < 100 mg | **3:1** |
| 101-300 mg | **5:1** |
| 301-600 mg | **10:1** |
| 601-800 mg | **12:1** |
| 801-1000 mg | **15:1** |
| > 1000 mg | **20:1** |

### 10.2 PalliCalc Implementation

**Recommended approach:** Use the **Ripamonti method** as the primary conversion, as it is the most widely cited and aligns with the Semmelweis protocol.

**Algorithm:**
1. Calculate total OME from all current drugs.
2. Apply cross-tolerance reduction.
3. Determine which Ripamonti tier the reduced OME falls into.
4. Divide by the corresponding ratio.
5. **Additional safety reduction of 25-50%** is still recommended on top of the Ripamonti conversion.

### 10.3 Methadone Warnings

**Hard warning displayed whenever methadone is selected (source or target):**

**Hungarian:**
> "FIGYELMEZTETÉS: A metadon komplex farmakokinetikával rendelkezik. Felezési ideje 15-60 óra, ami kiszámíthatatlan felhalmozódáshoz vezethet. A standard lineáris átszámítás VESZÉLYES. Szakorvosi konzultáció és fekvőbeteg felügyelet javasolt az egyensúlyi állapot eléréséig (5-7 nap). QTc-intervallum monitorozása szükséges."

**English:**
> "WARNING: Methadone has complex pharmacokinetics. Its half-life is 15-60 hours, which can lead to unpredictable accumulation. Standard linear conversion is DANGEROUS. Specialist consultation and inpatient monitoring are recommended until steady state is reached (5-7 days). QTc interval monitoring is required."

---

## 11. Nalbuphine and Pethidine Exclusion Rules

### 11.1 Nalbuphine (Nalbufin)

**Pharmacological class:** Mixed agonist-antagonist (kappa-agonist / mu-antagonist)

**Why it is a WARNING drug:**
- Nalbuphine ANTAGONIZES the mu receptor. Administering it to a patient physically dependent on a pure mu-agonist (morphine, oxycodone, fentanyl) will **precipitate acute opioid withdrawal**.
- It has a ceiling effect for both analgesia and respiratory depression (~30mg).
- It is NOT suitable for opioid rotation in the traditional sense because it cannot substitute for a pure agonist.

**PalliCalc behavior when nalbuphine is selected:**

**As a SOURCE drug:**
- Allow entry (some patients may be on nalbuphine).
- Display warning: **"Nalbuphine kevert agonista-antagonista opioid. Ha a beteg korábban tiszta mu-agonistát kapott, az nalbuphine elvonási tüneteket válthat ki."** / **"Nalbuphine is a mixed agonist-antagonist opioid. If the patient was previously receiving a pure mu-agonist, nalbuphine may precipitate withdrawal symptoms."**
- **Do NOT convert nalbuphine to OME** using standard factors. There is no reliable equianalgesic conversion. The app should display a hard block: "Nalbuphine cannot be reliably converted using standard OME calculations. Specialist consultation is required."

**As a TARGET drug:**
- Display a **hard block** warning: **"Nalbuphine NEM alkalmazható opioid rotáció céljából tiszta mu-agonistáról! Elvonási tüneteket provokálhat!"** / **"Nalbuphine CANNOT be used for opioid rotation from a pure mu-agonist! It may precipitate withdrawal!"**
- **Block the calculation.** Do not output a target dose.

### 11.2 Pethidine (Petidin)

**Why it is a WARNING drug:**
- Metabolized to **norpethidine**, a neurotoxic metabolite that causes tremors, myoclonus, and seizures.
- Norpethidine accumulates in renal impairment (half-life 15-20h, vs. 3-6h for pethidine).
- Most modern guidelines **explicitly contraindicate** pethidine for chronic use or opioid rotation.
- Pethidine has serotonergic activity -- risk of serotonin syndrome with SSRIs/SNRIs.

**PalliCalc behavior when pethidine is selected:**

**As a SOURCE drug:**
- Allow entry (some patients may be receiving pethidine in hospital).
- Display warning: **"A petidin metabolitja (norpetidin) neurotoxikus. Krónikus használata és veseelégtelenségben történő alkalmazása ellenjavallt. Mielőbbi váltás más opioidra javasolt."** / **"Pethidine metabolite (norpethidine) is neurotoxic. Chronic use and use in renal impairment are contraindicated. Switching to another opioid is recommended as soon as possible."**
- Conversion factor: Pethidine oral approximately 0.1x morphine (i.e., 100mg pethidine ~ 10mg oral morphine). However, this conversion is unreliable and the app should flag this.

**As a TARGET drug:**
- Display a **hard block** warning: **"A petidin NEM ajánlott opioid rotáció célgyógyszereként! Neurotoxikus metabolitja (norpetidin) felhalmozódik, különösen veseelégtelenségben."** / **"Pethidine is NOT recommended as a target drug for opioid rotation! Its neurotoxic metabolite (norpethidine) accumulates, especially in renal impairment."**
- **Block the calculation.** Do not output a target dose.

---

## 12. Drug-Specific Clinical Notes

### 12.1 Morphine

- **Active metabolites:** M3G (neuroexcitatory -- myoclonus, hyperalgesia), M6G (analgesic but also sedating/respiratory depressant). Both accumulate in renal failure.
- **Oral bioavailability:** ~30% (significant first-pass metabolism).
- **Oral:parenteral ratio:** 3:1 (30mg oral = 10mg SC/IV).
- **MST Continus:** Must be swallowed whole; crushing destroys the retard mechanism and causes dose dumping.
- **Breakthrough:** Use Sevredol 10mg IR or morphine injection.

### 12.2 Oxycodone

- **Oral bioavailability:** ~60-75% (higher than morphine).
- **Active metabolite:** Oxymorphone (minor pathway via CYP2D6). Less clinically significant than morphine metabolites.
- **Clinical advantage:** Better tolerated in some patients who experience hallucinations or nausea with morphine.
- **Available formulations in Hungary:** Widest range of any oral opioid (5-80mg retard, 5-20mg IR).

### 12.3 Oxycodone + Naloxone (Targin, Oxynal, etc.)

- **CONTRAINDICATED in moderate-to-severe hepatic impairment.** The liver normally metabolizes oral naloxone via first-pass effect. If the liver fails, naloxone enters systemic circulation and antagonizes the analgesic effect of oxycodone, precipitating pain or withdrawal.
- **Conversion:** Use oxycodone factor only (the naloxone component does not contribute to analgesia).
- **Maximum dose:** The manufacturers typically recommend a maximum of 40/20mg q12h (80mg oxycodone/day) for the combination product. Above this, switch to pure oxycodone.
- **Warning text when Targin/Oxynal/Oxynador is selected:**
  - **Hungarian:** "Oxikodon+naloxon kombináció közepesen súlyos vagy súlyos májkárosodás esetén ellenjavallt! Ilyen esetben tiszta oxikodon vagy más opioid alkalmazandó."
  - **English:** "Oxycodone+naloxone combination is contraindicated in moderate-to-severe hepatic impairment! Use pure oxycodone or another opioid in such cases."

### 12.4 Fentanyl (All Routes)

- **Lipophilic:** Rapidly crosses blood-brain barrier. Highly fat-soluble -- relevant for BMI warnings.
- **No active metabolites:** Metabolized by CYP3A4 to norfentanyl (inactive). Safe in renal impairment.
- **Patch onset delay:** 12-24 hours to therapeutic levels. Previous opioid must be continued during transition. See Section 2.4.
- **Patch removal depot:** 12-24 hours of residual effect after patch removal. New opioid should be started cautiously.
- **Heat sensitivity:** External heat sources dramatically increase absorption. Fever >39C is a clinical concern.
- **SC/IV dosing:** Given in mcg but entered in mg in the calculator. Factor of 100 accounts for the mg-to-mg conversion with morphine.
- **Oral/mucosal forms:** Primarily for breakthrough cancer pain. Not for regular dosing conversion. Bioavailability varies: Actiq ~25%, Effentora ~65%, Abstral ~54%.
- **Patch change schedule:** Every 72 hours. Some patients metabolize faster and require 48-hour changes -- this should be clinician-determined, not calculator-driven.

### 12.5 Hydromorphone

- **5x more potent** than oral morphine.
- **Metabolite:** Hydromorphone-3-glucuronide (H3G) -- neuroexcitatory, similar to M3G. Accumulates in renal failure but less clinically significant than morphine metabolites.
- **Available formulations:** Limited in Hungary. Jurnista (once-daily OROS) and Palladone SR may require individual import.
- **Useful for patients** who cannot tolerate morphine or oxycodone due to side effects.

### 12.6 Tramadol

- **Weak opioid** with dual mechanism: mu-agonist + serotonin/norepinephrine reuptake inhibitor.
- **Ceiling effect:** Maximum 400mg/day. Above this, analgesia does not increase but side effects (seizures, serotonin syndrome) escalate dramatically.
- **Seizure risk:** Lower the threshold in patients with epilepsy or concurrent SSRI/SNRI use.
- **Serotonin syndrome risk:** When combined with SSRIs, SNRIs, MAOIs, or ondansetron.
- **CYP2D6 dependency:** Poor metabolizers get minimal analgesic effect; ultra-rapid metabolizers get excessive effect.
- **Not suitable for severe cancer pain:** Should be rotated to a strong opioid when tramadol ceiling is reached.

### 12.7 Dihydrocodeine

- **Weak opioid**, similar potency to codeine but better oral bioavailability.
- **Conversion:** Same as codeine (0.1x morphine).
- **Active metabolite:** Dihydromorphine (minor). Metabolites accumulate in renal failure.
- **Only 60mg retard** available in Hungary (DHC Continus).
- **Maximum daily dose:** 240mg (= 24mg oral morphine equivalent).

### 12.8 Methadone

- **Variable half-life:** 15-60 hours. Accumulation is unpredictable.
- **QTc prolongation:** Risk of Torsades de Pointes. ECG monitoring required.
- **NMDA receptor antagonism:** May be beneficial for neuropathic pain unresponsive to other opioids.
- **Non-linear conversion:** See Section 10.
- **Available in Hungary:** Metadon EP tablets (5, 10, 20, 40mg). Primarily classified under addiction medicine (N07BC02) but used off-label for pain.
- **Specialist-only drug** for opioid rotation. Not for routine use.

### 12.9 Codeine

- **Prodrug:** Requires CYP2D6 activation to morphine. ~10% of the population are poor metabolizers (no effect); ~2% are ultra-rapid metabolizers (toxicity risk).
- **Not included as a primary drug in PalliCalc** but the conversion factor (0.1) is included for completeness.
- **Contraindicated in renal failure** due to unpredictable metabolite accumulation.
- **Regulatory note:** Codeine-containing preparations in Hungary have restricted use in patients <18 years.

---

## 13. Conversion Verification Examples

These worked examples can serve as test cases for the implementation.

### Example 1: Morphine oral to Oxycodone oral

- Patient on MST Continus 60mg q12h = TDD 120mg oral morphine
- OME = 120 x 1.0 = 120 mg/day
- 25% cross-tolerance reduction: 120 x 0.75 = 90 mg OME
- Oxycodone TDD = 90 x 0.667 = 60 mg/day
- q12h dosing: 30mg morning + 30mg evening
- Available: Codoxy 20mg + 10mg = 30mg (2 tablets per dose)
- Breakthrough: 60 / 6 = 10mg oxycodone IR (Codoxy Rapid 10mg, 1 tablet)
- Max daily breakthrough: 10mg x 6 = 60mg

### Example 2: Fentanyl patch to Oxycodone oral

- Patient on Durogesic 75 mcg/hr patch
- OME = lookup(75) = midpoint of 180-225 = 202.5 mg/day
- 25% reduction: 202.5 x 0.75 = 151.9 mg OME
- Oxycodone TDD = 151.9 x 0.667 = 101.3 mg/day
- q12h: ideal 50.65mg per dose
- Rounding: Morning 50mg (40+10), Evening 50mg (40+10) = 100mg/day
- OR: Morning 40mg, Evening 60mg (40+20) = 100mg/day
- Breakthrough: 100 / 6 = 16.7mg -> round to nearest IR = 10mg or 20mg (clinician choice, suggest 10mg for safety)

### Example 3: Multiple drugs to fentanyl patch

- Patient on Tramadol 200mg oral q12h (TDD 400mg) + Oxycodone 10mg q12h (TDD 20mg)
- Tramadol OME: 400 x 0.1 = 40 mg/day
- Oxycodone OME: 20 x 1.5 = 30 mg/day
- Total OME: 40 + 30 = 70 mg/day
- 25% reduction: 70 x 0.75 = 52.5 mg OME
- Fentanyl patch target: reverse lookup of 52.5 -> between 12mcg/hr (37.5 midpoint) and 25mcg/hr (75 midpoint) -> interpolate -> ~17 mcg/hr
- Available patches: nearest combination = 12 mcg/hr (slightly underdosed; clinician may choose 25mcg/hr)
- Suggest: 12 mcg/hr patch (conservative) or 25 mcg/hr patch with note about reduced dose range
- Breakthrough: 52.5 / 6 = 8.75mg oral morphine -> round to Sevredol 10mg

### Example 4: Methadone conversion (high-dose morphine)

- Patient on MST Continus 200mg q12h = TDD 400mg oral morphine
- OME = 400 mg/day
- 25% reduction: 400 x 0.75 = 300 mg OME
- Ripamonti tier: 91-300mg -> ratio 6:1
- Methadone TDD = 300 / 6 = 50 mg/day
- Additional 25% safety reduction: 50 x 0.75 = 37.5 mg/day
- Rounded: Metadon EP 20mg morning + 20mg evening = 40mg/day (or 10+10+20 for tid dosing)
- **Mandatory specialist supervision warning displayed**

---

## 14. Complete OME Flow Summary

```
INPUT:
  For each current drug:
    1. Select drug + route (or brand name -> auto-detect drug+route)
    2. Enter dose per administration
    3. Select frequency OR enter asymmetric doses
    4. Calculate TDD:
       - Symmetric: TDD = dose x frequency
       - Asymmetric: TDD = sum of all individual doses
    5. Convert to OME:
       - Standard drugs: OME = TDD x factor_to_ome
       - Fentanyl patch: OME = lookup_table(mcg/hr)

  Sum all OMEs -> Total Current OME

PROCESSING:
  1. Apply cross-tolerance reduction: Reduced_OME = Total_OME x (1 - reduction%)
  2. Apply GFR-enforced minimum reduction (slider lock)

OUTPUT:
  1. If target is fentanyl patch:
     - Reverse lookup to get mcg/hr
     - Combine available patch sizes
     - Calculate breakthrough as OME/6 -> oral morphine dose
  2. If target is standard drug:
     - Target_TDD = Reduced_OME x factor_from_ome
     - Divide into doses per frequency
     - Round to available tablet sizes (asymmetric if needed)
     - Calculate breakthrough = Target_TDD / 6 -> round to available IR size
  3. If target is methadone:
     - Use Ripamonti non-linear conversion
     - Apply additional safety reduction

DISPLAY:
  - Target TDD (actual, after rounding)
  - Divided doses with tablet counts
  - Breakthrough single dose + max daily
  - All applicable warnings (GFR, BMI, gender, drug-specific)
```

---

## 15. Appendix: Source URLs

1. Scottish Palliative Care Guidelines -- Conversion Tables: https://www.rightdecisions.scot.nhs.uk/scottish-palliative-care-guidelines/medicines-information/choosing-and-changing-opioids-opiates-convertingswitching/opioidopiate-conversion-tables-switching-between-opioid-medicines/
2. Scottish Palliative Care Guidelines -- Fentanyl Patches: https://www.rightdecisions.scot.nhs.uk/scottish-palliative-care-guidelines/medicines-information/fentanyl-patches/
3. Eastern Palliative Care Victoria -- Opioid Conversion Workbook (Aug 2024): https://www.epcvic.org.au/uploads/778/64/Opioid-Conversion-Workbook-August-2024.pdf
4. eviQ Cancer Treatments Online -- Opioid Conversion Calculator (v3, Dec 2023): https://www.eviq.org.au/clinical-resources/eviq-calculators/3201-opioid-conversion-calculator
5. eviQ -- Conversion Factors Reference: https://www.eviq.org.au/additional-clinical-information/3344-conversion-factors-used-in-eviq-opioid-conver
6. PHARMINDEX Online Hungary: https://www.pharmindex-online.hu/
7. PHARMINDEX -- ATC N02AA01 (Morphine): https://www.pharmindex-online.hu/gyogyszerek/atc/N02AA01
8. PHARMINDEX -- ATC N02AA05 (Oxycodone): https://www.pharmindex-online.hu/gyogyszerek/atc/N02AA05
9. PHARMINDEX -- ATC N02AB03 (Fentanyl): https://www.pharmindex-online.hu/gyogyszerek/atc/N02AB03
10. PHARMINDEX -- ATC N02AX02 (Tramadol): https://www.pharmindex-online.hu/gyogyszerek/atc/N02AX02
11. PHARMINDEX -- ATC N02AA08 (Dihydrocodeine): https://www.pharmindex-online.hu/gyogyszerek/atc/N02AA08
12. PHARMINDEX -- ATC N07BC02 (Methadone): https://www.pharmindex-online.hu/gyogyszerek/atc/N07BC02
13. Ripamonti et al. (1998) -- Morphine to Methadone Conversion: https://pubmed.ncbi.nlm.nih.gov/9779694/
14. Review of Morphine to Methadone Methods: https://pmc.ncbi.nlm.nih.gov/articles/PMC3715153/
15. Semmelweis University Opioid Analysis (2025): Internal document (Dr. Niedermüller)
16. Opioid Utilization in Hungary: https://pmc.ncbi.nlm.nih.gov/articles/PMC9541344/
17. Safer Care Victoria -- Opioid Conversion: https://www.safercare.vic.gov.au/best-practice-improvement/clinical-guidance/palliative/opioid-conversion
18. WHO Opioid Conversion Tables: https://www.ncbi.nlm.nih.gov/books/NBK537482/

---

*This document was compiled on 2026-02-15 and cross-references the most current data available from the PHARMINDEX Hungary database, the Scottish Palliative Care Guidelines, eviQ (Australia), and the Semmelweis University Opioid Rotation Protocol. All conversion factors, drug availability data, and clinical recommendations should be periodically reviewed against updated source materials.*
