"""
Yahoo Finance Data Loader for BTC-USD.
Serves as an independent cross-venue verification and fallback data provider.
"""

from __future__ import annotations
import logging
from datetime import datetime, timezone
from typing import List, Optional
import yfinance as yf
import pandas as pd

from contracts.schemas import Candle, MarketDataSource, TimeFrame, MarketDataSnapshot
from research.data.canonical import CandleValidator

logger = logging.getLogger("Trade2Options.Data.Yahoo")


class YahooDataLoader:
    TF_MAP = {
        TimeFrame.M1: "1m",
        TimeFrame.M5: "5m",
        TimeFrame.M15: "15m",
        TimeFrame.H1: "1h",
        TimeFrame.D1: "1d",
    }

    @classmethod
    def fetch_candles(
        cls,
        symbol: str = "BTC-USD",
        timeframe: TimeFrame = TimeFrame.M15,
        period: str = "5d"
    ) -> MarketDataSnapshot:
        """Fetches candles via yfinance."""
        interval = cls.TF_MAP.get(timeframe, "15m")
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)
            if df is None or df.empty:
                return MarketDataSnapshot(
                    symbol=symbol,
                    timeframe=timeframe,
                    source=MarketDataSource.YAHOO_FINANCE,
                    candles_count=0,
                    is_data_available=False,
                    error_message="No data returned from Yahoo Finance"
                )

            raw_candles: List[Candle] = []
            for idx, row in df.iterrows():
                ts = idx.to_pydatetime() if hasattr(idx, "to_pydatetime") else idx
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                else:
                    ts = ts.astimezone(timezone.utc)

                candle = Candle(
                    timestamp=ts,
                    open=float(row["Open"]),
                    high=float(row["High"]),
                    low=float(row["Low"]),
                    close=float(row["Close"]),
                    volume=float(row["Volume"]),
                    is_closed=True,
                    source=MarketDataSource.YAHOO_FINANCE,
                    symbol=symbol,
                    timeframe=timeframe
                )
                raw_candles.append(candle)

            clean_candles = CandleValidator.clean_and_sort_candles(raw_candles)
            latest = clean_candles[-1] if clean_candles else None

            return MarketDataSnapshot(
                symbol=symbol,
                timeframe=timeframe,
                source=MarketDataSource.YAHOO_FINANCE,
                venue="YAHOO",
                candles_count=len(clean_candles),
                latest_candle=latest,
                candles=clean_candles,
                is_data_available=bool(clean_candles),
                error_message=None
            )
        except Exception as e:
            logger.exception(f"Yahoo loader error: {e}")
            return MarketDataSnapshot(
                symbol=symbol,
                timeframe=timeframe,
                source=MarketDataSource.YAHOO_FINANCE,
                candles_count=0,
                is_data_available=False,
                error_message=str(e)
            )
