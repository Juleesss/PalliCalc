# PalliCalc - Opioid Rotation Calculator

A lean, mobile-first, offline-capable web application that assists palliative care professionals in calculating opioid rotations using the Oral Morphine Equivalent (OME) model.

## Features

- Convert one or more current opioid regimens to a target opioid dose
- Support for asymmetrical dosing, fentanyl patches, and multi-drug regimens
- GFR-based safety warnings and drug-specific cautions (methadone, nalbuphine)
- Incomplete cross-tolerance dose reduction (25-50%)
- Hungarian/English bilingual interface
- Fully client-side — no backend, no data storage

## Frontend (React + TypeScript + Vite)

```bash
cd frontend
npm install
npm run dev     # development server
npm run build   # production build → frontend/dist/
```

## Python Logic Package (ome_core)

The `ome_core/` directory contains a Python package managed by **uv** that implements and tests the pharmacological conversion logic. The frontend TypeScript mirrors this validated logic.

```bash
cd ome_core
uv run pytest        # run all tests
uv run pytest -v     # verbose output
```

### Key modules

- `ome_core/src/ome_core/conversions.py` — conversion factors, TDD calculation, OME pipeline, GFR warnings
- `ome_core/tests/test_conversions.py` — 40 tests covering all conversion paths and edge cases

## Project Structure

```
OPIOID_CALCULATOR/
├── frontend/           # React + Vite SPA
│   ├── src/
│   │   ├── lib/        # TypeScript calculation engine
│   │   ├── components/ # React UI components
│   │   └── i18n/       # Hungarian/English translations
│   └── dist/           # Production build output
├── ome_core/           # Python package (uv-managed)
│   ├── src/ome_core/   # Conversion logic
│   └── tests/          # pytest test suite
├── PRD.md              # Product requirements
└── README.md
```
