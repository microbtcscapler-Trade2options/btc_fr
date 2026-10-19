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
      const [ch, col, cc, ob, of, s, prop, ml] = await Promise.all([
        fetchOptionsChain('BTCUSDT'),
        fetchProtectiveCollarPlan('BTCUSDT', 0.10),
        fetchCoveredCallPlan('BTCUSDT', 0.10),
        fetchOrderBookL2('BTCUSDT'),
        fetchOrderFlow('BTCUSDT'),
        fetchSORPlan('BTCUSD', 0.50),
        fetchPropCompliance(),
        fetchMetaLabelAssessment('BTCUSDT', 'BUY')
      ]);
      setChain(ch);
      setCollar(col);
      setCoveredCall(cc);
      setOrderBook(ob);
      setOrderFlow(of);
      setSor(s);
      setPropAccounts(prop);
      setMetaLabel(ml);
    } catch (err) {
      console.error('Failed to load institutional desk data:', err);
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
      <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>
        Initializing Institutional Options & SOR Execution Desk...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div className="t2o-card" style={{ borderLeft: '4px solid #38BDF8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>
              TRADE2OPTIONS DERIVATIVES & MULTI-VENUE EXECUTION DESK
            </span>
            <span className="t2o-badge badge-bullish">FULL POWER ACTIVE</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Deribit Options Hedging • Microstructural L2/CVD • Smart Order Routing • Prop-Firm Risk Multi-Account Desk
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>DERIBIT DVOL (30D IV)</div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#38BDF8' }}>
              {chain?.dvol_index.toFixed(1)}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>UNDERLYING SPOT</div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#10B981' }}>
              ${chain?.underlying_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Options Hedging & Yield Desks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        {/* Tail-Risk Protective Put Collar */}
        <div className="t2o-card" style={{ borderTop: '3px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#F8FAFC' }}>
              Automated Downside Protective Put (Tail-Risk Collar)
            </div>
            <span className={`t2o-badge ${collar?.status.includes('RECOMMENDED') ? 'badge-bearish' : 'badge-neutral'}`}>
              {collar?.status}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14, lineHeight: 1.5 }}>
            {collar?.rationale}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: '#07090E', padding: 12, borderRadius: 6 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>RECOMMENDED CONTRACT</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', fontFamily: 'JetBrains Mono' }}>
                {collar?.recommended_put_contract}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>PUT STRIKE / EXPIRY</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', fontFamily: 'JetBrains Mono' }}>
                ${collar?.put_strike.toLocaleString()} ({collar?.expiration_date})
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>PUT DELTA / IV</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', fontFamily: 'JetBrains Mono' }}>
                {collar?.put_delta} / {collar?.implied_volatility}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>MAX DOWNSIDE CAPPED</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', fontFamily: 'JetBrains Mono' }}>
                -{collar?.max_portfolio_loss_pct}% Max Loss (${collar?.estimated_premium_cost_usd} Outlay)
              </div>
            </div>
          </div>
        </div>

        {/* Covered Call Yield Harvesting Desk */}
        <div className="t2o-card" style={{ borderTop: '3px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#F8FAFC' }}>
              Systematic Covered Call (Theta Yield Harvesting)
            </div>
            <span className={`t2o-badge ${coveredCall?.status.includes('RECOMMENDED') ? 'badge-bullish' : 'badge-neutral'}`}>
              {coveredCall?.status}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14, lineHeight: 1.5 }}>
            {coveredCall?.rationale}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: '#07090E', padding: 12, borderRadius: 6 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>RECOMMENDED CONTRACT</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', fontFamily: 'JetBrains Mono' }}>
                {coveredCall?.recommended_call_contract}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>CALL STRIKE / EXPIRY</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', fontFamily: 'JetBrains Mono' }}>
                ${coveredCall?.call_strike.toLocaleString()} ({coveredCall?.expiration_date})
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>ESTIMATED 7D YIELD</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', fontFamily: 'JetBrains Mono' }}>
                +${coveredCall?.estimated_yield_usd} ({coveredCall?.annualized_yield_pct}% Ann.)
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>UPSIDE CUSHION</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>
                +{coveredCall?.upside_cushion_pct}% Headroom
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Microstructure Order Flow & ML Meta-Labeling */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        {/* Microstructural L2 Order Book & CVD */}
        <div className="t2o-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#F8FAFC' }}>
              Level-2 Depth & Order Flow Delta (CVD)
            </div>
            <span className={`t2o-badge ${orderFlow?.delta_divergence.includes('BULLISH') ? 'badge-bullish' : orderFlow?.delta_divergence.includes('BEARISH') ? 'badge-bearish' : 'badge-neutral'}`}>
              {orderFlow?.delta_divergence}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
            <div style={{ background: '#07090E', padding: 8, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: '#64748B' }}>L2 SPREAD</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC' }}>
                ${orderBook?.spread_usd} ({orderBook?.spread_bps} bps)
              </div>
            </div>
            <div style={{ background: '#07090E', padding: 8, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: '#64748B' }}>CUMULATIVE DELTA</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono', color: (orderFlow?.cumulative_volume_delta || 0) >= 0 ? '#10B981' : '#EF4444' }}>
                {orderFlow?.cumulative_volume_delta} BTC
              </div>
            </div>
            <div style={{ background: '#07090E', padding: 8, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: '#64748B' }}>VWAP BENCHMARK</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#38BDF8' }}>
                ${orderFlow?.vwap_price.toLocaleString()} ({orderFlow?.price_vs_vwap_pct}%)
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>
            Top 5 Bid/Ask Depth Book (Instantaneous Microstructure):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, fontFamily: 'JetBrains Mono' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: 6, borderRadius: 4 }}>
              <div style={{ color: '#10B981', fontWeight: 700, marginBottom: 4 }}>BIDS (Buyers)</div>
              {orderBook?.bids.slice(0, 4).map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', padding: '2px 0' }}>
                  <span>${b.price.toFixed(2)}</span>
                  <span>{b.size.toFixed(3)} BTC</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: 6, borderRadius: 4 }}>
              <div style={{ color: '#EF4444', fontWeight: 700, marginBottom: 4 }}>ASKS (Sellers)</div>
              {orderBook?.asks.slice(0, 4).map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', padding: '2px 0' }}>
                  <span>${a.price.toFixed(2)}</span>
                  <span>{a.size.toFixed(3)} BTC</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lopez de Prado ML Meta-Labeling & Kelly Sizing */}
        <div className="t2o-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#F8FAFC' }}>
              Lopez de Prado ML Meta-Labeling & Sizing
            </div>
            <span className={`t2o-badge ${metaLabel?.veto_trade ? 'badge-bearish' : 'badge-bullish'}`}>
              {metaLabel?.veto_trade ? 'VETO ACTIVE' : 'ENTRY APPROVED'}
            </span>
          </div>

          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}>
            {metaLabel?.meta_decision_rationale}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: '#07090E', padding: 12, borderRadius: 6 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>WIN PROBABILITY P(TP &gt; SL)</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: (metaLabel?.win_probability_pct || 0) >= 50 ? '#10B981' : '#EF4444', fontFamily: 'JetBrains Mono' }}>
                {metaLabel?.win_probability_pct}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>KELLY LOT MULTIPLIER</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>
                {metaLabel?.constrained_lot_multiplier}x Base Risk
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>TRIPLE BARRIER TAKE PROFIT</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', fontFamily: 'JetBrains Mono' }}>
                ${metaLabel?.barrier_take_profit.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B' }}>TRIPLE BARRIER STOP LOSS</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', fontFamily: 'JetBrains Mono' }}>
                ${metaLabel?.barrier_stop_loss.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Order Routing (SOR) Multi-Venue Allocation Desk */}
      <div className="t2o-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#F8FAFC' }}>
              Multi-Venue Smart Order Routing (SOR Engine)
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              {sor?.execution_rationale}
            </div>
          </div>
          <span className="t2o-badge badge-neutral">
            PRIMARY: {sor?.primary_venue}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {sor?.venues.map((v, i) => (
            <div key={i} style={{ background: '#07090E', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8' }}>{v.venue_name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>{v.allocation_pct}%</span>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                Volume: {v.allocated_volume_btc} BTC | Latency: {v.latency_ms}ms
              </div>
              <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                Est. Fees: ${v.estimated_fee_usd} | Spread: {v.estimated_spread_points} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Multi-Account Prop-Firm Compliance Desk */}

      <div className="t2o-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#F8FAFC' }}>
              Multi-Account Prop-Firm Risk Governance (MAM / PAMM Desk)
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Hard 5.0% Daily Loss Limit &amp; 10.0% Trailing Drawdown automated lockdown gates
            </div>
          </div>
          <span className="t2o-badge badge-bullish">ALL ACCOUNTS COMPLIANT</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="t2o-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Firm / Tier</th>
                <th>Starting Equity</th>
                <th>Current Equity</th>
                <th>Daily DD Used</th>
                <th>Daily Limit</th>
                <th>Safety Buffer ($)</th>
                <th>Auto-Freeze Status</th>
              </tr>
            </thead>
            <tbody>
              {propAccounts.map((acc) => (
                <tr key={acc.account_id}>
                  <td style={{ fontWeight: 600, color: '#F8FAFC' }}>{acc.account_id}</td>
                  <td>
                    <span className="t2o-badge badge-neutral">{acc.firm_name} ({acc.account_tier})</span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>${acc.initial_balance.toLocaleString()}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: '#10B981', fontWeight: 600 }}>
                    ${acc.current_equity.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: acc.daily_drawdown_pct > 2.5 ? '#EF4444' : '#F8FAFC' }}>
                    {acc.daily_drawdown_pct}%
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: '#64748B' }}>
                    {acc.max_daily_drawdown_allowed_pct}% (${acc.daily_loss_limit_usd.toLocaleString()})
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: '#10B981', fontWeight: 600 }}>
                    +${acc.drawdown_safety_cushion_usd.toLocaleString()}
                  </td>
                  <td>
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
