# **Product Requirements Document (PRD)**

## **Product Name: PalliCalc \- Opioid Rotation Protocol for Palliative Mobile Teams**

**Target Audience:** Adult Palliative Mobile Team (Hungary)

**Architecture:** Lean Single-Page Application (SPA) / Client-side only (No Backend)

## **1\. Executive Summary**

The goal is to build a lean, fast, and completely offline-capable web application that assists palliative care professionals in calculating opioid rotations. The tool will convert single or multiple current opioid prescriptions into a single target opioid dose, utilizing the Oral Morphine Equivalent (OME) mathematical model. It must include built-in safety mechanisms for dose reduction, renal impairment (GFR), BMI-based warnings, and gender-specific dosing considerations.

## **2\. Core Technical Constraints**

* **No Backend / Zero Database:** All calculations must be performed client-side using JavaScript/TypeScript. No patient data is to be stored or transmitted. This ensures immediate GDPR compliance and zero infrastructure costs.
* **Mobile-First UI:** The interface must be highly responsive and optimized for mobile devices (phones and tablets) used by field teams. Big, tappable buttons ("kattintással kiválasztható").
* **Framework:** React, Vue, or Vanilla JS. Can be distributed as a single HTML file or a basic static site.

## **3\. User Flow & Features**

### **Step 1: Patient Parameters (Top of Form)**

#### **BMI Input**

* **Selector:** Three-option selector — `< 19` (underweight) | `19–26` (normal) | `> 26` (overweight/obese).
* **BMI < 19 Warning:** "Caution: Lower tolerance and higher toxicity risk." Clinical rationale: Low fat stores prevent lipophilic opioid accumulation (fentanyl, methadone). Faster onset but higher plasma concentrations (small volume of distribution). Malnutrition may reduce hepatic metabolism. Risk of respiratory depression is higher.
* **BMI > 26 Warning:** "Dosing based on total body weight may lead to overdose. Base reduction on Ideal Body Weight (IBW)." Clinical rationale: Increased volume of distribution for lipophilic drugs. Longer half-life due to depot effect in fat tissue (delayed elimination). Sleep apnea and respiratory risks are higher.

#### **Gender Input**

* **Options:** Male | Female.
* **Female Warning:** "Dose requirements may fluctuate daily due to hormonal cycle (premenopause). Oral administration is recommended for flexibility." Clinical rationale: Estrogen/progesterone fluctuations affect the endogenous opioid system and mu-receptor availability.

### **Step 2: Current Opioid Regimen (Input)**

The user must be able to add one or multiple current opioids to calculate the total current baseline.

* **Drug Selection:** Dropdown/list to select the drug by **active ingredient or brand name**. Brand names from the Hungarian market are listed under each active ingredient (see §4.3 Brand Name Mappings). When a brand name is selected, the active ingredient and (where applicable) route are auto-populated.
* **Route Selection:** Dropdown to select the formulation (e.g., Oral, SC/IV, Transdermal Patch, Oral/Mucosal).
* **Dose Input:** Numeric input for the dose.
  * *Rule:* No upper limit validation (no ceiling effect) for major opiates, allowing clinicians to input any required high dose.
* **Dosing Frequency:** Dropdown to select the interval: 6-hour, 8-hour, 12-hour, 24-hour, or 72-hour (for patches).
* **Automatic Daily Calculation:** Based on the dose and frequency, the system automatically calculates the Total Daily Dose (TDD).
* **Asymmetrical Dosing Toggle:** A checkbox/prompt asking if the doses are identical throughout the day. If "No", the UI should expand to allow custom inputs for different times of day. **For 12-hour (q12h) frequency, labels must be "Morning / Evening" (not "Morning / Noon").**
* **Add Another Drug:** A button to add multiple concurrent opioids. The system will convert all of them into a single Total Current OME (Oral Morphine Equivalent) behind the scenes.

### **Step 3: Target Opioid & Rotation Settings (Output)**

* **Target Drug Selection:** User selects the desired new opioid and formulation (also searchable by brand name). *Requirement: Must support switching from ANY drug to ANY drug.*

#### **GFR Input (After Opioid Selection)**

* **Position:** GFR input is placed after the opioid selection section, before the cross-tolerance slider.
* **Numeric input field** to capture the patient's Glomerular Filtration Rate (GFR).
* **Safety Trigger (GFR < 30):** Display a prominent warning regarding the risk of severe side effects (respiratory depression, sedation, neurotoxicity).
* **GFR Drug-Specific Warnings:** When GFR < 30, display dynamic advice based on the target opioid:
  * Morphine / Codeine: "AVOID. Active metabolites accumulate (neurotoxicity/sedation)."
  * Oxycodone / Hydromorphone: "USE CAUTION. Reduce dose and frequency. Monitor closely."
  * Fentanyl: "PREFERRED. Safest choice in renal failure (no active metabolites)."
* **GFR < 10 General Warning:** "Suggest 50% dose reduction and slow titration."

#### **Cross-Tolerance Reduction Slider**

* **Range:** 0% – **70%** (max 70%).
* **Default:** 25%. Step: 5%.
* **GFR-based Slider Locking:**
  * GFR 10–30 ml/min: Slider cannot be set lower than **25%** reduction.
  * GFR < 10 ml/min: Slider cannot be set lower than **50%** reduction.

* **Final Output Calculation:** The system displays the new Target Daily Dose and suggests divided doses based on standard frequency.

#### **Fentanyl Patch Output**

* When the target drug is a fentanyl transdermal patch, the output must display a **combination of standard available patch sizes** to achieve the target dose.
* **Available sizes:** 12, 25, 50, 75, 100 mcg/hr.
* **Logic:** Combine patches to reach the calculated target dose (e.g., for 150 mcg/hr → "1× 100 mcg/hr + 1× 50 mcg/hr").

## **4\. Pharmacological Logic & Data Model**

The application will use a central "common currency" for calculations: **Oral Morphine Equivalent (OME)**.

* *Calculation Flow:* Current Drug TDD \-\> multiply by Conversion Factor TO OME \-\> sum all OMEs \-\> apply % Reduction \-\> multiply by Conversion Factor FROM OME to Target Drug.

### **4.1 Conversion Table (Based on Semmelweis / International Protocols)**

| Drug | Route | Factor TO Oral Morphine | Factor FROM Oral Morphine | Notes |
| :---- | :---- | :---- | :---- | :---- |
| **Morphine** | Oral | 1.0 | 1.0 | Reference Standard |
| **Morphine** | SC / IV | 3.0 | 0.333 | Parenteral is \~3x more potent |
| **Oxycodone** | Oral | 1.5 | 0.666 | \~1.5x more potent than Morphine |
| **Oxycodone** | SC / IV | 3.0 | 0.333 |  |
| **Hydromorphone** | Oral | 5.0 | 0.2 | 5x more potent |
| **Tramadol** | Oral/Inj | 0.1 | 10.0 | 100mg Tramadol \= 10mg Morphine |
| **Dihydrocodeine** | Oral | 0.1 | 10.0 | 100mg DHC \= 10mg Morphine |
| **Fentanyl** | SC / IV | 100.0 | 0.01 | Use standard mcg to mg conversions carefully |
| **Fentanyl** | Oral/Mucosal | 50.0 | 0.02 | Buccal/sublingual \~50% bioavailability of IV. Primarily for breakthrough pain. |

### **4.2 Special Logic for Fentanyl Patches (72-hour)**

Fentanyl patches are measured in mcg/hr. The calculator must use a hardcoded lookup table for transdermal patches to OME/24h:

* 12 mcg/hr patch ≈ 30-45 mg OME/day
* 25 mcg/hr patch ≈ 60-90 mg OME/day
* 50 mcg/hr patch ≈ 120-150 mg OME/day
* 75 mcg/hr patch ≈ 180-225 mg OME/day
* 100 mcg/hr patch ≈ 240-300 mg OME/day

When converting TO a fentanyl patch, the output must **combine standard available patch sizes** (12, 25, 50, 75, 100 mcg/hr) to achieve the calculated target, rather than suggesting a single arbitrary patch strength.

### **4.3 Brand Name Mappings (Hungarian Market)**

Users can select drugs by **active ingredient or brand name**. Brand names appear subtitled under the active ingredient in the dropdown.

**Oxycodone (oral):**
* OxyContin (retard filmtabletta)
* Codoxy (retard tabletta)
* Codoxy Rapid
* Reltebon (retard tabletta)
* Oxycodone Sandoz (kemény kapszula & tabletta)
* Oxycodone Vitabalans

**Oxycodone + Naloxone (oral) — uses same OME conversion as Oxycodone:**
* Targin (retard tabletta)
* Oxynal (retard tabletta)
* Oxynador
* Oxikodon-HCL/Naloxon-HCL Neuraxpharm

**Fentanyl Transdermal (patch):**
* Durogesic, Dolforin, Matrifen, Fentanyl Sandoz, Fentanyl-ratiopharm

**Fentanyl Oral/Mucosal:**
* Effentora (buccal), Abstral (sublingual), Actiq (lozenge)

**Fentanyl Injection (SC/IV):**
* Fentanyl-Richter, Fentanyl Kalceks, Fentanyl Sandoz

### **4.4 Excluded/Warning Drugs**

* *Methadone:* Complex variable half-life. The app should either exclude it or display a hard warning that standard linear conversion is dangerous and requires a specialist.
* *Nalbuphine:* Add a tooltip warning about precipitating withdrawal if mixed with pure agonists.

## **5\. UI/UX Guidelines (Lean Approach)**

1. **Card-based Layout:** Use clear visual cards for "Patient Parameters" (BMI + Gender, top), "Current Regimen" (middle), and "Target Regimen with GFR & Safety" (bottom).
2. **UI Order:** BMI & Gender at top → Opioid Selection → GFR (after opioid selection) → Cross-tolerance Slider → Results.
3. **Color Coding:** Use Red for GFR < 30 and drug-specific warnings. Use Orange for BMI and Gender warnings. Use Red/Orange for cross-tolerance reduction fields to ensure clinical safety visibility.
4. **Language:** UI must be in Hungarian natively (as per user context), it should also have a separate but accessible English version, though the underlying code variables can be in English.
5. **No Logins:** The app opens immediately to the calculator to save time in urgent palliative scenarios.

## **6\. Out of Scope (To keep it MVP)**

* User authentication/login.
* Saving patient histories or generating PDF reports (can be added later via local browser print/save if needed).
* Inventory/stock management.
