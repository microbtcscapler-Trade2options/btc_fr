"""
Binance Public Market Data Loader for Bitcoin.
Fetches real-time and historical klines without API keys.
Distinguishes finalized closed bars from the currently forming bar.
"""

from __future__ import annotations
import requests
from datetime import datetime, timezone
from typing import List, Optional
import logging

from contracts.schemas import Candle, MarketDataSource, TimeFrame, MarketDataSnapshot
from research.data.canonical import CandleValidator

logger = logging.getLogger("Trade2Options.Data.Binance")


class BinanceDataLoader:
    BASE_URL = "https://api.binance.com/api/v3/klines"

    TF_MAP = {
        TimeFrame.M1: "1m",
        TimeFrame.M5: "5m",
        TimeFrame.M15: "15m",
        TimeFrame.H1: "1h",
        TimeFrame.H4: "4h",
        TimeFrame.D1: "1d",
    }

    @classmethod
    def fetch_candles(
        cls,
        symbol: str = "BTCUSDT",
        timeframe: TimeFrame = TimeFrame.M15,
        limit: int = 300,
        include_forming: bool = False
    ) -> MarketDataSnapshot:
        """
        Fetches klines from Binance public endpoint.
        Returns MarketDataSnapshot with full canonical validation.
        """
        interval = cls.TF_MAP.get(timeframe, "15m")
        params = {
            "symbol": symbol.upper().replace("-", "").replace("/", ""),
            "interval": interval,
            "limit": min(limit + (1 if include_forming else 0), 1000)
        }

        try:
            resp = requests.get(cls.BASE_URL, params=params, timeout=10)
            if resp.status_code != 200:
                logger.error(f"Binance API error: {resp.status_code} - {resp.text}")
                return MarketDataSnapshot(
                    symbol=symbol,
                    timeframe=timeframe,
                    source=MarketDataSource.BINANCE_SPOT,
                    candles_count=0,
                    is_data_available=False,
                    error_message=f"Binance HTTP {resp.status_code}: {resp.text[:100]}"
                )

            data = resp.json()
            raw_candles: List[Candle] = []
            total_bars = len(data)

            for i, row in enumerate(data):
                # row[0]: open time in ms
                # row[1]: Open, row[2]: High, row[3]: Low, row[4]: Close, row[5]: Volume
                open_ts = datetime.fromtimestamp(row[0] / 1000.0, tz=timezone.utc)
                is_last_bar = (i == total_bars - 1)
                
                # Check if bar is closed: if it's the last bar, it's currently forming unless timestamp has elapsed
                is_closed = not is_last_bar

                candle = Candle(
                    timestamp=open_ts,
                    open=float(row[1]),
                    high=float(row[2]),
                    low=float(row[3]),
                    close=float(row[4]),
                    volume=float(row[5]),
                    is_closed=is_closed,
                    source=MarketDataSource.BINANCE_SPOT,
                    symbol=symbol,
                    timeframe=timeframe
                )
                raw_candles.append(candle)

            if not include_forming and raw_candles:
                # Exclude the unclosed forming bar to prevent lookahead bias
                raw_candles = [c for c in raw_candles if c.is_closed]

            clean_candles = CandleValidator.clean_and_sort_candles(raw_candles)
            latest = clean_candles[-1] if clean_candles else None

            return MarketDataSnapshot(
                symbol=symbol,
                timeframe=timeframe,
                source=MarketDataSource.BINANCE_SPOT,
                venue="BINANCE",
                candles_count=len(clean_candles),
                latest_candle=latest,
                candles=clean_candles,
                is_data_available=bool(clean_candles),
                error_message=None
            )

        except Exception as ex:
            logger.exception(f"Failed to fetch Binance data: {ex}")
            return MarketDataSnapshot(
                symbol=symbol,
                timeframe=timeframe,
                source=MarketDataSource.BINANCE_SPOT,
                candles_count=0,
                is_data_available=False,
                error_message=str(ex)
            )
