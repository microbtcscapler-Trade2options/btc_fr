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
      return () => clearInterval(interval);
    }
  }, [isOpen, timeframe]);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setSimulating(true);
    setSimulateResult(null);
    try {
      const res = await simulateSignalTrigger('BTCUSDT');
      setSimulateResult(`Dispatched ${res.action} at $${res.entry_price?.toLocaleString()} | Hard SL: $${res.hard_stop_loss?.toLocaleString()} | Lot: ${res.lot_size} BTC -> MT5 EA (Magic: ${res.mt5_magic_number})`);
      loadSignal();
    } catch (err: any) {
      setSimulateResult(`Simulation error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const isBuy = signal?.action.includes('BUY');
  const isVeto = signal?.action.includes('VETO');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#0B0F19',
        border: '1px solid #1E293B',
        borderRadius: 12,
        width: '100%',
        maxWidth: 1180,
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Modal Top Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, #090D17 0%, #0F172A 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#07090E',
              fontSize: 16
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#F8FAFC', letterSpacing: 0.5 }}>
                QUANT SIGNAL & MT5 EXECUTION LAB
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                Zero-Fabrication 6-Layer Algorithmic Synthesis & MT5 Standalone Terminal Bridge
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={loadSignal}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #1E293B',
                background: '#07090E',
                color: '#38BDF8',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sync Live
            </button>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                border: '1px solid #1E293B',
                background: '#07090E',
                color: '#94A3B8',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading && !signal ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
              Synthesizing 6-Layer Multi-Filter Signal Engine...
            </div>
          ) : (
            <>
              {/* 1. Master Active Signal Action Card */}
              <div style={{
                background: isBuy
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, #07090E 100%)'
                  : isVeto
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, #07090E 100%)'
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, #07090E 100%)',
                border: `1px solid ${isBuy ? '#10B981' : isVeto ? '#EF4444' : '#F59E0B'}`,
                borderRadius: 10,
                padding: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                      Current Synthesized Master Signal (Closed M15 Bar)
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ color: isBuy ? '#10B981' : isVeto ? '#EF4444' : '#F59E0B' }}>
                        {signal?.action.replace(/_/g, ' ')}
                      </span>
                      <span className="t2o-badge badge-purple" style={{ fontSize: 11 }}>
                        CONFIDENCE: {signal?.composite_confidence_pct}%
                      </span>
                      <span className={`t2o-badge ${signal?.mt5_status === 'ARMED_AND_READY' ? 'badge-bullish' : 'badge-warning'}`} style={{ fontSize: 11 }}>
                        MT5: {signal?.mt5_status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 8 }}>
                      <b>Executive Summary:</b> {signal?.executive_summary}
                    </div>
                  </div>

                  {/* MT5 Target Order Parameters */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ background: '#090D17', padding: '10px 14px', borderRadius: 6, border: '1px solid #1E293B' }}>
                      <div style={{ fontSize: 10, color: '#64748B' }}>ENTRY SPOT</div>
                      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#F8FAFC', marginTop: 2 }}>
                        ${signal?.entry_price.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#090D17', padding: '10px 14px', borderRadius: 6, border: '1px solid #1E293B' }}>
                      <div style={{ fontSize: 10, color: '#EF4444' }}>HARD STOP LOSS</div>
                      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#EF4444', marginTop: 2 }}>
                        ${signal?.hard_stop_loss.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#090D17', padding: '10px 14px', borderRadius: 6, border: '1px solid #1E293B' }}>
                      <div style={{ fontSize: 10, color: '#10B981' }}>TAKE PROFIT</div>
                      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#10B981', marginTop: 2 }}>
                        ${signal?.take_profit.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#090D17', padding: '10px 14px', borderRadius: 6, border: '1px solid #1E293B' }}>
                      <div style={{ fontSize: 10, color: '#38BDF8' }}>KELLY LOT SIZE</div>
                      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#38BDF8', marginTop: 2 }}>
                        {signal?.recommended_lot_size} BTC
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div style={{ width: '100%', height: 6, background: '#1E293B', borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
                  <div style={{
                    width: `${signal?.composite_confidence_pct || 50}%`,
                    height: '100%',
                    background: isBuy ? 'linear-gradient(90deg, #10B981, #38BDF8)' : isVeto ? '#EF4444' : '#F59E0B',
                    borderRadius: 3
                  }} />
                </div>
              </div>

              {/* 2. End-to-End Signal-to-MT5 Flow Pipeline */}
              <div style={{ background: '#07090E', padding: 18, borderRadius: 8, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8', letterSpacing: 0.5, marginBottom: 12 }}>
                  END-TO-END SIGNAL-TO-MT5 EXECUTION PIPELINE
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {signal?.pipeline_stages.map((st) => {
                    const isDone = st.status === 'COMPLETED';
                    const isAct = st.status === 'ACTIVE' || st.status === 'ARMED';
                    const isBlock = st.status === 'BLOCKED';

                    return (
                      <div key={st.stage_id} style={{
                        background: '#090D17',
                        padding: 12,
                        borderRadius: 6,
                        border: `1px solid ${isDone ? '#10B981' : isAct ? '#38BDF8' : isBlock ? '#EF4444' : '#1E293B'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>{st.name}</span>
                          <span className={`t2o-badge ${isDone ? 'badge-bullish' : isAct ? 'badge-info' : isBlock ? 'badge-bearish' : 'badge-warning'}`} style={{ fontSize: 8 }}>
                            {st.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4, lineHeight: 1.4 }}>
                          {st.detail}
                        </div>
                        <div style={{ fontSize: 9, color: '#64748B', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                          Latency: {st.latency_ms} ms
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. The 6-Layer Multi-Filter Decomposition Grid */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>6-Layer Multi-Filter Algorithmic Decomposition</span>
                  <span className="t2o-badge badge-purple" style={{ fontSize: 9 }}>Zero Fabrication</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12 }}>
                  {signal?.layers.map((layer) => {
                    const isPass = layer.passed;
                    const isVetoSig = layer.signal === 'VETO';
                    const isBullSig = layer.signal === 'BULLISH';

                    return (
                      <div key={layer.layer_id} style={{
                        background: '#07090E',
                        padding: 14,
                        borderRadius: 6,
                        border: '1px solid #1E293B',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>{layer.name}</span>
                            <span className={`t2o-badge ${isPass && isBullSig ? 'badge-bullish' : isVetoSig ? 'badge-bearish' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                              {layer.signal} ({layer.score}/100)
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 6, lineHeight: 1.4 }}>
                            {layer.summary}
                          </div>
                        </div>

                        {/* Metric Tags */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, paddingTop: 8, borderTop: '1px solid #1E293B' }}>
                          <span style={{ fontSize: 9, color: '#64748B' }}>Weight: {layer.weight_pct}%</span>
                          {Object.entries(layer.metrics).slice(0, 3).map(([k, v]) => (
                            <span key={k} style={{ fontSize: 9, color: '#94A3B8', background: '#090D17', padding: '2px 6px', borderRadius: 3, fontFamily: 'JetBrains Mono' }}>
                              {k}: {typeof v === 'number' ? v.toFixed(2) : String(v)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. MT5 EA Execution Bridge & Live Simulation Test */}
              <div style={{
                background: '#07090E',
                padding: 18,
                borderRadius: 8,
                border: '1px solid #1E293B',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 14
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                    MT5 Standalone EA Telemetry Bridge (Live IPC)
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                    Expert Advisor: <b style={{ color: '#F8FAFC' }}>Trade2Options_BTC_Momentum.ex5</b> | Magic: <b style={{ color: '#F8FAFC' }}>{signal?.mt5_magic_number}</b> | Stop Loss: Hard In-Chart
                  </div>
                  {simulateResult && (
                    <div style={{ fontSize: 11, color: '#38BDF8', marginTop: 6, fontFamily: 'JetBrains Mono' }}>
                      {simulateResult}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSimulate}
                  disabled={simulating}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 6,
                    border: '1px solid #10B981',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span>{simulating ? 'Dispatching...' : '⚡ Simulate Live Signal Dispatch to MT5'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
