import React from 'react';
import { MarketRegimeSnapshot, IndicatorSnapshot } from '../types';

interface Props {
  regime: MarketRegimeSnapshot | null;
  indicators: IndicatorSnapshot | null;
}

export const MomentumRegimePage: React.FC<Props> = ({ regime, indicators }) => {
  if (!regime || !indicators) {
    return (
      <div className="t2o-card" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        DATA UNAVAILABLE — Waiting for Regime Analysis Engine...
      </div>
    );
  }

  const pt = indicators.primary_trend;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner */}
      <div className="t2o-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, letterSpacing: 0.5 }}>DETERMINISTIC REGIME ENGINE (M15 PRIMARY)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span className={`t2o-badge ${regime.regime.includes('BULLISH') ? 'badge-bullish' : regime.regime.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`} style={{ fontSize: 16, padding: '6px 14px' }}>
                {regime.regime.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 14, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                Certainty / Confidence: <b style={{ color: '#38BDF8' }}>{regime.confidence_pct}%</b>
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 8, maxWidth: 700, lineHeight: 1.5 }}>
              <b>Rationale:</b> {regime.rationale}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>DATA FRESHNESS</div>
            <div style={{ fontSize: 16, fontFamily: 'JetBrains Mono', color: '#10B981', marginTop: 2 }}>
              {regime.data_freshness_seconds.toFixed(0)}s ago (UTC)
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Closed Bar Analysis (Zero Lookahead)</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Moving Averages Hierarchy & Multi-timeframe agreement */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        {/* Primary Trend (EMA 20/50/200) */}
        <div className="t2o-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 14 }}>
            LAYER A: PRIMARY TREND INTELLIGENCE (EMA 20/50/200)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 11, color: '#64748B' }}>EMA 20</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#38BDF8', marginTop: 2 }}>
                ${pt.ema20.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: pt.ema20_slope_deg >= 0 ? '#10B981' : '#F43F5E', marginTop: 2 }}>
                Slope: {pt.ema20_slope_deg > 0 ? '+' : ''}{pt.ema20_slope_deg.toFixed(1)}°
              </div>
            </div>

            <div style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 11, color: '#64748B' }}>EMA 50</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#3B82F6', marginTop: 2 }}>
                ${pt.ema50.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: pt.ema50_slope_deg >= 0 ? '#10B981' : '#F43F5E', marginTop: 2 }}>
                Slope: {pt.ema50_slope_deg > 0 ? '+' : ''}{pt.ema50_slope_deg.toFixed(1)}°
              </div>
            </div>

            <div style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 11, color: '#64748B' }}>EMA 200 (MACRO)</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#A855F7', marginTop: 2 }}>
                ${pt.ema200.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: pt.ema200_slope_deg >= 0 ? '#10B981' : '#F43F5E', marginTop: 2 }}>
                Slope: {pt.ema200_slope_deg > 0 ? '+' : ''}{pt.ema200_slope_deg.toFixed(1)}°
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, lineHeight: 1.6, color: '#94A3B8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1E293B' }}>
              <span>Hierarchy Alignment:</span>
              <b style={{ color: pt.is_aligned_bullish ? '#10B981' : pt.is_aligned_bearish ? '#F43F5E' : '#F59E0B' }}>
                {pt.is_aligned_bullish ? 'Bullish (20 > 50 > 200)' : pt.is_aligned_bearish ? 'Bearish (20 < 50 < 200)' : 'Mixed / Consolidating'}
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1E293B' }}>
              <span>Price vs Macro EMA 200:</span>
              <b style={{ fontFamily: 'JetBrains Mono', color: pt.price_to_ema200_pct >= 0 ? '#10B981' : '#F43F5E' }}>
                {pt.price_to_ema200_pct >= 0 ? '+' : ''}{pt.price_to_ema200_pct.toFixed(2)}%
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Primary Trend Category:</span>
              <b style={{ color: '#F8FAFC' }}>{pt.trend_description}</b>
            </div>
          </div>
        </div>

        {/* Multi-Timeframe Alignment Matrix */}
        <div className="t2o-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#A855F7', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 14 }}>
            MULTI-TIMEFRAME AGREEMENT MATRIX
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B' }}>
              <div>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC' }}>M15 Execution Timeframe</span>
                <div style={{ fontSize: 11, color: '#64748B' }}>Primary Execution & Signal Bar</div>
              </div>
              <span className={`t2o-badge ${pt.trend_description.includes('BULLISH') ? 'badge-bullish' : pt.trend_description.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}>
                {pt.trend_description}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B' }}>
              <div>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC' }}>H1 Intermediate Timeframe</span>
                <div style={{ fontSize: 11, color: '#64748B' }}>Trend Directional Filter</div>
              </div>
              <span className={`t2o-badge ${regime.higher_timeframe_agreement['H1']?.includes('BULLISH') ? 'badge-bullish' : regime.higher_timeframe_agreement['H1']?.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}>
                {regime.higher_timeframe_agreement['H1'] || 'CONSISTENT'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B' }}>
              <div>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC' }}>H4 Macro Context</span>
                <div style={{ fontSize: 11, color: '#64748B' }}>Institutional Bias & Liquidity</div>
              </div>
              <span className={`t2o-badge ${regime.higher_timeframe_agreement['H4']?.includes('BULLISH') ? 'badge-bullish' : regime.higher_timeframe_agreement['H4']?.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}>
                {regime.higher_timeframe_agreement['H4'] || 'NEUTRAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Supporting & Conflicting Evidences */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        <div className="t2o-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 10 }}>
            SUPPORTING INDICATOR EVIDENCE ({regime.supporting_indicators.length})
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {regime.supporting_indicators.map((item, idx) => (
              <li key={idx} style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.4 }}>
                <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="t2o-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F43F5E', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 10 }}>
            CONFLICTING OR DIVERGENT SIGNALS ({regime.conflicting_indicators.length})
          </div>
          {regime.conflicting_indicators.length === 0 ? (
            <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', padding: 8 }}>
              No conflicting indicators detected. Strong confluence across trend indicators.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {regime.conflicting_indicators.map((item, idx) => (
                <li key={idx} style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.4 }}>
                  <span style={{ color: '#F43F5E', fontWeight: 700 }}>⚠</span>
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
