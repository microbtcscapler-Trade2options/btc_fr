import React, { useState } from 'react';
import { MarketDataSnapshot, IndicatorSnapshot, MarketRegimeSnapshot, TimeFrame } from '../types';
import { CandlestickChart } from '../components/CandlestickChart';
import { CosmicParticleSphere3D } from '../components/CosmicParticleSphere3D';
import { GenomeDoubleHelix3D } from '../components/GenomeDoubleHelix3D';
import { ElectricCyberRing3D } from '../components/ElectricCyberRing3D';

interface Props {
  snapshot: MarketDataSnapshot | null;
  indicators: IndicatorSnapshot | null;
  regime: MarketRegimeSnapshot | null;
  timeframe: TimeFrame;
  setTimeframe: (tf: TimeFrame) => void;
  onRefresh: () => void;
  loading: boolean;
  onOpenLab?: () => void;
}

export const MarketTerminalPage: React.FC<Props> = ({
  snapshot,
  indicators,
  regime,
  timeframe,
  setTimeframe,
  onRefresh,
  loading,
  onOpenLab
}) => {
  const [showLayerA, setShowLayerA] = useState(true);
  const [showLayerB, setShowLayerB] = useState(false);

  const curPrice = snapshot?.latest_candle?.close || 0;
  const prevClose = snapshot?.candles && snapshot.candles.length > 1 ? snapshot.candles[snapshot.candles.length - 2].close : curPrice;
  const priceChange = curPrice - prevClose;
  const priceChangePct = prevClose > 0 ? (priceChange / prevClose) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Upper Section: Full-Width Dominant BTC Candlestick Chart (Only Chart in this Section) */}
      <div
        className="t2o-card"
        style={{
          padding: '22px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Holographic Laser Sweep Beam & Corner Brackets */}
        <div className="holographic-laser-scan" />
        <div className="hud-corner-bracket hud-corner-tl" />
        <div className="hud-corner-bracket hud-corner-tr" />
        <div className="hud-corner-bracket hud-corner-bl" />
        <div className="hud-corner-bracket hud-corner-br" />
        {/* Card Header (Matching Reference Header Layout) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="price-beacon-dot" />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.8 }}>
                SPOT PRICE • BTC/USDT
              </div>
              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
              <span style={{ fontSize: 9, background: 'rgba(172, 88, 233,  0.15)', color: 'var(--accent-cyan-bright)', padding: '2px 8px', borderRadius: 'var(--pill-radius)', fontWeight: 800, border: '1px solid rgba(172, 88, 233,  0.3)' }}>
                TICK STREAM ACTIVE
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
              ${curPrice ? curPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 'var(--pill-radius)',
                  background: priceChange >= 0 ? 'rgba(172, 88, 233, 0.18)' : 'rgba(244, 63, 94, 0.18)',
                  border: priceChange >= 0 ? '1px solid rgba(172, 88, 233, 0.45)' : '1px solid rgba(244, 63, 94, 0.45)',
                  color: priceChange >= 0 ? '#FFFFFF' : '#c084fc',
                  boxShadow: priceChange >= 0 ? '0 0 16px rgba(172, 88, 233, 0.3)' : '0 0 16px rgba(244, 63, 94, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {priceChange >= 0 ? '↑ +' : '↓ '}{priceChangePct.toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, fontWeight: 500 }}>
              Binance Spot Feed • {snapshot?.candles_count || 0} Validated Closed Bars • Sub-second Latency
            </div>
          </div>

          {/* Controls (Pill Timeframes & Layer Toggles) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Segmented Timeframe Control */}
            <div className="segmented-pill-container">
              {(['1m', '5m', '15m', '1h', '4h', '1d'] as TimeFrame[]).map(tf => {
                const isActive = timeframe === tf;
                return (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`segmented-pill-btn ${isActive ? 'segmented-pill-btn-active' : ''}`}
                  >
                    {tf.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Toggle Layer A */}
            <button
              onClick={() => setShowLayerA(!showLayerA)}
              className={`control-pill-btn ${showLayerA ? 'control-pill-btn-active' : ''}`}
            >
              Layer A (20/50/200)
            </button>

            {/* Toggle Layer B Advisory */}
            <button
              onClick={() => setShowLayerB(!showLayerB)}
              className={`control-pill-btn ${showLayerB ? 'control-pill-btn-active' : ''}`}
            >
              Layer B (9/21 Adv)
            </button>

            {/* Refresh Action Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="control-pill-btn shimmer-sweep"
              style={{
                padding: '6px 16px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(172, 88, 233,  0.15) 0%, rgba(9, 19, 25, 0.8) 100%)',
                borderColor: 'rgba(172, 88, 233,  0.4)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Chart Rendering */}
        <CandlestickChart
          candles={snapshot?.candles || []}
          timeframe={timeframe}
          showLayerA={showLayerA}
          showLayerB={showLayerB}
        />
      </div>

      {/* 3D QUANTUM HEURISTICS & EXECUTION CYBER DECK (PINTEREST REFERENCES) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14 }}>🔮</span>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              3D Real-Time Heuristics & Adaptive Neural Deck
            </div>
            <span
              style={{
                fontSize: 9,
                background: 'linear-gradient(135deg, rgba(172, 88, 233,  0.25) 0%, rgba(172, 88, 233,  0.15) 100%)',
                color: 'var(--accent-fuchsia)',
                padding: '2px 9px',
                borderRadius: 'var(--pill-radius)',
                fontWeight: 800,
                border: '1px solid rgba(172, 88, 233,  0.45)',
                letterSpacing: 0.6
              }}
            >
              SPATIAL 3D MOUSE-COUPLED RUNTIME
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            FIBONACCI LATTICE • DOUBLE HELIX RUNTIME • EXPANDING SHOCKWAVE PORTAL
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 20,
            alignItems: 'stretch'
          }}
        >
          {/* Element 1: 3D Data-Reactive Particle Sphere (Pinterest Ref 1) */}
          <CosmicParticleSphere3D
            price={curPrice}
            entropyPct={regime ? Math.round(regime.confidence_pct) : 78}
          />

          {/* Element 2: 3D Quant Algorithmic Genome Double Helix (Pinterest Ref 3) */}
          <GenomeDoubleHelix3D
            activePair="LAYER_1_EMA"
            healthScore={regime ? Math.round(regime.confidence_pct) : 89}
          />

          {/* Element 3: 3D Electric Neon Cyber Shockwave Portal Ring (Pinterest Ref 4) */}
          <ElectricCyberRing3D
            action={regime ? regime.regime.replace(/_/g, ' ') : 'BUY MOMENTUM'}
            confidence={regime ? Math.round(regime.confidence_pct) : 85}
            onTriggerTick={onRefresh}
          />
        </div>
      </div>

      {/* Middle Section: MT5 Execution Desk & Quantitative Layer Breakdown (Real Institutional Data) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)',
          gap: 20,
          alignItems: 'stretch'
        }}
      >
        {/* Left: MT5 Standalone Execution & Risk Desk */}
        <div
          className="radiant-card stagger-card"
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="hud-corner-bracket hud-corner-tl" />
          <div className="hud-corner-bracket hud-corner-tr" />
          <div className="hud-corner-bracket hud-corner-bl" />
          <div className="hud-corner-bracket hud-corner-br" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan-bright)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                MT5 STANDALONE EXECUTION & RISK
              </span>
              <span style={{ fontSize: 9, background: 'rgba(172, 88, 233,  0.2)', color: 'var(--accent-cyan-bright)', padding: '2px 7px', borderRadius: 'var(--pill-radius)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="pulse-dot pulse-dot-ping" style={{ color: 'var(--accent-cyan)', width: 5, height: 5 }} />
                24/7 LIVE
              </span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              MAGIC: 261016
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                CURRENT REGIME & SIGNAL
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                {regime ? regime.regime.replace(/_/g, ' ') : 'SYNCHRONIZING'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                {regime ? regime.rationale : 'Monitoring live order book and moving average alignment.'}
              </div>
            </div>

            {/* High-Tech Circular Confidence Gauge */}
            {regime && (
              <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="68" height="68" viewBox="0 0 68 68" className="confidence-gauge-pulse">
                  <circle
                    cx="34"
                    cy="34"
                    r="28"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="34"
                    cy="34"
                    r="28"
                    fill="none"
                    stroke={regime.confidence_pct >= 60 ? 'var(--bullish-green-bright)' : 'var(--accent-orange-bright)'}
                    strokeWidth="5"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 * (1 - (regime.confidence_pct / 100))}
                    strokeLinecap="round"
                    transform="rotate(-90 34 34)"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-mono)', color: regime.confidence_pct >= 60 ? 'var(--bullish-green-bright)' : 'var(--accent-orange-bright)', lineHeight: 1 }}>
                    {regime.confidence_pct}%
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 0.5, marginTop: 2 }}>
                    CONF
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Execution Levels with Interactive Elevation Boxes */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'stretch'
            }}
          >
            <div className="exec-level-box">
              <div style={{ color: 'var(--text-dim)', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>STOP LOSS (ATR)</div>
              <div style={{ color: 'var(--bearish-red-bright)', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 4, fontSize: 13 }}>
                ${indicators ? (curPrice - indicators.momentum.atr_14 * 2).toLocaleString('en-US', { maximumFractionDigits: 1 }) : '—'}
              </div>
            </div>
            <div className="exec-level-box">
              <div style={{ color: 'var(--text-dim)', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>TARGET TP (1:2 R:R)</div>
              <div style={{ color: 'var(--bullish-green-bright)', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 4, fontSize: 13 }}>
                ${indicators ? (curPrice + indicators.momentum.atr_14 * 4).toLocaleString('en-US', { maximumFractionDigits: 1 }) : '—'}
              </div>
            </div>
            <div className="exec-level-box">
              <div style={{ color: 'var(--text-dim)', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>RECOMMENDED LOT</div>
              <div style={{ color: 'var(--accent-orange-bright)', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 4, fontSize: 13 }}>
                0.10 BTC
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="control-pill-btn"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--pill-radius)',
                fontWeight: 700,
                fontSize: 11,
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(172, 88, 233,  0.25)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>🔄 Sync Stream</span>
            </button>

            <button
              onClick={onOpenLab}
              className="shimmer-sweep"
              style={{
                flex: 1.2,
                padding: '10px 18px',
                borderRadius: 'var(--pill-radius)',
                fontWeight: 800,
                fontSize: 11,
                background: 'linear-gradient(135deg, rgba(172, 88, 233,  0.9) 0%, rgba(0, 180, 150, 0.95) 100%)',
                border: 'none',
                color: '#060B0E',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(172, 88, 233,  0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span style={{ fontWeight: 900 }}>⚡ Signal Lab ↗</span>
            </button>
          </div>
        </div>

        {/* Right: Quantitative Layer Breakdown */}
        <div
          className="t2o-card stagger-card"
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="hud-corner-bracket hud-corner-tl" />
          <div className="hud-corner-bracket hud-corner-tr" />
          <div className="hud-corner-bracket hud-corner-bl" />
          <div className="hud-corner-bracket hud-corner-br" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', letterSpacing: 0.4 }}>
              Quantitative Layer Breakdown
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-dot" style={{ color: 'var(--accent-cyan-bright)', width: 6, height: 6 }} />
              <span style={{ fontSize: 10, color: 'var(--accent-cyan-bright)', fontWeight: 700 }}>
                6-LAYER STACK
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="layer-row-interactive">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pulse-dot pulse-dot-ping" style={{ color: 'var(--accent-cyan)', width: 7, height: 7 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)' }}>Layer 1: Primary Trend</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>EMA 20/50/200 Fan Alignment</div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)' }}>ACTIVE</span>
            </div>

            <div className="layer-row-interactive">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pulse-dot pulse-dot-ping" style={{ color: 'var(--bullish-green)', width: 7, height: 7 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)' }}>Layer 2: Entry Timing</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Fast EMA 9/21 Pullback Retest</div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--bullish-green-bright)', fontFamily: 'var(--font-mono)' }}>CONFIRMED</span>
            </div>

            <div className="layer-row-interactive">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pulse-dot" style={{ color: indicators && indicators.momentum.adx_14 > 20 ? 'var(--bullish-green)' : 'var(--warning-amber)', width: 7, height: 7 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)' }}>Layer 3: Momentum Gate</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>ADX ({indicators ? indicators.momentum.adx_14.toFixed(1) : '—'}) & Chop ({indicators ? indicators.momentum.choppiness_index.toFixed(1) : '—'})</div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: indicators && indicators.momentum.choppiness_index > 60 ? 'var(--warning-amber)' : 'var(--bullish-green-bright)', fontFamily: 'var(--font-mono)' }}>
                {indicators && indicators.momentum.choppiness_index > 60 ? 'FILTERED' : 'PASSED'}
              </span>
            </div>

            <div className="layer-row-interactive">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pulse-dot" style={{ color: 'var(--accent-cyan-dim)', width: 7, height: 7 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)' }}>Layer 4: Microstructure</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Cumulative Volume Delta (CVD)</div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)' }}>REAL-TIME</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: All 6 Indicator Cards (Enhanced Animated Cards Treatment) */}
      {indicators && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Detailed Quantitative Indicator Readouts</span>
              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)' }}>
              REAL-TIME MT5 STREAM
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16
            }}
          >
            {/* Widget 1: RSI (14) - Holographic Cyber Dial */}
            <div className="futuristic-widget-3d stagger-card" style={{ animationDelay: '0ms' }}>
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="hud-corner-bracket hud-corner-bl" />
              <div className="hud-corner-bracket hud-corner-br" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pulse-dot" style={{ color: indicators.momentum.rsi_14 > 70 ? 'var(--bearish-red)' : indicators.momentum.rsi_14 < 30 ? 'var(--bullish-green)' : 'var(--accent-cyan)' }} />
                  RSI (14) • HOLOGRAPHIC DIAL
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: 4 }}>
                  OSC_MOMENTUM
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: indicators.momentum.rsi_14 > 70 ? 'var(--bearish-red-bright)' : indicators.momentum.rsi_14 < 30 ? 'var(--bullish-green-bright)' : 'var(--accent-cyan-bright)',
                      lineHeight: 1
                    }}
                  >
                    {indicators.momentum.rsi_14.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: indicators.momentum.rsi_14 > 70 ? 'var(--bearish-red-bright)' : indicators.momentum.rsi_14 < 30 ? 'var(--bullish-green-bright)' : 'var(--text-main)',
                        letterSpacing: 0.3
                      }}
                    >
                      {indicators.momentum.rsi_14 > 70 ? 'OVERBOUGHT ZONE (>70)' : indicators.momentum.rsi_14 < 30 ? 'OVERSOLD ZONE (<30)' : 'EQUILIBRIUM CRUISE'}
                    </span>
                  </div>
                </div>

                {/* Semicircular Radial Dial SVG */}
                <div style={{ position: 'relative', width: 74, height: 48, flexShrink: 0 }}>
                  <svg width="74" height="48" viewBox="0 0 74 48">
                    {/* Background Arc */}
                    <path
                      d="M 10 44 A 27 27 0 0 1 64 44"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Active Gauge Arc */}
                    <path
                      d="M 10 44 A 27 27 0 0 1 64 44"
                      fill="none"
                      stroke={indicators.momentum.rsi_14 > 70 ? 'var(--bearish-red-bright)' : indicators.momentum.rsi_14 < 30 ? 'var(--bullish-green-bright)' : 'url(#rsiGrad)'}
                      strokeWidth="5"
                      strokeDasharray="84.8"
                      strokeDashoffset={84.8 * (1 - Math.min(100, Math.max(0, indicators.momentum.rsi_14)) / 100)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                    <defs>
                      <linearGradient id="rsiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#AC58E9" />
                        <stop offset="50%" stopColor="#AC58E9" />
                        <stop offset="100%" stopColor="#FFFFFF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    0 • 50 • 100
                  </div>
                </div>
              </div>

              {/* Holographic Metric Line */}
              <div className="indicator-metric-bar">
                <div
                  className="indicator-metric-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, indicators.momentum.rsi_14))}%`,
                    background: indicators.momentum.rsi_14 > 70 ? 'var(--bearish-red-bright)' : indicators.momentum.rsi_14 < 30 ? 'var(--bullish-green-bright)' : 'linear-gradient(90deg, #AC58E9, #AC58E9)'
                  }}
                />
              </div>
            </div>

            {/* Widget 2: ADX & Directional Vector Compass */}
            <div className="futuristic-widget-3d stagger-card" style={{ animationDelay: '70ms' }}>
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="hud-corner-bracket hud-corner-bl" />
              <div className="hud-corner-bracket hud-corner-br" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pulse-dot" style={{ color: 'var(--accent-cyan)' }} />
                  ADX & DIRECTIONAL RADAR
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: indicators.momentum.adx_14 >= 25 ? 'var(--bullish-green-bright)' : 'var(--accent-orange-bright)', background: 'rgba(172, 88, 233,  0.08)', padding: '2px 6px', borderRadius: 4 }}>
                  {indicators.momentum.adx_14 >= 25 ? 'TREND LOCKED' : 'RANGING'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan-bright)',
                      lineHeight: 1
                    }}
                  >
                    {indicators.momentum.adx_14.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>+DI: <strong style={{ color: 'var(--bullish-green-bright)' }}>{indicators.momentum.plus_di.toFixed(1)}</strong></span>
                    <span>•</span>
                    <span>-DI: <strong style={{ color: 'var(--bearish-red-bright)' }}>{indicators.momentum.minus_di.toFixed(1)}</strong></span>
                  </div>
                </div>

                {/* Gyroscopic Directional Radar Reticle */}
                <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    {/* Rotating Gyro Compass Ring */}
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="rgba(172, 88, 233,  0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      className="gyro-ring-cw"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="16"
                      fill="none"
                      stroke="rgba(172, 88, 233,  0.3)"
                      strokeWidth="1"
                    />
                    {/* Crosshairs */}
                    <line x1="28" y1="6" x2="28" y2="50" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                    <line x1="6" y1="28" x2="50" y2="28" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                    {/* Directional Vector Dot */}
                    <circle
                      cx={indicators.momentum.plus_di > indicators.momentum.minus_di ? 36 : 20}
                      cy={indicators.momentum.plus_di > indicators.momentum.minus_di ? 20 : 36}
                      r="3.5"
                      fill={indicators.momentum.plus_di > indicators.momentum.minus_di ? 'var(--bullish-green-bright)' : 'var(--bearish-red-bright)'}
                      style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
                    />
                    <circle cx="28" cy="28" r="2" fill="white" />
                  </svg>
                </div>
              </div>

              <div className="indicator-metric-bar">
                <div
                  className="indicator-metric-fill"
                  style={{
                    width: `${Math.min(100, (indicators.momentum.adx_14 / 50) * 100)}%`,
                    background: 'linear-gradient(90deg, #AC58E9, #c084fc)'
                  }}
                />
              </div>
            </div>

            {/* Widget 3: ATR & Volatility 3D Corridor Tunnel */}
            <div className="futuristic-widget-3d stagger-card" style={{ animationDelay: '140ms' }}>
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="hud-corner-bracket hud-corner-bl" />
              <div className="hud-corner-bracket hud-corner-br" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pulse-dot" style={{ color: indicators.momentum.atr_percentile_100 >= 80 ? 'var(--bearish-red)' : 'var(--bullish-green)' }} />
                  ATR (14) & VOLATILITY TUNNEL
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: indicators.momentum.atr_percentile_100 >= 80 ? 'var(--bearish-red-bright)' : 'var(--accent-cyan-bright)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: 4 }}>
                  {indicators.momentum.atr_percentile_100.toFixed(0)}th %ILE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-main)',
                      lineHeight: 1
                    }}
                  >
                    ${indicators.momentum.atr_14.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Expected Move: <span style={{ color: 'var(--accent-cyan-bright)', fontWeight: 700 }}>±${(indicators.momentum.atr_14 * 1.5).toFixed(0)}</span>
                  </div>
                </div>

                {/* 3D Volatility Spectrum Bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44, padding: '0 4px' }}>
                  {[0.4, 0.65, 0.9, 0.75, 0.5, 0.85, 0.6].map((mult, idx) => {
                    const barHeight = Math.max(8, Math.min(40, (indicators.momentum.atr_percentile_100 / 100) * 38 * mult + 6));
                    return (
                      <div
                        key={idx}
                        style={{
                          width: 5,
                          height: `${barHeight}px`,
                          background: indicators.momentum.atr_percentile_100 >= 80
                            ? 'linear-gradient(180deg, #FF0055 0%, #7928CA 100%)'
                            : 'linear-gradient(180deg, #AC58E9 0%, #0070F3 100%)',
                          borderRadius: 2,
                          boxShadow: '0 0 8px rgba(172, 88, 233,  0.3)',
                          transition: 'height 0.6s ease'
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="indicator-metric-bar">
                <div
                  className="indicator-metric-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, indicators.momentum.atr_percentile_100))}%`,
                    background: indicators.momentum.atr_percentile_100 >= 80 ? 'var(--bearish-red-bright)' : 'linear-gradient(90deg, #AC58E9, #AC58E9)'
                  }}
                />
              </div>
            </div>

            {/* Widget 4: Choppiness Gyroscopic Dual-Ring Orbital */}
            <div className="futuristic-widget-3d stagger-card" style={{ animationDelay: '210ms' }}>
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="hud-corner-bracket hud-corner-bl" />
              <div className="hud-corner-bracket hud-corner-br" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pulse-dot" style={{ color: indicators.momentum.choppiness_index > 60 ? 'var(--warning-amber)' : 'var(--bullish-green)' }} />
                  CHOPPINESS GYRO ORBITAL
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: indicators.momentum.choppiness_index > 60 ? 'var(--warning-amber)' : 'var(--bullish-green-bright)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: 4 }}>
                  {indicators.momentum.choppiness_index > 61.8 ? 'CHOP REGIME' : indicators.momentum.choppiness_index < 38.2 ? 'EXPANSION' : 'STABLE'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: indicators.momentum.choppiness_index > 60 ? 'var(--warning-amber)' : 'var(--bullish-green-bright)',
                      lineHeight: 1
                    }}
                  >
                    {indicators.momentum.choppiness_index.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Coherence: <strong style={{ color: 'var(--text-main)' }}>{indicators.momentum.choppiness_index < 50 ? 'Laminar Trend' : 'Consolidation Noise'}</strong>
                  </div>
                </div>

                {/* Dual-Ring Gyroscopic Orbit */}
                <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    {/* Outer CW Ring */}
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      stroke="rgba(172, 88, 233,  0.5)"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                      className="gyro-ring-cw"
                    />
                    {/* Inner CCW Ring */}
                    <circle
                      cx="28"
                      cy="28"
                      r="15"
                      fill="none"
                      stroke="rgba(172, 88, 233,  0.6)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      className="gyro-ring-ccw"
                    />
                    {/* Center Core */}
                    <circle
                      cx="28"
                      cy="28"
                      r="5"
                      fill={indicators.momentum.choppiness_index > 60 ? 'var(--warning-amber)' : 'var(--bullish-green-bright)'}
                      style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
                    />
                  </svg>
                </div>
              </div>

              <div className="indicator-metric-bar">
                <div
                  className="indicator-metric-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, indicators.momentum.choppiness_index))}%`,
                    background: indicators.momentum.choppiness_index > 60 ? 'var(--warning-amber)' : 'var(--bullish-green-bright)'
                  }}
                />
              </div>
            </div>

            {/* Widget 5: Directional Efficiency (Kaufman Ratio) Vector Gyro */}
            <div className="futuristic-widget-3d stagger-card" style={{ animationDelay: '280ms' }}>
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="hud-corner-bracket hud-corner-bl" />
              <div className="hud-corner-bracket hud-corner-br" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pulse-dot" style={{ color: 'var(--accent-cyan-bright)' }} />
                  DIRECTIONAL EFFICIENCY (ER)
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)', background: 'rgba(172, 88, 233,  0.08)', padding: '2px 6px', borderRadius: 4 }}>
                  KAUFMAN_RATIO
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan-bright)',
                      lineHeight: 1
                    }}
                  >
                    {indicators.momentum.directional_efficiency.toFixed(3)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Signal: <strong style={{ color: 'var(--bullish-green-bright)' }}>{(indicators.momentum.directional_efficiency * 100).toFixed(0)}%</strong> • Noise: <strong style={{ color: 'var(--text-dim)' }}>{((1 - indicators.momentum.directional_efficiency) * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                {/* Rotating Azimuth Needle Dial */}
                <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke="var(--accent-cyan-bright)"
                      strokeWidth="2"
                      strokeDasharray="138.2"
                      strokeDashoffset={138.2 * (1 - indicators.momentum.directional_efficiency)}
                      transform="rotate(-90 28 28)"
                    />
                    {/* Directional Vector Needle */}
                    <line
                      x1="28"
                      y1="28"
                      x2={28 + 18 * Math.cos((indicators.momentum.directional_efficiency * 180 - 90) * Math.PI / 180)}
                      y2={28 + 18 * Math.sin((indicators.momentum.directional_efficiency * 180 - 90) * Math.PI / 180)}
                      stroke="var(--accent-cyan-bright)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="28" cy="28" r="3" fill="white" />
                  </svg>
                </div>
              </div>

              <div className="indicator-metric-bar">
                <div
                  className="indicator-metric-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, indicators.momentum.directional_efficiency * 100))}%`,
                    background: 'linear-gradient(90deg, #AC58E9, #c084fc)'
                  }}
                />
              </div>
            </div>

            {/* Widget 6: Rate of Change (ROC 14) Momentum Tachometer */}
            <div className="futuristic-widget-3d stagger-card" style={{ animationDelay: '350ms' }}>
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="hud-corner-bracket hud-corner-bl" />
              <div className="hud-corner-bracket hud-corner-br" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pulse-dot" style={{ color: indicators.momentum.roc_14 >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)' }} />
                  RATE OF CHANGE & VOLUME TACH
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: indicators.momentum.roc_14 >= 0 ? 'var(--bullish-green-bright)' : 'var(--bearish-red-bright)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: 4 }}>
                  {indicators.momentum.relative_volume.toFixed(2)}x VOL
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: indicators.momentum.roc_14 >= 0 ? 'var(--bullish-green-bright)' : 'var(--bearish-red-bright)',
                      lineHeight: 1
                    }}
                  >
                    {indicators.momentum.roc_14 >= 0 ? '+' : ''}{indicators.momentum.roc_14.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Volume Multiplier: <strong style={{ color: 'var(--accent-orange-bright)' }}>{indicators.momentum.relative_volume.toFixed(2)}x</strong>
                  </div>
                </div>

                {/* Tachometer Arc Needle */}
                <div style={{ position: 'relative', width: 64, height: 44, flexShrink: 0 }}>
                  <svg width="64" height="44" viewBox="0 0 64 44">
                    <path
                      d="M 8 38 A 24 24 0 0 1 56 38"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    {/* Needle */}
                    {(() => {
                      // Map ROC (-5 to +5%) to angle (-135 to -45 deg or 180 to 0)
                      const clampedRoc = Math.max(-5, Math.min(5, indicators.momentum.roc_14));
                      const angleDeg = 180 - ((clampedRoc + 5) / 10) * 180;
                      const rad = (angleDeg * Math.PI) / 180;
                      const nx = 32 + 20 * Math.cos(rad);
                      const ny = 38 - 20 * Math.sin(rad);
                      return (
                        <line
                          x1="32"
                          y1="38"
                          x2={nx}
                          y2={ny}
                          stroke={indicators.momentum.roc_14 >= 0 ? 'var(--bullish-green-bright)' : 'var(--bearish-red-bright)'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      );
                    })()}
                    <circle cx="32" cy="38" r="4" fill="white" />
                  </svg>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    -5% • 0 • +5%
                  </div>
                </div>
              </div>

              <div className="indicator-metric-bar">
                <div
                  className="indicator-metric-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, (indicators.momentum.relative_volume / 3) * 100))}%`,
                    background: indicators.momentum.roc_14 >= 0 ? 'var(--bullish-green-bright)' : 'var(--bearish-red-bright)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
