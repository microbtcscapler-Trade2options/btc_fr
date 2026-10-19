export type TimeFrame = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  is_closed: boolean;
  source: string;
  symbol: string;
}

export interface MarketDataSnapshot {
  symbol: string;
  timeframe: TimeFrame;
  source: string;
  venue: string;
  retrieved_at: string;
  candles_count: number;
  latest_candle: Candle | null;
  candles: Candle[];
  is_data_available: boolean;
  error_message?: string;
}

export interface PrimaryTrendSnapshot {
  timeframe: TimeFrame;
  ema20: number;
  ema50: number;
  ema200: number;
  price_to_ema200_pct: number;
  ema20_slope_deg: number;
  ema50_slope_deg: number;
  ema200_slope_deg: number;
  is_aligned_bullish: boolean;
  is_aligned_bearish: boolean;
  trend_description: string;
}

export interface EntryTimingAssessment {
  timeframe: TimeFrame;
  ema9: number;
  ema21: number;
  ema200: number;
  ema9_above_ema21: boolean;
  crossover_age_bars: number;
  price_vs_ema9_pct: number;
  pullback_depth_atr: number;
  score: number;
  rating: string;
  factor_breakdown: Record<string, number>;
  agreement_with_primary_trend: boolean;
  is_advisory_notice: string;
}

export interface MomentumFeatures {
  roc_14: number;
  rsi_14: number;
  adx_14: number;
  plus_di: number;
  minus_di: number;
  atr_14: number;
  atr_percentile_100: number;
  relative_volume: number;
  choppiness_index: number;
  directional_efficiency: number;
  swing_high_20: number;
  swing_low_20: number;
}

export interface IndicatorSnapshot {
  symbol: string;
  timeframe: TimeFrame;
  calculated_at: string;
  primary_trend: PrimaryTrendSnapshot;
  entry_timing: EntryTimingAssessment;
  momentum: MomentumFeatures;
}

export interface MarketRegimeSnapshot {
  symbol: string;
  timeframe: TimeFrame;
  timestamp: string;
  regime: string;
  confidence_pct: number;
  supporting_indicators: string[];
  conflicting_indicators: string[];
  higher_timeframe_agreement: Record<string, string>;
  data_freshness_seconds: number;
  rationale: string;
}

export interface ForecastHorizonDetail {
  horizon_candles: number;
  target_timestamp: string;
  predicted_close: number;
  predicted_change_pct: number;
  expected_volatility_pct: number;
  confidence_pct: number;
  interval_90_lower: number;
  interval_90_upper: number;
}

export interface ForecastResult {
  experiment_id: string;
  model_name: string;
  model_version: string;
  symbol: string;
  timeframe: TimeFrame;
  generated_at: string;
  last_known_close: number;
  forecast_horizons: Record<string, ForecastHorizonDetail>;
  mae_vs_persistence?: number;
  directional_accuracy_pct?: number;
  is_trading_signal: boolean;
  validation_status: string;
}

export interface BacktestMetrics {
  net_profit_usd: number;
  net_return_pct: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_pct: number;
  profit_factor: number;
  expectancy_usd: number;
  max_drawdown_usd: number;
  max_drawdown_pct: number;
  avg_win_usd: number;
  avg_loss_usd: number;
  sharpe_ratio: number;
  total_fees_slippage_usd: number;
  regime_breakdown: Record<string, any>;
}

export interface BacktestResult {
  experiment_id: string;
  strategy_name: string;
  strategy_version: string;
  symbol: string;
  timeframe: TimeFrame;
  start_date: string;
  end_date: string;
  in_sample_metrics: BacktestMetrics;
  out_of_sample_metrics: BacktestMetrics;
  equity_curve: Array<{ timestamp: string; balance: number; equity: number; drawdown_pct: number }>;
  assumptions: Record<string, any>;
  reproducible_hash: string;
}

export interface IntegrationHealth {
  name: string;
  category: string;
  state: "NOT_CONFIGURED" | "CONNECTED" | "RUNNING" | "STALE" | "FAILED";
  endpoint?: string;
  last_check_time: string;
  latency_ms?: number;
  message: string;
  details: Record<string, any>;
}

export interface PositionSnapshot {
  ticket: number;
  symbol: string;
  direction: "BUY" | "SELL";
  volume: number;
  open_price: number;
  current_price: number;
  stop_loss: number;
  take_profit: number;
  profit_usd: number;
  open_time: string;
  magic_number: number;
}

export interface RiskStatus {
  account_balance: number;
  account_equity: number;
  free_margin: number;
  current_daily_drawdown_usd: number;
  current_daily_drawdown_pct: number;
  daily_loss_limit_usd: number;
  max_drawdown_limit_pct: number;
  is_daily_limit_breached: boolean;
  max_lot_size: number;
  open_positions_count: number;
  max_allowed_positions: number;
}

export interface EAHeartbeat {
  magic_number: number;
  ea_name: string;
  ea_version: string;
  symbol: string;
  timeframe: string;
  terminal_time: string;
  broker_server: string;
  account_mode: string;
  is_trading_allowed: boolean;
  is_connected: boolean;
  last_tick_time: string;
  spread_points: number;
}

export interface EAStatusResponse {
  is_connected: boolean;
  is_stale: boolean;
  file_age_seconds?: number;
  file_path?: string;
  message: string;
  status: {
    schema_version: string;
    heartbeat: EAHeartbeat;
    risk: RiskStatus;
    positions: PositionSnapshot[];
    last_signal: string;
    last_error: string;
    telemetry_updated_at: string;
  } | null;
}

export interface AuditEvent {
  timestamp: string;
  component: string;
  action: string;
  level: string;
  detail: string;
}

export interface GreeksSnapshot {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  implied_volatility: number;
}

export interface OptionContract {
  instrument_name: string;
  strike: number;
  expiration: string;
  option_type: 'CALL' | 'PUT';
  bid_price: number;
  ask_price: number;
  mark_price: number;
  underlying_price: number;
  volume_24h: number;
  open_interest: number;
  greeks: GreeksSnapshot;
}

export interface OptionsChainSnapshot {
  underlying_symbol: string;
  underlying_price: number;
  dvol_index: number;
  retrieved_at: string;
  contracts_count: number;
  contracts: OptionContract[];
}

export interface ProtectiveCollarPlan {
  status: string;
  symbol: string;
  underlying_position_ticket: number | null;
  spot_position_volume: number;
  regime_trigger: string;
  recommended_put_contract: string;
  put_strike: number;
  expiration_date: string;
  put_delta: number;
  implied_volatility: number;
  max_portfolio_loss_pct: number;
  estimated_premium_cost_usd: number;
  rationale: string;
  is_automated_execution_ready: boolean;
}

export interface CoveredCallPlan {
  status: string;
  symbol: string;
  spot_position_volume: number;
  regime_trigger: string;
  recommended_call_contract: string;
  call_strike: number;
  expiration_date: string;
  call_delta: number;
  estimated_yield_usd: number;
  annualized_yield_pct: number;
  upside_cushion_pct: number;
  rationale: string;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBookL2Snapshot {
  symbol: string;
  timestamp: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread_usd: number;
  spread_bps: number;
  mid_price: number;
  bid_depth_usd: number;
  ask_depth_usd: number;
  imbalance_ratio: number;
}

export interface OrderFlowDelta {
  symbol: string;
  timestamp: string;
  cumulative_volume_delta: number;
  buyer_volume_15m: number;
  seller_volume_15m: number;
  delta_divergence: string;
  vwap_price: number;
  price_vs_vwap_pct: number;
}

export interface VenueAllocation {
  venue_name: string;
  allocation_pct: number;
  allocated_volume_btc: number;
  estimated_spread_points: number;
  estimated_fee_usd: number;
  latency_ms: number;
}

export interface SmartOrderRoutePlan {
  symbol: string;
  total_volume_btc: number;
  direction: string;
  order_type: string;
  venues: VenueAllocation[];
  primary_venue: string;
  estimated_slippage_usd: number;
  total_estimated_costs_usd: number;
  execution_rationale: string;
}

export interface PropFirmAccountStatus {
  account_id: string;
  firm_name: string;
  account_tier: string;
  initial_balance: number;
  current_equity: number;
  daily_starting_equity: number;
  current_daily_loss_usd: number;
  daily_loss_limit_usd: number;
  daily_drawdown_pct: number;
  max_daily_drawdown_allowed_pct: number;
  trailing_drawdown_usd: number;
  max_trailing_drawdown_allowed_pct: number;
  is_daily_breached: boolean;
  is_max_breached: boolean;
  is_trading_frozen: boolean;
  drawdown_safety_cushion_usd: number;
  status_color: string;
}

export interface MetaLabelPrediction {
  signal_name: string;
  direction: string;
  timestamp: string;
  win_probability_pct: number;
  barrier_take_profit: number;
  barrier_stop_loss: number;
  barrier_time_bars: number;
  raw_kelly_fraction: number;
  constrained_lot_multiplier: number;
  veto_trade: boolean;
  meta_decision_rationale: string;
}

export interface VibeAgentAnalysis {
  agent_name: string;
  stance: string;
  conviction_pct: number;
  key_observation: string;
  metrics: Record<string, any>;
}

export interface VibeConsensusResult {
  consensus_verdict: string;
  composite_conviction_pct: number;
  recommended_action: string;
  agents: VibeAgentAnalysis[];
  timestamp: string;
  executive_rationale: string;
}

export interface ToricOnChainSnapshot {
  whale_net_flow_btc_24h: number;
  exchange_reserve_trend: string;
  mvrv_z_score: number;
  funding_rate_annualized_pct: number;
  on_chain_sentiment: string;
  timestamp: string;
  macro_liquidity_index: number;
}

export interface ForecastDataPoint {
  timestamp: string;
  horizon_label: string;
  predicted_price: number;
  lower_bound_90: number;
  upper_bound_90: number;
  actual_price?: number | null;
  is_projection: boolean;
}

export interface ContinuousForecastTimeline {
  model_name: string;
  current_price: number;
  current_timestamp: string;
  forecast_points: ForecastDataPoint[];
  expected_direction: string;
  confidence_pct: number;
  forecast_summary: string;
}

export interface AgentNetworkNode {
  id: string;
  name: string;
  category: string;
  status: string;
  latency_ms: number;
  messages_processed: number;
  last_active: string;
  role_description: string;
  x_pos?: number;
  y_pos?: number;
}

export interface AgentNetworkEdge {
  source: string;
  target: string;
  channel_name: string;
  packet_rate_per_sec: number;
  is_active: boolean;
}

export interface AgentNetworkTopology {
  nodes: AgentNetworkNode[];
  edges: AgentNetworkEdge[];
  total_packet_throughput: number;
  active_agent_count: number;
  system_status: string;
}

export interface SignalLayerDetail {
  layer_id: string;
  name: string;
  passed: boolean;
  weight_pct: number;
  score: number;
  signal: string;
  metrics: Record<string, any>;
  summary: string;
}

export interface SignalExecutionStage {
  stage_id: string;
  name: string;
  status: string; // COMPLETED, ACTIVE, BLOCKED, PENDING
  detail: string;
  latency_ms: number;
}

export interface MasterSignalSnapshot {
  symbol: string;
  timestamp: string;
  action: string; // STRONG_BUY, MODERATE_BUY, STANDBY_NEUTRAL, STRONG_SELL, RISK_VETO
  composite_confidence_pct: number;
  entry_price: number;
  hard_stop_loss: number;
  take_profit: number;
  risk_reward_ratio: number;
  recommended_lot_size: number;
  mt5_status: string;
  mt5_magic_number: number;
  layers: SignalLayerDetail[];
  pipeline_stages: SignalExecutionStage[];
  executive_summary: string;
}



