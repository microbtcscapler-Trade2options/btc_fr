"""
Trade2Options Canonical Contracts and Data Models.
Version: 1.0.0
Author: Trade2Options Quantitative Research & Engineering

This module defines deterministic, versioned data contracts used across:
- Market Data Pipeline
- Market Regime Engine
- Momentum and Entry Timing Calculators
- Research Adapters (Kronos, Vibe-Trading, TradingView, TORIC)
- EA Telemetry Bridge
- Dashboard REST & Streaming APIs
"""

from __future__ import annotations
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class TimeFrame(str, Enum):
    M1 = "1m"
    M5 = "5m"
    M15 = "15m"
    H1 = "1h"
    H4 = "4h"
    D1 = "1d"


class MarketDataSource(str, Enum):
    BINANCE_SPOT = "BINANCE_SPOT"
    BINANCE_FUTURES = "BINANCE_FUTURES"
    EXNESS_MT5 = "EXNESS_MT5"
    YAHOO_FINANCE = "YAHOO_FINANCE"
    TRADINGVIEW = "TRADINGVIEW"
    SYNTHETIC_TEST = "SYNTHETIC_TEST"


class RegimeType(str, Enum):
    BULLISH_TREND = "BULLISH_TREND"
    BEARISH_TREND = "BEARISH_TREND"
    SIDEWAYS = "SIDEWAYS"
    CHOPPY = "CHOPPY"
    HIGH_VOLATILITY_SHOCK = "HIGH_VOLATILITY_SHOCK"
    TRANSITION_UNCERTAIN = "TRANSITION_UNCERTAIN"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class EntryTimingRating(str, Enum):
    FAVORABLE = "FAVORABLE"
    IMPROVING = "IMPROVING"
    NEUTRAL = "NEUTRAL"
    WEAKENING = "WEAKENING"
    CONFLICTING = "CONFLICTING"
    NOT_ENOUGH_DATA = "NOT_ENOUGH_DATA"


class IntegrationState(str, Enum):
    NOT_CONFIGURED = "NOT_CONFIGURED"
    CONNECTED = "CONNECTED"
    RUNNING = "RUNNING"
    STALE = "STALE"
    FAILED = "FAILED"


class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


# ============================================================================
# 1. Market Data Models
# ============================================================================

class Candle(BaseModel):
    """Canonical representation of an OHLCV candle."""
    timestamp: datetime = Field(..., description="UTC bar open timestamp")
    open: float = Field(..., gt=0.0)
    high: float = Field(..., gt=0.0)
    low: float = Field(..., gt=0.0)
    close: float = Field(..., gt=0.0)
    volume: float = Field(..., ge=0.0)
    is_closed: bool = Field(True, description="False if forming live intrabar")
    source: MarketDataSource = MarketDataSource.BINANCE_SPOT
    symbol: str = "BTCUSDT"
    timeframe: TimeFrame = TimeFrame.M15

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class MarketDataSnapshot(BaseModel):
    """Collection of recent candles with health metadata."""
    symbol: str
    timeframe: TimeFrame
    source: MarketDataSource
    venue: str = "BINANCE"
    retrieved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    candles_count: int
    latest_candle: Optional[Candle] = None
    candles: List[Candle] = Field(default_factory=list)
    is_data_available: bool = True
    error_message: Optional[str] = None


# ============================================================================
# 2. Indicators & Regime Models
# ============================================================================

class PrimaryTrendSnapshot(BaseModel):
    """Layer A: Primary Trend Intelligence (EMA 20/50/200)."""
    timeframe: TimeFrame
    ema20: float
    ema50: float
    ema200: float
    price_to_ema200_pct: float
    ema20_slope_deg: float
    ema50_slope_deg: float
    ema200_slope_deg: float
    is_aligned_bullish: bool
    is_aligned_bearish: bool
    trend_description: str


class EntryTimingAssessment(BaseModel):
    """Layer B: Entry Timing Intelligence (EMA 9/21/200) - Advisory Only."""
    timeframe: TimeFrame
    ema9: float
    ema21: float
    ema200: float
    ema9_above_ema21: bool
    crossover_age_bars: int
    price_vs_ema9_pct: float
    pullback_depth_atr: float
    score: float = Field(..., ge=0.0, le=100.0)
    rating: EntryTimingRating
    factor_breakdown: Dict[str, float] = Field(default_factory=dict)
    agreement_with_primary_trend: bool
    is_advisory_notice: str = "ADVISORY ONLY — DOES NOT CONTROL LIVE EA EXECUTION"


class MomentumFeatures(BaseModel):
    """Additional institutional momentum and volatility features."""
    roc_14: float
    rsi_14: float
    adx_14: float
    plus_di: float
    minus_di: float
    atr_14: float
    atr_percentile_100: float
    relative_volume: float
    choppiness_index: float
    directional_efficiency: float
    swing_high_20: float
    swing_low_20: float


class IndicatorSnapshot(BaseModel):
    """Comprehensive snapshot of indicators across primary & entry layers."""
    symbol: str
    timeframe: TimeFrame
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    primary_trend: PrimaryTrendSnapshot
    entry_timing: EntryTimingAssessment
    momentum: MomentumFeatures


class MarketRegimeSnapshot(BaseModel):
    """Deterministic, explainable market-regime classification."""
    symbol: str
    timeframe: TimeFrame
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    regime: RegimeType
    confidence_pct: float = Field(..., ge=0.0, le=100.0)
    supporting_indicators: List[str] = Field(default_factory=list)
    conflicting_indicators: List[str] = Field(default_factory=list)
    recent_transitions: List[Dict[str, Any]] = Field(default_factory=list)
    higher_timeframe_agreement: Dict[str, str] = Field(default_factory=dict)
    data_freshness_seconds: float
    rationale: str


# ============================================================================
# 3. Research, Forecast & Backtest Models
# ============================================================================

class ForecastHorizonDetail(BaseModel):
    horizon_candles: int
    target_timestamp: str
    predicted_close: float
    predicted_change_pct: float
    expected_volatility_pct: float
    confidence_pct: float
    interval_90_lower: float
    interval_90_upper: float


class ForecastResult(BaseModel):
    """Output contract from Kronos or forecasting engine."""
    experiment_id: str
    model_name: str
    model_version: str
    symbol: str
    timeframe: TimeFrame
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_known_close: float
    forecast_horizons: Dict[str, ForecastHorizonDetail] = Field(default_factory=dict)
    mae_vs_persistence: Optional[float] = None
    directional_accuracy_pct: Optional[float] = None
    is_trading_signal: bool = False
    validation_status: str = "RESEARCH_ONLY"


class BacktestMetrics(BaseModel):
    net_profit_usd: float
    net_return_pct: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_pct: float
    profit_factor: float
    expectancy_usd: float
    max_drawdown_usd: float
    max_drawdown_pct: float
    avg_win_usd: float
    avg_loss_usd: float
    sharpe_ratio: float
    total_fees_slippage_usd: float
    regime_breakdown: Dict[str, Dict[str, Any]] = Field(default_factory=dict)


class BacktestResult(BaseModel):
    """Result of a backtest experiment with full provenance."""
    experiment_id: str
    strategy_name: str
    strategy_version: str
    symbol: str
    timeframe: TimeFrame
    start_date: str
    end_date: str
    in_sample_metrics: BacktestMetrics
    out_of_sample_metrics: BacktestMetrics
    equity_curve: List[Dict[str, Any]] = Field(default_factory=list)
    assumptions: Dict[str, Any] = Field(default_factory=dict)
    reproducible_hash: str


class ResearchExperiment(BaseModel):
    experiment_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    adapter_name: str
    status: str = "COMPLETED"
    dataset_range: str
    notes: str
    metrics: Dict[str, Any] = Field(default_factory=dict)


# ============================================================================
# 4. EA Telemetry & Execution Models
# ============================================================================

class EAHeartbeat(BaseModel):
    magic_number: int
    ea_name: str = "Trade2Options_BTC_Momentum"
    ea_version: str = "1.0.0"
    symbol: str = "BTCUSD"
    timeframe: str = "M15"
    terminal_time: str
    broker_server: str
    account_mode: str = "DEMO"
    is_trading_allowed: bool
    is_connected: bool
    last_tick_time: str
    spread_points: float


class PositionSnapshot(BaseModel):
    ticket: int
    symbol: str
    direction: OrderSide
    volume: float
    open_price: float
    current_price: float
    stop_loss: float
    take_profit: float
    profit_usd: float
    open_time: str
    magic_number: int


class RiskStatus(BaseModel):
    account_balance: float
    account_equity: float
    free_margin: float
    current_daily_drawdown_usd: float
    current_daily_drawdown_pct: float
    daily_loss_limit_usd: float
    max_drawdown_limit_pct: float
    is_daily_limit_breached: bool
    max_lot_size: float
    open_positions_count: int
    max_allowed_positions: int


class ExecutionEvent(BaseModel):
    timestamp: str
    ticket: int
    symbol: str
    event_type: str  # ENTRY, SL_HIT, TP_HIT, TRAILING_STOP, REJECTED
    direction: OrderSide
    volume: float
    price: float
    slippage_points: float
    result_code: int
    comment: str


class EAStatus(BaseModel):
    """Full telemetry bundle from MT5 EA to Dashboard."""
    schema_version: str = "1.0.0"
    heartbeat: EAHeartbeat
    risk: RiskStatus
    positions: List[PositionSnapshot] = Field(default_factory=list)
    recent_events: List[ExecutionEvent] = Field(default_factory=list)
    last_signal: str = "NONE"
    telemetry_updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IntegrationHealth(BaseModel):
    name: str
    category: str  # RESEARCH_ADAPTER, DATA_PROVIDER, EXECUTION_BRIDGE
    state: IntegrationState
    endpoint: Optional[str] = None
    last_check_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    latency_ms: Optional[float] = None
    message: str
    details: Dict[str, Any] = Field(default_factory=dict)


class AuditEvent(BaseModel):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    component: str
    action: str
    level: str = "INFO"
    detail: str


# ============================================================================
# 5. Institutional Options & Greeks Models ("Trade2Options" Core)
# ============================================================================

class OptionType(str, Enum):
    CALL = "CALL"
    PUT = "PUT"


class GreeksSnapshot(BaseModel):
    delta: float
    gamma: float
    theta: float
    vega: float
    rho: float
    implied_volatility: float


class OptionContract(BaseModel):
    instrument_name: str
    strike: float
    expiration: datetime
    option_type: OptionType
    bid_price: float
    ask_price: float
    mark_price: float
    underlying_price: float
    volume_24h: float
    open_interest: float
    greeks: GreeksSnapshot


class OptionsChainSnapshot(BaseModel):
    underlying_symbol: str = "BTC"
    underlying_price: float
    dvol_index: float  # Deribit 30-day BTC Implied Volatility Index
    retrieved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    contracts_count: int
    contracts: List[OptionContract] = Field(default_factory=list)


class ProtectiveCollarPlan(BaseModel):
    """Automated Downside Tail-Risk Put Hedging Specification."""
    status: str  # ACTIVE_HEDGE_RECOMMENDED, NO_HEDGE_NEEDED, INSUFFICIENT_POSITION
    symbol: str
    underlying_position_ticket: Optional[int] = None
    spot_position_volume: float
    regime_trigger: RegimeType
    recommended_put_contract: str
    put_strike: float
    expiration_date: str
    put_delta: float
    implied_volatility: float
    max_portfolio_loss_pct: float
    estimated_premium_cost_usd: float
    rationale: str
    is_automated_execution_ready: bool = False


class CoveredCallPlan(BaseModel):
    """Systematic Sideways/Choppy Yield Harvesting Specification."""
    status: str  # HARVEST_RECOMMENDED, HOLD_OFF, NO_LONG_INVENTORY
    symbol: str
    spot_position_volume: float
    regime_trigger: RegimeType
    recommended_call_contract: str
    call_strike: float
    expiration_date: str
    call_delta: float
    estimated_yield_usd: float
    annualized_yield_pct: float
    upside_cushion_pct: float
    rationale: str


# ============================================================================
# 6. High-Frequency L2 Order Book & Order Flow Delta (CVD) Models
# ============================================================================

class OrderBookLevel(BaseModel):
    price: float
    size: float


class OrderBookL2Snapshot(BaseModel):
    symbol: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    bids: List[OrderBookLevel] = Field(default_factory=list)
    asks: List[OrderBookLevel] = Field(default_factory=list)
    spread_usd: float
    spread_bps: float
    mid_price: float
    bid_depth_usd: float
    ask_depth_usd: float
    imbalance_ratio: float  # bid_depth / (bid_depth + ask_depth)


class OrderFlowDelta(BaseModel):
    symbol: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cumulative_volume_delta: float  # CVD in BTC
    buyer_volume_15m: float
    seller_volume_15m: float
    delta_divergence: str  # BULLISH_ABSORPTION, BEARISH_ABSORPTION, NEUTRAL
    vwap_price: float
    price_vs_vwap_pct: float


# ============================================================================
# 7. Institutional Multi-Venue Smart Order Routing (SOR) & Prop Risk
# ============================================================================

class VenueAllocation(BaseModel):
    venue_name: str  # MT5_EXNESS_CFD, BINANCE_FUTURES, BYBIT_PERP, CME_FUTURES
    allocation_pct: float
    allocated_volume_btc: float
    estimated_spread_points: float
    estimated_fee_usd: float
    latency_ms: float


class SmartOrderRoutePlan(BaseModel):
    symbol: str
    total_volume_btc: float
    direction: OrderSide
    order_type: str  # MARKET, TWAP_SLICE, ICEBERG
    venues: List[VenueAllocation] = Field(default_factory=list)
    primary_venue: str
    estimated_slippage_usd: float
    total_estimated_costs_usd: float
    execution_rationale: str


class PropFirmAccountStatus(BaseModel):
    account_id: str
    firm_name: str  # FTMO, FUNDED_NEXT, EXNESS_PRO, PERSONAL_PROP
    account_tier: str  # $100K_CHALLENGE, $200K_FUNDED, MASTER_CAPITAL
    initial_balance: float
    current_equity: float
    daily_starting_equity: float
    current_daily_loss_usd: float
    daily_loss_limit_usd: float
    daily_drawdown_pct: float
    max_daily_drawdown_allowed_pct: float
    trailing_drawdown_usd: float
    max_trailing_drawdown_allowed_pct: float
    is_daily_breached: bool
    is_max_breached: bool
    is_trading_frozen: bool
    drawdown_safety_cushion_usd: float
    status_color: str  # GREEN, YELLOW, CRITICAL_RED


# ============================================================================
# 8. Lopez de Prado ML Meta-Labeling & Dynamic Sizing
# ============================================================================

class MetaLabelPrediction(BaseModel):
    signal_name: str
    direction: OrderSide
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    win_probability_pct: float  # P(TP hit before SL hit)
    barrier_take_profit: float
    barrier_stop_loss: float
    barrier_time_bars: int
    raw_kelly_fraction: float
    constrained_lot_multiplier: float  # Sizing scale: 0.25x to 1.50x
    veto_trade: bool
    meta_decision_rationale: str


# ============================================================================
# 9. Vibe-Trading Autonomous Multi-Agent Council Schemas
# ============================================================================

class VibeAgentAnalysis(BaseModel):
    agent_name: str  # Technical_Analyst, Order_Flow_Specialist, Risk_Gatekeeper
    stance: str  # BULLISH, BEARISH, NEUTRAL, VETO
    conviction_pct: float
    key_observation: str
    metrics: Dict[str, Any] = Field(default_factory=dict)


class VibeConsensusResult(BaseModel):
    consensus_verdict: str  # STRONG_BUY, MODERATE_BUY, NEUTRAL_WAIT, STRONG_SELL, RISK_VETO
    composite_conviction_pct: float
    recommended_action: str
    agents: List[VibeAgentAnalysis] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    executive_rationale: str


# ============================================================================
# 10. TORIC On-Chain & Macro Sentiment Schemas
# ============================================================================

class ToricOnChainSnapshot(BaseModel):
    whale_net_flow_btc_24h: float  # Net accumulation in BTC
    exchange_reserve_trend: str  # ACCUMULATION_OUTFLOW, DISTRIBUTION_INFLOW, FLAT
    mvrv_z_score: float  # 0.0 to 7.0+
    funding_rate_annualized_pct: float
    on_chain_sentiment: str  # BULLISH_ACCUMULATION, OVERHEATED, SQUEEZE_RISK, CAPITULATION
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    macro_liquidity_index: float  # 0-100


# ============================================================================
# 11. Continuous AI Forecasting Studio Schemas
# ============================================================================

class ForecastDataPoint(BaseModel):
    timestamp: str
    horizon_label: str  # NOW, +15m, +1h, +3h, +6h
    predicted_price: float
    lower_bound_90: float
    upper_bound_90: float
    actual_price: Optional[float] = None
    is_projection: bool = False


class ContinuousForecastTimeline(BaseModel):
    model_name: str = "Kronos-RevIN-MultiHorizon"
    current_price: float
    current_timestamp: str
    forecast_points: List[ForecastDataPoint] = Field(default_factory=list)
    expected_direction: str  # BULLISH_EXPANSION, BEARISH_DRIFT, CONSOLIDATION
    confidence_pct: float
    forecast_summary: str


# ============================================================================
# 12. Obsidian-Style Live Agent Network Graph Schemas
# ============================================================================

class AgentNetworkNode(BaseModel):
    id: str
    name: str
    category: str  # DATA_FEED, AI_MODEL, RESEARCH_COUNCIL, DERIVATIVES, EXECUTION
    status: str  # RUNNING, STREAMING, ACTIVE, SYNCED
    latency_ms: float
    messages_processed: int
    last_active: str
    role_description: str
    x_pos: Optional[float] = None
    y_pos: Optional[float] = None


class AgentNetworkEdge(BaseModel):
    source: str
    target: str
    channel_name: str
    packet_rate_per_sec: float
    is_active: bool = True


class AgentNetworkTopology(BaseModel):
    nodes: List[AgentNetworkNode] = Field(default_factory=list)
    edges: List[AgentNetworkEdge] = Field(default_factory=list)
    total_packet_throughput: float
    active_agent_count: int
    system_status: str = "OPTIMAL_COUPLED"


# ============================================================================
# 13. Institutional Signal & Execution Lab Schemas
# ============================================================================

class SignalLayerDetail(BaseModel):
    layer_id: str
    name: str
    passed: bool
    weight_pct: float
    score: float  # 0 to 100
    signal: str  # BULLISH, BEARISH, NEUTRAL, VETO
    metrics: Dict[str, Any] = Field(default_factory=dict)
    summary: str


class SignalExecutionStage(BaseModel):
    stage_id: str
    name: str
    status: str  # COMPLETED, ACTIVE, BLOCKED, PENDING
    detail: str
    latency_ms: float


class MasterSignalSnapshot(BaseModel):
    symbol: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    action: str  # STRONG_BUY, MODERATE_BUY, STANDBY_NEUTRAL, STRONG_SELL, RISK_VETO
    composite_confidence_pct: float
    entry_price: float
    hard_stop_loss: float
    take_profit: float
    risk_reward_ratio: float
    recommended_lot_size: float
    mt5_status: str  # ARMED_AND_READY, TRADE_OPEN, REGIME_FILTERED, DAILY_LIMIT_CUTOFF
    mt5_magic_number: int = 261016
    layers: List[SignalLayerDetail] = Field(default_factory=list)
    pipeline_stages: List[SignalExecutionStage] = Field(default_factory=list)
    executive_summary: str



