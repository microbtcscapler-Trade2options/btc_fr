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
      <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F19', color: '#64748B', borderRadius: 8 }}>
        <span>DATA UNAVAILABLE — Waiting for Market Stream...</span>
      </div>
    );
  }

  // Chart Dimensions
  const svgWidth = 960;
  const svgHeight = 440;
  const padding = { top: 20, right: 70, bottom: 40, left: 15 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const volumeHeight = 70;
  const priceHeight = chartHeight - volumeHeight - 10;

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

  const candleWidth = Math.max(2, (chartWidth / candles.length) * 0.7);

  // EMA SVG polyline generator
  const makeEmaPath = (emaValues: number[]) => {
    if (!emaValues || emaValues.length === 0) return '';
    return emaValues.map((val, idx) => `${getX(idx).toFixed(1)},${getY(val).toFixed(1)}`).join(' ');
  };

  const activeCandle = hoveredIdx !== null ? candles[hoveredIdx] : candles[candles.length - 1];
  const activeEma20 = hoveredIdx !== null ? emaData.ema20[hoveredIdx] : emaData.ema20[emaData.ema20.length - 1];
  const activeEma50 = hoveredIdx !== null ? emaData.ema50[hoveredIdx] : emaData.ema50[emaData.ema50.length - 1];
  const activeEma200 = hoveredIdx !== null ? emaData.ema200[hoveredIdx] : emaData.ema200[emaData.ema200.length - 1];
  const activeEma9 = hoveredIdx !== null ? emaData.ema9[hoveredIdx] : emaData.ema9[emaData.ema9.length - 1];
  const activeEma21 = hoveredIdx !== null ? emaData.ema21[hoveredIdx] : emaData.ema21[emaData.ema21.length - 1];

  return (
    <div style={{ position: 'relative', background: '#0D121F', borderRadius: 8, padding: 12, border: '1px solid #1E293B' }}>
      {/* Legend & Active Cursor Readout */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontFamily: 'JetBrains Mono' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ color: '#F8FAFC', fontWeight: 700 }}>BTCUSDT ({timeframe})</span>
          <span style={{ color: activeCandle.close >= activeCandle.open ? '#10B981' : '#F43F5E', fontWeight: 600 }}>
            ${activeCandle.close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ color: '#94A3B8' }}>O: <b style={{ color: '#F8FAFC' }}>{activeCandle.open.toFixed(1)}</b></span>
          <span style={{ color: '#94A3B8' }}>H: <b style={{ color: '#F8FAFC' }}>{activeCandle.high.toFixed(1)}</b></span>
          <span style={{ color: '#94A3B8' }}>L: <b style={{ color: '#F8FAFC' }}>{activeCandle.low.toFixed(1)}</b></span>
          <span style={{ color: '#94A3B8' }}>Vol: <b style={{ color: '#F8FAFC' }}>{activeCandle.volume.toFixed(1)}</b></span>
        </div>

        <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
          {showLayerA && (
            <>
              <span style={{ color: '#38BDF8' }}>EMA20: {activeEma20?.toFixed(1)}</span>
              <span style={{ color: '#3B82F6' }}>EMA50: {activeEma50?.toFixed(1)}</span>
              <span style={{ color: '#A855F7' }}>EMA200: {activeEma200?.toFixed(1)}</span>
            </>
          )}
          {showLayerB && (
            <>
              <span style={{ color: '#FBBF24' }}>EMA9: {activeEma9?.toFixed(1)}</span>
              <span style={{ color: '#FB923C' }}>EMA21: {activeEma21?.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const p = minPrice + priceRange * (1 - ratio);
          const y = padding.top + ratio * priceHeight;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#1E293B" strokeDasharray="3 3" />
              <text x={svgWidth - padding.right + 6} y={y + 4} fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">
                ${p.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Volume Separator */}
        <line
          x1={padding.left}
          y1={svgHeight - padding.bottom - volumeHeight}
          x2={svgWidth - padding.right}
          y2={svgHeight - padding.bottom - volumeHeight}
          stroke="#1E293B"
        />

        {/* Candlesticks & Volume Bars */}
        {candles.map((c, i) => {
          const x = getX(i);
          const isBull = c.close >= c.open;
          const candleColor = isBull ? '#10B981' : '#F43F5E';
          const wickColor = isBull ? '#10B981' : '#F43F5E';
          const yOpen = getY(c.open);
          const yClose = getY(c.close);
          const yHigh = getY(c.high);
          const yLow = getY(c.low);
          const bodyY = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

          const volY = getVolY(c.volume);
          const volBarHeight = (svgHeight - padding.bottom) - volY;

          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)}>
              {/* Volume Bar */}
              <rect
                x={x - candleWidth / 2}
                y={volY}
                width={candleWidth}
                height={volBarHeight}
                fill={isBull ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}
              />

              {/* Upper & Lower Wick */}
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={wickColor} strokeWidth="1.2" />

              {/* Candle Body */}
              <rect
                x={x - candleWidth / 2}
                y={bodyY}
                width={candleWidth}
                height={bodyHeight}
                fill={candleColor}
                rx="1"
              />
            </g>
          );
        })}

        {/* Layer A Overlays (EMA 20/50/200) */}
        {showLayerA && (
          <>
            <polyline fill="none" stroke="#38BDF8" strokeWidth="1.6" points={makeEmaPath(emaData.ema20)} />
            <polyline fill="none" stroke="#3B82F6" strokeWidth="1.6" points={makeEmaPath(emaData.ema50)} />
            <polyline fill="none" stroke="#A855F7" strokeWidth="2.0" points={makeEmaPath(emaData.ema200)} />
          </>
        )}

        {/* Layer B Overlays (EMA 9/21 Advisory) */}
        {showLayerB && (
          <>
            <polyline fill="none" stroke="#FBBF24" strokeWidth="1.4" strokeDasharray="4 2" points={makeEmaPath(emaData.ema9)} />
            <polyline fill="none" stroke="#FB923C" strokeWidth="1.4" strokeDasharray="4 2" points={makeEmaPath(emaData.ema21)} />
          </>
        )}

        {/* Interactive Cursor crosshair line */}
        {hoveredIdx !== null && (
          <>
            <line
              x1={getX(hoveredIdx)}
              y1={padding.top}
              x2={getX(hoveredIdx)}
              y2={svgHeight - padding.bottom}
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <line
              x1={padding.left}
              y1={getY(candles[hoveredIdx].close)}
              x2={svgWidth - padding.right}
              y2={getY(candles[hoveredIdx].close)}
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </>
        )}
      </svg>
    </div>
  );
};
