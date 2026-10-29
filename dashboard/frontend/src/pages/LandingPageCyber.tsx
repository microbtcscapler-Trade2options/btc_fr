import React, { useState, useEffect, useRef } from 'react';
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  fitness: number;
  color: string;
}

export const LandingPageCyber: React.FC<Props> = ({
  snapshot,
  onOpenAuth,
  onEnterTerminal,
  onOpenLab
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mutationRate, setMutationRate] = useState<number>(0.04);
  const [crossoverRate, setCrossoverRate] = useState<number>(0.85);
  const [generationCount, setGenerationCount] = useState<number>(24);
  const [activeCandidates, setActiveCandidates] = useState<number>(2340);
  const curPrice = snapshot?.latest_candle?.close || 84920.5;

  // Genetic Particle Swarm Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const colors = ['#FF0055', '#E11D48', '#AC58E9', '#7928CA', '#FFFFFF'];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        radius: Math.random() * 2.8 + 1.2,
        fitness: +(Math.random() * 2.5 + 2.5).toFixed(2),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(7, 3, 12, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw connection filaments between high-fitness candidate particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            ctx.strokeStyle = `rgba(255, 0, 85, ${(1 - dist / 85) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="cyber-page-root">
      {/* Top Cyber Command Bar */}
      <nav className="cyber-nav-bar">
        <div className="cyber-nav-brand">
          <span className="cyber-brand-hex">⬡</span>
          <span className="cyber-brand-text">NEURAL_GENESIS // T2O</span>
        </div>

        <div className="cyber-nav-center">
          <span className="cyber-tag-neon">CORE STATUS: RE-BREEDING ACTIVE</span>
          <span className="cyber-tag-cyan">BTC SPOT: ${curPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <span className="cyber-tag-cyan">GENOME POOL: {activeCandidates} CANDIDATES</span>
        </div>

        <div className="cyber-nav-actions">
          <button type="button" onClick={() => onOpenAuth('signin')} className="cyber-btn-ghost">
            OPERATOR LOGIN
          </button>
          <button type="button" onClick={() => onEnterTerminal('terminal')} className="cyber-btn-neon">
            ENTER TERMINAL
          </button>
        </div>
      </nav>

      {/* Hero Cyber Header */}
      <header className="cyber-hero-section">
        <div className="cyber-hero-inner">
          <div className="cyber-badge-glow">GENETIC BITCOIN MOMENTUM ALGORITHM</div>
          <h1 className="cyber-hero-title">
            EVOLVING TRADING GENOMES <br />
            <span className="cyber-text-gradient">ACROSS 6 YEARS OF BTC TICKS</span>
          </h1>
          <p className="cyber-hero-sub">
            Continuous walk-forward genetic selection. Strategies mutate, reproduce, and undergo out-of-sample
            Darwinian pruning to eliminate regime decay and lookahead overfitting.
          </p>

          <div className="cyber-cta-row">
            <button type="button" onClick={() => onEnterTerminal('terminal')} className="cyber-btn-primary">
              LAUNCH GENETIC COCKPIT
            </button>
            <button type="button" onClick={onOpenLab} className="cyber-btn-secondary">
              OPEN SIGNAL LAB
            </button>
          </div>
        </div>

        {/* 2,300+ Particle Swarm Canvas */}
        <div className="cyber-canvas-shell">
          <div className="canvas-header-bar">
            <span>CANDIDATE POPULATION SWARM DYNAMICS</span>
            <span className="text-cyan">LIVE FITNESS SURFACE</span>
          </div>
          <canvas ref={canvasRef} className="cyber-swarm-canvas" />
        </div>
      </header>

      {/* Interactive Genome Breeder Controls */}
      <section className="cyber-breeder-section">
        <div className="cyber-breeder-inner">
          <div className="cyber-section-title">
            <span className="cyber-tag-neon">GENETIC PARAMETER MATRIX</span>
            <h2>POPULATION BREEDER &amp; REGIME SELECTION</h2>
          </div>

          <div className="cyber-controls-grid">
            <div className="cyber-control-card">
              <span className="control-label">MUTATION PROBABILITY</span>
              <div className="control-value-row">
                <span className="control-val">{(mutationRate * 100).toFixed(1)}%</span>
                <span className="text-dim">GAUSSIAN JITTER</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.15"
                step="0.005"
                value={mutationRate}
                onChange={(e) => setMutationRate(parseFloat(e.target.value))}
                className="cyber-slider"
              />
            </div>

            <div className="cyber-control-card">
              <span className="control-label">CROSSOVER FRACTION</span>
              <div className="control-value-row">
                <span className="control-val">{(crossoverRate * 100).toFixed(0)}%</span>
                <span className="text-dim">TWO-POINT MESH</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.01"
                value={crossoverRate}
                onChange={(e) => setCrossoverRate(parseFloat(e.target.value))}
                className="cyber-slider"
              />
            </div>

            <div className="cyber-control-card">
              <span className="control-label">SURVIVOR CUTOFF</span>
              <div className="control-value-row">
                <span className="control-val">TOP 5%</span>
                <span className="text-dim">SHARPE &gt; 3.5</span>
              </div>
              <div className="cyber-meter-bar">
                <div className="meter-fill" style={{ width: '95%' }} />
              </div>
            </div>

            <div className="cyber-control-card">
              <span className="control-label">GENERATION ITERATION</span>
              <div className="control-value-row">
                <span className="control-val">{generationCount} / 50</span>
                <span className="text-cyan">STABLE STATE</span>
              </div>
              <div className="cyber-meter-bar">
                <div className="meter-fill" style={{ width: `${(generationCount / 50) * 100}%` }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="cyber-btn-neon"
              onClick={() => {
                setGenerationCount((g) => Math.min(50, g + 1));
                setActiveCandidates((c) => Math.floor(c * (1 + (Math.random() * 0.04 - 0.02))));
              }}
            >
              TRIGGER GENETIC MUTATION (NEXT EPOCH: GEN {generationCount + 1})
            </button>
          </div>
        </div>
      </section>

      {/* Cyber Footer */}
      <footer className="cyber-footer">
        <div className="cyber-footer-inner">
          <span>NEURAL GENESIS QUANT ENGINE • PROTOCOL 2026</span>
          <span className="text-cyan">BITCOIN MOMENTUM V3.8 // ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};
