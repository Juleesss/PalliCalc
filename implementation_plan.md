# PalliCalc v2.0 — Implementation Plan

**Based on:** `ultimate_PRD.md`
**Deadline:** 2026-02-21 (Monday, 12:00)
**Available Time:** ~5 working days (Feb 15–21)
**Strategy:** Full reimplementation of frontend. Preserve validated conversion logic. Build from foundation up.

---

## Phase 0: Project Setup & Infrastructure (Day 1, ~2h)

### 0.1 Clean Slate
- [ ] Create a new `frontend-v2/` directory (keep old `frontend/` as reference)
- [ ] Initialize: `npm create vite@latest frontend-v2 -- --template react-ts`
- [ ] Install dependencies:
  ```
  npm install tailwindcss @tailwindcss/vite @headlessui/react
  npm install -D vite-plugin-pwa
  ```

### 0.2 Tailwind CSS Configuration
- [ ] Configure `vite.config.ts` with Tailwind plugin
- [ ] Define design tokens (colors: primary/danger/caution/success, border-radius, shadows)
- [ ] Set up mobile-first responsive utilities

### 0.3 PWA Setup
- [ ] Add `vite-plugin-pwa` to Vite config
- [ ] Create `manifest.json` (name: PalliCalc, theme_color: #2563eb, display: standalone)
- [ ] Create PWA icons (192x192, 512x512)
- [ ] Configure Workbox pre-caching for all static assets

### 0.4 Project Structure
- [ ] Create directory structure:
  ```
  src/
    components/
      shared/          (DrugCombobox, TappableChip, Card, NumberInput, InlineWarning)
      calculator/      (PatientParams, CurrentRegimen, TargetRegimen, Results)
    lib/               (pure business logic)
    i18n/              (translations)
  ```

**Deliverable:** Empty app shell loads, Tailwind works, PWA installable.

---

## Phase 1: Business Logic Layer (Day 1, ~3h)

### 1.1 Port & Enhance Core Conversion Engine
- [ ] Copy `conversions.ts` from v1 as starting point
- [ ] **Add codeine** to CONVERSION_TABLE: `{ drug: "codeine", route: "oral", factorToOme: 0.1, factorFromOme: 10.0 }`
- [ ] **Add hydromorphone SC/IV** to CONVERSION_TABLE: `{ drug: "hydromorphone", route: "sc/iv", factorToOme: 15.0, factorFromOme: 0.067 }`
- [ ] Verify all existing conversion factors match `clinical_data_reference.md` §1.2
- [ ] Keep fentanyl patch lookup table unchanged (validated)
- [ ] Keep `combinePatchSizes()` greedy algorithm unchanged (validated)

### 1.2 Create Drug Database (`drug-database.ts`)
- [ ] Define `DrugDefinition` interface with: id, routes, unit, brands[], availableTabletSizes
- [ ] Populate ALL drugs from `clinical_data_reference.md` §3:
  - Morphine (brands: MST Continus, Sevredol, Morphine Kalceks)
  - Oxycodone (brands: OxyContin, Codoxy, Codoxy Rapid, Reltebon, Sandoz, Vitabalans)
  - Oxycodone+Naloxone (brands: Targin, Oxynal, Oxynador, Neuraxpharm)
  - Fentanyl TDT (brands: Durogesic, Dolforin, Matrifen, Fentanyl Sandoz MAT, Fentanyl-ratiopharm)
  - Fentanyl Oral (brands: Effentora, Abstral, Actiq)
  - Fentanyl Injection (brands: Fentanyl Kalceks, Fentanyl-Richter, Fentanyl Sandoz injectio)
  - Hydromorphone (brands: Jurnista, Palladone)
  - Tramadol (brands: Contramal, Adamon, Ralgen, Tramadol AL, etc.)
  - Dihydrocodeine (brands: DHC Continus)
  - Codeine (NEW)
- [ ] Populate `availableTabletSizes` for each drug/route from `clinical_data_reference.md` §4
- [ ] Ensure "Fentanyl Sandoz" has TWO distinct entries with different forms ("tapasz" vs "injectio")

### 1.3 Create Tablet Rounding Engine (`tablet-rounding.ts`)
- [ ] Implement `roundToTablets(targetMg, availableSizes, direction: 'up'|'down')`
- [ ] Implement `tabletBreakdown(totalMg, sizes)` — returns array of {mg, count}
- [ ] Implement `distributeToTablets(targetTDD, frequency, sizes)`:
  - Calculate ideal per-dose
  - Try symmetric rounding first
  - If error > 10%, distribute asymmetrically (round-down + round-up across doses)
  - Return array of `{ label, totalMg, tablets: [{mg, count}] }`
- [ ] Implement minimum dose validation (warn if below minimum available)

### 1.4 Create Formatting Engine (`formatting.ts`)
- [ ] `formatTabletBreakdown(tablets, lang)` → "2× 20mg + 1× 10mg Codoxy retard"
- [ ] `formatDoseSchedule(doses, frequency, drug, lang)` → structured display data
- [ ] `formatPatchCombination(patches, lang)` → "1× 100 mcg/óra + 1× 50 mcg/óra"

### 1.5 Create Warnings Module (`warnings.ts`)
- [ ] Move all warning logic out of `conversions.ts`
- [ ] All warning texts as translation keys (no hardcoded English)
- [ ] GFR warning functions return translation keys
- [ ] Drug-specific GFR matrix
- [ ] Methadone hard warning (block calculation, show Ripamonti table)
- [ ] Nalbuphine hard block (cannot be target drug for rotation)
- [ ] Pethidine hard block as target
- [ ] Tramadol max dose warning (> 400mg/day)
- [ ] Minimum dose warnings

### 1.6 Enhanced Types (`types.ts`)
- [ ] Add `TabletCount: { mg: number; count: number }`
- [ ] Add `DoseDistribution: { label: string; totalMg: number; tablets: TabletCount[] }`
- [ ] Extend `TargetResult` with:
  - `practicalDoses: DoseDistribution[]`
  - `actualTDD: number` (after rounding)
  - `roundingDeltaPct: number`
  - `breakthroughSingleDose: number`
  - `breakthroughMaxDaily: number`
  - `breakthroughTablets: TabletCount[]`

**Deliverable:** All business logic functions work, tested with console/unit tests.

---

## Phase 2: i18n System (Day 1-2, ~1h)

### 2.1 Split Translations
- [ ] Create `i18n/hu.ts` — all Hungarian translations
- [ ] Create `i18n/en.ts` — all English translations
- [ ] Fix GFR warning texts to EXACT user-specified text:
  - `gfr.warning.below30` → "Nagy az opioid túladagolás és metabolit-felhalmozódás kockázata, ami súlyos mellékhatásokhoz vezethet! 25-50%-os dóziscsökkentés javasolt a rotációkor!"
  - `gfr.warning.below10` → "...Legalább 50%-os dóziscsökkentés javasolt a rotációkor!"
- [ ] Add ALL new translation keys (breakthrough, tablet rounding notes, codeine, etc.)

### 2.2 Enhanced t() Function
- [ ] Add interpolation support: `t("key", { dose: 50, count: 5 })` → replaces `{dose}`, `{count}`
- [ ] Keep LanguageContext provider pattern
- [ ] Store language preference in localStorage

**Deliverable:** Complete bilingual translation file, interpolation works.

---

## Phase 3: Shared UI Components (Day 2, ~3h)

### 3.1 DrugCombobox (Headless UI Combobox)
- [ ] Searchable text input with dropdown
- [ ] Accent-insensitive filtering (á→a, é→e, ö→o, ü→u)
- [ ] Grouped display: active ingredient header → brands indented
- [ ] On mobile (< 640px): render as bottom sheet
- [ ] On desktop: standard dropdown below input
- [ ] Selection sets both drug AND route (if brand has routeHint)
- [ ] Full keyboard navigation + ARIA

### 3.2 TappableChip & TappableChipGroup
- [ ] Pill-shaped buttons (48px height, 64px min-width)
- [ ] Radio-group behavior for single selection
- [ ] `role="radiogroup"` / `role="radio"` + `aria-checked`
- [ ] Selected: blue fill. Unselected: white/gray border

### 3.3 Card Component
- [ ] White background, rounded corners, subtle shadow
- [ ] Responsive padding: 16px mobile, 24px tablet+
- [ ] Optional title prop

### 3.4 NumberInput Component
- [ ] `inputMode="decimal"` (mobile numeric keyboard)
- [ ] Unit label as suffix badge inside input
- [ ] Comma → period conversion (Hungarian decimal)
- [ ] Large font (20px)

### 3.5 InlineWarning Component
- [ ] Accepts variant: 'danger' | 'caution' | 'preferred' | 'info'
- [ ] Icon + text layout
- [ ] Color-coded per variant
- [ ] `role="alert"` for dynamic appearance

**Deliverable:** All shared components render, storybook-style test page.

---

## Phase 4: Calculator State Management (Day 2, ~1h)

### 4.1 CalculatorProvider (useReducer)
- [ ] Define `CalculatorState` interface
- [ ] Define all `CalculatorAction` types
- [ ] Implement reducer with actions: SET_BMI, SET_GENDER, ADD_DRUG, REMOVE_DRUG, UPDATE_DRUG, SET_TARGET_DRUG, SET_TARGET_ROUTE, SET_TARGET_FREQUENCY, SET_GFR, SET_REDUCTION, CALCULATE, RESET
- [ ] GFR → slider lock enforcement in reducer
- [ ] Expose via Context + `useCalculator()` hook

**Deliverable:** State management works, no prop drilling needed.

---

## Phase 5: Page Components (Day 2-3, ~4h)

### 5.1 Header + Footer
- [ ] Header: "PalliCalc" title + "Opioid Rotációs Kalkulátor" subtitle + [HU][EN] toggle
- [ ] Footer: disclaimer text

### 5.2 PatientParametersCard
- [ ] BmiSelector: 3 TappableChips with inline warnings
- [ ] GenderSelector: 2 TappableChips with inline warning

### 5.3 CurrentRegimenCard
- [ ] DrugEntry component (repeatable):
  - DrugCombobox → RouteSelector (chips) → FrequencySelector (chips) → DoseInputGroup
  - AsymmetricToggle (Headless UI Switch)
  - Per-time-of-day dose inputs with correct labels
- [ ] AddDrugButton
- [ ] Remove button per entry (when > 1)
- [ ] RunningOmeTotal: real-time OME calculation, debounced display
  - Shows per-drug breakdown: "(Morfin oral: 180 + Oxikodon oral: 90)"

### 5.4 TargetRegimenCard
- [ ] DrugCombobox (target drug)
- [ ] RouteSelector (chips)
- [ ] FrequencySelector (chips) — hidden for patches
- [ ] GfrInput with:
  - GfrWarningBanner (GFR < 30 / < 10)
  - GfrDrugAdvice (dynamic drug-specific text based on target selection)
- [ ] ReductionSlider:
  - Range 0-70%, step 5%, default 25%
  - Dynamic min from GFR
  - Lock note when min > 0
  - Large 28px thumb
- [ ] CalculateButton (full-width, disabled until valid)

### 5.5 ResultsCard (THE MOST IMPORTANT CARD)
- [ ] OmeSummary: total OME + reduced OME (secondary text)
- [ ] Target TDD (primary, large, bold)
- [ ] PracticalDosingTable (NEW):
  - Time-of-day labels + mg per dose + tablet breakdown
  - Total tablet count per day
  - Rounding delta note
  - "Számított: X mg → Kerekítve: Y mg (±Z%)"
- [ ] BreakthroughDoseDisplay (ENHANCED):
  - Single dose + tablet breakdown
  - Max daily total
  - Escalation warning: "Ha ennél több szükséges, az alap dózis emelendő!"
- [ ] PatchCombinationDisplay:
  - Visual patch cards with size labels
  - Total mcg/hr + 72h change note
- [ ] WarningSummary:
  - All warnings aggregated, color-coded
  - Red for danger, orange for caution, green for preferred

**Deliverable:** Full calculator UI functional end-to-end.

---

## Phase 6: Integration & Bug Fixes (Day 3-4, ~3h)

### 6.1 Wire Everything Together
- [ ] App.tsx renders Header → CalculatorProvider → all cards → Footer
- [ ] Calculate button triggers full pipeline: inputs → OME → reduce → target → round → display
- [ ] Auto-scroll to results on calculation

### 6.2 Fix All Known Bugs from v1
- [ ] GFR warning texts: exact Hungarian text (BUG-001, BUG-002)
- [ ] Fentanyl brand recognition: no more setTimeout race condition (BUG-003)
- [ ] OxyContin 10mg minimum (BUG-007)
- [ ] Breakthrough max + escalation (BUG-006)

### 6.3 Edge Case Handling
- [ ] Empty/zero dose inputs → skip in calculation
- [ ] Very high doses → no ceiling, no crash
- [ ] Very low doses → minimum dose warnings
- [ ] Fentanyl patch extrapolation above 100mcg/hr table
- [ ] Multiple source drugs → correct OME summing
- [ ] Same drug different routes (morphine SC → morphine oral)

**Deliverable:** All acceptance criteria from `requirements_gap_analysis.md` §8 pass.

---

## Phase 7: Testing & Verification (Day 4, ~3h)

### 7.1 Conversion Accuracy Tests
- [ ] Test Case 1: Morphine oral 120mg/day → Oxycodone oral (25% reduction) = 60mg/day
- [ ] Test Case 2: Fentanyl 75mcg/hr patch → Oxycodone oral (25% reduction) ≈ 101mg/day
- [ ] Test Case 3: Tramadol 400mg + Oxycodone 20mg → Fentanyl patch = 70mg OME → ~17mcg/hr
- [ ] Test Case 4: Morphine 360mg/day → Fentanyl patch (25% reduction) = 270mg OME → 100mcg/hr
- [ ] See `clinical_data_reference.md` §13 for all verification examples

### 7.2 Tablet Rounding Tests
- [ ] 108.5mg oxycodone q12h → morning 50mg + evening 60mg
- [ ] 73mg oxycodone q12h → morning 30mg + evening 40mg (or 40+40)
- [ ] 5mg oxycodone → OxyContin minimum 10mg warning

### 7.3 Warning Text Tests
- [ ] GFR=25 → exact Hungarian text with "25-50%-os dóziscsökkentés"
- [ ] GFR=5 → exact Hungarian text with "Legalább 50%-os dóziscsökkentés"
- [ ] GFR=25 + morphine target → "KERÜLENDŐ!"
- [ ] GFR=25 + fentanyl target → "BIZTONSÁGOSABB ALTERNATÍVA!"

### 7.4 Brand Name Tests
- [ ] Select "Durogesic" → drug=fentanyl, route=patch
- [ ] Select "Effentora" → drug=fentanyl, route=oral/mucosal
- [ ] Select "Fentanyl Sandoz (tapasz)" → route=patch
- [ ] Select "Fentanyl Sandoz (injectio)" → route=sc/iv
- [ ] Select "Targin" → drug=oxycodone, route=oral, naloxoneCombo=true

### 7.5 UI/UX Testing
- [ ] Mobile responsive: test on 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
- [ ] Touch targets: all buttons/chips ≥ 48px
- [ ] Language toggle: switch HU↔EN, verify all text changes
- [ ] Keyboard navigation: tab through all fields, enter to select
- [ ] Slider: drag works, GFR lock works, value displays correctly

### 7.6 PWA Testing
- [ ] Service worker registers
- [ ] App works offline (disconnect network, reload)
- [ ] "Add to Home Screen" works on Android Chrome
- [ ] Manifest name and icons correct

**Deliverable:** All tests pass, all acceptance criteria verified.

---

## Phase 8: Polish & Deploy (Day 4-5, ~2h)

### 8.1 Visual Polish
- [ ] Consistent spacing and typography
- [ ] Smooth transitions for warning appearance/disappearance (150ms ease)
- [ ] Calculate button animation on press
- [ ] Results card subtle slide-in

### 8.2 Final Checks
- [ ] Lighthouse audit: Performance > 95, Accessibility > 95, PWA passing
- [ ] Cross-browser: Chrome, Safari, Firefox (mobile + desktop)
- [ ] Hungarian diacritical marks render correctly (á, é, í, ó, ö, ő, ú, ü, ű)
- [ ] Disclaimer present and readable
- [ ] No console errors or warnings

### 8.3 Deploy
- [ ] Update `vite.config.ts` base path for GitHub Pages
- [ ] Build: `npm run build`
- [ ] Deploy: `npm run deploy` (gh-pages)
- [ ] Verify live site works
- [ ] Verify PWA installable from live URL

**Deliverable:** Live, deployed, working application.

---

## Summary Timeline

| Day | Phase | Hours | Deliverable |
|:----|:------|:------|:------------|
| Day 1 (Feb 15-16) | Phase 0 + Phase 1 | ~5h | Project setup + all business logic |
| Day 2 (Feb 17) | Phase 2 + Phase 3 + Phase 4 | ~5h | i18n + shared components + state |
| Day 3 (Feb 18) | Phase 5 | ~4h | All page components wired |
| Day 3-4 (Feb 18-19) | Phase 6 | ~3h | Integration + bug fixes |
| Day 4 (Feb 19-20) | Phase 7 | ~3h | Full testing suite |
| Day 5 (Feb 20-21) | Phase 8 | ~2h | Polish + deploy |
| **Total** | | **~22h** | |

---

## Critical Path (Blocking Dependencies)

```
Phase 0 (setup)
  └── Phase 1.1 (conversion engine)
  └── Phase 1.2 (drug database) ──┐
  └── Phase 1.3 (tablet rounding) ─┤
  └── Phase 2 (i18n)               │
                                    ├── Phase 5.5 (ResultsCard)
Phase 3 (shared components) ───────┤
  └── Phase 4 (state management)   │
    └── Phase 5.1-5.4 (page cards) ┘
      └── Phase 6 (integration)
        └── Phase 7 (testing)
          └── Phase 8 (deploy)
```

**The critical path runs through:** Drug database → Tablet rounding → ResultsCard (PracticalDosingTable). This is the #1 new feature and must be implemented correctly.

---

## Risk Mitigation

| Risk | Mitigation |
|:-----|:-----------|
| Hungarian tablet sizes not verified | Use data from `clinical_data_reference.md` §4 (researched from PHARMINDEX). Flag uncertain data with "[verify]" comment. |
| Headless UI Combobox bottom-sheet on mobile | Implement as custom portal-based overlay if Headless UI doesn't natively support bottom-sheet pattern. Fallback: styled dropdown. |
| Tailwind CSS learning curve | Use Tailwind docs extensively. Stick to basic utilities. Don't over-customize. |
| Tight deadline (5 days) | Phase 1 (business logic) is the foundation — prioritize correctness here even if UI polish is reduced. A correct calculator with basic UI beats a beautiful calculator with wrong doses. |
| Brand name data gaps | Include all brands from user emails as definitive list. Mark additional brands from PHARMINDEX as "supplementary". |

---

*This plan is designed to be executed sequentially. Each phase has clear deliverables that can be verified independently. The most critical new feature (smart dose rounding + practical dosing output) is addressed in Phase 1.3 (logic) and Phase 5.5 (UI), both of which are on the critical path.*
