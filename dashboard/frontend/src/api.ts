import {
  MarketDataSnapshot,
  IndicatorSnapshot,
  MarketRegimeSnapshot,
  ForecastResult,
  BacktestResult,
  IntegrationHealth,
  EAStatusResponse,
  AuditEvent,
  TimeFrame,
  VibeConsensusResult,
  ToricOnChainSnapshot,
  ContinuousForecastTimeline,
  AgentNetworkTopology,
  MasterSignalSnapshot
} from './types';

const API_BASE = '/api';

export async function fetchMarketCandles(symbol = 'BTCUSDT', timeframe: TimeFrame = '15m', limit = 150): Promise<MarketDataSnapshot> {
  const res = await fetch(`${API_BASE}/market/candles?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`);
  if (!res.ok) throw new Error(`Candles HTTP ${res.status}`);
  return res.json();
}

export async function fetchMarketIndicators(symbol = 'BTCUSDT', timeframe: TimeFrame = '15m'): Promise<IndicatorSnapshot> {
  const res = await fetch(`${API_BASE}/market/indicators?symbol=${symbol}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`Indicators HTTP ${res.status}`);
  return res.json();
}

export async function fetchMarketRegime(symbol = 'BTCUSDT'): Promise<MarketRegimeSnapshot> {
  const res = await fetch(`${API_BASE}/market/regime?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Regime HTTP ${res.status}`);
  return res.json();
}

export async function fetchResearchIntegrations(): Promise<IntegrationHealth[]> {
  const res = await fetch(`${API_BASE}/research/integrations`);
  if (!res.ok) throw new Error(`Integrations HTTP ${res.status}`);
  return res.json();
}

export async function fetchKronosForecast(symbol = 'BTCUSDT', timeframe: TimeFrame = '15m'): Promise<ForecastResult> {
  const res = await fetch(`${API_BASE}/research/kronos-forecast?symbol=${symbol}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`Forecast HTTP ${res.status}`);
  return res.json();
}

export async function fetchBacktestComparison(symbol = 'BTCUSDT', timeframe: TimeFrame = '15m'): Promise<Record<string, BacktestResult>> {
  const res = await fetch(`${API_BASE}/research/backtest/comparison?symbol=${symbol}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`Backtest HTTP ${res.status}`);
  const data = await res.json();
  return data.results;
}

export async function fetchEAStatus(): Promise<EAStatusResponse> {
  const res = await fetch(`${API_BASE}/ea/status`);
  if (!res.ok) throw new Error(`EA Status HTTP ${res.status}`);
  return res.json();
}

export async function triggerSimulateEAHeartbeat(): Promise<void> {
  const res = await fetch(`${API_BASE}/ea/simulate-heartbeat`, { method: 'POST' });
  if (!res.ok) throw new Error(`Simulate Heartbeat HTTP ${res.status}`);
}

export async function fetchAuditLogs(): Promise<AuditEvent[]> {
  const res = await fetch(`${API_BASE}/audit/logs`);
  if (!res.ok) throw new Error(`Audit Logs HTTP ${res.status}`);
  return res.json();
}

export async function fetchOptionsChain(symbol = 'BTCUSDT'): Promise<any> {
  const res = await fetch(`${API_BASE}/options/chain?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Options Chain HTTP ${res.status}`);
  return res.json();
}

export async function fetchProtectiveCollarPlan(symbol = 'BTCUSDT', volume = 0.10): Promise<any> {
  const res = await fetch(`${API_BASE}/options/collar-plan?symbol=${symbol}&volume=${volume}`);
  if (!res.ok) throw new Error(`Collar Plan HTTP ${res.status}`);
  return res.json();
}

export async function fetchCoveredCallPlan(symbol = 'BTCUSDT', volume = 0.10): Promise<any> {
  const res = await fetch(`${API_BASE}/options/yield-plan?symbol=${symbol}&volume=${volume}`);
  if (!res.ok) throw new Error(`Yield Plan HTTP ${res.status}`);
  return res.json();
}

export async function fetchOrderBookL2(symbol = 'BTCUSDT'): Promise<any> {
  const res = await fetch(`${API_BASE}/market/orderbook-l2?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Order Book L2 HTTP ${res.status}`);
  return res.json();
}

export async function fetchOrderFlow(symbol = 'BTCUSDT'): Promise<any> {
  const res = await fetch(`${API_BASE}/market/order-flow?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Order Flow HTTP ${res.status}`);
  return res.json();
}

export async function fetchSORPlan(symbol = 'BTCUSD', volume = 0.50, side = 'BUY'): Promise<any> {
  const res = await fetch(`${API_BASE}/execution/sor-plan?symbol=${symbol}&volume=${volume}&side=${side}&is_prop_firm=true`);
  if (!res.ok) throw new Error(`SOR Plan HTTP ${res.status}`);
  return res.json();
}

export async function fetchPropCompliance(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/execution/prop-compliance`);
  if (!res.ok) throw new Error(`Prop Compliance HTTP ${res.status}`);
  return res.json();
}

export async function fetchMetaLabelAssessment(symbol = 'BTCUSDT', direction = 'BUY'): Promise<any> {
  const res = await fetch(`${API_BASE}/ml/meta-label-assessment?symbol=${symbol}&direction=${direction}`);
  if (!res.ok) throw new Error(`Meta Label HTTP ${res.status}`);
  return res.json();
}

export async function fetchVibeCouncilDecision(symbol = 'BTCUSDT'): Promise<VibeConsensusResult> {
  const res = await fetch(`${API_BASE}/vibe/council-decision?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Vibe Council HTTP ${res.status}`);
  return res.json();
}

export async function fetchToricOnChain(symbol = 'BTCUSDT'): Promise<ToricOnChainSnapshot> {
  const res = await fetch(`${API_BASE}/toric/on-chain?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Toric On-Chain HTTP ${res.status}`);
  return res.json();
}

export async function fetchForecastTimeline(symbol = 'BTCUSDT', timeframe: TimeFrame = '15m'): Promise<ContinuousForecastTimeline> {
  const res = await fetch(`${API_BASE}/research/forecast-timeline?symbol=${symbol}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`Forecast Timeline HTTP ${res.status}`);
  return res.json();
}

export async function fetchAgentTopology(): Promise<AgentNetworkTopology> {
  const res = await fetch(`${API_BASE}/agent-network/topology`);
  if (!res.ok) throw new Error(`Agent Topology HTTP ${res.status}`);
  return res.json();
}

export async function fetchMasterSignal(symbol = 'BTCUSDT', timeframe: TimeFrame = '15m'): Promise<MasterSignalSnapshot> {
  const res = await fetch(`${API_BASE}/signals/live-master-signal?symbol=${symbol}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`Master Signal HTTP ${res.status}`);
  return res.json();
}

export async function simulateSignalTrigger(symbol = 'BTCUSDT'): Promise<any> {
  const res = await fetch(`${API_BASE}/signals/simulate-trigger?symbol=${symbol}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Simulate Signal HTTP ${res.status}`);
  return res.json();
}



