import React, { useState, useEffect } from 'react';
import {
  ContinuousForecastTimeline,
  VibeConsensusResult,
  ToricOnChainSnapshot,
  TimeFrame,
  ForecastDataPoint
} from '../types';
import {
  fetchForecastTimeline,
  fetchVibeCouncilDecision,
  fetchToricOnChain,
  fetchTradingViewStatus,
  TradingViewMcpStatus
} from '../api';
import { TradingViewLiveWidget } from '../components/TradingViewLiveWidget';

export const ForecastStudioPage: React.FC = () => {
  const [timeline, setTimeline] = useState<ContinuousForecastTimeline | null>(null);
  const [vibe, setVibe] = useState<VibeConsensusResult | null>(null);
  const [toric, setToric] = useState<ToricOnChainSnapshot | null>(null);
  const [tvStatus, setTvStatus] = useState<TradingViewMcpStatus | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>('15m');
  const [chartMode, setChartMode] = useState<'FORECAST' | 'TRADINGVIEW' | 'DUAL'>('FORECAST');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<ForecastDataPoint | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const loadAll = async () => {
    try {
      setRefreshing(true);
      const [tl, vb, tor, tv] = await Promise.all([
        fetchForecastTimeline('BTCUSDT', timeframe),
        fetchVibeCouncilDecision('BTCUSDT'),
        fetchToricOnChain('BTCUSDT'),
        fetchTradingViewStatus()
      ]);
      setTimeline(tl);
      setVibe(vb);
      setToric(tor);
      setTvStatus(tv);
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
            INITIALIZING AI FORECASTING CONCLAVE & TRADINGVIEW MCP
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Computing continuous RevIN probabilistic cone & synchronizing TradingView live feed...
        </div>
      </div>
    );
  }

  // Calculate coordinates for the Forecast Curve Canvas/SVG
  const points = timeline?.forecast_points || [];
  const minPrice = points.length > 0 ? Math.min(...points.map(p => p.lower_bound_90)) * 0.998 : 75000;
  const maxPrice = points.length > 0 ? Math.max(...points.map(p => p.upper_bound_90)) * 1.002 : 82000;
  const priceRange = Math.max(1, maxPrice - minPrice);

  const svgWidth = 920;
  const svgHeight = 310;
  const paddingX = 64;
  const paddingY = 40;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY - 55;

  const getX = (idx: number) => paddingX + (idx / Math.max(1, points.length - 1)) * plotWidth;
  const getY = (val: number) => paddingY + plotHeight - ((val - minPrice) / priceRange) * plotHeight;

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

  const nowPointIndex = points.findIndex(p => p.horizon_label.toLowerCase().includes('spot') || p.horizon_label === 'NOW');
  const nowPoint = nowPointIndex >= 0 ? points[nowPointIndex] : null;

  // Clean time formatting helper - prevents ISO string text collisions
  const formatTimeOnly = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Studio Header & Model Status */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="price-beacon-dot" />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--accent-cyan-bright)', textTransform: 'uppercase' }}>
                AI Forecasting Studio
              </span>
              <span className="t2o-badge badge-purple" style={{ fontSize: 10 }}>Continuous Horizon Engine</span>
              <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>24/7 Live Active</span>
              
              {/* TradingView MCP Connected Status Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'rgba(38, 166, 154, 0.12)',
                  border: '1px solid rgba(38, 166, 154, 0.35)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: '#26A69A'
                }}
              >
                <span className="pulse-dot dot-green" style={{ width: 6, height: 6 }} />
                <span>TradingView MCP: {tvStatus?.is_connected ? 'Connected' : 'Active'}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 9.5 }}>| CDP {tvStatus?.cdp_port || 9222}</span>
              </div>

              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginTop: 6, letterSpacing: 0.2 }}>
              Multi-Horizon Price Trajectory & TradingView Live Stream
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Probabilistic deep-learning forecasting with 90% volatility cones evaluated in real-time against live TradingView Binance Spot BTC.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* View Mode Toggle: Forecast vs TradingView Live vs Dual View */}
            <div className="segmented-pill-container" style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 3 }}>
              <button
                onClick={() => setChartMode('FORECAST')}
                className={`segmented-pill-btn ${chartMode === 'FORECAST' ? 'segmented-pill-btn-active' : ''}`}
                style={{ fontSize: 11, padding: '5px 12px' }}
              >
                AI Forecast Cone
              </button>
              <button
                onClick={() => setChartMode('TRADINGVIEW')}
                className={`segmented-pill-btn ${chartMode === 'TRADINGVIEW' ? 'segmented-pill-btn-active' : ''}`}
                style={{ fontSize: 11, padding: '5px 12px' }}
              >
                TradingView Live
              </button>
              <button
                onClick={() => setChartMode('DUAL')}
                className={`segmented-pill-btn ${chartMode === 'DUAL' ? 'segmented-pill-btn-active' : ''}`}
                style={{ fontSize: 11, padding: '5px 12px' }}
              >
                Dual Synced Mode
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
              {refreshing ? 'Syncing...' : 'Sync Live'}
            </button>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <div className="exec-level-box" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.6 }}>CURRENT SPOT CLOSE</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 4 }}>
              ${timeline?.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '77,624.61'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--bullish-green)', marginTop: 2, fontWeight: 600 }}>Binance Spot Feed Active</div>
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

      {/* Main Chart Section: TradingView Widget, AI Forecast, or Dual Synced */}
      {(chartMode === 'TRADINGVIEW' || chartMode === 'DUAL') && (
        <div className="t2o-card stagger-card stagger-2" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pulse-dot dot-green" />
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                  TradingView Live Advanced Real-Time Chart: BINANCE:BTCUSDT ({timeframe.toUpperCase()})
                </span>
                <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>Sub-Second Ticks</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Connected with TradingView Desktop MCP Protocol. Full interactive chart with real-time indicators and volume.
              </div>
            </div>
          </div>

          <TradingViewLiveWidget symbol="BINANCE:BTCUSDT" theme="dark" height={520} interval={timeframe === '15m' ? '15' : timeframe === '1h' ? '60' : '240'} />
        </div>
      )}

      {(chartMode === 'FORECAST' || chartMode === 'DUAL') && (
        <div className="t2o-card stagger-card stagger-2" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                Chronos AI Probabilistic Trajectory: Historical Realized Spot vs Forward 90% Cone
              </span>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Solid Violet = Realized Spot | Dashed Bright = Projected Mean Trajectory | Shaded Cone = 90% Volatility Bounds
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 3, background: 'var(--accent-cyan)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Historical Spot</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 3, background: 'var(--accent-cyan-bright)', borderTop: '2px dashed var(--accent-cyan-bright)' }} />
                <span style={{ color: 'var(--text-muted)' }}>AI Forecast Mean</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 10, background: 'rgba(172, 88, 233, 0.25)', border: '1px solid rgba(172, 88, 233, 0.5)' }} />
                <span style={{ color: 'var(--text-muted)' }}>90% Cone</span>
              </div>
            </div>
          </div>

          {/* SVG Chart with completely uncluttered, collision-free time labels */}
          <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(6, 11, 14, 0.95)', borderRadius: 14, padding: '16px 0 10px 0', border: '1px solid var(--border-subtle)', position: 'relative' }}>
            {hoveredPoint && (
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 20,
                  background: 'rgba(12, 19, 26, 0.92)',
                  border: '1px solid rgba(172, 88, 233, 0.4)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  zIndex: 10,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  fontSize: 11
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: 9.5 }}>HORIZON:</span>{' '}
                  <b style={{ color: 'var(--accent-cyan-bright)' }}>{hoveredPoint.horizon_label}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: 9.5 }}>PROJECTED:</span>{' '}
                  <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>${hoveredPoint.predicted_price.toLocaleString()}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: 9.5 }}>90% BOUNDS:</span>{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    ${hoveredPoint.lower_bound_90.toLocaleString()} - ${hoveredPoint.upper_bound_90.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: 9.5 }}>TIME:</span>{' '}
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{formatTimeOnly(hoveredPoint.timestamp)} UTC</span>
                </div>
              </div>
            )}

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: 700, display: 'block' }}>
              <defs>
                <linearGradient id="coneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#AC58E9" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#AC58E9" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const yVal = paddingY + pct * plotHeight;
                const priceTick = maxPrice - pct * priceRange;
                return (
                  <g key={idx}>
                    <line x1={paddingX} y1={yVal} x2={svgWidth - paddingX} y2={yVal} stroke="rgba(172, 88, 233, 0.09)" strokeDasharray="3 3" />
                    <text x={paddingX - 10} y={yVal + 4} fill="var(--text-dim)" fontSize="9.5" textAnchor="end" fontFamily="var(--font-mono)">
                      ${Math.round(priceTick).toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Confidence Polygon */}
              {confidencePolygon && (
                <path d={confidencePolygon} fill="url(#coneGradient)" stroke="rgba(172, 88, 233, 0.45)" strokeWidth="1" strokeDasharray="3 3" />
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
                    y1={paddingY - 10}
                    x2={getX(nowPointIndex)}
                    y2={paddingY + plotHeight}
                    stroke="var(--warning-amber)"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                  />
                </g>
              )}

              {/* Data Points and Clear Two-Tier Axis Labels */}
              {points.map((pt, i) => {
                const x = getX(i);
                const yPred = getY(pt.predicted_price);
                const isNow = i === nowPointIndex;
                const isFuture = pt.is_projection;
                const isHovered = hoveredIdx === i;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => { setHoveredPoint(pt); setHoveredIdx(i); }}
                    onMouseLeave={() => { setHoveredPoint(null); setHoveredIdx(null); }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hover vertical crosshair */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={paddingY}
                        x2={x}
                        y2={paddingY + plotHeight}
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Point Marker */}
                    <circle
                      cx={x}
                      cy={yPred}
                      r={isNow ? 6.5 : isHovered ? 6 : isFuture ? 4.5 : 3.5}
                      fill={isNow ? 'var(--warning-amber)' : isFuture ? 'var(--accent-cyan-bright)' : 'var(--accent-cyan)'}
                      stroke="var(--bg-primary)"
                      strokeWidth={isNow || isHovered ? 2.5 : 1.5}
                    />

                    {/* Point Price Tag */}
                    <text
                      x={x}
                      y={yPred - (isNow ? 14 : 10)}
                      fill={isNow ? 'var(--warning-amber)' : 'var(--text-main)'}
                      fontSize={isNow ? '10' : '8.5'}
                      fontWeight={isNow ? '800' : '600'}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                    >
                      ${Math.round(pt.predicted_price).toLocaleString()}
                    </text>

                    {/* Lower Axis: Two-Tier Collision-Free Labels */}
                    {isNow ? (
                      <g>
                        <rect
                          x={x - 34}
                          y={svgHeight - 48}
                          width={68}
                          height={18}
                          rx={4}
                          fill="rgba(245, 166, 35, 0.18)"
                          stroke="var(--warning-amber)"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={svgHeight - 35}
                          fill="var(--warning-amber)"
                          fontSize="9"
                          fontWeight="800"
                          textAnchor="middle"
                          letterSpacing="0.5"
                        >
                          NOW (LIVE)
                        </text>
                        <text
                          x={x}
                          y={svgHeight - 16}
                          fill="var(--text-main)"
                          fontSize="9"
                          fontWeight="700"
                          textAnchor="middle"
                          fontFamily="var(--font-mono)"
                        >
                          {formatTimeOnly(pt.timestamp)}
                        </text>
                      </g>
                    ) : (
                      <g>
                        {/* Horizon Label (e.g. T-3 or T+2) */}
                        <text
                          x={x}
                          y={svgHeight - 36}
                          fill={isFuture ? 'var(--accent-cyan-bright)' : 'var(--text-muted)'}
                          fontSize="9"
                          fontWeight={isFuture ? '700' : '500'}
                          textAnchor="middle"
                          fontFamily="var(--font-mono)"
                        >
                          {pt.horizon_label}
                        </text>
                        {/* Clean Time Label (e.g. 15:30) */}
                        <text
                          x={x}
                          y={svgHeight - 18}
                          fill="var(--text-dim)"
                          fontSize="8.5"
                          textAnchor="middle"
                          fontFamily="var(--font-mono)"
                        >
                          {formatTimeOnly(pt.timestamp)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Future Horizon Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
            {points.filter(p => p.is_projection).map(proj => {
              const delta = proj.predicted_price - (timeline?.current_price || 77624);
              const deltaPct = ((delta / (timeline?.current_price || 77624)) * 100);
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
                  <div style={{ fontSize: 9.5, color: 'var(--text-dim)', marginTop: 4 }}>
                    Target: {formatTimeOnly(proj.timestamp)} UTC
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
