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
      <div className="t2o-card" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        Loading Data Quality & Audit Logs...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* System Integrity Overview */}
      <div className="t2o-card" style={{ padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 14 }}>
          SYSTEM ARCHITECTURE BOUNDARIES & DATA INTEGRITY
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, fontSize: 12 }}>
          <div style={{ background: '#07090E', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
            <div style={{ fontWeight: 700, color: '#10B981', marginBottom: 4 }}>Independent MT5 Execution</div>
            <div style={{ color: '#94A3B8', lineHeight: 1.4 }}>
              The MQL5 EA operates completely autonomously. A failure or shutdown of the Python backend or React dashboard does not impede MT5 order execution, stop-loss enforcement, or trailing stops.
            </div>
          </div>

          <div style={{ background: '#07090E', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
            <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: 4 }}>Zero Lookahead Bias</div>
            <div style={{ color: '#94A3B8', lineHeight: 1.4 }}>
              All technical indicators, regime filters, and strategy evaluations are executed strictly on closed bars (is_closed=True). No forming candle future values contaminate backtest results.
            </div>
          </div>

          <div style={{ background: '#07090E', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
            <div style={{ fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>Credential Protection</div>
            <div style={{ color: '#94A3B8', lineHeight: 1.4 }}>
              Telemetry payloads omit investor passwords, trading passwords, and account secrets. Monitoring is strictly read-only and cannot alter EA risk parameters.
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status Table */}
      <div className="t2o-card" style={{ padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#A855F7', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 12 }}>
          INTEGRATION ENDPOINTS STATUS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {integrations.map((item) => (
            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B', fontSize: 12 }}>
              <div>
                <span style={{ fontWeight: 700, color: '#F8FAFC' }}>{item.name.replace(/_/g, ' ')}</span>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{item.message}</div>
              </div>
              <span className={`t2o-badge ${item.state === 'CONNECTED' ? 'badge-bullish' : item.state === 'NOT_CONFIGURED' ? 'badge-warning' : 'badge-info'}`}>
                {item.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Event Trail */}
      <div className="t2o-card" style={{ padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 12 }}>
          SYSTEM AUDIT TRAIL ({logs.length} EVENTS)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 8px', background: '#07090E', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}>
              <span style={{ color: '#64748B' }}>{log.timestamp.slice(11, 19)} UTC</span>
              <span style={{ color: '#38BDF8', fontWeight: 600 }}>[{log.component}]</span>
              <span style={{ color: '#FBBF24' }}>{log.action}</span>
              <span style={{ color: '#94A3B8' }}>{log.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
