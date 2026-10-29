import React, { useState, useEffect } from 'react';

interface Props {
  curPrice?: number;
  onEnterTerminal: (tabKey?: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  scrollToSection: (id: string) => void;
  showNav?: boolean;
}

export const ReflectEventHorizonHero: React.FC<Props> = ({
  curPrice: _curPrice = 81287.92,
  onEnterTerminal,
  onOpenAuth: _onOpenAuth,
  scrollToSection,
  showNav = false
}) => {
  // Scroll tracking for Algory-style drop-down 3D animation
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute Algory-style kinetic drop-down values
  const dropY = Math.min(180, scrollY * 0.44);
  const dropScale = Math.max(0.92, 1 - scrollY * 0.00028);
  const dropTilt = Math.min(8, scrollY * 0.016);
  const dropOpacity = Math.max(0, 1 - scrollY / 440);
  const dropBlur = Math.min(6, scrollY * 0.015);

  return (
    <section className="quantum-hero-stage">
      <style>{`
        .quantum-hero-stage {
          position: relative;
          min-height: calc(100vh - 58px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 20px 48px 20px;
          box-sizing: border-box;
          background: transparent;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
          overflow: visible;
          perspective: 1200px;
        }

        /* Top Nav if explicitly shown */
        .reflect-top-nav {
          width: 92%;
          max-width: 1140px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 60;
          margin-bottom: 24px;
        }

        /* ---------------------------------------------------- */
        /* DROP-DOWN HERO CONSOLE CARD (Strict Black, Vibe Purple, White) */
        /* ---------------------------------------------------- */
        .quantum-hero-card {
          position: relative;
          z-index: 20;
          width: 94%;
          max-width: 840px;
          border-radius: 26px;
          background: radial-gradient(ellipse 90% 65% at 50% 0%, rgba(20, 8, 32, 0.88) 0%, rgba(8, 2, 14, 0.94) 55%, #000000 100%);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1px solid rgba(172, 88, 233, 0.35);
          border-top: 1px solid rgba(255, 255, 255, 0.65);
          box-shadow: 
            0 25px 75px rgba(0, 0, 0, 0.95),
            0 0 50px rgba(172, 88, 233, 0.22),
            0 0 100px rgba(172, 88, 233, 0.12),
            inset 0 1px 2px rgba(255, 255, 255, 0.45);
          padding: 28px 34px 26px 34px;
          box-sizing: border-box;
          text-align: center;
          will-change: transform, opacity, filter;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          animation: cardDropIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes cardDropIn {
          from {
            opacity: 0;
            transform: translateY(-40px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .quantum-hero-card:hover {
          border-color: #ac58e9;
          box-shadow: 
            0 32px 90px rgba(0, 0, 0, 0.98),
            0 0 60px rgba(172, 88, 233, 0.35),
            0 0 120px rgba(172, 88, 233, 0.2),
            inset 0 1px 3px rgba(255, 255, 255, 0.6);
        }

        /* ---------------------------------------------------- */
        /* FLOATING [Ai QUANTUM] BADGE (Strict Vibe Purple & White) */
        /* ---------------------------------------------------- */
        .ai-quantum-badge-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }

        .ai-quantum-badge {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 76px;
          height: 48px;
          border-radius: 14px;
          background: radial-gradient(circle at 50% 30%, rgba(172, 88, 233, 0.45) 0%, rgba(88, 28, 135, 0.3) 55%, #000000 100%);
          border: 1.5px solid #ac58e9;
          box-shadow: 
            0 0 20px rgba(172, 88, 233, 0.75),
            0 0 45px rgba(172, 88, 233, 0.45),
            inset 0 0 14px rgba(172, 88, 233, 0.35);
          animation: aiBadgeFloat 3.2s ease-in-out infinite alternate;
          cursor: pointer;
          transition: transform 0.25s ease;
        }

        .ai-quantum-badge:hover {
          transform: translateY(-2px) scale(1.06);
          box-shadow: 
            0 0 30px rgba(172, 88, 233, 0.95),
            0 0 60px rgba(172, 88, 233, 0.65),
            inset 0 0 18px rgba(172, 88, 233, 0.5);
        }

        @keyframes aiBadgeFloat {
          0% { transform: translateY(0px); filter: drop-shadow(0 0 12px rgba(172, 88, 233, 0.8)); }
          100% { transform: translateY(-4px); filter: drop-shadow(0 0 24px rgba(172, 88, 233, 1)); }
        }

        .ai-quantum-badge-ai {
          font-size: 17px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
          letter-spacing: 0.5px;
          text-shadow: 0 0 12px #ac58e9, 0 0 24px #ffffff;
        }

        .ai-quantum-badge-text {
          font-size: 7.5px;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 2.2px;
          color: #ac58e9;
          text-transform: uppercase;
          margin-top: 2px;
          line-height: 1;
          text-shadow: 0 0 8px rgba(172, 88, 233, 0.9);
        }

        /* ---------------------------------------------------- */
        /* STATUS CHIP                                          */
        /* ---------------------------------------------------- */
        .quantum-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 14px;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid rgba(172, 88, 233, 0.45);
          box-shadow: 0 0 16px rgba(172, 88, 233, 0.25);
          margin-bottom: 14px;
        }

        .quantum-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ac58e9;
          box-shadow: 0 0 8px #ac58e9;
          animation: statusPulse 1.8s infinite;
        }

        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.8); }
        }

        .quantum-status-text {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.1px;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .quantum-status-sep {
          color: #ac58e9;
          font-size: 11px;
        }

        .quantum-status-metric {
          font-size: 10px;
          font-weight: 800;
          color: #ac58e9;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.8px;
        }

        /* ---------------------------------------------------- */
        /* MAIN HEADLINE                                        */
        /* ---------------------------------------------------- */
        .quantum-headline {
          margin: 0 0 8px 0;
          text-transform: uppercase;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }

        .quantum-headline-white {
          display: block;
          font-size: clamp(24px, 2.7vw, 38px);
          font-weight: 900;
          color: #ffffff;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.95);
        }

        .quantum-headline-gradient {
          display: block;
          font-size: clamp(26px, 2.9vw, 42px);
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #ac58e9 45%, #c882f5 75%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 24px rgba(172, 88, 233, 0.75));
          margin-top: 2px;
        }

        /* ---------------------------------------------------- */
        /* SUBTITLE                                             */
        /* ---------------------------------------------------- */
        .quantum-subtitle {
          font-size: clamp(12.5px, 1.05vw, 14.5px);
          color: #e2e8f0;
          line-height: 1.5;
          max-width: 630px;
          margin: 0 auto 18px auto;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
        }

        /* ---------------------------------------------------- */
        /* ACTION BUTTONS ROW                                   */
        /* ---------------------------------------------------- */
        .quantum-btn-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          align-items: center;
          margin-bottom: 18px;
        }

        .quantum-primary-btn {
          background: linear-gradient(135deg, #ac58e9 0%, #7928ca 100%);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 800;
          padding: 10px 24px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 0 24px rgba(172, 88, 233, 0.6), 0 0 50px rgba(172, 88, 233, 0.35);
          display: inline-flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }

        .quantum-primary-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 35px rgba(172, 88, 233, 0.9), 0 0 70px rgba(172, 88, 233, 0.55);
          border-color: #ffffff;
        }

        .quantum-secondary-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 700;
          padding: 9px 20px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .quantum-secondary-btn:hover {
          background: rgba(172, 88, 233, 0.18);
          border-color: #ac58e9;
          color: #ffffff;
          box-shadow: 0 0 24px rgba(172, 88, 233, 0.4);
        }

        /* ---------------------------------------------------- */
        /* 3 CAPABILITY CARDS                                   */
        /* ---------------------------------------------------- */
        .quantum-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          text-align: left;
          margin-top: 6px;
        }

        .quantum-cap-card {
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(172, 88, 233, 0.3);
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .quantum-cap-card:hover {
          background: rgba(172, 88, 233, 0.08);
          border-color: #ac58e9;
          transform: translateY(-2px);
          box-shadow: 0 0 22px rgba(172, 88, 233, 0.35);
        }

        .cap-card-title {
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 4px;
          color: #ac58e9;
        }

        .cap-card-desc {
          font-size: 10px;
          color: #cbd5e1;
          line-height: 1.4;
        }

        /* ---------------------------------------------------- */
        /* SCROLL TO EXPLORE ARCHITECTURE BUTTON (Matching Ref) */
        /* ---------------------------------------------------- */
        .quantum-scroll-cue-wrapper {
          margin-top: 22px;
          display: flex;
          justify-content: center;
          z-index: 20;
        }

        .quantum-scroll-cue-btn {
          border: 1px solid rgba(172, 88, 233, 0.5);
          border-radius: 9999px;
          padding: 6px 18px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: #ac58e9;
          letter-spacing: 1.6px;
          background: rgba(172, 88, 233, 0.08);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 0 16px rgba(172, 88, 233, 0.25);
        }

        .quantum-scroll-cue-btn:hover {
          background: rgba(172, 88, 233, 0.22);
          border-color: #ac58e9;
          color: #ffffff;
          transform: translateY(2px);
          box-shadow: 0 0 28px rgba(172, 88, 233, 0.55);
        }

        @media (max-width: 768px) {
          .quantum-cards-grid {
            grid-template-columns: 1fr;
          }
          .quantum-hero-card {
            padding: 22px 18px;
          }
        }
      `}</style>

      {/* Top Floating Navbar (only if showNav is true) */}
      {showNav && (
        <nav className="reflect-top-nav">
          <div className="reflect-brand" onClick={() => scrollToSection('hero')}>
            <span className="reflect-brand-name">Trade2Options</span>
          </div>
          <div className="reflect-nav-actions">
            <button className="reflect-trial-btn" onClick={() => onEnterTerminal('terminal')}>
              Launch Terminal ⚡
            </button>
          </div>
        </nav>
      )}

      {/* Hero Console Card with Algory-style kinetic drop-down scroll transform */}
      <div
        className="quantum-hero-card"
        style={{
          transform: `translateY(${dropY}px) scale(${dropScale}) rotateX(${dropTilt}deg)`,
          opacity: dropOpacity,
          filter: dropBlur > 0 ? `blur(${dropBlur}px)` : 'none'
        }}
      >
        {/* 1. Floating [Ai QUANTUM] Badge in Strict Vibe Purple & White */}
        <div className="ai-quantum-badge-wrapper">
          <div
            className="ai-quantum-badge"
            onClick={() => scrollToSection('scrollytelling')}
            title="AI Quantum Neura-Engine"
          >
            <span className="ai-quantum-badge-ai">Ai</span>
            <span className="ai-quantum-badge-text">QUANTUM</span>
          </div>
        </div>

        {/* 2. Status Pill in Strict Vibe Purple & White */}
        <div className="quantum-status-pill">
          <span className="quantum-status-dot" />
          <span className="quantum-status-text">KRONOS QUANTUM VIBE ONLINE</span>
          <span className="quantum-status-sep">•</span>
          <span className="quantum-status-metric">2.8ms SUB-TICK MT5 IPC</span>
        </div>

        {/* 3. Headline */}
        <h1 className="quantum-headline">
          <span className="quantum-headline-white">INSTITUTIONAL BITCOIN</span>
          <span className="quantum-headline-gradient">NEURA-ENGINE MOMENTUM</span>
        </h1>

        {/* 4. Subtitle */}
        <p className="quantum-subtitle">
          Autonomous closed-bar quantitative momentum signals streamed directly into MetaTrader 5 execution bridges with zero lookahead bias.
        </p>

        {/* 5. Action Buttons Row */}
        <div className="quantum-btn-row">
          <button
            onClick={() => onEnterTerminal('terminal')}
            className="quantum-primary-btn"
          >
            <span>Launch Institutional Terminal</span>
            <span>→</span>
          </button>

          <button
            onClick={() => scrollToSection('scrollytelling')}
            className="quantum-secondary-btn"
          >
            <span>Explore Scrollytelling Engine</span>
            <span style={{ color: '#ac58e9' }}>⚡</span>
          </button>
        </div>

        {/* 6. 3 Clear Capability Cards in Vibe Purple & White */}
        <div className="quantum-cards-grid">
          <div className="quantum-cap-card">
            <div className="cap-card-title">
              <span>⚡</span>
              <span>Sub-10ms MT5 IPC</span>
            </div>
            <div className="cap-card-desc">
              Real-time memory-mapped bridge piping signals to MT5 Expert Advisors with zero lag.
            </div>
          </div>

          <div className="quantum-cap-card">
            <div className="cap-card-title">
              <span>🎯</span>
              <span>7-State Regimes</span>
            </div>
            <div className="cap-card-desc">
              Deterministic market regime detection filtering false breakout noise on closed bars.
            </div>
          </div>

          <div className="quantum-cap-card">
            <div className="cap-card-title">
              <span>🛡️</span>
              <span>3.2% Risk Cap</span>
            </div>
            <div className="cap-card-desc">
              Automated Deribit tail-risk options hedging and hard circuit breaker protection.
            </div>
          </div>
        </div>
      </div>

      {/* 7. Bottom Explore Cue Button with Smooth Drop-down Scroll */}
      <div className="quantum-scroll-cue-wrapper">
        <button
          type="button"
          className="quantum-scroll-cue-btn"
          onClick={() => scrollToSection('scrollytelling')}
        >
          <span>SCROLL TO EXPLORE ARCHITECTURE</span>
          <span>↓</span>
        </button>
      </div>
    </section>
  );
};
