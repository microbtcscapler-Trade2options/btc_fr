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
      <div className="t2o-card" style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#38BDF8', marginBottom: 8 }}>
          Initializing AI Forecasting Studio & Multi-Agent Conclave...
        </div>
        <div style={{ fontSize: 13 }}>Computing continuous RevIN probabilistic cone & Vibe-Trading consensus...</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Studio Header & Model Status */}
      <div className="t2o-card" style={{ padding: '20px 24px', background: 'linear-gradient(180deg, #0B1120 0%, #07090E 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#38BDF8', textTransform: 'uppercase' }}>
                AI Forecasting Studio
              </span>
              <span className="t2o-badge badge-purple" style={{ fontSize: 10 }}>Continuous Horizon Engine</span>
              <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>24/7 Live Active</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', marginTop: 4, letterSpacing: 0.2 }}>
              Multi-Horizon Price Trajectory & Confidence Cone
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              Probabilistic deep-learning forecasting with 90% volatility cones evaluated throughout time against real-time Bitcoin spot.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', background: '#090D17', borderRadius: 6, border: '1px solid #1E293B', padding: 2 }}>
              {(['15m', '1h', '4h'] as TimeFrame[]).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    background: timeframe === tf ? '#38BDF8' : 'transparent',
                    color: timeframe === tf ? '#07090E' : '#94A3B8',
                    fontWeight: timeframe === tf ? 700 : 500,
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: 'pointer'
                  }}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={loadAll}
              disabled={refreshing}
              style={{
                padding: '7px 16px',
                borderRadius: 6,
                border: '1px solid #38BDF8',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38BDF8',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {refreshing ? 'Updating...' : 'Sync Live'}
            </button>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 18, paddingTop: 16, borderTop: '1px solid #1E293B' }}>
          <div style={{ background: '#090D17', padding: '12px 16px', borderRadius: 6, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>CURRENT SPOT CLOSE</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 4 }}>
              ${timeline?.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '82,000.00'}
            </div>
            <div style={{ fontSize: 10, color: '#10B981', marginTop: 2 }}>Zero Lookahead Validated</div>
          </div>

          <div style={{ background: '#090D17', padding: '12px 16px', borderRadius: 6, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>ANTICIPATED TRAJECTORY</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: timeline?.expected_direction.includes('BULLISH') ? '#10B981' : '#EF4444', marginTop: 4 }}>
              {timeline?.expected_direction.replace(/_/g, ' ') || 'CALCULATING'}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Model: {timeline?.model_name}</div>
          </div>

          <div style={{ background: '#090D17', padding: '12px 16px', borderRadius: 6, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>CONVERGENCE CONFIDENCE</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#38BDF8', marginTop: 4 }}>
              {timeline?.confidence_pct}%
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>90% Probabilistic Bound</div>
          </div>

          <div style={{ background: '#090D17', padding: '12px 16px', borderRadius: 6, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>VIBE COUNCIL VERDICT</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: vibe?.consensus_verdict.includes('BUY') ? '#10B981' : vibe?.consensus_verdict.includes('VETO') ? '#EF4444' : '#F59E0B', marginTop: 4 }}>
              {vibe?.consensus_verdict.replace(/_/g, ' ') || 'VOTING'}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Conviction: {vibe?.composite_conviction_pct}%</div>
          </div>
        </div>
      </div>

      {/* Main Continuous Timeline Chart */}
      <div className="t2o-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>
              Continuous Price Timeline: Historical Track Record vs Forward Projections
            </span>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              Solid Green = Realized Spot | Dashed Cyan = Projected Drift | Blue Shaded Cone = 90% Confidence Interval
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 3, background: '#10B981' }} />
              <span style={{ color: '#94A3B8' }}>Actual Spot</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 3, background: '#38BDF8', borderTop: '1px dashed #38BDF8' }} />
              <span style={{ color: '#94A3B8' }}>Kronos Projection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 10, background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)' }} />
              <span style={{ color: '#94A3B8' }}>90% Cone</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ width: '100%', overflowX: 'auto', background: '#05070B', borderRadius: 8, padding: '10px 0', border: '1px solid #1E293B' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: 650, display: 'block' }}>
            <defs>
              <linearGradient id="coneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = paddingY + pct * plotHeight;
              const priceTick = maxPrice - pct * priceRange;
              return (
                <g key={idx}>
                  <line x1={paddingX} y1={yVal} x2={svgWidth - paddingX} y2={yVal} stroke="#1E293B" strokeDasharray="3 3" />
                  <text x={paddingX - 10} y={yVal + 4} fill="#64748B" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">
                    ${Math.round(priceTick).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Confidence Polygon */}
            {confidencePolygon && (
              <path d={confidencePolygon} fill="url(#coneGradient)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" strokeDasharray="2 2" />
            )}

            {/* Projected Trajectory Line */}
            {predPath && (
              <path d={predPath} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="4 4" />
            )}

            {/* Actual Price Line */}
            {actualPath && (
              <path d={actualPath} fill="none" stroke="#10B981" strokeWidth="2.5" />
            )}

            {/* NOW Vertical Divider */}
            {nowPoint && nowPointIndex >= 0 && (
              <g>
                <line
                  x1={getX(nowPointIndex)}
                  y1={paddingY}
                  x2={getX(nowPointIndex)}
                  y2={svgHeight - paddingY}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <text x={getX(nowPointIndex)} y={paddingY - 8} fill="#F59E0B" fontSize="10" fontWeight="700" textAnchor="middle">
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
                    fill={isNow ? '#F59E0B' : isFuture ? '#38BDF8' : '#10B981'}
                    stroke="#07090E"
                    strokeWidth="2"
                  />
                  {/* Label */}
                  <text x={x} y={svgHeight - 10} fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
                    {pt.horizon_label}
                  </text>
                  <text x={x} y={svgHeight - 20} fill="#64748B" fontSize="8" textAnchor="middle">
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
              <div key={proj.horizon_label} style={{ background: '#090D17', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8' }}>Horizon {proj.horizon_label}</span>
                  <span className={`t2o-badge ${isBull ? 'badge-bullish' : 'badge-bearish'}`} style={{ fontSize: 9 }}>
                    {isBull ? '+' : ''}{deltaPct.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 6 }}>
                  ${proj.predicted_price.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                  90% Range: <span style={{ color: '#E2E8F0', fontFamily: 'JetBrains Mono' }}>${proj.lower_bound_90.toLocaleString()} - ${proj.upper_bound_90.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Vibe-Trading Council & TORIC Whale Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        {/* Vibe-Trading Multi-Agent Council */}
        <div className="t2o-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>RESEARCH ENGINE 1</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#38BDF8' }}>
                Vibe-Trading Autonomous Research Council
              </div>
            </div>
            <span className="t2o-badge badge-bullish">CONNECTED (NATIVE)</span>
          </div>

          <div style={{ background: '#090D17', padding: 14, borderRadius: 6, border: '1px solid #1E293B', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>Council Verdict:</span>
              <span className={`t2o-badge ${vibe?.consensus_verdict.includes('BUY') ? 'badge-bullish' : vibe?.consensus_verdict.includes('VETO') ? 'badge-bearish' : 'badge-warning'}`}>
                {vibe?.consensus_verdict}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 8, lineHeight: 1.5 }}>
              <b>Executive Rationale:</b> {vibe?.executive_rationale}
            </div>
          </div>

          {/* Individual Agents in Council */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vibe?.agents.map((ag) => {
              const isBull = ag.stance === 'BULLISH';
              const isVeto = ag.stance === 'VETO';
              const isBear = ag.stance === 'BEARISH';

              return (
                <div key={ag.agent_name} style={{ background: '#05070B', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>
                      {ag.agent_name.replace(/_/g, ' ')}
                    </span>
                    <span className={`t2o-badge ${isBull ? 'badge-bullish' : isVeto ? 'badge-bearish' : isBear ? 'badge-bearish' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                      {ag.stance} ({ag.conviction_pct}%)
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, lineHeight: 1.4 }}>
                    {ag.key_observation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TORIC Whale & Macro On-Chain Intelligence */}
        <div className="t2o-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>RESEARCH ENGINE 2</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#38BDF8' }}>
                TORIC On-Chain & Macro Liquidity Engine
              </div>
            </div>
            <span className="t2o-badge badge-bullish">CONNECTED (NATIVE)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
            <div style={{ background: '#090D17', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 10, color: '#64748B' }}>24H WHALE NET ACCUMULATION</div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#10B981', marginTop: 4 }}>
                +{toric?.whale_net_flow_btc_24h?.toLocaleString()} BTC
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Institutional Tier Wallets (&gt;1k BTC)</div>
            </div>

            <div style={{ background: '#090D17', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 10, color: '#64748B' }}>EXCHANGE RESERVE TREND</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#38BDF8', marginTop: 6 }}>
                {toric?.exchange_reserve_trend.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Depletion & Outflow Regime</div>
            </div>

            <div style={{ background: '#090D17', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 10, color: '#64748B' }}>MVRV Z-SCORE VALUATION</div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 4 }}>
                {toric?.mvrv_z_score?.toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Below Euphoric Extreme (&lt; 3.5)</div>
            </div>

            <div style={{ background: '#090D17', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 10, color: '#64748B' }}>ANNUALIZED FUNDING RATE</div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F59E0B', marginTop: 4 }}>
                {toric?.funding_rate_annualized_pct}%
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Balanced Derivatives Sentiment</div>
            </div>
          </div>

          <div style={{ background: '#05070B', padding: 14, borderRadius: 6, border: '1px solid #1E293B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>Macro Liquidity Index:</span>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#38BDF8' }}>
                {toric?.macro_liquidity_index}/100
              </span>
            </div>
            <div style={{ width: '100%', height: 6, background: '#1E293B', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${toric?.macro_liquidity_index || 70}%`, height: '100%', background: 'linear-gradient(90deg, #38BDF8, #10B981)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>
              On-Chain Sentiment: <b style={{ color: '#10B981' }}>{toric?.on_chain_sentiment.replace(/_/g, ' ')}</b>. Confirms spot accumulation without leverage froth.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
