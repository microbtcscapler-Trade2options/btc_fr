import React, { useState, useMemo } from 'react';
import { Candle, TimeFrame } from '../types';

interface CandlestickChartProps {
  candles: Candle[];
  timeframe: TimeFrame;
  showLayerA: boolean; // EMA 20/50/200
  showLayerB: boolean; // EMA 9/21/200 Advisory
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  timeframe,
  showLayerA,
  showLayerB
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute EMAs for chart overlay lines
  const emaData = useMemo(() => {
    if (!candles || candles.length === 0) return { ema9: [], ema20: [], ema21: [], ema50: [], ema200: [] };

    const calcEma = (period: number) => {
      const alpha = 2 / (period + 1);
      const res: number[] = [];
      let ema = candles[0].close;
      for (let i = 0; i < candles.length; i++) {
        ema = i === 0 ? candles[0].close : (candles[i].close * alpha) + (ema * (1 - alpha));
        res.push(ema);
      }
      return res;
    };

    return {
      ema9: calcEma(9),
      ema20: calcEma(20),
      ema21: calcEma(21),
      ema50: calcEma(50),
      ema200: calcEma(200)
    };
  }, [candles]);

  if (!candles || candles.length === 0) {
    return (
      <div
        className="t2o-card"
        style={{
          height: 440,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-card-gradient)',
          color: 'var(--text-muted)',
          borderRadius: 'var(--card-radius)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="pulse-dot dot-orange" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 0.5 }}>
            DATA UNAVAILABLE — Waiting for Market Stream...
          </span>
        </div>
      </div>
    );
  }

  // Chart Dimensions
  const svgWidth = 980;
  const svgHeight = 450;
  const padding = { top: 22, right: 75, bottom: 42, left: 16 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const volumeHeight = 70;
  const priceHeight = chartHeight - volumeHeight - 12;

  // Price range calculation
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const minPrice = Math.min(...lows) * 0.998;
  const maxPrice = Math.max(...highs) * 1.002;
  const priceRange = maxPrice - minPrice || 1.0;

  // Volume range
  const maxVolume = Math.max(...candles.map(c => c.volume)) || 1.0;

  const getX = (index: number) => {
    return padding.left + (index / (candles.length - 1 || 1)) * chartWidth;
  };

  const getY = (price: number) => {
    return padding.top + (1 - (price - minPrice) / priceRange) * priceHeight;
  };

  const getVolY = (vol: number) => {
    return svgHeight - padding.bottom - (vol / maxVolume) * volumeHeight;
  };

  const candleWidth = Math.max(2.5, (chartWidth / candles.length) * 0.72);

  // EMA SVG polyline generator
  const makeEmaPath = (emaValues: number[]) => {
    if (!emaValues || emaValues.length === 0) return '';
    return emaValues.map((val, idx) => `${getX(idx).toFixed(1)},${getY(val).toFixed(1)}`).join(' ');
  };

  // Mountain Area Glow under Price Curve (Matching Reference Image)
  const makeAreaPath = () => {
    if (!candles || candles.length === 0) return '';
    const points = candles.map((c, i) => `${getX(i).toFixed(1)},${getY(c.close).toFixed(1)}`);
    const baselineY = (svgHeight - padding.bottom - volumeHeight).toFixed(1);
    const firstX = getX(0).toFixed(1);
    const lastX = getX(candles.length - 1).toFixed(1);
    return `M ${firstX},${baselineY} L ${points.join(' L ')} L ${lastX},${baselineY} Z`;
  };

  // REAL TRADING CHART COLORS (Industry Standard TradingView / Bloomberg Palette)
  const BULL_COLOR = '#089981'; // Vibrant TradingView Bullish Green
  const BEAR_COLOR = '#F23645'; // Vibrant TradingView Bearish Red
  const EMA20_COLOR = '#38BDF8'; // Bright Sky Blue
  const EMA50_COLOR = '#00E676'; // Vibrant Emerald Green
  const EMA200_COLOR = '#FFB800'; // Institutional Amber Gold
  const EMA9_COLOR = '#00F5FF'; // Electric Cyan
  const EMA21_COLOR = '#FF7043'; // Vibrant Sunset Coral

  const activeCandle = hoveredIdx !== null ? candles[hoveredIdx] : candles[candles.length - 1];
  const activeEma20 = hoveredIdx !== null ? emaData.ema20[hoveredIdx] : emaData.ema20[emaData.ema20.length - 1];
  const activeEma50 = hoveredIdx !== null ? emaData.ema50[hoveredIdx] : emaData.ema50[emaData.ema50.length - 1];
  const activeEma200 = hoveredIdx !== null ? emaData.ema200[hoveredIdx] : emaData.ema200[emaData.ema200.length - 1];
  const activeEma9 = hoveredIdx !== null ? emaData.ema9[hoveredIdx] : emaData.ema9[emaData.ema9.length - 1];
  const activeEma21 = hoveredIdx !== null ? emaData.ema21[hoveredIdx] : emaData.ema21[emaData.ema21.length - 1];

  const latestIndex = candles.length - 1;
  const latestX = getX(latestIndex);
  const latestY = getY(candles[latestIndex].close);

  const hoveredX = hoveredIdx !== null ? getX(hoveredIdx) : null;
  const hoveredY = hoveredIdx !== null ? getY(activeCandle.close) : null;

  return (
    <div
      className="t2o-card"
      style={{
        position: 'relative',
        padding: '18px 22px'
      }}
    >
      {/* Floating White Tooltip on Hover (Real Trading Direction Arrow) */}
      {hoveredIdx !== null && (
        <div
          className="chart-white-tooltip"
          style={{
            left: `${Math.max(8, Math.min(92, (hoveredIdx / (candles.length - 1 || 1)) * 100))}%`,
            top: 24,
            transform: 'translateX(-50%)'
          }}
        >
          <div style={{ fontSize: 9, color: '#70665F', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>{new Date(activeCandle.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span style={{ color: activeCandle.close >= activeCandle.open ? BULL_COLOR : BEAR_COLOR, fontWeight: 900 }}>
              {activeCandle.close >= activeCandle.open ? '↗' : '↘'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#0B0A09', fontWeight: 900, marginTop: 1 }}>
            ${activeCandle.close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
        </div>
      )}

      {/* Legend & Active Cursor Readout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 10
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              color: '#FFFFFF',
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '2px 8px',
              borderRadius: 'var(--pill-radius)',
              fontSize: 11,
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            BTCUSDT ({timeframe.toUpperCase()})
          </span>
          <span
            style={{
              color: activeCandle.close >= activeCandle.open ? BULL_COLOR : BEAR_COLOR,
              fontWeight: 800,
              fontSize: 14,
              fontFamily: 'var(--font-mono)'
            }}
          >
            ${activeCandle.close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>O: <b style={{ color: '#FFFFFF' }}>{activeCandle.open.toFixed(1)}</b></span>
          <span style={{ color: 'var(--text-muted)' }}>H: <b style={{ color: '#FFFFFF' }}>{activeCandle.high.toFixed(1)}</b></span>
          <span style={{ color: 'var(--text-muted)' }}>L: <b style={{ color: '#FFFFFF' }}>{activeCandle.low.toFixed(1)}</b></span>
          <span style={{ color: 'var(--text-muted)' }}>Vol: <b style={{ color: '#FFFFFF' }}>{activeCandle.volume.toFixed(1)}</b></span>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 11, flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
          {showLayerA && (
            <>
              <span style={{ color: EMA20_COLOR, fontWeight: 700 }}>EMA20: {activeEma20?.toFixed(1)}</span>
              <span style={{ color: EMA50_COLOR, fontWeight: 700 }}>EMA50: {activeEma50?.toFixed(1)}</span>
              <span style={{ color: EMA200_COLOR, fontWeight: 700 }}>EMA200: {activeEma200?.toFixed(1)}</span>
            </>
          )}
          {showLayerB && (
            <>
              <span style={{ color: EMA9_COLOR, fontWeight: 700 }}>EMA9: {activeEma9?.toFixed(1)}</span>
              <span style={{ color: EMA21_COLOR, fontWeight: 700 }}>EMA21: {activeEma21?.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="chartAreaGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BULL_COLOR} stopOpacity="0.14" />
            <stop offset="60%" stopColor={BULL_COLOR} stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bullishVolGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BULL_COLOR} stopOpacity="0.75" />
            <stop offset="100%" stopColor={BULL_COLOR} stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="bearishVolGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BEAR_COLOR} stopOpacity="0.75" />
            <stop offset="100%" stopColor={BEAR_COLOR} stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="bullPillGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#089981" />
            <stop offset="100%" stopColor="#00F59B" />
          </linearGradient>
          <linearGradient id="bearPillGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F23645" />
            <stop offset="100%" stopColor="#FF5252" />
          </linearGradient>
          <filter id="emaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const p = minPrice + priceRange * (1 - ratio);
          const y = padding.top + ratio * priceHeight;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="3 4"
              />
              <text
                x={svgWidth - padding.right + 8}
                y={y + 4}
                fill="#94A3B8"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                ${p.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Mountain Area Fill under Price Curve */}
        <path
          d={makeAreaPath()}
          fill="url(#chartAreaGlow)"
          opacity={0.85}
        />

        {/* Volume Separator Line */}
        <line
          x1={padding.left}
          y1={svgHeight - padding.bottom - volumeHeight}
          x2={svgWidth - padding.right}
          y2={svgHeight - padding.bottom - volumeHeight}
          stroke="rgba(255, 255, 255, 0.12)"
        />
        <text
          x={padding.left}
          y={svgHeight - padding.bottom - volumeHeight - 5}
          fill="#94A3B8"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="0.5"
          fontWeight="700"
        >
          VOLUME (CVD SUB-LAYER)
        </text>

        {/* Real Candlesticks & Volume Bars in Authentic Trading Green & Red */}
        {candles.map((c, i) => {
          const x = getX(i);
          const isBull = c.close >= c.open;
          const candleColor = isBull ? BULL_COLOR : BEAR_COLOR;
          const yOpen = getY(c.open);
          const yClose = getY(c.close);
          const yHigh = getY(c.high);
          const yLow = getY(c.low);
          const bodyY = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

          const volY = getVolY(c.volume);
          const volBarHeight = (svgHeight - padding.bottom) - volY;

          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              style={{ cursor: 'crosshair' }}
              className="chart-candle-group"
            >
              {/* Volume Bar */}
              <rect
                x={x - candleWidth / 2}
                y={volY}
                width={candleWidth}
                height={volBarHeight}
                fill={isBull ? 'url(#bullishVolGrad)' : 'url(#bearishVolGrad)'}
                rx={1}
                opacity={isHovered ? 1 : 0.82}
              />

              {/* Upper / Lower Wick */}
              <line
                x1={x}
                y1={yHigh}
                x2={x}
                y2={yLow}
                stroke={candleColor}
                strokeWidth={isHovered ? 2.0 : 1.3}
                opacity={0.92}
              />

              {/* Candle Real Body */}
              <rect
                x={x - candleWidth / 2}
                y={bodyY}
                width={candleWidth}
                height={bodyHeight}
                fill={candleColor}
                stroke={candleColor}
                strokeWidth={0.5}
                rx={1}
                filter={isHovered ? `drop-shadow(0 0 8px ${isBull ? 'rgba(8, 153, 129, 0.85)' : 'rgba(242, 54, 69, 0.85)'})` : undefined}
              />
            </g>
          );
        })}

        {/* Moving Average Overlays with Glowing Paths */}
        {showLayerA && (
          <>
            <polyline
              points={makeEmaPath(emaData.ema20)}
              fill="none"
              stroke={EMA20_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.95}
              filter="url(#emaGlow)"
            />
            <polyline
              points={makeEmaPath(emaData.ema50)}
              fill="none"
              stroke={EMA50_COLOR}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.92}
            />
            <polyline
              points={makeEmaPath(emaData.ema200)}
              fill="none"
              stroke={EMA200_COLOR}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.88}
            />
          </>
        )}

        {showLayerB && (
          <>
            <polyline
              points={makeEmaPath(emaData.ema9)}
              fill="none"
              stroke={EMA9_COLOR}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
            <polyline
              points={makeEmaPath(emaData.ema21)}
              fill="none"
              stroke={EMA21_COLOR}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          </>
        )}

        {/* Live Real-Time Beacon on Latest Bar */}
        {(() => {
          const isLatestBull = candles[latestIndex].close >= candles[latestIndex].open;
          const beaconColor = isLatestBull ? BULL_COLOR : BEAR_COLOR;
          return (
            <g>
              <line
                x1={padding.left}
                y1={latestY}
                x2={svgWidth - padding.right}
                y2={latestY}
                stroke={beaconColor}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.65}
              />
              <circle cx={latestX} cy={latestY} r={3.5} fill={beaconColor} />
              <circle cx={latestX} cy={latestY} r={8} fill="none" stroke={beaconColor} strokeWidth={1.2} opacity={0.65}>
                <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Latest Price Tag on Right Axis */}
              <rect
                x={svgWidth - padding.right + 2}
                y={latestY - 9}
                width={70}
                height={18}
                rx={9}
                fill={isLatestBull ? 'url(#bullPillGrad)' : 'url(#bearPillGrad)'}
                filter={`drop-shadow(0 0 6px ${beaconColor})`}
              />
              <text
                x={svgWidth - padding.right + 37}
                y={latestY + 3.5}
                fill="#FFFFFF"
                fontSize="9.5"
                fontWeight="900"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                ${candles[latestIndex].close.toFixed(0)}
              </text>
            </g>
          );
        })()}

        {/* Interactive Crosshair when Hovered with Peak Glowing Dot */}
        {hoveredX !== null && hoveredY !== null && (
          <g style={{ pointerEvents: 'none' }}>
            {/* Vertical crosshair line */}
            <line
              x1={hoveredX}
              y1={padding.top}
              x2={hoveredX}
              y2={svgHeight - padding.bottom}
              stroke="rgba(255, 255, 255, 0.35)"
              strokeDasharray="3 3"
            />
            {/* Horizontal price crosshair line */}
            <line
              x1={padding.left}
              y1={hoveredY}
              x2={svgWidth - padding.right}
              y2={hoveredY}
              stroke="rgba(255, 255, 255, 0.35)"
              strokeDasharray="3 3"
            />
            {/* Intersection Glowing Dot */}
            <circle
              cx={hoveredX}
              cy={hoveredY}
              r={5}
              fill="#FFFFFF"
              stroke={activeCandle.close >= activeCandle.open ? BULL_COLOR : BEAR_COLOR}
              strokeWidth={2.5}
              filter={`drop-shadow(0 0 8px ${activeCandle.close >= activeCandle.open ? BULL_COLOR : BEAR_COLOR})`}
            />
          </g>
        )}
      </svg>

      {/* Horizontal Timeline Bar with Glowing Progress Capsule */}
      <div className="chart-timeline-track" style={{ marginTop: 14 }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          {/* Progress Capsule Segment */}
          <div
            className="chart-timeline-green-bar"
            style={{
              left: '52%',
              width: '24%',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(90deg, #089981, #00F59B)'
            }}
          />
          {/* Active Highlight Dot on Timeline */}
          <div
            className="chart-timeline-dot"
            style={{
              left: '76%',
              background: '#00F59B',
              boxShadow: '0 0 10px #00F59B'
            }}
          />

          {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((month, idx) => (
            <span key={idx} className="chart-timeline-item">
              {month}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Chart Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: 11,
          color: 'var(--text-dim)',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>BTC Spot Reference:</span>
          <span style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            ${candles.length > 0 ? candles[candles.length - 1].close.toLocaleString('en-US', { minimumFractionDigits: 1 }) : '80,000'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: BULL_COLOR, display: 'inline-block' }} />
            <span style={{ color: '#cbd5e1' }}>Bullish Candle</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: BEAR_COLOR, display: 'inline-block' }} />
            <span style={{ color: '#cbd5e1' }}>Bearish Candle</span>
          </div>

          {showLayerA && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: EMA20_COLOR, display: 'inline-block' }} />
              <span style={{ color: EMA20_COLOR }}>EMA 20</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

