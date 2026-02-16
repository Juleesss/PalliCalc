# PalliCalc — Opioid Rotation Calculator

## Project Overview

PalliCalc is a **client-side-only opioid rotation calculator** for the Adult Palliative Mobile Team at Semmelweis University, Hungary. It converts one or more current opioid regimens into a target opioid dose using the **Oral Morphine Equivalent (OME)** model with safety reductions, GFR-based warnings, and smart dose rounding to available Hungarian tablet sizes.

**No backend, no data storage, no patient data.** Everything runs client-side.

## Key Documents (Read These First)

| Document | Purpose |
|---|---|
| `ultimate_PRD.md` | **The single source of truth** for the v2.0 reimplementation. Supersedes all previous PRDs. |
| `implementation_plan.md` | 8-phase implementation plan with critical path and deliverables |
| `clinical_data_reference.md` | Pharmacology ground truth: conversion factors, brand names, tablet sizes, GFR matrix, methadone rules |
| `frontend_specification.md` | Detailed UX spec: component architecture, responsive design, accessibility, PWA |
| `requirements_gap_analysis.md` | Traceability matrix, bug reports from v1, acceptance criteria, edge cases |
| `user_requirements.md` | Original user emails in Hungarian (ground truth requirements) |
| `Opioid Usage Analysis_ Semmelweis University.md` | Clinical context and background |

**Deprecated documents** (kept for reference only, superseded by `ultimate_PRD.md`):
- `PRD.md` — original PRD (v1)
- `prd_changes.md` — batch 2 changes (v1)

## Technology Stack (v2)

- **React 19** + **TypeScript** (strict mode)
- **Vite 7** (build tool)
- **Tailwind CSS v4** (styling, mobile-first)
- **Headless UI v2** (accessible Combobox, Switch)
- **vite-plugin-pwa** (offline service worker)
- **State:** `useReducer` + React Context (no Redux)
- **Deploy:** GitHub Pages via gh-pages

## Project Structure (v2)

```
frontend-v2/
  src/
    components/
      shared/          DrugCombobox, TappableChip, Card, NumberInput, InlineWarning
      calculator/      PatientParams, CurrentRegimen, TargetRegimen, Results
    lib/               Pure business logic (no React imports)
      types.ts         Type definitions
      conversions.ts   OME math engine
      drug-database.ts Drug definitions, brands, tablet sizes
      tablet-rounding.ts Smart rounding algorithm
      formatting.ts    Dosing string generation
      warnings.ts      Warning logic (bilingual)
      patch-calculator.ts Fentanyl patch logic
    i18n/
      hu.ts            Hungarian translations
      en.ts            English translations
      LanguageContext.tsx
    App.tsx
```

The old `frontend/` directory is kept as reference for the v1 implementation.

## Core Business Logic (OME Flow)

```
Current drug TDD → factor TO OME → sum all OMEs
  → apply % reduction (cross-tolerance + GFR lock)
  → factor FROM OME to target drug
  → smart round to available tablet sizes
  → generate practical dosing (tablet counts, asymmetric splits)
  → calculate breakthrough dose (TDD/6)
```

Special cases: fentanyl patches (lookup table, not linear), methadone (Ripamonti non-linear), nalbuphine/pethidine (blocked as target).

## Critical Requirements (Do NOT Get Wrong)

1. **GFR warning texts must be EXACT** — user provided specific Hungarian text twice. See `ultimate_PRD.md` §3.4.
2. **Dose rounding to Hungarian tablet sizes** — the #1 new feature. See `clinical_data_reference.md` §4-5.
3. **Fentanyl Sandoz disambiguation** — exists as BOTH patch ("tapasz") and injection ("injectio").
4. **12h labels are Reggel/Este** (Morning/Evening), NOT Reggel/Dél.
5. **OxyContin minimum dose is 10mg** in Hungary.
6. **Breakthrough = TDD/6** with max daily display and escalation warning.
7. **All brand names** must be present for all drugs (not just oxycodone and fentanyl).

## Python Package (ome_core)

We use **uv** to manage the Python side for prototyping and testing the OME/conversion logic in `ome_core/`. The frontend mirrors the validated Python logic in TypeScript. **uv is not used for the production frontend build.**

```bash
uv run pytest          # run tests
uv add <package>       # add dependency
```