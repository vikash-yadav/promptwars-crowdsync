"""
Real-Time Simulation Engine — CrowdSync
Maintains stateful, drifting zone telemetry that evolves between API calls.
Produces data compatible with ZoneData from ai_decision.py.
"""

import random
import time
from dataclasses import dataclass, field
from typing import Dict, List


# ---------------------------------------------------------------------------
# Zone Configuration (static metadata)
# ---------------------------------------------------------------------------

ZONE_CONFIG: Dict[str, dict] = {
    "Gate1": {
        "capacity": 2000,
        "area_size": 400.0,
        "adjacent_zones": ["Gate2", "FoodCourt"],
        "base_inflow": 35.0,
        "base_outflow": 30.0,
    },
    "Gate2": {
        "capacity": 2000,
        "area_size": 400.0,
        "adjacent_zones": ["Gate1", "Exit"],
        "base_inflow": 28.0,
        "base_outflow": 32.0,
    },
    "FoodCourt": {
        "capacity": 1500,
        "area_size": 600.0,
        "adjacent_zones": ["Gate1", "Gate2", "Exit"],
        "base_inflow": 50.0,
        "base_outflow": 45.0,
    },
    "Exit": {
        "capacity": 3000,
        "area_size": 500.0,
        "adjacent_zones": ["Gate1", "Gate2"],
        "base_inflow": 20.0,
        "base_outflow": 60.0,
    },
}


# ---------------------------------------------------------------------------
# Stateful Zone State
# ---------------------------------------------------------------------------

@dataclass
class ZoneState:
    zone: str
    capacity: int
    area_size: float
    adjacent_zones: List[str]
    people_count: int
    inflow_rate: float
    outflow_rate: float
    last_updated: float = field(default_factory=time.time)

    @property
    def density(self) -> float:
        return round(self.people_count / self.area_size, 2)

    @property
    def occupancy_ratio(self) -> float:
        return round(self.people_count / self.capacity, 3)

    @property
    def status(self) -> str:
        ratio = self.occupancy_ratio
        if ratio >= 0.90:
            return "critical"
        elif ratio >= 0.75:
            return "high"
        elif ratio >= 0.55:
            return "moderate"
        return "normal"

    def to_dict(self) -> dict:
        return {
            "zone": self.zone,
            "people_count": self.people_count,
            "capacity": self.capacity,
            "area_size": self.area_size,
            "density": self.density,
            "occupancy_ratio": self.occupancy_ratio,
            "inflow_rate": round(self.inflow_rate, 1),
            "outflow_rate": round(self.outflow_rate, 1),
            "status": self.status,
            "adjacent_zones": self.adjacent_zones,
        }


# ---------------------------------------------------------------------------
# Simulation Engine
# ---------------------------------------------------------------------------

class SimulationEngine:
    """
    Maintains live, drifting state for each zone.
    Call .tick() to advance the simulation by one step.
    Call .get_state() to read current telemetry.
    """

    def __init__(self):
        self._zones: Dict[str, ZoneState] = {}
        self._tick_count: int = 0
        self._init_zones()

    def _init_zones(self) -> None:
        for name, cfg in ZONE_CONFIG.items():
            initial_people = int(cfg["capacity"] * random.uniform(0.4, 0.7))
            self._zones[name] = ZoneState(
                zone=name,
                capacity=cfg["capacity"],
                area_size=cfg["area_size"],
                adjacent_zones=cfg["adjacent_zones"],
                people_count=initial_people,
                inflow_rate=cfg["base_inflow"],
                outflow_rate=cfg["base_outflow"],
            )

    # ------------------------------------------------------------------
    # Core Tick Logic
    # ------------------------------------------------------------------

    def tick(self) -> None:
        """
        Advance the simulation one step (~2-second cadence).
        Applies realistic drift: flow rates shift gradually, crowd counts
        change based on net flow, and occasional surge events fire.
        """
        self._tick_count += 1

        for state in self._zones.values():
            cfg = ZONE_CONFIG[state.zone]

            # Drift flow rates within ±25% of their base values
            state.inflow_rate = self._drift(
                state.inflow_rate, cfg["base_inflow"],
                jitter=4.0, bounds=(0, cfg["base_inflow"] * 1.5)
            )
            state.outflow_rate = self._drift(
                state.outflow_rate, cfg["base_outflow"],
                jitter=3.5, bounds=(0, cfg["base_outflow"] * 1.5)
            )

            # Occasional surge event (5% chance per tick)
            if random.random() < 0.05:
                state.inflow_rate *= random.uniform(1.3, 2.0)

            # Net flow → update crowd count
            net = state.inflow_rate - state.outflow_rate
            state.people_count = max(
                0,
                min(state.capacity, state.people_count + int(net))
            )

            # Pressure relief: if critical, outflow auto-increases
            if state.occupancy_ratio >= 0.90:
                state.outflow_rate *= 1.3

            state.last_updated = time.time()

    # ------------------------------------------------------------------
    # Accessors
    # ------------------------------------------------------------------

    def get_state(self) -> Dict[str, dict]:
        """Returns the current snapshot of all zones."""
        return {name: state.to_dict() for name, state in self._zones.items()}

    def get_zone(self, zone_name: str) -> ZoneState | None:
        return self._zones.get(zone_name)

    @property
    def tick_count(self) -> int:
        return self._tick_count

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _drift(current: float, base: float, jitter: float, bounds: tuple) -> float:
        """
        Moves 'current' toward 'base' with some random jitter.
        Ensures the value stays within 'bounds'.
        """
        pull_toward_base = (base - current) * 0.15
        noise = random.uniform(-jitter, jitter)
        new_val = current + pull_toward_base + noise
        return max(bounds[0], min(bounds[1], new_val))


# ---------------------------------------------------------------------------
# Singleton — import this in main.py
# ---------------------------------------------------------------------------

simulation = SimulationEngine()
