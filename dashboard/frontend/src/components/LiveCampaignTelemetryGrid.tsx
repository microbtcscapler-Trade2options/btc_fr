import React, { useState, useEffect, useRef } from 'react';

interface StrategyRow {
  symbol: string;
  tf: string;
  hash: string;
  score: number;
  ret: string;
  dd: string;
  wr: string;
}

const VAULT_STRATEGIES: StrategyRow[] = [
  { symbol: 'BTCUSDT', tf: 'M15', hash: '#E325FE', score: 81, ret: '+113.5%', dd: '5.4%', wr: '64%' },
  { symbol: 'ETHUSDT', tf: 'H1', hash: '#FF009F', score: 80, ret: '+96.9%', dd: '4.6%', wr: '63%' },
  { symbol: 'SOLUSDT', tf: 'D1', hash: '#D337AC', score: 68, ret: '+43.5%', dd: '8.4%', wr: '53%' },
  { symbol: 'GBPUSD', tf: 'M30', hash: '#D7E35A', score: 78, ret: '+91.9%', dd: '4.3%', wr: '60%' },
  { symbol: 'XAUUSD', tf: 'H4', hash: '#C821A8', score: 84, ret: '+128.2%', dd: '3.9%', wr: '67%' },
  { symbol: 'EURUSD', tf: 'H1', hash: '#8512FE', score: 74, ret: '+72.4%', dd: '5.1%', wr: '58%' }
];

const CAMPAIGN_STRATEGIES: StrategyRow[] = [
  { symbol: 'USDCAD', tf: 'M30', hash: '#D9494D', score: 68, ret: '+43.9%', dd: '8.3%', wr: '54%' },
  { symbol: 'EURGBP', tf: 'H1', hash: '#E3B996', score: 72, ret: '+51.7%', dd: '5.0%', wr: '58%' },
  { symbol: 'USDCAD', tf: 'H1', hash: '#B3273F', score: 88, ret: '+112.4%', dd: '4.3%', wr: '66%' },
  { symbol: 'AUDUSD', tf: 'M30', hash: '#75035A', score: 79, ret: '+104.3%', dd: '5.8%', wr: '64%' },
  { symbol: 'EURGBP', tf: 'D1', hash: '#57D8CD', score: 62, ret: '+19.3%', dd: '7.9%', wr: '50%' }
];

// 14 Equity Curve Paths with strict Vibe Purple (#AC58E9), Black, and White palette
const EQUITY_CURVES = [
  { color: '#ffffff', path: 'M 10 130 Q 80 115, 140 95 T 240 65 T 320 40 T 400 15', final: '+118%' },
  { color: '#AC58E9', path: 'M 10 130 Q 70 120, 130 102 T 230 78 T 310 52 T 400 28', final: '+104%' },
  { color: '#c084fc', path: 'M 10 130 Q 90 125, 150 110 T 250 85 T 330 64 T 400 38', final: '+92%' },
  { color: '#e9d5ff', path: 'M 10 130 Q 60 122, 120 112 T 220 90 T 300 75 T 400 48', final: '+84%' },
  { color: '#9333ea', path: 'M 10 130 Q 100 135, 160 118 T 260 98 T 340 82 T 400 58', final: '+76%' },
  { color: '#AC58E9', path: 'M 10 130 Q 75 128, 135 120 T 235 105 T 315 90 T 400 68', final: '+69%' },
  { color: '#ffffff', path: 'M 10 130 Q 85 132, 145 125 T 245 112 T 325 98 T 400 78', final: '+61%' },
  { color: '#7928ca', path: 'M 10 130 Q 65 126, 125 119 T 225 110 T 305 104 T 400 86', final: '+54%' },
  { color: '#c084fc', path: 'M 10 130 Q 95 138, 155 128 T 255 118 T 335 110 T 400 94', final: '+47%' },
  { color: '#AC58E9', path: 'M 10 130 Q 80 134, 140 130 T 240 124 T 320 116 T 400 102', final: '+41%' },
  { color: '#f1f5f9', path: 'M 10 130 Q 70 130, 130 128 T 230 126 T 310 122 T 400 110', final: '+35%' },
  { color: '#cbd5e1', path: 'M 10 130 Q 110 142, 170 136 T 270 132 T 350 128 T 400 118', final: '+28%' },
  { color: '#94a3b8', path: 'M 10 130 Q 85 140, 145 144 T 245 138 T 325 134 T 400 124', final: '+22%' },
  { color: '#64748b', path: 'M 10 130 Q 90 145, 150 148 T 250 146 T 330 142 T 400 132', final: '+16%' }
];

// Initial correlation matrix data (6x4) in Vibe Purple (#AC58E9), Black, and White shades
const CORRELATION_MATRIX = [
  ['#3b0764', '#AC58E9', '#581c87', '#7928ca', '#AC58E9', '#2e1065'],
  ['#AC58E9', '#3b0764', '#7928ca', '#581c87', '#c084fc', '#2e1065'],
  ['#7928ca', '#581c87', '#3b0764', '#AC58E9', '#581c87', '#3b0764'],
  ['#AC58E9', '#c084fc', '#581c87', '#AC58E9', '#3b0764', '#2e1065']
];

export const LiveCampaignTelemetryGrid: React.FC = () => {
  const [systemTime, setSystemTime] = useState('13:24:57');
  const [strategiesCount, setStrategiesCount] = useState(8756);
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);

  // Auto-scrolling Live Engine Log Feed state
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [feedLogs, setFeedLogs] = useState<string[]>([
    'Tribe A Gen 6: Score 6.25 ---',
    'Survivors 94/200 ---',
    '_STATS Ret 17.6% | DD 2.0% | WR 56.6%',
    '::None | Filt:RSI_EMA_CROSS',
    'MACD | Exec:MARKET2 | RR:1:1.3',
    'Tribe B Gen 8: Score 7.15 ---',
    'Survivors 98/200 ---',
    '_STATS Ret 13.9% | DD 2.8% | WR 58.1%',
    '::HTF_D1 | Filt:CHOP_INDEX',
    'ATR_TRAIL | Exec:LIMIT_MAKER | RR:1:1.6',
    'Tribe A Gen 9: Score 8.42 ---',
    'Survivors 104/200 ---',
    '_STATS Ret 21.4% | DD 1.9% | WR 62.4%',
    '::MT5_IPC | Filt:VOLATILITY_EXPANSION',
    'ORB_BREAKOUT | Exec:DMA_FILL | RR:1:1.8',
    'Tribe C Gen 11: Score 7.88 ---',
    'Survivors 112/200 ---',
    '_STATS Ret 18.2% | DD 2.2% | WR 60.1%',
    '::DERIBIT | Filt:IMPLIED_VOL_SURFACE',
    'DELTA_NEUTRAL | Exec:RFQ_AUCTION | RR:1:1.5'
  ]);

  // 1. Live System Time Clock (13:24:58, 13:24:59...)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSystemTime(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Continuous Log Stream Append
  useEffect(() => {
    const interval = setInterval(() => {
      const genNum = Math.floor(Math.random() * 8) + 10;
      const score = (Math.random() * 2 + 7.5).toFixed(2);
      const survivors = Math.floor(Math.random() * 15) + 95;
      const ret = (Math.random() * 12 + 15).toFixed(1);
      const dd = (Math.random() * 2 + 1.6).toFixed(1);
      const wr = (Math.random() * 8 + 58).toFixed(1);

      const newBatch = [
        `Tribe A Gen ${genNum}: Score ${score} ---`,
        `Survivors ${survivors}/200 ---`,
        `_STATS Ret ${ret}% | DD ${dd}% | WR ${wr}%`,
        `::HTF_H4 | Filt:MOMENTUM_VECTOR`,
        `BREAKOUT | Exec:IPC_SOCKET | RR:1:1.7`
      ];

      setFeedLogs((prev) => [...prev.slice(-35), ...newBatch]);
      setStrategiesCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // 3. Smooth Auto-Scroll Up Ticker for Live Engine Feed
  useEffect(() => {
    if (isFeedPaused) return;
    const container = feedContainerRef.current;
    if (!container) return;

    let animId: number;
    const scrollStep = () => {
      if (container) {
        container.scrollTop += 0.65;
        // If near bottom, reset smoothly
        if (container.scrollTop >= container.scrollHeight - container.clientHeight - 4) {
          container.scrollTop = 0;
        }
      }
      animId = requestAnimationFrame(scrollStep);
    };

    animId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animId);
  }, [isFeedPaused]);

  // 4. IntersectionObserver: Trigger Draw-On Animations when Scrolled Into View
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasScrolledIntoView(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="live-campaign-telemetry-section in-view">
      <div className="section-inner-wrapper">
        {/* ==============================================================
            BENTO GRID DASHBOARD: TWO COLUMNS MATCHING EXACT REFERENCE
            ============================================================== */}
        <div className="telemetry-bento-grid">
          {/* ================= LEFT COLUMN ================= */}
          <div className="bento-col bento-col-left">
            {/* Card 1: PORTFOLIOS & Return Correlation Heatmap */}
            <div className="telemetry-card bento-card-portfolios">
              <div className="card-top-title-row">
                <span className="card-tag-red">P O R T F O L I O S</span>
                <span className="card-tag-gray">3 portfolios</span>
              </div>

              {/* Portfolio Performance Rows */}
              <div className="portfolios-list">
                <div className="portfolio-row">
                  <div className="portfolio-info">
                    <span className="portfolio-name">AGGRESSIVE_ALPHA</span>
                    <span className="portfolio-members">12 members</span>
                  </div>
                  <div className="portfolio-metrics">
                    <span className="portfolio-grade grade-a">A</span>
                    <span className="portfolio-ret ret-positive">+38.2%</span>
                  </div>
                </div>

                <div className="portfolio-row">
                  <div className="portfolio-info">
                    <span className="portfolio-name">STEADY_INCOME</span>
                    <span className="portfolio-members">18 members</span>
                  </div>
                  <div className="portfolio-metrics">
                    <span className="portfolio-grade grade-b">B</span>
                    <span className="portfolio-ret ret-positive">+21.4%</span>
                  </div>
                </div>

                <div className="portfolio-row">
                  <div className="portfolio-info">
                    <span className="portfolio-name">PROP_CHALLENGE</span>
                    <span className="portfolio-members">8 members</span>
                  </div>
                  <div className="portfolio-metrics">
                    <span className="portfolio-grade grade-c">C</span>
                    <span className="portfolio-ret ret-positive">+12.9%</span>
                  </div>
                </div>
              </div>

              {/* Return Correlation Heatmap Matrix */}
              <div className="correlation-matrix-block">
                <div className="correlation-title-row">
                  <span className="corr-label">RETURN CORRELATION</span>
                  <span className="corr-grade">· A-</span>
                </div>

                <div className="heatmap-grid-container">
                  {CORRELATION_MATRIX.map((row, rIdx) => (
                    <div key={rIdx} className="heatmap-row">
                      {row.map((cellColor, cIdx) => (
                        <div
                          key={cIdx}
                          className="heatmap-cell"
                          style={{
                            background: cellColor,
                            animationDelay: `${(rIdx * 6 + cIdx) * 35}ms`
                          }}
                          title={`Asset ${rIdx + 1} vs Asset ${cIdx + 1} Orthogonal Score: 0.${12 + rIdx * 8 + cIdx * 4}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: CAMPAIGN GENERATIONS (Multi-line Equity Spaghetti Curves) */}
            <div className="telemetry-card bento-card-generations">
              <div className="card-top-title-row">
                <span className="card-tag-red">C A M P A I G N &nbsp; G E N E R A T I O N S</span>
                <span className="card-tag-gray">live · all survivors</span>
              </div>

              {/* Multi-Curve SVG Equity Canvas */}
              <div className="equity-curves-stage">
                <svg className="equity-curves-svg" viewBox="0 0 420 155" preserveAspectRatio="none">
                  {/* Subtle Grid Lines */}
                  <line x1="0" y1="30" x2="420" y2="30" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 4" />
                  <line x1="0" y1="75" x2="420" y2="75" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 4" />
                  <line x1="0" y1="120" x2="420" y2="120" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 4" />

                  {/* 14 Multi-colored Equity Paths with synchronized draw-on */}
                  {EQUITY_CURVES.map((curve, idx) => (
                    <path
                      key={idx}
                      d={curve.path}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth={idx < 3 ? '1.8' : '1.1'}
                      strokeOpacity={idx < 3 ? '0.95' : '0.65'}
                      className={`equity-path ${hasScrolledIntoView ? 'path-animated' : ''}`}
                      style={{
                        animationDelay: `${idx * 65}ms`
                      }}
                    />
                  ))}

                  {/* Right Edge Boundary Post & Final Survivor Markers */}
                  <line x1="400" y1="10" x2="400" y2="145" stroke="rgba(255, 46, 84, 0.45)" strokeWidth="1.5" />

                  {EQUITY_CURVES.slice(0, 8).map((curve, idx) => {
                    const yPos = 15 + idx * 17;
                    return (
                      <circle
                        key={idx}
                        cx="400"
                        cy={yPos}
                        r="2.5"
                        fill={curve.color}
                        stroke="#0C0412"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Card 3: LIVE ENGINE FEED (Auto-Scroll Up Stream) */}
            <div
              className="telemetry-card bento-card-feed"
              onMouseEnter={() => setIsFeedPaused(true)}
              onMouseLeave={() => setIsFeedPaused(false)}
            >
              <div className="card-top-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="card-tag-red">L I V E &nbsp; E N G I N E &nbsp; F E E D</span>
                  <span className="live-blink-badge">live</span>
                </div>
                <span className="card-tag-gray">{isFeedPaused ? '⏸ PAUSED' : 'AUTO-SCROLLING'}</span>
              </div>

              {/* Scrolling Log Stream Window */}
              <div ref={feedContainerRef} className="engine-feed-scroll-box">
                <div className="feed-stream-inner">
                  {feedLogs.map((log, idx) => {
                    const isScore = log.includes('Score');
                    const isStats = log.includes('_STATS');
                    const isFilt = log.includes('Filt:');
                    return (
                      <div
                        key={idx}
                        className={`feed-log-line ${isScore ? 'log-highlight-score' : isStats ? 'log-stats' : isFilt ? 'log-filter' : ''}`}
                      >
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom System Timestamp */}
              <div className="feed-bottom-bar">
                <span className="system-clock-label">SYSTEM</span>
                <span className="system-clock-val">{systemTime}</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="bento-col bento-col-right">
            {/* Card 4: STRATEGY VAULT (Leaderboard Table) */}
            <div className="telemetry-card bento-card-vault">
              <div className="card-top-title-row">
                <span className="card-tag-red">S T R A T E G Y &nbsp; V A U L T</span>
                <span className="card-tag-gray">score 60+ · diverse</span>
              </div>

              {/* Massive Vault Strategies Bred Metric */}
              <div className="vault-hero-metric">
                <div className="vault-big-num">{strategiesCount.toLocaleString()}</div>
                <div className="vault-num-label">STRATEGIES BRED</div>
              </div>

              <div className="vault-submetrics-row">
                <div className="submetric-item">
                  <span className="submetric-label">VAULT AVG</span>
                  <span className="submetric-val val-green">74.2</span>
                </div>
                <div className="submetric-item">
                  <span className="submetric-label">TOP SYMBOL</span>
                  <span className="submetric-val">XAUUSD</span>
                </div>
              </div>

              {/* Strategies Leaderboard Table */}
              <div className="strategy-table-container">
                <div className="table-header-row">
                  <span className="th-cell cell-strat">STRATEGY</span>
                  <span className="th-cell cell-score">SCORE</span>
                  <span className="th-cell cell-ret">RET</span>
                  <span className="th-cell cell-dd">DD</span>
                  <span className="th-cell cell-wr">WR</span>
                </div>

                <div className="table-body">
                  {VAULT_STRATEGIES.map((s, idx) => (
                    <div key={idx} className="table-row">
                      <div className="td-cell cell-strat">
                        <span className="strat-sym">{s.symbol}</span>
                        <span className="strat-tf">{s.tf}</span>
                        <span className="strat-hash">{s.hash}</span>
                      </div>
                      <span className="td-cell cell-score score-red">{s.score}</span>
                      <span className="td-cell cell-ret ret-green">{s.ret}</span>
                      <span className="td-cell cell-dd dd-red">{s.dd}</span>
                      <span className="td-cell cell-wr">{s.wr}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 5: LATEST CAMPAIGN */}
            <div className="telemetry-card bento-card-campaign">
              <div className="card-top-title-row">
                <span className="card-tag-red">L A T E S T &nbsp; C A M P A I G N</span>
                <span className="card-tag-gray">4A_H2_H4_0708_1420</span>
              </div>

              {/* Campaign Telemetry Summary */}
              <div className="campaign-summary-stats">
                <div className="camp-stat-box">
                  <span className="camp-stat-label">SURVIVORS</span>
                  <span className="camp-stat-val">20</span>
                </div>
                <div className="camp-stat-box">
                  <span className="camp-stat-label">AVG RET</span>
                  <span className="camp-stat-val val-green">+14.8%</span>
                </div>
                <div className="camp-stat-box">
                  <span className="camp-stat-label">AVG DD</span>
                  <span className="camp-stat-val val-red">3.1%</span>
                </div>
              </div>

              {/* Campaign Table */}
              <div className="strategy-table-container">
                <div className="table-header-row">
                  <span className="th-cell cell-strat">TOP SURVIVORS</span>
                  <span className="th-cell cell-score">SCORE</span>
                  <span className="th-cell cell-ret">RET</span>
                  <span className="th-cell cell-dd">DD</span>
                  <span className="th-cell cell-wr">WR</span>
                </div>

                <div className="table-body">
                  {CAMPAIGN_STRATEGIES.map((s, idx) => (
                    <div key={idx} className="table-row">
                      <div className="td-cell cell-strat">
                        <span className="strat-sym">{s.symbol}</span>
                        <span className="strat-tf">{s.tf}</span>
                        <span className="strat-hash">{s.hash}</span>
                      </div>
                      <span className="td-cell cell-score score-red">{s.score}</span>
                      <span className="td-cell cell-ret ret-green">{s.ret}</span>
                      <span className="td-cell cell-dd dd-red">{s.dd}</span>
                      <span className="td-cell cell-wr">{s.wr}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 6: GENOME SYNTHESIS (Neural Network Synapse Lattice) */}
            <div className="telemetry-card bento-card-genome">
              <div className="card-top-title-row">
                <span className="card-tag-red">G E N O M E &nbsp; S Y N T H E S I S</span>
                <span className="card-tag-gray">best vaulted genome</span>
              </div>

              {/* Animated Neural Lattice SVG */}
              <div className="genome-lattice-stage">
                <svg className="genome-lattice-svg" viewBox="0 0 380 150">
                  <defs>
                    <linearGradient id="synapseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#AC58E9" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#AC58E9" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Neural Connecting Lines */}
                  <line x1="80" y1="25" x2="300" y2="25" stroke="url(#synapseGlow)" strokeWidth="1.5" />
                  <line x1="60" y1="50" x2="320" y2="50" stroke="rgba(172, 88, 233, 0.45)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="90" y1="80" x2="290" y2="80" stroke="url(#synapseGlow)" strokeWidth="1.2" />
                  <line x1="110" y1="110" x2="270" y2="110" stroke="rgba(172, 88, 233, 0.45)" strokeWidth="1" />

                  {/* Cross Layer Synapse Links */}
                  <line x1="140" y1="25" x2="200" y2="50" stroke="rgba(172, 88, 233, 0.35)" strokeWidth="1" />
                  <line x1="240" y1="25" x2="180" y2="80" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" />
                  <line x1="160" y1="50" x2="220" y2="110" stroke="rgba(172, 88, 233, 0.35)" strokeWidth="1" />

                  {/* Layer 1 Nodes (Top Row) */}
                  {[140, 190, 240].map((cx, i) => (
                    <circle key={`l1-${i}`} cx={cx} cy="25" r="5" fill="#AC58E9" filter="drop-shadow(0 0 6px #AC58E9)" />
                  ))}

                  {/* Layer 2 Nodes (Second Row) */}
                  {[100, 130, 160, 190, 220, 250, 280].map((cx, i) => (
                    <circle key={`l2-${i}`} cx={cx} cy="50" r="4.2" fill={i % 2 === 0 ? '#ffffff' : '#AC58E9'} />
                  ))}

                  {/* Layer 3 Nodes (Third Row) */}
                  {[110, 140, 175, 205, 240, 270].map((cx, i) => (
                    <circle key={`l3-${i}`} cx={cx} cy="80" r="4" fill="#AC58E9" opacity="0.85" />
                  ))}

                  {/* Layer 4 Nodes (Bottom Cluster) */}
                  {[125, 155, 175, 195, 215, 235, 255].map((cx, i) => (
                    <circle key={`l4-${i}`} cx={cx} cy="110" r="3.5" fill={i % 2 === 0 ? '#c084fc' : '#ffffff'} opacity="0.85" />
                  ))}

                  {/* Loose Floating Gene Nodes */}
                  <circle cx="140" cy="128" r="3" fill="#AC58E9" opacity="0.6" />
                  <circle cx="160" cy="132" r="3.2" fill="#ffffff" opacity="0.6" />
                  <circle cx="220" cy="128" r="3" fill="#c084fc" opacity="0.6" />
                </svg>
              </div>

              {/* Bottom Pipeline Status Pill */}
              <div className="genome-bottom-hud-row">
                <div className="hud-metric">
                  <span className="hud-label">ETA REMAINING</span>
                  <span className="hud-val">00:03:42</span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">ACTIVE TASK</span>
                  <span className="hud-val" style={{ color: '#ffffff' }}>Walk-Forward Barrier</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
