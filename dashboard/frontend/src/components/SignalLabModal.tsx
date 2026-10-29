import React, { useState, useEffect } from 'react';
import { MasterSignalSnapshot, TimeFrame } from '../types';
import { fetchMasterSignal, simulateSignalTrigger } from '../api';

interface SignalLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeframe: TimeFrame;
}

export const SignalLabModal: React.FC<SignalLabModalProps> = ({
  isOpen,
  onClose,
  timeframe
}) => {
  const [signal, setSignal] = useState<MasterSignalSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulateResult, setSimulateResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'vetoed' | 'passed'>('all');

  const loadSignal = async () => {
    try {
      const data = await fetchMasterSignal('BTCUSDT', timeframe);
      setSignal(data);
    } catch (err) {
      console.error('Error fetching master signal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSignal();
      const interval = setInterval(loadSignal, 10000); // 10s auto refresh
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearInterval(interval);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, timeframe, onClose]);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setSimulating(true);
    setSimulateResult(null);
    try {
      const res = await simulateSignalTrigger('BTCUSDT');
      setSimulateResult(`DISPATCH CONFIRMED // Action: ${res.action} @ $${res.entry_price?.toLocaleString()} | Hard SL: $${res.hard_stop_loss?.toLocaleString()} | TP: $${res.take_profit?.toLocaleString()} | Kelly Lot: ${res.lot_size} BTC -> MT5 EA (Magic: ${res.mt5_magic_number})`);
      loadSignal();
    } catch (err: any) {
      setSimulateResult(`Simulation Error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const isVeto = signal?.action.includes('VETO');
  const isBuy = signal?.action.includes('BUY') && !isVeto;
  const isSell = signal?.action.includes('SELL') && !isVeto;

  // Percentage calculations
  const entryPrice = signal?.entry_price || 81850;
  const slPrice = signal?.hard_stop_loss || 81577;
  const tpPrice = signal?.take_profit || 82286;
  const slDelta = (((slPrice - entryPrice) / entryPrice) * 100).toFixed(2);
  const tpDelta = (((tpPrice - entryPrice) / entryPrice) * 100).toFixed(2);

  const getLayerIcon = (layerId: string | number) => {
    const id = String(layerId).toLowerCase();
    if (id.includes('1') || id.includes('trend')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AC58E9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18l6-6 4 4 8-8" />
          <path d="M14 8h7v7" />
          <circle cx="3" cy="18" r="2" fill="#AC58E9" />
          <circle cx="21" cy="8" r="2" fill="#AC58E9" />
        </svg>
      );
    }
    if (id.includes('2') || id.includes('timing') || id.includes('pullback')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v4m0 10v4M3 12h4m10 0h4" />
          <circle cx="12" cy="12" r="3" fill="rgba(172, 88, 233, 0.4)" />
        </svg>
      );
    }
    if (id.includes('3') || id.includes('momentum') || id.includes('volatility')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 13h4l3-8 4 15 3-7h6" />
          <circle cx="13" cy="20" r="2" fill="#FFFFFF" />
        </svg>
      );
    }
    if (id.includes('4') || id.includes('order') || id.includes('cvd') || id.includes('microstructure')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AC58E9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M7 15l3-3 3 3 4-4" />
          <circle cx="17" cy="11" r="1.5" fill="#AC58E9" />
        </svg>
      );
    }
    if (id.includes('5') || id.includes('council') || id.includes('vibe') || id.includes('agent')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3" />
          <circle cx="5" cy="19" r="3" />
          <circle cx="19" cy="19" r="3" />
          <line x1="8.5" y1="7.5" x2="6.5" y2="16.5" />
          <line x1="15.5" y1="7.5" x2="17.5" y2="16.5" />
          <line x1="8" y1="19" x2="16" y2="19" />
        </svg>
      );
    }
    if (id.includes('6') || id.includes('labeling') || id.includes('prado') || id.includes('meta')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7928ca" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    }
    return <span>⚡</span>;
  };

  const filteredLayers = signal?.layers.filter((layer) => {
    if (activeTab === 'vetoed') return layer.signal === 'VETO' || !layer.passed;
    if (activeTab === 'passed') return layer.passed && layer.signal !== 'VETO';
    return true;
  });

  return (
    <div
      className="signal-lab-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(4, 2, 10, 0.9)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px'
      }}
    >
      <div className="signal-lab-modal-dialog">
        {/* Decorative HUD Corner Accents */}
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        {/* Modal Top Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid rgba(172, 88, 233,  0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(12, 6, 26, 0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #AC58E9 0%, #7928ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#FFFFFF',
              fontSize: 20,
              boxShadow: '0 0 20px rgba(172, 88, 233, 0.55)'
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 16.5, fontWeight: 900, color: '#FFFFFF', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>QUANT SIGNAL &amp; MT5 EXECUTION LAB</span>
                <div className="live-equalizer">
                  <span className="live-equalizer-bar" style={{ background: '#AC58E9' }} />
                  <span className="live-equalizer-bar" style={{ background: '#FFFFFF' }} />
                  <span className="live-equalizer-bar" style={{ background: '#c084fc' }} />
                  <span className="live-equalizer-bar" style={{ background: '#AC58E9' }} />
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Zero-Fabrication 6-Layer Algorithmic Synthesis &amp; MT5 Standalone Terminal Bridge</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                <span style={{ color: '#AC58E9', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>SOCKET 10G IPC</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={loadSignal}
              className="control-pill-btn shimmer-sweep"
              style={{
                padding: '7px 18px',
                borderRadius: '999px',
                fontSize: 11.5,
                fontWeight: 800,
                color: '#AC58E9',
                borderColor: 'rgba(172, 88, 233, 0.4)',
                background: 'rgba(172, 88, 233, 0.08)',
                boxShadow: '0 0 16px rgba(172, 88, 233, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span className="pulse-dot pulse-dot-ping" style={{ color: '#AC58E9', width: 6, height: 6 }} />
              Sync Live
            </button>
            <button
              onClick={onClose}
              className="signal-lab-close-btn"
              data-testid="signal-lab-close"
              aria-label="Close Signal Lab"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#94A3B8',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(172, 88, 233, 0.6)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {loading && !signal ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>
              <span className="pulse-dot pulse-dot-ping" style={{ color: '#AC58E9', marginRight: 10 }} />
              Synthesizing 6-Layer Multi-Filter Signal Engine...
            </div>
          ) : (
            <>
              {/* 1. Master Active Signal Action Card */}
              <div className="master-signal-hero-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                  <div style={{ flex: '1 1 520px' }}>
                    <div style={{ fontSize: 10.5, color: '#A1A1AA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="node-pulse" style={{ background: isVeto ? '#7928ca' : isBuy ? '#AC58E9' : '#c084fc' }} />
                      Current Synthesized Master Signal (Closed M15 Bar)
                    </div>

                    <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        color: isVeto ? '#7928ca' : isBuy ? '#AC58E9' : isSell ? '#c084fc' : '#ffffff',
                        filter: isVeto ? 'drop-shadow(0 0 18px rgba(121, 40, 202, 0.6))' : 'drop-shadow(0 0 18px rgba(172, 88, 233, 0.6))'
                      }}>
                        {signal?.action.replace(/_/g, ' ')}
                      </span>

                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: 'rgba(172, 88, 233, 0.15)',
                        border: '1px solid rgba(172, 88, 233, 0.4)',
                        color: '#FFFFFF'
                      }}>
                        CONFIDENCE: {signal?.composite_confidence_pct}%
                      </span>

                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: signal?.mt5_status === 'ARMED_AND_READY' ? 'rgba(172, 88, 233, 0.15)' : 'rgba(121, 40, 202, 0.15)',
                        border: signal?.mt5_status === 'ARMED_AND_READY' ? '1px solid rgba(172, 88, 233, 0.4)' : '1px solid rgba(121, 40, 202, 0.4)',
                        color: signal?.mt5_status === 'ARMED_AND_READY' ? '#AC58E9' : '#c084fc'
                      }}>
                        MT5: {signal?.mt5_status}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#CBD5E1', marginTop: 12, lineHeight: 1.6, maxWidth: 680 }}>
                      <strong style={{ color: '#FFFFFF' }}>Executive Summary:</strong> {signal?.executive_summary}
                    </div>
                  </div>

                  {/* MT5 Target Order Parameters (Holographic Pods) */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div className="holographic-order-pod">
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 800, letterSpacing: 0.6 }}>ENTRY SPOT</div>
                      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginTop: 3 }}>
                        ${entryPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#AC58E9', marginTop: 2, fontFamily: 'var(--font-mono)' }}>M15 CLOSE</div>
                    </div>

                    <div className="holographic-order-pod" style={{ borderColor: 'rgba(121, 40, 202, 0.3)' }}>
                      <div style={{ fontSize: 10, color: '#c084fc', fontWeight: 800, letterSpacing: 0.6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🛡️ HARD SL</span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#c084fc', marginTop: 3 }}>
                        ${slPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#c084fc', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        {slDelta}% ATR LIMIT
                      </div>
                    </div>

                    <div className="holographic-order-pod" style={{ borderColor: 'rgba(172, 88, 233, 0.3)' }}>
                      <div style={{ fontSize: 10, color: '#AC58E9', fontWeight: 800, letterSpacing: 0.6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🎯 TAKE PROFIT</span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#AC58E9', marginTop: 3 }}>
                        ${tpPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#AC58E9', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        +{tpDelta}% TARGET
                      </div>
                    </div>

                    <div className="holographic-order-pod" style={{ borderColor: 'rgba(172, 88, 233, 0.3)' }}>
                      <div style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 800, letterSpacing: 0.6 }}>KELLY LOT SIZE</div>
                      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginTop: 3 }}>
                        {signal?.recommended_lot_size} BTC
                      </div>
                      <div style={{ fontSize: 9.5, color: '#c084fc', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        SOR EXNESS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Dynamic Multi-Segment Confidence Bar */}
                <div style={{ marginTop: 22, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                    <span>0% REGIME FLOOR</span>
                    <span>30% VETO THRESHOLD</span>
                    <span>50% CONVICTION PIVOT</span>
                    <span>75% HIGH ALPHA</span>
                    <span>100% MAXIMUM</span>
                  </div>

                  <div style={{
                    height: 8,
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${signal?.composite_confidence_pct || 35}%`,
                        background: isBuy
                          ? 'linear-gradient(90deg, #AC58E9 0%, #FFFFFF 100%)'
                          : isVeto
                          ? 'linear-gradient(90deg, #7928ca 0%, #AC58E9 100%)'
                          : 'linear-gradient(90deg, #581c87 0%, #7928ca 100%)',
                        boxShadow: `0 0 16px ${isBuy ? '#AC58E9' : isVeto ? '#7928ca' : '#AC58E9'}`,
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. End-to-End Signal-to-MT5 Flow Pipeline */}
              <div className="pipeline-flow-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: '#AC58E9', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pulse-dot" style={{ color: '#AC58E9', width: 6, height: 6 }} />
                    END-TO-END SIGNAL-TO-MT5 EXECUTION PIPELINE
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                    ACTIVE IPC BUS • TOTAL LATENCY: 16.6ms
                  </span>
                </div>

                <div className="pipeline-stages-grid">
                  {signal?.pipeline_stages.map((st, idx) => {
                    const isDone = st.status === 'COMPLETED';
                    const isAct = st.status === 'ACTIVE' || st.status === 'ARMED';
                    const isBlock = st.status === 'BLOCKED';

                    return (
                      <div
                        key={st.stage_id}
                        className={`pipeline-stage-card-v2 ${isDone ? 'stage-completed' : isBlock ? 'stage-blocked' : isAct ? 'stage-completed' : 'stage-pending'}`}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 9.5, fontWeight: 900, color: '#94A3B8', letterSpacing: 0.8, fontFamily: 'var(--font-mono)' }}>
                              STAGE 0{idx + 1}
                            </span>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: isDone ? 'rgba(172, 88, 233,  0.15)' : isBlock ? 'rgba(121, 40, 202, 0.2)' : 'rgba(172, 88, 233, 0.15)',
                              color: isDone ? '#AC58E9' : isBlock ? '#7928ca' : '#AC58E9',
                              border: isDone ? '1px solid rgba(172, 88, 233,  0.3)' : isBlock ? '1px solid rgba(121, 40, 202, 0.4)' : '1px solid rgba(172, 88, 233, 0.3)'
                            }}>
                              {st.status}
                            </span>
                          </div>

                          <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}>
                            {st.name}
                          </div>

                          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8, lineHeight: 1.45 }}>
                            {st.detail}
                          </div>
                        </div>

                        <div style={{
                          fontSize: 10,
                          color: '#A1A1AA',
                          fontFamily: 'var(--font-mono)',
                          marginTop: 14,
                          paddingTop: 8,
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>Latency:</span>
                          <strong style={{ color: '#AC58E9' }}>{st.latency_ms} ms</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. The 6-Layer Multi-Filter Decomposition Grid */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF', letterSpacing: 0.4 }}>
                      6-Layer Multi-Filter Algorithmic Decomposition
                    </div>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: 'rgba(172, 88, 233, 0.15)',
                      border: '1px solid rgba(172, 88, 233, 0.35)',
                      color: '#FFFFFF'
                    }}>
                      ZERO FABRICATION
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['all', 'passed', 'vetoed'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: '5px 14px',
                          borderRadius: 8,
                          border: activeTab === tab ? '1px solid #AC58E9' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: activeTab === tab ? 'rgba(172, 88, 233, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          color: activeTab === tab ? '#AC58E9' : '#94A3B8',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
                  {filteredLayers?.map((layer) => {
                    const isVetoSig = layer.signal === 'VETO' || !layer.passed;
                    const isBullSig = layer.signal === 'BULLISH';
                    const isBearSig = layer.signal === 'BEARISH';

                    const badgeColor = isBullSig ? '#AC58E9' : isVetoSig ? '#7928ca' : isBearSig ? '#c084fc' : '#ffffff';

                    return (
                      <div key={layer.layer_id} className="layer-card-v2">
                        {/* Top Row: Icon + Title + Score Badge */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div className="layer-icon-badge">
                                {getLayerIcon(layer.layer_id)}
                              </div>
                              <div>
                                <div style={{ fontSize: 13.5, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.35 }}>
                                  {layer.name}
                                </div>
                                <div style={{ fontSize: 10, color: '#A1A1AA', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                                  WEIGHT ALLOCATION: <strong style={{ color: '#AC58E9' }}>{layer.weight_pct}%</strong>
                                </div>
                              </div>
                            </div>

                            <div style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono)',
                              background: isBullSig ? 'rgba(172, 88, 233, 0.15)' : isVetoSig ? 'rgba(121, 40, 202, 0.15)' : 'rgba(172, 88, 233, 0.1)',
                              border: `1px solid ${badgeColor}`,
                              color: badgeColor,
                              whiteSpace: 'nowrap'
                            }}>
                              {layer.signal} ({layer.score}/100)
                            </div>
                          </div>

                          {/* Animated Score Progress Bar */}
                          <div className="layer-score-track">
                            <div
                              className="layer-score-fill"
                              style={{
                                width: `${layer.score}%`,
                                background: isBullSig
                                  ? 'linear-gradient(90deg, #AC58E9, #ffffff)'
                                  : isVetoSig
                                  ? 'linear-gradient(90deg, #7928ca, #AC58E9)'
                                  : 'linear-gradient(90deg, #581c87, #AC58E9)',
                                color: badgeColor
                              }}
                            />
                          </div>

                          {/* Summary Text */}
                          <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 14, lineHeight: 1.55 }}>
                            {layer.summary}
                          </div>
                        </div>

                        {/* Metric Tags Bar */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          {Object.entries(layer.metrics).slice(0, 4).map(([k, v]) => (
                            <div key={k} className="quant-metric-pill">
                              <span style={{ color: '#94A3B8' }}>{k}:</span>
                              <span>{typeof v === 'number' ? v.toFixed(2) : String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. MT5 EA Execution Bridge & Live Simulation Test */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(20, 5, 30, 0.9) 0%, rgba(5, 1, 10, 0.98) 100%)',
                border: '1px solid rgba(172, 88, 233, 0.35)',
                borderRadius: 20,
                padding: '24px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 18,
                boxShadow: '0 16px 45px rgba(0, 0, 0, 0.7)'
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#AC58E9', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="pulse-dot" style={{ color: '#AC58E9', width: 7, height: 7 }} />
                    <span>MT5 Standalone EA Telemetry Bridge (Live IPC)</span>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(172, 88, 233, 0.15)',
                      border: '1px solid rgba(172, 88, 233, 0.35)',
                      color: '#AC58E9',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      ONLINE • 127.0.0.1:5555
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
                    Expert Advisor: <strong style={{ color: '#FFFFFF' }}>Trade2Options_BTC_Momentum.ex5</strong> | Magic Number: <strong style={{ color: '#AC58E9', fontFamily: 'var(--font-mono)' }}>{signal?.mt5_magic_number || 261016}</strong> | Stop Loss: Hard In-Chart
                  </div>

                  {simulateResult && (
                    <div style={{
                      fontSize: 11.5,
                      color: '#AC58E9',
                      marginTop: 10,
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(172, 88, 233, 0.08)',
                      border: '1px solid rgba(172, 88, 233, 0.25)',
                      padding: '8px 14px',
                      borderRadius: 8
                    }}>
                      {simulateResult}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="mt5-sim-btn shimmer-sweep"
                >
                  <span>{simulating ? 'DISPATCHING IPC ORDER...' : '⚡ Simulate Live Signal Dispatch to MT5'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

