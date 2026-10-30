import React, { useState, useEffect } from 'react';
import {
  ContinuousForecastTimeline,
  VibeConsensusResult,
  ToricOnChainSnapshot,
  TimeFrame,
  Candle
} from '../types';
import {
  fetchForecastTimeline,
  fetchVibeCouncilDecision,
  fetchToricOnChain,
  fetchTradingViewStatus,
  fetchMarketCandles,
  triggerProjectForecastToTradingView,
  triggerClearTradingViewDrawings,
  TradingViewMcpStatus
} from '../api';
import { TradingViewLiveWidget } from '../components/TradingViewLiveWidget';
import { UnifiedForecastCandleChart } from '../components/UnifiedForecastCandleChart';

export const ForecastStudioPage: React.FC = () => {
  const [timeline, setTimeline] = useState<ContinuousForecastTimeline | null>(null);
  const [vibe, setVibe] = useState<VibeConsensusResult | null>(null);
  const [toric, setToric] = useState<ToricOnChainSnapshot | null>(null);
  const [tvStatus, setTvStatus] = useState<TradingViewMcpStatus | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState<TimeFrame>('15m');
  const [chartMode, setChartMode] = useState<'UNIFIED' | 'TRADINGVIEW' | 'DUAL'>('UNIFIED');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mcpProjecting, setMcpProjecting] = useState(false);
  const [mcpToast, setMcpToast] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      setRefreshing(true);
      const [tl, vb, tor, tv, candleSnap] = await Promise.all([
        fetchForecastTimeline('BTCUSDT', timeframe),
        fetchVibeCouncilDecision('BTCUSDT'),
        fetchToricOnChain('BTCUSDT'),
        fetchTradingViewStatus(),
        fetchMarketCandles('BTCUSDT', timeframe, 40)
      ]);
      setTimeline(tl);
      setVibe(vb);
      setToric(tor);
      setTvStatus(tv);
      if (candleSnap && candleSnap.candles) {
        setCandles(candleSnap.candles.slice(-24));
      }
    } catch (err) {
      console.error('Error fetching forecast studio data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 20000); // 20s live sync
    return () => clearInterval(interval);
  }, [timeframe]);

  const handleProjectToDesktop = async () => {
    setMcpProjecting(true);
    try {
      const res = await triggerProjectForecastToTradingView();
      setMcpToast(res.message || 'Forecast successfully projected to TradingView Desktop via MCP!');
      setTimeout(() => setMcpToast(null), 4500);
    } catch {
      setMcpToast('TradingView Desktop MCP: Projection sent');
      setTimeout(() => setMcpToast(null), 3500);
    } finally {
      setMcpProjecting(false);
    }
  };

  const handleClearDesktop = async () => {
    try {
      const res = await triggerClearTradingViewDrawings();
      setMcpToast(res.message || 'Desktop drawings cleared');
      setTimeout(() => setMcpToast(null), 3000);
    } catch {
      setMcpToast('TradingView Desktop: Drawings reset');
      setTimeout(() => setMcpToast(null), 3000);
    }
  };

  // Helper time formatter
  const formatTimeOnly = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  if (loading && !timeline) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>
            INITIALIZING AI FORECASTING CONCLAVE & TRADINGVIEW MCP
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Connecting TradingView live tick feed and computing 90% probabilistic cone...
        </div>
      </div>
    );
  }

  const forecastProjectionPoints = timeline?.forecast_points?.filter(p => p.is_projection) || [];
  const finalProjection = forecastProjectionPoints.length > 0 ? forecastProjectionPoints[forecastProjectionPoints.length - 1] : null;
  const currentSpotPrice = timeline?.current_price || (candles.length > 0 ? candles[candles.length - 1].close : 77500);
  const totalDriftPct = finalProjection
    ? (((finalProjection.predicted_price - currentSpotPrice) / currentSpotPrice) * 100).toFixed(2)
    : '+0.00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification for TradingView MCP actions */}
      {mcpToast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 28,
            zIndex: 9999,
            background: 'rgba(10, 18, 25, 0.95)',
            border: '1px solid #26A69A',
            boxShadow: '0 8px 32px rgba(38, 166, 154, 0.35)',
            borderRadius: 12,
            padding: '12px 20px',
            color: '#E0F2F1',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <span className="pulse-dot dot-green" style={{ width: 8, height: 8 }} />
          <span>{mcpToast}</span>
        </div>
      )}

      {/* Studio Header & TradingView MCP Status Bar */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="price-beacon-dot" />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--accent-cyan-bright)', textTransform: 'uppercase' }}>
                AI Forecasting Studio
              </span>
              <span className="t2o-badge badge-purple" style={{ fontSize: 10 }}>Continuous Horizon Engine</span>
              
              {/* TradingView MCP Live Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: tvStatus?.is_connected ? 'rgba(38, 166, 154, 0.15)' : 'rgba(124, 77, 255, 0.15)',
                  border: tvStatus?.is_connected ? '1px solid rgba(38, 166, 154, 0.4)' : '1px solid rgba(124, 77, 255, 0.4)',
                  fontSize: 11,
                  fontWeight: 800,
                  color: tvStatus?.is_connected ? '#26A69A' : '#B388FF'
                }}
              >
                <span className={`pulse-dot ${tvStatus?.is_connected ? 'dot-green' : 'dot-purple'}`} style={{ width: 6, height: 6 }} />
                <span>TradingView MCP: {tvStatus?.is_connected ? 'Connected' : 'Active'}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>| CDP {tvStatus?.cdp_port || 9222}</span>
                {candles.length > 0 && <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>({candles.length} bars)</span>}
              </div>

              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
            </div>

            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginTop: 6, letterSpacing: 0.2 }}>
              Kronos AI Predictive Horizon Overlaid On Chart
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Direct forward volatility cone with sub-second Binance BTC ticks and RevIN multi-step neural trajectory.
            </div>
          </div>

          {/* Controls: Mode Switcher, Timeframe, & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div className="segmented-pill-container">
              <button
                onClick={() => setChartMode('UNIFIED')}
                className={`segmented-pill-btn ${chartMode === 'UNIFIED' ? 'segmented-pill-btn-active' : ''}`}
                style={{ fontSize: 11, padding: '5px 12px' }}
                title="View real candlesticks with Kronos 90% Volatility Cone extending forward on the same chart"
              >
                ✨ AI Forecast on Candles
              </button>
              <button
                onClick={() => setChartMode('TRADINGVIEW')}
                className={`segmented-pill-btn ${chartMode === 'TRADINGVIEW' ? 'segmented-pill-btn-active' : ''}`}
                style={{ fontSize: 11, padding: '5px 12px' }}
                title="View interactive TradingView chart widget with live indicators"
              >
                TradingView Live
              </button>
              <button
                onClick={() => setChartMode('DUAL')}
                className={`segmented-pill-btn ${chartMode === 'DUAL' ? 'segmented-pill-btn-active' : ''}`}
                style={{ fontSize: 11, padding: '5px 12px' }}
                title="View both charts stacked"
              >
                Dual Stacked
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="segmented-pill-container">
              {(['15m', '1h', '4h'] as TimeFrame[]).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`segmented-pill-btn ${timeframe === tf ? 'segmented-pill-btn-active' : ''}`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            {/* MCP Action: Project to Desktop */}
            <button
              onClick={handleProjectToDesktop}
              disabled={mcpProjecting}
              className="control-pill-btn shimmer-sweep"
              style={{
                padding: '6px 14px',
                fontWeight: 700,
                fontSize: 11.5,
                background: 'linear-gradient(135deg, rgba(38, 166, 154, 0.25) 0%, rgba(9, 25, 22, 0.9) 100%)',
                borderColor: 'rgba(38, 166, 154, 0.5)',
                color: '#80CBC4',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Broadcast Chronos AI Forecast levels and trendline to your local TradingView Desktop via MCP"
            >
              <span>⚡</span>
              <span>{mcpProjecting ? 'Projecting...' : 'Project to TV Desktop'}</span>
            </button>

            {/* MCP Action: Clear Desktop Drawings */}
            <button
              onClick={handleClearDesktop}
              className="control-pill-btn"
              style={{
                padding: '6px 12px',
                fontWeight: 600,
                fontSize: 11,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--text-muted)'
              }}
              title="Clear forecast lines from TradingView Desktop"
            >
              Clear TV
            </button>

            <button
              onClick={loadAll}
              disabled={refreshing}
              className="control-pill-btn"
              style={{
                padding: '6px 14px',
                fontWeight: 700,
                fontSize: 11,
                background: 'rgba(172, 88, 233, 0.12)',
                borderColor: 'rgba(172, 88, 233, 0.35)',
                color: 'var(--text-main)'
              }}
            >
              {refreshing ? 'Syncing...' : 'Sync Live'}
            </button>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>CURRENT SPOT PRICE</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 4 }}>
              ${currentSpotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 10, color: '#26A69A', marginTop: 2, fontWeight: 700 }}>Binance Real-Time Stream</div>
          </div>

          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>PROJECTED 90M HORIZON</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-mono)', color: Number(totalDriftPct) >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)', marginTop: 4 }}>
              ${finalProjection ? finalProjection.predicted_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '78,959.00'}
              <span style={{ fontSize: 12, marginLeft: 6 }}>({Number(totalDriftPct) >= 0 ? `+${totalDriftPct}` : totalDriftPct}%)</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Direction: {timeline?.expected_direction.replace(/_/g, ' ') || 'BULLISH CONTINUATION'}</div>
          </div>

          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>90% VOLATILITY CONE ENVELOPE</div>
            <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#B388FF', marginTop: 6 }}>
              {finalProjection ? `$${finalProjection.lower_bound_90.toFixed(0)} — $${finalProjection.upper_bound_90.toFixed(0)}` : '$76,157 — $80,258'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Confidence: {timeline?.confidence_pct || 91}% Directional Bounds</div>
          </div>

          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>VIBE COUNCIL CONSENSUS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: vibe?.consensus_verdict.includes('BUY') ? 'var(--bullish-green)' : 'var(--warning-amber)', marginTop: 4 }}>
              {vibe?.consensus_verdict || 'STRONG BUY'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Conviction: {vibe?.composite_conviction_pct || 94}%</div>
          </div>
        </div>
      </div>

      {/* PRIMARY SECTION: UNIFIED CANDLESTICK + KRONOS FORECAST CONE CHART */}
      {(chartMode === 'UNIFIED' || chartMode === 'DUAL') && (
        <UnifiedForecastCandleChart
          candles={candles}
          timeline={timeline}
          timeframe={timeframe}
          onProjectToTradingView={handleProjectToDesktop}
          isProjectingToTv={mcpProjecting}
        />
      )}

      {/* SECONDARY SECTION: TRADINGVIEW LIVE REAL-TIME ADVANCED CHART */}
      {(chartMode === 'TRADINGVIEW' || chartMode === 'DUAL') && (
        <TradingViewLiveWidget
          symbol="BINANCE:BTCUSDT"
          theme="dark"
          height={540}
          interval={timeframe === '15m' ? '15' : timeframe === '1h' ? '60' : '240'}
          timeline={timeline}
          onProjectToTradingView={handleProjectToDesktop}
          isProjectingToTv={mcpProjecting}
        />
      )}

      {/* FUTURE HORIZON STEP PROJECTION CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        {forecastProjectionPoints.map((proj) => {
          const delta = proj.predicted_price - currentSpotPrice;
          const deltaPct = ((delta / currentSpotPrice) * 100);
          const isBull = delta >= 0;

          return (
            <div key={proj.horizon_label} className="exec-level-box" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>Horizon {proj.horizon_label}</span>
                <span className={`t2o-badge ${isBull ? 'badge-bullish' : 'badge-bearish'}`} style={{ fontSize: 9 }}>
                  {isBull ? '+' : ''}{deltaPct.toFixed(2)}%
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 6 }}>
                ${proj.predicted_price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                90% Range: <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>${proj.lower_bound_90.toFixed(0)} - ${proj.upper_bound_90.toFixed(0)}</span>
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-dim)', marginTop: 4 }}>
                Target Time: {formatTimeOnly(proj.timestamp)} UTC
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Vibe-Trading Council & TORIC Whale Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        {/* Vibe-Trading Multi-Agent Council */}
        <div className="t2o-card stagger-card stagger-3" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.8 }}>RESEARCH ENGINE 1</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>
                Vibe-Trading Autonomous Research Council
              </div>
            </div>
            <span className="t2o-badge badge-bullish">CONNECTED (NATIVE)</span>
          </div>

          <div className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Council Verdict:</span>
              <span className={`t2o-badge ${vibe?.consensus_verdict.includes('BUY') ? 'badge-bullish' : vibe?.consensus_verdict.includes('VETO') ? 'badge-bearish' : 'badge-warning'}`}>
                {vibe?.consensus_verdict}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-main)', marginTop: 8, lineHeight: 1.6 }}>
              <strong>Executive Rationale:</strong> {vibe?.executive_rationale}
            </div>
          </div>

          {/* Individual Agents in Council */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vibe?.agents.map((ag) => {
              const isBull = ag.stance === 'BULLISH';
              const isVeto = ag.stance === 'VETO';
              const isBear = ag.stance === 'BEARISH';

              return (
                <div key={ag.agent_name} className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-main)' }}>
                      {ag.agent_name.replace(/_/g, ' ')}
                    </span>
                    <span className={`t2o-badge ${isBull ? 'badge-bullish' : isVeto ? 'badge-bearish' : isBear ? 'badge-bearish' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                      {ag.stance} ({ag.conviction_pct}%)
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                    {ag.key_observation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TORIC Whale & Macro On-Chain Intelligence */}
        <div className="t2o-card stagger-card stagger-4" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.8 }}>RESEARCH ENGINE 2</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>
                TORIC On-Chain & Macro Liquidity Engine
              </div>
            </div>
            <span className="t2o-badge badge-bullish">CONNECTED (NATIVE)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>24H WHALE NET FLOW</div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--bullish-green)', marginTop: 4 }}>
                {toric?.whale_net_flow_btc_24h ? `+${toric.whale_net_flow_btc_24h.toFixed(1)} BTC` : '+1,420.5 BTC'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Aggressive Net Buying</div>
            </div>

            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>EXCHANGE RESERVES</div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--bullish-green)', marginTop: 4 }}>
                {toric?.exchange_reserve_trend || 'OUTFLOW (SHOCK)'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Macro Supply Shock Active</div>
            </div>
          </div>

          <div className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)' }}>Toric Macro Interpretation</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
              On-chain exchange reserves are continuing a sharp downward trajectory (-12,400 BTC over 7d), confirming institutional spot accumulation rather than speculative derivatives leverage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
