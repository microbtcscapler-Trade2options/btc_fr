import React, { useState, useEffect, useRef } from 'react';

export type ThemeColor = 'purple' | 'crimson' | 'cyan';

interface CandidateParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  fitness: number;
  winRate: number;
  sharpe: number;
  maxDd: number;
  isSurvivor: boolean;
  ringPhase: number;
}

const THEMES: Record<ThemeColor, {
  name: string;
  badgeLabel: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  cardBg: string;
  borderColor: string;
  activeBtnBg: string;
  activeBtnText: string;
  textGlow: string;
  rgb: string;
}> = {
  purple: {
    name: 'Hacker Green',
    badgeLabel: 'HACKER GREEN',
    primary: '#c084fc',
    secondary: '#AC58E9',
    accent: '#FFFFFF',
    glow: 'rgba(172, 88, 233,  0.55)',
    cardBg: 'radial-gradient(circle at 50% 30%, rgba(13, 38, 18,  0.95) 0%, rgba(6, 18, 9,  0.98) 75%, #030804 100%)',
    borderColor: 'rgba(172, 88, 233,  0.45)',
    activeBtnBg: 'linear-gradient(135deg, #AC58E9 0%, #581c87 100%)',
    activeBtnText: '#FFFFFF',
    textGlow: '0 0 12px rgba(172, 88, 233,  0.75)',
    rgb: "16, 255, 80"
  },
  crimson: {
    name: 'Cyber Crimson',
    badgeLabel: 'CRIMSON',
    primary: '#FF2E54',
    secondary: '#E11D48',
    accent: '#FF1E44',
    glow: 'rgba(255, 46, 84, 0.55)',
    cardBg: 'radial-gradient(circle at 50% 30%, rgba(16, 40, 20,  0.95) 0%, rgba(8, 20, 10,  0.98) 75%, #030804 100%)',
    borderColor: 'rgba(255, 30, 68, 0.4)',
    activeBtnBg: 'linear-gradient(135deg, #FF2E54 0%, #BE123C 100%)',
    activeBtnText: '#FFFFFF',
    textGlow: '0 0 12px rgba(255, 46, 84, 0.75)',
    rgb: '255, 46, 84'
  },
  cyan: {
    name: 'Electric Cyan',
    badgeLabel: 'CYAN',
    primary: '#AC58E9',
    secondary: '#0EA5E9',
    accent: '#06B6D4',
    glow: 'rgba(172, 88, 233,  0.55)',
    cardBg: 'radial-gradient(circle at 50% 30%, rgba(6, 24, 12,  0.95) 0%, rgba(4, 14, 7,  0.98) 75%, #020503 100%)',
    borderColor: 'rgba(172, 88, 233,  0.4)',
    activeBtnBg: 'linear-gradient(135deg, #AC58E9 0%, #581c87 100%)',
    activeBtnText: '#04111D',
    textGlow: '0 0 12px rgba(172, 88, 233,  0.75)',
    rgb: "0, 255, 102"
  }
};

const MARKETS = [
  { id: 'btcusdt', label: '@BTCUSDT ↳ 15m', name: 'Bitcoin Linear Perp', tf: '15m' },
  { id: 'ethusdt', label: '@ETHUSDT ↳ 5m', name: 'Ethereum Scalp Grid', tf: '5m' },
  { id: 'solusdt', label: '@SOLUSDT ↳ 1h', name: 'Solana Momentum Breakout', tf: '1h' },
  { id: 'gbpusd', label: '@GBPUSD ↳ H4', name: 'MetaTrader 5 Bridge IPC', tf: 'H4' },
  { id: 'eurusd', label: '@EURUSD ↳ M30', name: 'Tight Spread Stat-Arb', tf: 'M30' }
];

const TRIBES = [
  { id: 'tribeA', label: 'TRIBE A • CONSISTENCY', focus: 'Low Drawdown Alpha', targetSharpe: '2.85' },
  { id: 'tribeB', label: 'TRIBE B • MOMENTUM', focus: 'High Velocity Trend Breakouts', targetSharpe: '3.42' },
  { id: 'tribeC', label: 'TRIBE C • VOLATILITY', focus: 'Mean Reversion & ATR Harvest', targetSharpe: '3.10' }
];

const VALIDATION_TASKS = [
  { name: '1. Tick Ingestion & Deduplication', desc: 'Validating zero missing ticks from Deribit/Binance DMA stream' },
  { name: '2. Closed-Bar Multi-Barrier Gate', desc: 'Enforcing strict lookahead bias eradication' },
  { name: '3. 6-Year Walk-Forward Cross Validation', desc: 'Held-out out-of-sample data consistency testing' },
  { name: '4. Monte Carlo 1,000-Permutation', desc: 'Randomized trade order shuffle for drawdown robustness' },
  { name: '5. Dynamic Spread & Slippage Stress', desc: 'Simulating worst-case market liquidity gaps' },
  { name: '6. Daily Loss Circuit Breaker Test', desc: 'Trailing stop and equity protection threshold verification' },
  { name: '7. Meta-Labeling Secondary Barrier', desc: 'Filtering regime shifts with secondary classifier' },
  { name: '8. Hardware IPC Execution Routing', desc: 'MetaTrader 5 shared memory sub-10ms pipe serialization' }
];

export const NeuralCoreTerminal: React.FC = () => {
  // Theme state: defaults to 'purple' to match the website, with interactive toggle!
  const [themeKey, setThemeKey] = useState<ThemeColor>('purple');
  const theme = THEMES[themeKey];

  // Interactive controls
  const [powerMode, setPowerMode] = useState<'eco' | 'balanced' | 'max'>('balanced');
  const [smartMode, setSmartMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Dropdown states
  const [showMarketMenu, setShowMarketMenu] = useState(false);
  const [showTribeMenu, setShowTribeMenu] = useState(false);
  const [showTaskDrawer, setShowTaskDrawer] = useState(false);
  const [showSurvivorsDrawer, setShowSurvivorsDrawer] = useState(false);

  // Active Market & Tribe
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [selectedTribe, setSelectedTribe] = useState(TRIBES[0]);

  // Genetic evolution state
  const [generation, setGeneration] = useState(11);
  const maxGeneration = 18;
  const [tasks, setTasks] = useState({ completed: 4, total: 8 });
  const [survivors, setSurvivors] = useState(18);
  const [topFitness, setTopFitness] = useState(4.33);
  const [lastScore, setLastScore] = useState(4.19);
  const [vaulted, setVaulted] = useState(4714);
  const [elapsedSeconds, setElapsedSeconds] = useState(111); // 01:51
  const [statusText, setStatusText] = useState('pruning low-fitness genes...');
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Hovered & Selected candidate particles
  const [hoveredCandidate, setHoveredCandidate] = useState<CandidateParticle | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<CandidateParticle[]>([]);

  // 1. Notification banner timeout
  const notify = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => {
      setActionNotification((curr) => (curr === msg ? null : curr));
    }, 3800);
  };

  // 2. Elapsed Timer (01:51, 01:52...)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Evolve next generation manual trigger
  const evolveNextGeneration = () => {
    setGeneration((prev) => (prev >= maxGeneration ? 1 : prev + 1));
    setTasks((prev) => ({
      completed: Math.min(prev.total, (prev.completed % prev.total) + 1),
      total: 8
    }));
    setSurvivors((prev) => {
      const delta = Math.floor(Math.random() * 5) - 2;
      return Math.max(14, Math.min(32, prev + delta));
    });
    const fitDelta = smartMode ? +(Math.random() * 0.08 - 0.01).toFixed(2) : +(Math.random() * 0.25 - 0.15).toFixed(2);
    setTopFitness((prev) => +(prev + fitDelta).toFixed(2));
    setLastScore((prev) => +(prev + (Math.random() * 0.06 - 0.02)).toFixed(2));
    setVaulted((prev) => prev + Math.floor(Math.random() * 3) + 1);

    // Particle burst excitation
    particlesRef.current.forEach((p) => {
      p.vx += (Math.random() - 0.5) * 3;
      p.vy += (Math.random() - 0.5) * 3;
    });

    notify(`⚡ Evolved Generation ${generation >= maxGeneration ? 1 : generation + 1}/${maxGeneration}! New top fitness: ${(topFitness + fitDelta).toFixed(2)}`);
  };

  // 4. Periodic Genetic Algorithm Progression Simulation
  useEffect(() => {
    if (!isPlaying) return;
    const speedMult = powerMode === 'max' ? 2200 : powerMode === 'balanced' ? 5000 : 8500;
    const interval = setInterval(() => {
      setGeneration((prev) => (prev >= maxGeneration ? 1 : prev + 1));

      setTasks((prev) => ({
        completed: Math.min(prev.total, (prev.completed % prev.total) + 1),
        total: 8
      }));

      setSurvivors((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(14, Math.min(32, prev + delta));
      });

      const fitDelta = smartMode ? +(Math.random() * 0.06 - 0.01).toFixed(2) : +(Math.random() * 0.22 - 0.12).toFixed(2);
      setTopFitness((prev) => +(prev + fitDelta).toFixed(2));
      setLastScore((prev) => +(prev + (Math.random() * 0.05 - 0.02)).toFixed(2));
      setVaulted((prev) => prev + Math.floor(Math.random() * 3) + 1);

      const statuses = [
        'breeding candidates...',
        'evaluating Sharpe genome...',
        'mutating neural weights...',
        'filtering walk-forward...',
        'pruning low-fitness genes...',
        'optimizing trailing ATR stop...',
        'cross-validating MT5 IPC pipe...'
      ];
      setStatusText(statuses[Math.floor(Math.random() * statuses.length)]);
    }, speedMult);

    return () => clearInterval(interval);
  }, [powerMode, isPlaying, smartMode, maxGeneration]);

  // 5. Initialize Candidate Population
  const initParticles = (count: number) => {
    const size = 440;
    const centerX = size / 2;
    const centerY = size / 2;
    const newParticles: CandidateParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 1.6) * 145;
      newParticles.push({
        id: 100 + i,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.2 + 1.2,
        alpha: Math.random() * 0.65 + 0.35,
        fitness: +(Math.random() * 1.5 + 3.4).toFixed(2),
        winRate: +(Math.random() * 18 + 58).toFixed(1),
        sharpe: +(Math.random() * 1.4 + 2.1).toFixed(2),
        maxDd: -(+(Math.random() * 4 + 1.8).toFixed(1)),
        isSurvivor: i < 7,
        ringPhase: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = newParticles;
  };

  useEffect(() => {
    const count = powerMode === 'max' ? 80 : powerMode === 'balanced' ? 55 : 35;
    initParticles(count);
  }, [powerMode, selectedMarket]);

  // 6. HTML5 Canvas: Dynamic Particle Swarm with Target Reticles & Energy Filaments
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const size = 440;
    canvas.width = size;
    canvas.height = size;
    const centerX = size / 2;
    const centerY = size / 2;

    let phase = 0;

    const render = () => {
      phase += 0.02;
      ctx.clearRect(0, 0, size, size);

      const speedFactor = !isPlaying ? 0.05 : powerMode === 'max' ? 1.8 : powerMode === 'balanced' ? 1.0 : 0.6;
      const particles = particlesRef.current;

      // Energy filaments between close nodes
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 34) {
            const lineAlpha = (1 - dist / 34) * 0.22;
            ctx.strokeStyle = `rgba(${theme.rgb}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw each candidate genome node
      particles.forEach((p) => {
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        // Gravitational inward pull
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);

        if (distFromCenter > 155) {
          p.vx += (dx / distFromCenter) * 0.045;
          p.vy += (dy / distFromCenter) * 0.045;
        }

        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
        p.vx *= 0.98;
        p.vy *= 0.98;

        const isLocked = p.id === selectedCandidateId;

        // Glowing Node Core
        ctx.fillStyle = isLocked ? '#FFFFFF' : p.isSurvivor ? '#FFFFFF' : `rgba(${theme.rgb}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isLocked ? p.radius * 1.8 : p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow Aura
        if (p.isSurvivor || isLocked) {
          ctx.fillStyle = isLocked ? theme.accent : `rgba(${theme.rgb}, 0.45)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2);
          ctx.fill();

          // Target Reticle Ring
          const ringRad = (isLocked ? 10 : 7) + Math.sin(phase + p.ringPhase) * 1.6;
          ctx.strokeStyle = isLocked ? '#FFFFFF' : theme.accent;
          ctx.lineWidth = isLocked ? 1.8 : 1.1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, ringRad, 0, Math.PI * 2);
          ctx.stroke();

          // Extra crosshair brackets for locked candidate
          if (isLocked) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x - 14, p.y); ctx.lineTo(p.x - 10, p.y);
            ctx.moveTo(p.x + 10, p.y); ctx.lineTo(p.x + 14, p.y);
            ctx.moveTo(p.x, p.y - 14); ctx.lineTo(p.x, p.y - 10);
            ctx.moveTo(p.x, p.y + 10); ctx.lineTo(p.x, p.y + 14);
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [powerMode, isPlaying, theme, selectedCandidateId]);

  // 7. Interactive Canvas Mouse Move & Click
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 440;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 440;

    setMousePos({ x: e.clientX, y: e.clientY });

    // Find nearest candidate within 25px
    let closest: CandidateParticle | null = null;
    let minDist = 25;

    particlesRef.current.forEach((p) => {
      const dist = Math.sqrt((p.x - mouseX) ** 2 + (p.y - mouseY) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    });

    setHoveredCandidate(closest);
  };

  const handleCanvasMouseLeave = () => {
    setHoveredCandidate(null);
    setMousePos(null);
  };

  const handleCanvasClick = () => {
    if (hoveredCandidate) {
      setSelectedCandidateId(hoveredCandidate.id);
      notify(`🎯 Locked Genome #${hoveredCandidate.id} (Fitness: ${hoveredCandidate.fitness}) for live MetaTrader 5 execution!`);
    }
  };

  // 8. Market Switching Handler
  const handleSelectMarket = (m: typeof MARKETS[0]) => {
    setSelectedMarket(m);
    setShowMarketMenu(false);
    setGeneration(1);
    notify(`Switched market pair to ${m.label}. Seeded 55 new candidate strategies.`);
  };

  // 9. Tribe Switching Handler
  const handleSelectTribe = (t: typeof TRIBES[0]) => {
    setSelectedTribe(t);
    setShowTribeMenu(false);
    notify(`Switched quant profile to ${t.label} (Target Sharpe: ${t.targetSharpe}).`);
  };

  return (
    <div className="neural-core-wrapper">
      {/* Disclaimer Notice */}
      <div className="neural-core-disclaimer">
        Trading leveraged products carries a high risk of loss. Backtested results are not a guide to future returns.
      </div>

      {/* Main High-Tech Terminal Card */}
      <div
        className="neural-core-card"
        style={{
          background: theme.cardBg,
          borderColor: theme.borderColor,
          boxShadow: `0 25px 80px rgba(0, 0, 0, 0.9), 0 0 50px ${theme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
        }}
      >
        {/* Top Header Row with Theme Color Selector & Tribe Status */}
        <div className="neural-core-header">
          {/* Brand Title */}
          <div className="core-title-box">
            <span className="title-neural">NEURAL</span>
            <span className="title-core" style={{ color: theme.primary, textShadow: theme.textGlow }}>
              CORE
            </span>
          </div>

          {/* COLOR THEME SELECTOR PILLS */}
          <div className="core-theme-selector">
            <span className="theme-selector-label">COLOR:</span>
            <div className="theme-pills-row">
              <button
                className={`theme-pill ${themeKey === 'purple' ? 'theme-pill-active' : ''}`}
                onClick={() => setThemeKey('purple')}
                style={{
                  background: themeKey === 'purple' ? '#AC58E9' : 'transparent',
                  color: themeKey === 'purple' ? '#FFFFFF' : '#94A3B8',
                  borderColor: themeKey === 'purple' ? '#c084fc' : 'rgba(255, 255, 255, 0.12)'
                }}
                title="Hacker Green (Digisperse Matrix Theme)"
              >
                HACKER GREEN
              </button>

              <button
                className={`theme-pill ${themeKey === 'crimson' ? 'theme-pill-active' : ''}`}
                onClick={() => setThemeKey('crimson')}
                style={{
                  background: themeKey === 'crimson' ? '#FF2E54' : 'transparent',
                  color: themeKey === 'crimson' ? '#FFFFFF' : '#94A3B8',
                  borderColor: themeKey === 'crimson' ? '#FF2E54' : 'rgba(255, 255, 255, 0.12)'
                }}
                title="Cyber Crimson (Red Reference)"
              >
                CRIMSON
              </button>

              <button
                className={`theme-pill ${themeKey === 'cyan' ? 'theme-pill-active' : ''}`}
                onClick={() => setThemeKey('cyan')}
                style={{
                  background: themeKey === 'cyan' ? '#AC58E9' : 'transparent',
                  color: themeKey === 'cyan' ? '#04111D' : '#94A3B8',
                  borderColor: themeKey === 'cyan' ? '#AC58E9' : 'rgba(255, 255, 255, 0.12)'
                }}
                title="Electric Cyan (Matrix Blue)"
              >
                CYAN
              </button>
            </div>
          </div>

          {/* Interactive Tribe Selector Button */}
          <div className="core-tribe-container">
            <div
              className="core-tribe-box clickable-pill"
              onClick={() => setShowTribeMenu(!showTribeMenu)}
              title="Click to switch strategy tribe optimization profile"
            >
              <span className="tribe-dot" style={{ background: theme.primary, boxShadow: `0 0 8px ${theme.primary}` }} />
              <span className="tribe-text">{selectedTribe.label}</span>
              <span className="dropdown-caret">▾</span>
            </div>

            {/* Tribe Dropdown Menu */}
            {showTribeMenu && (
              <div className="neural-dropdown-popover">
                <div className="dropdown-header">SELECT OPTIMIZATION TRIBE</div>
                {TRIBES.map((t) => (
                  <div
                    key={t.id}
                    className={`dropdown-item ${selectedTribe.id === t.id ? 'dropdown-item-active' : ''}`}
                    onClick={() => handleSelectTribe(t)}
                  >
                    <div className="item-title">{t.label}</div>
                    <div className="item-desc">{t.focus} • Target Sharpe: {t.targetSharpe}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Notification Toast */}
        {actionNotification && (
          <div className="neural-notification-banner" style={{ borderColor: theme.primary, color: '#FFFFFF' }}>
            <span>{actionNotification}</span>
            <button onClick={() => setActionNotification(null)} className="banner-dismiss-btn">✕</button>
          </div>
        )}

        {/* Center Stage: Rotating Concentric Radar HUD Rings + Swarm Canvas + Telemetry Center */}
        <div className="neural-radar-stage">
          {/* Animated SVG Concentric Radar HUD Ring Overlays */}
          <svg className="radar-svg-rings" viewBox="0 0 460 460">
            <defs>
              <filter id="themeRadarGlow">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Circular Hairline Guide */}
            <circle cx="230" cy="230" r="218" fill="none" stroke={`rgba(${theme.rgb}, 0.18)`} strokeWidth="1" />

            {/* Rotating Segmented Outer Arc Track 1 */}
            <circle
              className="rotating-arc-clockwise"
              cx="230"
              cy="230"
              r="215"
              fill="none"
              stroke={theme.primary}
              strokeWidth="2.4"
              strokeDasharray="210 110"
              strokeLinecap="round"
              filter="url(#themeRadarGlow)"
            />

            {/* Rotating Segmented Outer Arc Track 2 (Counter-rotating) */}
            <circle
              className="rotating-arc-counter"
              cx="230"
              cy="230"
              r="205"
              fill="none"
              stroke={`rgba(${theme.rgb}, 0.45)`}
              strokeWidth="1.2"
              strokeDasharray="90 140"
              strokeLinecap="round"
            />

            {/* Inner Concentric Hairline Ring */}
            <circle cx="230" cy="230" r="185" fill="none" stroke={`rgba(${theme.rgb}, 0.22)`} strokeWidth="1" />

            {/* Inner Dashed Coordinate Track */}
            <circle
              cx="230"
              cy="230"
              r="165"
              fill="none"
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />

            {/* 4 Cardinal Reticle Crosshair Ticks */}
            <line x1="230" y1="8" x2="230" y2="24" stroke={theme.primary} strokeWidth="2" />
            <line x1="230" y1="436" x2="230" y2="452" stroke={theme.primary} strokeWidth="2" />
            <line x1="8" y1="230" x2="24" y2="230" stroke={theme.primary} strokeWidth="2" />
            <line x1="436" y1="230" x2="452" y2="230" stroke={theme.primary} strokeWidth="2" />
          </svg>

          {/* HTML5 Canvas: Dynamic Breeding Candidates Swarm with Mouse Inspector */}
          <canvas
            ref={canvasRef}
            className="candidate-swarm-canvas"
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            onClick={handleCanvasClick}
            style={{ cursor: hoveredCandidate ? 'crosshair' : 'default' }}
          />

          {/* Floating Hover Tooltip for Candidates */}
          {hoveredCandidate && mousePos && (
            <div
              className="candidate-hover-tooltip"
              style={{
                borderColor: theme.primary,
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.9), 0 0 15px ${theme.glow}`
              }}
            >
              <div className="tooltip-header" style={{ color: theme.primary }}>
                GENOME #{hoveredCandidate.id} {hoveredCandidate.isSurvivor ? '★ TOP SURVIVOR' : ''}
              </div>
              <div className="tooltip-stat">Fitness: <strong>{hoveredCandidate.fitness} / 5.0</strong></div>
              <div className="tooltip-stat">Win Rate: <strong>{hoveredCandidate.winRate}%</strong></div>
              <div className="tooltip-stat">Sharpe Ratio: <strong>{hoveredCandidate.sharpe}</strong></div>
              <div className="tooltip-stat">Max Drawdown: <span style={{ color: '#AC58E9' }}>{hoveredCandidate.maxDd}%</span></div>
              <div className="tooltip-hint">Click to deploy to MetaTrader 5 IPC</div>
            </div>
          )}

          {/* Center Overlay Typography (Generation, Market, Typing Status) */}
          <div className="radar-center-text-block">
            {/* Clickable Generation Display */}
            <div
              className="generation-display clickable-gen"
              onClick={evolveNextGeneration}
              title="Click to breed and mutate the next generation immediately!"
            >
              <span className="gen-number">{generation}</span>
              <span className="gen-slash" style={{ color: theme.primary }}>
                /{maxGeneration}
              </span>
            </div>

            <div className="gen-label">G E N E R A T I O N</div>

            {/* Interactive Market Pair Dropdown Trigger */}
            <div className="market-dropdown-container">
              <div
                className="gen-ticker-pill"
                onClick={() => setShowMarketMenu(!showMarketMenu)}
                style={{
                  color: theme.primary,
                  borderColor: `rgba(${theme.rgb}, 0.35)`,
                  background: `rgba(${theme.rgb}, 0.1)`
                }}
                title="Click to switch candidate trading market"
              >
                <span>{selectedMarket.label}</span>
                <span className="dropdown-caret">▾</span>
              </div>

              {/* Market Selection Dropdown Menu */}
              {showMarketMenu && (
                <div className="neural-dropdown-popover market-popover">
                  <div className="dropdown-header">SWITCH CANDIDATE MARKET</div>
                  {MARKETS.map((m) => (
                    <div
                      key={m.id}
                      className={`dropdown-item ${selectedMarket.id === m.id ? 'dropdown-item-active' : ''}`}
                      onClick={() => handleSelectMarket(m)}
                    >
                      <div className="item-title" style={{ color: selectedMarket.id === m.id ? theme.primary : '#FFFFFF' }}>
                        {m.label}
                      </div>
                      <div className="item-desc">{m.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Typing Status with Blinking Cursor */}
            <div className="gen-status-text">
              <span>{statusText}</span>
              <span className="terminal-blinking-cursor" style={{ color: theme.primary }}>_</span>
            </div>

            {/* Quick Action Simulation Buttons */}
            <div className="radar-quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause simulation' : 'Resume simulation'}
              >
                {isPlaying ? '⏸ Pause' : '▶ Resume'}
              </button>

              <button
                className="quick-action-btn btn-breed"
                onClick={evolveNextGeneration}
                style={{ borderColor: theme.primary, color: theme.primary }}
                title="Trigger immediate genetic mutation"
              >
                ⚡ Breed Gen
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Telemetry Bar: 6 Real-time Quant Metrics (Clickable Drawers!) */}
        <div className="neural-telemetry-grid">
          {/* 1. TASKS */}
          <div
            className="telemetry-col clickable-telemetry"
            onClick={() => setShowTaskDrawer(!showTaskDrawer)}
            title="Click to inspect validation task breakdown"
          >
            <span className="telemetry-label">TASKS ▾</span>
            <span className="telemetry-val val-white">{tasks.completed} / {tasks.total}</span>
          </div>

          {/* 2. SURVIVORS */}
          <div
            className="telemetry-col clickable-telemetry"
            onClick={() => setShowSurvivorsDrawer(!showSurvivorsDrawer)}
            title="Click to view top surviving strategy genomes"
          >
            <span className="telemetry-label">SURVIVORS ▾</span>
            <span className="telemetry-val val-white">{survivors}</span>
          </div>

          {/* 3. TOP FITNESS */}
          <div
            className="telemetry-col clickable-telemetry"
            onClick={() => notify(`Top fitness score: ${topFitness.toFixed(2)} based on Sharpe, closed-bar stability, and ATR trailing limits.`)}
          >
            <span className="telemetry-label">TOP FITNESS</span>
            <span className="telemetry-val" style={{ color: theme.primary, textShadow: theme.textGlow }}>
              {topFitness.toFixed(2)}
            </span>
          </div>

          {/* 4. LAST SCORE */}
          <div
            className="telemetry-col clickable-telemetry"
            onClick={() => notify(`Latest evaluated candidate scored ${lastScore.toFixed(2)} with zero lookahead bias.`)}
          >
            <span className="telemetry-label">LAST SCORE</span>
            <span className="telemetry-val val-emerald">{lastScore.toFixed(2)}</span>
          </div>

          {/* 5. VAULTED */}
          <div
            className="telemetry-col clickable-telemetry"
            onClick={() => notify(`Total ${vaulted.toLocaleString()} strategies successfully vaulted to MetaTrader 5 & Deribit execution storage.`)}
          >
            <span className="telemetry-label">VAULTED</span>
            <span className="telemetry-val val-emerald">{vaulted.toLocaleString()}</span>
          </div>

          {/* 6. ELAPSED */}
          <div
            className="telemetry-col clickable-telemetry"
            onClick={() => setIsPlaying(!isPlaying)}
            title="Click to pause or resume simulation timer"
          >
            <span className="telemetry-label">ELAPSED {isPlaying ? '●' : '⏸'}</span>
            <span className="telemetry-val val-white">{formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Task Monitor Drawer Overlay */}
        {showTaskDrawer && (
          <div className="neural-telemetry-drawer">
            <div className="drawer-header">
              <span>VALIDATION PIPELINE (8/8 DETERMINISTIC GATES)</span>
              <button onClick={() => setShowTaskDrawer(false)} className="drawer-close-btn">✕</button>
            </div>
            <div className="drawer-tasks-list">
              {VALIDATION_TASKS.map((t, idx) => (
                <div key={idx} className="drawer-task-row">
                  <span className={`task-badge ${idx < tasks.completed ? 'task-pass' : idx === tasks.completed ? 'task-running' : 'task-pending'}`}>
                    {idx < tasks.completed ? 'PASS' : idx === tasks.completed ? 'RUNNING' : 'QUEUED'}
                  </span>
                  <div className="task-info">
                    <div className="task-name">{t.name}</div>
                    <div className="task-desc">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Survivors Leaderboard Drawer Overlay */}
        {showSurvivorsDrawer && (
          <div className="neural-telemetry-drawer">
            <div className="drawer-header">
              <span>TOP SURVIVOR STRATEGY GENOMES ({selectedMarket.label})</span>
              <button onClick={() => setShowSurvivorsDrawer(false)} className="drawer-close-btn">✕</button>
            </div>
            <div className="drawer-tasks-list">
              {particlesRef.current.slice(0, 5).map((p, idx) => (
                <div
                  key={p.id}
                  className={`drawer-task-row survivor-row ${selectedCandidateId === p.id ? 'survivor-selected' : ''}`}
                  onClick={() => {
                    setSelectedCandidateId(p.id);
                    notify(`Selected Strategy #${p.id} for MetaTrader 5 execution bridge.`);
                  }}
                >
                  <span className="task-badge task-pass">RANK #{idx + 1}</span>
                  <div className="task-info">
                    <div className="task-name">Candidate Strategy Genome #{p.id}</div>
                    <div className="task-desc">Fitness: {p.fitness} | Win Rate: {p.winRate}% | Sharpe: {p.sharpe} | Max DD: {p.maxDd}%</div>
                  </div>
                  <button className="survivor-deploy-btn" style={{ borderColor: theme.primary, color: theme.primary }}>
                    {selectedCandidateId === p.id ? '✓ LOCKED' : 'DEPLOY'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Interactive Controls Row: POWER & SMART */}
        <div className="neural-controls-row">
          {/* POWER Segmented Buttons */}
          <div className="control-group">
            <span className="control-label">POWER</span>
            <div className="segmented-pill-box">
              <button
                className={`segmented-btn ${powerMode === 'eco' ? 'btn-active' : ''}`}
                onClick={() => {
                  setPowerMode('eco');
                  notify('Switched to ECO power: 35 candidates, 40W calm simulation.');
                }}
                style={powerMode === 'eco' ? { background: theme.activeBtnBg, color: theme.activeBtnText } : {}}
              >
                ECO
              </button>
              <button
                className={`segmented-btn ${powerMode === 'balanced' ? 'btn-active' : ''}`}
                onClick={() => {
                  setPowerMode('balanced');
                  notify('Switched to BALANCED power: 55 candidates, 120W optimal simulation.');
                }}
                style={powerMode === 'balanced' ? { background: theme.activeBtnBg, color: theme.activeBtnText } : {}}
              >
                BALANCED
              </button>
              <button
                className={`segmented-btn ${powerMode === 'max' ? 'btn-active' : ''}`}
                onClick={() => {
                  setPowerMode('max');
                  notify('⚡ Switched to MAX TURBO: 80 candidates, 340W accelerated breeding!');
                }}
                style={powerMode === 'max' ? { background: theme.activeBtnBg, color: theme.activeBtnText } : {}}
              >
                MAX
              </button>
            </div>
          </div>

          {/* SMART Segmented Buttons */}
          <div className="control-group">
            <span className="control-label">SMART</span>
            <div className="segmented-pill-box">
              <button
                className={`segmented-btn ${smartMode ? 'btn-active' : ''}`}
                onClick={() => {
                  setSmartMode(true);
                  notify('Smart Mode ON: Deterministic walk-forward overfit protection active.');
                }}
                style={smartMode ? { background: theme.activeBtnBg, color: theme.activeBtnText } : {}}
              >
                ON
              </button>
              <button
                className={`segmented-btn ${!smartMode ? 'btn-active' : ''}`}
                onClick={() => {
                  setSmartMode(false);
                  notify('Smart Mode OFF: Raw genetic mutation drift (Exploratory mode).');
                }}
                style={!smartMode ? { background: theme.activeBtnBg, color: theme.activeBtnText } : {}}
              >
                OFF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
