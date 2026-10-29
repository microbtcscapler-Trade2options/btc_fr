import React, { useState, useEffect } from 'react';

interface Props {
  className?: string;
  btcPrice?: number;
  ipcLatency?: string;
  regimeState?: string;
  onEnterCockpit?: () => void;
}

export const EngineStatusHUD: React.FC<Props> = ({
  className,
  btcPrice = 84920.50,
  ipcLatency = '2.8ms',
  regimeState = 'TREND_EXPANSION',
  onEnterCockpit
}) => {
  // Real-time engine telemetry state
  const [engineLoad, setEngineLoad] = useState(76);
  const [memoryUsage, setMemoryUsage] = useState(68);
  const [consensusConfidence, setConsensusConfidence] = useState(94.2);
  const [drawdownPct] = useState(0.42);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Frequency audio / volatility equalizer spectrum values (24 bars)
  const [eqBars, setEqBars] = useState<number[]>([
    30, 45, 70, 85, 95, 65, 40, 55, 80, 90, 75, 60,
    45, 70, 88, 92, 60, 40, 50, 78, 85, 65, 45, 30
  ]);

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Engine telemetry pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setEngineLoad(+(74 + Math.sin(Date.now() / 1200) * 5 + Math.random() * 2).toFixed(1));
      setMemoryUsage(+(67 + Math.cos(Date.now() / 2000) * 3).toFixed(1));
      setConsensusConfidence(+(93.5 + Math.random() * 1.5).toFixed(1));

      // Jitter equalizer bars to create authentic "engine running" heartbeat
      setEqBars(prev =>
        prev.map(val => {
          const delta = (Math.random() - 0.48) * 18;
          return Math.max(15, Math.min(100, Math.round(val + delta)));
        })
      );
    }, 280);

    return () => clearInterval(interval);
  }, []);

  // SVG Circular Gauge helper
  const renderCircleGauge = (
    pct: number,
    label: string,
    valStr: string,
    subStr: string,
    color1: string,
    color2: string
  ) => {
    const radius = 42;
    const circ = 2 * Math.PI * radius;
    const strokeDash = (pct / 100) * circ;

    return (
      <div className="sci-fi-gauge-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', width: 110, height: 110 }}>
          <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
            />
            {/* Inner dashed ring */}
            <circle
              cx="55"
              cy="55"
              r={radius - 8}
              fill="none"
              stroke="rgba(172, 88, 233, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            {/* Animated Progress Gradient Ring */}
            <defs>
              <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color1} />
                <stop offset="100%" stopColor={color2} />
              </linearGradient>
            </defs>
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke={`url(#grad-${label.replace(/\s+/g, '')})`}
              strokeWidth="6"
              strokeDasharray={`${strokeDash} ${circ}`}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dasharray 0.4s ease',
                filter: `drop-shadow(0 0 8px ${color1})`
              }}
            />
          </svg>

          {/* Centered Readout */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5 }}>{label}</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 10px ${color1}` }}>
              {valStr}
            </span>
            <span style={{ fontSize: 8, color: color2, fontWeight: 700 }}>{subStr}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`scifi-hud-root ${className || ''}`}
      style={{
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '24px 28px',
        borderRadius: 24,
        background: 'linear-gradient(180deg, rgba(14, 18, 48, 0.85) 0%, rgba(6, 9, 26, 0.95) 100%)',
        border: '1px solid rgba(172, 88, 233, 0.35)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(172, 88, 233, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Cyber Frame Accents (Corner Brackets) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTop: '2px solid #AC58E9', borderLeft: '2px solid #AC58E9', borderTopLeftRadius: 24, opacity: 0.8 }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTop: '2px solid #AC58E9', borderRight: '2px solid #AC58E9', borderTopRightRadius: 24, opacity: 0.8 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottom: '2px solid #AC58E9', borderLeft: '2px solid #AC58E9', borderBottomLeftRadius: 24, opacity: 0.8 }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottom: '2px solid #AC58E9', borderRight: '2px solid #AC58E9', borderBottomRightRadius: 24, opacity: 0.8 }} />

      {/* 1. Header Bar: System Status + Digital Cockpit Clock (Image 4) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 10, height: 10 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#AC58E9', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <span style={{ position: 'relative', display: 'block', width: 10, height: 10, borderRadius: '50%', background: '#AC58E9', boxShadow: '0 0 10px #AC58E9' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1.5, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>
              SYSTEM DIAGNOSTICS // NEURA-ENGINE CORE HUD
            </div>
            <div style={{ fontSize: 10, color: '#AC58E9', fontWeight: 700, letterSpacing: 0.8 }}>
              KRONOS ADAPTER • VIBE TRADING COUNCIL • MT5 DIRECT IPC 2.8ms
            </div>
          </div>
        </div>

        {/* Center Futuristic Digital Clock (Image 4 "10:30 PM") */}
        <div style={{ textAlign: 'center', background: 'rgba(10, 14, 38, 0.6)', padding: '6px 20px', borderRadius: 16, border: '1px solid rgba(172, 88, 233, 0.25)', boxShadow: '0 0 15px rgba(172, 88, 233, 0.15)' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, textShadow: '0 0 10px rgba(172, 88, 233, 0.6)' }}>
            {currentTime || '12:00:00'} <span style={{ fontSize: 11, color: '#c084fc' }}>UTC</span>
          </div>
          <div style={{ fontSize: 9, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
            {currentDate || 'SYSTEM TIME'}
          </div>
        </div>

        {/* Right Action: Launch Full Cockpit */}
        {onEnterCockpit && (
          <button
            onClick={onEnterCockpit}
            style={{
              background: 'linear-gradient(135deg, #AC58E9 0%, #AC58E9 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 0.5,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(172, 88, 233, 0.4)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
          >
            <span>LAUNCH COCKPIT</span>
            <span style={{ fontSize: 14 }}>→</span>
          </button>
        )}
      </div>

      {/* 2. Middle Row: 3 Radial Dials + Real-Time Volatility Equalizer + Tactical Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'center' }}>

        {/* Panel A: 3 Circular SVG Engine Gauges (Image 4 CPU/Storage/Memory) */}
        <div
          style={{
            background: 'rgba(8, 12, 34, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 18,
            padding: '16px 12px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}
        >
          {renderCircleGauge(engineLoad, 'CPU LOAD', `${engineLoad}%`, '4.2 GHz', '#AC58E9', '#AC58E9')}
          {renderCircleGauge(consensusConfidence, 'CONSENSUS', `${consensusConfidence}%`, 'KRONOS+VIBE', '#AC58E9', '#c084fc')}
          {renderCircleGauge(memoryUsage, 'ENGINE RAM', `${memoryUsage}%`, '12.8 GB', '#AC58E9', '#AC58E9')}
        </div>

        {/* Panel B: Frequency Equalizer Bars (Image 4 Neon Dreams Media Equalizer) */}
        <div
          style={{
            background: 'rgba(8, 12, 34, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 18,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 142,
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#AC58E9', letterSpacing: 1, textTransform: 'uppercase' }}>
              MARKET VOLATILITY FREQUENCY SPECTRUM
            </span>
            <span style={{ fontSize: 10, color: '#c084fc', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              BTC TICK DYNAMICS
            </span>
          </div>

          {/* Equalizer Bar Columns */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 75, gap: 3 }}>
            {eqBars.map((heightPct, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${heightPct}%`,
                  background: `linear-gradient(180deg, #AC58E9 0%, #AC58E9 60%, #AC58E9 100%)`,
                  borderRadius: '3px 3px 1px 1px',
                  boxShadow: heightPct > 75 ? '0 0 10px rgba(172, 88, 233, 0.6)' : 'none',
                  transition: 'height 0.18s ease'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
            <span>20 Hz (MACRO)</span>
            <span>1 kHz (M15 FLOW)</span>
            <span>20 kHz (TICK L2)</span>
          </div>
        </div>

        {/* Panel C: Real-Time Oscilloscope Waveform (Image 4 Activity Wave) */}
        <div
          style={{
            background: 'rgba(8, 12, 34, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 18,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 142,
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#AC58E9', letterSpacing: 1, textTransform: 'uppercase' }}>
              ALPHA OSCILLOSCOPE WAVE
            </span>
            <span style={{ fontSize: 10, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
              +3.84% MOMENTUM
            </span>
          </div>

          {/* Animated SVG Wave */}
          <div style={{ position: 'relative', height: 70, overflow: 'hidden' }}>
            <svg width="100%" height="70" viewBox="0 0 300 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#AC58E9" />
                  <stop offset="50%" stopColor="#AC58E9" />
                  <stop offset="100%" stopColor="#AC58E9" />
                </linearGradient>
              </defs>
              {/* Background grid lines */}
              <line x1="0" y1="35" x2="300" y2="35" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
              {/* Pulsing neon sine wave */}
              <path
                d="M0,35 Q30,10 60,35 T120,35 T180,15 T240,55 T300,35"
                fill="none"
                stroke="url(#waveGlow)"
                strokeWidth="3"
                style={{
                  filter: 'drop-shadow(0 0 6px #AC58E9)'
                }}
              />
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", zIndex: 2 }}>
            <span>REGIME: {regimeState}</span>
            <span>IPC SPEED: {ipcLatency}</span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: Quick Status Telemetry Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ background: 'rgba(172, 88, 233, 0.15)', border: '1px solid rgba(172, 88, 233, 0.35)', padding: '5px 12px', borderRadius: 9999, fontSize: 10, color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#AC58E9' }} />
            DERIBIT 25D SKEW: -2.4% (CALL BIAS)
          </div>
          <div style={{ background: 'rgba(172, 88, 233, 0.15)', border: '1px solid rgba(172, 88, 233, 0.35)', padding: '5px 12px', borderRadius: 9999, fontSize: 10, color: '#AC58E9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#AC58E9' }} />
            LOPEZ DE PRADO TRIPLE-BARRIER: 73.8% WIN PROB
          </div>
          <div style={{ background: 'rgba(172, 88, 233, 0.15)', border: '1px solid rgba(172, 88, 233, 0.35)', padding: '5px 12px', borderRadius: 9999, fontSize: 10, color: '#AC58E9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#AC58E9' }} />
            DAILY DRAWDOWN: {drawdownPct}% / 4.0% MAX (SAFE)
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
          BTC/USDT SPOT: <span style={{ color: '#AC58E9' }}>${btcPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
