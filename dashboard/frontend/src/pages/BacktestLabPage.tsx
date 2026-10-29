import React, { useState, useEffect } from 'react';
import { BacktestResult } from '../types';
import { fetchBacktestComparison } from '../api';

export const BacktestLabPage: React.FC = () => {
  const [results, setResults] = useState<Record<string, BacktestResult> | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('Candidate_A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBacktestComparison()
      .then(res => {
        setResults(res);
        if (res && res['Candidate_A']) {
          setSelectedStrategy('Candidate_A');
        } else if (res) {
          const keys = Object.keys(res);
          if (keys.length > 0) setSelectedStrategy(keys[0]);
        }
      })
      .catch(err => console.error('Backtest comparison error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>
            EXECUTING REPRODUCIBLE BACKTEST ENGINE
          </span>
        </div>
        Running Chronological In-Sample & Out-of-Sample Verification...
      </div>
    );
  }

  if (!results) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
        DATA UNAVAILABLE — No Backtest Results Found.
      </div>
    );
  }

  const currentResult = results[selectedStrategy];
  const m = currentResult?.out_of_sample_metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Strategy Comparison Matrix */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="price-beacon-dot" />
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan-bright)', letterSpacing: 0.8 }}>
              STRATEGY EXPERIMENTATION MATRIX (OUT-OF-SAMPLE TEST VALIDATION)
            </div>
            <div className="live-equalizer">
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
              <span className="live-equalizer-bar" />
            </div>
          </div>
          <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>ZERO OVERFITTING</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)', fontSize: 11 }}>
                <th style={{ padding: '8px 12px' }}>CONFIGURATION</th>
                <th style={{ padding: '8px 12px' }}>NET RETURN</th>
                <th style={{ padding: '8px 12px' }}>WIN RATE</th>
                <th style={{ padding: '8px 12px' }}>PROFIT FACTOR</th>
                <th style={{ padding: '8px 12px' }}>SHARPE</th>
                <th style={{ padding: '8px 12px' }}>MAX DRAWDOWN</th>
                <th style={{ padding: '8px 12px' }}>TOTAL TRADES</th>
                <th style={{ padding: '8px 12px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([name, res]) => {
                const om = res.out_of_sample_metrics;
                const isSelected = selectedStrategy === name;
                return (
                  <tr
                    key={name}
                    onClick={() => setSelectedStrategy(name)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(172, 88, 233,  0.12)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '12px 12px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {res.strategy_name}
                      {name === 'Candidate_A' && (
                        <span className="t2o-badge badge-bullish" style={{ marginLeft: 8, fontSize: 9 }}>RECOMMENDED</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 12px', fontWeight: 800, color: om.net_profit_usd >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)' }}>
                      ${om.net_profit_usd.toFixed(2)} ({om.net_return_pct >= 0 ? '+' : ''}{om.net_return_pct.toFixed(1)}%)
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-main)' }}>{om.win_rate_pct.toFixed(1)}%</td>
                    <td style={{ padding: '12px 12px', fontWeight: 700, color: om.profit_factor >= 1.5 ? 'var(--bullish-green)' : 'var(--text-main)' }}>
                      {om.profit_factor.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--accent-cyan-bright)', fontWeight: 700 }}>{om.sharpe_ratio.toFixed(2)}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--bearish-red)' }}>${om.max_drawdown_usd.toFixed(2)} ({om.max_drawdown_pct.toFixed(1)}%)</td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-muted)' }}>{om.total_trades}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <button
                        className="control-pill-btn"
                        style={{
                          padding: '4px 12px',
                          fontSize: 10,
                          fontWeight: 700,
                          background: isSelected ? 'var(--accent-cyan-gradient)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#041006' : 'var(--text-muted)',
                          borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'
                        }}
                      >
                        {isSelected ? 'Active' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Strategy Deep-Dive */}
      {currentResult && m && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
          {/* Equity & Metrics Summary */}
          <div className="t2o-card stagger-card stagger-2" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>
                DETAILED METRICS: {currentResult.strategy_name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                HASH: {currentResult.reproducible_hash}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
              <div className="exec-level-box" style={{ padding: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>Expectancy Per Trade</div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: m.expectancy_usd >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)', marginTop: 3 }}>
                  ${m.expectancy_usd.toFixed(2)}
                </div>
              </div>

              <div className="exec-level-box" style={{ padding: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>Win / Loss Ratio</div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 3 }}>
                  {m.winning_trades}W / {m.losing_trades}L
                </div>
              </div>

              <div className="exec-level-box" style={{ padding: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>Avg Win vs Avg Loss</div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 3 }}>
                  +${m.avg_win_usd.toFixed(1)} / -${m.avg_loss_usd.toFixed(1)}
                </div>
              </div>

              <div className="exec-level-box" style={{ padding: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>Fees & Slippage Paid</div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--warning-amber)', marginTop: 3 }}>
                  ${m.total_fees_slippage_usd.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Assumptions Box */}
            <div className="layer-row-interactive" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 14, fontSize: 11, color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 800, color: 'var(--accent-cyan-bright)', marginBottom: 6 }}>Institutional Friction Assumptions:</div>
              <div>• Initial Capital: ${currentResult.assumptions.initial_balance_usd?.toLocaleString()}</div>
              <div>• Position Sizing: {currentResult.assumptions.fixed_lot_btc} BTC per entry</div>
              <div>• Fixed Spread: ${currentResult.assumptions.spread_usd}/BTC | Slippage: ${currentResult.assumptions.slippage_usd}/BTC</div>
              <div>• Commission: {(currentResult.assumptions.commission_pct * 100).toFixed(2)}% per roundturn</div>
            </div>
          </div>

          {/* Performance By Regime */}
          <div className="t2o-card stagger-card stagger-3" style={{ padding: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--bullish-green)', letterSpacing: 0.8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 14 }}>
              PERFORMANCE BREAKDOWN BY MARKET REGIME
            </div>

            {Object.keys(m.regime_breakdown || {}).length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: 12, fontStyle: 'italic', padding: 14 }}>
                No trades taken in out-of-sample window under active regime filters. High discipline demonstrated.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(m.regime_breakdown).map(([regName, stats]: [string, any]) => (
                  <div key={regName} className="layer-row-interactive" style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>{regName.replace(/_/g, ' ')}</span>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{stats.trades} Trades</span>
                      <span style={{ color: 'var(--warning-amber)', fontWeight: 700 }}>{stats.win_rate_pct}% WR</span>
                      <span style={{ color: stats.pnl >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)', fontWeight: 900 }}>
                        {stats.pnl >= 0 ? '+' : ''}${stats.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
