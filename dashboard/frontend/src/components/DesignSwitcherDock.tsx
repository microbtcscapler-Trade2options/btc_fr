import React, { useState } from 'react';

export type DesignPattern = 'cosmic-apex' | 'bloomberg-obsidian' | 'cyber-genesis' | 'bitcoin-gold' | 'swiss-atelier';

interface Props {
  currentPattern: DesignPattern;
  onSelectPattern: (pattern: DesignPattern) => void;
}

interface PatternInfo {
  id: DesignPattern;
  num: string;
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
  bgGlow: string;
}

const PATTERNS: PatternInfo[] = [
  {
    id: 'cosmic-apex',
    num: '01',
    title: 'Hacker Green Apex',
    subtitle: 'Algory Scrollytelling & Matrix Theme',
    badge: 'MATRIX',
    accent: '#AC58E9',
    bgGlow: 'rgba(172, 88, 233, 0.4)'
  },
  {
    id: 'bloomberg-obsidian',
    num: '02',
    title: 'Bloomberg Obsidian',
    subtitle: 'High-Density Quant Terminal',
    badge: 'DATA DENSE',
    accent: '#AC58E9',
    bgGlow: 'rgba(172, 88, 233, 0.4)'
  },
  {
    id: 'cyber-genesis',
    num: '03',
    title: 'Cyber Genesis',
    subtitle: 'Neural Swarm & Genetic HUD',
    badge: 'BIOMETRIC',
    accent: '#FF0055',
    bgGlow: 'rgba(255, 0, 85, 0.4)'
  },
  {
    id: 'bitcoin-gold',
    num: '04',
    title: 'Bitcoin Sovereign',
    subtitle: '100% BTC Derivatives & Collar',
    badge: 'BTC MAX',
    accent: '#F7931A',
    bgGlow: 'rgba(247, 147, 26, 0.4)'
  },
  {
    id: 'swiss-atelier',
    num: '05',
    title: 'Swiss Atelier',
    subtitle: 'Minimal Precision & Math Proof',
    badge: 'ARCHITECTURAL',
    accent: '#AC58E9',
    bgGlow: 'rgba(172, 88, 233,  0.4)'
  }
];

export const DesignSwitcherDock: React.FC<Props> = ({ currentPattern, onSelectPattern }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentPatternInfo = PATTERNS.find((p) => p.id === currentPattern) || PATTERNS[0];

  return (
    <aside className="design-switcher-dock-v2" aria-label="Design Pattern Selector">
      {/* Floating Trigger Pill (Never blocks page content) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`dock-trigger-pill ${isOpen ? 'pill-open' : ''}`}
        style={{
          borderColor: currentPatternInfo.accent,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px ${currentPatternInfo.bgGlow}`
        }}
      >
        <span className="dock-trigger-led" style={{ background: currentPatternInfo.accent }} />
        <span className="dock-trigger-text">
          {currentPatternInfo.num} {currentPatternInfo.title}
        </span>
        <span className="dock-trigger-icon">{isOpen ? '✕' : '⚙'}</span>
      </button>

      {/* Expanded Modal/Flyout Drawer */}
      {isOpen && (
        <div className="dock-flyout-drawer">
          <div className="dock-flyout-header">
            <div className="flyout-title-row">
              <span className="dock-pulse-led" />
              <span className="flyout-title">5 INSTITUTIONAL DESIGN PATTERNS</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flyout-close-btn"
              title="Close Switcher"
            >
              ✕
            </button>
          </div>

          <div className="dock-flyout-grid">
            {PATTERNS.map((p) => {
              const isActive = currentPattern === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectPattern(p.id);
                    setIsOpen(false);
                  }}
                  className={`flyout-pattern-card ${isActive ? 'card-active' : ''}`}
                  style={{
                    borderColor: isActive ? p.accent : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: isActive ? `0 0 16px ${p.bgGlow}, inset 0 1px 0 rgba(255,255,255,0.15)` : 'none'
                  }}
                >
                  <div className="card-top-row">
                    <span className="card-num" style={{ color: p.accent }}>
                      {p.num}
                    </span>
                    <span
                      className="card-badge"
                      style={{
                        background: `${p.accent}22`,
                        color: p.accent,
                        borderColor: `${p.accent}55`
                      }}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <div className="card-title" style={{ color: isActive ? '#FFFFFF' : '#E2E8F0' }}>
                    {p.title}
                  </div>
                  <div className="card-desc">{p.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
