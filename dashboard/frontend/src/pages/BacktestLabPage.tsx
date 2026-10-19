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
      <div className="t2o-card" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        Running Reproducible Backtest Experiments (Chronological In-Sample & Out-of-Sample)...
      </div>
    );
  }

  if (!results) {
    return (
      <div className="t2o-card" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        DATA UNAVAILABLE — No Backtest Results Found.
      </div>
    );
  }

  const currentResult = results[selectedStrategy];
  const m = currentResult?.out_of_sample_metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Strategy Comparison Matrix */}
      <div className="t2o-card" style={{ padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 14 }}>
          STRATEGY EXPERIMENTATION MATRIX (OUT-OF-SAMPLE TEST VALIDATION)
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', fontFamily: 'JetBrains Mono' }}>
            <thead>
              <tr style={{ color: '#64748B', borderBottom: '1px solid #1E293B' }}>
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
                      borderBottom: '1px solid #131A2B',
                      background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#F8FAFC' }}>
                      {res.strategy_name}
                      {name === 'Candidate_A' && (
                        <span className="t2o-badge badge-bullish" style={{ marginLeft: 8, fontSize: 9 }}>RECOMMENDED</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: om.net_profit_usd >= 0 ? '#10B981' : '#F43F5E' }}>
                      ${om.net_profit_usd.toFixed(2)} ({om.net_return_pct >= 0 ? '+' : ''}{om.net_return_pct.toFixed(1)}%)
                    </td>
                    <td style={{ padding: '10px 12px', color: '#F8FAFC' }}>{om.win_rate_pct.toFixed(1)}%</td>
                    <td style={{ padding: '10px 12px', color: om.profit_factor >= 1.5 ? '#10B981' : '#F8FAFC' }}>
                      {om.profit_factor.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#38BDF8' }}>{om.sharpe_ratio.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', color: '#F43F5E' }}>${om.max_drawdown_usd.toFixed(2)} ({om.max_drawdown_pct.toFixed(1)}%)</td>
                    <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{om.total_trades}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          border: 'none',
                          background: isSelected ? '#38BDF8' : '#1E293B',
                          color: isSelected ? '#07090E' : '#F8FAFC',
                          cursor: 'pointer'
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
          {/* Equity & Metrics Summary */}
          <div className="t2o-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8' }}>
                DETAILED METRICS: {currentResult.strategy_name}
              </div>
              <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'JetBrains Mono' }}>
                HASH: {currentResult.reproducible_hash}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 11, color: '#64748B' }}>Expectancy Per Trade</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: m.expectancy_usd >= 0 ? '#10B981' : '#F43F5E', marginTop: 2 }}>
                  ${m.expectancy_usd.toFixed(2)}
                </div>
              </div>

              <div style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 11, color: '#64748B' }}>Win / Loss Ratio</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 2 }}>
                  {m.winning_trades}W / {m.losing_trades}L
                </div>
              </div>

              <div style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 11, color: '#64748B' }}>Avg Win vs Avg Loss</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 2 }}>
                  +${m.avg_win_usd.toFixed(1)} / -${m.avg_loss_usd.toFixed(1)}
                </div>
              </div>

              <div style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 11, color: '#64748B' }}>Fees & Slippage Paid</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F59E0B', marginTop: 2 }}>
                  ${m.total_fees_slippage_usd.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Assumptions Box */}
            <div style={{ padding: 10, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B', fontSize: 11, color: '#94A3B8' }}>
              <div style={{ fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>Institutional Friction Assumptions:</div>
              <div>• Initial Capital: ${currentResult.assumptions.initial_balance_usd?.toLocaleString()}</div>
              <div>• Position Sizing: {currentResult.assumptions.fixed_lot_btc} BTC per entry</div>
              <div>• Fixed Spread: ${currentResult.assumptions.spread_usd}/BTC | Slippage: ${currentResult.assumptions.slippage_usd}/BTC</div>
              <div>• Commission: {(currentResult.assumptions.commission_pct * 100).toFixed(2)}% per roundturn</div>
            </div>
          </div>

          {/* Performance By Regime */}
          <div className="t2o-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', letterSpacing: 0.5, borderBottom: '1px solid #1E293B', paddingBottom: 8, marginBottom: 12 }}>
              PERFORMANCE BREAKDOWN BY MARKET REGIME
            </div>

            {Object.keys(m.regime_breakdown || {}).length === 0 ? (
              <div style={{ color: '#64748B', fontSize: 12, fontStyle: 'italic', padding: 12 }}>
                No trades taken in out-of-sample window under active regime filters. High discipline demonstrated.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(m.regime_breakdown).map(([regName, stats]: [string, any]) => (
                  <div key={regName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: '#07090E', borderRadius: 6, border: '1px solid #1E293B', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
                    <span style={{ color: '#F8FAFC' }}>{regName.replace(/_/g, ' ')}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: '#94A3B8' }}>{stats.trades} Trades</span>
                      <span style={{ color: '#FBBF24' }}>{stats.win_rate_pct}% WR</span>
                      <span style={{ color: stats.pnl >= 0 ? '#10B981' : '#F43F5E', fontWeight: 700 }}>
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
