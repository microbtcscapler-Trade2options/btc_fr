import React, { useState } from 'react';

interface Props {
  mousePos: { x: number; y: number };
  spotPrice?: number;
}

type ActiveAsset = 'BTC' | 'SOL' | 'ETH';

export const HangingCryptoCoins: React.FC<Props> = ({ mousePos, spotPrice = 81640.50 }) => {
  const [activeAsset, setActiveAsset] = useState<ActiveAsset>('BTC');

  // Smooth 3D tilt coordinates (-1 to 1 range scaled for perspective)
  const tiltX = (mousePos.x - 0.5) * 22;
  const tiltY = (mousePos.y - 0.5) * 14;
  const rotY = (mousePos.x - 0.5) * 15;
  const rotX = -(mousePos.y - 0.5) * 10;

  const handleSelectAsset = (asset: ActiveAsset) => {
    setActiveAsset(asset);
  };

  return (
    <div
      className="quantum-levitation-stage"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        position: 'relative',
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 10,
        paddingBottom: 20
      }}
    >
      {/* 1. CELESTIAL ORBITAL TRAJECTORY ARCS (Background curved space coordinate grid) */}
      <svg
        viewBox="0 0 920 380"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'visible'
        }}
      >
        <defs>
          <linearGradient id="orbitArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#AC58E9" stopOpacity="0" />
            <stop offset="25%" stopColor="#AC58E9" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#AC58E9" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#AC58E9" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Upper Sweeping Orbit Line */}
        <path
          d="M 20 80 Q 460 20 900 80"
          fill="none"
          stroke="url(#orbitArcGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          opacity="0.7"
        />

        {/* Main Equatorial Elliptical Ring behind Coins */}
        <path
          d="M 10 190 Q 460 110 910 190"
          fill="none"
          stroke="url(#orbitArcGrad)"
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Lower Convergent Gravity Arc */}
        <path
          d="M 40 300 Q 460 260 880 300"
          fill="none"
          stroke="url(#orbitArcGrad)"
          strokeWidth="1.2"
          strokeDasharray="3 5"
          opacity="0.6"
        />
      </svg>

      {/* 2. OVERHEAD TITANIUM & NEON QUANTUM GANTRY BEAM */}
      <div
        className="quantum-gantry-rig"
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '46px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          zIndex: 25
        }}
      >
        {/* Main Brushed Laser Rail */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '3%',
            right: '3%',
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(172, 88, 233, 0.4) 15%, rgba(172, 88, 233, 0.9) 50%, rgba(172, 88, 233, 0.9) 70%, transparent 100%)',
            boxShadow: '0 0 16px rgba(172, 88, 233, 0.8), 0 0 30px rgba(172, 88, 233, 0.4)',
            borderRadius: '999px'
          }}
        />

        {/* Secondary Sub-Conduit Rail */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '8%',
            right: '8%',
            height: '1px',
            background: 'rgba(255, 255, 255, 0.16)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)'
          }}
        />

        {/* Gantry Anchor Points with Optical Emitting Gems & Labels Directly Below */}
        {[
          { key: 'SOL', label: 'SOL-NODE 01', pos: '20%', color: '#AC58E9' },
          { key: 'BTC', label: 'BTC-ALPHA CORE', pos: '50%', color: '#FFFFFF' },
          { key: 'ETH', label: 'ETH-SETTLE 02', pos: '80%', color: '#AC58E9' }
        ].map((node) => {
          const isSelected = activeAsset === node.key;
          return (
            <div
              key={node.key}
              onClick={() => handleSelectAsset(node.key as ActiveAsset)}
              style={{
                position: 'absolute',
                left: node.pos,
                top: '4px',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                cursor: 'pointer',
                zIndex: 30
              }}
            >
              {/* Glowing Concentric Anchor Gem on Rail */}
              <div
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: '50%',
                  background: '#080210',
                  border: `2px solid ${isSelected ? '#FFFFFF' : node.color}`,
                  boxShadow: isSelected
                    ? `0 0 18px #FFFFFF, 0 0 28px ${node.color}, inset 0 0 8px ${node.color}`
                    : `0 0 14px ${node.color}, inset 0 0 6px ${node.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ width: 4.5, height: 4.5, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 6px #FFFFFF' }} />
              </div>

              {/* Status Tag Below Gem */}
              <span
                style={{
                  fontSize: 8.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  letterSpacing: 0.8,
                  fontWeight: 800,
                  textShadow: isSelected ? `0 0 8px ${node.color}` : 'none',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                {node.label}
              </span>

              {/* Emitter Nozzle pointing downwards */}
              <div
                style={{
                  width: 5,
                  height: 3,
                  background: node.color,
                  borderRadius: '0 0 2px 2px',
                  boxShadow: `0 0 8px ${node.color}`,
                  marginTop: -1
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 3. BACKGROUND DEPTH-OF-FIELD ASTRAL PARTICLES */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 2
        }}
      >
        {[
          { x: 10, y: 32, size: 36, symbol: 'Ł', color: '#AC58E9', blur: 3 },
          { x: 26, y: 16, size: 28, symbol: '◈', color: '#FFFFFF', blur: 4 },
          { x: 74, y: 18, size: 32, symbol: '⬡', color: '#c084fc', blur: 3 },
          { x: 90, y: 44, size: 38, symbol: '◎', color: '#AC58E9', blur: 2 },
          { x: 50, y: 86, size: 24, symbol: '✦', color: '#FFFFFF', blur: 5 }
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate3d(${tiltX * 0.3}px, ${tiltY * 0.3}px, 0)`,
              width: item.size,
              height: item.size,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(20, 8, 32, 0.8) 0%, rgba(5, 2, 10, 0.95) 100%)',
              border: `1px solid ${item.color}40`,
              boxShadow: `0 0 16px ${item.color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.color,
              fontSize: item.size * 0.45,
              fontWeight: 800,
              filter: `blur(${item.blur}px)`,
              opacity: 0.55,
              transition: 'transform 0.2s ease-out'
            }}
          >
            {item.symbol}
          </div>
        ))}
      </div>

      {/* 4. MAIN INTERACTIVE 3D TRI-ASSET LEVITATION MATRIX */}
      <div
        className="quantum-matrix-container"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '920px',
          minHeight: '380px',
          marginTop: '0px',
          zIndex: 10,
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* =========================================================================
            ASSET 1: LEFT WING — SOLANA HIGH-THROUGHPUT ARBITRAGE NODE
            ========================================================================= */}
        <div
          onClick={() => handleSelectAsset('SOL')}
          style={{
            position: 'absolute',
            left: '20%',
            top: '0px',
            transform: `translateX(-50%) translateZ(${activeAsset === 'SOL' ? '50px' : '0px'})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: activeAsset === 'SOL' ? 35 : 15,
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Continuous Laser Tractor Conduit dropping straight from Gantry Nozzle */}
          <div
            style={{
              width: '2px',
              height: '68px',
              background: 'linear-gradient(180deg, #c084fc 0%, rgba(172, 88, 233, 0.5) 50%, #AC58E9 100%)',
              boxShadow: '0 0 14px rgba(172, 88, 233, 0.8), 0 0 24px rgba(172, 88, 233, 0.4)',
              position: 'relative'
            }}
          >
            {/* Flowing energy pulse dot */}
            <div
              style={{
                position: 'absolute',
                top: '45%',
                left: '-2px',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 8px #AC58E9'
              }}
            />

            {/* Magnetic Clamp Collar on Coin Rim */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                left: -6,
                width: 14,
                height: 8,
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #c084fc, #AC58E9)',
                boxShadow: '0 0 10px #AC58E9',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}
            />
          </div>

          {/* 3D Solana Disc (112px) */}
          <div
            style={{
              position: 'relative',
              width: '112px',
              height: '112px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #1f0b33 0%, #11051e 55%, #05020a 100%)',
              border: activeAsset === 'SOL' ? '2.5px solid #AC58E9' : '2px solid rgba(172, 88, 233, 0.7)',
              boxShadow: activeAsset === 'SOL'
                ? '0 0 35px rgba(172, 88, 233, 0.75), 0 16px 36px rgba(0,0,0,0.85), inset 0 0 18px rgba(172, 88, 233, 0.45)'
                : '0 0 24px rgba(172, 88, 233, 0.35), 0 12px 28px rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Outer Graduation Ring */}
            <svg width="112" height="112" viewBox="0 0 112 112" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <circle cx="56" cy="56" r="50" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 4" />
              <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(172, 88, 233, 0.35)" strokeWidth="1" />
            </svg>

            {/* Solana 3-Bar Emblem */}
            <svg width="56" height="56" viewBox="0 0 100 100">
              <g transform="translate(10, 16) scale(0.8)">
                <path d="M 6.4 12.8 L 74.2 12.8 C 77.8 12.8 81.3 15.6 81.3 19.2 C 81.3 22.8 77.8 25.6 74.2 25.6 L 6.4 25.6 C 2.8 25.6 0 22.8 0 19.2 C 0 15.6 2.8 12.8 6.4 12.8 Z" fill="#AC58E9" />
                <path d="M 19.2 38.4 L 87.0 38.4 C 90.6 38.4 93.4 41.2 93.4 44.8 C 93.4 48.4 90.6 51.2 87.0 51.2 L 19.2 51.2 C 15.6 51.2 12.8 48.4 12.8 44.8 C 12.8 41.2 15.6 38.4 19.2 38.4 Z" fill="#ffffff" />
                <path d="M 6.4 64.0 L 74.2 64.0 C 77.8 64.0 81.3 66.8 81.3 70.4 C 81.3 74.0 77.8 76.8 74.2 76.8 L 6.4 76.8 C 2.8 76.8 0 74.0 0 70.4 C 0 66.8 2.8 64.0 6.4 64.0 Z" fill="#c084fc" />
              </g>
            </svg>
          </div>

          {/* Asset Telemetry Card Below Coin */}
          <div
            style={{
              marginTop: 14,
              background: 'rgba(12, 4, 20, 0.94)',
              border: activeAsset === 'SOL' ? '1.5px solid #AC58E9' : '1px solid rgba(172, 88, 233, 0.4)',
              borderRadius: '12px',
              padding: '7px 14px',
              textAlign: 'center',
              boxShadow: activeAsset === 'SOL'
                ? '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 16px rgba(172, 88, 233, 0.4)'
                : '0 8px 24px rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(12px)',
              minWidth: '105px',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: '#FFFFFF', letterSpacing: 0.5 }}>SOL / USDT</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
              $174.20
            </div>
            <div style={{ fontSize: 8.5, color: '#ffffff', fontWeight: 800, marginTop: 2 }}>
              ▲ +5.14% • 2.4k TPS
            </div>
          </div>
        </div>

        {/* =========================================================================
            ASSET 2: CENTERPIECE — 3D GIANT BITCOIN QUANTUM MOMENTUM CORE
            ========================================================================= */}
        <div
          onClick={() => handleSelectAsset('BTC')}
          style={{
            position: 'absolute',
            left: '50%',
            top: '0px',
            transform: `translateX(-50%) translateZ(${activeAsset === 'BTC' ? '70px' : '30px'})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 40,
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Continuous High-Intensity Laser Tractor Conduit dropping from Gantry Nozzle */}
          <div
            style={{
              width: '3px',
              height: '38px',
              background: 'linear-gradient(180deg, #ffffff 0%, #AC58E9 55%, #7928ca 100%)',
              boxShadow: '0 0 18px #AC58E9, 0 0 30px #AC58E9',
              position: 'relative'
            }}
          >
            {/* Flowing Pulse Dot */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '-2.5px',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 10px #FFFFFF, 0 0 16px #AC58E9'
              }}
            />

            {/* Master Magnetic Clamp Collar */}
            <div
              style={{
                position: 'absolute',
                bottom: -5,
                left: -7,
                width: 17,
                height: 10,
                borderRadius: '5px',
                background: 'linear-gradient(135deg, #ffffff, #AC58E9)',
                boxShadow: '0 0 14px #AC58E9',
                border: '1px solid #FFFFFF'
              }}
            />
          </div>

          {/* Master 3D Bitcoin Disc (184px Diameter) */}
          <div
            style={{
              position: 'relative',
              width: '184px',
              height: '184px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #2e0854 0%, #16042a 45%, #05010a 90%)',
              border: activeAsset === 'BTC' ? '3px solid #AC58E9' : '2.5px solid rgba(172, 88, 233, 0.8)',
              boxShadow: activeAsset === 'BTC'
                ? '0 0 50px rgba(172, 88, 233, 0.75), 0 0 90px rgba(172, 88, 233, 0.45), 0 24px 50px rgba(0,0,0,0.9), inset 0 0 32px rgba(172, 88, 233, 0.4)'
                : '0 0 35px rgba(172, 88, 233, 0.5), 0 20px 40px rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Outer Rotating Gyro Azimuth Ring */}
            <svg
              width="184"
              height="184"
              viewBox="0 0 184 184"
              className="gyro-ring-cw"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              <circle cx="92" cy="92" r="84" fill="none" stroke="rgba(172, 88, 233, 0.65)" strokeWidth="1.5" strokeDasharray="6 5" />
              <circle cx="92" cy="92" r="76" fill="none" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" strokeDasharray="2 3" />
              {/* Cardinal Notch Marks */}
              <line x1="92" y1="4" x2="92" y2="12" stroke="#AC58E9" strokeWidth="2.5" />
              <line x1="92" y1="172" x2="92" y2="180" stroke="#AC58E9" strokeWidth="2.5" />
              <line x1="4" y1="92" x2="12" y2="92" stroke="#AC58E9" strokeWidth="2.5" />
              <line x1="172" y1="92" x2="180" y2="92" stroke="#AC58E9" strokeWidth="2.5" />
            </svg>

            {/* Inner Counter-Rotating Orbit Ring */}
            <svg
              width="184"
              height="184"
              viewBox="0 0 184 184"
              className="gyro-ring-ccw"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              <circle cx="92" cy="92" r="66" fill="none" stroke="rgba(172, 88, 233, 0.45)" strokeWidth="1" strokeDasharray="12 8" />
            </svg>

            {/* Lightning Circuit Arcs */}
            <svg width="184" height="184" viewBox="0 0 184 184" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.85 }}>
              <path d="M 44 58 L 62 80 L 56 90 L 74 110 L 68 124 L 84 143" stroke="#AC58E9" strokeWidth="1.6" fill="none" filter="drop-shadow(0 0 6px #AC58E9)" />
              <path d="M 140 60 L 122 80 L 128 90 L 110 113 L 118 127 L 105 143" stroke="#ffffff" strokeWidth="1.6" fill="none" filter="drop-shadow(0 0 6px #ffffff)" />
            </svg>

            {/* Central Glowing 3D Bitcoin ₿ Emblem */}
            <div
              style={{
                fontSize: 78,
                fontWeight: 900,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#FFFFFF',
                textShadow: '0 0 20px #FFFFFF, 0 0 40px #AC58E9, 0 0 60px #AC58E9',
                lineHeight: 1,
                userSelect: 'none',
                transform: 'translateY(-2px)'
              }}
            >
              ₿
            </div>
          </div>

          {/* Master Telemetry Card Below Center Coin */}
          <div
            style={{
              marginTop: 14,
              background: 'linear-gradient(135deg, rgba(16, 5, 26, 0.96) 0%, rgba(6, 2, 12, 0.98) 100%)',
              border: '1.5px solid rgba(172, 88, 233, 0.65)',
              borderRadius: '14px',
              padding: '9px 20px',
              textAlign: 'center',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.85), 0 0 24px rgba(172, 88, 233, 0.35)',
              backdropFilter: 'blur(16px)',
              minWidth: '180px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span className="pulse-dot" style={{ color: '#AC58E9', width: 6, height: 6 }} />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#FFFFFF', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                BTC / USDT • SPOT
              </span>
            </div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: 3,
                letterSpacing: 0.5
              }}
            >
              ${spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 9.5, color: '#c084fc', fontWeight: 800, marginTop: 2, letterSpacing: 0.4 }}>
              ▲ +3.42% 24H • DETERMINISTIC CLOSED-BAR
            </div>
          </div>
        </div>

        {/* =========================================================================
            ASSET 3: RIGHT WING — ETHEREUM INSTITUTIONAL SETTLEMENT PRISM
            ========================================================================= */}
        <div
          onClick={() => handleSelectAsset('ETH')}
          style={{
            position: 'absolute',
            left: '80%',
            top: '0px',
            transform: `translateX(-50%) translateZ(${activeAsset === 'ETH' ? '50px' : '0px'})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: activeAsset === 'ETH' ? 35 : 15,
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Continuous Laser Tractor Conduit dropping straight from Gantry Nozzle */}
          <div
            style={{
              width: '2px',
              height: '68px',
              background: 'linear-gradient(180deg, #AC58E9 0%, rgba(172, 88, 233, 0.5) 50%, #c084fc 100%)',
              boxShadow: '0 0 14px rgba(172, 88, 233, 0.8), 0 0 24px rgba(172, 88, 233, 0.4)',
              position: 'relative'
            }}
          >
            {/* Flowing energy pulse dot */}
            <div
              style={{
                position: 'absolute',
                top: '45%',
                left: '-2px',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 8px #c084fc'
              }}
            />

            {/* Magnetic Clamp Collar on Coin Rim */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                left: -6,
                width: 14,
                height: 8,
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #AC58E9, #ffffff)',
                boxShadow: '0 0 10px #AC58E9',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}
            />
          </div>

          {/* 3D Ethereum Disc (112px) */}
          <div
            style={{
              position: 'relative',
              width: '112px',
              height: '112px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #241148 0%, #140728 55%, #05020a 100%)',
              border: activeAsset === 'ETH' ? '2.5px solid #AC58E9' : '2px solid rgba(172, 88, 233, 0.7)',
              boxShadow: activeAsset === 'ETH'
                ? '0 0 35px rgba(172, 88, 233, 0.75), 0 16px 36px rgba(0,0,0,0.85), inset 0 0 18px rgba(172, 88, 233, 0.45)'
                : '0 0 24px rgba(172, 88, 233, 0.35), 0 12px 28px rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Outer Graduation Ring */}
            <svg width="112" height="112" viewBox="0 0 112 112" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <circle cx="56" cy="56" r="50" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 4" />
              <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(172, 88, 233, 0.35)" strokeWidth="1" />
            </svg>

            {/* Ethereum Diamond Prism Emblem */}
            <svg width="56" height="56" viewBox="0 0 100 100">
              <g transform="translate(25, 14) scale(1)">
                <polygon points="25,0 48,36 25,48 2,36" fill="rgba(255, 255, 255, 0.95)" />
                <polygon points="25,0 25,48 48,36" fill="rgba(172, 88, 233, 0.85)" />
                <polygon points="25,54 48,42 25,72 2,42" fill="rgba(192, 132, 252, 0.75)" />
                <polygon points="25,54 25,72 48,42" fill="rgba(255, 255, 255, 0.95)" />
              </g>
            </svg>
          </div>

          {/* Asset Telemetry Card Below Coin */}
          <div
            style={{
              marginTop: 14,
              background: 'rgba(12, 4, 20, 0.94)',
              border: activeAsset === 'ETH' ? '1.5px solid #AC58E9' : '1px solid rgba(172, 88, 233, 0.4)',
              borderRadius: '12px',
              padding: '7px 14px',
              textAlign: 'center',
              boxShadow: activeAsset === 'ETH'
                ? '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 16px rgba(172, 88, 233, 0.4)'
                : '0 8px 24px rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(12px)',
              minWidth: '105px',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: '#FFFFFF', letterSpacing: 0.5 }}>ETH / USDT</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
              $2,648.90
            </div>
            <div style={{ fontSize: 8.5, color: '#ffffff', fontWeight: 800, marginTop: 2 }}>
              ▲ +2.88% • GAS 12 GWEI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
