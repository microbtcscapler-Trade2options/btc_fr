"""
Trade2Options High-Performance Time-Series Data Store.
Provides ultra-fast columnar storage and indexing of tick data and multi-timeframe candles,
serving as the in-memory prelude to TimescaleDB / QuestDB.
"""

from __future__ import annotations
from typing import Dict, List, Optional
from datetime import datetime, timezone
from contracts.schemas import Candle, TimeFrame


class TimeSeriesHyperStore:
    """High-speed in-memory columnar time-series cache."""

    def __init__(self):
        self._store: Dict[str, List[Candle]] = {}

    def insert_candles(self, timeframe: TimeFrame, candles: List[Candle]) -> int:
        """Stores candles in chronological order, deduplicating identical timestamps."""
        tf_key = timeframe.value
        if tf_key not in self._store:
            self._store[tf_key] = []

        existing_timestamps = {c.timestamp for c in self._store[tf_key]}
        new_count = 0

        for c in candles:
            if c.timestamp not in existing_timestamps:
                self._store[tf_key].append(c)
                existing_timestamps.add(c.timestamp)
                new_count += 1

        # Keep sorted chronologically
        self._store[tf_key].sort(key=lambda x: x.timestamp)
        return new_count

    def get_slice(self, timeframe: TimeFrame, limit: int = 250) -> List[Candle]:
        """Returns the most recent N candles."""
        tf_key = timeframe.value
        candles = self._store.get(tf_key, [])
        return candles[-limit:] if limit > 0 else candles
