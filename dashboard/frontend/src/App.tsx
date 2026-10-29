import React, { useState, useEffect, useRef } from 'react';
import { MarketDataSnapshot, IndicatorSnapshot, MarketRegimeSnapshot, TimeFrame, MasterSignalSnapshot } from './types';
import { fetchMarketCandles, fetchMarketIndicators, fetchMarketRegime, fetchMasterSignal } from './api';

import { MarketTerminalPage } from './pages/MarketTerminalPage';
import { MomentumRegimePage } from './pages/MomentumRegimePage';
import { EntryTimingPage } from './pages/EntryTimingPage';
import { ResearchIntelligencePage } from './pages/ResearchIntelligencePage';
import { BacktestLabPage } from './pages/BacktestLabPage';
import { EAMonitorPage } from './pages/EAMonitorPage';
import { AuditIntegrationsPage } from './pages/AuditIntegrationsPage';
import { OptionsOverlayPage } from './pages/OptionsOverlayPage';
import { ForecastStudioPage } from './pages/ForecastStudioPage';
import { ObsidianAgentGraph } from './pages/ObsidianAgentGraph';
import { SignalLabModal } from './components/SignalLabModal';
import { LandingPage } from './pages/LandingPage';
import { QuantumAuthModal } from './components/QuantumAuthModal';
import { TerminalCosmicBackground } from './components/TerminalCosmicBackground';

type TabKey = 'terminal' | 'regime' | 'entry' | 'forecast' | 'topology' | 'research' | 'options' | 'backtest' | 'ea' | 'audit';
type AppView = 'landing' | 'cockpit';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'cockpit') return 'cockpit';
    return 'landing';
  });

  const switchView = (newView: AppView) => {
    setCurrentView(newView);
    const url = new URL(window.location.href);
    if (newView === 'cockpit') {
      url.searchParams.set('view', 'cockpit');
    } else {
      url.searchParams.delete('view');
    }
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [activeTab, setActiveTab] = useState<TabKey>('terminal');
  const [_isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('t2o_auth_token') === 'true';
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');
  const [timeframe, setTimeframe] = useState<TimeFrame>('15m');
  const [snapshot, setSnapshot] = useState<MarketDataSnapshot | null>(null);
  const [indicators, setIndicators] = useState<IndicatorSnapshot | null>(null);
  const [regime, setRegime] = useState<MarketRegimeSnapshot | null>(null);
  const [liveSignal, setLiveSignal] = useState<MasterSignalSnapshot | null>(null);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [priceFlash, setPriceFlash] = useState<'bull' | 'bear' | null>(null);
  const [prevPrice, setPrevPrice] = useState<number>(0);
  const [sidebarTooltip, setSidebarTooltip] = useState<{ label: string; shortcut: string; top: number } | null>(null);

  // Top Bar Interactive Profile, Notifications & Theme State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('t2o_terminal_theme') as 'dark' | 'light') || 'dark';
  });
  const [themeToast, setThemeToast] = useState<string | null>(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('t2o_terminal_theme', next);
    setThemeToast(`Switched to ${next === 'light' ? 'Daylight Light Mode' : 'Institutional Dark Cockpit'}`);
    setTimeout(() => setThemeToast(null), 2200);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  const [unreadAlerts, setUnreadAlerts] = useState(3);
  const [operatorName, setOperatorName] = useState('Trade2Options Desk');
  const operatorRole = 'Lead Quant Operator';
  const [isEditingOperator, setIsEditingOperator] = useState(false);

  const sidebarRef = useRef<HTMLElement>(null);
  const mainViewportRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSidebarWheel = (e: React.WheelEvent<HTMLElement>) => {
    const rail = sidebarRef.current;
    const viewport = mainViewportRef.current;
    if (!rail || !viewport) return;

    const canScrollSidebar = rail.scrollHeight > rail.clientHeight;
    const isAtTop = rail.scrollTop <= 0 && e.deltaY < 0;
    const isAtBottom = rail.scrollTop + rail.clientHeight >= rail.scrollHeight - 2 && e.deltaY > 0;

    // If sidebar cannot scroll or has reached boundary, seamlessly forward scroll to main page!
    if (!canScrollSidebar || isAtTop || isAtBottom) {
      viewport.scrollBy({ top: e.deltaY, behavior: 'auto' });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [snap, sig] = await Promise.all([
        fetchMarketCandles('BTCUSDT', timeframe, 150),
        fetchMasterSignal('BTCUSDT', timeframe).catch(() => null)
      ]);
      setSnapshot(snap);
      if (sig) setLiveSignal(sig);

      if (snap.is_data_available && snap.candles_count >= 50) {
        const [ind, reg] = await Promise.all([
          fetchMarketIndicators('BTCUSDT', timeframe),
          fetchMarketRegime('BTCUSDT')
        ]);
        setIndicators(ind);
        setRegime(reg);
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [timeframe]);

  const curPrice = snapshot?.latest_candle?.close || 0;

  useEffect(() => {
    if (curPrice > 0) {
      if (prevPrice > 0 && curPrice !== prevPrice) {
        setPriceFlash(curPrice > prevPrice ? 'bull' : 'bear');
        const timer = setTimeout(() => setPriceFlash(null), 1400);
        return () => clearTimeout(timer);
      }
      setPrevPrice(curPrice);
    }
  }, [curPrice]);


  const sidebarItems: { key: TabKey; icon: string; label: string }[] = [
    { key: 'terminal', icon: '🏠', label: '1. BTC Terminal' },
    { key: 'regime', icon: '⊞', label: '2. Momentum & Regime Lab' },
    { key: 'entry', icon: '🎯', label: '3. Entry Timing' },
    { key: 'forecast', icon: '📈', label: '4. AI Forecast Studio' },
    { key: 'topology', icon: '🕸️', label: '5. Obsidian Agent Mesh' },
    { key: 'research', icon: '📄', label: '6. Research Intelligence' },
    { key: 'options', icon: '💳', label: '7. Options & SOR Desk' },
    { key: 'backtest', icon: '🧪', label: '8. Backtest & Strategy Lab' },
    { key: 'ea', icon: '💼', label: '9. EA Monitor' },
  ];

  // =========================================================================
  // VIEW 1: STANDALONE 3D ANIMATED LANDING PAGE (NO SIDEBAR, NO COCKPIT HEADER)
  // =========================================================================
  if (currentView === 'landing') {
    return (
      <div className={`landing-viewport-wrapper ${theme === 'light' ? 'theme-light' : ''}`}>
        <LandingPage
          snapshot={snapshot}
          indicators={indicators}
          regime={regime}
          liveSignal={liveSignal}
          onOpenAuth={(mode) => {
            setAuthInitialMode(mode || 'signin');
            setIsAuthOpen(true);
          }}
          onEnterTerminal={(tabKey) => {
            if (tabKey) setActiveTab(tabKey as TabKey);
            switchView('cockpit');
          }}
          onOpenLab={() => setIsLabOpen(true)}
        />

        {/* Standalone Quantum Biometric Passkey Modal Gateway */}
        <QuantumAuthModal
          isOpen={isAuthOpen}
          initialMode={authInitialMode}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(name) => {
            setOperatorName(name);
            setIsAuthenticated(true);
            localStorage.setItem('t2o_auth_token', 'true');
            setIsAuthOpen(false);
            switchView('cockpit');
          }}
        />

        {/* Signal & Execution Lab Modal */}
        <SignalLabModal
          isOpen={isLabOpen}
          onClose={() => setIsLabOpen(false)}
          timeframe={timeframe}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: INSTITUTIONAL QUANTITATIVE TERMINAL COCKPIT (AUTHENTICATED)
  // =========================================================================
  return (
    <div className={`app-layout-container ${theme === 'light' ? 'theme-light' : ''}`}>
      {/* 3D Undulating Waves & Cosmic Motion Background (Pinterest Reference 2) */}
      <TerminalCosmicBackground />

      {/* Dynamic Ambient Aurora Lighting Mesh */}
      <div className="ambient-aurora" />

      {/* Left Curved Vertical Sidebar Rail Dock (Exact Match to Reference Left Sidebar) */}
      <aside
        className="reference-sidebar-rail"
        ref={sidebarRef}
        onWheel={handleSidebarWheel}
        onScroll={() => setSidebarTooltip(null)}
      >
        {/* Brand Flower/Cross Clover Icon */}
        <div
          className="brand-clover-icon"
          onClick={() => setActiveTab('terminal')}
          title="Trade2Options Institutional Terminal"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setSidebarTooltip({ label: 'Trade2Options Terminal', shortcut: '⌘T', top: rect.top + rect.height / 2 });
          }}
          onMouseLeave={() => setSidebarTooltip(null)}
        >
          <span className="clover-symbol">✤</span>
        </div>

        {/* Vertical Icon Navigation List */}
        <div className="sidebar-nav-list">
          {sidebarItems.map((item, idx) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                data-tab={item.key}
                data-testid={`tab-${item.key}`}
                onClick={() => setActiveTab(item.key)}
                className={`sidebar-squircle-btn ${isActive ? 'sidebar-squircle-btn-active' : ''}`}
                style={{ animationDelay: `${idx * 40}ms` }}
                aria-label={item.label}
                title={item.label}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setSidebarTooltip({ label: item.label, shortcut: `⌥${idx + 1}`, top: rect.top + rect.height / 2 });
                }}
                onMouseLeave={() => setSidebarTooltip(null)}
              >
                {isActive && <span className="sidebar-active-pill" />}
                <span className="sidebar-btn-icon" style={{ fontSize: 16 }}>{item.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Sidebar Action Icons (Settings & Lab) */}
        <div className="sidebar-bottom-actions">
          <button
            data-tab="audit"
            data-testid="tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`sidebar-squircle-btn sidebar-settings-btn ${activeTab === 'audit' ? 'sidebar-squircle-btn-active' : ''}`}
            title="10. Integrations & System Settings"
            aria-label="10. Integrations & System Settings"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSidebarTooltip({ label: '10. Integrations & System Settings', shortcut: '⌘,', top: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => setSidebarTooltip(null)}
          >
            {activeTab === 'audit' && <span className="sidebar-active-pill" />}
            <span className="sidebar-btn-icon spin-icon" style={{ fontSize: 16 }}>⚙️</span>
          </button>

          <button
            data-tab="lab"
            data-testid="btn-open-lab"
            onClick={() => setIsLabOpen(true)}
            className="sidebar-squircle-btn sidebar-lab-btn"
            title="Launch Signal & Execution Lab"
            aria-label="Launch Signal & Execution Lab"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSidebarTooltip({ label: 'Signal & Execution Lab', shortcut: '⚡ LIVE', top: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => setSidebarTooltip(null)}
          >
            <span className="sidebar-btn-icon bolt-icon" style={{ fontSize: 16 }}>⚡</span>
          </button>
        </div>
      </aside>

      {/* Main App Content Viewport (Top Bar + Nav + Page Content + Footer) */}
      <div ref={mainViewportRef} className="app-main-viewport">
        {/* Top Header Bar (Exact Match to Reference Top Bar) */}
        <header className="reference-top-bar">
          {/* Left: Search Input Pill with Keyboard Shortcut */}
          <div className="search-pill-container">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search markets, signals, regimes..."
              className="search-pill-input"
              readOnly
              onClick={() => setIsLabOpen(true)}
              style={{ cursor: 'pointer' }}
            />
            <span className="search-shortcut-badge">⌘ + Space</span>
          </div>

          {/* Exit to Public 3D Landing Page */}
          <button
            data-testid="btn-exit-landing"
            onClick={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="exit-to-landing-btn"
            title="Return to Public 3D Landing Page"
          >
            <span style={{ fontSize: 13 }}>←</span>
            <span>Public Landing</span>
          </button>

          {/* Center Branding / Lab Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setIsLabOpen(true)}
              className="shimmer-sweep"
              style={{
                padding: '7px 20px',
                borderRadius: 'var(--pill-radius)',
                border: '1px solid rgba(172, 88, 233, 0.45)',
                background: 'linear-gradient(135deg, rgba(172, 88, 233, 0.2) 0%, rgba(9, 19, 25, 0.8) 100%)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 0 24px rgba(172, 88, 233, 0.25)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className="pulse-dot dot-cyan" />
                <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.8, color: '#FFFFFF' }}>
                  ⚡ LAB
                </span>
              </div>
              <div style={{ width: 1, height: 16, background: 'rgba(172, 88, 233, 0.35)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', letterSpacing: 0.2 }}>
                {liveSignal ? `${liveSignal.action.replace(/_/g, ' ')} (${liveSignal.composite_confidence_pct}%)` : 'LIVE SIGNAL FLOW'}
              </span>
              <span
                style={{
                  fontSize: 9,
                  background: 'rgba(172, 88, 233, 0.2)',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: 'var(--pill-radius)',
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  border: '1px solid rgba(172, 88, 233, 0.4)'
                }}
              >
                MT5 FLOW
              </span>
            </button>
          </div>

          {/* Right: Actions, Spot Price, Notification & Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Spot Price Pill */}
            <div
              style={{
                background: priceFlash === 'bull' ? 'rgba(172, 88, 233, 0.22)' : priceFlash === 'bear' ? 'rgba(121, 40, 202, 0.22)' : 'var(--bg-card)',
                padding: '6px 14px',
                borderRadius: 'var(--pill-radius)',
                border: priceFlash === 'bull' ? '1px solid rgba(172, 88, 233, 0.45)' : priceFlash === 'bear' ? '1px solid rgba(121, 40, 202, 0.45)' : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.4s ease'
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>BTC</span>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                ${curPrice ? curPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Loading...'}
              </span>
            </div>

            {/* Refresh Action Icon */}
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="top-bar-action-icon"
              title="Refresh Market Stream"
            >
              <span style={{ fontSize: 14, display: 'inline-block', transform: loading ? 'rotate(360deg)' : 'none', transition: 'transform 0.6s ease' }}>
                ↻
              </span>
            </button>

            {/* Bell Notification Icon with Unread Badge & Working Popover */}
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="top-bar-action-icon"
                title="Terminal Alerts & Notifications"
                style={{ position: 'relative' }}
              >
                <span style={{ fontSize: 13 }}>🔔</span>
                {unreadAlerts > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--accent-cyan-bright)',
                      boxShadow: '0 0 8px var(--accent-cyan-bright)'
                    }}
                  />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="topbar-popover" style={{ width: 340 }}>
                  <div className="topbar-popover-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13 }}>🔔</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-main)' }}>Live Terminal Alerts</span>
                    </div>
                    {unreadAlerts > 0 && (
                      <span className="popover-status-badge active">{unreadAlerts} NEW</span>
                    )}
                  </div>
                  <div style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(172, 88, 233, 0.08)', borderRadius: 10, border: '1px solid rgba(172, 88, 233, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#AC58E9', fontWeight: 700 }}>
                        <span>⚡ AUTONOMOUS DISCORD SCANNER</span>
                        <span style={{ color: 'var(--text-dim)' }}>2m ago</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-main)', marginTop: 3 }}>
                        15m candle validated at ${curPrice ? curPrice.toLocaleString('en-US', { minimumFractionDigits: 1 }) : '82,800'}. Signal evaluated.
                      </div>
                    </div>

                    <div style={{ padding: '8px 12px', background: 'rgba(121, 40, 202, 0.08)', borderRadius: 10, border: '1px solid rgba(121, 40, 202, 0.25)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#c084fc', fontWeight: 700 }}>
                        <span>🛡️ MULTI-DIRECTIONAL RISK GUARD</span>
                        <span style={{ color: 'var(--text-dim)' }}>8m ago</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-main)', marginTop: 3 }}>
                        Attributed veto active: SELL side vetoed during low-volatility chop.
                      </div>
                    </div>

                    <div style={{ padding: '8px 12px', background: 'rgba(172, 88, 233, 0.08)', borderRadius: 10, border: '1px solid rgba(172, 88, 233, 0.25)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#AC58E9', fontWeight: 700 }}>
                        <span>📊 MT5 BRIDGE SYNC</span>
                        <span style={{ color: 'var(--text-dim)' }}>18m ago</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-main)', marginTop: 3 }}>
                        Standalone EA Magic 261016 sync online. 249 closed bars verified.
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(172, 88, 233, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => setUnreadAlerts(0)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Mark All as Read
                    </button>
                    <button
                      onClick={() => { setActiveTab('audit'); setIsNotificationsOpen(false); }}
                      style={{ background: 'transparent', border: 'none', color: '#AC58E9', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                    >
                      Audit Log &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Theme Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="top-bar-action-icon"
              title={theme === 'dark' ? 'Switch to Daylight Light Mode' : 'Switch to Institutional Dark Cockpit'}
              aria-label="Toggle Theme Mode"
            >
              <span style={{ fontSize: 13 }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
            </button>

            {/* Functional Quant Operator Profile Dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div
                className={`user-profile-pill ${isProfileOpen ? 'active' : ''}`}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                title="Quant Operator Profile & Bridge Gateway"
              >
                <div className="user-avatar-circle">
                  T2O
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {operatorName}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.2 }}>
                    @quant_operator
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    marginLeft: 4,
                    transition: 'transform 0.25s ease',
                    transform: isProfileOpen ? 'rotate(180deg)' : 'none'
                  }}
                >
                  ⌵
                </span>
              </div>

              {isProfileOpen && (
                <div className="topbar-popover" style={{ width: 310 }}>
                  <div className="topbar-popover-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar-circle" style={{ width: 34, height: 34, fontSize: 12 }}>
                        T2O
                      </div>
                      <div>
                        {isEditingOperator ? (
                          <input
                            type="text"
                            value={operatorName}
                            onChange={(e) => setOperatorName(e.target.value)}
                            onBlur={() => setIsEditingOperator(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingOperator(false)}
                            autoFocus
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--accent-cyan)',
                              color: '#FFFFFF',
                              borderRadius: 4,
                              padding: '2px 6px',
                              fontSize: 12,
                              fontWeight: 700
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>
                            {operatorName}
                          </div>
                        )}
                        <div style={{ fontSize: 10, color: 'var(--accent-cyan-bright)', fontWeight: 600 }}>
                          {operatorRole}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Status Strip */}
                  <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(172, 88, 233, 0.15)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-dim)' }}>MT5 Execution</span>
                      <span className="popover-status-badge online">MAGIC 261016</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-dim)' }}>Discord Scanner</span>
                      <span className="popover-status-badge online">AUTONOMOUS</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-dim)' }}>Directional Risk</span>
                      <span className="popover-status-badge active">VETO GUARD ON</span>
                    </div>
                  </div>

                  {/* Quick Action Navigation Items */}
                  <div style={{ padding: '6px 0' }}>
                    <div
                      className="popover-menu-item"
                      onClick={() => { setActiveTab('audit'); setIsProfileOpen(false); }}
                    >
                      <span style={{ fontSize: 14 }}>⚙️</span>
                      <span>10. Integrations & System Settings</span>
                    </div>
                    <div
                      className="popover-menu-item"
                      onClick={() => { setIsLabOpen(true); setIsProfileOpen(false); }}
                    >
                      <span style={{ fontSize: 14 }}>⚡</span>
                      <span>Signal & Execution Lab</span>
                    </div>
                    <div
                      className="popover-menu-item"
                      onClick={() => { setActiveTab('backtest'); setIsProfileOpen(false); }}
                    >
                      <span style={{ fontSize: 14 }}>🧪</span>
                      <span>Backtest Strategy Studio</span>
                    </div>
                    <div
                      className="popover-menu-item"
                      onClick={() => { loadData(); setIsProfileOpen(false); }}
                    >
                      <span style={{ fontSize: 14 }}>↻</span>
                      <span>Force Re-sync Market Feed</span>
                    </div>
                    <div
                      className="popover-menu-item"
                      onClick={() => { toggleTheme(); setIsProfileOpen(false); }}
                    >
                      <span style={{ fontSize: 14 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                      <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Cockpit'}</span>
                    </div>
                    <div
                      className="popover-menu-item"
                      onClick={() => setIsEditingOperator(!isEditingOperator)}
                    >
                      <span style={{ fontSize: 14 }}>✏️</span>
                      <span>Rename Operator Profile</span>
                    </div>
                    <div
                      className="popover-menu-item"
                      style={{ color: '#c084fc', borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: 4 }}
                      onClick={() => {
                        setIsAuthenticated(false);
                        localStorage.removeItem('t2o_auth_token');
                        setCurrentView('landing');
                        setIsProfileOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <span style={{ fontSize: 14 }}>🚪</span>
                      <span>Sign Out & Return to Landing</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>


        {/* Main Page Body (Dedicated Institutional Cockpit Views) */}
        <main
          style={{
            flex: 1,
            padding: '24px 36px 48px 36px',
            maxWidth: 1720,
            width: '100%',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
          }}
        >
          {activeTab === 'terminal' && (
            <MarketTerminalPage
              snapshot={snapshot}
              indicators={indicators}
              regime={regime}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              onRefresh={() => loadData()}
              loading={loading}
              onOpenLab={() => setIsLabOpen(true)}
            />
          )}
          {activeTab === 'regime' && (
            <MomentumRegimePage regime={regime} indicators={indicators} />
          )}
        {activeTab === 'entry' && (
          <EntryTimingPage indicators={indicators} />
        )}
        {activeTab === 'forecast' && (
          <ForecastStudioPage />
        )}
        {activeTab === 'topology' && (
          <ObsidianAgentGraph currentPrice={snapshot?.latest_candle?.close || 81681.69} />
        )}
        {activeTab === 'research' && (
          <ResearchIntelligencePage />
        )}
        {activeTab === 'options' && (
          <OptionsOverlayPage />
        )}
        {activeTab === 'backtest' && (
          <BacktestLabPage />
        )}
        {activeTab === 'ea' && (
          <EAMonitorPage />
        )}
        {activeTab === 'audit' && (
          <AuditIntegrationsPage />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--text-dim)',
          flexWrap: 'wrap',
          gap: 12,
          position: 'relative',
          zIndex: 10
        }}
      >
        <div>
          Trade2Options Systematic Microbot &copy; 2026 | Built for Institutional Quant Research & MT5 Independent Execution.
        </div>
        <div style={{ display: 'flex', gap: 18, color: 'var(--text-muted)' }}>
          <span>Primary Trend: <strong style={{ color: 'var(--text-main)' }}>EMA 20/50/200</strong></span>
          <span>Advisory Timing: <strong style={{ color: 'var(--text-main)' }}>EMA 9/21/200</strong></span>
          <span>Execution: <strong style={{ color: 'var(--accent-orange-bright)' }}>MT5 Standalone</strong> (Zero External Dependency)</span>
        </div>
      </footer>
      </div>

      {/* Floating Unclipped Tooltip for Sidebar Icons */}
      {sidebarTooltip && (
        <div
          className="sidebar-floating-tooltip"
          style={{ top: sidebarTooltip.top }}
        >
          <span>{sidebarTooltip.label}</span>
          <span className="sidebar-tooltip-shortcut">{sidebarTooltip.shortcut}</span>
        </div>
      )}

      {/* Instant Visual Theme Switch Toast */}
      {themeToast && (
        <div className="theme-toast">
          <span>{theme === 'light' ? '☀️' : '🌙'}</span>
          <span>{themeToast}</span>
        </div>
      )}

      {/* Signal & Execution Lab Modal */}
      <SignalLabModal
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
        timeframe={timeframe}
      />

      {/* Auth Modal if triggered in Cockpit */}
      <QuantumAuthModal
        isOpen={isAuthOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(name) => {
          setOperatorName(name);
          setIsAuthenticated(true);
          localStorage.setItem('t2o_auth_token', 'true');
          setIsAuthOpen(false);
        }}
      />

      {/* Floating Global View Switcher Dock */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 28,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 8px',
          borderRadius: 9999,
          background: 'rgba(5, 1, 10, 0.94)',
          border: '1.5px solid rgba(172, 88, 233, 0.55)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.85), 0 0 25px rgba(172, 88, 233, 0.35)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <button
          onClick={() => switchView('landing')}
          style={{
            padding: '8px 18px',
            borderRadius: 9999,
            background: 'transparent',
            color: '#cbd5e1',
            border: 'none',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease'
          }}
        >
          <span>🌐</span>
          <span>Neura-Flow Landing</span>
        </button>
        <button
          onClick={() => switchView('cockpit')}
          style={{
            padding: '8px 18px',
            borderRadius: 9999,
            background: 'linear-gradient(135deg, #AC58E9 0%, #7928ca 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 0 15px rgba(172, 88, 233, 0.5)',
            transition: 'all 0.2s ease'
          }}
        >
          <span>⚡</span>
          <span>Institutional Terminal</span>
        </button>
      </div>
    </div>
  );
};
