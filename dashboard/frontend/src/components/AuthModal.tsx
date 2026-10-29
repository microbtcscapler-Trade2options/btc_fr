import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onLoginSuccess: (operatorName: string) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, initialMode = 'signin', onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [operatorId, setOperatorId] = useState('quant_operator');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(operatorId || 'Trade2Options Desk');
      onClose();
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess('Trade2Options Desk');
      onClose();
    }, 400);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-container radiant-card stagger-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="auth-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-clover-icon" style={{ width: 34, height: 34, fontSize: 16 }}>
              <span className="clover-symbol">✤</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 0.8, color: '#FFFFFF' }}>
                TRADE2OPTIONS ACCESS
              </div>
              <div style={{ fontSize: 10, color: 'var(--accent-cyan-bright)', fontWeight: 700 }}>
                INSTITUTIONAL QUANTITATIVE GATEWAY
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="auth-close-btn"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs-strip">
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'signin' ? 'active' : ''}`}
            onClick={() => setAuthMode('signin')}
          >
            Sign In to Terminal
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthMode('signup')}
          >
            Register Operator Key
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="auth-input-group">
            <label className="auth-input-label">Operator Handle or Email</label>
            <input
              type="text"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="operator@trade2options.io"
              className="auth-input-field"
              required
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-input-label">
              <span>Security Key / Passcode</span>
              <span style={{ color: 'var(--accent-cyan-bright)', fontSize: 10, cursor: 'pointer' }}>
                Reset Key
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter institutional key"
              className="auth-input-field"
              required
            />
          </div>

          {authMode === 'signup' && (
            <div className="auth-input-group">
              <label className="auth-input-label">MT5 Terminal Broker Link (Optional)</label>
              <input
                type="text"
                placeholder="Exness-MT5Trial8 // Magic 261016"
                className="auth-input-field"
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              <span>Remember this Cockpit Session</span>
            </label>
            <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              AES-256 GCM
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="hero-primary-btn shimmer-sweep"
            style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: '13px' }}
          >
            {isSubmitting ? (
              <span>Authenticating Gateway...</span>
            ) : (
              <span>{authMode === 'signin' ? 'Sign In & Enter Cockpit →' : 'Generate Key & Enter →'}</span>
            )}
          </button>

          {/* Quick Instant Demo Access Divider */}
          <div className="auth-divider">
            <span>OR INSTANT QUANT DEMO ACCESS</span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="auth-demo-btn"
          >
            <span className="pulse-dot dot-cyan" />
            <span>1-Click Instant Demo Login (Zero Password)</span>
          </button>
        </form>

        {/* Telemetry Footer */}
        <div className="auth-modal-footer">
          <span>MT5 Parity: 99.8%</span>
          <span>•</span>
          <span>Binance Spot Stream: 24/7</span>
          <span>•</span>
          <span style={{ color: 'var(--accent-cyan-bright)' }}>Strict Risk Gate Active</span>
        </div>
      </div>
    </div>
  );
};
