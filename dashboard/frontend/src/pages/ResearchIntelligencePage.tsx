import React, { useState, useEffect } from 'react';
import { ForecastResult, IntegrationHealth } from '../types';
import { fetchKronosForecast, fetchResearchIntegrations } from '../api';

export const ResearchIntelligencePage: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchKronosForecast(), fetchResearchIntegrations()])
      .then(([f, ints]) => {
        setForecast(f);
        setIntegrations(ints);
      })
      .catch(err => console.error('Error fetching research data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>
            INITIALIZING RESEARCH INTELLIGENCE
          </span>
        </div>
        Loading Research Adapters & Model Benchmarks...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Integrations Health Table */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="price-beacon-dot" />
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan-bright)', letterSpacing: 0.8 }}>
              RESEARCH ADAPTERS & INTEGRATION REGISTRY
            </div>
            <div className="live-equalizer">
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
            </div>
          </div>
          <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>ACTIVE MESH</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {integrations.map((item) => {
            const isConn = item.state === 'CONNECTED';
            const isNotConf = item.state === 'NOT_CONFIGURED';
            const isStale = item.state === 'STALE';

            return (
              <div key={item.name} className="exec-level-box" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{item.name.replace(/_/g, ' ')}</span>
                  <span className={`t2o-badge ${isConn ? 'badge-bullish' : isNotConf ? 'badge-warning' : isStale ? 'badge-info' : 'badge-bearish'}`}>
                    {item.state}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                  {item.message}
                </div>
                {item.endpoint && (
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                    Endpoint: {item.endpoint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Kronos Forecasting Benchmark */}
      {forecast && (
        <div className="t2o-card stagger-card stagger-2" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.8 }}>FINANCIAL TIME-SERIES FORECASTING MODEL</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <span>{forecast.model_name}</span>
                <span className="t2o-badge badge-purple">{forecast.validation_status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Last Known Spot Close: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>${forecast.last_known_close.toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div className="exec-level-box" style={{ padding: '10px 16px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>MAE vs PERSISTENCE</div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 2 }}>
                  ${forecast.mae_vs_persistence?.toFixed(2)}
                </div>
              </div>

              <div className="exec-level-box" style={{ padding: '10px 16px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>DIRECTIONAL ACCURACY</div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: (forecast.directional_accuracy_pct || 0) > 52 ? 'var(--bullish-green)' : 'var(--warning-amber)', marginTop: 2 }}>
                  {forecast.directional_accuracy_pct?.toFixed(1)}%
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>
                  {(forecast.directional_accuracy_pct || 0) < 50 ? 'Sub-random (Noise dominance)' : 'Positive edge'}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Horizon Cards */}
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan-bright)', letterSpacing: 0.8, marginBottom: 12 }}>
            MULTI-HORIZON PROBABILISTIC TARGETS (M15 HORIZONS)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {Object.entries(forecast.forecast_horizons).map(([hKey, h]) => (
              <div key={hKey} className="exec-level-box" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)' }}>
                    +{h.horizon_candles * 15} MINS ({h.horizon_candles} BARS)
                  </span>
                  <span className="t2o-badge badge-info">{h.confidence_pct}% Confidence</span>
                </div>

                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', marginTop: 8, color: h.predicted_change_pct >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)' }}>
                  ${h.predicted_close.toLocaleString()}
                  <span style={{ fontSize: 12, marginLeft: 6, fontWeight: 600 }}>
                    ({h.predicted_change_pct >= 0 ? '+' : ''}{h.predicted_change_pct.toFixed(2)}%)
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  Target UTC: <strong style={{ color: 'var(--text-main)' }}>{h.target_timestamp}</strong>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  Expected Vol: <strong style={{ color: 'var(--text-main)' }}>{h.expected_volatility_pct.toFixed(2)}%</strong>
                </div>

                <div style={{ marginTop: 10, padding: 8, background: 'rgba(0, 0, 0, 0.35)', borderRadius: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                  90% Range: ${h.interval_90_lower.toFixed(0)} - ${h.interval_90_upper.toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          {/* Research Finding Note */}
          <div style={{ marginTop: 18, padding: 14, background: 'rgba(172, 88, 233,  0.06)', borderRadius: 12, border: '1px solid rgba(172, 88, 233,  0.25)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent-cyan-bright)' }}>Institutional Quantitative Assessment:</strong> Empirical benchmarking on Bitcoin M15 shows directional accuracy hovering around 42-48% without domain-specific momentum conditioning. The forecast path is maintained as an advisory feature and is safely isolated from MT5 execution logic.
          </div>
        </div>
      )}
    </div>
  );
};
