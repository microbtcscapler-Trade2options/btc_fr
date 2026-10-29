import React, { useState, useEffect } from 'react';
import { IntegrationHealth, AuditEvent } from '../types';
import { fetchResearchIntegrations, fetchAuditLogs } from '../api';

export const AuditIntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchResearchIntegrations(), fetchAuditLogs()])
      .then(([ints, l]) => {
        setIntegrations(ints);
        setLogs(l);
      })
      .catch(err => console.error('Audit page error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>
            POLLING AUDIT & INTEGRATIONS REGISTRY
          </span>
        </div>
        Loading Data Quality & Audit Logs...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* System Integrity Overview */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="price-beacon-dot" />
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan-bright)', letterSpacing: 0.8 }}>
              SYSTEM ARCHITECTURE BOUNDARIES & DATA INTEGRITY
            </div>
            <div className="live-equalizer">
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
            </div>
          </div>
          <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>COMPLIANCE CERTIFIED</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, fontSize: 12 }}>
          <div className="exec-level-box" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, color: 'var(--bullish-green)', marginBottom: 6, fontSize: 13 }}>
              🛡️ Independent MT5 Execution
            </div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The MQL5 EA operates completely autonomously. A failure or shutdown of the Python backend or React dashboard does not impede MT5 order execution, stop-loss enforcement, or trailing stops.
            </div>
          </div>

          <div className="exec-level-box" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, color: 'var(--accent-cyan-bright)', marginBottom: 6, fontSize: 13 }}>
              ⚡ Zero Lookahead Bias
            </div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              All technical indicators, regime filters, and strategy evaluations are executed strictly on closed bars (is_closed=True). No forming candle future values contaminate backtest results.
            </div>
          </div>

          <div className="exec-level-box" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, color: 'var(--warning-amber)', marginBottom: 6, fontSize: 13 }}>
              🔒 Credential Protection
            </div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Telemetry payloads omit investor passwords, trading passwords, and account secrets. Monitoring is strictly read-only and cannot alter EA risk parameters.
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status Table */}
      <div className="t2o-card stagger-card stagger-2" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#AC58E9', letterSpacing: 0.8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 14 }}>
          INTEGRATION ENDPOINTS STATUS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {integrations.map((item) => (
            <div key={item.name} className="layer-row-interactive" style={{ padding: '12px 16px', fontSize: 12 }}>
              <div>
                <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 13 }}>{item.name.replace(/_/g, ' ')}</span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.message}</div>
              </div>
              <span className={`t2o-badge ${item.state === 'CONNECTED' ? 'badge-bullish' : item.state === 'NOT_CONFIGURED' ? 'badge-warning' : 'badge-info'}`}>
                {item.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Event Trail */}
      <div className="t2o-card stagger-card stagger-3" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', letterSpacing: 0.8 }}>
            SYSTEM AUDIT TRAIL ({logs.length} EVENTS)
          </div>
          <span className="t2o-badge badge-purple" style={{ fontSize: 9 }}>REALTIME TELEMETRY</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} className="layer-row-interactive" style={{ padding: '8px 12px', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-dim)' }}>{log.timestamp.slice(11, 19)} UTC</span>
                <span style={{ color: 'var(--accent-cyan-bright)', fontWeight: 800 }}>[{log.component}]</span>
                <span style={{ color: 'var(--warning-amber)', fontWeight: 700 }}>{log.action}</span>
                <span style={{ color: 'var(--text-muted)' }}>{log.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
