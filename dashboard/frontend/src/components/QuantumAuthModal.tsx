import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onLoginSuccess: (operatorName: string) => void;
}

export const QuantumAuthModal: React.FC<Props> = ({
  isOpen,
  initialMode: _initialMode = 'signin',
  onClose,
  onLoginSuccess
}) => {
  const [operatorId, setOperatorId] = useState('lead_quant_trader');
  const [passphrase, setPassphrase] = useState('••••••••••••');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('SECURE BIOMETRIC / PASSKEY GATEWAY');

  if (!isOpen) return null;

  const handleInstantBiometricAuth = () => {
    setIsScanning(true);
    setStatusMessage('SCANNING QUANT PASSKEY BIOMETRICS...');

    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setScanProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStatusMessage('ACCESS GRANTED • NEURA-CORE SYNCHRONIZED');
        setTimeout(() => {
          setIsScanning(false);
          onLoginSuccess(operatorId || 'Lead Quant Operator');
          onClose();
        }, 500);
      }
    }, 120);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInstantBiometricAuth();
  };

  return (
    <div
      className="quantum-auth-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 22, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        className="quantum-auth-card"
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'linear-gradient(180deg, rgba(10, 3, 18, 0.96) 0%, rgba(4, 1, 8, 0.98) 100%)',
          borderRadius: 24,
          border: '1.5px solid rgba(172, 88, 233, 0.45)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 45px rgba(172, 88, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          padding: '32px 36px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Futuristic Corner Brackets (Image 4 Cyber HUD) */}
        <span style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTop: '2px solid #AC58E9', borderLeft: '2px solid #AC58E9', borderTopLeftRadius: 24 }} />
        <span style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTop: '2px solid #AC58E9', borderRight: '2px solid #AC58E9', borderTopRightRadius: 24 }} />
        <span style={{ position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderBottom: '2px solid #c084fc', borderLeft: '2px solid #c084fc', borderBottomLeftRadius: 24 }} />
        <span style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottom: '2px solid #AC58E9', borderRight: '2px solid #AC58E9', borderBottomRightRadius: 24 }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#AC58E9', boxShadow: '0 0 10px #AC58E9' }} />
              <span style={{ fontSize: 10, fontWeight: 900, color: '#AC58E9', letterSpacing: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>
                TRADE2OPTIONS SECURITY
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: -0.5 }}>
              Neura-Engine Access
            </h2>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0 0' }}>
              {statusMessage}
            </p>
          </div>
          <button
            data-testid="auth-close-btn"
            className="auth-close-btn"
            aria-label="Close Security Modal"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#ffffff',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Biometric Fingerprint / Hologram Scanner (Image 4) */}
        <div
          onClick={handleInstantBiometricAuth}
          style={{
            margin: '0 auto 24px auto',
            width: 110,
            height: 110,
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(172, 88, 233, 0.15) 0%, rgba(121, 40, 202, 0.1) 100%)',
            border: '1.5px solid rgba(172, 88, 233, 0.4)',
            boxShadow: isScanning ? '0 0 30px rgba(172, 88, 233, 0.8), inset 0 0 20px rgba(172, 88, 233, 0.6)' : '0 0 20px rgba(172, 88, 233, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Laser Scan line sweeping down */}
          <div
            style={{
              position: 'absolute',
              top: `${scanProgress}%`,
              left: 0,
              right: 0,
              height: 2,
              background: '#AC58E9',
              boxShadow: '0 0 12px #AC58E9, 0 0 24px #AC58E9',
              transition: isScanning ? 'top 0.12s linear' : 'none'
            }}
          />

          {/* Fingerprint / Hologram SVG Icon */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#AC58E9" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 7 9.5" />
            <path d="M12 6a6 6 0 0 0-6 6c0 2.2 1.2 4.1 3 5.2" />
            <path d="M12 10a2 2 0 0 0-2 2c0 1.1.9 2 2 2s2-.9 2-2a2 2 0 0 0-2-2z" />
            <path d="M15 17.5c1.2-.9 2-2.3 2-3.8a6 6 0 0 0-6-6" />
            <path d="M19 14.5c.6-1.1 1-2.4 1-3.8a10 10 0 0 0-10-10" />
            <path d="M14 21.8c2.9-.8 5.3-2.7 6.7-5.3" />
          </svg>

          <span style={{ fontSize: 9, fontWeight: 800, color: '#c084fc', marginTop: 6, letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>
            {isScanning ? `${scanProgress}% SYNC` : 'TAP PASSKEY'}
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: 0.8, marginBottom: 6 }}>
              OPERATOR IDENTIFIER
            </label>
            <input
              type="text"
              value={operatorId}
              onChange={e => setOperatorId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(10, 4, 18, 0.85)',
                border: '1px solid rgba(172, 88, 233, 0.35)',
                color: '#ffffff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: 0.8, marginBottom: 6 }}>
              QUANTUM PASSKEY / TOKEN
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(10, 4, 18, 0.85)',
                border: '1px solid rgba(172, 88, 233, 0.35)',
                color: '#ffffff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="submit"
              disabled={isScanning}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #AC58E9 0%, #7928ca 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: 1,
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(172, 88, 233, 0.45)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <span>{isScanning ? 'AUTHENTICATING...' : 'AUTHENTICATE AS LEAD OPERATOR'}</span>
              <span>⚡</span>
            </button>

            <button
              type="button"
              onClick={handleInstantBiometricAuth}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid rgba(172, 88, 233, 0.4)',
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: 0.5,
                cursor: 'pointer'
              }}
            >
              ONE-CLICK DEMO QUANTUM ACCESS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
