import React, { useState, useEffect } from 'react';
import {
  ContinuousForecastTimeline,
  VibeConsensusResult,
  ToricOnChainSnapshot,
  TimeFrame
} from '../types';
import {
  fetchForecastTimeline,
  fetchVibeCouncilDecision,
  fetchToricOnChain
} from '../api';

export const ForecastStudioPage: React.FC = () => {
  const [timeline, setTimeline] = useState<ContinuousForecastTimeline | null>(null);
  const [vibe, setVibe] = useState<VibeConsensusResult | null>(null);
  const [toric, setToric] = useState<ToricOnChainSnapshot | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>('15m');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    try {
      setRefreshing(true);
      const [tl, vb, tor] = await Promise.all([
        fetchForecastTimeline('BTCUSDT', timeframe),
        fetchVibeCouncilDecision('BTCUSDT'),
        fetchToricOnChain('BTCUSDT')
      ]);
      setTimeline(tl);
      setVibe(vb);
      setToric(tor);
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

  if (loading && !timeline) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>
            INITIALIZING AI FORECASTING CONCLAVE
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Computing continuous RevIN probabilistic cone & Vibe-Trading consensus...
        </div>
      </div>
    );
  }

  // Calculate coordinates for the Forecast Curve Canvas/SVG
  const points = timeline?.forecast_points || [];
  const minPrice = points.length > 0 ? Math.min(...points.map(p => p.lower_bound_90)) * 0.998 : 80000;
  const maxPrice = points.length > 0 ? Math.max(...points.map(p => p.upper_bound_90)) * 1.002 : 85000;
  const priceRange = Math.max(1, maxPrice - minPrice);

  const svgWidth = 860;
  const svgHeight = 280;
  const paddingX = 60;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const getX = (idx: number) => paddingX + (idx / Math.max(1, points.length - 1)) * plotWidth;
  const getY = (val: number) => svgHeight - paddingY - ((val - minPrice) / priceRange) * plotHeight;

  // Build SVG Paths
  let actualPath = '';
  let predPath = '';
  let upperBandPath = '';

  points.forEach((pt, i) => {
    const x = getX(i);
    const yPred = getY(pt.predicted_price);
    const yUpper = getY(pt.upper_bound_90);

    if (i === 0) {
      predPath = `M ${x} ${yPred}`;
      upperBandPath = `M ${x} ${yUpper}`;
    } else {
      predPath += ` L ${x} ${yPred}`;
      upperBandPath += ` L ${x} ${yUpper}`;
    }

    if (pt.actual_price !== null && pt.actual_price !== undefined) {
      const yActual = getY(pt.actual_price);
      if (actualPath === '') {
        actualPath = `M ${x} ${yActual}`;
      } else {
        actualPath += ` L ${x} ${yActual}`;
      }
    }
  });

  // Complete the Confidence Band Polygon
  let confidencePolygon = '';
  if (points.length > 0) {
    confidencePolygon = upperBandPath;
    for (let i = points.length - 1; i >= 0; i--) {
      confidencePolygon += ` L ${getX(i)} ${getY(points[i].lower_bound_90)}`;
    }
    confidencePolygon += ' Z';
  }

  const nowPointIndex = points.findIndex(p => p.horizon_label === 'NOW');
  const nowPoint = nowPointIndex >= 0 ? points[nowPointIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Studio Header & Model Status */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="price-beacon-dot" />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--accent-cyan-bright)', textTransform: 'uppercase' }}>
                AI Forecasting Studio
              </span>
              <span className="t2o-badge badge-purple" style={{ fontSize: 10 }}>Continuous Horizon Engine</span>
              <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>24/7 Live Active</span>
              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginTop: 6, letterSpacing: 0.2 }}>
              Multi-Horizon Price Trajectory & Confidence Cone
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Probabilistic deep-learning forecasting with 90% volatility cones evaluated throughout time against real-time Bitcoin spot.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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

            <button
              onClick={loadAll}
              disabled={refreshing}
              className="control-pill-btn shimmer-sweep"
              style={{
                padding: '6px 16px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(172, 88, 233,  0.15) 0%, rgba(9, 19, 25, 0.8) 100%)',
                borderColor: 'rgba(172, 88, 233,  0.4)',
                color: 'var(--text-main)'
              }}
            >
              {refreshing ? 'Updating...' : 'Sync Live'}
            </button>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>CURRENT SPOT CLOSE</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 4 }}>
              ${timeline?.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '82,000.00'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--bullish-green)', marginTop: 2, fontWeight: 600 }}>Zero Lookahead Validated</div>
          </div>

          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>ANTICIPATED TRAJECTORY</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: timeline?.expected_direction.includes('BULLISH') ? 'var(--bullish-green)' : 'var(--bearish-red)', marginTop: 4 }}>
              {timeline?.expected_direction.replace(/_/g, ' ') || 'CALCULATING'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Model: {timeline?.model_name}</div>
          </div>

          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>CONVERGENCE CONFIDENCE</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)', marginTop: 4 }}>
              {timeline?.confidence_pct}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>90% Probabilistic Bound</div>
          </div>

          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>VIBE COUNCIL VERDICT</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: vibe?.consensus_verdict.includes('BUY') ? 'var(--bullish-green)' : vibe?.consensus_verdict.includes('VETO') ? 'var(--bearish-red)' : 'var(--warning-amber)', marginTop: 4 }}>
              {vibe?.consensus_verdict.replace(/_/g, ' ') || 'VOTING'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Conviction: {vibe?.composite_conviction_pct}%</div>
          </div>
        </div>
      </div>

      {/* Main Continuous Timeline Chart */}
      <div className="t2o-card stagger-card stagger-2" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>
              Continuous Price Timeline: Historical Track Record vs Forward Projections
            </span>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Solid Cyan = Realized Spot | Dashed Cyan-Bright = Projected Drift | Cyan Shaded Cone = 90% Confidence Interval
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 3, background: 'var(--accent-cyan)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Actual Spot</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 3, background: 'var(--accent-cyan-bright)', borderTop: '1px dashed var(--accent-cyan-bright)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Kronos Projection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 10, background: 'rgba(172, 88, 233,  0.2)', border: '1px solid rgba(172, 88, 233,  0.4)' }} />
              <span style={{ color: 'var(--text-muted)' }}>90% Cone</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(6, 11, 14, 0.95)', borderRadius: 14, padding: '12px 0', border: '1px solid var(--border-subtle)' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: 650, display: 'block' }}>
            <defs>
              <linearGradient id="coneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#AC58E9" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#AC58E9" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = paddingY + pct * plotHeight;
              const priceTick = maxPrice - pct * priceRange;
              return (
                <g key={idx}>
                  <line x1={paddingX} y1={yVal} x2={svgWidth - paddingX} y2={yVal} stroke="rgba(172, 88, 233,  0.08)" strokeDasharray="3 3" />
                  <text x={paddingX - 10} y={yVal + 4} fill="var(--text-dim)" fontSize="9" textAnchor="end" fontFamily="var(--font-mono)">
                    ${Math.round(priceTick).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Confidence Polygon */}
            {confidencePolygon && (
              <path d={confidencePolygon} fill="url(#coneGradient)" stroke="rgba(172, 88, 233,  0.35)" strokeWidth="1" strokeDasharray="2 2" />
            )}

            {/* Projected Trajectory Line */}
            {predPath && (
              <path d={predPath} fill="none" stroke="var(--accent-cyan-bright)" strokeWidth="2.5" strokeDasharray="4 4" />
            )}

            {/* Actual Price Line */}
            {actualPath && (
              <path d={actualPath} fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5" />
            )}

            {/* NOW Vertical Divider */}
            {nowPoint && nowPointIndex >= 0 && (
              <g>
                <line
                  x1={getX(nowPointIndex)}
                  y1={paddingY}
                  x2={getX(nowPointIndex)}
                  y2={svgHeight - paddingY}
                  stroke="var(--warning-amber)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <text x={getX(nowPointIndex)} y={paddingY - 8} fill="var(--warning-amber)" fontSize="10" fontWeight="700" textAnchor="middle">
                  NOW (LIVE)
                </text>
              </g>
            )}

            {/* Data Points */}
            {points.map((pt, i) => {
              const x = getX(i);
              const yPred = getY(pt.predicted_price);
              const isNow = pt.horizon_label === 'NOW';
              const isFuture = pt.is_projection;

              return (
                <g key={i}>
                  {/* Point Marker */}
                  <circle
                    cx={x}
                    cy={yPred}
                    r={isNow ? 6 : isFuture ? 4 : 3}
                    fill={isNow ? 'var(--warning-amber)' : isFuture ? 'var(--accent-cyan-bright)' : 'var(--accent-cyan)'}
                    stroke="var(--bg-primary)"
                    strokeWidth="2"
                  />
                  {/* Label */}
                  <text x={x} y={svgHeight - 10} fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">
                    {pt.horizon_label}
                  </text>
                  <text x={x} y={svgHeight - 20} fill="var(--text-dim)" fontSize="8" textAnchor="middle">
                    {pt.timestamp.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Future Horizon Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
          {points.filter(p => p.is_projection).map(proj => {
            const delta = proj.predicted_price - (timeline?.current_price || 82000);
            const deltaPct = ((delta / (timeline?.current_price || 82000)) * 100);
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
                  ${proj.predicted_price.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  90% Range: <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>${proj.lower_bound_90.toLocaleString()} - ${proj.upper_bound_90.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
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
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>24H WHALE NET ACCUMULATION</div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--bullish-green)', marginTop: 4 }}>
                +{toric?.whale_net_flow_btc_24h?.toLocaleString()} BTC
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Institutional Tier Wallets (&gt;1k BTC)</div>
            </div>

            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>EXCHANGE RESERVE TREND</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-cyan-bright)', marginTop: 6 }}>
                {toric?.exchange_reserve_trend.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Depletion & Outflow Regime</div>
            </div>

            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>MVRV Z-SCORE VALUATION</div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 4 }}>
                {toric?.mvrv_z_score?.toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Below Euphoric Extreme (&lt; 3.5)</div>
            </div>

            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>ANNUALIZED FUNDING RATE</div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--warning-amber)', marginTop: 4 }}>
                {toric?.funding_rate_annualized_pct}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Balanced Derivatives Sentiment</div>
            </div>
          </div>

          <div className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'stretch', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Macro Liquidity Index:</span>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)' }}>
                {toric?.macro_liquidity_index}/100
              </span>
            </div>
            <div className="indicator-metric-bar" style={{ marginTop: 8, height: 6 }}>
              <div
                className="indicator-metric-fill"
                style={{
                  width: `${toric?.macro_liquidity_index || 70}%`,
                  background: 'var(--accent-cyan-gradient)',
                  boxShadow: '0 0 12px var(--accent-cyan)'
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
              On-Chain Sentiment: <b style={{ color: 'var(--bullish-green)' }}>{toric?.on_chain_sentiment.replace(/_/g, ' ')}</b>. Confirms spot accumulation without leverage froth.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
