import React, { useState, useEffect, useRef } from 'react';

export type AlgoryAct = 'deck' | 'campaign' | 'vault' | 'portfolios' | 'automation' | 'insights';

export const actList: AlgoryAct[] = ['deck', 'campaign', 'vault', 'portfolios', 'automation', 'insights'];
export const getActIndex = (act: AlgoryAct): number => actList.indexOf(act) + 1;

export const storyContent: Record<AlgoryAct, { title: string; highlight: string; desc: string; stat: string }> = {
  deck: {
    title: 'Trading strategies that',
    highlight: 'survive live.',
    desc: 'Continuous closed-bar quantitative momentum discovery across Binance Linear, Deribit, and MetaTrader 5 with zero lookahead bias.',
    stat: '14,948 GENOMES'
  },
  campaign: {
    title: 'The engine breeds strategies',
    highlight: 'in tribes.',
    desc: 'Thousands of random genomes go in. Two tribes, Consistency and Growth, breed them for twenty generations each, then a Final War merges the pools.',
    stat: 'GEN 18/20 · SCORE 9.42'
  },
  vault: {
    title: 'Survivors face data they have',
    highlight: 'never seen.',
    desc: 'Memorising the past gets a strategy killed. Four statistical gates stand between a candidate and the vault, with held-out out-of-sample data.',
    stat: '38/40 GATES PASSED'
  },
  portfolios: {
    title: 'Every survivor gets',
    highlight: 'a passport.',
    desc: 'Everything that survived carries full equity curves with marked held-out bounds, execution slippage tolerances, and verifiable genome signatures.',
    stat: 'SHARPE 2.84 · +38.2%'
  },
  automation: {
    title: 'Portfolios built not to',
    highlight: 'sink together.',
    desc: 'Ten copies of the same trade in different clothes is not diversification. Diversity grade takes the worst of 5 axes with live simulated equity.',
    stat: '24/7 IPC CLOCK SYNCED'
  },
  insights: {
    title: 'Autonomous execution schedules,',
    highlight: 'zero intervention.',
    desc: 'Automated synthesis sweeps, decorrelation clustering, and auto-purging of degrading models into quarantine with sub-10ms circuit breakers.',
    stat: 'SUB-10MS MT5 BRIDGE'
  }
};

interface Props {
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onEnterTerminal?: () => void;
  onOpenLab?: () => void;
  curPrice?: number;
}

export const AlgoryScrollytellingEngine: React.FC<Props> = ({
  onOpenAuth,
  onEnterTerminal,
  onOpenLab: _onOpenLab,
  curPrice = 81274.66
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeAct, setActiveAct] = useState<AlgoryAct>('deck');
  const [scrollProgress, setScrollProgress] = useState(0);

  // References for Stage Visual Canvases
  const fanCanvasRef = useRef<HTMLCanvasElement>(null);
  const coreCanvasRef = useRef<HTMLCanvasElement>(null);
  const helixCanvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Parallax Mouse Tracking
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Live real-time ticker states
  const [liveClock, setLiveClock] = useState('14:30:00');
  const [strategiesBred, setStrategiesBred] = useState(14823);
  const [powerMode, setPowerMode] = useState<'eco' | 'balanced' | 'max'>('max');
  const [smartMode, setSmartMode] = useState(true);

  // Interactive toggle states for Automation Act
  const [autoToggles, setAutoToggles] = useState({
    nightly: true,
    replaceWatch: true,
    weekend: true,
    metals: false
  });

  const toggleAuto = (key: keyof typeof autoToggles) => {
    setAutoToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Shockwave expanding ripples
  const [shockwaves, setShockwaves] = useState<Array<{ id: number; color: string; x: number; y: number }>>([]);

  const triggerShockwave = (color = '#AC58E9') => {
    const id = Date.now() + Math.random();
    setShockwaves((prev) => [...prev.slice(-3), { id, color, x: 50, y: 50 }]);
    setTimeout(() => {
      setShockwaves((prev) => prev.filter((w) => w.id !== id));
    }, 1200);
  };

  // Mouse move handler for 3D stage tilt
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

  // Live Strategy Breeding Increment & Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setStrategiesBred((prev) => prev + Math.floor(Math.random() * 3) + 1);
      const now = new Date();
      setLiveClock(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Canvas 1: Live Neural Core Canvas (Radar rings + firing synapse beams)
  useEffect(() => {
    const canvas = coreCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const synapses: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }> = [];

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.42;

      // 3 Concentric Rotating Rings
      for (let i = 1; i <= 3; i++) {
        const ringR = baseR * (0.35 + i * 0.22);
        const dir = i % 2 === 0 ? 1 : -1;
        const rot = t * 0.7 * dir;

        ctx.beginPath();
        ctx.arc(cx, cy, ringR, rot, rot + Math.PI * 1.6);
        ctx.strokeStyle = i === 3 ? '#ffffff' : i === 2 ? '#AC58E9' : '#c084fc';
        ctx.lineWidth = i === 3 ? 2 : 1.2;
        ctx.stroke();

        const nx = cx + Math.cos(rot) * ringR;
        const ny = cy + Math.sin(rot) * ringR;
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // Add random firing synapse laser links
      if (Math.random() < 0.12) {
        const a1 = Math.random() * Math.PI * 2;
        const a2 = Math.random() * Math.PI * 2;
        const r1 = baseR * (0.4 + Math.random() * 0.5);
        const r2 = baseR * (0.4 + Math.random() * 0.5);
        synapses.push({
          x1: cx + Math.cos(a1) * r1,
          y1: cy + Math.sin(a1) * r1,
          x2: cx + Math.cos(a2) * r2,
          y2: cy + Math.sin(a2) * r2,
          alpha: 1.0
        });
      }

      // Render firing synapses
      for (let i = synapses.length - 1; i >= 0; i--) {
        const s = synapses[i];
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.strokeStyle = `rgba(172, 88, 233, ${s.alpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        s.alpha -= 0.04;
        if (s.alpha <= 0) synapses.splice(i, 1);
      }

      // Center glowing core
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#AC58E9';
      ctx.shadowColor = '#AC58E9';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Canvas 2: Live 3D DNA Double Helix Canvas
  useEffect(() => {
    const canvas = helixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.025;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const turns = 2.4;
      const n = 28;
      const amp = Math.min(w * 0.38, 50);
      const span = h * 0.85;
      const top = h * 0.08;
      const rot = t * 1.1;

      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const y = top + f * span;
        const a = f * turns * Math.PI * 2 + rot;
        const x1 = cx + Math.sin(a) * amp;
        const x2 = cx + Math.sin(a + Math.PI) * amp;
        const z = Math.cos(a);

        // Cross rung
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `rgba(172, 88, 233, ${0.15 + (z + 1) * 0.25})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Node A
        ctx.beginPath();
        ctx.arc(x1, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = z > 0 ? '#AC58E9' : '#ffffff';
        ctx.fill();

        // Node B
        ctx.beginPath();
        ctx.arc(x2, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = z <= 0 ? '#AC58E9' : '#c084fc';
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Canvas 3: Live Breeding Multi-Curve Fan Canvas (14 dynamic curves + laser beam)
  useEffect(() => {
    const canvas = fanCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(172, 88, 233, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw 14 Genetic Equity Curves
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        const seed = i * 0.45;
        const alpha = 0.25 + (i / 14) * 0.65;
        const isLeader = i === 13;

        ctx.strokeStyle = isLeader
          ? '#AC58E9'
          : i % 2 === 0
          ? `rgba(172, 88, 233, ${alpha})`
          : `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = isLeader ? 2.5 : 1.2;

        ctx.moveTo(0, h * 0.75);
        for (let x = 0; x < w; x += 10) {
          const progress = x / w;
          const trend = progress * (h * 0.55);
          const noise = Math.sin(x * 0.04 + t + seed) * (14 * (1 - progress * 0.3));
          const y = h * 0.75 - trend + noise;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Vertical sweeping laser scanline
      const scanX = ((t * 80) % w);
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, h);
      ctx.strokeStyle = 'rgba(172, 88, 233, 0.75)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#AC58E9';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Smooth scroll and active act tracking
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const totalH = container.scrollHeight - window.innerHeight;
      const prog = totalH > 0 ? Math.max(0, Math.min(1, -rect.top / totalH)) : 0;
      setScrollProgress(prog);

      // Determine active act based on viewport visibility
      let current: AlgoryAct = 'deck';
      for (const act of actList) {
        const el = document.getElementById(`act-${act}`);
        if (el) {
          const b = el.getBoundingClientRect();
          if (b.top <= window.innerHeight * 0.45 && b.bottom >= window.innerHeight * 0.20) {
            current = act;
          }
        }
      }
      setActiveAct((prev) => {
        if (prev !== current) {
          triggerShockwave(current === 'campaign' ? '#c084fc' : '#AC58E9');
        }
        return current;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Jump smoothly to any Act
  const scrollToAct = (act: AlgoryAct) => {
    setActiveAct(act);
    const el = document.getElementById(`act-${act}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tiltX = (mousePos.y - 0.5) * 4;
  const tiltY = (mousePos.x - 0.5) * -6;

  return (
    <div ref={containerRef} id="algory-master-engine" className="algory-scrolly-container">
      {/* ==============================================================
          1. STICKY ACT NAVIGATION RIBBON (Algory Scrolly Ribbon)
          Docks below the 58px main navbar with live act indicator
          ============================================================== */}
      <header className="algory-terminal-header">
        <div className="algory-brand-left">
          <span className="algory-act-title-badge">
            // ACT 0{getActIndex(activeAct)} · {activeAct.toUpperCase()}
          </span>
        </div>

        {/* Interactive Navigation Pills for all 6 Acts */}
        <div className="apills">
          {actList.map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => scrollToAct(act)}
              className={`apill ${activeAct === act ? 'on' : ''}`}
            >
              {act.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            {storyContent[activeAct].stat}
          </span>
        </div>
      </header>

      {/* Global Scrolly Progress Line */}
      <div className="algory-scroll-progress-line" style={{ width: `${Math.round(scrollProgress * 100)}%` }} />

      {/* Shockwave expanding ripples */}
      {shockwaves.map((w) => (
        <div
          key={w.id}
          className="shockwave-ring"
          style={{
            borderColor: w.color,
            boxShadow: `0 0 30px ${w.color}`,
            left: `${w.x}%`,
            top: `${w.y}%`
          }}
        />
      ))}

      {/* ==============================================================
          ACT 01 // QUANTUM COMMAND DECK (Hero Centerpiece)
          ============================================================== */}
      <article id="act-deck" className="algory-act-chapter hero-chapter">
        <div className="cdeck-hero-narrative" style={{ marginBottom: 28, textAlign: 'center' }}>
          <div className="hero-status-pill" style={{ margin: '0 auto 14px' }}>
            <span className="hero-status-dot" />
            <span className="hero-status-title">ACT 01 // QUANTUM COMMAND DECK</span>
            <span className="hero-status-sep">•</span>
            <span className="hero-status-sub">2.8ms SUB-TICK MT5 IPC</span>
          </div>

          <h1 className="hero-h1" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', margin: '0 auto 12px' }}>
            Trading strategies that <span className="accent">survive live.</span>
          </h1>

          <p className="hero-lead" style={{ margin: '0 auto 20px', maxWidth: 720 }}>
            Continuous closed-bar quantitative momentum discovery across Binance Linear, Deribit, and MetaTrader 5 with zero lookahead bias.
          </p>

          {/* Action CTAs */}
          <div className="hero-cta-row" style={{ justifyContent: 'center', marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => onEnterTerminal?.()}
              style={{
                background: '#AC58E9',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                padding: '10px 26px',
                borderRadius: 9999,
                cursor: 'pointer',
                boxShadow: '0 0 24px rgba(172, 88, 233, 0.6)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                e.currentTarget.style.background = '#c084fc';
                e.currentTarget.style.boxShadow = '0 0 32px rgba(172, 88, 233, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = '#AC58E9';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(172, 88, 233, 0.6)';
              }}
            >
              <span>Launch Institutional Terminal</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToAct('campaign')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f1f5f9',
                fontSize: 13,
                fontWeight: 700,
                padding: '9px 20px',
                borderRadius: 9999,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(172, 88, 233, 0.15)';
                e.currentTarget.style.borderColor = '#AC58E9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <span>Explore Scrollytelling Acts</span>
              <span style={{ color: '#ffffff' }}>↓</span>
            </button>
          </div>

          {/* Compliance & Foundations Chip */}
          <div
            style={{
              fontSize: 10,
              color: '#94a3b8',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: 1
            }}
          >
            CLOSED-BAR DETERMINISM • MARCOS LÓPEZ DE PRADO TRIPLE-BARRIER • FRACTIONAL KELLY SIZING
          </div>
        </div>

        {/* 3-Column Quantum Command Deck */}
        <div
          className="command-deck-3col-layout"
          style={{
            transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transition: 'transform 0.1s ease-out',
            width: '100%'
          }}
        >
          {/* Left Column: Alpha Vault Mini + DNA Double Helix */}
          <div className="cdeck-col-left">
            <div className="cdeck-module">
              <div className="cdeck-module-header">
                <span className="cdeck-tag-purple">ALPHA VAULT</span>
                <span className="cdeck-tag-gray">score 80+ · low corr</span>
              </div>
              <div className="cdeck-vault-hero">
                <span className="cdeck-big-num">{strategiesBred.toLocaleString()}</span>
                <span className="cdeck-num-lbl">GENOMES SYNTHESIZED</span>
              </div>
              <div className="cdeck-substats">
                <span className="cdeck-sub-lbl">VAULT SHARPE <strong style={{ color: '#ffffff' }}>2.84</strong></span>
                <span className="cdeck-sub-lbl">BTC PRICE <strong style={{ color: '#AC58E9' }}>${curPrice.toLocaleString()}</strong></span>
              </div>
              <div className="cdeck-mini-table">
                <div className="cm-row cm-th">
                  <span>ASSET</span>
                  <span style={{ textAlign: 'right' }}>SCORE</span>
                  <span style={{ textAlign: 'right' }}>ALPHA</span>
                  <span style={{ textAlign: 'right' }}>MAX DD</span>
                </div>
                {[
                  { sym: 'BTC-PERP', tf: 'H4', sc: 94, alp: '+142.5%', dd: '3.8%', hash: '#8F3A21' },
                  { sym: 'ETH-PERP', tf: 'H1', sc: 89, alp: '+88.2%', dd: '4.9%', hash: '#C49102' },
                  { sym: 'SOL-PERP', tf: 'H1', sc: 84, alp: '+64.0%', dd: '6.1%', hash: '#7B129D' }
                ].map((row, idx) => (
                  <div key={idx} className="cm-row">
                    <span className="cm-sym">{row.sym} <small>{row.hash}</small></span>
                    <span style={{ textAlign: 'right', color: '#AC58E9', fontWeight: 700 }}>{row.sc}</span>
                    <span style={{ textAlign: 'right', color: '#ffffff', fontWeight: 700 }}>{row.alp}</span>
                    <span style={{ textAlign: 'right', color: '#c084fc' }}>{row.dd}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cdeck-module" style={{ marginTop: 8 }}>
              <div className="cdeck-module-header">
                <span className="cdeck-tag-purple">GENOME DOUBLE HELIX</span>
                <span className="cdeck-tag-gray">3D REGIME LATTICE</span>
              </div>
              <div className="genome-lattice-wrap" style={{ height: 110 }}>
                <canvas ref={helixCanvasRef} width={340} height={110} style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
            </div>
          </div>

          {/* Center Column: Quant Engine Core Radar + UTC Clock + Power Controls */}
          <div className="cdeck-col-center">
            <div className="cdeck-module cdeck-module-center">
              <div className="cdeck-module-header">
                <span className="cdeck-tag-purple">CLOSED-BAR QUANT ENGINE</span>
                <span className="cdeck-tag-live">● LIVE PARITY</span>
              </div>

              <div className="engine-radar-viewport" style={{ position: 'relative', width: 220, height: 220, margin: '10px auto' }}>
                <canvas ref={coreCanvasRef} width={220} height={220} style={{ display: 'block' }} />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 14px #AC58E9' }}>
                    {liveClock}
                  </div>
                  <div style={{ fontSize: 7.5, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
                    UTC QUANT CLOCK
                  </div>
                </div>
              </div>

              <div className="neural-controls-bar">
                <div className="control-group">
                  <span className="ctrl-lbl">POWER</span>
                  <button
                    type="button"
                    onClick={() => setPowerMode('eco')}
                    className={`ctrl-pill ${powerMode === 'eco' ? 'ctrl-on' : ''}`}
                  >
                    ECO
                  </button>
                  <button
                    type="button"
                    onClick={() => setPowerMode('balanced')}
                    className={`ctrl-pill ${powerMode === 'balanced' ? 'ctrl-on' : ''}`}
                  >
                    BALANCED
                  </button>
                  <button
                    type="button"
                    onClick={() => setPowerMode('max')}
                    className={`ctrl-pill ${powerMode === 'max' ? 'ctrl-on' : ''}`}
                  >
                    MAX (16C)
                  </button>
                </div>

                <div className="control-group">
                  <span className="ctrl-lbl">SMART MODE</span>
                  <button
                    type="button"
                    onClick={() => setSmartMode(!smartMode)}
                    className={`ctrl-pill ${smartMode ? 'ctrl-on' : ''}`}
                  >
                    {smartMode ? 'PRO (SEEDED)' : 'OFF'}
                  </button>
                </div>

                <div className="control-group">
                  <span className="ctrl-lbl">LOOKAHEAD</span>
                  <span className="ctrl-pill ctrl-on" style={{ cursor: 'default' }}>
                    0.00ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Engine Feed logs */}
          <div className="cdeck-col-right">
            <div className="cdeck-module" style={{ height: '100%' }}>
              <div className="cdeck-module-header">
                <span className="cdeck-tag-purple">ENGINE FEED</span>
                <span className="cdeck-tag-gray">MT5 IPC STREAM</span>
              </div>
              <div className="engine-feed-logs-terminal">
                <div className="log-line log-accent">Cluster Alpha Gen 18: Score 9.42 ---</div>
                <div className="log-line log-cyan">Held-Out Gate: Passed 38/40 ---</div>
                <div className="log-line">BTC_MOM Ret 28.4% | DD 2.1% | WR 68.2%</div>
                <div className="log-line log-gray">Regime:TREND_FLOW | VolFilter:ATR_EXP</div>
                <div className="log-line log-accent">Cluster Beta Gen 20: Score 9.68 ---</div>
                <div className="log-line log-cyan">Held-Out Gate: Passed 42/45 ---</div>
                <div className="log-line">ETH_VOL Ret 34.1% | DD 1.8% | WR 71.5%</div>
                <div className="log-line log-rose">Slippage Stress Test: ZERO LEAKAGE (300ms)</div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ==============================================================
          ACT 02 // BREED STRATEGIES IN TRIBES
          ============================================================== */}
      <article id="act-campaign" className="algory-act-chapter">
        <div className="bd" style={{ borderRadius: 16 }}>
          <div className="wrap">
            <div className="bd-head">
              <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#AC58E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                // ACT 02 · GENETIC SYNTHESIS ENGINE
              </div>
              <h2 className="reveal split-h">
                The engine breeds strategies <span className="accent">in tribes.</span>
              </h2>
              <p>
                Thousands of random genomes go in. Two tribes, Consistency and Growth, breed them for twenty generations each, then a Final War merges the pools. Weak lines die out, strong lines breed on, and only genes that passed MT5 parity validation may breed at all.
              </p>
            </div>

            {/* 4 Big Metric Stat Counters */}
            <div className="stats">
              <div>
                <b>20</b>
                <span>generations per tribe</span>
              </div>
              <div>
                <b>2</b>
                <span>tribes, then a Final War</span>
              </div>
              <div>
                <b>4</b>
                <span>power modes, Eco to Extreme</span>
              </div>
              <div>
                <b>16</b>
                <span>cores running on your machine</span>
              </div>
            </div>

            {/* Multi-Curve Fan Canvas & Tribe Comparison */}
            <div className="campaign-act-layout" style={{ marginTop: 24 }}>
              <div className="camp-curves-canvas-wrap">
                <canvas ref={fanCanvasRef} width={900} height={260} className="camp-canvas" />
                <div className="camp-canvas-overlay-badges">
                  <span className="overlay-badge badge-cyan">CONSISTENCY TRIBE (GEN 18)</span>
                  <span className="overlay-badge badge-purple">GROWTH TRIBE (GEN 20)</span>
                  <span className="overlay-badge badge-green">FINAL WAR: MERGED</span>
                </div>
              </div>

              <div className="camp-tribes-grid" style={{ marginTop: 16 }}>
                <div className="tribe-card">
                  <div className="tribe-header">
                    <span className="tribe-name" style={{ color: '#AC58E9' }}>Tribe A: Consistency</span>
                    <span className="tribe-pill">Score 9.42</span>
                  </div>
                  <div className="tribe-metrics">
                    <div><span>Win Rate:</span> <strong>71.4%</strong></div>
                    <div><span>Max Drawdown:</span> <strong style={{ color: '#c084fc' }}>1.8%</strong></div>
                    <div><span>Persistence:</span> <strong>88.4</strong></div>
                  </div>
                </div>

                <div className="tribe-card">
                  <div className="tribe-header">
                    <span className="tribe-name" style={{ color: '#ffffff' }}>Tribe B: Growth</span>
                    <span className="tribe-pill">Score 9.68</span>
                  </div>
                  <div className="tribe-metrics">
                    <div><span>Annual Return:</span> <strong style={{ color: '#ffffff' }}>+142.5%</strong></div>
                    <div><span>Profit Factor:</span> <strong>3.14</strong></div>
                    <div><span>Sharpe Ratio:</span> <strong>2.84</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <dl className="kv three" style={{ marginTop: 24 }}>
              <div>
                <dt>Power Modes</dt>
                <dd>Eco, Balanced, High, Extreme. Extreme utilizes every available CPU core with zero cloud dependency.</dd>
              </div>
              <div>
                <dt>Smart Mode</dt>
                <dd>Pro mode seeds starting pools with winning genes from prior regimes, using random genomes as control.</dd>
              </div>
              <div>
                <dt>History Depth</dt>
                <dd>Multi-year historical tick depth across bull, bear, and consolidation volatility regimes.</dd>
              </div>
            </dl>
          </div>
        </div>
      </article>

      {/* ==============================================================
          ACT 03 // HELD-OUT STATISTICAL GATES
          ============================================================== */}
      <article id="act-vault" className="algory-act-chapter">
        <div className="act-bleed op-L chap-W" style={{ background: 'rgba(8, 4, 14, 0.88)', borderRadius: 16, padding: '36px 32px' }}>
          <div className="copy">
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#AC58E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              // ACT 03 · STATISTICAL SURVIVAL GATES
            </div>
            <h2 className="reveal split-h">
              Survivors face data they have <span className="accent">never seen.</span>
            </h2>
            <p>
              Memorising the past gets a strategy killed. Four statistical gates stand between a bred candidate and the vault, and the same gates run on a refresh as on a fresh campaign.
            </p>
            <div className="tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              <span className="gate-tag">Score 80+ Threshold</span>
              <span className="gate-tag">Out-of-Sample Validation</span>
              <span className="gate-tag">Monte Carlo Shuffles</span>
              <span className="gate-tag">Zero Overfitting</span>
            </div>
          </div>

          <div className="gates">
            <div className="gate">
              <div className="n">70 / 30</div>
              <h3>Held-Out Slice</h3>
              <p>Trained on 70% of history, judged on the unseen 30% that breeding never touches.</p>
            </div>
            <div className="gate">
              <div className="n">100</div>
              <h3>Beat Random Field</h3>
              <p>Must beat 100 benchmark random strategies on the held-out slice.</p>
            </div>
            <div className="gate">
              <div className="n">1,000</div>
              <h3>Monte Carlo Shuffles</h3>
              <p>Trades permuted 1,000 times; worst-case path must preserve positive edge.</p>
            </div>
            <div className="gate">
              <div className="n">0.00ms</div>
              <h3>MT5 Parity Lock</h3>
              <p>Closed-bar tick reproducibility matches MetaTrader 5 Expert Advisor to the pip.</p>
            </div>
          </div>
        </div>
      </article>

      {/* ==============================================================
          ACT 04 // VERIFIED GENOME PASSPORTS
          ============================================================== */}
      <article id="act-portfolios" className="algory-act-chapter">
        <div className="card cd" style={{ width: '100%', maxWidth: 1200 }}>
          <div className="bd-head">
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#c084fc', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              // ACT 04 · VERIFIED GENOME PASSPORTS
            </div>
            <h2 className="reveal split-h">
              Every survivor gets <span className="accent">a passport.</span>
            </h2>
            <p>
              Everything that survived carries full equity curves with marked held-out bounds, execution slippage tolerances, and verifiable genome signatures.
            </p>
          </div>

          {/* Strategy Passports Table */}
          <div className="vault-act-layout" style={{ marginTop: 24 }}>
            <div className="vault-table-container">
              <div className="vault-table-header-bar">
                <span>STRATEGY PASSPORTS DATABASE</span>
                <span style={{ color: '#AC58E9' }}>SCORE 80+ · LOW CORRELATION</span>
              </div>
              <div className="vault-table-scroll-track" style={{ maxHeight: 320, overflowY: 'auto' }}>
                <table className="vault-full-table">
                  <thead>
                    <tr>
                      <th>PASSPORT</th>
                      <th>ASSET</th>
                      <th>TIMEFRAME</th>
                      <th>SCORE</th>
                      <th>SHARPE</th>
                      <th>ANNUAL RET</th>
                      <th>MAX DD</th>
                      <th>HELD-OUT</th>
                      <th>MT5 PARITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '#PASS-8F3A', sym: 'BTC-PERP', tf: 'H4', score: 96, sh: '3.12', ret: '+148.4%', dd: '3.2%', ho: 'PASS 100%', mt5: '0.00ms' },
                      { id: '#PASS-C491', sym: 'ETH-PERP', tf: 'H1', score: 94, sh: '2.84', ret: '+112.0%', dd: '3.8%', ho: 'PASS 100%', mt5: '0.00ms' },
                      { id: '#PASS-7B12', sym: 'SOL-PERP', tf: 'H1', score: 91, sh: '2.76', ret: '+94.2%', dd: '4.5%', ho: 'PASS 98%', mt5: '0.00ms' },
                      { id: '#PASS-2A99', sym: 'AVAX-PERP', tf: 'H4', score: 89, sh: '2.54', ret: '+82.6%', dd: '5.1%', ho: 'PASS 96%', mt5: '0.00ms' },
                      { id: '#PASS-5E31', sym: 'LINK-PERP', tf: 'H2', score: 88, sh: '2.48', ret: '+76.4%', dd: '4.9%', ho: 'PASS 95%', mt5: '0.00ms' },
                      { id: '#PASS-9D44', sym: 'BNB-PERP', tf: 'D1', score: 87, sh: '2.42', ret: '+68.2%', dd: '3.9%', ho: 'PASS 94%', mt5: '0.00ms' },
                      { id: '#PASS-1C88', sym: 'NEAR-PERP', tf: 'H1', score: 85, sh: '2.35', ret: '+62.8%', dd: '5.8%', ho: 'PASS 92%', mt5: '0.00ms' },
                      { id: '#PASS-6F02', sym: 'ARB-PERP', tf: 'H4', score: 84, sh: '2.28', ret: '+58.0%', dd: '6.2%', ho: 'PASS 91%', mt5: '0.00ms' }
                    ].map((row, idx) => (
                      <tr key={idx} className="vault-data-row">
                        <td style={{ color: '#c084fc', fontFamily: 'monospace' }}>{row.id}</td>
                        <td style={{ fontWeight: 800, color: '#fff' }}>{row.sym}</td>
                        <td style={{ color: '#ffffff' }}>{row.tf}</td>
                        <td><span className="score-pill">{row.score}</span></td>
                        <td style={{ color: '#ffffff', fontWeight: 700 }}>{row.sh}</td>
                        <td style={{ color: '#ffffff' }}>{row.ret}</td>
                        <td style={{ color: '#c084fc' }}>{row.dd}</td>
                        <td style={{ color: '#AC58E9' }}>{row.ho}</td>
                        <td><span className="parity-badge">{row.mt5}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Passport Preview Inspector Card */}
            <div className="vault-passport-preview">
              <div className="preview-header">
                <span className="p-title">VERIFIED GENOME PASSPORT</span>
                <span className="p-badge">GRADE: A+ INSTITUTIONAL</span>
              </div>
              <div className="preview-body">
                <div className="p-metric"><span>Archetype:</span> <strong>Momentum Breakout Hunter</strong></div>
                <div className="p-metric"><span>Held-Out Slice:</span> <strong>Last 30% (Strict Unseen)</strong></div>
                <div className="p-metric"><span>Trade Permutations:</span> <strong>1,000 Shuffles Passed</strong></div>
                <div className="p-metric"><span>Max Risk Tolerance:</span> <strong>3.2% Account NAV</strong></div>
                <div className="p-metric" style={{ borderBottom: 'none' }}><span>Genome Signature:</span> <strong style={{ color: '#AC58E9', fontFamily: 'monospace', fontSize: 10 }}>SHA256: 8f3a21..9d</strong></div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ==============================================================
          ACT 05 // MULTI-BOT PORTFOLIO DIVERSIFICATION
          ============================================================== */}
      <article id="act-automation" className="algory-act-chapter">
        <div className="act-bleed op-R chap-W" style={{ background: 'rgba(8, 4, 14, 0.88)', borderRadius: 16, padding: '36px 32px' }}>
          <div className="copy">
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#AC58E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              // ACT 05 · MULTI-BOT DIVERSIFICATION
            </div>
            <h2 className="reveal split-h">
              Portfolios built not to <span className="accent">sink together.</span>
            </h2>
            <p>
              Ten copies of the same trade in different clothes is not diversification. The diversity grade takes the worst of five axes, and combined equity simulates true margin on one account.
            </p>
            <dl className="kv" style={{ marginTop: 16 }}>
              <div>
                <dt>Return Correlation</dt>
                <dd>Pairwise correlation heat matrix. Any pair above 0.85 caps the entire portfolio grade.</dd>
              </div>
              <div>
                <dt>Exposure Management</dt>
                <dd>Limits concurrent bot exposure under your daily risk budget, even during volatility cascades.</dd>
              </div>
              <div>
                <dt>Lifecycle Promotion</dt>
                <dd>Candidates climb from Incubation to Paper Testing, and finally to Live Margin.</dd>
              </div>
            </dl>
          </div>

          <div className="gates">
            <div className="gate">
              <div className="n">+38.2%</div>
              <h3>Combined Alpha</h3>
              <p>True multi-asset diversification delivering steady capital compounding.</p>
            </div>
            <div className="gate">
              <div className="n">2.84</div>
              <h3>Portfolio Sharpe</h3>
              <p>Risk-adjusted returns maintained through decorrelated strategy combinations.</p>
            </div>
          </div>
        </div>

        {/* Portfolio Table */}
        <div className="port-members-card" style={{ width: '100%', maxWidth: 1180, marginTop: 24 }}>
          <div className="pm-header">
            <span>ACTIVE PORTFOLIO MEMBERS (DIVERSITY GRADE: A)</span>
            <span className="pm-tag">MARCOS LÓPEZ DE PRADO DECORRELATION</span>
          </div>
          <table className="port-members-table">
            <thead>
              <tr>
                <th>STRATEGY</th>
                <th>ALLOCATION</th>
                <th>CORRELATION</th>
                <th>MAX RISK</th>
                <th>STAGE</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'BTC-MOM-ALPHA_H4', alloc: '35%', corr: '0.12', risk: '1.2%', stage: 'LIVE MARGIN' },
                { name: 'ETH-VOL-EXP_H1', alloc: '25%', corr: '0.18', risk: '0.9%', stage: 'LIVE MARGIN' },
                { name: 'SOL-TREND-FOLLOW_H1', alloc: '20%', corr: '0.24', risk: '0.7%', stage: 'PAPER TESTING' },
                { name: 'LINK-BREAKOUT_H2', alloc: '12%', corr: '0.08', risk: '0.4%', stage: 'INCUBATION' },
                { name: 'AVAX-MEAN-REV_H4', alloc: '8%', corr: '0.15', risk: '0.3%', stage: 'INCUBATION' }
              ].map((row, idx) => (
                <tr key={idx} className="portfolio-mem-row">
                  <td style={{ fontWeight: 800, color: '#fff' }}>{row.name}</td>
                  <td style={{ color: '#AC58E9', fontWeight: 700 }}>{row.alloc}</td>
                  <td style={{ color: '#ffffff' }}>{row.corr}</td>
                  <td>{row.risk}</td>
                  <td><span className="stage-pill">{row.stage}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* ==============================================================
          ACT 06 // AUTONOMOUS EXECUTION & IPC BRIDGE
          ============================================================== */}
      <article id="act-insights" className="algory-act-chapter">
        <div className="card cd op-C" style={{ width: '100%', maxWidth: 1200 }}>
          <div className="bd-head" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#AC58E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              // ACT 06 · 24/7 AUTONOMOUS EXECUTION
            </div>
            <h2 className="reveal split-h" style={{ textAlign: 'center' }}>
              Autonomous Execution Schedules, <span className="accent">Zero Intervention.</span>
            </h2>
            <p style={{ margin: '0 auto', textAlign: 'center' }}>
              Automated synthesis sweeps, decorrelation clustering, and auto-purging of degrading models into quarantine with sub-10ms circuit breakers.
            </p>
          </div>

          <div className="stats">
            <div>
              <b>24/7</b>
              <span>IPC clock synced</span>
            </div>
            <div>
              <b>&lt; 3.2ms</b>
              <span>execution latency</span>
            </div>
            <div>
              <b>100%</b>
              <span>closed-bar parity</span>
            </div>
            <div>
              <b>0</b>
              <span>human emotion needed</span>
            </div>
          </div>

          {/* Schedule Toggles */}
          <div className="auto-controls-card" style={{ marginTop: 24 }}>
            <div className="ac-header">
              <span>AUTONOMOUS EXECUTION SCHEDULE</span>
              <span className="ac-live-dot">● 24/7 IPC CLOCK SYNCED</span>
            </div>
            <div className="ac-toggles-list">
              <div className="ac-toggle-item" onClick={() => toggleAuto('nightly')}>
                <div className="ac-toggle-info">
                  <strong>Nightly Synthesis Sweep</strong>
                  <small>Re-synthesize genomes at 00:00 UTC</small>
                </div>
                <div className={`ac-switch ${autoToggles.nightly ? 'on' : ''}`}>
                  <div className="ac-switch-knob" />
                </div>
              </div>

              <div className="ac-toggle-item" onClick={() => toggleAuto('replaceWatch')}>
                <div className="ac-toggle-info">
                  <strong>Auto-Purge Quarantine</strong>
                  <small>Degrading models swapped automatically</small>
                </div>
                <div className={`ac-switch ${autoToggles.replaceWatch ? 'on' : ''}`}>
                  <div className="ac-switch-knob" />
                </div>
              </div>

              <div className="ac-toggle-item" onClick={() => toggleAuto('weekend')}>
                <div className="ac-toggle-info">
                  <strong>Weekend Monte Carlo Stress</strong>
                  <small>Permute 1,000 trade orders across gaps</small>
                </div>
                <div className={`ac-switch ${autoToggles.weekend ? 'on' : ''}`}>
                  <div className="ac-switch-knob" />
                </div>
              </div>
            </div>
          </div>

          <dl className="kv three" style={{ marginTop: 24 }}>
            <div>
              <dt>Auto-Quarantine</dt>
              <dd>Degrading models exceeding drawdown thresholds are automatically retired to 30-day quarantine.</dd>
            </div>
            <div>
              <dt>Instant Replacement</dt>
              <dd>Top-ranked candidate from the Alpha Vault immediately assumes vacant capital allocation.</dd>
            </div>
            <div>
              <dt>IPC Bridge</dt>
              <dd>Direct zero-latency named pipe sockets link the Python quant core to MetaTrader 5.</dd>
            </div>
          </dl>

          {/* Institutional Deployment Banner */}
          <div
            style={{
              marginTop: 36,
              padding: '28px 32px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(172, 88, 233, 0.15) 0%, rgba(12, 4, 20, 0.95) 100%)',
              border: '1px solid rgba(172, 88, 233, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
                Deploy Institutional Quantitative Momentum On MetaTrader 5
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
                Fully automated closed-bar signal streaming with Deribit options tail-risk hedging.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => onEnterTerminal?.()}
                style={{
                  background: '#AC58E9',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 800,
                  padding: '10px 24px',
                  borderRadius: 9999,
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(172, 88, 233, 0.6)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>Launch Institutional Terminal</span>
                <span>⚡</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth?.('signin')}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '9px 18px',
                  borderRadius: 9999,
                  cursor: 'pointer'
                }}
              >
                Operator Passkey
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
