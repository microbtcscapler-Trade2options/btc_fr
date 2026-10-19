"""
Trade2Options Research Adapter Base Contract.
All third-party and internal research frameworks must inherit from ResearchAdapter.
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from contracts.schemas import (
    IntegrationHealth,
    IntegrationState,
    TimeFrame,
    ResearchExperiment,
    ForecastResult,
    Candle
)


class BaseResearchAdapter(ABC):
    def __init__(self, name: str, version: str):
        self.name = name
        self.version = version

    @abstractmethod
    def check_health(self) -> IntegrationHealth:
        """Returns current health status: NOT_CONFIGURED, CONNECTED, RUNNING, STALE, or FAILED."""
        pass

    @abstractmethod
    def supported_symbols(self) -> List[str]:
        pass

    @abstractmethod
    def supported_timeframes(self) -> List[TimeFrame]:
        pass

    @abstractmethod
    def run_experiment(self, experiment_id: str, candles: List[Candle], config: Dict[str, Any]) -> ResearchExperiment:
        pass
