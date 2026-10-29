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
      <div className="t2o-card stagger-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>
            POLLING MT5 TELEMETRY BRIDGE
          </span>
        </div>
        Verifying IPC pipe with Standalone EA Magic 261016...
      </div>
    );
  }

  const status = telemetry?.status;
  const hb = status?.heartbeat;
  const risk = status?.risk;
  const positions = status?.positions || [];
  const isConn = telemetry?.is_connected && !telemetry.is_stale;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top Status Bar */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className={`pulse-dot ${isConn ? 'dot-green' : telemetry?.is_stale ? 'dot-amber' : 'dot-red'}`} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)' }}>
                {hb ? hb.ea_name : 'Trade2Options MT5 Expert Advisor'}
              </span>
              <span className={`t2o-badge ${isConn ? 'badge-bullish' : telemetry?.is_stale ? 'badge-warning' : 'badge-bearish'}`}>
                {isConn ? 'STREAMING ACTIVE' : telemetry?.is_stale ? 'TELEMETRY STALE' : 'DISCONNECTED'}
              </span>
              {hb && (
                <span className="t2o-badge badge-info">{hb.account_mode} ENVIRONMENT</span>
              )}
              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {telemetry?.message}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {telemetry?.file_age_seconds !== undefined && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Freshness: <strong style={{ color: 'var(--accent-cyan-bright)' }}>{telemetry.file_age_seconds.toFixed(0)}s ago</strong>
            </div>
          )}

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="control-pill-btn shimmer-sweep"
            style={{
              padding: '7px 18px',
              borderRadius: 'var(--pill-radius)',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              border: '1px solid rgba(172, 88, 233,  0.4)',
              background: 'linear-gradient(135deg, rgba(172, 88, 233,  0.18) 0%, rgba(9, 19, 25, 0.8) 100%)',
              color: 'var(--text-main)',
              boxShadow: '0 0 16px rgba(172, 88, 233,  0.2)'
            }}
          >
            {simulating ? 'Broadcasting...' : 'Simulate EA Heartbeat'}
          </button>
        </div>
      </div>

      {/* Account & Risk Utilization Cards */}
      {risk && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div className="exec-level-box" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>ACCOUNT BALANCE</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 4 }}>
              ${risk.account_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Equity: <b style={{ color: risk.account_equity >= risk.account_balance ? 'var(--bullish-green)' : 'var(--bearish-red)' }}>${risk.account_equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>
            </div>
          </div>

          <div className="exec-level-box" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>FREE MARGIN</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)', marginTop: 4 }}>
              ${risk.free_margin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Permissions: <b style={{ color: hb?.is_trading_allowed ? 'var(--bullish-green)' : 'var(--bearish-red)' }}>{hb?.is_trading_allowed ? 'ALLOWED' : 'LOCKED'}</b>
            </div>
          </div>

          <div className="exec-level-box" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>DAILY LOSS UTILIZATION</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: risk.current_daily_drawdown_usd > 0 ? 'var(--bearish-red)' : 'var(--bullish-green)', marginTop: 4 }}>
              ${risk.current_daily_drawdown_usd.toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Cap: ${risk.daily_loss_limit_usd.toFixed(0)} ({risk.is_daily_limit_breached ? 'BREACHED' : 'SAFE'})
            </div>
          </div>

          <div className="exec-level-box" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>OPEN POSITIONS / CAP</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 4 }}>
              {risk.open_positions_count} / {risk.max_allowed_positions}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Max Lot Size: {risk.max_lot_size.toFixed(2)} BTC
            </div>
          </div>
        </div>
      )}

      {/* Live Positions Table */}
      <div className="t2o-card stagger-card stagger-2" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-cyan-bright)', letterSpacing: 0.8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
          ACTIVE POSITIONS MANAGED BY MT5 EA ({positions.length})
        </div>

        {positions.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            No open positions currently held by EA Magic #{hb?.magic_number || 261016}. Zero exposure.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)', fontSize: 11 }}>
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
                  <tr key={p.ticket} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'all 0.2s ease' }}>
                    <td style={{ padding: '12px 12px', color: 'var(--text-muted)' }}>#{p.ticket}</td>
                    <td style={{ padding: '12px 12px', fontWeight: 800, color: 'var(--text-main)' }}>{p.symbol}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span className={`t2o-badge ${p.direction === 'BUY' ? 'badge-bullish' : 'badge-bearish'}`}>
                        {p.direction}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-main)' }}>{p.volume.toFixed(2)}</td>
                    <td style={{ padding: '12px 12px' }}>${p.open_price.toLocaleString()}</td>
                    <td style={{ padding: '12px 12px' }}>${p.current_price.toLocaleString()}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--bearish-red)' }}>${p.stop_loss.toLocaleString()}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--bullish-green)' }}>${p.take_profit.toLocaleString()}</td>
                    <td style={{ padding: '12px 12px', fontWeight: 900, color: p.profit_usd >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 18 }}>
          <div className="t2o-card stagger-card stagger-3" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, color: 'var(--accent-cyan-bright)', marginBottom: 12, fontSize: 13, letterSpacing: 0.6 }}>
              LAST EA SIGNAL & EXECUTION AUDIT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
              <div className="layer-row-interactive" style={{ padding: '8px 12px' }}>
                <span>Last Evaluated Signal:</span>
                <strong style={{ color: 'var(--text-main)' }}>{status.last_signal}</strong>
              </div>
              <div className="layer-row-interactive" style={{ padding: '8px 12px' }}>
                <span>Last Error / Exception:</span>
                <strong style={{ color: status.last_error === 'None' ? 'var(--bullish-green)' : 'var(--bearish-red)' }}>{status.last_error}</strong>
              </div>
              <div className="layer-row-interactive" style={{ padding: '8px 12px' }}>
                <span>Telemetry Timestamp:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{status.telemetry_updated_at}</span>
              </div>
            </div>
          </div>

          <div className="t2o-card stagger-card stagger-4" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, color: '#AC58E9', marginBottom: 12, fontSize: 13, letterSpacing: 0.6 }}>
              BROKER & TERMINAL SPECS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
              <div className="layer-row-interactive" style={{ padding: '8px 12px' }}>
                <span>Server:</span>
                <strong style={{ color: 'var(--text-main)' }}>{hb?.broker_server || 'Exness-MT5Trial8'}</strong>
              </div>
              <div className="layer-row-interactive" style={{ padding: '8px 12px' }}>
                <span>Symbol Spread:</span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{hb?.spread_points || 25} points</strong>
              </div>
              <div className="layer-row-interactive" style={{ padding: '8px 12px' }}>
                <span>Magic Number:</span>
                <strong style={{ color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)' }}>{hb?.magic_number || 261016}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
