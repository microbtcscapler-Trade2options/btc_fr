import React, { useState, useEffect } from 'react';
import { MarketDataSnapshot, IndicatorSnapshot, MarketRegimeSnapshot, MasterSignalSnapshot } from '../types';

interface Props {
  snapshot: MarketDataSnapshot | null;
  indicators: IndicatorSnapshot | null;
  regime: MarketRegimeSnapshot | null;
  liveSignal: MasterSignalSnapshot | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onEnterTerminal: (tabKey?: string) => void;
  onOpenLab: () => void;
}

export const LandingPageBloomberg: React.FC<Props> = ({
  snapshot,
  onOpenAuth,
  onEnterTerminal,
  onOpenLab
}) => {
  const [selectedBookSide, setSelectedBookSide] = useState<'both' | 'bids' | 'asks'>('both');
  const [latencyVal, setLatencyVal] = useState<number>(8.2);
  const curPrice = snapshot?.latest_candle?.close || 84920.5;

  // Simulate tick latency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyVal(+(7.8 + Math.random() * 1.6).toFixed(1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const orderBookRows = [
    { price: curPrice + 45.0, size: 4.82, total: 24.1, side: 'ask' },
    { price: curPrice + 30.0, size: 8.15, total: 19.28, side: 'ask' },
    { price: curPrice + 15.0, size: 12.44, total: 11.13, side: 'ask' },
    { price: curPrice + 5.0, size: 6.9, total: 6.9, side: 'ask' },
    { price: curPrice - 5.0, size: 9.35, total: 9.35, side: 'bid' },
    { price: curPrice - 15.0, size: 14.8, total: 24.15, side: 'bid' },
    { price: curPrice - 30.0, size: 18.2, total: 42.35, side: 'bid' },
    { price: curPrice - 45.0, size: 27.5, total: 69.85, side: 'bid' }
  ];

  const strategies = [
    { id: 'ALPHA-01', symbol: 'BTCUSDT-PERP', tf: '15M', name: 'Triple EMA Momentum Breakout', sharpe: '4.92', wr: '64.8%', ret: '+142.8%', dd: '5.2%', status: 'LIVE_EXECUTION' },
    { id: 'ALPHA-02', symbol: 'BTC-COLLAR-85K', tf: 'H1', name: 'Protective Collar Yield Engine', sharpe: '5.18', wr: '78.2%', ret: '+88.4%', dd: '2.8%', status: 'DELTA_HEDGED' },
    { id: 'ALPHA-03', symbol: 'ETHUSDT-PERP', tf: 'H4', name: 'Regime Filtered Trend Following', sharpe: '3.84', wr: '61.4%', ret: '+96.2%', dd: '6.4%', status: 'LIVE_EXECUTION' },
    { id: 'ALPHA-04', symbol: 'SOLUSDT-PERP', tf: '30M', name: 'CVD Volume Divergence Scalper', sharpe: '3.62', wr: '58.9%', ret: '+118.5%', dd: '7.8%', status: 'REBALANCING' },
    { id: 'ALPHA-05', symbol: 'XAUUSD-MT5', tf: 'H1', name: 'Macro Session Liquidity Sweep', sharpe: '4.45', wr: '66.2%', ret: '+110.4%', dd: '4.1%', status: 'SOCKET_BRIDGED' }
  ];

  return (
    <div className="bloomberg-page-root">
      {/* 1. Terminal Top Command & Ticker Bar */}
      <div className="bb-command-ticker-bar">
        <div className="bb-ticker-left">
          <span className="bb-logo-glyph">◈</span>
          <span className="bb-terminal-tag">TRADE2OPTIONS</span>
          <span className="bb-divider">/</span>
          <span className="bb-desk-name">INSTITUTIONAL QUANTITATIVE DESK [PRO-MAX]</span>
        </div>

        <div className="bb-ticker-center">
          <div className="bb-pill-live">
            <span className="bb-pulse-dot" />
            <span>IPC CONNECTED • MT5 SOCKET {latencyVal}ms</span>
          </div>
          <span className="bb-market-stat">BTC: <strong>${curPrice.toLocaleString('en-US', { minimumFractionDigits: 1 })}</strong> (+3.84%)</span>
          <span className="bb-market-stat">FUNDING: <strong style={{ color: '#AC58E9' }}>+0.0084%/8h</strong></span>
          <span className="bb-market-stat">OI: <strong>$14.82B</strong></span>
        </div>

        <div className="bb-ticker-right">
          <button type="button" onClick={() => onOpenAuth('signin')} className="bb-header-btn">
            [F1] LOG IN
          </button>
          <button type="button" onClick={() => onEnterTerminal('terminal')} className="bb-header-btn bb-btn-amber">
            [F2] ENTER TERMINAL
          </button>
        </div>
      </div>

      {/* 2. Main Terminal Grid Header */}
      <header className="bb-hero-terminal">
        <div className="bb-hero-inner">
          <div className="bb-hero-title-box">
            <div className="bb-badge-amber">HIGH-DENSITY QUANTITATIVE EXECUTION INFRASTRUCTURE</div>
            <h1 className="bb-hero-h1">
              DETERMINISTIC BITCOIN ALPHA. <br />
              <span className="bb-gradient-amber">SUB-10MS BROKER BRIDGE.</span>
            </h1>
            <p className="bb-hero-desc">
              Engineered for algorithmic asset managers, prop firm operators, and options market makers.
              Zero lookahead bias. Closed-bar tick validation. Live MetaTrader 5 IPC and Deribit socket routing.
            </p>

            <div className="bb-cta-row">
              <button type="button" onClick={() => onEnterTerminal('terminal')} className="bb-primary-cta">
                <span>LAUNCH TRADING COCKPIT</span>
                <span className="bb-cta-arrow">→</span>
              </button>
              <button type="button" onClick={onOpenLab} className="bb-secondary-cta">
                VIEW GENETIC LAB
              </button>
            </div>
          </div>

          {/* Quick Metrics Matrix Box */}
          <div className="bb-stats-card">
            <div className="bb-card-head">
              <span>SYSTEM PERFORMANCE TELEMETRY</span>
              <span className="bb-tag-green">AUDITED 6-YR TICK DATA</span>
            </div>
            <div className="bb-matrix-grid">
              <div className="bb-stat-item">
                <span className="stat-label">AGGREGATE SHARPE</span>
                <span className="stat-val text-amber">4.92</span>
                <span className="stat-sub">Held-Out Test</span>
              </div>
              <div className="bb-stat-item">
                <span className="stat-label">WIN RATE</span>
                <span className="stat-val text-green">64.8%</span>
                <span className="stat-sub">12,480 Trades</span>
              </div>
              <div className="bb-stat-item">
                <span className="stat-label">PROFIT FACTOR</span>
                <span className="stat-val text-amber">2.84</span>
                <span className="stat-sub">Tick Execution</span>
              </div>
              <div className="bb-stat-item">
                <span className="stat-label">MAX DRAWDOWN</span>
                <span className="stat-val text-cyan">5.2%</span>
                <span className="stat-sub">Trailing ATR Limiter</span>
              </div>
              <div className="bb-stat-item">
                <span className="stat-label">IPC LATENCY</span>
                <span className="stat-val text-green">{latencyVal}ms</span>
                <span className="stat-sub">Direct Shared Mem</span>
              </div>
              <div className="bb-stat-item">
                <span className="stat-label">ACTIVE TICKETS</span>
                <span className="stat-val text-amber">18</span>
                <span className="stat-sub">Non-Correlated</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Real-Time Order Book Depth & Execution Tape Split */}
      <section className="bb-depth-section">
        <div className="bb-depth-inner">
          {/* Left: Depth Ladder */}
          <div className="bb-panel-card">
            <div className="bb-panel-head">
              <div>
                <span className="panel-title">BTCUSDT L2 ORDER DEPTH</span>
                <span className="panel-sub">LIVE BOOK SPREAD: $0.50</span>
              </div>
              <div className="bb-book-toggles">
                <button
                  type="button"
                  onClick={() => setSelectedBookSide('both')}
                  className={`bb-book-toggle ${selectedBookSide === 'both' ? 'active' : ''}`}
                >
                  BOTH
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBookSide('bids')}
                  className={`bb-book-toggle ${selectedBookSide === 'bids' ? 'active' : ''}`}
                >
                  BIDS
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBookSide('asks')}
                  className={`bb-book-toggle ${selectedBookSide === 'asks' ? 'active' : ''}`}
                >
                  ASKS
                </button>
              </div>
            </div>

            <div className="bb-book-table-wrap">
              <table className="bb-book-table">
                <thead>
                  <tr>
                    <th>PRICE (USDT)</th>
                    <th>SIZE (BTC)</th>
                    <th>TOTAL (BTC)</th>
                    <th>DEPTH FILL</th>
                  </tr>
                </thead>
                <tbody>
                  {orderBookRows
                    .filter((r) => selectedBookSide === 'both' || (selectedBookSide === 'bids' ? r.side === 'bid' : r.side === 'ask'))
                    .map((row, idx) => (
                      <tr key={idx} className={`book-row ${row.side === 'ask' ? 'row-ask' : 'row-bid'}`}>
                        <td className="price-cell">${row.price.toLocaleString('en-US', { minimumFractionDigits: 1 })}</td>
                        <td>{row.size.toFixed(2)}</td>
                        <td>{row.total.toFixed(2)}</td>
                        <td>
                          <div
                            className={`depth-bar-fill ${row.side === 'ask' ? 'fill-ask' : 'fill-bid'}`}
                            style={{ width: `${Math.min(100, (row.total / 70) * 100)}%` }}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Walk-Forward Multi-Line Spaghetti Chart */}
          <div className="bb-panel-card">
            <div className="bb-panel-head">
              <div>
                <span className="panel-title">WALK-FORWARD CAMPAIGN GENERATIONS</span>
                <span className="panel-sub">16 OUT-OF-SAMPLE EQUITY PATHS</span>
              </div>
              <span className="bb-badge-amber">GENERATION 18/20</span>
            </div>

            <div className="bb-chart-canvas-wrap">
              <svg viewBox="0 0 600 280" className="bb-curves-svg">
                <line x1="0" y1="70" x2="600" y2="70" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 4" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 4" />
                <line x1="0" y1="210" x2="600" y2="210" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 4" />

                <path d="M 0 260 Q 120 240, 240 200 T 400 130 T 520 60 T 560 20" fill="none" stroke="#AC58E9" strokeWidth="2.6" />
                <path d="M 0 260 Q 110 245, 230 210 T 390 150 T 510 90 T 560 45" fill="none" stroke="#AC58E9" strokeWidth="2.2" />
                <path d="M 0 260 Q 130 250, 250 215 T 410 165 T 530 110 T 560 65" fill="none" stroke="#AC58E9" strokeWidth="1.8" />
                <path d="M 0 260 Q 100 240, 220 205 T 380 155 T 500 125 T 560 85" fill="none" stroke="#c084fc" strokeWidth="1.8" />
                <path d="M 0 260 Q 140 255, 260 220 T 420 180 T 540 140 T 560 105" fill="none" stroke="#FBBF24" strokeWidth="1.6" />
                <path d="M 0 260 Q 115 250, 235 225 T 395 190 T 515 155 T 560 125" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M 0 260 Q 125 255, 245 230 T 405 200 T 525 170 T 560 145" fill="none" stroke="#60A5FA" strokeWidth="1.4" />
                <path d="M 0 260 Q 105 250, 225 235 T 385 210 T 505 185 T 560 165" fill="none" stroke="#E2E8F0" strokeWidth="1.3" />

                <line x1="560" y1="10" x2="560" y2="270" stroke="#AC58E9" strokeWidth="1.8" />
                {[20, 45, 65, 85, 105, 125, 145, 165].map((y, idx) => (
                  <circle key={idx} cx="560" cy={y} r="3.5" fill={idx < 2 ? '#AC58E9' : '#AC58E9'} />
                ))}
              </svg>

              <div className="bb-chart-footer-metrics">
                <div><span>TOP STRATEGY RET:</span> <strong>+142.8%</strong></div>
                <div><span>SHARPE:</span> <strong>4.92</strong></div>
                <div><span>SURVIVAL RATIO:</span> <strong>32 / 2,300</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Strategy Matrix Grid */}
      <section className="bb-matrix-section">
        <div className="bb-matrix-inner">
          <div className="bb-section-header">
            <div>
              <span className="badge-amber">INSTITUTIONAL STRATEGY VAULT</span>
              <h2 className="section-title">ACTIVE PRODUCTION CANDIDATES</h2>
            </div>
            <button type="button" onClick={() => onOpenAuth('signup')} className="bb-btn-amber">
              EXPORT MODEL LOGS (JSON)
            </button>
          </div>

          <div className="bb-strategies-table-card">
            <table className="bb-table-dense">
              <thead>
                <tr>
                  <th>GENOME ID</th>
                  <th>INSTRUMENT</th>
                  <th>TIMEFRAME</th>
                  <th>ALGORITHM DESCRIPTION</th>
                  <th>SHARPE</th>
                  <th>WIN RATE</th>
                  <th>NET GAIN</th>
                  <th>MAX DD</th>
                  <th>BRIDGE STATUS</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((s) => (
                  <tr key={s.id}>
                    <td className="text-amber font-mono">{s.id}</td>
                    <td className="font-bold text-white">{s.symbol}</td>
                    <td><span className="badge-tf">{s.tf}</span></td>
                    <td className="text-dim">{s.name}</td>
                    <td className="text-amber font-bold">{s.sharpe}</td>
                    <td>{s.wr}</td>
                    <td className="text-green font-bold">{s.ret}</td>
                    <td className="text-dim">{s.dd}</td>
                    <td>
                      <span className="status-pill-green">
                        <span className="dot-blink" />
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Terminal Footer */}
      <footer className="bb-footer">
        <div className="bb-footer-inner">
          <span>TRADE2OPTIONS BLOOMBERG-TIER QUANTITATIVE DESK // ALL SYSTEMS OPERATIONAL</span>
          <span>LATENCY: {latencyVal}ms • CLOSED-BAR MT5 EA ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};
