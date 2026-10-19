import React from 'react';
import { IndicatorSnapshot } from '../types';

interface Props {
  indicators: IndicatorSnapshot | null;
}

export const EntryTimingPage: React.FC<Props> = ({ indicators }) => {
  if (!indicators) {
    return (
      <div className="t2o-card" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        DATA UNAVAILABLE — Waiting for Entry Timing Intelligence...
      </div>
    );
  }

  const et = indicators.entry_timing;
  const pt = indicators.primary_trend;

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10B981';
    if (score >= 55) return '#38BDF8';
    if (score >= 40) return '#F59E0B';
    return '#F43F5E';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ADVISORY MANDATORY NOTICE BANNER */}
      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: 8, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 24 }}>🛡</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24', letterSpacing: 0.5 }}>
            {et.is_advisory_notice}
          </div>
          <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 2 }}>
            This secondary EMA 9/21/200 layer is strictly analytical. It assesses short-term entry timing and pullback recovery in the dashboard.
            It does NOT alter the MT5 EA’s independent trade execution or create unauthorized order mutations.
          </div>
        </div>
      </div>

      {/* Main Score & Status Card */}
      <div className="t2o-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>ENTRY TIMING ASSESSMENT</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, fontFamily: 'JetBrains Mono', color: getScoreColor(et.score) }}>
                {et.score.toFixed(0)}
              </span>
              <span style={{ fontSize: 16, color: '#64748B', fontFamily: 'JetBrains Mono' }}>/ 100</span>
              <span className={`t2o-badge ${et.rating === 'FAVORABLE' ? 'badge-bullish' : et.rating === 'IMPROVING' ? 'badge-info' : et.rating === 'CONFLICTING' ? 'badge-bearish' : 'badge-warning'}`} style={{ fontSize: 14, padding: '4px 10px' }}>
                {et.rating}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
              Primary Trend Agreement: <b style={{ color: et.agreement_with_primary_trend ? '#10B981' : '#F43F5E' }}>
                {et.agreement_with_primary_trend ? 'ALIGNED (In-Sync)' : 'CONFLICTING / DIVERGENT'}
              </b>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ background: '#07090E', padding: 12, borderRadius: 6, border: '1px solid #1E293B', minWidth: 120 }}>
              <div style={{ fontSize: 11, color: '#64748B' }}>EMA 9 vs EMA 21</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: et.ema9_above_ema21 ? '#10B981' : '#F43F5E', marginTop: 2 }}>
                {et.ema9_above_ema21 ? 'EMA9 > EMA21' : 'EMA9 < EMA21'}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                Age: {et.crossover_age_bars} bars ago
              </div>
            </div>

            <div style={{ background: '#07090E', padding: 12, borderRadius: 6, border: '1px solid #1E293B', minWidth: 120 }}>
              <div style={{ fontSize: 11, color: '#64748B' }}>PULLBACK DEPTH</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 2 }}>
                {et.pullback_depth_atr.toFixed(2)} ATR
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                {et.pullback_depth_atr < 0.5 ? 'Shallow / Retest' : et.pullback_depth_atr <= 1.5 ? 'Optimal Pullback' : 'Deep Correction'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown & Scoring Model */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        <div className="t2o-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 14 }}>
            SCORE FACTOR BREAKDOWN (DOCUMENTED WEIGHTS)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(et.factor_breakdown).map(([factor, pts]) => {
              const maxPts = factor.includes('alignment') ? 25 : factor.includes('penalty') ? 0 : 20;
              const isPenalty = pts < 0;
              return (
                <div key={factor} style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, textTransform: 'capitalize', color: '#E2E8F0', fontWeight: 500 }}>
                      {factor.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono', color: isPenalty ? '#F43F5E' : '#10B981' }}>
                      {pts > 0 ? '+' : ''}{pts.toFixed(1)} {maxPts > 0 ? `/ ${maxPts} pts` : 'pts'}
                    </span>
                  </div>
                  {maxPts > 0 && (
                    <div style={{ width: '100%', height: 4, background: '#1E293B', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, (pts / maxPts) * 100))}%`,
                          height: '100%',
                          background: isPenalty ? '#F43F5E' : '#38BDF8',
                          borderRadius: 2
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
        <div className="t2o-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 14 }}>
            LAYER COMPARISON: LAYER A vs LAYER B
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div style={{ padding: 10, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: 4 }}>Layer A (Primary Trend)</div>
              <div style={{ color: '#94A3B8', lineHeight: 1.5 }}>
                Monitors EMA 20 (${pt.ema20.toLocaleString()}), EMA 50 (${pt.ema50.toLocaleString()}), and EMA 200 (${pt.ema200.toLocaleString()}).
                Status: <b style={{ color: '#F8FAFC' }}>{pt.trend_description}</b>.
              </div>
            </div>

            <div style={{ padding: 10, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontWeight: 700, color: '#FBBF24', marginBottom: 4 }}>Layer B (Advisory Entry Timing)</div>
              <div style={{ color: '#94A3B8', lineHeight: 1.5 }}>
                Monitors EMA 9 (${et.ema9.toLocaleString()}) and EMA 21 (${et.ema21.toLocaleString()}).
                Current Spread: EMA9 is <b>{et.ema9 >= et.ema21 ? 'above' : 'below'}</b> EMA21 by {Math.abs(et.ema9 - et.ema21).toFixed(1)} USD.
              </div>
            </div>

            <div style={{ padding: 10, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontWeight: 700, color: '#10B981', marginBottom: 4 }}>Ablation & Independence Rule</div>
              <div style={{ color: '#94A3B8', lineHeight: 1.5 }}>
                The EA executes based strictly on the approved Primary Trend framework. Testing the advisory layer's incremental value is conducted safely in the Backtest Lab before any EA parameter changes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
