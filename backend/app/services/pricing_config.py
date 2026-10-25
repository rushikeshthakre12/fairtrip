"""
Central, configurable pricing logic — the ONLY place status thresholds and
confidence bands live. Never duplicate these numbers in the frontend.
See docs/ML_MODEL.md section 4 & 5 for the documented rationale.
"""

PRICE_STATUS_CONFIG = {
    # quote <= range_max                                -> TYPICAL
    # range_max < quote <= range_max * ABOVE_MULTIPLIER  -> ABOVE_TYPICAL
    # quote > range_max * ABOVE_MULTIPLIER               -> UNUSUALLY_HIGH
    "above_typical_multiplier": 1.0,
    "unusually_high_multiplier": 1.5,
}

CONFIDENCE_CONFIG = {
    "high_min_observations": 30,
    "medium_min_observations": 10,
}


def determine_status(quoted_price: float, range_max: float) -> str:
    unusually_high_threshold = range_max * PRICE_STATUS_CONFIG["unusually_high_multiplier"]

    if quoted_price <= range_max:
        return "TYPICAL"
    elif quoted_price <= unusually_high_threshold:
        return "ABOVE_TYPICAL"
    else:
        return "UNUSUALLY_HIGH"


def determine_confidence(n_observations: int) -> str:
    if n_observations >= CONFIDENCE_CONFIG["high_min_observations"]:
        return "HIGH"
    elif n_observations >= CONFIDENCE_CONFIG["medium_min_observations"]:
        return "MEDIUM"
    else:
        return "LOW"
