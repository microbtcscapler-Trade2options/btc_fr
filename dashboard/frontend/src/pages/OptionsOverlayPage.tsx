import React, { useState, useEffect } from 'react';
import {
  OptionsChainSnapshot,
  ProtectiveCollarPlan,
  CoveredCallPlan,
  OrderBookL2Snapshot,
  OrderFlowDelta,
  SmartOrderRoutePlan,
  PropFirmAccountStatus,
  MetaLabelPrediction
} from '../types';
import {
  fetchOptionsChain,
  fetchProtectiveCollarPlan,
  fetchCoveredCallPlan,
  fetchOrderBookL2,
  fetchOrderFlow,
  fetchSORPlan,
  fetchPropCompliance,
  fetchMetaLabelAssessment
} from '../api';

export const OptionsOverlayPage: React.FC = () => {
  const [chain, setChain] = useState<OptionsChainSnapshot | null>(null);
  const [collar, setCollar] = useState<ProtectiveCollarPlan | null>(null);
  const [coveredCall, setCoveredCall] = useState<CoveredCallPlan | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookL2Snapshot | null>(null);
  const [orderFlow, setOrderFlow] = useState<OrderFlowDelta | null>(null);
  const [sor, setSor] = useState<SmartOrderRoutePlan | null>(null);
  const [propAccounts, setPropAccounts] = useState<PropFirmAccountStatus[]>([]);
  const [metaLabel, setMetaLabel] = useState<MetaLabelPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [c, col, cov, ob, of, s, prop, ml] = await Promise.all([
        fetchOptionsChain('BTC'),
        fetchProtectiveCollarPlan('BTCUSDT'),
        fetchCoveredCallPlan('BTCUSDT'),
        fetchOrderBookL2('BTCUSDT'),
        fetchOrderFlow('BTCUSDT'),
        fetchSORPlan('BTCUSD', 1.5),
        fetchPropCompliance(),
        fetchMetaLabelAssessment('BTCUSDT')
      ]);

      setChain(c);
      setCollar(col);
      setCoveredCall(cov);
      setOrderBook(ob);
      setOrderFlow(of);
      setSor(s);
      setPropAccounts(prop);
      setMetaLabel(ml);
    } catch (err) {
      console.error('Error fetching Options & SOR desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && !chain) {
    return (
      <div className="t2o-card stagger-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="price-beacon-dot" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan-bright)' }}>
            INITIALIZING DERIVATIVES & SOR DESK
          </span>
        </div>
        Connecting to Deribit L2 book and Prop-Firm risk matrix...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top Banner */}
      <div className="t2o-card stagger-card stagger-1" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="price-beacon-dot" />
              <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', letterSpacing: 0.4 }}>
                TRADE2OPTIONS DERIVATIVES & MULTI-VENUE EXECUTION DESK
              </span>
              <span className="t2o-badge badge-bullish">FULL POWER ACTIVE</span>
              <div className="live-equalizer">
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
                <span className="live-equalizer-bar" />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Deribit Options Hedging • Microstructural L2/CVD • Smart Order Routing • Prop-Firm Risk Multi-Account Desk
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div className="exec-level-box" style={{ padding: '8px 16px', textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>DERIBIT DVOL (30D IV)</div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)' }}>
                {chain?.dvol_index.toFixed(1)}%
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: '8px 16px', textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>UNDERLYING SPOT</div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--bullish-green)' }}>
                ${chain?.underlying_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Options Hedging & Yield Desks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        {/* Tail-Risk Protective Put Collar */}
        <div className="t2o-card stagger-card stagger-2" style={{ padding: 22, borderTop: '3px solid var(--bearish-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)' }}>
              Automated Downside Protective Put (Tail-Risk Collar)
            </div>
            <span className={`t2o-badge ${collar?.status.includes('RECOMMENDED') ? 'badge-bearish' : 'badge-neutral'}`}>
              {collar?.status}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
            {collar?.rationale}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>RECOMMENDED CONTRACT</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--bearish-red)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {collar?.recommended_put_contract}
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>PUT STRIKE / EXPIRY</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                ${collar?.put_strike.toLocaleString()} ({collar?.expiration_date})
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>PUT DELTA / IV</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {collar?.put_delta} / {collar?.implied_volatility}%
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>MAX DOWNSIDE CAPPED</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--bullish-green)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                -{collar?.max_portfolio_loss_pct}% Max Loss (${collar?.estimated_premium_cost_usd})
              </div>
            </div>
          </div>
        </div>

        {/* Covered Call Yield Harvesting Desk */}
        <div className="t2o-card stagger-card stagger-3" style={{ padding: 22, borderTop: '3px solid var(--bullish-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)' }}>
              Systematic Covered Call (Theta Yield Harvesting)
            </div>
            <span className={`t2o-badge ${coveredCall?.status.includes('RECOMMENDED') ? 'badge-bullish' : 'badge-neutral'}`}>
              {coveredCall?.status}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
            {coveredCall?.rationale}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>RECOMMENDED CONTRACT</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--bullish-green)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {coveredCall?.recommended_call_contract}
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>CALL STRIKE / EXPIRY</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                ${coveredCall?.call_strike.toLocaleString()} ({coveredCall?.expiration_date})
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>ESTIMATED 7D YIELD</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--bullish-green)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                +${coveredCall?.estimated_yield_usd} ({coveredCall?.annualized_yield_pct}% Ann.)
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>UPSIDE CUSHION</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                +{coveredCall?.upside_cushion_pct}% Headroom
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Microstructure Order Flow & ML Meta-Labeling */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        {/* Microstructural L2 Order Book & CVD */}
        <div className="t2o-card stagger-card stagger-3" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)' }}>
              Level-2 Depth & Order Flow Delta (CVD)
            </div>
            <span className={`t2o-badge ${orderFlow?.delta_divergence.includes('BULLISH') ? 'badge-bullish' : orderFlow?.delta_divergence.includes('BEARISH') ? 'badge-bearish' : 'badge-neutral'}`}>
              {orderFlow?.delta_divergence}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>L2 SPREAD</div>
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: 2 }}>
                ${orderBook?.spread_usd} ({orderBook?.spread_bps} bps)
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>CUMULATIVE DELTA</div>
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: (orderFlow?.cumulative_volume_delta || 0) >= 0 ? 'var(--bullish-green)' : 'var(--bearish-red)', marginTop: 2 }}>
                {orderFlow?.cumulative_volume_delta} BTC
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>VWAP BENCHMARK</div>
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan-bright)', marginTop: 2 }}>
                ${orderFlow?.vwap_price.toLocaleString()} ({orderFlow?.price_vs_vwap_pct}%)
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 700 }}>
            Top 5 Bid/Ask Depth Book (Instantaneous Microstructure):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <div style={{ background: 'rgba(172, 88, 233,  0.05)', padding: 10, borderRadius: 8, border: '1px solid rgba(172, 88, 233,  0.15)' }}>
              <div style={{ color: 'var(--bullish-green)', fontWeight: 800, marginBottom: 6 }}>BIDS (Buyers)</div>
              {orderBook?.bids.slice(0, 4).map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', padding: '3px 0' }}>
                  <span>${b.price.toFixed(2)}</span>
                  <span>{b.size.toFixed(3)} BTC</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(121, 40, 202, 0.05)', padding: 10, borderRadius: 8, border: '1px solid rgba(121, 40, 202, 0.15)' }}>
              <div style={{ color: 'var(--bearish-red)', fontWeight: 800, marginBottom: 6 }}>ASKS (Sellers)</div>
              {orderBook?.asks.slice(0, 4).map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', padding: '3px 0' }}>
                  <span>${a.price.toFixed(2)}</span>
                  <span>{a.size.toFixed(3)} BTC</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lopez de Prado ML Meta-Labeling & Kelly Sizing */}
        <div className="t2o-card stagger-card stagger-4" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)' }}>
              Lopez de Prado ML Meta-Labeling & Sizing
            </div>
            <span className={`t2o-badge ${metaLabel?.veto_trade ? 'badge-bearish' : 'badge-bullish'}`}>
              {metaLabel?.veto_trade ? 'VETO ACTIVE' : 'ENTRY APPROVED'}
            </span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
            {metaLabel?.meta_decision_rationale}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>WIN PROBABILITY P(TP &gt; SL)</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: (metaLabel?.win_probability_pct || 0) >= 50 ? 'var(--bullish-green)' : 'var(--bearish-red)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {metaLabel?.win_probability_pct}%
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>KELLY LOT MULTIPLIER</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-cyan-bright)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {metaLabel?.constrained_lot_multiplier}x Base Risk
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>TRIPLE BARRIER TAKE PROFIT</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--bullish-green)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                ${metaLabel?.barrier_take_profit.toLocaleString()}
              </div>
            </div>
            <div className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>TRIPLE BARRIER STOP LOSS</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--bearish-red)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                ${metaLabel?.barrier_stop_loss.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Order Routing (SOR) Multi-Venue Allocation Desk */}
      <div className="t2o-card stagger-card stagger-3" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>
              Multi-Venue Smart Order Routing (SOR Engine)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {sor?.execution_rationale}
            </div>
          </div>
          <span className="t2o-badge badge-info">
            PRIMARY: {sor?.primary_venue}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {sor?.venues.map((v, i) => (
            <div key={i} className="exec-level-box" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-cyan-bright)' }}>{v.venue_name}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--bullish-green)' }}>{v.allocation_pct}%</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Volume: {v.allocated_volume_btc} BTC | Latency: {v.latency_ms}ms
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                Est. Fees: ${v.estimated_fee_usd} | Spread: {v.estimated_spread_points} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Multi-Account Prop-Firm Compliance Desk */}
      <div className="t2o-card stagger-card stagger-4" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>
              Multi-Account Prop-Firm Risk Governance (MAM / PAMM Desk)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Hard 5.0% Daily Loss Limit &amp; 10.0% Trailing Drawdown automated lockdown gates
            </div>
          </div>
          <span className="t2o-badge badge-bullish">ALL ACCOUNTS COMPLIANT</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="t2o-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', fontSize: 11, color: 'var(--text-dim)' }}>
                <th style={{ padding: '8px 12px' }}>Account ID</th>
                <th style={{ padding: '8px 12px' }}>Firm / Tier</th>
                <th style={{ padding: '8px 12px' }}>Starting Equity</th>
                <th style={{ padding: '8px 12px' }}>Current Equity</th>
                <th style={{ padding: '8px 12px' }}>Daily DD Used</th>
                <th style={{ padding: '8px 12px' }}>Daily Limit</th>
                <th style={{ padding: '8px 12px' }}>Safety Buffer ($)</th>
                <th style={{ padding: '8px 12px' }}>Auto-Freeze Status</th>
              </tr>
            </thead>
            <tbody>
              {propAccounts.map((acc) => (
                <tr key={acc.account_id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: 12 }}>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--text-main)' }}>{acc.account_id}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="t2o-badge badge-info">{acc.firm_name} ({acc.account_tier})</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>${acc.initial_balance.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--bullish-green)', fontWeight: 800 }}>
                    ${acc.current_equity.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: acc.daily_drawdown_pct > 2.5 ? 'var(--bearish-red)' : 'var(--text-main)' }}>
                    {acc.daily_drawdown_pct}%
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    {acc.max_daily_drawdown_allowed_pct}% (${acc.daily_loss_limit_usd.toLocaleString()})
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--bullish-green)', fontWeight: 700 }}>
                    +${acc.drawdown_safety_cushion_usd.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`t2o-badge ${acc.is_trading_frozen ? 'badge-bearish' : 'badge-bullish'}`}>
                      {acc.is_trading_frozen ? 'EMERGENCY FROZEN' : 'ACTIVE / CLEAR'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
