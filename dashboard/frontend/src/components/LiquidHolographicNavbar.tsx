import React, { useState, useRef } from 'react';

interface Props {
  curPrice: number;
  isScrolled: boolean;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onEnterTerminal: (tabKey?: string) => void;
  scrollToSection: (id: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  tag: string;
  icon: string;
  previewTitle: string;
  previewDesc: string;
  previewStats: { label: string; value: string; color?: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'live-chart',
    label: 'Live Chart',
    tag: 'REAL-TIME',
    icon: '📈',
    previewTitle: 'Real-Time BTC/USDT Candlestick Feed',
    previewDesc: 'Microsecond WebSocket IPC data stream, authentic green/red candles, and mathematical EMA indicator overlays.',
    previewStats: [
      { label: 'Timeframes', value: '1M to 1D', color: '#AC58E9' },
      { label: 'Feed Latency', value: 'Microsecond IPC', color: '#00F59B' },
      { label: 'Indicators', value: 'EMA 20/50/200', color: '#38BDF8' }
    ]
  },
  {
    id: 'telemetry-grid',
    label: 'Telemetry',
    tag: 'LIVE SIGNALS',
    icon: '📡',
    previewTitle: 'Live Campaign Signals & Feeds',
    previewDesc: 'Real-time multi-horizon orderbook flow, book depth imbalance, and closed-bar execution queues.',
    previewStats: [
      { label: 'Exchange Feeds', value: 'Binance + Deribit', color: '#AC58E9' },
      { label: 'Order Imbalance', value: '+14.2% Bull', color: '#AC58E9' },
      { label: 'Model Horizon', value: 'Multi-Timeframe', color: '#AC58E9' }
    ]
  },
  {
    id: 'scrollytelling',
    label: 'Scrollytelling',
    tag: '6-ACT ENGINE',
    icon: '📜',
    previewTitle: 'Deterministic Quantitative Narrative',
    previewDesc: 'Multi-act interactive scrollytelling exploring Command Deck, Live Campaign, Vault, and Portfolios.',
    previewStats: [
      { label: 'Narrative Acts', value: '6 Acts', color: '#AC58E9' },
      { label: 'Viewport Pin', value: '100vh Sticky', color: '#AC58E9' },
      { label: 'Data Latency', value: 'Zero Lookahead', color: '#AC58E9' }
    ]
  },
  {
    id: 'coins-stage',
    label: '3D Assets',
    tag: 'PHYSICAL REPO',
    icon: '💎',
    previewTitle: 'Levitating & Standing Token Stages',
    previewDesc: '3D interactive crypto assets with specular floor reflections, dynamic tilt, and real-time spot pricing.',
    previewStats: [
      { label: 'Active Stages', value: 'BTC, SOL, ETH', color: '#AC58E9' },
      { label: 'Physics', value: 'Gyroscopic Tilt', color: '#AC58E9' },
      { label: 'Reflections', value: 'Glass Specular', color: '#c084fc' }
    ]
  },
  {
    id: 'risk-rules',
    label: 'Risk Rules',
    tag: 'FIREWALL',
    icon: '🛡️',
    previewTitle: 'Institutional Risk Protection Matrix',
    previewDesc: 'Deterministic circuit breakers, Deribit tail-risk protective collars, and 99% VaR monitoring.',
    previewStats: [
      { label: 'Max Drawdown', value: '3.2% Hard Cap', color: '#7928ca' },
      { label: 'VaR Horizon', value: '99% Confidence', color: '#AC58E9' },
      { label: 'Kill Switch', value: 'Automated 1-Tick', color: '#AC58E9' }
    ]
  },
  {
    id: 'specifications',
    label: 'Specs',
    tag: 'HARDWARE',
    icon: '⚙️',
    previewTitle: 'Institutional Engine Architecture',
    previewDesc: 'Low-latency IPC shared memory architecture interfacing Python 3.11 with MetaTrader 5 terminals.',
    previewStats: [
      { label: 'IPC Bridge', value: 'Named Pipe Shared Mem', color: '#AC58E9' },
      { label: 'Clock Frequency', value: 'Sub-tick Event Loop', color: '#AC58E9' },
      { label: 'Throughput', value: '18.4k ticks/sec', color: '#AC58E9' }
    ]
  },
  {
    id: 'architecture',
    label: 'Pipeline',
    tag: 'EXECUTION',
    icon: '⚡',
    previewTitle: 'End-to-End Momentum Pipeline',
    previewDesc: 'From raw tick ingestion through 7-state deterministic regime detection to live MetaTrader 5 execution.',
    previewStats: [
      { label: 'Regime States', value: '7 Deterministic', color: '#AC58E9' },
      { label: 'Backtest Engine', value: 'Kronos Foundation', color: '#c084fc' },
      { label: 'Execution', value: 'Direct MT5 Socket', color: '#AC58E9' }
    ]
  }
];

export const LiquidHolographicNavbar: React.FC<Props> = ({
  curPrice,
  isScrolled,
  onOpenAuth,
  onEnterTerminal,
  scrollToSection
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Floating pill indicator position
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0
  });

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const isOpen = isHovered || isPinned;

  // Track cursor position for liquid refractive glow
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleNavItemMouseEnter = (item: NavItem) => {
    setHoveredNavId(item.id);
    const btn = navLinksRef.current[item.id];
    if (btn && navContainerRef.current) {
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
        opacity: 1
      });
    }
  };

  const handleNavContainerMouseLeave = () => {
    setHoveredNavId(null);
    setPillStyle(prev => ({ ...prev, opacity: 0 }));
  };

  const activeNavItem = NAV_ITEMS.find(item => item.id === hoveredNavId);

  return (
    <header
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleNavContainerMouseLeave();
      }}
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        width: isOpen ? '94%' : 'auto',
        minWidth: isOpen ? '94%' : 'max-content',
        maxWidth: isOpen ? 1340 : 'none',
        zIndex: 9999,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        perspective: 1000
      }}
    >
      <style>{`
        @keyframes liquidSheenSlide {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes liquidFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .liquid-navbar-wrapper {
          transition: all 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .liquid-navbar-wrapper:hover {
          border-color: rgba(172, 88, 233, 0.65) !important;
          box-shadow: 0 28px 65px rgba(0, 0, 0, 0.95), 0 0 45px rgba(172, 88, 233, 0.32), inset 0 1px 2px rgba(255, 255, 255, 0.4) !important;
        }
        .liquid-logo-pulse {
          animation: logoGlowPulse 3s ease-in-out infinite;
        }
        @keyframes logoGlowPulse {
          0%, 100% { box-shadow: 0 0 16px rgba(172, 88, 233, 0.6); }
          50% { box-shadow: 0 0 28px rgba(192, 132, 252, 0.85), 0 0 14px rgba(172, 88, 233, 0.9); }
        }
        .liquid-launch-terminal-btn:hover {
          background: linear-gradient(135deg, #c084fc 0%, #AC58E9 100%) !important;
        }
      `}</style>

      {/* Dynamic Liquid Specular Light Sheen */}
      <div
        className="liquid-navbar-wrapper"
        style={{
          position: 'relative',
          borderRadius: isOpen ? 22 : 9999,
          background: isOpen
            ? 'linear-gradient(135deg, rgba(8, 4, 18, 0.92) 0%, rgba(4, 2, 10, 0.96) 100%)'
            : isScrolled
              ? 'rgba(6, 3, 14, 0.94)'
              : 'rgba(8, 5, 20, 0.88)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: isOpen
            ? '1.5px solid rgba(172, 88, 233, 0.45)'
            : '1px solid rgba(172, 88, 233, 0.35)',
          boxShadow: isOpen
            ? '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(172, 88, 233, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.35)'
            : '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 25px rgba(172, 88, 233, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          transition: 'all 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Interactive Magnetic Mouse Refraction Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(172, 88, 233, 0.16), rgba(172, 88, 233, 0.1) 40%, transparent 80%)`,
            opacity: isOpen ? 1 : 0.6,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Liquid Prismatic Chromatic Border Beam */}
        <div
          className="liquid-chromatic-beam"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1.5,
            background: 'linear-gradient(90deg, transparent 0%, rgba(172, 88, 233, 0.9) 25%, rgba(172, 88, 233, 0.9) 50%, rgba(172, 88, 233, 0.9) 75%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'liquidSheenSlide 4s linear infinite',
            pointerEvents: 'none'
          }}
        />

        {/* MAIN BAR CONTAINER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isOpen ? 16 : 22,
            padding: isOpen ? '8px 18px' : '6px 14px',
            position: 'relative',
            zIndex: 2,
            transition: 'all 0.3s ease'
          }}
        >
          {/* 1. BRAND LOGO & SYSTEM IDENTITY */}
          <div
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Trade2Options - Quantum Cockpit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
              flexShrink: 0
            }}
          >
            <div
              className="liquid-logo-pulse"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #AC58E9 0%, #AC58E9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(172, 88, 233, 0.6)',
                fontWeight: 900,
                fontSize: 16,
                color: '#ffffff',
                flexShrink: 0,
                transition: 'all 0.3s ease'
              }}
            >
              ₿
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 800,
                  letterSpacing: -0.2,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Trade2Options</span>
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#AC58E9',
                    boxShadow: '0 0 8px #AC58E9',
                    animation: 'pulse 1.8s infinite'
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 8.5,
                  color: '#AC58E9',
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  marginTop: 2
                }}
              >
                {isOpen ? 'NEURA QUANTUM COCKPIT // V3.2' : 'QUANTUM COCKPIT'}
              </div>
            </div>
          </div>

          {/* 2. CENTER NAVIGATION (COLLAPSED VS EXPANDED) */}
          {!isOpen ? (
            /* COLLAPSED IDLE PILL: Sleek Unified Live Ticker + Interactive Explore Trigger */
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                height: 34,
                padding: '0 12px',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.25s ease',
                flexShrink: 0
              }}
              onClick={() => setIsPinned(!isPinned)}
              title="Click to explore cockpit navigation"
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(172, 88, 233, 0.45)';
                e.currentTarget.style.background = 'rgba(172, 88, 233, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11.5,
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>BTC</span>
                <span style={{ color: '#AC58E9', fontWeight: 800 }}>${curPrice.toLocaleString()}</span>
                <span style={{ color: '#AC58E9', fontWeight: 800 }}>+3.84%</span>
              </div>
              <div
                style={{
                  width: 1,
                  height: 14,
                  background: 'rgba(255, 255, 255, 0.15)',
                  flexShrink: 0
                }}
              />
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#c084fc',
                  letterSpacing: 0.6,
                  background: 'rgba(172, 88, 233, 0.18)',
                  border: '1px solid rgba(172, 88, 233, 0.35)',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  whiteSpace: 'nowrap',
                  lineHeight: '18px'
                }}
              >
                <span>EXPLORE</span>
                <span style={{ fontSize: 9 }}>▾</span>
              </div>
            </div>
          ) : (
            /* EXPANDED LIQUID NAVIGATION DOCK: With Magnetic Sliding Pill Indicator */
            <div
              ref={navContainerRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                position: 'relative',
                padding: '3px 4px',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flexShrink: 0
              }}
            >
              {/* Magnetic Liquid Sliding Pill */}
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  bottom: 3,
                  left: pillStyle.left,
                  width: pillStyle.width,
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, rgba(172, 88, 233, 0.22) 0%, rgba(172, 88, 233, 0.25) 100%)',
                  border: '1px solid rgba(172, 88, 233, 0.5)',
                  boxShadow: '0 0 16px rgba(172, 88, 233, 0.35)',
                  opacity: pillStyle.opacity,
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'none'
                }}
              />

              {NAV_ITEMS.map(item => {
                const isItemHovered = hoveredNavId === item.id;
                return (
                  <button
                    key={item.id}
                    ref={el => (navLinksRef.current[item.id] = el)}
                    onClick={() => scrollToSection(item.id)}
                    onMouseEnter={() => handleNavItemMouseEnter(item)}
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      background: 'none',
                      border: 'none',
                      color: isItemHovered ? '#AC58E9' : '#cbd5e1',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '5px 9px',
                      borderRadius: 9999,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4.5,
                      whiteSpace: 'nowrap',
                      textShadow: isItemHovered ? '0 0 10px rgba(172, 88, 233, 0.8)' : 'none',
                      transform: isItemHovered ? 'translateY(-1px)' : 'none',
                      flexShrink: 0
                    }}
                  >
                    <span style={{ fontSize: 12, filter: isItemHovered ? 'drop-shadow(0 0 6px #AC58E9)' : 'none' }}>
                      {item.icon}
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. RIGHT ACTIONS: Operator Log In, Launch Terminal & Dock Pin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            <button
              data-testid="btn-operator-login"
              onClick={() => onOpenAuth('signin')}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                height: 34,
                padding: '0 14px',
                borderRadius: 9999,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#AC58E9';
                e.currentTarget.style.background = 'rgba(172, 88, 233, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 14px rgba(172, 88, 233, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#AC58E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m21 2-9.6 9.6" />
                <path d="m15.5 7.5 3 3" />
              </svg>
              <span>Operator Log In</span>
            </button>

            <button
              data-testid="btn-launch-terminal"
              onClick={() => onEnterTerminal('terminal')}
              className="liquid-launch-terminal-btn"
              style={{
                background: 'linear-gradient(135deg, #AC58E9 0%, #AC58E9 100%)',
                border: 'none',
                color: '#ffffff',
                height: 34,
                padding: '0 16px',
                borderRadius: 9999,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: 0.2,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 0 18px rgba(172, 88, 233, 0.45)',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 0 26px rgba(172, 88, 233, 0.75)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 18px rgba(172, 88, 233, 0.45)';
              }}
            >
              <span>Launch Terminal</span>
              <span style={{ fontSize: 12 }}>⚡</span>
            </button>

            {/* Sticky Pin/Dock Mode Toggle Button */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Navbar dock pinned (Click to auto-collapse)' : 'Pin navbar dock open'}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: isPinned ? 'rgba(172, 88, 233, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isPinned ? '#AC58E9' : 'rgba(255, 255, 255, 0.14)'}`,
                color: isPinned ? '#AC58E9' : '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isPinned ? '0 0 12px rgba(172, 88, 233, 0.4)' : 'none',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#AC58E9';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isPinned ? '#AC58E9' : 'rgba(255, 255, 255, 0.14)';
                e.currentTarget.style.color = isPinned ? '#AC58E9' : '#94a3b8';
              }}
            >
              {isPinned ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6l1 1 1-1v-6H18v-2l-2-2z"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6l1 1 1-1v-6H18v-2l-2-2z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 4. LIQUID MEGA FLYOUT PREVIEW DRAWER (OPENS ON HOVER OVER SPECIFIC ITEMS) */}
        {isOpen && activeNavItem && (
          <div
            style={{
              padding: '10px 20px 14px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(180deg, rgba(172, 88, 233, 0.03) 0%, rgba(172, 88, 233, 0.06) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'nowrap',
              animation: 'liquidFadeIn 0.28s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 1 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(172, 88, 233, 0.12)',
                  border: '1px solid rgba(172, 88, 233, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0
                }}
              >
                {activeNavItem.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                    {activeNavItem.previewTitle}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      padding: '2px 7px',
                      borderRadius: 9999,
                      background: 'rgba(172, 88, 233, 0.18)',
                      color: '#AC58E9',
                      fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    {activeNavItem.tag}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeNavItem.previewDesc}
                </div>
              </div>
            </div>

            {/* Quick Live Preview Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
              {activeNavItem.previewStats.map((st, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {st.label}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: st.color || '#ffffff' }}>
                    {st.value}
                  </span>
                </div>
              ))}

              <button
                onClick={() => scrollToSection(activeNavItem.id)}
                style={{
                  height: 30,
                  padding: '0 12px',
                  borderRadius: 9999,
                  background: 'rgba(172, 88, 233, 0.15)',
                  border: '1px solid rgba(172, 88, 233, 0.45)',
                  color: '#AC58E9',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#AC58E9';
                  e.currentTarget.style.color = '#020409';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(172, 88, 233, 0.6)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(172, 88, 233, 0.15)';
                  e.currentTarget.style.color = '#AC58E9';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>Jump to Section</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
