import React from 'react';
import { IndicatorSnapshot } from '../types';

interface Props {
  indicators: IndicatorSnapshot | null;
}

export const EntryTimingPage: React.FC<Props> = ({ indicators }) => {
  if (!indicators) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>INITIALIZING TIMING RADAR</span>
        </div>
        Waiting for Entry Timing Intelligence...
      </div>
    );
  }

  const et = indicators.entry_timing;
  const pt = indicators.primary_trend;

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'var(--bullish-green)';
    if (score >= 55) return 'var(--accent-cyan-bright)';
    if (score >= 40) return 'var(--warning-amber)';
    return 'var(--bearish-red)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ADVISORY MANDATORY NOTICE BANNER */}
      <div
        className="t2o-card stagger-card stagger-1"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.08) 0%, rgba(9, 19, 25, 0.85) 100%)',
          border: '1px solid rgba(255, 209, 102, 0.35)',
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div style={{ fontSize: 26, filter: 'drop-shadow(0 0 10px rgba(255, 209, 102, 0.5))' }}>🛡️</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--warning-amber)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {et.is_advisory_notice}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.6 }}>
            This secondary EMA 9/21/200 layer is strictly analytical. It assesses short-term entry timing and pullback recovery in the dashboard.
            It does NOT alter the MT5 EA’s independent trade execution or create unauthorized order mutations.
          </div>
        </div>
      </div>

      {/* Main Score & Status Card */}
      <div className="t2o-card stagger-card stagger-2" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="price-beacon-dot" />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.8 }}>
                ENTRY TIMING ASSESSMENT
              </div>
              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 8 }}>
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: getScoreColor(et.score),
                  textShadow: `0 0 20px ${getScoreColor(et.score)}66`
                }}
              >
                {et.score.toFixed(0)}
              </span>
              <span style={{ fontSize: 16, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>/ 100</span>
              <span
                className={`t2o-badge ${et.rating === 'FAVORABLE' ? 'badge-bullish' : et.rating === 'IMPROVING' ? 'badge-info' : et.rating === 'CONFLICTING' ? 'badge-bearish' : 'badge-warning'}`}
                style={{ fontSize: 13, padding: '5px 12px' }}
              >
                {et.rating}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Primary Trend Agreement:{' '}
              <b style={{ color: et.agreement_with_primary_trend ? 'var(--bullish-green)' : 'var(--bearish-red)' }}>
                {et.agreement_with_primary_trend ? 'ALIGNED (In-Sync)' : 'CONFLICTING / DIVERGENT'}
              </b>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div className="exec-level-box" style={{ minWidth: 150, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EMA 9 vs EMA 21</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: et.ema9_above_ema21 ? 'var(--bullish-green)' : 'var(--bearish-red)', marginTop: 3 }}>
                {et.ema9_above_ema21 ? 'EMA9 > EMA21' : 'EMA9 < EMA21'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3 }}>
                Age: {et.crossover_age_bars} bars ago
              </div>
            </div>

            <div className="exec-level-box" style={{ minWidth: 150, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PULLBACK DEPTH</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 3 }}>
                {et.pullback_depth_atr.toFixed(2)} ATR
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3 }}>
                {et.pullback_depth_atr < 0.5 ? 'Shallow / Retest' : et.pullback_depth_atr <= 1.5 ? 'Optimal Pullback' : 'Deep Correction'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown & Scoring Model */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        <div className="t2o-card stagger-card stagger-3" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan-bright)', letterSpacing: 0.8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
            SCORE FACTOR BREAKDOWN (DOCUMENTED WEIGHTS)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(et.factor_breakdown).map(([factor, pts]) => {
              const maxPts = factor.includes('alignment') ? 25 : factor.includes('penalty') ? 0 : 20;
              const isPenalty = pts < 0;
              const pct = maxPts > 0 ? Math.min(100, Math.max(0, (pts / maxPts) * 100)) : 0;
              return (
                <div key={factor} className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: 600 }}>
                      {factor.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: isPenalty ? 'var(--bearish-red)' : 'var(--bullish-green)' }}>
                      {pts > 0 ? '+' : ''}{pts.toFixed(1)} {maxPts > 0 ? `/ ${maxPts} pts` : 'pts'}
                    </span>
                  </div>
                  {maxPts > 0 && (
                    <div className="indicator-metric-bar" style={{ marginTop: 2, height: 4 }}>
                      <div
                        className="indicator-metric-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isPenalty ? 'var(--bearish-red)' : 'var(--accent-cyan)',
                          boxShadow: `0 0 10px ${isPenalty ? 'var(--bearish-red)' : 'var(--accent-cyan)'}`
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Short-Term vs Macro Structure Comparison */}
        <div className="t2o-card stagger-card stagger-4" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--warning-amber)', letterSpacing: 0.8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
            LAYER COMPARISON: LAYER A vs LAYER B
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 14 }}>
              <div style={{ fontWeight: 800, color: 'var(--accent-cyan-bright)', marginBottom: 4 }}>Layer A (Primary Trend)</div>
              <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Monitors EMA 20 (${pt.ema20.toLocaleString()}), EMA 50 (${pt.ema50.toLocaleString()}), and EMA 200 (${pt.ema200.toLocaleString()}).
                Status: <strong style={{ color: 'var(--text-main)' }}>{pt.trend_description}</strong>.
              </div>
            </div>

            <div className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 14 }}>
              <div style={{ fontWeight: 800, color: 'var(--warning-amber)', marginBottom: 4 }}>Layer B (Advisory Entry Timing)</div>
              <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Monitors EMA 9 (${et.ema9.toLocaleString()}) and EMA 21 (${et.ema21.toLocaleString()}).
                Current Spread: EMA9 is <strong style={{ color: 'var(--text-main)' }}>{et.ema9 >= et.ema21 ? 'above' : 'below'}</strong> EMA21 by {Math.abs(et.ema9 - et.ema21).toFixed(1)} USD.
              </div>
            </div>

            <div className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 14 }}>
              <div style={{ fontWeight: 800, color: 'var(--bullish-green)', marginBottom: 4 }}>Ablation & Independence Rule</div>
              <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                The EA executes based strictly on the approved Primary Trend framework. Testing the advisory layer's incremental value is conducted safely in the Backtest Lab before any EA parameter changes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
