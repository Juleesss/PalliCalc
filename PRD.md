# **Product Requirements Document (PRD)**

## **Product Name: PalliCalc \- Opioid Rotation Protocol for Palliative Mobile Teams**

**Target Audience:** Adult Palliative Mobile Team (Hungary)

**Architecture:** Lean Single-Page Application (SPA) / Client-side only (No Backend)

## **1\. Executive Summary**

The goal is to build a lean, fast, and completely offline-capable web application that assists palliative care professionals in calculating opioid rotations. The tool will convert single or multiple current opioid prescriptions into a single target opioid dose, utilizing the Oral Morphine Equivalent (OME) mathematical model. It must include built-in safety mechanisms for dose reduction and renal impairment (GFR).

## **2\. Core Technical Constraints**

* **No Backend / Zero Database:** All calculations must be performed client-side using JavaScript/TypeScript. No patient data is to be stored or transmitted. This ensures immediate GDPR compliance and zero infrastructure costs.  
* **Mobile-First UI:** The interface must be highly responsive and optimized for mobile devices (phones and tablets) used by field teams. Big, tappable buttons ("kattintással kiválasztható").  
* **Framework:** React, Vue, or Vanilla JS. Can be distributed as a single HTML file or a basic static site.

## **3\. User Flow & Features**

### **Step 1: Patient Safety Parameters**

* **GFR Input:** A numeric input field to capture the patient's Glomerular Filtration Rate (GFR).  
* **Safety Trigger:** If the user inputs a GFR \< 30 ml/min, the application must immediately display a prominent warning regarding the risk of opioid overdose and metabolite accumulation (specifically highlighting risks with Morphine and Pethidine, and suggesting Fentanyl/Sufentanil as safer alternatives).

### **Step 2: Current Opioid Regimen (Input)**

The user must be able to add one or multiple current opioids to calculate the total current baseline.

* **Drug Selection:** Dropdown/list to select the drug and formulation (e.g., Oral, SC/IV, Transdermal Patch).  
* **Dose Input:** Numeric input for the dose.  
  * *Rule:* No upper limit validation (no ceiling effect) for major opiates, allowing clinicians to input any required high dose.  
* **Dosing Frequency:** Dropdown to select the interval: 6-hour, 8-hour, 12-hour, 24-hour, or 72-hour (for patches).  
* **Automatic Daily Calculation:** Based on the dose and frequency, the system automatically calculates the Total Daily Dose (TDD).  
* **Asymmetrical Dosing Toggle:** A checkbox/prompt asking if the doses are identical throughout the day. If "No", the UI should expand to allow custom inputs for different times of day (e.g., Morning: 20mg, Evening: 40mg) and sum them for the TDD.  
* **Add Another Drug:** A button to add multiple concurrent opioids. The system will convert all of them into a single Total Current OME (Oral Morphine Equivalent) behind the scenes.

### **Step 3: Target Opioid & Rotation Settings (Output)**

* **Target Drug Selection:** User selects the desired new opioid and formulation. *Requirement: Must support switching from ANY drug to ANY drug.*  
* **Incomplete Cross-Tolerance Reduction:** A slider or numeric input allowing the clinician to apply a percentage-based safety reduction to the calculated target dose (typically 25% \- 50%).  
* **Final Output Calculation:** The system displays the new Target Daily Dose and suggests divided doses based on standard frequency (e.g., dividing the daily dose by 2 for 12-hour, or 6 for 4-hour rescue doses).

## **4\. Pharmacological Logic & Data Model**

The application will use a central "common currency" for calculations: **Oral Morphine Equivalent (OME)**.

* *Calculation Flow:* Current Drug TDD \-\> multiply by Conversion Factor TO OME \-\> sum all OMEs \-\> apply % Reduction \-\> multiply by Conversion Factor FROM OME to Target Drug.

**Data Dictionary (Based on Semmelweis / International Protocols):**

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

**Special Logic for Fentanyl Patches (72-hour):**

Fentanyl patches are measured in mcg/hr. The calculator must use a hardcoded lookup table or a specific multiplier for transdermal patches to OME/24h:

* 12 mcg/hr patch ≈ 30-45 mg OME/day  
* 25 mcg/hr patch ≈ 60-90 mg OME/day  
* 50 mcg/hr patch ≈ 120-150 mg OME/day

**Excluded/Warning Drugs:**

* *Methadone:* Complex variable half-life. The app should either exclude it or display a hard warning that standard linear conversion is dangerous and requires a specialist.  
* *Nalbuphine:* Add a tooltip warning about precipitating withdrawal if mixed with pure agonists.

## **5\. UI/UX Guidelines (Lean Approach)**

1. **Card-based Layout:** Use clear visual cards for "Current Regimen", "Patient Parameters", and "Target Regimen".  
2. **Color Coding:** Use Red/Orange for the GFR \< 30 warnings and cross-tolerance reduction fields to ensure clinical safety visibility.  
3. **Language:** UI must be in Hungarian natively (as per user context), it should also have a separate but accessible English version, though the underlying code variables can be in English.  
4. **No Logins:** The app opens immediately to the calculator to save time in urgent palliative scenarios.


## **6\. Out of Scope (To keep it MVP)**

* User authentication/login.  
* Saving patient histories or generating PDF reports (can be added later via local browser print/save if needed).  
* Inventory/stock management.