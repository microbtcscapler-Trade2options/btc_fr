import React, { useState } from 'react';

export const StandingCoinsRow: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const coins = [
    {
      symbol: '∞',
      name: 'Polkadot',
      ticker: 'DOT',
      role: 'Cross-Chain Settle',
      color: '#c084fc',
      glow: '#AC58E9',
      rotate: '-14deg',
      offset: '8px'
    },
    {
      symbol: 'Ξ',
      name: 'Ethereum',
      ticker: 'ETH',
      role: 'Collar Hedged',
      color: '#ffffff',
      glow: '#AC58E9',
      rotate: '-7deg',
      offset: '3px'
    },
    {
      symbol: '₿',
      name: 'Bitcoin',
      ticker: 'BTC',
      role: 'Primary Alpha Core',
      color: '#FFFFFF',
      glow: '#AC58E9',
      rotate: '0deg',
      offset: '0px',
      isCenter: true
    },
    {
      symbol: '◎',
      name: 'Solana',
      ticker: 'SOL',
      role: 'High Vol Harvest',
      color: '#AC58E9',
      glow: '#c084fc',
      rotate: '7deg',
      offset: '3px'
    },
    {
      symbol: '⬡',
      name: 'Polygon',
      ticker: 'POL',
      role: 'L2 Micro-Arb',
      color: '#ffffff',
      glow: '#7928ca',
      rotate: '14deg',
      offset: '8px'
    }
  ];

  return (
    <div className="standing-coins-container">
      {/* 3D Stage with Standing Coins and Physical Reflection */}
      <div className="standing-coins-stage">
        {/* Active Hover Tag Pill */}
        <div
          style={{
            height: '24px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {hoveredIdx !== null ? (
            <div
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800,
                color: '#FFFFFF',
                background: 'rgba(172, 88, 233, 0.2)',
                border: '1px solid rgba(172, 88, 233, 0.5)',
                padding: '2px 12px',
                borderRadius: 9999,
                letterSpacing: 1,
                boxShadow: '0 0 12px rgba(172, 88, 233, 0.4)'
              }}
            >
              {coins[hoveredIdx].name} ({coins[hoveredIdx].ticker}) • {coins[hoveredIdx].role}
            </div>
          ) : (
            <div
              style={{
                fontSize: 9.5,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(255, 255, 255, 0.35)',
                letterSpacing: 1.5,
                textTransform: 'uppercase'
              }}
            >
              // 5-TOKEN MULTI-VENUE COLLATERAL MESH //
            </div>
          )}
        </div>

        {/* 1. Row of Upright 3D Coins */}
        <div className="standing-coins-flex">
          {coins.map((c, i) => (
            <div
              key={i}
              className={`standing-coin-item ${c.isCenter ? 'center-standing' : ''}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                transform: `translateY(${c.offset}) rotateY(${c.rotate})`,
                zIndex: c.isCenter ? 12 : 6 - Math.abs(2 - i)
              }}
            >
              {/* The Physical Upright Standing 3D Coin Disc */}
              <div className="standing-coin-disc">
                <svg width={c.isCenter ? "112" : "88"} height={c.isCenter ? "112" : "88"} viewBox="0 0 100 100">
                  <defs>
                    <radialGradient id={`standGrad-${i}`} cx="50%" cy="45%" r="55%">
                      <stop offset="0%" stopColor={c.glow} stopOpacity="0.9" />
                      <stop offset="55%" stopColor="#2e0854" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#080210" stopOpacity="0.98" />
                    </radialGradient>
                    <filter id={`standGlow-${i}`} x="-25%" y="-25%" width="150%" height="150%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Outer Neon Glowing Edge */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke={c.glow} strokeWidth="3" filter={`url(#standGlow-${i})`} />
                  {/* 3D Rim Ring */}
                  <circle cx="50" cy="50" r="43" fill={`url(#standGrad-${i})`} stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="37" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Coin Symbol */}
                  <text
                    x="50"
                    y="59"
                    textAnchor="middle"
                    fill={c.color}
                    fontSize={c.isCenter ? "40" : "32"}
                    fontWeight="900"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    style={{ filter: `drop-shadow(0 0 8px ${c.glow})` }}
                  >
                    {c.symbol}
                  </text>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Laser Contact Horizon Line between coins and floor */}
        <div className="reflective-floor-line" />

        {/* 3. Inverted Specular Mirror Reflection Row */}
        <div className="standing-reflections-flex">
          {coins.map((c, i) => (
            <div
              key={i}
              className="standing-reflection-item"
              style={{
                transform: `rotateY(${c.rotate})`,
                zIndex: c.isCenter ? 10 : 5 - Math.abs(2 - i),
                opacity: hoveredIdx === i ? 0.9 : 0.65
              }}
            >
              <svg width={c.isCenter ? "112" : "88"} height={c.isCenter ? "54" : "42"} viewBox="0 0 100 50">
                <defs>
                  <linearGradient id={`reflFade-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.glow} stopOpacity="0.5" />
                    <stop offset="60%" stopColor={c.glow} stopOpacity="0.12" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <ellipse cx="50" cy="6" rx="42" ry="16" fill={`url(#reflFade-${i})`} />
                <text
                  x="50"
                  y="0"
                  textAnchor="middle"
                  fill={c.color}
                  fontSize={c.isCenter ? "36" : "28"}
                  fontWeight="900"
                  opacity="0.30"
                  transform="matrix(1 0 0 -1 0 32)"
                >
                  {c.symbol}
                </text>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
