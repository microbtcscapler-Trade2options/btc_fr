import React, { useState, useMemo } from 'react';
import { Candle, TimeFrame, ContinuousForecastTimeline } from '../types';

interface UnifiedForecastCandleChartProps {
  candles: Candle[];
  timeline: ContinuousForecastTimeline | null;
  timeframe: TimeFrame;
  onProjectToTradingView?: () => void;
  isProjectingToTv?: boolean;
}

export const UnifiedForecastCandleChart: React.FC<UnifiedForecastCandleChartProps> = ({
  candles,
  timeline,
  timeframe,
  onProjectToTradingView,
  isProjectingToTv = false
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredForecastIdx, setHoveredForecastIdx] = useState<number | null>(null);

  // Take recent candles (last 20) to keep chart clean and high-contrast
  const displayCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    return candles.slice(-20);
  }, [candles]);

  const forecastPoints = useMemo(() => {
    if (!timeline || !timeline.forecast_points) return [];
    return timeline.forecast_points.filter(p => p.is_projection);
  }, [timeline]);

  const numCandles = displayCandles.length;
  const numForecast = forecastPoints.length;
  const totalSlots = numCandles + numForecast;

  // Chart Dimensions
  const svgWidth = 980;
  const svgHeight = 460;
  const padding = { top: 32, right: 80, bottom: 50, left: 20 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const volumeHeight = 65;
  const priceHeight = svgHeight - padding.top - padding.bottom - volumeHeight - 14;

  // Compute unified price range covering BOTH candles and forecast cone
  const { minPrice, priceRange } = useMemo(() => {
    if (numCandles === 0) return { minPrice: 75000, priceRange: 7000 };

    const candleHighs = displayCandles.map(c => c.high);
    const candleLows = displayCandles.map(c => c.low);
    const forecastUppers = forecastPoints.map(p => p.upper_bound_90);
    const forecastLowers = forecastPoints.map(p => p.lower_bound_90);

    const allHighs = [...candleHighs, ...forecastUppers];
    const allLows = [...candleLows, ...forecastLowers];

    const minP = Math.min(...allLows) * 0.9985;
    const maxP = Math.max(...allHighs) * 1.0015;
    return {
      minPrice: minP,
      priceRange: Math.max(1, maxP - minP)
    };
  }, [displayCandles, forecastPoints, numCandles]);

  // Volume range
  const maxVolume = useMemo(() => {
    if (numCandles === 0) return 1.0;
    return Math.max(...displayCandles.map(c => c.volume)) || 1.0;
  }, [displayCandles, numCandles]);

  if (numCandles === 0) {
    return (
      <div
        className="t2o-card"
        style={{
          height: 460,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#060B0E',
          color: 'var(--text-muted)',
          borderRadius: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="pulse-dot dot-orange" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            STREAMING BINANCE CANDLES & KRONOS PREDICTION HORIZON...
          </span>
        </div>
      </div>
    );
  }

  // Coordinate mappers
  const getX = (slotIndex: number) => {
    return padding.left + (slotIndex / Math.max(1, totalSlots - 1)) * chartWidth;
  };

  const getY = (price: number) => {
    return padding.top + (1 - (price - minPrice) / priceRange) * priceHeight;
  };

  const getVolY = (vol: number) => {
    return svgHeight - padding.bottom - (vol / maxVolume) * volumeHeight;
  };

  const candleWidth = Math.max(3, (chartWidth / totalSlots) * 0.65);
  const latestCandleIdx = numCandles - 1;
  const currentSpot = displayCandles[latestCandleIdx].close;
  const currentSpotX = getX(latestCandleIdx);
  const currentSpotY = getY(currentSpot);

  // Build 90% Volatility Cone Polygon Path
  const conePath = (() => {
    if (forecastPoints.length === 0) return '';
    // Start at current spot
    const upperPoints: string[] = [`${currentSpotX.toFixed(1)},${currentSpotY.toFixed(1)}`];
    const lowerPoints: string[] = [];

    forecastPoints.forEach((pt, i) => {
      const x = getX(numCandles + i);
      upperPoints.push(`${x.toFixed(1)},${getY(pt.upper_bound_90).toFixed(1)}`);
      lowerPoints.push(`${x.toFixed(1)},${getY(pt.lower_bound_90).toFixed(1)}`);
    });

    // Reverse lower points to close the polygon
    lowerPoints.reverse();
    lowerPoints.push(`${currentSpotX.toFixed(1)},${currentSpotY.toFixed(1)}`);

    return `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
  })();

  // Trajectory line path (Mean prediction)
  const trajectoryPath = (() => {
    if (forecastPoints.length === 0) return '';
    const pts = [`${currentSpotX.toFixed(1)},${currentSpotY.toFixed(1)}`];
    forecastPoints.forEach((pt, i) => {
      const x = getX(numCandles + i);
      pts.push(`${x.toFixed(1)},${getY(pt.predicted_price).toFixed(1)}`);
    });
    return `M ${pts.join(' L ')}`;
  })();

  // Boundary lines for the cone
  const upperConeLine = (() => {
    if (forecastPoints.length === 0) return '';
    const pts = [`${currentSpotX.toFixed(1)},${currentSpotY.toFixed(1)}`];
    forecastPoints.forEach((pt, i) => {
      pts.push(`${getX(numCandles + i).toFixed(1)},${getY(pt.upper_bound_90).toFixed(1)}`);
    });
    return `M ${pts.join(' L ')}`;
  })();

  const lowerConeLine = (() => {
    if (forecastPoints.length === 0) return '';
    const pts = [`${currentSpotX.toFixed(1)},${currentSpotY.toFixed(1)}`];
    forecastPoints.forEach((pt, i) => {
      pts.push(`${getX(numCandles + i).toFixed(1)},${getY(pt.lower_bound_90).toFixed(1)}`);
    });
    return `M ${pts.join(' L ')}`;
  })();

  // Price grid levels
  const numGridLines = 5;
  const gridLevels = Array.from({ length: numGridLines }).map((_, i) => {
    const p = minPrice + (i / (numGridLines - 1)) * priceRange;
    return { price: p, y: getY(p) };
  });

  const finalForecast = forecastPoints.length > 0 ? forecastPoints[forecastPoints.length - 1] : null;
  const expectedDriftPct = finalForecast
    ? (((finalForecast.predicted_price - currentSpot) / currentSpot) * 100).toFixed(2)
    : '+0.00';

  const BULL_COLOR = '#089981';
  const BEAR_COLOR = '#F23645';

  return (
    <div
      className="unified-forecast-chart-card"
      style={{
        borderRadius: 14,
        background: '#060B0E',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Chart Top Intelligence Ribbon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          background: 'rgba(10, 16, 26, 0.98)',
          borderBottom: '1px solid rgba(172, 88, 233, 0.15)',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pulse-dot dot-green" style={{ width: 8, height: 8 }} />
            <span style={{ fontSize: 13, fontWeight: 900, color: '#FFFFFF', letterSpacing: 0.5 }}>
              BINANCE:BTCUSDT ({timeframe})
            </span>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(172, 88, 233, 0.15)',
              border: '1px solid rgba(172, 88, 233, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: '#E0B0FF' }}>KRONOS AI FORWARD HORIZON</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>| 90% Volatility Cone</span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Current Spot: <strong style={{ color: '#00F5FF' }}>${currentSpot.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
          </div>

          {finalForecast && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Projected 90m: <strong style={{ color: Number(expectedDriftPct) >= 0 ? '#00E676' : '#FF5252' }}>
                ${finalForecast.predicted_price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ({Number(expectedDriftPct) >= 0 ? `+${expectedDriftPct}` : expectedDriftPct}%)
              </strong>
            </div>
          )}
        </div>

        {/* Project to Desktop MCP Button */}
        {onProjectToTradingView && (
          <button
            type="button"
            onClick={onProjectToTradingView}
            disabled={isProjectingToTv}
            style={{
              background: 'linear-gradient(135deg, rgba(38, 166, 154, 0.25), rgba(124, 77, 255, 0.25))',
              border: '1px solid rgba(38, 166, 154, 0.5)',
              color: '#80CBC4',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 800,
              cursor: isProjectingToTv ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease'
            }}
          >
            <span>{isProjectingToTv ? '⏳' : '⚡'}</span>
            <span>{isProjectingToTv ? 'Projecting to TV Desktop...' : 'Project Forecast to TV Desktop'}</span>
          </button>
        )}
      </div>

      {/* SVG Canvas Area */}
      <div style={{ width: '100%', overflowX: 'auto', background: '#060B0E' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: 700 }}
          onMouseLeave={() => {
            setHoveredIdx(null);
            setHoveredForecastIdx(null);
          }}
        >
          <defs>
            {/* Shaded Volatility Cone Gradient */}
            <linearGradient id="kronosConeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#AC58E9" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0.08" />
            </linearGradient>

            {/* Bull / Bear gradients */}
            <linearGradient id="bullCandleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#089981" />
              <stop offset="100%" stopColor="#056353" />
            </linearGradient>
            <linearGradient id="bearCandleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F23645" />
              <stop offset="100%" stopColor="#A81824" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glowTrajectory" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Lines & Price Labels */}
          {gridLevels.map((lvl, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={lvl.y}
                x2={svgWidth - padding.right}
                y2={lvl.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="3 3"
              />
              <text
                x={svgWidth - padding.right + 8}
                y={lvl.y + 3.5}
                fill="var(--text-dim)"
                fontSize="10"
                fontFamily="var(--font-mono)"
                textAnchor="start"
              >
                ${lvl.price.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Volume Baseline Separator */}
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom - volumeHeight}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom - volumeHeight}
            stroke="rgba(255, 255, 255, 0.08)"
          />
          <text
            x={padding.left + 4}
            y={svgHeight - padding.bottom - volumeHeight + 12}
            fill="var(--text-dim)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            VOL
          </text>

          {/* Historical Volume Bars */}
          {displayCandles.map((c, i) => {
            const x = getX(i) - candleWidth / 2;
            const y = getVolY(c.volume);
            const h = svgHeight - padding.bottom - y;
            const isBull = c.close >= c.open;
            return (
              <rect
                key={`vol-${i}`}
                x={x}
                y={y}
                width={candleWidth}
                height={Math.max(2, h)}
                fill={isBull ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)'}
                rx={1}
              />
            );
          })}

          {/* Historical Candlesticks */}
          {displayCandles.map((c, i) => {
            const isBull = c.close >= c.open;
            const x = getX(i);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const topY = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));

            return (
              <g
                key={`candle-${i}`}
                onMouseEnter={() => {
                  setHoveredIdx(i);
                  setHoveredForecastIdx(null);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isBull ? BULL_COLOR : BEAR_COLOR}
                  strokeWidth={1.2}
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={topY}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBull ? 'url(#bullCandleGrad)' : 'url(#bearCandleGrad)'}
                  stroke={isBull ? BULL_COLOR : BEAR_COLOR}
                  strokeWidth={0.8}
                  rx={1}
                />
              </g>
            );
          })}

          {/* Transition Line: NOW (LIVE) Spot Divider */}
          <line
            x1={currentSpotX}
            y1={padding.top}
            x2={currentSpotX}
            y2={svgHeight - padding.bottom}
            stroke="#FFB300"
            strokeWidth={1.4}
            strokeDasharray="4 3"
          />

          {/* Glowing Beacon on Live Candle */}
          <circle cx={currentSpotX} cy={currentSpotY} r={4.5} fill="#FFB300" />
          <circle cx={currentSpotX} cy={currentSpotY} r={10} fill="none" stroke="#FFB300" strokeWidth={1.2} opacity={0.7}>
            <animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* KRONOS AI FORWARD VOLATILITY CONE (Shaded Envelope) */}
          {conePath && (
            <path
              d={conePath}
              fill="url(#kronosConeGrad)"
              stroke="none"
            />
          )}

          {/* Upper 90% Bound Dotted Line */}
          {upperConeLine && (
            <path
              d={upperConeLine}
              fill="none"
              stroke="#D1C4E9"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              opacity={0.85}
            />
          )}

          {/* Lower 90% Bound Dotted Line */}
          {lowerConeLine && (
            <path
              d={lowerConeLine}
              fill="none"
              stroke="#D1C4E9"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              opacity={0.85}
            />
          )}

          {/* Chronos Mean Predictive Trajectory Line (Dashed Glowing Violet/Cyan) */}
          {trajectoryPath && (
            <path
              d={trajectoryPath}
              fill="none"
              stroke="#AC58E9"
              strokeWidth={2.4}
              strokeDasharray="5 4"
              filter="url(#glowTrajectory)"
            />
          )}

          {/* Forecast Future Target Points */}
          {forecastPoints.map((pt, i) => {
            const x = getX(numCandles + i);
            const y = getY(pt.predicted_price);
            const upperY = getY(pt.upper_bound_90);
            const lowerY = getY(pt.lower_bound_90);
            const isHovered = hoveredForecastIdx === i;

            return (
              <g
                key={`forecast-pt-${i}`}
                onMouseEnter={() => {
                  setHoveredForecastIdx(i);
                  setHoveredIdx(null);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Vertical Step Guide */}
                <line
                  x1={x}
                  y1={upperY}
                  x2={x}
                  y2={lowerY}
                  stroke="rgba(172, 88, 233, 0.2)"
                  strokeDasharray="2 2"
                />

                {/* Upper/Lower Whisker Caps */}
                <circle cx={x} cy={upperY} r={2} fill="#B388FF" opacity={0.7} />
                <circle cx={x} cy={lowerY} r={2} fill="#B388FF" opacity={0.7} />

                {/* Predicted Price Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#FFFFFF"
                  stroke="#7C4DFF"
                  strokeWidth={2}
                  filter="drop-shadow(0 0 6px #7C4DFF)"
                />

                {/* Step Price Label on Last Forecast Point */}
                {i === forecastPoints.length - 1 && (
                  <g>
                    <rect
                      x={svgWidth - padding.right + 2}
                      y={y - 10}
                      width={74}
                      height={20}
                      rx={6}
                      fill="#7C4DFF"
                      filter="drop-shadow(0 0 8px rgba(124, 77, 255, 0.6))"
                    />
                    <text
                      x={svgWidth - padding.right + 39}
                      y={y + 3.5}
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="900"
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                    >
                      ${pt.predicted_price.toFixed(0)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Time Labels on X-Axis */}
          {/* Past Candle Labels (Sampled every 4) */}
          {displayCandles.map((c, i) => {
            if (i % 5 !== 0 && i !== numCandles - 1) return null;
            const x = getX(i);
            const label = c.timestamp.includes('T') ? c.timestamp.split('T')[1].slice(0, 5) : c.timestamp.slice(-5);
            return (
              <text
                key={`x-past-${i}`}
                x={x}
                y={svgHeight - padding.bottom + 16}
                fill="var(--text-dim)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}

          {/* NOW (LIVE) Label */}
          <g>
            <rect
              x={currentSpotX - 32}
              y={svgHeight - padding.bottom + 6}
              width={64}
              height={18}
              rx={5}
              fill="#FFB300"
            />
            <text
              x={currentSpotX}
              y={svgHeight - padding.bottom + 18}
              fill="#000000"
              fontSize="9"
              fontWeight="900"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              NOW (LIVE)
            </text>
          </g>

          {/* Future Forecast Labels (+15m, +30m, etc.) */}
          {forecastPoints.map((pt, i) => {
            const x = getX(numCandles + i);
            const label = pt.horizon_label.includes('(') ? pt.horizon_label.split('(')[1].replace(')', '') : `+${(i + 1) * 15}m`;
            return (
              <text
                key={`x-future-${i}`}
                x={x}
                y={svgHeight - padding.bottom + 16}
                fill="#B388FF"
                fontSize="9"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                +{label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Information Box */}
      {(hoveredIdx !== null || hoveredForecastIdx !== null) && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 20,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(172, 88, 233, 0.4)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 11,
            color: '#E0F2F1',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          {hoveredIdx !== null && (
            <>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Time: </span>
                <strong>{displayCandles[hoveredIdx].timestamp.slice(-8)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Open: </span>
                <strong>${displayCandles[hoveredIdx].open.toFixed(1)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Close: </span>
                <strong style={{ color: displayCandles[hoveredIdx].close >= displayCandles[hoveredIdx].open ? BULL_COLOR : BEAR_COLOR }}>
                  ${displayCandles[hoveredIdx].close.toFixed(1)}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>High: </span>
                <strong>${displayCandles[hoveredIdx].high.toFixed(1)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Low: </span>
                <strong>${displayCandles[hoveredIdx].low.toFixed(1)}</strong>
              </div>
            </>
          )}

          {hoveredForecastIdx !== null && (
            <>
              <div>
                <span style={{ color: '#B388FF' }}>Step: </span>
                <strong>{forecastPoints[hoveredForecastIdx].horizon_label}</strong>
              </div>
              <div>
                <span style={{ color: '#B388FF' }}>AI Predicted: </span>
                <strong style={{ color: '#00F5FF' }}>
                  ${forecastPoints[hoveredForecastIdx].predicted_price.toFixed(1)}
                </strong>
              </div>
              <div>
                <span style={{ color: '#B388FF' }}>90% Cone Bounds: </span>
                <strong>
                  [${forecastPoints[hoveredForecastIdx].lower_bound_90.toFixed(0)} — ${forecastPoints[hoveredForecastIdx].upper_bound_90.toFixed(0)}]
                </strong>
              </div>
              <div>
                <span style={{ color: '#B388FF' }}>Expected Drift: </span>
                <strong style={{ color: forecastPoints[hoveredForecastIdx].predicted_price >= currentSpot ? '#00E676' : '#FF5252' }}>
                  {(((forecastPoints[hoveredForecastIdx].predicted_price - currentSpot) / currentSpot) * 100).toFixed(2)}%
                </strong>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom Chart Footer Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 18px',
          background: 'rgba(8, 12, 20, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: 11,
          color: 'var(--text-dim)',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: BULL_COLOR }} />
            <span>Bullish Candle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: BEAR_COLOR }} />
            <span>Bearish Candle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 2, background: '#FFB300' }} />
            <span>Current Spot Transition</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 16, height: 8, borderRadius: 2, background: 'rgba(172, 88, 233, 0.35)', border: '1px dashed #B388FF' }} />
            <span style={{ color: '#D1C4E9' }}>Kronos 90% Volatility Cone</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 16, height: 2, background: '#AC58E9' }} />
            <span style={{ color: '#AC58E9', fontWeight: 700 }}>AI Predicted Trajectory</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Horizon Engine:</span>
          <span style={{ color: '#E0F2F1', fontWeight: 700 }}>RevIN-Chronos Continuous Multi-Step</span>
        </div>
      </div>
    </div>
  );
};

