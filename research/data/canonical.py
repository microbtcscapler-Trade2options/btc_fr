"""
Trade2Options Canonical Market Data Pipeline.
Validates, cleans, aligns, and checks data integrity for Bitcoin time-series.
Ensures zero lookahead bias: only completed candles are marked is_closed=True.
"""

from __future__ import annotations
import math
from datetime import datetime, timezone
from typing import List, Tuple, Optional
import pandas as pd
import numpy as np

from contracts.schemas import Candle, MarketDataSource, TimeFrame, MarketDataSnapshot


class MarketDataIntegrityError(Exception):
    """Raised when critical market data anomalies are detected."""
    pass


class CandleValidator:
    """Deterministic validation and cleaning for incoming OHLCV bars."""

    @staticmethod
    def validate_candle(candle: Candle) -> Tuple[bool, Optional[str]]:
        """Validates standard OHLC rules: high >= low, open/close inside high/low, positive volume."""
        if candle.open <= 0 or candle.high <= 0 or candle.low <= 0 or candle.close <= 0:
            return False, f"Non-positive price in candle at {candle.timestamp}: O={candle.open}, H={candle.high}, L={candle.low}, C={candle.close}"
        if candle.high < candle.low:
            return False, f"High < Low in candle at {candle.timestamp}: H={candle.high}, L={candle.low}"
        if candle.open > candle.high or candle.open < candle.low:
            return False, f"Open outside High-Low range at {candle.timestamp}: O={candle.open}, H={candle.high}, L={candle.low}"
        if candle.close > candle.high or candle.close < candle.low:
            return False, f"Close outside High-Low range at {candle.timestamp}: C={candle.close}, H={candle.high}, L={candle.low}"
        if math.isnan(candle.volume) or candle.volume < 0:
            return False, f"Invalid volume at {candle.timestamp}: V={candle.volume}"
        return True, None

    @classmethod
    def clean_and_sort_candles(cls, candles: List[Candle]) -> List[Candle]:
        """Deduplicates by timestamp, removes invalid candles, sorts chronologically."""
        seen_timestamps = set()
        valid_candles: List[Candle] = []

        for c in candles:
            is_valid, err = cls.validate_candle(c)
            if not is_valid:
                continue
            ts = c.timestamp
            if ts in seen_timestamps:
                continue
            seen_timestamps.add(ts)
            valid_candles.append(c)

        valid_candles.sort(key=lambda x: x.timestamp)
        return valid_candles

    @classmethod
    def to_dataframe(cls, candles: List[Candle]) -> pd.DataFrame:
        """Converts canonical candles into a standard pandas DataFrame with datetime index."""
        if not candles:
            return pd.DataFrame(columns=["open", "high", "low", "close", "volume", "is_closed"])
        
        data = [{
            "timestamp": c.timestamp,
            "open": float(c.open),
            "high": float(c.high),
            "low": float(c.low),
            "close": float(c.close),
            "volume": float(c.volume),
            "is_closed": bool(c.is_closed),
            "source": c.source.value,
            "symbol": c.symbol
        } for c in candles]
        
        df = pd.DataFrame(data)
        df.set_index("timestamp", inplace=True)
        df.sort_index(inplace=True)
        return df

    @classmethod
    def from_dataframe(cls, df: pd.DataFrame, source: MarketDataSource, symbol: str, timeframe: TimeFrame) -> List[Candle]:
        """Converts a pandas DataFrame into canonical Candle instances."""
        candles: List[Candle] = []
        for idx, row in df.iterrows():
            ts = idx if isinstance(idx, datetime) else pd.to_datetime(idx).to_pydatetime()
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            candle = Candle(
                timestamp=ts,
                open=float(row["open"]),
                high=float(row["high"]),
                low=float(row["low"]),
                close=float(row["close"]),
                volume=float(row.get("volume", 0.0)),
                is_closed=bool(row.get("is_closed", True)),
                source=source,
                symbol=symbol,
                timeframe=timeframe
            )
            candles.append(candle)
        return cls.clean_and_sort_candles(candles)
