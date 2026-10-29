import React, { useState } from 'react';

interface Props {
  spotPrice?: number;
  onEnterTerminal?: () => void;
  onOpenLab?: () => void;
}

type Timeframe = '1M' | '5M' | '15M' | '1H' | '4H' | '1D';

interface WaveData {
  path: string;
  fillPath: string;
  delta: string;
  signalType: 'LONG MOMENTUM' | 'VOL HARVEST' | 'BREAKOUT';
  sharpe: number;
  winRate: string;
  regime: string;
}

const TIMEFRAME_DATA: Record<Timeframe, WaveData> = {
  '1M': {
    path: 'M 0 120 C 60 110, 110 135, 180 85 C 240 45, 300 70, 360 40 C 420 15, 480 30, 540 18',
    fillPath: 'M 0 120 C 60 110, 110 135, 180 85 C 240 45, 300 70, 360 40 C 420 15, 480 30, 540 18 L 540 180 L 0 180 Z',
    delta: '+1.42%',
    signalType: 'LONG MOMENTUM',
    sharpe: 3.42,
    winRate: '67.4%',
    regime: 'MICRO_TREND_ACCELERATION'
  },
  '5M': {
    path: 'M 0 130 C 70 145, 120 90, 190 75 C 260 60, 310 100, 380 50 C 440 10, 490 25, 540 12',
    fillPath: 'M 0 130 C 70 145, 120 90, 190 75 C 260 60, 310 100, 380 50 C 440 10, 490 25, 540 12 L 540 180 L 0 180 Z',
    delta: '+3.18%',
    signalType: 'BREAKOUT',
    sharpe: 3.88,
    winRate: '71.2%',
    regime: 'VOLATILITY_EXPANSION'
  },
  '15M': {
    path: 'M 0 140 C 50 120, 100 150, 170 110 C 240 70, 290 85, 350 45 C 410 15, 470 30, 540 8',
    fillPath: 'M 0 140 C 50 120, 100 150, 170 110 C 240 70, 290 85, 350 45 C 410 15, 470 30, 540 8 L 540 180 L 0 180 Z',
    delta: '+4.85%',
    signalType: 'LONG MOMENTUM',
    sharpe: 4.15,
    winRate: '73.8%',
    regime: 'BULL_MOMENTUM_CONFIRMED'
  },
  '1H': {
    path: 'M 0 150 C 80 130, 130 160, 200 95 C 270 35, 320 65, 390 30 C 450 5, 495 18, 540 5',
    fillPath: 'M 0 150 C 80 130, 130 160, 200 95 C 270 35, 320 65, 390 30 C 450 5, 495 18, 540 5 L 540 180 L 0 180 Z',
    delta: '+8.90%',
    signalType: 'LONG MOMENTUM',
    sharpe: 4.62,
    winRate: '76.1%',
    regime: 'TREND_FLOW_SUPERCLUSTER'
  },
  '4H': {
    path: 'M 0 160 C 90 140, 140 120, 220 80 C 290 40, 350 70, 420 25 C 470 5, 510 12, 540 4',
    fillPath: 'M 0 160 C 90 140, 140 120, 220 80 C 290 40, 350 70, 420 25 C 470 5, 510 12, 540 4 L 540 180 L 0 180 Z',
    delta: '+19.4%',
    signalType: 'VOL HARVEST',
    sharpe: 4.95,
    winRate: '78.5%',
    regime: 'REGIME_EXPANSION_PRIMARY'
  },
  '1D': {
    path: 'M 0 170 C 100 155, 160 110, 240 75 C 310 45, 370 55, 430 20 C 480 2, 515 8, 540 2',
    fillPath: 'M 0 170 C 100 155, 160 110, 240 75 C 310 45, 370 55, 430 20 C 480 2, 515 8, 540 2 L 540 180 L 0 180 Z',
    delta: '+48.2%',
    signalType: 'LONG MOMENTUM',
    sharpe: 5.12,
    winRate: '81.4%',
    regime: 'MACRO_HALVING_EXPANSION'
  }
};

interface SimExecutionLog {
  id: string;
  time: string;
  asset: string;
  type: string;
  price: string;
  latency: string;
  status: string;
}

export const CosmicSignalVisualizer: React.FC<Props> = ({
  spotPrice = 84920.5,
  onEnterTerminal,
  onOpenLab
}) => {
  const [selectedTf, setSelectedTf] = useState<Timeframe>('15M');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [recentFills, setRecentFills] = useState<SimExecutionLog[]>([
    { id: 'T2O-9402', time: '17:02:41', asset: 'BTC-PERP', type: 'BUY 0.50 BTC', price: '$84,890.00', latency: '3.8ms', status: 'CONFIRMED' },
    { id: 'T2O-9401', time: '17:01:18', asset: 'BTC-PERP', type: 'COLLAR PUT', price: '$81,500.00', latency: '4.2ms', status: 'HEDGED' },
    { id: 'T2O-9400', time: '16:58:05', asset: 'BTC-PERP', type: 'BUY 0.25 BTC', price: '$84,720.50', latency: '3.4ms', status: 'CONFIRMED' }
  ]);

  const currentData = TIMEFRAME_DATA[selectedTf];

  // Interactive Live Execution Simulation
  const handleSimulateExecution = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);

    setTimeout(() => {
      setSimStep(2);
    }, 450);

    setTimeout(() => {
      setSimStep(3);
    }, 900);

    setTimeout(() => {
      setIsSimulating(false);
      setSimStep(0);

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomId = `T2O-${Math.floor(Math.random() * 8999 + 1000)}`;
      const priceVal = (spotPrice + (Math.random() * 20 - 10)).toFixed(1);

      setRecentFills((prev) => [
        {
          id: randomId,
          time: timeStr,
          asset: 'BTC-PERP',
          type: 'BUY 0.40 BTC',
          price: `$${Number(priceVal).toLocaleString('en-US', { minimumFractionDigits: 1 })}`,
          latency: `${(Math.random() * 1.5 + 2.8).toFixed(1)}ms`,
          status: 'CONFIRMED'
        },
        ...prev.slice(0, 3)
      ]);
    }, 1400);
  };

  return (
    <section id="cockpit" className="cosmic-visualizer-section scroll-reveal">
      <div className="section-inner-wrapper">
        {/* Section Header with glowing neon tag */}
        <div className="visualizer-header-block">
          <div className="cosmic-badge-shimmer">
            <span className="badge-pulse-dot" />
            <span>REAL-TIME MOMENTUM MATRIX &amp; BROKER BRIDGE</span>
          </div>
          <h2 className="kraken-heading-md" style={{ marginTop: 12 }}>
            INTERACTIVE BITCOIN EXECUTION COCKPIT
          </h2>
          <p className="cosmic-sub-lead">
            Experience sub-10ms deterministic routing. Switch timeframes to visualize adaptive volatility envelopes,
            dynamic protective collar strikes, and direct MetaTrader 5 IPC socket telemetry.
          </p>
        </div>

        {/* Master Interactive Visualizer Bento Grid */}
        <div className="visualizer-bento-grid">
          {/* Main Large Visualizer Card: Interactive Momentum Spline */}
          <div className="v-card v-card-main">
            <div className="v-card-topbar">
              <div className="v-card-brand">
                <span className="v-glyph">₿</span>
                <div>
                  <span className="v-asset-title">BTC/USDT MOMENTUM VECTOR</span>
                  <div className="v-regime-tag">{currentData.regime}</div>
                </div>
              </div>

              {/* Timeframe selector pills with smooth active indicator */}
              <div className="v-tf-selector">
                {(['1M', '5M', '15M', '1H', '4H', '1D'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTf(tf)}
                    className={`v-tf-btn ${selectedTf === tf ? 'v-tf-active' : ''}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Sharpe Hero Stats */}
            <div className="v-stats-strip">
              <div className="v-stat-item">
                <span className="v-stat-label">SPOT INDEX</span>
                <span className="v-stat-val val-glow-purple">
                  ${spotPrice.toLocaleString('en-US', { minimumFractionDigits: 1 })}
                </span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-label">ALPHA DELTA</span>
                <span className="v-stat-val val-green">{currentData.delta}</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-label">OUT-OF-SAMPLE SHARPE</span>
                <span className="v-stat-val val-glow-cyan">{currentData.sharpe.toFixed(2)}</span>
              </div>
              <div className="v-stat-item">
                <span className="v-stat-label">GATE WIN RATE</span>
                <span className="v-stat-val val-purple">{currentData.winRate}</span>
              </div>
            </div>

            {/* Dynamic Interactive SVG Spline Canvas with Glowing Wave */}
            <div className="v-spline-stage">
              <svg viewBox="0 0 540 180" className="v-svg-wave" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cosmicWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#AC58E9" />
                    <stop offset="35%" stopColor="#FFFFFF" />
                    <stop offset="70%" stopColor="#AC58E9" />
                    <stop offset="100%" stopColor="#AC58E9" />
                  </linearGradient>

                  <linearGradient id="cosmicWaveFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(172, 88, 233,  0.35)" />
                    <stop offset="50%" stopColor="rgba(172, 88, 233,  0.12)" />
                    <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                  </linearGradient>

                  <filter id="waveNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4.5" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>

                {/* Background Grid Lines */}
                <line x1="0" y1="45" x2="540" y2="45" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="540" y2="90" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="135" x2="540" y2="135" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />

                {/* Target Take-Profit Threshold */}
                <line x1="0" y1="28" x2="540" y2="28" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" strokeDasharray="4 4" />
                <text x="530" y="24" textAnchor="end" fill="#AC58E9" fontSize="10" fontFamily="'JetBrains Mono', monospace">
                  TP GATE: +{(currentData.sharpe * 1.8).toFixed(1)}%
                </text>

                {/* Trailing Stop Loss Threshold */}
                <line x1="0" y1="155" x2="540" y2="155" stroke="rgba(244, 63, 94, 0.4)" strokeWidth="1" strokeDasharray="4 4" />
                <text x="530" y="168" textAnchor="end" fill="#c084fc" fontSize="10" fontFamily="'JetBrains Mono', monospace">
                  TRAIL SL GATE: -1.8%
                </text>

                {/* Area Gradient Fill */}
                <path d={currentData.fillPath} fill="url(#cosmicWaveFill)" />

                {/* Glowing Spline Path with smooth morph */}
                <path
                  d={currentData.path}
                  fill="none"
                  stroke="url(#cosmicWaveGrad)"
                  strokeWidth="3.2"
                  filter="url(#waveNeonGlow)"
                  className="v-wave-line"
                />

                {/* End Point Radiant Beacon */}
                <circle cx="538" cy="18" r="6" fill="#AC58E9" filter="url(#waveNeonGlow)" />
                <circle cx="538" cy="18" r="3" fill="#FFFFFF" />
              </svg>
            </div>
          </div>

          {/* Side Card: Sub-10ms Broker Bridge Simulation */}
          <div className="v-card v-card-bridge">
            <div className="v-card-topbar">
              <span className="v-card-tag-purple">BROKER BRIDGE TELEMETRY</span>
              <span className="v-card-tag-green">DIRECT SHM IPC</span>
            </div>

            <div className="bridge-spec-list">
              <div className="b-spec-row">
                <span className="b-label">IPC TRANSPORT</span>
                <span className="b-val val-glow-purple">WIN32 DIRECT SHARED MEMORY</span>
              </div>
              <div className="b-spec-row">
                <span className="b-label">SOCKET HANDSHAKE</span>
                <span className="b-val val-cyan">METATRADER 5 &amp; DERIBIT</span>
              </div>
              <div className="b-spec-row">
                <span className="b-label">AGGREGATE LATENCY</span>
                <span className="b-val val-green">3.8ms TICK-TO-TRADE</span>
              </div>
            </div>

            {/* Interactive Simulation Pipeline */}
            <div className="sim-pipeline-box">
              <div className="pipeline-title-row">
                <span>EXECUTION PIPELINE STAGES</span>
                <span className="text-dim">{isSimulating ? 'SIMULATING...' : 'IDLE'}</span>
              </div>

              <div className="pipeline-steps">
                <div className={`pipe-step ${simStep >= 1 ? 'step-active' : ''}`}>
                  <div className="step-num">01</div>
                  <div className="step-content">
                    <div className="step-name">Closed-Bar Ingestion</div>
                    <div className="step-time">0.8ms · Zero Lookahead</div>
                  </div>
                </div>

                <div className={`pipe-step ${simStep >= 2 ? 'step-active' : ''}`}>
                  <div className="step-num">02</div>
                  <div className="step-content">
                    <div className="step-name">Shared Memory IPC</div>
                    <div className="step-time">1.2ms · Atomic RingBuffer</div>
                  </div>
                </div>

                <div className={`pipe-step ${simStep >= 3 ? 'step-active' : ''}`}>
                  <div className="step-num">03</div>
                  <div className="step-content">
                    <div className="step-name">Gateway Fill Handshake</div>
                    <div className="step-time">1.8ms · MT5 OrderSend</div>
                  </div>
                </div>
              </div>

              {/* Execution Trigger Button */}
              <button
                type="button"
                onClick={handleSimulateExecution}
                disabled={isSimulating}
                className="bridge-sim-btn"
              >
                {isSimulating ? (
                  <span className="btn-loading-flex">
                    <span className="loading-spinner" /> EXECUTING IPC ROUTE...
                  </span>
                ) : (
                  <span>⚡ TRIGGER TEST TICK EXECUTION (3.8ms)</span>
                )}
              </button>
            </div>

            {/* Live Execution Mini Tape */}
            <div className="v-live-tape">
              <div className="tape-header">RECENT FILLED ORDERS</div>
              {recentFills.map((fill) => (
                <div key={fill.id} className="tape-row">
                  <span className="t-time">{fill.time}</span>
                  <span className="t-type">{fill.type}</span>
                  <span className="t-price">{fill.price}</span>
                  <span className="t-lat val-green">{fill.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Footer Row */}
        <div className="visualizer-cta-row">
          <button
            type="button"
            onClick={onEnterTerminal}
            className="kraken-btn-get-started"
            style={{ padding: '14px 38px', fontSize: 14 }}
          >
            Launch Full Trading Terminal →
          </button>
          <button
            type="button"
            onClick={onOpenLab}
            className="kraken-btn-login"
            style={{ padding: '14px 28px', fontSize: 14 }}
          >
            Open Signal Backtest Lab
          </button>
        </div>
      </div>
    </section>
  );
};
