"""
Trade2Options Intelligence Dashboard REST API Backend.
Framework: FastAPI + Pydantic v2
Serves Market Intelligence, Market Regime Engine, Advisory Entry Timing,
Research Model Orchestration, and MT5 EA Monitoring Bridge.
"""

from __future__ import annotations
import os
import sys
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import FastAPI, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Inject project root into sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from contracts.schemas import (
    TimeFrame,
    MarketDataSource,
    MarketDataSnapshot,
    IndicatorSnapshot,
    MarketRegimeSnapshot,
    ForecastResult,
    BacktestResult,
    IntegrationHealth,
    EAStatus,
    AuditEvent,
    OptionsChainSnapshot,
    ProtectiveCollarPlan,
    CoveredCallPlan,
    OrderBookL2Snapshot,
    OrderFlowDelta,
    SmartOrderRoutePlan,
    PropFirmAccountStatus,
    MetaLabelPrediction,
    OrderSide,
    RegimeType,
    VibeConsensusResult,
    ToricOnChainSnapshot,
    ContinuousForecastTimeline,
    AgentNetworkTopology,
    MasterSignalSnapshot
)
from research.data.service import MarketDataService
from research.features.indicators import IndicatorEngine
from research.regime.engine import MarketRegimeEngine
from research.adapters.kronos_adapter import KronosResearchAdapter
from research.adapters.deribit_adapter import DeribitOptionsAdapter
from research.adapters.vibe_adapter import VibeTradingAdapter
from research.adapters.toric_adapter import ToricResearchAdapter
from research.agents.topology import AgentNetworkTopologyEngine
from research.experiments.orchestrator import ResearchOrchestrator
from research.data.websocket_feed import RealTimeMarketStreamer
from research.options.collar_engine import ProtectiveCollarEngine
from research.options.covered_call_engine import CoveredCallEngine
from execution.smart_order_router import SmartOrderRouter
from execution.prop_firm_manager import PropFirmRiskManager
from execution.signal_engine import MasterSignalEngine
from research.ml.meta_labeling import MetaLabelingEngine
from dashboard.backend.services.telemetry_service import TelemetryService


logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("Trade2Options.Backend")

app = FastAPI(
    title="Trade2Options Intelligence API",
    description="Institutional-grade Bitcoin Quant Research, Market Regime Engine, and EA Telemetry Bridge",
    version="1.0.0"
)

# CORS configuration for Frontend Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Services
data_service = MarketDataService()
telemetry_service = TelemetryService()
orchestrator = ResearchOrchestrator()
kronos_adapter = KronosResearchAdapter()
vibe_adapter = VibeTradingAdapter()
toric_adapter = ToricResearchAdapter()
deribit_adapter = DeribitOptionsAdapter(use_testnet=True)
realtime_streamer = RealTimeMarketStreamer()
prop_manager = PropFirmRiskManager()


# Audit trail log
audit_logs: List[AuditEvent] = [
    AuditEvent(
        component="SYSTEM",
        action="STARTUP",
        level="INFO",
        detail="Trade2Options Backend Services initialized successfully."
    )
]


# ============================================================================
# Health & Status Endpoints
# ============================================================================

@app.get("/api/health")
def get_system_health():
    """System health check endpoint."""
    return {
        "status": "HEALTHY",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "environment": "LOCAL_DEV_INSTITUTIONAL"
    }


# ============================================================================
# 1. BTC Market Data Endpoints
# ============================================================================

@app.get("/api/market/candles", response_model=MarketDataSnapshot)
def get_market_candles(
    symbol: str = Query("BTCUSDT", description="Bitcoin ticker symbol"),
    timeframe: TimeFrame = Query(TimeFrame.M15, description="Candle timeframe"),
    limit: int = Query(250, ge=20, le=1000, description="Number of bars"),
    force_refresh: bool = Query(False)
):
    """Returns validated, deduplicated OHLCV candles with zero lookahead bias."""
    snapshot = data_service.get_market_data(symbol=symbol, timeframe=timeframe, limit=limit, force_refresh=force_refresh)
    if not snapshot.is_data_available:
        audit_logs.append(AuditEvent(
            component="MARKET_DATA",
            action="FEED_UNAVAILABLE",
            level="WARNING",
            detail=f"Feed unavailable for {symbol} ({timeframe}): {snapshot.error_message}"
        ))
    return snapshot


@app.get("/api/market/indicators", response_model=IndicatorSnapshot)
def get_market_indicators(
    symbol: str = Query("BTCUSDT"),
    timeframe: TimeFrame = Query(TimeFrame.M15)
):
    """Computes Layer A (EMA 20/50/200), Layer B (EMA 9/21/200 Advisory), and momentum features."""
    snapshot = data_service.get_market_data(symbol=symbol, timeframe=timeframe, limit=250)
    if not snapshot.is_data_available or snapshot.candles_count < 50:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="DATA UNAVAILABLE: Insufficient candle history to calculate technical indicators."
        )

    ind = IndicatorEngine.compute_all(snapshot.candles, timeframe)
    if not ind:
        raise HTTPException(status_code=500, detail="Failed to compute indicator snapshot.")
    return ind


@app.get("/api/market/regime", response_model=MarketRegimeSnapshot)
def get_market_regime(
    symbol: str = Query("BTCUSDT")
):
    """Evaluates deterministic, explainable market regime using M15 primary and H1/H4 confirmation."""
    m15_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=250)
    h1_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.H1, limit=100)
    h4_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.H4, limit=100)

    if not m15_snap.is_data_available or m15_snap.candles_count < 50:
        raise HTTPException(status_code=503, detail="DATA UNAVAILABLE for Market Regime calculation.")

    regime_snap = MarketRegimeEngine.evaluate(
        candles_m15=m15_snap.candles,
        candles_h1=h1_snap.candles if h1_snap.is_data_available else None,
        candles_h4=h4_snap.candles if h4_snap.is_data_available else None
    )
    return regime_snap


# ============================================================================
# 2. Research & Model Orchestration Endpoints
# ============================================================================

@app.get("/api/research/integrations", response_model=List[IntegrationHealth])
def get_research_integrations():
    """Returns honest health state for Kronos, Vibe-Trading, TradingView MCP, TORIC, and Deribit Options."""
    integrations = orchestrator.get_all_integration_health()
    integrations.append(deribit_adapter.get_health())
    return integrations



@app.get("/api/research/kronos-forecast", response_model=ForecastResult)
def get_kronos_forecast(
    symbol: str = Query("BTCUSDT"),
    timeframe: TimeFrame = Query(TimeFrame.M15)
):
    """
    Executes Kronos multi-horizon forecasting evaluation against Persistence and Drift baselines.
    Explicitly labelled RESEARCH_ONLY.
    """
    snapshot = data_service.get_market_data(symbol=symbol, timeframe=timeframe, limit=250)
    if not snapshot.is_data_available or snapshot.candles_count < 50:
        raise HTTPException(status_code=503, detail="DATA UNAVAILABLE: Cannot run forecast benchmark.")

    res = kronos_adapter.run_forecast_benchmark(snapshot.candles, horizons=[1, 4, 12])
    return res


@app.get("/api/research/backtest/comparison")
def get_backtest_strategy_comparison(
    symbol: str = Query("BTCUSDT"),
    timeframe: TimeFrame = Query(TimeFrame.M15)
):
    """Runs candidate strategy comparison (Baseline vs Candidate A vs Candidate B) across In-Sample & Out-of-Sample."""
    try:
        results = orchestrator.run_strategy_comparison(symbol=symbol, timeframe=timeframe)
        return {
            "status": "SUCCESS",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": {k: v.dict() for k, v in results.items()}
        }
    except Exception as e:
        logger.exception(f"Backtest comparison failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vibe/council-decision", response_model=VibeConsensusResult)
def get_vibe_council_decision(
    symbol: str = Query("BTCUSDT")
):
    """
    Evaluates the native autonomous Vibe-Trading 3-Agent Council:
    - Technical Analyst Agent
    - Order Flow & Microstructure Specialist
    - Risk & Regime Gatekeeper Agent (with VETO power)
    Produces a weighted, explainable consensus verdict.
    """
    m15_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=250)
    current_price = m15_snap.latest_candle.close if m15_snap.latest_candle else 82000.0
    adx14 = 28.5
    eff = 0.65
    if m15_snap.is_data_available and m15_snap.candles:
        ind = IndicatorEngine.compute_all(m15_snap.candles, TimeFrame.M15)
        if ind:
            adx14 = ind.momentum.adx_14
            eff = ind.momentum.directional_efficiency

    regime_snap = MarketRegimeEngine.evaluate(
        candles_m15=m15_snap.candles if m15_snap.is_data_available else []
    )
    of_delta = realtime_streamer.get_latest_order_flow(
        candles=m15_snap.candles if m15_snap.is_data_available else [],
        symbol=symbol
    )
    ob_snap = realtime_streamer.get_latest_orderbook(current_price=current_price, symbol=symbol)
    bid_depth = ob_snap.bid_depth_usd
    ask_depth = ob_snap.ask_depth_usd

    # Check prop firm drawdown state
    telemetry = telemetry_service.read_telemetry()
    daily_loss_pct = 0.0
    if telemetry.get("is_connected") and telemetry.get("status"):
        risk = telemetry["status"].get("risk", {})
        daily_loss_pct = risk.get("current_daily_drawdown_pct", 0.0)

    return vibe_adapter.evaluate_council(
        current_price=current_price,
        regime=regime_snap.regime,
        adx=adx14,
        directional_efficiency=eff,
        cvd=of_delta.cumulative_volume_delta,
        bid_depth=bid_depth,
        ask_depth=ask_depth,
        daily_loss_used_pct=daily_loss_pct
    )


@app.get("/api/toric/on-chain", response_model=ToricOnChainSnapshot)
def get_toric_on_chain(
    symbol: str = Query("BTCUSDT")
):
    """
    Returns TORIC on-chain institutional whale metrics:
    Whale net flow (BTC), exchange reserve trends, MVRV Z-Score, and funding rates.
    """
    m15_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=50)
    current_price = m15_snap.latest_candle.close if m15_snap.latest_candle else 82000.0
    return toric_adapter.get_on_chain_snapshot(current_price=current_price)


@app.get("/api/research/forecast-timeline", response_model=ContinuousForecastTimeline)
def get_forecast_timeline(
    symbol: str = Query("BTCUSDT"),
    timeframe: TimeFrame = Query(TimeFrame.M15)
):
    """
    Returns continuous AI Forecasting Studio timeline:
    - Historical actual vs predicted prices (last 6 closed bars)
    - Current price (NOW)
    - Future projections (+15m, +1h, +3h, +6h) with 90% confidence uncertainty cones.
    """
    snapshot = data_service.get_market_data(symbol=symbol, timeframe=timeframe, limit=250)
    if not snapshot.is_data_available or snapshot.candles_count < 20:
        raise HTTPException(status_code=503, detail="DATA UNAVAILABLE for continuous forecasting.")
    return kronos_adapter.get_continuous_timeline(snapshot.candles)


@app.get("/api/agent-network/topology", response_model=AgentNetworkTopology)
def get_agent_network_topology():
    """
    Returns live interactive Obsidian-style agent network topology:
    9 intelligent nodes, 12 active communication channels, latencies, and throughputs.
    """
    return AgentNetworkTopologyEngine.get_live_topology()


@app.get("/api/signals/live-master-signal", response_model=MasterSignalSnapshot)
def get_live_master_signal(
    symbol: str = Query("BTCUSDT"),
    timeframe: TimeFrame = Query(TimeFrame.M15)
):
    """
    Returns the real-time Master Signal and 6-Layer Multi-Filter Decomposition:
    - Layer 1: Primary Trend Engine (EMA 20/50/200)
    - Layer 2: Advisory Entry Timing (EMA 9/21 Pullback)
    - Layer 3: Momentum & Volatility Gate (ADX & Choppiness)
    - Layer 4: Microstructure & CVD Order Flow
    - Layer 5: Vibe-Trading Autonomous Council
    - Layer 6: Lopez de Prado Meta-Labeling & Sizing
    Calculates hard stop loss, take profit, Kelly lot size, and MT5 pipeline readiness.
    """
    return MasterSignalEngine.evaluate_master_signal(
        symbol=symbol,
        timeframe=timeframe,
        data_service=data_service,
        realtime_streamer=realtime_streamer,
        vibe_adapter=vibe_adapter,
        telemetry_service=telemetry_service
    )


@app.post("/api/signals/simulate-trigger")
def simulate_signal_trigger(symbol: str = Query("BTCUSDT")):
    """
    Dispatches an authentic test signal through the pipeline directly into the MT5 telemetry bridge.
    Allows immediate verification of EA execution flow.
    """
    sig = MasterSignalEngine.evaluate_master_signal(
        symbol=symbol,
        data_service=data_service,
        realtime_streamer=realtime_streamer,
        vibe_adapter=vibe_adapter,
        telemetry_service=telemetry_service
    )
    # Write to audit trail
    audit_logs.append(AuditEvent(
        component="SIGNAL_ENGINE",
        action="SIGNAL_DISPATCHED",
        level="INFO",
        detail=f"Dispatched {sig.action} ({sig.composite_confidence_pct}%) to MT5 EA. Entry=${sig.entry_price:,.2f}, SL=${sig.hard_stop_loss:,.2f}, TP=${sig.take_profit:,.2f}."
    ))
    return {
        "status": "DISPATCHED",
        "action": sig.action,
        "entry_price": sig.entry_price,
        "hard_stop_loss": sig.hard_stop_loss,
        "take_profit": sig.take_profit,
        "lot_size": sig.recommended_lot_size,
        "mt5_magic_number": sig.mt5_magic_number,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ============================================================================
# 3. EA Telemetry & Execution Monitor Endpoints
# ============================================================================

@app.get("/api/ea/status")
def get_ea_status():
    """Reads telemetry published by the MT5 Expert Advisor."""
    telemetry_data = telemetry_service.read_telemetry()
    return telemetry_data


@app.post("/api/ea/simulate-heartbeat")
def simulate_ea_heartbeat():
    """
    Simulates a verified test telemetry payload in development environment
    to demonstrate live telemetry processing when MT5 terminal is not actively running.
    """
    dummy_payload = {
        "schema_version": "1.0.0",
        "heartbeat": {
            "magic_number": 261016,
            "ea_name": "Trade2Options_BTC_Momentum",
            "ea_version": "1.0.0",
            "symbol": "BTCUSD",
            "timeframe": "M15",
            "terminal_time": datetime.now(timezone.utc).strftime("%Y.%m.%d %H:%M:%S"),
            "broker_server": "Exness-MT5Trial8",
            "account_mode": "DEMO",
            "is_trading_allowed": True,
            "is_connected": True,
            "last_tick_time": datetime.now(timezone.utc).strftime("%Y.%m.%d %H:%M"),
            "spread_points": 25.0
        },
        "risk": {
            "account_balance": 10542.50,
            "account_equity": 10618.20,
            "free_margin": 10120.00,
            "current_daily_drawdown_usd": 0.00,
            "current_daily_drawdown_pct": 0.00,
            "daily_loss_limit_usd": 500.00,
            "max_drawdown_limit_pct": 10.00,
            "is_daily_limit_breached": False,
            "max_lot_size": 2.00,
            "open_positions_count": 1,
            "max_allowed_positions": 1
        },
        "positions": [
            {
                "ticket": 89217431,
                "symbol": "BTCUSD",
                "direction": "BUY",
                "volume": 0.10,
                "open_price": 81950.00,
                "current_price": 82142.00,
                "stop_loss": 81650.00,
                "take_profit": 82550.00,
                "profit_usd": 19.20,
                "open_time": datetime.now(timezone.utc).strftime("%Y.%m.%d %H:%M:%S"),
                "magic_number": 261016
            }
        ],
        "last_signal": "BUY (Primary EMA 20/50/200 Trend Aligned)",
        "last_error": "None",
        "telemetry_updated_at": datetime.now(timezone.utc).strftime("%Y.%m.%d %H:%M:%S")
    }

    import json
    local_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "trade2options_telemetry.json"))
    with open(local_file, "w") as f:
        json.dump(dummy_payload, f, indent=2)

    audit_logs.append(AuditEvent(
        component="EA_MONITOR",
        action="TELEMETRY_REFRESHED",
        level="INFO",
        detail="Simulated test telemetry written to local bridge file."
    ))

    return {"status": "SUCCESS", "message": f"Telemetry written to {local_file}"}


# ============================================================================
# 4. Audit & Logs Endpoints
# ============================================================================

@app.get("/api/audit/logs", response_model=List[AuditEvent])
def get_audit_logs():
    """Returns the immutable system audit trail."""
    return audit_logs


# ============================================================================
# 5. Institutional Options & Greeks Endpoints ("Trade2Options" Core)
# ============================================================================

@app.get("/api/options/chain", response_model=OptionsChainSnapshot)
def get_options_chain(symbol: str = Query("BTCUSDT")):
    """Returns full calibrated Deribit Bitcoin options chain with Black-Scholes Greeks."""
    snapshot = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=50)
    current_price = snapshot.latest_candle.close if snapshot.latest_candle else 82000.0
    return deribit_adapter.get_options_chain(spot_price=current_price)


@app.get("/api/options/collar-plan", response_model=ProtectiveCollarPlan)
def get_protective_collar_plan(
    symbol: str = Query("BTCUSDT"),
    volume: float = Query(0.10, ge=0.01, le=10.0)
):
    """Calculates automated tail-risk put hedge requirements for active spot/perp inventory."""
    m15_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=250)
    h1_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.H1, limit=100)
    h4_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.H4, limit=100)

    regime_snap = MarketRegimeEngine.evaluate(
        candles_m15=m15_snap.candles if m15_snap.is_data_available else [],
        candles_h1=h1_snap.candles if h1_snap.is_data_available else None,
        candles_h4=h4_snap.candles if h4_snap.is_data_available else None
    )
    current_price = m15_snap.latest_candle.close if m15_snap.latest_candle else 82000.0

    return ProtectiveCollarEngine.evaluate_tail_hedge(
        regime=regime_snap.regime,
        spot_price=current_price,
        spot_volume_btc=volume
    )


@app.get("/api/options/yield-plan", response_model=CoveredCallPlan)
def get_covered_call_plan(
    symbol: str = Query("BTCUSDT"),
    volume: float = Query(0.10, ge=0.01, le=10.0)
):
    """Calculates systematic covered call theta yield harvesting during sideways/choppy regimes."""
    m15_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=250)
    h1_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.H1, limit=100)
    h4_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.H4, limit=100)

    regime_snap = MarketRegimeEngine.evaluate(
        candles_m15=m15_snap.candles if m15_snap.is_data_available else [],
        candles_h1=h1_snap.candles if h1_snap.is_data_available else None,
        candles_h4=h4_snap.candles if h4_snap.is_data_available else None
    )
    current_price = m15_snap.latest_candle.close if m15_snap.latest_candle else 82000.0

    return CoveredCallEngine.evaluate_yield_harvest(
        regime=regime_snap.regime,
        spot_price=current_price,
        spot_volume_btc=volume
    )


# ============================================================================
# 6. High-Frequency L2 Order Book & Order Flow CVD Endpoints
# ============================================================================

@app.get("/api/market/orderbook-l2", response_model=OrderBookL2Snapshot)
def get_orderbook_l2(symbol: str = Query("BTCUSDT")):
    """Returns real-time Level-2 order book depth (20 levels) and bid/ask imbalance ratio."""
    snapshot = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=20)
    current_price = snapshot.latest_candle.close if snapshot.latest_candle else 82000.0
    return realtime_streamer.get_latest_orderbook(current_price=current_price, symbol=symbol)


@app.get("/api/market/order-flow", response_model=OrderFlowDelta)
def get_order_flow(symbol: str = Query("BTCUSDT")):
    """Returns 15m buyer/seller volume delta, Cumulative Volume Delta (CVD), and VWAP distance."""
    snapshot = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=100)
    return realtime_streamer.get_latest_order_flow(candles=snapshot.candles if snapshot.is_data_available else [], symbol=symbol)


# ============================================================================
# 7. Institutional Multi-Venue Routing & Prop Firm Risk Endpoints
# ============================================================================

@app.get("/api/execution/sor-plan", response_model=SmartOrderRoutePlan)
def get_sor_route_plan(
    symbol: str = Query("BTCUSD"),
    volume: float = Query(0.50, ge=0.01, le=100.0),
    side: OrderSide = Query(OrderSide.BUY),
    is_prop_firm: bool = Query(True)
):
    """Calculates Smart Order Routing distribution across MT5 and direct crypto futures."""
    return SmartOrderRouter.route_order(
        symbol=symbol,
        total_volume_btc=volume,
        direction=side,
        is_prop_firm_account=is_prop_firm
    )


@app.get("/api/execution/prop-compliance", response_model=List[PropFirmAccountStatus])
def get_prop_compliance():
    """Returns multi-account prop-firm risk monitoring status and drawdown cushions."""
    # Sync with current EA telemetry if available
    telemetry = telemetry_service.read_telemetry()
    if telemetry.get("is_connected") and telemetry.get("status"):
        risk = telemetry["status"].get("risk", {})
        prop_manager.update_from_telemetry(
            current_balance=risk.get("account_balance", 100000.0),
            current_equity=risk.get("account_equity", 100000.0),
            current_daily_loss=risk.get("current_daily_drawdown_usd", 0.0)
        )
    return prop_manager.get_all_accounts()


# ============================================================================
# 8. Lopez de Prado ML Meta-Labeling & Dynamic Sizing Endpoints
# ============================================================================

@app.get("/api/ml/meta-label-assessment", response_model=MetaLabelPrediction)
def get_meta_label_assessment(
    symbol: str = Query("BTCUSDT"),
    direction: OrderSide = Query(OrderSide.BUY)
):
    """Evaluates Lopez de Prado Triple-Barrier win probability and fractional Kelly sizing multiplier."""
    m15_snap = data_service.get_market_data(symbol=symbol, timeframe=TimeFrame.M15, limit=250)
    current_price = m15_snap.latest_candle.close if m15_snap.latest_candle else 82000.0
    atr14 = 420.0
    adx14 = 28.5
    eff = 0.65

    if m15_snap.is_data_available and m15_snap.candles:
        ind = IndicatorEngine.compute_all(m15_snap.candles, TimeFrame.M15)
        if ind:
            atr14 = ind.momentum.atr_14
            adx14 = ind.momentum.adx_14
            eff = ind.momentum.directional_efficiency

    regime_snap = MarketRegimeEngine.evaluate(
        candles_m15=m15_snap.candles if m15_snap.is_data_available else []
    )
    of_delta = realtime_streamer.get_latest_order_flow(
        candles=m15_snap.candles if m15_snap.is_data_available else [],
        symbol=symbol
    )

    return MetaLabelingEngine.evaluate_signal(
        signal_name="Primary EMA 20/50/200 Momentum",
        direction=direction,
        current_price=current_price,
        atr14=atr14,
        regime=regime_snap.regime,
        adx14=adx14,
        directional_efficiency=eff,
        cvd_divergence=of_delta.delta_divergence
    )


# ============================================================================
# 9. Static Frontend Mount
# ============================================================================

from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

