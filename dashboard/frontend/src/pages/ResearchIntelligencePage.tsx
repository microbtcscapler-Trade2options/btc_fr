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
      <div className="t2o-card" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        Loading Research Intelligence & Model Benchmarks...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Integrations Health Table */}
      <div className="t2o-card" style={{ padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 14 }}>
          RESEARCH ADAPTERS & INTEGRATION REGISTRY
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {integrations.map((item) => {
            const isConn = item.state === 'CONNECTED';
            const isNotConf = item.state === 'NOT_CONFIGURED';
            const isStale = item.state === 'STALE';

            return (
              <div key={item.name} style={{ background: '#07090E', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{item.name.replace(/_/g, ' ')}</span>
                  <span className={`t2o-badge ${isConn ? 'badge-bullish' : isNotConf ? 'badge-warning' : isStale ? 'badge-info' : 'badge-bearish'}`}>
                    {item.state}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, lineHeight: 1.4 }}>
                  {item.message}
                </div>
                {item.endpoint && (
                  <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
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
        <div className="t2o-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #1E293B', paddingBottom: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>FINANCIAL TIME-SERIES FORECASTING MODEL</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                <span>{forecast.model_name}</span>
                <span className="t2o-badge badge-purple">{forecast.validation_status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                Last Known Spot Close: <b style={{ color: '#F8FAFC', fontFamily: 'JetBrains Mono' }}>${forecast.last_known_close.toLocaleString()}</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ background: '#07090E', padding: '8px 14px', borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 10, color: '#64748B' }}>MAE vs PERSISTENCE</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 2 }}>
                  ${forecast.mae_vs_persistence?.toFixed(2)}
                </div>
              </div>

              <div style={{ background: '#07090E', padding: '8px 14px', borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 10, color: '#64748B' }}>DIRECTIONAL ACCURACY</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: (forecast.directional_accuracy_pct || 0) > 52 ? '#10B981' : '#F59E0B', marginTop: 2 }}>
                  {forecast.directional_accuracy_pct?.toFixed(1)}%
                </div>
                <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>
                  {(forecast.directional_accuracy_pct || 0) < 50 ? 'Sub-random (Noise dominance)' : 'Positive edge'}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Horizon Cards */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8', marginBottom: 10 }}>
            MULTI-HORIZON PROBABILISTIC TARGETS (M15 HORIZONS)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {Object.entries(forecast.forecast_horizons).map(([hKey, h]) => (
              <div key={hKey} style={{ background: '#07090E', padding: 14, borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>
                    +{h.horizon_candles * 15} MINS ({h.horizon_candles} BARS)
                  </span>
                  <span className="t2o-badge badge-info">{h.confidence_pct}% Confidence</span>
                </div>

                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono', marginTop: 8, color: h.predicted_change_pct >= 0 ? '#10B981' : '#F43F5E' }}>
                  ${h.predicted_close.toLocaleString()}
                  <span style={{ fontSize: 12, marginLeft: 6, fontWeight: 500 }}>
                    ({h.predicted_change_pct >= 0 ? '+' : ''}{h.predicted_change_pct.toFixed(2)}%)
                  </span>
                </div>

                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                  Target UTC: <span style={{ color: '#F8FAFC' }}>{h.target_timestamp}</span>
                </div>

                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  Expected Vol: <span style={{ color: '#F8FAFC' }}>{h.expected_volatility_pct.toFixed(2)}%</span>
                </div>

                <div style={{ marginTop: 8, padding: 6, background: '#131A2B', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono', color: '#94A3B8' }}>
                  90% Range: ${h.interval_90_lower.toFixed(0)} - ${h.interval_90_upper.toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          {/* Research Finding Note */}
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(56, 189, 248, 0.08)', borderRadius: 6, border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
            <b style={{ color: '#38BDF8' }}>Institutional Quantitative Assessment:</b> Empirical benchmarking on Bitcoin M15 shows directional accuracy hovering around 42-48% without domain-specific momentum conditioning. The forecast path is maintained as an advisory feature and is safely isolated from MT5 execution logic.
          </div>
        </div>
      )}
    </div>
  );
};
