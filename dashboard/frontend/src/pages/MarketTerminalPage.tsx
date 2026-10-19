import React, { useState } from 'react';
import { MarketDataSnapshot, IndicatorSnapshot, MarketRegimeSnapshot, TimeFrame } from '../types';
import { CandlestickChart } from '../components/CandlestickChart';

interface Props {
  snapshot: MarketDataSnapshot | null;
  indicators: IndicatorSnapshot | null;
  regime: MarketRegimeSnapshot | null;
  timeframe: TimeFrame;
  setTimeframe: (tf: TimeFrame) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const MarketTerminalPage: React.FC<Props> = ({
  snapshot,
  indicators,
  regime,
  timeframe,
  setTimeframe,
  onRefresh,
  loading
}) => {
  const [showLayerA, setShowLayerA] = useState(true);
  const [showLayerB, setShowLayerB] = useState(false);

  const curPrice = snapshot?.latest_candle?.close || 0;
  const prevClose = snapshot?.candles && snapshot.candles.length > 1 ? snapshot.candles[snapshot.candles.length - 2].close : curPrice;
  const priceChange = curPrice - prevClose;
  const priceChangePct = prevClose > 0 ? (priceChange / prevClose) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Bar / Controls */}
      <div className="t2o-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, letterSpacing: 0.5 }}>ACTIVE INSTRUMENT</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC' }}>
              BTCUSDT <span style={{ fontSize: 12, color: '#38BDF8', fontWeight: 500 }}>Binance Spot Feed</span>
            </div>
          </div>

          <div style={{ borderLeft: '1px solid #1E293B', paddingLeft: 16 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>SPOT PRICE</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono', color: priceChange >= 0 ? '#10B981' : '#F43F5E' }}>
              ${curPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span style={{ fontSize: 12, marginLeft: 6, fontWeight: 500 }}>
                ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
              </span>
            </div>
          </div>

          {regime && (
            <div style={{ borderLeft: '1px solid #1E293B', paddingLeft: 16 }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>CURRENT REGIME</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span className={`t2o-badge ${regime.regime.includes('BULLISH') ? 'badge-bullish' : regime.regime.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}>
                  {regime.regime.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>({regime.confidence_pct}% Conf.)</span>
              </div>
            </div>
          )}
        </div>

        {/* Timeframe & Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', background: '#07090E', borderRadius: 6, padding: 2, border: '1px solid #1E293B' }}>
            {(['1m', '5m', '15m', '1h', '4h', '1d'] as TimeFrame[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono',
                  cursor: 'pointer',
                  border: 'none',
                  background: timeframe === tf ? '#38BDF8' : 'transparent',
                  color: timeframe === tf ? '#07090E' : '#94A3B8',
                  transition: 'all 0.15s ease'
                }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Toggle Layer A */}
          <button
            onClick={() => setShowLayerA(!showLayerA)}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'JetBrains Mono',
              cursor: 'pointer',
              border: '1px solid #1E293B',
              background: showLayerA ? 'rgba(56, 189, 248, 0.2)' : '#07090E',
              color: showLayerA ? '#38BDF8' : '#64748B'
            }}
          >
            Layer A (20/50/200)
          </button>

          {/* Toggle Layer B Advisory */}
          <button
            onClick={() => setShowLayerB(!showLayerB)}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'JetBrains Mono',
              cursor: 'pointer',
              border: '1px solid #1E293B',
              background: showLayerB ? 'rgba(251, 191, 36, 0.2)' : '#07090E',
              color: showLayerB ? '#FBBF24' : '#64748B'
            }}
          >
            Layer B (9/21 Adv)
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: '#1E293B',
              color: '#F8FAFC'
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Candlestick Chart */}
      <CandlestickChart
        candles={snapshot?.candles || []}
        timeframe={timeframe}
        showLayerA={showLayerA}
        showLayerB={showLayerB}
      />

      {/* Momentum & Volatility Metric Cards */}
      {indicators && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div className="t2o-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>RSI (14)</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', marginTop: 4, color: indicators.momentum.rsi_14 > 70 ? '#F43F5E' : indicators.momentum.rsi_14 < 30 ? '#10B981' : '#F8FAFC' }}>
              {indicators.momentum.rsi_14.toFixed(1)}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
              {indicators.momentum.rsi_14 > 70 ? 'Overbought' : indicators.momentum.rsi_14 < 30 ? 'Oversold' : 'Neutral Zone'}
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>ADX & DIRECTIONAL</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', marginTop: 4, color: '#38BDF8' }}>
              {indicators.momentum.adx_14.toFixed(1)}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
              +DI: <span style={{ color: '#10B981' }}>{indicators.momentum.plus_di.toFixed(1)}</span> | -DI: <span style={{ color: '#F43F5E' }}>{indicators.momentum.minus_di.toFixed(1)}</span>
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>ATR (14) & VOL PERCENTILE</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', marginTop: 4, color: '#F8FAFC' }}>
              ${indicators.momentum.atr_14.toFixed(1)}
            </div>
            <div style={{ fontSize: 10, color: indicators.momentum.atr_percentile_100 >= 90 ? '#F43F5E' : '#94A3B8', marginTop: 2 }}>
              Rolling 100-Bar: {indicators.momentum.atr_percentile_100.toFixed(0)}th percentile
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>CHOPPINESS INDEX</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', marginTop: 4, color: indicators.momentum.choppiness_index > 60 ? '#F59E0B' : '#10B981' }}>
              {indicators.momentum.choppiness_index.toFixed(1)}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
              {indicators.momentum.choppiness_index > 60 ? 'High Consolidation' : 'Directional Trend'}
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>DIRECTIONAL EFFICIENCY</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', marginTop: 4, color: '#A855F7' }}>
              {indicators.momentum.directional_efficiency.toFixed(3)}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
              Kaufman Ratio (0 to 1)
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>RATE OF CHANGE (ROC 14)</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', marginTop: 4, color: indicators.momentum.roc_14 >= 0 ? '#10B981' : '#F43F5E' }}>
              {indicators.momentum.roc_14 >= 0 ? '+' : ''}{indicators.momentum.roc_14.toFixed(2)}%
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
              Relative Vol: {indicators.momentum.relative_volume.toFixed(2)}x
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
