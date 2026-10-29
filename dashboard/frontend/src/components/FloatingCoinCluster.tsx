import React from 'react';

export const FloatingCoinCluster: React.FC = () => {
  return (
    <div className="floating-coin-cluster-container">
      {/* 1. Wide Ambient Purple Glow Nebula */}
      <div className="cluster-ambient-glow" />

      {/* 2. Overlapping 3D Glowing Coin Cluster (Wide Expansive Spread) */}
      <div className="coin-cluster-overlap">
        {/* Coin 1: Orange/Red Bitcoin */}
        <div className="cluster-coin coin-btc-orange">
          <svg width="125" height="125" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="btcOrangeGrad" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="60%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#7C2D12" />
              </radialGradient>
              <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#F97316" strokeWidth="2.5" filter="url(#orangeGlow)" />
            <circle cx="50" cy="50" r="42" fill="url(#btcOrangeGrad)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
            <text x="50" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="38" fontWeight="900" fontFamily="'Plus Jakarta Sans', sans-serif">
              ₿
            </text>
          </svg>
        </div>

        {/* Coin 2: Electric Cyan / Blue Litecoin */}
        <div className="cluster-coin coin-ltc-blue">
          <svg width="112" height="112" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="ltcBlueGrad" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#AC58E9" />
                <stop offset="60%" stopColor="#581c87" />
                <stop offset="100%" stopColor="#082F49" />
              </radialGradient>
              <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#AC58E9" strokeWidth="2.5" filter="url(#blueGlow)" />
            <circle cx="50" cy="50" r="42" fill="url(#ltcBlueGrad)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
            <text x="50" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="36" fontWeight="900" fontFamily="'Plus Jakarta Sans', sans-serif">
              Ł
            </text>
          </svg>
        </div>

        {/* Coin 3: Deep Royal Purple Ethereum (Centerpiece) */}
        <div className="cluster-coin coin-eth-purple">
          <svg width="135" height="135" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="ethPurpleGrad" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="60%" stopColor="#007A18" />
                <stop offset="100%" stopColor="#2E1065" />
              </radialGradient>
              <filter id="purpleClusterGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#AC58E9" strokeWidth="3" filter="url(#purpleClusterGlow)" />
            <circle cx="50" cy="50" r="42" fill="url(#ethPurpleGrad)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
            <g transform="translate(32, 22) scale(0.72)">
              <polygon points="25,0 48,36 25,48 2,36" fill="rgba(255, 255, 255, 0.95)" />
              <polygon points="25,0 25,48 48,36" fill="rgba(172, 88, 233,  0.9)" />
              <polygon points="25,54 48,42 25,72 2,42" fill="rgba(192, 132, 252,  0.85)" />
              <polygon points="25,54 25,72 48,42" fill="rgba(172, 88, 233,  0.95)" />
            </g>
          </svg>
        </div>

        {/* Coin 4: Neon Violet Solana */}
        <div className="cluster-coin coin-sol-violet">
          <svg width="108" height="108" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="solVioletGrad" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#A21CAF" />
                <stop offset="100%" stopColor="#4A044E" />
              </radialGradient>
              <filter id="fuchsiaGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#FFFFFF" strokeWidth="2.5" filter="url(#fuchsiaGlow)" />
            <circle cx="50" cy="50" r="42" fill="url(#solVioletGrad)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
            <text x="50" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="34" fontWeight="900" fontFamily="'Plus Jakarta Sans', sans-serif">
              ◎
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
