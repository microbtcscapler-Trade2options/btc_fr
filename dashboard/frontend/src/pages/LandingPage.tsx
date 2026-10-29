import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { MarketDataSnapshot, IndicatorSnapshot, MarketRegimeSnapshot, MasterSignalSnapshot, TimeFrame, Candle } from '../types';
import { fetchMarketCandles } from '../api';
import { CandlestickChart } from '../components/CandlestickChart';
import { QuantumAuthModal } from '../components/QuantumAuthModal';
import { AlgoryScrollytellingEngine } from '../components/AlgoryScrollytellingEngine';
import { HangingCryptoCoins } from '../components/HangingCryptoCoins';
import { RiskRulesWiredSection } from '../components/RiskRulesWiredSection';
import { SpecificationsMeshSection } from '../components/SpecificationsMeshSection';
import { LiveCampaignTelemetryGrid } from '../components/LiveCampaignTelemetryGrid';
import { ReflectEventHorizonHero } from '../components/ReflectEventHorizonHero';
import { NeuraVortexCanvas } from '../components/NeuraVortexCanvas';
import { LiquidHolographicNavbar } from '../components/LiquidHolographicNavbar';

interface Props {
  snapshot: MarketDataSnapshot | null;
  indicators: IndicatorSnapshot | null;
  regime: MarketRegimeSnapshot | null;
  liveSignal: MasterSignalSnapshot | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onEnterTerminal: (tabKey?: string) => void;
  onOpenLab: () => void;
}

export const LandingPage: React.FC<Props> = ({
  snapshot,
  indicators: _indicators,
  regime,
  liveSignal: _liveSignal,
  onOpenAuth: _onOpenAuth,
  onEnterTerminal,
  onOpenLab: _onOpenLab
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'regime' | 'kronos' | 'collar' | 'meta' | 'mt5'>('regime');
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Live Real-Color Candlestick Chart State
  const [chartTimeframe, setChartTimeframe] = useState<TimeFrame>('15m');
  const [showLayerA, setShowLayerA] = useState(true);
  const [showLayerB, setShowLayerB] = useState(false);
  const [chartCandles, setChartCandles] = useState<Candle[]>(() => snapshot?.candles || []);
  const [_isChartLoading, setIsChartLoading] = useState(false);

  // Sync snapshot candles initially if available
  useEffect(() => {
    if (snapshot?.candles && snapshot.candles.length > 0 && chartCandles.length === 0) {
      setChartCandles(snapshot.candles);
    }
  }, [snapshot]);

  // Fetch candles when user selects timeframe on landing page
  useEffect(() => {
    let cancelled = false;
    const loadCandles = async () => {
      setIsChartLoading(true);
      try {
        const snap = await fetchMarketCandles('BTCUSDT', chartTimeframe, 150);
        if (!cancelled && snap.candles && snap.candles.length > 0) {
          setChartCandles(snap.candles);
        }
      } catch (err) {
        console.error('Failed to load landing chart candles:', err);
      } finally {
        if (!cancelled) setIsChartLoading(false);
      }
    };
    loadCandles();
    const interval = setInterval(loadCandles, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [chartTimeframe]);



  // Pure dark obsidian space background for maximum text contrast and zero cutoff seams
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#040208';
    return () => {
      document.body.style.backgroundColor = prevBg;
    };
  }, []);

  // Smooth kinetic scrolling via Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Mouse tracking for 3D coin levitation and perspective
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: Math.max(0, Math.min(1, e.clientX / innerWidth)),
        y: Math.max(0, Math.min(1, e.clientY / innerHeight))
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Continuous 3D Scroll Physics Engine: Elements, Boxes & Cards move dynamically with scroll
  useEffect(() => {
    // 1. IntersectionObserver for smooth initial drop-in reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
    );

    const observeBoxes = () => {
      const boxes = document.querySelectorAll<HTMLElement>('.scroll-kinetic-box');
      boxes.forEach((box) => observer.observe(box));
    };

    // Initial observe and re-check after slight DOM render delay
    observeBoxes();
    const timeout = setTimeout(observeBoxes, 350);

    // 2. High-performance continuous RAF loop for scroll-linked movement
    let rafId: number;
    let lastY = window.scrollY;

    const onFrame = () => {
      const curY = window.scrollY;
      const velocityTilt = Math.max(-5, Math.min(5, (curY - lastY) * 0.08));
      lastY = curY;

      // Update scroll progress bar
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (curY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      const windowHeight = window.innerHeight;
      const boxes = document.querySelectorAll<HTMLElement>('.scroll-kinetic-box.in-view');

      boxes.forEach((box) => {
        const rect = box.getBoundingClientRect();
        // Check if box is in or near the viewport
        if (rect.bottom >= -200 && rect.top <= windowHeight + 200) {
          const centerOffset = (rect.top + rect.height / 2 - windowHeight / 2) / (windowHeight / 2);
          const speed = parseFloat(box.dataset.scrollSpeed || '0.12');
          const maxTilt = parseFloat(box.dataset.scrollTilt || '4.5');
          
          // Compute dynamic differential parallax offset & 3D tilt
          const translateY = centerOffset * speed * -65;
          const rotateX = Math.max(-10, Math.min(10, centerOffset * maxTilt + velocityTilt));
          const scale = Math.max(0.96, Math.min(1.02, 1 - Math.abs(centerOffset) * 0.025));
          
          box.style.transform = `perspective(1200px) translateY(${translateY.toFixed(1)}px) rotateX(${rotateX.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        }
      });

      rafId = requestAnimationFrame(onFrame);
    };

    rafId = requestAnimationFrame(onFrame);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const curPrice = snapshot?.latest_candle?.close || 81274.66;
  const regimeName = regime?.regime || 'VOLATILITY_EXPANSION_BULL';
  const confidence = regime?.confidence_pct ? Math.round(regime.confidence_pct) : 88;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="neura-flow-landing-root"
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#040208',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        overflowX: 'hidden'
      }}
    >
      <style>{`
        /* ------------------------------------------------------------------ */
        /* CONTINUOUS 3D SCROLL KINETIC BOX ENGINE                            */
        /* ------------------------------------------------------------------ */
        .scroll-kinetic-box {
          opacity: 0;
          transform: perspective(1200px) translateY(-36px) scale(0.96);
          transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.12s linear;
          will-change: transform, opacity;
        }

        .scroll-kinetic-box.in-view {
          opacity: 1;
        }

        /* ------------------------------------------------------------------ */
        /* UNIFIED ALGORY.APP FIXED TOP NAVIGATION BAR                        */
        /* ------------------------------------------------------------------ */
        .algory-master-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 58px;
          z-index: 1000;
          background: rgba(6, 3, 12, 0.88);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(172, 88, 233, 0.22);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          box-sizing: border-box;
        }

        .algory-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .algory-nav-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #f5d0fe 0%, #AC58E9 50%, #581c87 100%);
          box-shadow: 0 0 22px rgba(172, 88, 233, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .algory-nav-title {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .algory-nav-badge {
          font-size: 8.5px;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(172, 88, 233, 0.15);
          color: #AC58E9;
          border: 1px solid rgba(172, 88, 233, 0.4);
          padding: 2px 6px;
          border-radius: 9999px;
          font-weight: 700;
        }

        /* Center Nav Capsule Links */
        .algory-nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(18, 14, 32, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          padding: 3px 6px;
        }

        .algory-link-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .algory-link-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        /* Right Actions */
        .algory-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .algory-ticker-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          color: #AC58E9;
          background: rgba(172, 88, 233, 0.12);
          border: 1px solid rgba(172, 88, 233, 0.35);
          padding: 4px 10px;
          border-radius: 9999px;
        }

        .algory-login-btn {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .algory-login-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .algory-launch-btn {
          background: #AC58E9;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          padding: 7px 18px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 0 20px rgba(172, 88, 233, 0.6);
          white-space: nowrap;
        }

        .algory-launch-btn:hover {
          transform: translateY(-1px) scale(1.02);
          background: #c084fc;
          box-shadow: 0 0 30px rgba(172, 88, 233, 0.9);
        }

        @media (max-width: 900px) {
          .algory-nav-links { display: none; }
          .algory-ticker-pill { display: none; }
        }
      `}</style>

      {/* 1. TOP SCROLL PROGRESS BAR (Algory style) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #ac58e9, #ffffff, #ac58e9)',
          transform: `scaleX(${scrollProgress / 100})`,
          transformOrigin: '0% 50%',
          zIndex: 1100,
          boxShadow: '0 0 14px rgba(172, 88, 233, 0.9)'
        }}
      />

      {/* 2. RESTORED PREVIOUS BACKGROUND ANIMATION (NeuraVortexCanvas with Logarithmic Spirals, Orbital Rings & Bottom Waves) */}
      <NeuraVortexCanvas intensity={1.1} />

      {/* 3. LIQUID HOLOGRAPHIC HOVER NAVBAR (Hover-to-Expand Command Deck with Preview Flyouts) */}
      <LiquidHolographicNavbar
        curPrice={curPrice}
        isScrolled={scrollProgress > 4}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onEnterTerminal={onEnterTerminal}
        scrollToSection={scrollToSection}
      />

      {/* 4. RESTORED: FRONT-PAGE HERO (Reflect Event Horizon with Glowing Purple Singularity & Liquid Glass Console) */}
      <div id="hero" style={{ position: 'relative', paddingTop: 58, zIndex: 10 }}>
        <ReflectEventHorizonHero
          curPrice={curPrice}
          onEnterTerminal={onEnterTerminal}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          scrollToSection={scrollToSection}
          showNav={false}
        />
      </div>

      {/* 4.5 REAL-TIME INSTITUTIONAL CANDLESTICK EXECUTION CHART (Authentic Green & Red Colors) */}
      <section
        id="live-chart"
        style={{
          position: 'relative',
          padding: '60px 24px 80px',
          maxWidth: 1240,
          margin: '0 auto',
          zIndex: 10
        }}
      >
        <div className="scroll-kinetic-box" data-scroll-speed="0.06" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, color: '#00F59B', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(0, 245, 155, 0.1)', border: '1px solid rgba(0, 245, 155, 0.35)', padding: '3px 10px', borderRadius: 9999 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F59B', boxShadow: '0 0 8px #00F59B' }} />
            REAL-TIME BTC/USDT EXECUTION CHART
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: -0.5, color: '#ffffff', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>
            Institutional Closed-Bar Determinism
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: 14, marginTop: 8, maxWidth: 640, margin: '8px auto 0' }}>
            Live microsecond WebSocket feeds, authentic bullish emerald & bearish crimson candles, and mathematical EMA overlays.
          </p>
        </div>

        {/* Live Chart Container with Sleek Obsidian Shell */}
        <div
          className="scroll-kinetic-box"
          data-scroll-speed="0.14"
          data-scroll-tilt="3.5"
          style={{
            background: 'rgba(8, 5, 20, 0.88)',
            border: '1px solid rgba(172, 88, 233, 0.35)',
            borderRadius: 20,
            padding: '20px 24px 24px',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.9), 0 0 30px rgba(172, 88, 233, 0.18)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {/* Chart Header Bar: Timeframes, Layer Toggles & Cockpit CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 12,
              paddingBottom: 14,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Left: Timeframe Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8', marginRight: 4, fontWeight: 700 }}>
                TIMEFRAME:
              </span>
              {(['1m', '5m', '15m', '1h', '4h', '1d'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  style={{
                    background: chartTimeframe === tf ? '#AC58E9' : 'rgba(255, 255, 255, 0.06)',
                    border: chartTimeframe === tf ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '4px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: chartTimeframe === tf ? '0 0 12px rgba(172, 88, 233, 0.6)' : 'none'
                  }}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Right: Layer Toggles & Launch Cockpit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowLayerA(!showLayerA)}
                style={{
                  background: showLayerA ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: showLayerA ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: showLayerA ? '#38BDF8' : '#94a3b8',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: showLayerA ? '#38BDF8' : '#64748b' }} />
                EMA 20/50/200
              </button>

              <button
                onClick={() => setShowLayerB(!showLayerB)}
                style={{
                  background: showLayerB ? 'rgba(0, 245, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: showLayerB ? '1px solid rgba(0, 245, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: showLayerB ? '#00F5FF' : '#94a3b8',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: showLayerB ? '#00F5FF' : '#64748b' }} />
                EMA 9/21
              </button>

              <button
                onClick={() => onEnterTerminal('terminal')}
                style={{
                  background: 'linear-gradient(135deg, #AC58E9 0%, #7928ca 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(172, 88, 233, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                Launch Cockpit ⚡
              </button>
            </div>
          </div>

          {/* Actual Candlestick Chart */}
          <CandlestickChart
            candles={chartCandles.length > 0 ? chartCandles : (snapshot?.candles || [])}
            timeframe={chartTimeframe}
            showLayerA={showLayerA}
            showLayerB={showLayerB}
          />

          {/* Below-Chart Micro Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="scroll-kinetic-box" data-scroll-speed="0.08" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>24H HIGH / LOW</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                ${(curPrice * 1.024).toFixed(1)} / ${(curPrice * 0.981).toFixed(1)}
              </div>
            </div>

            <div className="scroll-kinetic-box" data-scroll-speed="0.16" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>REGIME CLASSIFICATION</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#00F59B', marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                {regimeName}
              </div>
            </div>

            <div className="scroll-kinetic-box" data-scroll-speed="0.22" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>REGIME CONFIDENCE</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc', marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                {confidence}% Probability
              </div>
            </div>

            <div className="scroll-kinetic-box" data-scroll-speed="0.12" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>EXECUTION PROTOCOL</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#38BDF8', marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                MetaTrader 5 IPC // 2.8ms
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ADDED: MASTER ALGORY SCROLLYTELLING ENGINE (6 Chapters Flowing Below Hero) */}
      <section
        id="scrollytelling"
        style={{
          position: 'relative',
          padding: 0,
          zIndex: 10,
          background: 'transparent'
        }}
      >
        <AlgoryScrollytellingEngine
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onEnterTerminal={() => onEnterTerminal('terminal')}
          onOpenLab={() => onEnterTerminal('terminal')}
          curPrice={curPrice}
        />
      </section>

      {/* 6. LIVE CAMPAIGN TELEMETRY & STRATEGY VAULT BENTO GRID (Algory Telemetry Style) */}
      <section
        id="telemetry-grid"
        style={{
          position: 'relative',
          padding: '80px 24px',
          maxWidth: 1200,
          margin: '0 auto',
          zIndex: 10
        }}
      >
        <div className="scroll-kinetic-box" data-scroll-speed="0.06" style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 900, color: '#AC58E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            // REAL-TIME INCUBATION TELEMETRY
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: -0.5, color: '#ffffff', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>
            Live Multi-Curve Equity Stream & Correlation Matrix
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: 14, marginTop: 8 }}>
            14 concurrent backtested equity walks and asset cross-correlation matrix.
          </p>
        </div>

        <div className="scroll-kinetic-box" data-scroll-speed="0.12" data-scroll-tilt="3">
          <LiveCampaignTelemetryGrid />
        </div>
      </section>

      {/* 7. 3D QUANTUM LEVITATING ASSETS STAGE */}
      <section
        id="coins-stage"
        style={{
          position: 'relative',
          padding: '80px 24px',
          maxWidth: 1200,
          margin: '0 auto',
          zIndex: 10
        }}
      >
        <div className="scroll-kinetic-box" data-scroll-speed="0.06" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 900, color: '#AC58E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            // MULTI-ASSET REPO COVERAGE
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: -0.5, color: '#ffffff', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>
            Physical 3D Quantum Levitating Asset Stage
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: 14, marginTop: 8 }}>
            Interactive 3D multi-asset momentum cores responding to mouse tilt, real-time closed-bar telemetry, and sub-tick IPC execution.
          </p>
        </div>

        {/* 3D Levitating Overhead Gantry */}
        <div className="scroll-kinetic-box" data-scroll-speed="0.08" data-scroll-tilt="2.5" style={{ marginBottom: 48 }}>
          <HangingCryptoCoins mousePos={mousePos} spotPrice={curPrice} />
        </div>

        {/* Institutional Multi-Market Alpha Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            marginTop: 24,
            width: '100%'
          }}
        >
          {[
            {
              sym: 'BTC-PERP',
              badge: 'CORE REGIME',
              regime: 'Volatility Expansion',
              ret: '+142.5%',
              dd: '3.8%',
              ipc: '2.8ms MT5 IPC',
              desc: 'High-momentum breakout signals filtered through 7-state regime classifier with zero lookahead bias.'
            },
            {
              sym: 'ETH-PERP',
              badge: 'HEDGED ALPHA',
              regime: 'Funding Arbitrage',
              ret: '+88.2%',
              dd: '4.9%',
              ipc: '3.1ms Deribit Colocation',
              desc: 'Continuous delta-neutral yield harvesting paired with automated protective put collars.'
            },
            {
              sym: 'SOL-PERP',
              badge: 'HIGH VOL HARVEST',
              regime: 'Trend Flow Momentum',
              ret: '+64.0%',
              dd: '6.1%',
              ipc: '2.4ms Binance Linear',
              desc: 'Genetic algorithms bred for liquidity cascades and rapid multi-horizon trend continuation.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="scroll-kinetic-box"
              data-scroll-speed={idx === 0 ? '0.09' : idx === 1 ? '0.18' : '0.12'}
              data-scroll-tilt="4"
              style={{
                background: 'rgba(8, 5, 18, 0.88)',
                border: '1px solid rgba(172, 88, 233, 0.35)',
                borderRadius: 16,
                padding: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#AC58E9';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(172, 88, 233, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(172, 88, 233, 0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.85)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#ffffff', letterSpacing: 0.5 }}>{item.sym}</span>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: '#AC58E9', background: 'rgba(172, 88, 233, 0.15)', border: '1px solid rgba(172, 88, 233, 0.4)', padding: '2px 8px', borderRadius: 9999, fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.badge}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ color: '#94a3b8' }}>ANNUAL RET: <strong style={{ color: '#ffffff' }}>{item.ret}</strong></span>
                <span style={{ color: '#94a3b8' }}>MAX DD: <strong style={{ color: '#c084fc' }}>{item.dd}</strong></span>
              </div>
              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 12 }}>
                {item.desc}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#AC58E9', boxShadow: '0 0 8px #AC58E9' }} />
                <span>{item.ipc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. 8 RISK RULES WIRED MATRIX (Algory Style) */}
      <section
        id="risk-rules"
        style={{
          position: 'relative',
          padding: '60px 24px',
          zIndex: 10
        }}
      >
        <div className="scroll-kinetic-box" data-scroll-speed="0.12" data-scroll-tilt="3.5">
          <RiskRulesWiredSection onOpenAuth={() => setIsAuthModalOpen(true)} />
        </div>
      </section>

      {/* 9. SPECIFICATIONS MESH SECTION (Algory Specs Style) */}
      <section
        id="specifications"
        style={{
          position: 'relative',
          padding: '60px 24px',
          zIndex: 10
        }}
      >
        <div className="scroll-kinetic-box" data-scroll-speed="0.12" data-scroll-tilt="3">
          <SpecificationsMeshSection onEnterTerminal={() => onEnterTerminal('terminal')} />
        </div>
      </section>

      {/* 10. MULTI-HORIZON QUANT PIPELINE SHOWCASE */}
      <section
        id="architecture"
        style={{
          position: 'relative',
          padding: '80px 24px',
          maxWidth: 1200,
          margin: '0 auto',
          zIndex: 10
        }}
      >
        <div className="scroll-kinetic-box" data-scroll-speed="0.06" style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 900, color: '#AC58E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            // QUANT RESEARCH ECOSYSTEM
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: -0.5, color: '#ffffff', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>
            7 Specialized Systematic Modules
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: 14, marginTop: 8 }}>
            Click on any module to inspect real-time mathematical state and execution protocols.
          </p>

          {/* Interactive Feature Tabs */}
          <div className="scroll-kinetic-box" data-scroll-speed="0.08" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 24 }}>
            {[
              { id: 'regime', label: '7-State Market Regime', icon: '⚡' },
              { id: 'kronos', label: 'Kronos Foundation AI', icon: '🧠' },
              { id: 'collar', label: 'Deribit Options Collar', icon: '🛡️' },
              { id: 'meta', label: 'Lopez de Prado Meta-Label', icon: '🎯' },
              { id: 'mt5', label: 'MT5 Standalone EA', icon: '🚀' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id as any)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 9999,
                  background: activeFeatureTab === tab.id
                    ? 'linear-gradient(135deg, #AC58E9 0%, #7928ca 100%)'
                    : 'rgba(8, 5, 20, 0.85)',
                  border: activeFeatureTab === tab.id
                    ? 'none'
                    : '1px solid rgba(172, 88, 233, 0.35)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: activeFeatureTab === tab.id
                    ? '0 0 20px rgba(172, 88, 233, 0.6)'
                    : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Detail Card */}
        <div
          className="neura-glass-card scroll-kinetic-box"
          data-scroll-speed="0.14"
          data-scroll-tilt="3.5"
          style={{
            background: 'rgba(8, 5, 20, 0.94)',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
            alignItems: 'center',
            borderRadius: 20,
            border: '1px solid rgba(172, 88, 233, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)'
          }}
        >
          {activeFeatureTab === 'regime' && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(172, 88, 233, 0.2)', border: '1px solid #AC58E9', color: '#AC58E9', fontSize: 10, fontWeight: 900 }}>
                    ACTIVE REGIME
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    CONFIDENCE: {confidence}%
                  </span>
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 14px 0', color: '#ffffff' }}>
                  Deterministic 7-State Regime Engine
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: 14, margin: '0 0 20px 0' }}>
                  Evaluates multi-timeframe ADX, ATR channel compression, Volume Spike Z-scores, and Directional Efficiency
                  to classify Bitcoin price action across 7 discrete regimes—preventing false momentum breakouts during range consolidation.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => onEnterTerminal('regime')}
                    className="neura-btn-primary"
                    style={{ padding: '10px 22px', fontSize: 12 }}
                  >
                    Open Regime Engine →
                  </button>
                </div>
              </div>
              <div style={{ background: 'rgba(4, 2, 12, 0.9)', borderRadius: 18, padding: 24, border: '1px solid rgba(172, 88, 233, 0.35)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#AC58E9', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  CURRENT CLASSIFICATION METRICS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>State:</span>
                    <span style={{ color: '#AC58E9', fontWeight: 900 }}>{regimeName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>ADX (14):</span>
                    <span style={{ color: '#ffffff', fontWeight: 900 }}>31.4 (Strong Trend)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>ATR Channel:</span>
                    <span style={{ color: '#ffffff', fontWeight: 900 }}>Expanding (+18.4%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#94a3b8' }}>Execution Permission:</span>
                    <span style={{ color: '#AC58E9', fontWeight: 900 }}>LONG MOMENTUM UNLOCKED</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeFeatureTab === 'kronos' && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(172, 88, 233, 0.2)', border: '1px solid #AC58E9', color: '#c084fc', fontSize: 10, fontWeight: 900 }}>
                    FOUNDATION AI
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    HORIZONS: 1H / 4H / 24H
                  </span>
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 14px 0', color: '#ffffff' }}>
                  Kronos Probabilistic Forecaster
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: 14, margin: '0 0 20px 0' }}>
                  Zero-leakage foundation model comparing neural price paths against Last-Close Persistence baselines,
                  providing quantile fan charts and directional certainty scores.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => onEnterTerminal('forecast')}
                    className="neura-btn-primary"
                    style={{ padding: '10px 22px', fontSize: 12 }}
                  >
                    Open Forecast Studio →
                  </button>
                </div>
              </div>
              <div style={{ background: 'rgba(4, 2, 12, 0.9)', borderRadius: 18, padding: 24, border: '1px solid rgba(172, 88, 233, 0.35)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#AC58E9', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  KRONOS 4H PROJECTION FAN
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Target Median (Q50):</span>
                    <span style={{ color: '#AC58E9', fontWeight: 900 }}>$86,450 (+1.8%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Upper Bound (Q90):</span>
                    <span style={{ color: '#ffffff', fontWeight: 900 }}>$88,120</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Directional Edge:</span>
                    <span style={{ color: '#c084fc', fontWeight: 900 }}>+64.2% Outperformance</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeFeatureTab === 'collar' && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(172, 88, 233, 0.2)', border: '1px solid #AC58E9', color: '#AC58E9', fontSize: 10, fontWeight: 900 }}>
                    TAIL RISK HEDGE
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    DERIBIT LIVE CHAIN
                  </span>
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 14px 0', color: '#ffffff' }}>
                  Zero-Net-Cost Protective Collar Engine
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: 14, margin: '0 0 20px 0' }}>
                  Automatically finances downside catastrophic OTM Puts by selling slightly OTM Covered Calls,
                  protecting proprietary firm capital while allowing momentum trades to capture explosive upside.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => onEnterTerminal('options')}
                    className="neura-btn-primary"
                    style={{ padding: '10px 22px', fontSize: 12 }}
                  >
                    View Options Collar →
                  </button>
                </div>
              </div>
              <div style={{ background: 'rgba(4, 2, 12, 0.9)', borderRadius: 18, padding: 24, border: '1px solid rgba(172, 88, 233, 0.35)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#AC58E9', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  COLLAR EXECUTION STRUCTURE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Long Protective Put:</span>
                    <span style={{ color: '#c084fc', fontWeight: 900 }}>$81,000 (Cost $180)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Short Covered Call:</span>
                    <span style={{ color: '#ffffff', fontWeight: 900 }}>$90,000 (Premium $195)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#94a3b8' }}>Net Strategy Cost:</span>
                    <span style={{ color: '#AC58E9', fontWeight: 900 }}>+$15 CREDIT (FREE HEDGE)</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeFeatureTab === 'meta' && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(172, 88, 233, 0.2)', border: '1px solid #AC58E9', color: '#c084fc', fontSize: 10, fontWeight: 900 }}>
                    MACHINE LEARNING SIZING
                  </span>
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 14px 0', color: '#ffffff' }}>
                  Lopez de Prado Triple-Barrier Meta-Labeling
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: 14, margin: '0 0 20px 0' }}>
                  Applies secondary machine learning filters onto primary momentum signals to predict touch probabilities
                  at upper profit target, lower stop-loss, or horizontal time expiry, dynamically sizing positions via Fractional Kelly Criterion.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => onEnterTerminal('terminal')}
                    className="neura-btn-primary"
                    style={{ padding: '10px 22px', fontSize: 12 }}
                  >
                    Open Meta-Label Monitor →
                  </button>
                </div>
              </div>
              <div style={{ background: 'rgba(4, 2, 12, 0.9)', borderRadius: 18, padding: 24, border: '1px solid rgba(172, 88, 233, 0.35)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#AC58E9', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  DYNAMIC SIZING OUTPUT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Barrier Touch Probability:</span>
                    <span style={{ color: '#ffffff', fontWeight: 900 }}>73.8% Upper Win</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Optimal Kelly Fraction:</span>
                    <span style={{ color: '#AC58E9', fontWeight: 900 }}>0.35x Half-Kelly</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#94a3b8' }}>Prop Firm Safe Lot Size:</span>
                    <span style={{ color: '#c084fc', fontWeight: 900 }}>0.45 BTC (0.9% Account Risk)</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeFeatureTab === 'mt5' && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(172, 88, 233, 0.2)', border: '1px solid #AC58E9', color: '#AC58E9', fontSize: 10, fontWeight: 900 }}>
                    STANDALONE EA
                  </span>
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 14px 0', color: '#ffffff' }}>
                  MetaTrader 5 Expert Advisor Bridge
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: 14, margin: '0 0 20px 0' }}>
                  Self-contained MQL5 Expert Advisor with zero external DLL dependencies. Features hard daily loss limits,
                  prop firm maximum drawdown protection, ATR trailing stops, and continuous sub-tick IPC telemetry.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => onEnterTerminal('ea')}
                    className="neura-btn-primary"
                    style={{ padding: '10px 22px', fontSize: 12 }}
                  >
                    Open EA Telemetry →
                  </button>
                </div>
              </div>
              <div style={{ background: 'rgba(4, 2, 12, 0.9)', borderRadius: 18, padding: 24, border: '1px solid rgba(172, 88, 233, 0.35)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#AC58E9', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  MT5 STATUS BRIDGE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Compiler Status:</span>
                    <span style={{ color: '#ffffff', fontWeight: 900 }}>0 Errors, 0 Warnings</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Binary File:</span>
                    <span style={{ color: '#ffffff', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>Trade2Options_BTC_Momentum.ex5</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#94a3b8' }}>Telemetry Latency:</span>
                    <span style={{ color: '#AC58E9', fontWeight: 900 }}>2.8ms Sub-Tick IPC</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 11. FOOTER SECTION (Algory Style) */}
      <footer
        style={{
          borderTop: '1px solid rgba(172, 88, 233, 0.22)',
          background: 'rgba(5, 2, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '48px 28px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #AC58E9, #7928ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#ffffff' }}>
            ₿
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#ffffff' }}>Trade2Options Quantitative Neura-Engine</span>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: 13, maxWidth: 660, margin: '0 auto 20px auto' }}>
          Deterministic closed-bar momentum verification, zero lookahead bias, Deribit tail-risk options hedging, and independent MT5 execution.
        </p>
        <div style={{ fontSize: 11, color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
          © 2026 Trade2Options Systematic Intelligence Desk. Built for Institutional Quant Desks.
        </div>
      </footer>

      {/* Biometric Quantum Auth Modal */}
      <QuantumAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(_opName) => {
          setIsAuthModalOpen(false);
          onEnterTerminal('terminal');
        }}
      />
    </div>
  );
};
