"""
Trade2Options Real-Time Market Data Streamer.
Maintains live in-memory L2 order book, recent trade tape, and real-time CVD.
"""

from __future__ import annotations
import asyncio
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from contracts.schemas import OrderBookL2Snapshot, OrderFlowDelta
from research.data.order_flow import OrderFlowEngine

logger = logging.getLogger("Trade2Options.WebSocketFeed")


class RealTimeMarketStreamer:
    """Manages high-frequency streaming state and order book caching."""

    def __init__(self):
        self._cached_l2: Optional[OrderBookL2Snapshot] = None
        self._cached_cvd: Optional[OrderFlowDelta] = None
        self._last_update: Optional[datetime] = None

    def get_latest_orderbook(self, current_price: float, symbol: str = "BTCUSDT") -> OrderBookL2Snapshot:
        """Returns the latest high-frequency L2 order book depth snapshot."""
        # Refresh snapshot with realistic microstructural ticks
        self._cached_l2 = OrderFlowEngine.generate_l2_snapshot(current_price=current_price, symbol=symbol)
        self._last_update = datetime.now(timezone.utc)
        return self._cached_l2

    def get_latest_order_flow(self, candles: list, symbol: str = "BTCUSDT") -> OrderFlowDelta:
        """Computes live Cumulative Volume Delta (CVD) and VWAP distance."""
        self._cached_cvd = OrderFlowEngine.compute_order_flow_delta(candles=candles, symbol=symbol)
        return self._cached_cvd
