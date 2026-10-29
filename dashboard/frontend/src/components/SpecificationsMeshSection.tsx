import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onEnterTerminal?: () => void;
}

interface MeshNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const SpecificationsMeshSection: React.FC<Props> = ({ onEnterTerminal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC-PERP');
  const [selectedTF, setSelectedTF] = useState<string>('H4');

  const assets = [
    'BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'BTC-OPTIONS',
    'EURUSD', 'GBPUSD', 'AUDUSD', 'USDJPY', 'USDCAD',
    'USDCHF', 'EURGBP', 'GBPJPY', 'EURJPY', 'GBPAUD', 'XAUUSD',
    'XAGUSD', 'US30', 'US500', 'USTEC', 'DE40', 'UK100',
    '+ any symbol your broker lists'
  ];

  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H2', 'H4', 'D1'];

  // Interactive 3D/2D Constellation Mesh Canvas (Screenshot 4)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    let mouseX = -1000;
    let mouseY = -1000;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Initialize 60 connected nodes in the mesh
    const numNodes = 58;
    const nodes: MeshNode[] = [];
    const colors = ['#AC58E9', '#ffffff', '#c084fc', '#e9d5ff', '#7928ca'];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1.8,
        color: colors[i % colors.length]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off canvas edges
        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;

        // Mouse proximity reaction
        const dxMouse = mouseX - node.x;
        const dyMouse = mouseY - node.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 140) {
          node.x -= (dxMouse / distMouse) * 0.8;
          node.y -= (dyMouse / distMouse) * 0.8;
        }
      });

      // Draw connecting lines between nearby nodes (constellation / neural network mesh)
      const maxDist = 135;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.45;
            ctx.strokeStyle = `rgba(172, 88, 233, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Draw line to mouse if close
        const dxMouse = mouseX - nodes[i].x;
        const dyMouse = mouseY - nodes[i].y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 150) {
          const alpha = (1 - distMouse / 150) * 0.65;
          ctx.strokeStyle = `rgba(172, 88, 233, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }

        // Draw node dot with outer halo
        ctx.fillStyle = nodes[i].color;
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].radius, 0, Math.PI * 2);
        ctx.fill();

        // Node glow
        ctx.fillStyle = `rgba(172, 88, 233, 0.25)`;
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].radius * 2.8, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section className="specs-mesh-section">
      {/* 3D Neural Constellation Network Canvas (Screenshot 4) */}
      <canvas ref={canvasRef} className="specs-constellation-canvas" />

      <div className="specs-mesh-inner-container">
        {/* Specifications Glass Card matching Screenshot 4 */}
        <div className="specs-glass-card">
          {/* Top Brand Line */}
          <div className="specs-card-header">
            <span className="specs-chip">SYSTEM ARCHITECTURE &amp; MARKET COVERAGE</span>
            <span className="specs-status-pill">
              <span className="status-live-dot" /> SUB-10MS IPC
            </span>
          </div>

          <div className="specs-2col-grid">
            {/* Left Column: Specifications Table */}
            <div className="specs-table-left">
              <div className="spec-row">
                <span className="spec-label">Connectivity</span>
                <p className="spec-desc">
                  Binance Linear, Deribit Options, Bybit, MetaTrader 5 IPC socket bridge. Broker symbol names like <code>BTCUSDT.p</code> or <code>EURUSD.a</code> are mapped automatically.
                </p>
              </div>

              <div className="spec-row">
                <span className="spec-label">System</span>
                <p className="spec-desc">
                  Windows 10 or 11, Ubuntu Linux, macOS through local binary or cloud VPS daemon. Multi-core IPC scaling means faster multi-generation synthesis.
                </p>
              </div>

              <div className="spec-row">
                <span className="spec-label">Data Pipeline</span>
                <p className="spec-desc">
                  Tick-level orderbook feeds through direct exchange websockets or MT5 history cache, with built-in closed-bar deterministic replay.
                </p>
              </div>

              <div className="spec-row">
                <span className="spec-label">Security</span>
                <p className="spec-desc">
                  Cryptographically signed binaries with zero external tracking. API keys and secret passphrases remain fully encrypted on your local machine.
                </p>
              </div>
            </div>

            {/* Right Column: Asset Badges & Timeframes (Screenshot 4) */}
            <div className="specs-badges-right">
              <div className="badges-group-title">SUPPORTED INSTRUMENTS</div>
              <div className="asset-pills-wrap">
                {assets.map((sym, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAsset(sym)}
                    className={`asset-pill-btn ${selectedAsset === sym ? 'pill-active' : ''}`}
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <div className="badges-group-title" style={{ marginTop: 22 }}>
                EXECUTION TIMEFRAMES
              </div>
              <div className="tf-pills-wrap">
                {timeframes.map((tf, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTF(tf)}
                    className={`tf-pill-btn ${selectedTF === tf ? 'tf-active' : ''}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <p className="specs-footnote">
                Trading timeframes <strong>M1</strong> to <strong>H4</strong>, with higher timeframe regime context up to <strong>D1</strong> on Pro. Deterministic backtesting verifies closed-bar execution without lookahead leakage.
              </p>

              <div style={{ marginTop: 24 }}>
                <button
                  type="button"
                  onClick={onEnterTerminal}
                  className="kraken-btn-get-started"
                  style={{ padding: '11px 28px', fontSize: 13 }}
                >
                  Launch Terminal with {selectedAsset} ({selectedTF})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
