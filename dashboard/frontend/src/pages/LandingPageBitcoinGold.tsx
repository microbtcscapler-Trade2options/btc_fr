import React, { useState } from 'react';
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

export const LandingPageBitcoinGold: React.FC<Props> = ({
  snapshot,
  onOpenAuth,
  onEnterTerminal,
  onOpenLab
}) => {
  const [collarBtcAmount, setCollarBtcAmount] = useState<number>(2.5);
  const [selectedStrikePut, setSelectedStrikePut] = useState<number>(80000);
  const [selectedStrikeCall, setSelectedStrikeCall] = useState<number>(95000);
  const curPrice = snapshot?.latest_candle?.close || 84920.5;

  // Options Greeks calculations
  const floorProtection = selectedStrikePut * collarBtcAmount;
  const maxCapValue = selectedStrikeCall * collarBtcAmount;
  const netPremiumYield = +(collarBtcAmount * 1420).toFixed(0);

  return (
    <div className="btc-gold-page-root">
      {/* 1. Sovereign Gold Nav Bar */}
      <nav className="btc-gold-nav">
        <div className="btc-brand-wrap">
          <div className="btc-gold-glyph">₿</div>
          <span className="btc-brand-title">Trade2Options // BITCOIN INSTITUTIONAL</span>
        </div>

        <div className="btc-nav-stats">
          <div className="btc-stat-pill">
            <span className="text-dim">SPOT BTC:</span>
            <span className="text-gold font-bold font-mono">
              ${curPrice.toLocaleString('en-US', { minimumFractionDigits: 1 })}
            </span>
          </div>
          <div className="btc-stat-pill">
            <span className="text-dim">24H FUNDING:</span>
            <span className="text-green font-bold">+0.0078%</span>
          </div>
          <div className="btc-stat-pill">
            <span className="text-dim">DERIBIT 25D SKEW:</span>
            <span className="text-gold font-bold">-2.4% (CALL BIAS)</span>
          </div>
        </div>

        <div className="btc-nav-actions">
          <button type="button" onClick={() => onOpenAuth('signin')} className="btc-btn-outline">
            OPERATOR LOGIN
          </button>
          <button type="button" onClick={() => onEnterTerminal('options')} className="btc-btn-gold">
            ACCESS TERMINAL
          </button>
        </div>
      </nav>

      {/* 2. Hero: 100% Bitcoin Dedicated Quantitative Architecture */}
      <header className="btc-hero-section">
        <div className="btc-hero-inner">
          <div className="btc-hero-content">
            <div className="btc-badge-gold">100% BITCOIN MOMENTUM &amp; OPTIONS COLLAR ARBITRAGE</div>
            <h1 className="btc-hero-title">
              INSTITUTIONAL BITCOIN ALPHA. <br />
              <span className="btc-gold-gradient">ZERO LIQUIDATION EXPOSURE.</span>
            </h1>
            <p className="btc-hero-desc">
              Trade2Options provides systematic spot accumulation paired with algorithmic protective collar options.
              Capture explosive Bitcoin upside while hedging tail-risk drawdowns with verified closed-bar execution.
            </p>

            <div className="btc-hero-cta-group">
              <button type="button" onClick={() => onEnterTerminal('options')} className="btc-btn-gold-large">
                <span>LAUNCH BITCOIN COLLAR ENGINE</span>
                <span>→</span>
              </button>
              <button type="button" onClick={onOpenLab} className="btc-btn-glass-large">
                BACKTEST SIGNAL LAB
              </button>
            </div>
          </div>

          {/* Glowing 3D Golden Bitcoin Disc Hero Element */}
          <div className="btc-hero-coin-display">
            <div className="btc-golden-ring-glow" />
            <svg width="240" height="240" viewBox="0 0 180 180" className="btc-giant-svg">
              <defs>
                <radialGradient id="goldCoinGrad" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="35%" stopColor="#AC58E9" />
                  <stop offset="70%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#451A03" />
                </radialGradient>
                <filter id="goldBloom" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>
              <circle cx="90" cy="90" r="82" fill="none" stroke="#AC58E9" strokeWidth="3" filter="url(#goldBloom)" />
              <circle cx="90" cy="90" r="76" fill="url(#goldCoinGrad)" stroke="#FBBF24" strokeWidth="2.5" />
              <circle cx="90" cy="90" r="68" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.2" strokeDasharray="3 3" />
              <text x="90" y="114" textAnchor="middle" fill="#FFFFFF" fontSize="76" fontWeight="900" fontFamily="'Plus Jakarta Sans', sans-serif" style={{ filter: 'drop-shadow(0 0 10px rgba(172, 88, 233, 0.8))' }}>
                ₿
              </text>
            </svg>

            <div className="btc-coin-caption">
              <span>BITCOIN SYSTEM CORE</span>
              <strong className="text-gold">MOMENTUM REGIME: BULL_EXPANSION</strong>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Bitcoin Protective Collar Simulator & Payoff Diagram */}
      <section className="btc-collar-simulator-section">
        <div className="btc-section-inner">
          <div className="btc-section-header">
            <span className="btc-badge-gold">DERIVATIVES DESK ENGINE</span>
            <h2>INTERACTIVE PROTECTIVE COLLAR PAYOFF SIMULATOR</h2>
            <p className="text-dim">
              Long Spot BTC + Long Out-of-the-Money Protective Put (Floor) + Short Covered Call (Ceiling Yield).
            </p>
          </div>

          <div className="btc-simulator-card">
            {/* Left: Interactive Controls */}
            <div className="btc-sim-controls">
              <div className="sim-field">
                <label>SPOT BITCOIN ALLOCATION (BTC)</label>
                <div className="sim-input-row">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    value={collarBtcAmount}
                    onChange={(e) => setCollarBtcAmount(parseFloat(e.target.value) || 1)}
                    className="sim-input"
                  />
                  <span className="input-unit">BTC (${(collarBtcAmount * curPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })})</span>
                </div>
              </div>

              <div className="sim-field">
                <label>PROTECTIVE PUT STRIKE (DOWNSIDE FLOOR)</label>
                <div className="sim-select-row">
                  {[75000, 78000, 80000, 82000].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedStrikePut(s)}
                      className={`sim-strike-btn ${selectedStrikePut === s ? 'active' : ''}`}
                    >
                      ${(s / 1000).toFixed(0)}k Put
                    </button>
                  ))}
                </div>
              </div>

              <div className="sim-field">
                <label>COVERED CALL STRIKE (PROFIT TARGET CEILING)</label>
                <div className="sim-select-row">
                  {[90000, 95000, 100000, 105000].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedStrikeCall(s)}
                      className={`sim-strike-btn ${selectedStrikeCall === s ? 'active' : ''}`}
                    >
                      ${(s / 1000).toFixed(0)}k Call
                    </button>
                  ))}
                </div>
              </div>

              {/* Payoff Output Pill */}
              <div className="btc-summary-pill">
                <div className="summary-row">
                  <span>MAXIMUM CAPITAL RISK:</span>
                  <strong className="text-green">${floorProtection.toLocaleString('en-US')} (PROTECTED FLOOR)</strong>
                </div>
                <div className="summary-row">
                  <span>UPSIDE TARGET VALUE:</span>
                  <strong className="text-gold">${maxCapValue.toLocaleString('en-US')}</strong>
                </div>
                <div className="summary-row">
                  <span>ESTIMATED 30D COLLAR YIELD:</span>
                  <strong className="text-green">+${netPremiumYield.toLocaleString('en-US')} NET PREMIUM</strong>
                </div>
              </div>
            </div>

            {/* Right: SVG Collar Payoff Curve Diagram */}
            <div className="btc-sim-chart">
              <div className="chart-header-row">
                <span>COLLAR ASYMMETRIC PAYOFF DIAGRAM</span>
                <span className="text-gold">FLOOR: ${selectedStrikePut.toLocaleString()} | CAP: ${selectedStrikeCall.toLocaleString()}</span>
              </div>

              <svg viewBox="0 0 520 280" className="btc-payoff-svg">
                {/* Horizontal Zero Profit Axis */}
                <line x1="40" y1="180" x2="480" y2="180" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
                <line x1="260" y1="20" x2="260" y2="260" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="4 4" />

                {/* Spot BTC Unhedged Linear Path */}
                <path d="M 60 250 L 460 70" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.8" strokeDasharray="3 4" />

                {/* Protective Collar Curve (Flat floor below Put strike, 45 deg linear slope, flat cap above Call strike) */}
                <path
                  d="M 60 200 L 160 200 L 360 80 L 460 80"
                  fill="none"
                  stroke="#AC58E9"
                  strokeWidth="3.2"
                />

                {/* Shaded Profit Region */}
                <polygon points="160,200 360,80 460,80 460,180 160,180" fill="rgba(172, 88, 233, 0.12)" />

                {/* Strike Indicator Markers */}
                <circle cx="160" cy="200" r="5" fill="#7928ca" />
                <text x="160" y="225" textAnchor="middle" fill="#7928ca" fontSize="11" fontWeight="700">
                  PUT FLOOR (${(selectedStrikePut / 1000).toFixed(0)}k)
                </text>

                <circle cx="360" cy="80" r="5" fill="#AC58E9" />
                <text x="360" y="65" textAnchor="middle" fill="#AC58E9" fontSize="11" fontWeight="700">
                  CALL CAP (${(selectedStrikeCall / 1000).toFixed(0)}k)
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bitcoin Institutional Footer */}
      <footer className="btc-footer">
        <div className="btc-footer-inner">
          <span>TRADE2OPTIONS BITCOIN COLLAR SPECIFICATIONS // DERIBIT &amp; MT5 DIRECT IPC</span>
          <span className="text-gold">100% BTC ALLOCATION MODEL • AUDITED RISK MATRIX</span>
        </div>
      </footer>
    </div>
  );
};
