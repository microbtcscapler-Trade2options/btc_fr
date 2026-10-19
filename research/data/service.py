"""
Trade2Options Market Data Service.
Manages primary and fallback market data feeds, multi-timeframe aggregation,
and data freshness monitoring.
"""

from __future__ import annotations
import logging
from typing import Dict, Optional, Tuple
from datetime import datetime, timezone
import pandas as pd

from contracts.schemas import Candle, MarketDataSource, TimeFrame, MarketDataSnapshot
from research.data.binance_loader import BinanceDataLoader
from research.data.yahoo_loader import YahooDataLoader
from research.data.canonical import CandleValidator

logger = logging.getLogger("Trade2Options.DataService")


class MarketDataService:
    def __init__(self):
        self._memory_cache: Dict[Tuple[str, TimeFrame], MarketDataSnapshot] = {}

    def get_market_data(
        self,
        symbol: str = "BTCUSDT",
        timeframe: TimeFrame = TimeFrame.M15,
        limit: int = 300,
        force_refresh: bool = False
    ) -> MarketDataSnapshot:
        """
        Retrieves market data using documented fallback strategy:
        1. Attempt primary source (Binance BTCUSDT)
        2. If unavailable, attempt fallback (Yahoo BTC-USD)
        3. If all fail, return canonical DATA UNAVAILABLE snapshot.
        """
        cache_key = (symbol, timeframe)
        if not force_refresh and cache_key in self._memory_cache:
            cached = self._memory_cache[cache_key]
            # Check if cache is fresh (< 60 seconds)
            age = (datetime.now(timezone.utc) - cached.retrieved_at).total_seconds()
            if age < 60:
                return cached

        # 1. Primary Source
        logger.info(f"Fetching market data for {symbol} ({timeframe}) from Binance...")
        snapshot = BinanceDataLoader.fetch_candles(symbol=symbol, timeframe=timeframe, limit=limit)

        # 2. Fallback if primary fails
        if not snapshot.is_data_available or snapshot.candles_count == 0:
            logger.warning(f"Primary feed failed ({snapshot.error_message}). Attempting Yahoo Finance fallback...")
            yahoo_symbol = "BTC-USD" if "BTC" in symbol.upper() else symbol
            snapshot = YahooDataLoader.fetch_candles(symbol=yahoo_symbol, timeframe=timeframe)

        # 3. Final check
        if snapshot.is_data_available:
            self._memory_cache[cache_key] = snapshot
        else:
            logger.error(f"All data feeds failed for {symbol} ({timeframe}).")

        return snapshot

    def get_multi_timeframe_data(
        self,
        symbol: str = "BTCUSDT",
        timeframes: Optional[list[TimeFrame]] = None
    ) -> Dict[TimeFrame, MarketDataSnapshot]:
        """Fetches independent datasets for each timeframe to ensure zero timeframe crosstalk."""
        if timeframes is None:
            timeframes = [TimeFrame.M15, TimeFrame.H1, TimeFrame.H4]

        result = {}
        for tf in timeframes:
            result[tf] = self.get_market_data(symbol=symbol, timeframe=tf, limit=300)
        return result
