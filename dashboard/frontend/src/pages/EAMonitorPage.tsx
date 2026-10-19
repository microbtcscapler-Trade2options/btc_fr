import React, { useState, useEffect } from 'react';
import { EAStatusResponse } from '../types';
import { fetchEAStatus, triggerSimulateEAHeartbeat } from '../api';

export const EAMonitorPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<EAStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const loadStatus = () => {
    fetchEAStatus()
      .then(res => setTelemetry(res))
      .catch(err => console.error('EA Status error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await triggerSimulateEAHeartbeat();
      loadStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="t2o-card" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        Polling MT5 Telemetry Bridge...
      </div>
    );
  }

  const status = telemetry?.status;
  const hb = status?.heartbeat;
  const risk = status?.risk;
  const positions = status?.positions || [];
  const isConn = telemetry?.is_connected && !telemetry.is_stale;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Status Bar */}
      <div className="t2o-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className={`pulse-dot ${isConn ? 'dot-green' : telemetry?.is_stale ? 'dot-amber' : 'dot-red'}`} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
                {hb ? hb.ea_name : 'Trade2Options MT5 Expert Advisor'}
              </span>
              <span className={`t2o-badge ${isConn ? 'badge-bullish' : telemetry?.is_stale ? 'badge-warning' : 'badge-bearish'}`}>
                {isConn ? 'STREAMING ACTIVE' : telemetry?.is_stale ? 'TELEMETRY STALE' : 'DISCONNECTED'}
              </span>
              {hb && (
                <span className="t2o-badge badge-info">{hb.account_mode} ENVIRONMENT</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
              {telemetry?.message}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {telemetry?.file_age_seconds !== undefined && (
            <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'JetBrains Mono' }}>
              Freshness: {telemetry.file_age_seconds.toFixed(0)}s ago
            </div>
          )}

          <button
            onClick={handleSimulate}
            disabled={simulating}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #38BDF8',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8'
            }}
          >
            {simulating ? 'Broadcasting...' : 'Simulate EA Heartbeat'}
          </button>
        </div>
      </div>

      {/* Account & Risk Utilization Cards */}
      {risk && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div className="t2o-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>ACCOUNT BALANCE</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 4 }}>
              ${risk.account_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              Equity: <b style={{ color: risk.account_equity >= risk.account_balance ? '#10B981' : '#F43F5E' }}>${risk.account_equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>FREE MARGIN</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#38BDF8', marginTop: 4 }}>
              ${risk.free_margin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              Trading Permissions: <b style={{ color: hb?.is_trading_allowed ? '#10B981' : '#F43F5E' }}>{hb?.is_trading_allowed ? 'ALLOWED' : 'LOCKED'}</b>
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>DAILY LOSS UTILIZATION</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono', color: risk.current_daily_drawdown_usd > 0 ? '#F43F5E' : '#10B981', marginTop: 4 }}>
              ${risk.current_daily_drawdown_usd.toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              Cap: ${risk.daily_loss_limit_usd.toFixed(0)} ({risk.is_daily_limit_breached ? 'BREACHED' : 'SAFE'})
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>OPEN POSITIONS / CAP</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 4 }}>
              {risk.open_positions_count} / {risk.max_allowed_positions}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              Max Lot Size: {risk.max_lot_size.toFixed(2)} BTC
            </div>
          </div>
        </div>
      )}

      {/* Live Positions Table */}
      <div className="t2o-card" style={{ padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 14 }}>
          ACTIVE POSITIONS MANAGED BY MT5 EA ({positions.length})
        </div>

        {positions.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
            No open positions currently held by EA Magic #{hb?.magic_number || 261016}.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', fontFamily: 'JetBrains Mono' }}>
              <thead>
                <tr style={{ color: '#64748B', borderBottom: '1px solid #1E293B' }}>
                  <th style={{ padding: '8px 12px' }}>TICKET</th>
                  <th style={{ padding: '8px 12px' }}>SYMBOL</th>
                  <th style={{ padding: '8px 12px' }}>DIRECTION</th>
                  <th style={{ padding: '8px 12px' }}>VOLUME</th>
                  <th style={{ padding: '8px 12px' }}>ENTRY PRICE</th>
                  <th style={{ padding: '8px 12px' }}>CURRENT PRICE</th>
                  <th style={{ padding: '8px 12px' }}>STOP LOSS</th>
                  <th style={{ padding: '8px 12px' }}>TAKE PROFIT</th>
                  <th style={{ padding: '8px 12px' }}>UNREALIZED P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.ticket} style={{ borderBottom: '1px solid #131A2B' }}>
                    <td style={{ padding: '10px 12px', color: '#94A3B8' }}>#{p.ticket}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#F8FAFC' }}>{p.symbol}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`t2o-badge ${p.direction === 'BUY' ? 'badge-bullish' : 'badge-bearish'}`}>
                        {p.direction}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{p.volume.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px' }}>${p.open_price.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}>${p.current_price.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', color: '#F43F5E' }}>${p.stop_loss.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', color: '#10B981' }}>${p.take_profit.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: p.profit_usd >= 0 ? '#10B981' : '#F43F5E' }}>
                      {p.profit_usd >= 0 ? '+' : ''}${p.profit_usd.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Last Signal & Broker Execution Environment */}
      {status && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 14 }}>
          <div className="t2o-card" style={{ padding: 14, fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: 8 }}>LAST EA SIGNAL & EXECUTION AUDIT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#94A3B8' }}>
              <div>Last Evaluated Signal: <b style={{ color: '#F8FAFC' }}>{status.last_signal}</b></div>
              <div>Last Error / Exception: <b style={{ color: status.last_error === 'None' ? '#10B981' : '#F43F5E' }}>{status.last_error}</b></div>
              <div>Telemetry Timestamp: <span style={{ fontFamily: 'JetBrains Mono' }}>{status.telemetry_updated_at}</span></div>
            </div>
          </div>

          <div className="t2o-card" style={{ padding: 14, fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: '#A855F7', marginBottom: 8 }}>BROKER & TERMINAL SPECS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#94A3B8' }}>
              <div>Server: <b style={{ color: '#F8FAFC' }}>{hb?.broker_server || 'Exness-MT5Trial8'}</b></div>
              <div>Symbol Spread: <b style={{ color: '#F8FAFC', fontFamily: 'JetBrains Mono' }}>{hb?.spread_points || 25} points</b></div>
              <div>Magic Number: <b style={{ color: '#F8FAFC', fontFamily: 'JetBrains Mono' }}>{hb?.magic_number || 261016}</b></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
