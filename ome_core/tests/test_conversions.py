"""Tests for the OME conversion engine."""

import pytest
from ome_core.conversions import (
    OpioidInput,
    calculate_tdd,
    drug_dose_to_ome,
    fentanyl_patch_to_ome,
    ome_to_drug_dose,
    sum_omes,
    apply_reduction,
    divide_daily_dose,
    compute_target_regimen,
    get_gfr_warnings,
    get_drug_warnings,
)


# ---------------------------------------------------------------------------
# TDD calculation
# ---------------------------------------------------------------------------

class TestCalculateTDD:
    def test_symmetric_dosing(self):
        inp = OpioidInput(drug="morphine", route="oral", doses=[10.0], frequency=4)
        assert calculate_tdd(inp) == 40.0

    def test_asymmetric_dosing(self):
        inp = OpioidInput(
            drug="morphine", route="oral",
            doses=[20.0, 10.0, 10.0, 40.0],
            frequency=4, asymmetrical=True,
        )
        assert calculate_tdd(inp) == 80.0

    def test_12h_frequency(self):
        inp = OpioidInput(drug="oxycodone", route="oral", doses=[30.0], frequency=2)
        assert calculate_tdd(inp) == 60.0

    def test_empty_doses(self):
        inp = OpioidInput(drug="morphine", route="oral", doses=[], frequency=4)
        assert calculate_tdd(inp) == 0.0


# ---------------------------------------------------------------------------
# Drug → OME conversion
# ---------------------------------------------------------------------------

class TestDrugToOME:
    def test_morphine_oral(self):
        assert drug_dose_to_ome("morphine", "oral", 60) == 60.0

    def test_morphine_parenteral(self):
        assert drug_dose_to_ome("morphine", "sc/iv", 20) == 60.0

    def test_oxycodone_oral(self):
        assert drug_dose_to_ome("oxycodone", "oral", 40) == 60.0

    def test_tramadol_oral(self):
        assert drug_dose_to_ome("tramadol", "oral", 100) == 10.0

    def test_hydromorphone_oral(self):
        assert drug_dose_to_ome("hydromorphone", "oral", 4) == 20.0

    def test_fentanyl_sc_iv(self):
        # 0.1 mg (100 mcg) fentanyl IV = 10 mg OME
        assert drug_dose_to_ome("fentanyl", "sc/iv", 0.1) == pytest.approx(10.0)

    def test_fentanyl_patch_raises(self):
        with pytest.raises(ValueError, match="patch"):
            drug_dose_to_ome("fentanyl", "patch", 25)

    def test_unknown_drug_raises(self):
        with pytest.raises(ValueError):
            drug_dose_to_ome("aspirin", "oral", 100)


# ---------------------------------------------------------------------------
# Fentanyl patch conversion
# ---------------------------------------------------------------------------

class TestFentanylPatch:
    def test_12mcg(self):
        assert fentanyl_patch_to_ome(12) == 37.5

    def test_25mcg(self):
        assert fentanyl_patch_to_ome(25) == 75.0

    def test_50mcg(self):
        assert fentanyl_patch_to_ome(50) == 135.0

    def test_75mcg(self):
        assert fentanyl_patch_to_ome(75) == 202.5

    def test_100mcg(self):
        assert fentanyl_patch_to_ome(100) == 270.0

    def test_interpolation(self):
        # Between 25 and 50: should interpolate
        ome = fentanyl_patch_to_ome(37)
        assert 75.0 < ome < 135.0

    def test_below_range(self):
        # Below 12 mcg/hr — should scale linearly
        ome = fentanyl_patch_to_ome(6)
        assert ome == pytest.approx(37.5 * 0.5)


# ---------------------------------------------------------------------------
# OME → target drug
# ---------------------------------------------------------------------------

class TestOMEToDrug:
    def test_to_morphine_oral(self):
        assert ome_to_drug_dose("morphine", "oral", 60) == 60.0

    def test_to_morphine_sc(self):
        assert ome_to_drug_dose("morphine", "sc/iv", 60) == pytest.approx(20.0, rel=0.01)

    def test_to_oxycodone_oral(self):
        assert ome_to_drug_dose("oxycodone", "oral", 60) == pytest.approx(40.0, rel=0.01)

    def test_to_tramadol(self):
        assert ome_to_drug_dose("tramadol", "oral", 10) == 100.0


# ---------------------------------------------------------------------------
# Sum & reduction
# ---------------------------------------------------------------------------

class TestSumAndReduce:
    def test_sum(self):
        assert sum_omes([30.0, 45.0, 25.0]) == 100.0

    def test_reduction_25(self):
        assert apply_reduction(100.0, 25) == 75.0

    def test_reduction_50(self):
        assert apply_reduction(100.0, 50) == 50.0

    def test_reduction_0(self):
        assert apply_reduction(100.0, 0) == 100.0

    def test_reduction_invalid(self):
        with pytest.raises(ValueError):
            apply_reduction(100.0, 110)


# ---------------------------------------------------------------------------
# Dose division
# ---------------------------------------------------------------------------

class TestDivideDose:
    def test_q6h(self):
        doses = divide_daily_dose(120.0, 4)
        assert len(doses) == 4
        assert all(d == 30.0 for d in doses)

    def test_q12h(self):
        doses = divide_daily_dose(60.0, 2)
        assert len(doses) == 2
        assert all(d == 30.0 for d in doses)

    def test_zero_freq_raises(self):
        with pytest.raises(ValueError):
            divide_daily_dose(60.0, 0)


# ---------------------------------------------------------------------------
# Warnings
# ---------------------------------------------------------------------------

class TestWarnings:
    def test_gfr_low(self):
        w = get_gfr_warnings(25)
        assert len(w) == 1
        assert "GFR < 30" in w[0]

    def test_gfr_ok(self):
        assert get_gfr_warnings(60) == []

    def test_methadone_warning(self):
        w = get_drug_warnings("methadone")
        assert len(w) == 1
        assert "specialist" in w[0].lower()

    def test_nalbuphine_warning(self):
        w = get_drug_warnings("nalbuphine")
        assert len(w) == 1
        assert "withdrawal" in w[0].lower()

    def test_no_warning(self):
        assert get_drug_warnings("morphine") == []


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------

class TestComputeTarget:
    def test_simple_rotation(self):
        """Morphine oral 60mg/day → oxycodone oral with 25% reduction."""
        inputs = [
            OpioidInput(drug="morphine", route="oral", doses=[15.0], frequency=4)
        ]
        result = compute_target_regimen(
            inputs=inputs,
            target_drug="oxycodone",
            target_route="oral",
            target_frequency=2,
            reduction_pct=25,
        )
        # 60 OME → 75% = 45 OME → ×0.666 = ~30mg oxycodone/day
        assert result.total_daily_dose == pytest.approx(30.0, rel=0.02)
        assert len(result.divided_doses) == 2
        assert result.breakthrough_dose == pytest.approx(5.0, rel=0.1)

    def test_multi_drug_rotation(self):
        """Tramadol 300mg + morphine SC 10mg → hydromorphone oral."""
        inputs = [
            OpioidInput(drug="tramadol", route="oral", doses=[100.0], frequency=3),
            OpioidInput(drug="morphine", route="sc/iv", doses=[5.0], frequency=2),
        ]
        result = compute_target_regimen(
            inputs=inputs,
            target_drug="hydromorphone",
            target_route="oral",
            target_frequency=2,
            reduction_pct=25,
        )
        # Tramadol 300mg → 30 OME, Morphine SC 10mg → 30 OME = 60 OME
        # 75% = 45 OME → ×0.2 = 9 mg hydromorphone/day
        assert result.total_daily_dose == pytest.approx(9.0, rel=0.02)

    def test_gfr_warning_included(self):
        inputs = [
            OpioidInput(drug="morphine", route="oral", doses=[20.0], frequency=3)
        ]
        result = compute_target_regimen(
            inputs=inputs,
            target_drug="fentanyl",
            target_route="sc/iv",
            target_frequency=4,
            reduction_pct=50,
            gfr=20,
        )
        assert any("GFR" in w for w in result.warnings)
        assert any("morphine" in w.lower() for w in result.warnings)

    def test_fentanyl_patch_input(self):
        """Fentanyl 25 mcg/hr patch → morphine oral."""
        inputs = [
            OpioidInput(drug="fentanyl", route="patch", doses=[25.0], frequency=1)
        ]
        result = compute_target_regimen(
            inputs=inputs,
            target_drug="morphine",
            target_route="oral",
            target_frequency=4,
            reduction_pct=25,
        )
        # 25 mcg/hr → 75 OME → 75% = 56.25 OME → 56.25 mg morphine/day
        assert result.total_daily_dose == pytest.approx(56.25, rel=0.02)
