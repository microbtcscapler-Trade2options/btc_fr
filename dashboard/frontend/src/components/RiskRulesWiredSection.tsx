import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export const RiskRulesWiredSection: React.FC<Props> = ({ onOpenAuth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive toggle states for the 8 risk rules matching screenshot 3 & Algory.app
  const [rules, setRules] = useState({
    dailyDrawdown: true,
    maxAggregateRisk: true,
    symbolLock: true,
    profitTarget: true,
    newsFilter: true,
    fridayClose: true,
    maxMargin: true,
    minLotGuard: true
  });

  const toggleRule = (key: keyof typeof rules) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Canvas animation for floating glowing translucent bubbles & vertical grid lines (Screenshot 3)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 650;
    };

    window.addEventListener('resize', handleResize);

    // Initialize 28 floating bubble spheres
    const numBubbles = 26;
    const bubbles: Bubble[] = [];
    for (let i = 0; i < numBubbles; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 32 + 14, // 14px to 46px
        vy: -(Math.random() * 0.45 + 0.25), // upward drift
        vx: (Math.random() - 0.5) * 0.2, // subtle horizontal drift
        alpha: Math.random() * 0.35 + 0.15,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.015
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle vertical grid lines matching screenshot 3
      const colWidth = width / 14;
      ctx.strokeStyle = 'rgba(172, 88, 233,  0.04)';
      ctx.lineWidth = 1;
      for (let x = colWidth; x < width; x += colWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 2. Draw each floating glowing bubble with translucent shell and bright nucleus
      bubbles.forEach((b) => {
        b.y += b.vy;
        b.x += b.vx;
        b.pulsePhase += b.pulseSpeed;

        // Wrap around vertically
        if (b.y + b.radius < -20) {
          b.y = height + b.radius + 10;
          b.x = Math.random() * width;
        }
        if (b.x < -30) b.x = width + 20;
        if (b.x > width + 30) b.x = -20;

        const dynamicAlpha = Math.max(0.08, b.alpha + Math.sin(b.pulsePhase) * 0.08);

        // Outer radial ambient glow
        const grad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.1, b.x, b.y, b.radius);
        grad.addColorStop(0, `rgba(192, 132, 252,  ${dynamicAlpha * 0.45})`);
        grad.addColorStop(0.5, `rgba(172, 88, 233,  ${dynamicAlpha * 0.18})`);
        grad.addColorStop(1, 'rgba(172, 88, 233,  0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Thin glowing ring boundary
        ctx.strokeStyle = `rgba(172, 88, 233,  ${dynamicAlpha * 0.65})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();

        // Central bright pin dot (nucleus)
        ctx.fillStyle = `rgba(255, 255, 255, ${dynamicAlpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="risk-rules-wired-section">
      {/* Dynamic Animated Glowing Floating Bubbles Canvas */}
      <canvas ref={canvasRef} className="risk-bubbles-canvas" />

      <div className="risk-rules-inner-container">
        {/* Header & Subtitle matching Screenshot 3 */}
        <div className="risk-rules-header-block">
          <div className="risk-rules-badge">
            <span className="risk-pulse-dot" />
            <span>INSTITUTIONAL EXECUTION GUARDRAILS</span>
          </div>

          <div className="risk-rules-title-split">
            <h2 className="risk-rules-main-heading">
              Risk rules wired into the <br />
              <span className="heading-purple-glow">execution bridge itself.</span>
            </h2>

            <p className="risk-rules-subtext">
              Chasing a funded account or safeguarding institutional capital? The guardrails are compiled directly into every execution bridge Trade2Options operates and act at the account level, so one bad session does not torch the evaluation. Set them once; every bot you deploy obeys them.
            </p>
          </div>
        </div>

        {/* 8 Interactive Rule Cards with Toggle Switches (Screenshot 3) */}
        <div className="risk-toggles-grid">
          {/* Card 1: Daily drawdown limit */}
          <div className={`risk-toggle-card ${rules.dailyDrawdown ? 'card-active' : ''}`} onClick={() => toggleRule('dailyDrawdown')}>
            <div className="rtc-top-row">
              <button
                type="button"
                className={`ios-switch-btn ${rules.dailyDrawdown ? 'switch-on' : 'switch-off'}`}
                aria-label="Toggle Daily drawdown limit"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h3 className="rtc-rule-title">Daily drawdown limit</h3>
            <p className="rtc-rule-desc">
              Stands down for the rest of the day once the account is down by the session limit. Protects multi-day profit streaks.
            </p>
          </div>

          {/* Card 2: Max aggregate risk */}
          <div className={`risk-toggle-card ${rules.maxAggregateRisk ? 'card-active' : ''}`} onClick={() => toggleRule('maxAggregateRisk')}>
            <div className="rtc-top-row">
              <button
                type="button"
                className={`ios-switch-btn ${rules.maxAggregateRisk ? 'switch-on' : 'switch-off'}`}
                aria-label="Toggle Max aggregate risk"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h3 className="rtc-rule-title">Max aggregate risk</h3>
            <p className="rtc-rule-desc">
              Caps the total simultaneous open risk across all positions. Blocks new signal execution when portfolio risk hits ceiling.
            </p>
          </div>

          {/* Card 3: Symbol lock */}
          <div className={`risk-toggle-card ${rules.symbolLock ? 'card-active' : ''}`} onClick={() => toggleRule('symbolLock')}>
            <div className="rtc-top-row">
              <button
                type="button"
                className={`ios-switch-btn ${rules.symbolLock ? 'switch-on' : 'switch-off'}`}
                aria-label="Toggle Symbol lock"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h3 className="rtc-rule-title">Symbol lock</h3>
            <p className="rtc-rule-desc">
              Two bots on the same symbol never fight each other. Conflicting signals automatically cancel rather than double-hedging.
            </p>
          </div>

          {/* Card 4: Profit target */}
          <div className={`risk-toggle-card ${rules.profitTarget ? 'card-active' : ''}`} onClick={() => toggleRule('profitTarget')}>
            <div className="rtc-top-row">
              <button
                type="button"
                className={`ios-switch-btn ${rules.profitTarget ? 'switch-on' : 'switch-off'}`}
                aria-label="Toggle Profit target"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h3 className="rtc-rule-title">Profit target</h3>
            <p className="rtc-rule-desc">
              Optional circuit-taker. Stops trading for the day once the daily target is reached, locking in gains and passing challenges.
            </p>
          </div>

          {/* Card 5: News & volatility filter */}
          <div className={`risk-toggle-card ${rules.newsFilter ? 'card-active' : ''}`} onClick={() => toggleRule('newsFilter')}>
            <div className="rtc-top-row">
              <button
                type="button"
                className={`ios-switch-btn ${rules.newsFilter ? 'switch-on' : 'switch-off'}`}
                aria-label="Toggle News filter"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h3 className="rtc-rule-title">Macro news filter</h3>
            <p className="rtc-rule-desc">
              Halts order placement 15 minutes before and after high-impact CPI, FOMC, or ETF inflow announcements to prevent slippage shocks.
            </p>
          </div>

          {/* Card 6: Friday close */}
          <div className={`risk-toggle-card ${rules.fridayClose ? 'card-active' : ''}`} onClick={() => toggleRule('fridayClose')}>
            <div className="rtc-top-row">
              <button
                type="button"
                className={`ios-switch-btn ${rules.fridayClose ? 'switch-on' : 'switch-off'}`}
                aria-label="Toggle Friday close"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h3 className="rtc-rule-title">Weekend gap close</h3>
            <p className="rtc-rule-desc">
              Flattens all open crypto perpetual and FX exposures before market close to eliminate Sunday gap risk and swap spikes.
            </p>
          </div>

          {/* Card 7: Max margin throttle */}
          <div className={`risk-toggle-card ${rules.maxMargin ? 'card-active' : ''}`} onClick={() => toggleRule('maxMargin')}>
            <div className="rtc-top-row">
              <button
                type="button"
                className={`ios-switch-btn ${rules.maxMargin ? 'switch-on' : 'switch-off'}`}
                aria-label="Toggle Max margin"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h3 className="rtc-rule-title">Max margin throttle</h3>
            <p className="rtc-rule-desc">
              Calculates free margin before every ticket. If available collateral dips below 30%, further entry signals are safely queued.
            </p>
          </div>

          {/* Card 8: Execution latency ceiling */}
          <div className={`risk-toggle-card ${rules.minLotGuard ? 'card-active' : ''}`} onClick={() => toggleRule('minLotGuard')}>
            <div className="rtc-top-row">
              <button
                type="button"
                className={`ios-switch-btn ${rules.minLotGuard ? 'switch-on' : 'switch-off'}`}
                aria-label="Toggle Latency ceiling"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h3 className="rtc-rule-title">Latency ceiling</h3>
            <p className="rtc-rule-desc">
              Guarantees sub-15ms IPC execution. Rejects order routing if socket latency degrades due to ISP or broker queue congestion.
            </p>
          </div>
        </div>

        {/* Risk Governance Action Bar */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            type="button"
            onClick={() => onOpenAuth?.('signup')}
            className="kraken-btn-get-started"
            style={{ padding: '12px 32px', fontSize: 13.5 }}
          >
            Configure Custom Risk Matrix
          </button>
        </div>
      </div>
    </section>
  );
};
