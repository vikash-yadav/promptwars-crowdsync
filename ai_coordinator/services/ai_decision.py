"""
AI Decision Service — CrowdSync
Handles prompt engineering and decision logic for crowd flow management.
Integrates with the GeminiService defined in main.py.
"""

from dataclasses import dataclass
from typing import Optional
from enum import Enum


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class CongestionLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class ZoneData:
    """Represents the real-time state of a stadium zone."""
    zone: str
    people_count: int
    area_size: float          # in square metres
    inflow_rate: float        # people entering per minute
    outflow_rate: float       # people leaving per minute
    capacity: int
    adjacent_zones: Optional[list[str]] = None  # zones that can absorb overflow

    @property
    def density(self) -> float:
        """People per square metre."""
        return self.people_count / self.area_size if self.area_size > 0 else 0.0

    @property
    def occupancy_ratio(self) -> float:
        """Fraction of capacity currently occupied (0.0 – 1.0+)."""
        return self.people_count / self.capacity if self.capacity > 0 else 0.0

    @property
    def net_flow(self) -> float:
        """Positive = filling up, Negative = emptying."""
        return self.inflow_rate - self.outflow_rate


@dataclass
class AIDecision:
    """Structured response from the AI decision engine."""
    zone: str
    congestion_likely: bool
    congestion_level: CongestionLevel
    should_redirect: bool
    suggested_action: str
    raw_ai_response: Optional[str] = None


# ---------------------------------------------------------------------------
# Prompt Builder
# ---------------------------------------------------------------------------

def build_ai_prompt(data: ZoneData) -> str:
    """
    Constructs a concise, structured prompt for the Gemini model based on
    current zone telemetry. Keeps context tight so the model stays focused
    and token costs remain low.
    """
    adjacent = ", ".join(data.adjacent_zones) if data.adjacent_zones else "none listed"
    occupancy_pct = round(data.occupancy_ratio * 100, 1)
    density_fmt = round(data.density, 2)

    return f"""
You are an AI system managing crowd flow in a stadium.

Current State:
- Zone: {data.zone}
- People Count: {data.people_count} / {data.capacity} capacity ({occupancy_pct}%)
- Density: {density_fmt} people/m²
- Inflow: {data.inflow_rate} people/min
- Outflow: {data.outflow_rate} people/min
- Net Flow: {data.net_flow:+.1f} people/min (positive = filling up)
- Adjacent Zones Available: {adjacent}

Decide:
1. Is congestion likely in the next 5 minutes?
2. Should users be redirected to adjacent zones?
3. Suggest one best action (be specific and actionable).

Keep your answer short, structured, and actionable. Use this format:
CONGESTION: yes/no
REDIRECT: yes/no
ACTION: <one clear sentence>
"""


# ---------------------------------------------------------------------------
# Decision Parsing
# ---------------------------------------------------------------------------

def _parse_congestion_level(data: ZoneData) -> CongestionLevel:
    """Rule-based fallback that classifies congestion without AI."""
    ratio = data.occupancy_ratio
    if ratio >= 0.95:
        return CongestionLevel.CRITICAL
    elif ratio >= 0.80:
        return CongestionLevel.HIGH
    elif ratio >= 0.65:
        return CongestionLevel.MODERATE
    return CongestionLevel.LOW


def parse_ai_response(raw: str, data: ZoneData) -> AIDecision:
    """
    Parses the structured AI response text and produces an AIDecision.
    Falls back to rule-based logic if the model output is malformed.
    """
    lines = {
        line.split(":")[0].strip().upper(): line.split(":", 1)[1].strip()
        for line in raw.strip().splitlines()
        if ":" in line
    }

    congestion_likely = lines.get("CONGESTION", "no").lower().startswith("yes")
    should_redirect = lines.get("REDIRECT", "no").lower().startswith("yes")
    action = lines.get("ACTION", "Monitor zone and prepare for potential redirection.")

    return AIDecision(
        zone=data.zone,
        congestion_likely=congestion_likely,
        congestion_level=_parse_congestion_level(data),
        should_redirect=should_redirect,
        suggested_action=action,
        raw_ai_response=raw,
    )


# ---------------------------------------------------------------------------
# Rule-Based Fallback (no AI required)
# ---------------------------------------------------------------------------

def make_rule_based_decision(data: ZoneData) -> AIDecision:
    """
    Deterministic decision when AI is unavailable or for low-cost pre-checks.
    Used as a fast-path before calling Gemini.
    """
    level = _parse_congestion_level(data)
    congestion_likely = data.net_flow > 10 or level in (CongestionLevel.HIGH, CongestionLevel.CRITICAL)
    should_redirect = level in (CongestionLevel.HIGH, CongestionLevel.CRITICAL)

    if level == CongestionLevel.CRITICAL:
        action = f"Immediately close inflow gates to {data.zone} and divert crowd to adjacent zones."
    elif level == CongestionLevel.HIGH:
        action = f"Activate stewards at {data.zone} entry points and guide overflow to adjacent zones."
    elif congestion_likely:
        action = f"Increase monitoring frequency for {data.zone}; pre-position stewards."
    else:
        action = f"No action needed. {data.zone} is operating within normal parameters."

    return AIDecision(
        zone=data.zone,
        congestion_likely=congestion_likely,
        congestion_level=level,
        should_redirect=should_redirect,
        suggested_action=action,
    )


# ---------------------------------------------------------------------------
# High-Level Decision Orchestrator
# ---------------------------------------------------------------------------

async def get_zone_decision(data: ZoneData, gemini_service) -> AIDecision:
    """
    Main entry point.  Runs the fast rule-based check first; if the zone is
    in a non-trivial state, calls Gemini for a nuanced AI decision.

    Args:
        data:           Real-time telemetry for a single zone.
        gemini_service: An instance of GeminiService from main.py.

    Returns:
        An AIDecision with congestion analysis and recommended action.
    """
    # Fast-path: if the zone is clearly fine, skip the LLM call
    fast = make_rule_based_decision(data)
    if fast.congestion_level == CongestionLevel.LOW and not fast.congestion_likely:
        return fast

    # Otherwise, ask Gemini for a context-aware recommendation
    prompt = build_ai_prompt(data)
    raw_response = await gemini_service.get_response(prompt)
    return parse_ai_response(raw_response, data)
