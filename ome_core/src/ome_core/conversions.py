"""
OME (Oral Morphine Equivalent) conversion engine.

All conversion factors are based on the Semmelweis University Opioid Rotation
Protocol and international palliative care guidelines.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ConversionEntry:
    drug: str
    route: str
    factor_to_ome: float
    factor_from_ome: float
    notes: str = ""


@dataclass(frozen=True)
class FentanylPatchEntry:
    mcg_per_hr: int
    ome_low: float
    ome_high: float

    @property
    def ome_midpoint(self) -> float:
        return (self.ome_low + self.ome_high) / 2

    @property
    def breakthrough_low(self) -> float:
        return self.ome_low / 6

    @property
    def breakthrough_high(self) -> float:
        return self.ome_high / 6


@dataclass
class OpioidInput:
    drug: str
    route: str
    doses: List[float]  # individual doses per administration
    frequency: int  # number of administrations per day (e.g. 4 for q6h)
    asymmetrical: bool = False


@dataclass
class TargetResult:
    drug: str
    route: str
    total_daily_dose: float
    divided_doses: List[float]
    frequency: int
    breakthrough_dose: Optional[float]
    warnings: List[str]


@dataclass
class PatchCombination:
    patches: List[Tuple[int, int]]  # (mcg_per_hr, count)
    total_mcg_per_hr: int


# ---------------------------------------------------------------------------
# Conversion table (PRD §4)
# ---------------------------------------------------------------------------

CONVERSION_TABLE: list[ConversionEntry] = [
    ConversionEntry("morphine", "oral", 1.0, 1.0, "Reference standard"),
    ConversionEntry("morphine", "sc/iv", 3.0, 0.333, "Parenteral ~3x more potent"),
    ConversionEntry("oxycodone", "oral", 1.5, 0.666, "~1.5x more potent than morphine"),
    ConversionEntry("oxycodone", "sc/iv", 3.0, 0.333, "SC/IV oxycodone highly potent"),
    ConversionEntry("hydromorphone", "oral", 5.0, 0.2, "5x more potent"),
    ConversionEntry("tramadol", "oral", 0.1, 10.0, "100mg tramadol = 10mg morphine"),
    ConversionEntry("tramadol", "iv", 0.1, 10.0, "100mg tramadol = 10mg morphine"),
    ConversionEntry("dihydrocodeine", "oral", 0.1, 10.0, "100mg DHC = 10mg morphine"),
    ConversionEntry("fentanyl", "sc/iv", 100.0, 0.01, "Use mcg to mg carefully"),
    ConversionEntry("fentanyl", "oral/mucosal", 50.0, 0.02,
                     "Buccal/sublingual ~50% bioavailability of IV. Primarily for breakthrough pain."),
    ConversionEntry("fentanyl", "patch", 0.0, 0.0, "Use patch lookup table"),
]

FENTANYL_PATCH_TABLE: list[FentanylPatchEntry] = [
    FentanylPatchEntry(12, 30, 45),
    FentanylPatchEntry(25, 60, 90),
    FentanylPatchEntry(50, 120, 150),
    FentanylPatchEntry(75, 180, 225),
    FentanylPatchEntry(100, 240, 300),
]

AVAILABLE_PATCH_SIZES = [100, 75, 50, 25, 12]

# Drugs that carry special warnings
WARNING_DRUGS = {
    "methadone": (
        "Methadone has a complex variable half-life (15-60h). "
        "Standard linear conversion is dangerous. Specialist consultation required."
    ),
    "nalbuphine": (
        "Nalbuphine is a mixed agonist-antagonist. It can precipitate acute "
        "withdrawal in patients dependent on pure mu-agonists (e.g. fentanyl, morphine)."
    ),
    "pethidine": (
        "Pethidine metabolite (norpethidine) is neurotoxic. "
        "Contraindicated in renal impairment. Avoid for chronic use."
    ),
}

# GFR < 30 safety data
GFR_DRUG_RISK = {
    "morphine": "avoid",
    "pethidine": "contraindicated",
    "codeine": "contraindicated",
    "dihydrocodeine": "contraindicated",
    "oxycodone": "caution",
    "hydromorphone": "caution",
    "tramadol": "caution",
    "fentanyl": "preferred",
    "sufentanil": "preferred",
    "methadone": "preferred",
}


# ---------------------------------------------------------------------------
# Lookup helpers
# ---------------------------------------------------------------------------

def _find_entry(drug: str, route: str) -> ConversionEntry:
    drug_l = drug.lower()
    route_l = route.lower()
    for entry in CONVERSION_TABLE:
        if entry.drug == drug_l and entry.route == route_l:
            return entry
    raise ValueError(f"No conversion entry for {drug} ({route})")


# ---------------------------------------------------------------------------
# Core conversion functions
# ---------------------------------------------------------------------------

def calculate_tdd(opioid: OpioidInput) -> float:
    """Calculate Total Daily Dose from an OpioidInput."""
    if opioid.asymmetrical:
        return sum(opioid.doses)
    else:
        if not opioid.doses:
            return 0.0
        return opioid.doses[0] * opioid.frequency


def drug_dose_to_ome(drug: str, route: str, tdd: float) -> float:
    """Convert a drug's TDD to Oral Morphine Equivalent (mg/day)."""
    entry = _find_entry(drug, route)
    if entry.drug == "fentanyl" and entry.route == "patch":
        raise ValueError("Use fentanyl_patch_to_ome() for transdermal fentanyl")
    return tdd * entry.factor_to_ome


def fentanyl_patch_to_ome(mcg_per_hr: float) -> float:
    """Convert fentanyl patch strength (mcg/hr) to OME/day using the lookup table."""
    table = sorted(FENTANYL_PATCH_TABLE, key=lambda e: e.mcg_per_hr)

    for entry in table:
        if entry.mcg_per_hr == mcg_per_hr:
            return entry.ome_midpoint

    if mcg_per_hr < table[0].mcg_per_hr:
        ratio = mcg_per_hr / table[0].mcg_per_hr
        return table[0].ome_midpoint * ratio

    if mcg_per_hr > table[-1].mcg_per_hr:
        prev, last = table[-2], table[-1]
        slope = (last.ome_midpoint - prev.ome_midpoint) / (last.mcg_per_hr - prev.mcg_per_hr)
        return last.ome_midpoint + slope * (mcg_per_hr - last.mcg_per_hr)

    for i in range(len(table) - 1):
        lo, hi = table[i], table[i + 1]
        if lo.mcg_per_hr < mcg_per_hr < hi.mcg_per_hr:
            t = (mcg_per_hr - lo.mcg_per_hr) / (hi.mcg_per_hr - lo.mcg_per_hr)
            return lo.ome_midpoint + t * (hi.ome_midpoint - lo.ome_midpoint)

    raise ValueError(f"Could not convert fentanyl patch {mcg_per_hr} mcg/hr")


def ome_to_drug_dose(drug: str, route: str, ome: float) -> float:
    """Convert OME (mg/day) to a target drug's TDD."""
    entry = _find_entry(drug, route)
    return ome * entry.factor_from_ome


def sum_omes(omes: List[float]) -> float:
    """Sum multiple OME values into a total current OME."""
    return sum(omes)


def apply_reduction(ome: float, reduction_pct: float) -> float:
    """Apply incomplete cross-tolerance dose reduction (0-100%)."""
    if not 0 <= reduction_pct <= 100:
        raise ValueError("Reduction percentage must be between 0 and 100")
    return ome * (1 - reduction_pct / 100)


def divide_daily_dose(tdd: float, frequency: int) -> list[float]:
    """Divide a total daily dose into equal administrations."""
    if frequency <= 0:
        raise ValueError("Frequency must be positive")
    single = round(tdd / frequency, 2)
    return [single] * frequency


# ---------------------------------------------------------------------------
# GFR-based slider minimum
# ---------------------------------------------------------------------------

def get_gfr_slider_min(gfr: Optional[float]) -> int:
    """Return the minimum allowed reduction percentage based on GFR."""
    if gfr is None:
        return 0
    if gfr < 10:
        return 50
    if gfr < 30:
        return 25
    return 0


# ---------------------------------------------------------------------------
# Fentanyl patch combination
# ---------------------------------------------------------------------------

def ome_to_target_mcg_per_hr(ome: float) -> int:
    """Convert OME/day to target mcg/hr using reverse interpolation."""
    table = sorted(FENTANYL_PATCH_TABLE, key=lambda e: e.mcg_per_hr)

    if ome <= 0:
        return 0

    if ome <= table[0].ome_midpoint:
        return round(table[0].mcg_per_hr * ome / table[0].ome_midpoint)

    if ome >= table[-1].ome_midpoint:
        prev, last = table[-2], table[-1]
        slope = (last.mcg_per_hr - prev.mcg_per_hr) / (last.ome_midpoint - prev.ome_midpoint)
        return round(last.mcg_per_hr + slope * (ome - last.ome_midpoint))

    for i in range(len(table) - 1):
        lo, hi = table[i], table[i + 1]
        if lo.ome_midpoint <= ome <= hi.ome_midpoint:
            frac = (ome - lo.ome_midpoint) / (hi.ome_midpoint - lo.ome_midpoint)
            return round(lo.mcg_per_hr + frac * (hi.mcg_per_hr - lo.mcg_per_hr))

    return round(ome / 2.7)


def combine_patch_sizes(target_mcg_per_hr: int) -> PatchCombination:
    """Combine standard patch sizes to reach target mcg/hr (greedy algorithm)."""
    patches: List[Tuple[int, int]] = []
    remaining = target_mcg_per_hr

    for size in AVAILABLE_PATCH_SIZES:
        if remaining >= size:
            count = remaining // size
            patches.append((size, count))
            remaining -= count * size

    if remaining >= 6:
        patches.append((12, 1))

    total = sum(s * c for s, c in patches)
    return PatchCombination(patches=patches, total_mcg_per_hr=total)


def ome_to_fentanyl_patch(ome: float) -> PatchCombination:
    """Find the best fentanyl patch combination for a given OME/day."""
    target_mcg = ome_to_target_mcg_per_hr(ome)
    return combine_patch_sizes(target_mcg)


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------

def compute_target_regimen(
    inputs: List[OpioidInput],
    target_drug: str,
    target_route: str,
    target_frequency: int,
    reduction_pct: float,
    gfr: Optional[float] = None,
) -> TargetResult:
    """Full pipeline: multiple current drugs -> target regimen."""
    warnings: list[str] = []

    if gfr is not None:
        warnings.extend(get_gfr_warnings(gfr))

    ome_values: list[float] = []
    for inp in inputs:
        warnings.extend(get_drug_warnings(inp.drug))
        tdd = calculate_tdd(inp)

        if inp.drug.lower() == "fentanyl" and inp.route.lower() == "patch":
            ome = fentanyl_patch_to_ome(inp.doses[0])
        else:
            ome = drug_dose_to_ome(inp.drug, inp.route, tdd)

        ome_values.append(ome)

    total_ome = sum_omes(ome_values)
    reduced_ome = apply_reduction(total_ome, reduction_pct)

    warnings.extend(get_drug_warnings(target_drug))

    if target_drug.lower() == "fentanyl" and target_route.lower() == "patch":
        target_tdd = reduced_ome
        divided = [target_tdd]
        frequency = 1
        breakthrough = round(reduced_ome / 6, 2)
    else:
        target_tdd = ome_to_drug_dose(target_drug, target_route, reduced_ome)
        divided = divide_daily_dose(target_tdd, target_frequency)
        frequency = target_frequency
        breakthrough = round(target_tdd / 6, 2)

    # GFR drug-specific warnings for target drug
    if gfr is not None and gfr < 30:
        td = target_drug.lower()
        if td in ("morphine", "codeine", "dihydrocodeine"):
            warnings.append("gfr.drug.avoid")
        elif td in ("oxycodone", "hydromorphone"):
            warnings.append("gfr.drug.caution")
        elif td == "fentanyl":
            warnings.append("gfr.drug.preferred")

        for inp in inputs:
            risk = GFR_DRUG_RISK.get(inp.drug.lower())
            if risk == "contraindicated":
                warnings.append(
                    f"{inp.drug} is contraindicated with GFR < 30 ml/min."
                )
            elif risk == "avoid":
                warnings.append(
                    f"{inp.drug} should be avoided with GFR < 30 ml/min. "
                    "Consider fentanyl or sufentanil."
                )
            elif risk == "caution":
                warnings.append(
                    f"{inp.drug} requires dose reduction and careful monitoring "
                    "with GFR < 30 ml/min."
                )

    if gfr is not None and gfr < 10:
        warnings.append("gfr.below10.warning")

    # De-duplicate
    seen: set[str] = set()
    unique_warnings: list[str] = []
    for w in warnings:
        if w not in seen:
            seen.add(w)
            unique_warnings.append(w)

    return TargetResult(
        drug=target_drug,
        route=target_route,
        total_daily_dose=round(target_tdd, 2),
        divided_doses=divided,
        frequency=frequency,
        breakthrough_dose=breakthrough,
        warnings=unique_warnings,
    )


# ---------------------------------------------------------------------------
# Warning helpers
# ---------------------------------------------------------------------------

def get_gfr_warnings(gfr: float) -> list[str]:
    """Return safety warnings based on GFR value."""
    warnings = []
    if gfr < 30:
        warnings.append(
            "GFR < 30 ml/min: High risk of opioid overdose and metabolite "
            "accumulation. May lead to severe side effects "
            "(respiratory depression, sedation, neurotoxicity)."
        )
    return warnings


def get_drug_warnings(drug: str) -> list[str]:
    """Return drug-specific safety warnings."""
    warning = WARNING_DRUGS.get(drug.lower())
    if warning:
        return [warning]
    return []
