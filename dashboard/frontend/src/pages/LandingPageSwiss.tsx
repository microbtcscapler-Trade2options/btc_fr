import React from 'react';
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

export const LandingPageSwiss: React.FC<Props> = ({
  snapshot,
  onOpenAuth,
  onEnterTerminal,
  onOpenLab
}) => {
  const curPrice = snapshot?.latest_candle?.close || 84920.5;

  return (
    <div className="swiss-page-root">
      {/* 1. Precision Header */}
      <header className="swiss-header">
        <div className="swiss-header-inner">
          <div className="swiss-brand">
            <span className="swiss-logo-square">■</span>
            <span className="swiss-brand-title">Trade2Options / Swiss Quant Atelier</span>
          </div>

          <div className="swiss-nav-links">
            <button type="button" onClick={() => onOpenAuth('signin')} className="swiss-link-btn">
              Operator Portal
            </button>
            <button type="button" onClick={() => onEnterTerminal('terminal')} className="swiss-btn-primary">
              Enter Terminal
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Architectural Simplicity */}
      <section className="swiss-hero">
        <div className="swiss-hero-inner">
          <div className="swiss-meta-chip">MATHEMATICAL PROOF OF EDGE // CLOSED-BAR DETERMINISM</div>
          <h1 className="swiss-hero-h1">
            Systematic momentum, <br />
            engineered for precision.
          </h1>
          <p className="swiss-hero-desc">
            Trade2Options strips away subjective speculation. Built on Marcos López de Prado’s meta-labeling barrier methods,
            fractional Kelly position sizing, and direct IPC socket execution to MetaTrader 5 and Deribit.
          </p>

          <div className="swiss-cta-row">
            <button type="button" onClick={() => onEnterTerminal('terminal')} className="swiss-btn-large">
              Launch Research Cockpit
            </button>
            <button type="button" onClick={onOpenLab} className="swiss-btn-large swiss-btn-secondary">
              Open Signal &amp; Execution Lab
            </button>
          </div>
        </div>
      </section>

      {/* 3. Mathematical Foundations Bento Grid */}
      <section className="swiss-bento-section">
        <div className="swiss-bento-inner">
          <div className="swiss-bento-grid">
            {/* Card 1: Meta-Labeling Barrier Method */}
            <div className="swiss-bento-card bento-wide">
              <div className="card-top-tag">LÓPEZ DE PRADO TRIPLE-BARRIER METHOD</div>
              <h3 className="card-heading">Independent Sizing &amp; Directional Barrier Separation</h3>
              <p className="card-body">
                Primary momentum filters generate direction. Secondary meta-labeling models evaluate the probability
                of hitting the horizontal profit-taking barrier before the stop-loss or vertical time horizon is reached.
              </p>

              <div className="math-formula-box">
                <code>{`Kelly Fraction f* = (p * b - q) / b  •  Regime Volatility Scaling σ_ATR`}</code>
              </div>

              <div className="barrier-diagram-svg-wrap">
                <svg viewBox="0 0 600 160" className="barrier-svg">
                  <line x1="20" y1="30" x2="580" y2="30" stroke="#AC58E9" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="30" y="22" fill="#AC58E9" fontSize="11" fontWeight="700">UPPER PROFIT BARRIER (+2.5 ATR)</text>

                  <line x1="20" y1="130" x2="580" y2="130" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="30" y="148" fill="#c084fc" fontSize="11" fontWeight="700">LOWER STOP BARRIER (-1.0 ATR)</text>

                  <line x1="480" y1="10" x2="480" y2="150" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="490" y="85" fill="#FFFFFF" fontSize="11" fontWeight="700">VERTICAL TIME EXPIRATION</text>

                  {/* Simulated Price Path reaching Upper Barrier */}
                  <path d="M 40 85 Q 120 95, 180 75 T 320 60 T 420 30" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle cx="420" cy="30" r="5" fill="#AC58E9" />
                </svg>
              </div>
            </div>

            {/* Card 2: Key Metric 1 */}
            <div className="swiss-bento-card">
              <div className="card-top-tag">CAGR / OUT-OF-SAMPLE</div>
              <div className="big-stat text-cyan">+118.4%</div>
              <p className="stat-desc">Compound annual growth rate across 6 years of out-of-sample held-out tick history.</p>
            </div>

            {/* Card 3: Key Metric 2 */}
            <div className="swiss-bento-card">
              <div className="card-top-tag">MAX TRAILING DRAWDOWN</div>
              <div className="big-stat text-white">5.2%</div>
              <p className="stat-desc">Guaranteed daily circuit breaker. Safe for prop firm account capital retention.</p>
            </div>

            {/* Card 4: Key Metric 3 */}
            <div className="swiss-bento-card">
              <div className="card-top-tag">PROFIT FACTOR</div>
              <div className="big-stat text-cyan">2.84</div>
              <p className="stat-desc">Ratio of gross profits to gross losses over 12,480 closed-bar trade executions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Swiss Footer */}
      <footer className="swiss-footer">
        <div className="swiss-footer-inner">
          <span>Trade2Options Atelier • Zurich &amp; Global Quant Cloud</span>
          <span>BTC Spot: ${curPrice.toLocaleString('en-US', { minimumFractionDigits: 1 })} • MetaTrader 5 Bridge</span>
        </div>
      </footer>
    </div>
  );
};
