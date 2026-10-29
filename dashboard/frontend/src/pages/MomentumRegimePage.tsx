import React from 'react';
import { MarketRegimeSnapshot, IndicatorSnapshot } from '../types';

interface Props {
  regime: MarketRegimeSnapshot | null;
  indicators: IndicatorSnapshot | null;
}

export const MomentumRegimePage: React.FC<Props> = ({ regime, indicators }) => {
  if (!regime || !indicators) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>INITIALIZING REGIME RADAR</span>
        </div>
        Waiting for Regime Analysis Engine...
      </div>
    );
  }

  const pt = indicators.primary_trend;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Banner */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="price-beacon-dot" />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.8 }}>
                DETERMINISTIC REGIME ENGINE (M15 PRIMARY)
              </div>
              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
              <span
                className={`t2o-badge ${regime.regime.includes('BULLISH') ? 'badge-bullish' : regime.regime.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}
                style={{ fontSize: 16, padding: '6px 16px', letterSpacing: 0.6 }}
              >
                {regime.regime.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Certainty / Confidence:{' '}
                <b style={{ color: 'var(--accent-cyan-bright)', textShadow: '0 0 12px rgba(172, 88, 233,  0.4)' }}>
                  {regime.confidence_pct}%
                </b>
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10, maxWidth: 740, lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-main)' }}>Rationale:</strong> {regime.rationale}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.8 }}>DATA FRESHNESS</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: 2 }}>
              {regime.data_freshness_seconds.toFixed(0)}s ago (UTC)
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Closed Bar Analysis (Zero Lookahead)</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Moving Averages Hierarchy & Multi-timeframe agreement */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        {/* Primary Trend (EMA 20/50/200) */}
        <div className="t2o-card stagger-card stagger-2" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan-bright)', letterSpacing: 0.8 }}>
              LAYER A: PRIMARY TREND INTELLIGENCE (EMA 20/50/200)
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>M15 CLOSE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EMA 20</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)', marginTop: 3 }}>
                ${pt.ema20.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: pt.ema20_slope_deg >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)', marginTop: 3 }}>
                Slope: {pt.ema20_slope_deg > 0 ? '+' : ''}{pt.ema20_slope_deg.toFixed(1)}°
              </div>
            </div>

            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EMA 50</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#AC58E9', marginTop: 3 }}>
                ${pt.ema50.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: pt.ema50_slope_deg >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)', marginTop: 3 }}>
                Slope: {pt.ema50_slope_deg > 0 ? '+' : ''}{pt.ema50_slope_deg.toFixed(1)}°
              </div>
            </div>

            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EMA 200 (MACRO)</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#AC58E9', marginTop: 3 }}>
                ${pt.ema200.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: pt.ema200_slope_deg >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)', marginTop: 3 }}>
                Slope: {pt.ema200_slope_deg > 0 ? '+' : ''}{pt.ema200_slope_deg.toFixed(1)}°
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Hierarchy Alignment:</span>
              <b style={{ color: pt.is_aligned_bullish ? 'var(--bullish-green)' : pt.is_aligned_bearish ? 'var(--bearish-red)' : 'var(--warning-amber)' }}>
                {pt.is_aligned_bullish ? 'Bullish (20 > 50 > 200)' : pt.is_aligned_bearish ? 'Bearish (20 < 50 < 200)' : 'Mixed / Consolidating'}
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Price vs Macro EMA 200:</span>
              <b style={{ fontFamily: 'var(--font-mono)', color: pt.price_to_ema200_pct >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)' }}>
                {pt.price_to_ema200_pct >= 0 ? '+' : ''}{pt.price_to_ema200_pct.toFixed(2)}%
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>Primary Trend Category:</span>
              <b style={{ color: 'var(--text-main)' }}>{pt.trend_description}</b>
            </div>
          </div>
        </div>

        {/* Multi-Timeframe Alignment Matrix */}
        <div className="t2o-card stagger-card stagger-3" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#AC58E9', letterSpacing: 0.8 }}>
              MULTI-TIMEFRAME AGREEMENT MATRIX
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>CONFLUENCE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            <div className="layer-row-interactive">
              <div>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: 13 }}>M15 Execution Timeframe</span>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Primary Execution & Signal Bar</div>
              </div>
              <span className={`t2o-badge ${pt.trend_description.includes('BULLISH') ? 'badge-bullish' : pt.trend_description.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}>
                {pt.trend_description}
              </span>
            </div>

            <div className="layer-row-interactive">
              <div>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: 13 }}>H1 Intermediate Timeframe</span>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Trend Directional Filter</div>
              </div>
              <span className={`t2o-badge ${regime.higher_timeframe_agreement['H1']?.includes('BULLISH') ? 'badge-bullish' : regime.higher_timeframe_agreement['H1']?.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}>
                {regime.higher_timeframe_agreement['H1'] || 'CONSISTENT'}
              </span>
            </div>

            <div className="layer-row-interactive">
              <div>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: 13 }}>H4 Macro Context</span>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Institutional Bias & Liquidity</div>
              </div>
              <span className={`t2o-badge ${regime.higher_timeframe_agreement['H4']?.includes('BULLISH') ? 'badge-bullish' : regime.higher_timeframe_agreement['H4']?.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}>
                {regime.higher_timeframe_agreement['H4'] || 'NEUTRAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Supporting & Conflicting Evidences */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        <div className="t2o-card stagger-card stagger-3" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--bullish-green)', letterSpacing: 0.8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>SUPPORTING INDICATOR EVIDENCE</span>
            <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>{regime.supporting_indicators.length}</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: 0 }}>
            {regime.supporting_indicators.map((item, idx) => (
              <li key={idx} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--bullish-green)', fontWeight: 800 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="t2o-card stagger-card stagger-4" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--bearish-red)', letterSpacing: 0.8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>CONFLICTING OR DIVERGENT SIGNALS</span>
            <span className="t2o-badge badge-bearish" style={{ fontSize: 10 }}>{regime.conflicting_indicators.length}</span>
          </div>
          {regime.conflicting_indicators.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', padding: '12px 6px' }}>
              No conflicting indicators detected. Strong confluence across trend indicators.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: 0 }}>
              {regime.conflicting_indicators.map((item, idx) => (
                <li key={idx} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--bearish-red)', fontWeight: 800 }}>⚠</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
