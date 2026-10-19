import React, { useState, useEffect, useRef } from 'react';
import { AgentNetworkTopology, AgentNetworkNode } from '../types';
import { fetchAgentTopology } from '../api';

interface Particle {
  edgeIdx: number;
  progress: number; // 0.0 to 1.0
  speed: number;
}

export const ObsidianAgentGraph: React.FC = () => {
  const [topology, setTopology] = useState<AgentNetworkTopology | null>(null);
  const [selectedNode, setSelectedNode] = useState<AgentNetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<AgentNetworkNode | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const nodePositionsRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());
  const draggingNodeRef = useRef<string | null>(null);

  // Category Color Map
  const categoryColor: Record<string, { fill: string; border: string; glow: string }> = {
    DATA_FEED: { fill: '#083344', border: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
    AI_MODEL: { fill: '#2E1065', border: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
    RESEARCH_COUNCIL: { fill: '#064E3B', border: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    ON_CHAIN_RESEARCH: { fill: '#451A03', border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
    DERIVATIVES: { fill: '#1E1B4B', border: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)' },
    EXECUTION: { fill: '#4C0519', border: '#F43F5E', glow: 'rgba(244, 63, 94, 0.4)' }
  };

  const getCategoryTheme = (cat: string) => {
    return categoryColor[cat] || { fill: '#0F172A', border: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)' };
  };

  // Initial Data Load
  useEffect(() => {
    fetchAgentTopology()
      .then(top => {
        setTopology(top);
        if (top.nodes.length > 0) {
          setSelectedNode(top.nodes[4]); // Default select Vibe-Trading Council
        }
      })
      .catch(err => console.error('Error fetching topology:', err))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchAgentTopology().then(setTopology).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Initialize node layout and particles
  useEffect(() => {
    if (!topology || topology.nodes.length === 0) return;

    const width = 1050;
    const height = 620;

    // Fixed / Initial layout coordinates
    const layoutCoords: Record<string, { x: number; y: number }> = {
      binance_streamer: { x: 130, y: 310 },
      canonical_sanitizer: { x: 310, y: 310 },
      regime_engine: { x: 500, y: 170 },
      kronos_forecaster: { x: 710, y: 140 },
      vibe_council: { x: 510, y: 440 },
      toric_onchain: { x: 720, y: 310 },
      deribit_hedger: { x: 720, y: 480 },
      sor_router: { x: 890, y: 310 },
      mt5_ea: { x: 1020, y: 310 }
    };

    topology.nodes.forEach(n => {
      const init = layoutCoords[n.id] || { x: width / 2, y: height / 2 };
      if (!nodePositionsRef.current.has(n.id)) {
        nodePositionsRef.current.set(n.id, { x: init.x, y: init.y, vx: 0, vy: 0 });
      }
    });

    // Create 45 animated flow particles along the edges
    const particles: Particle[] = [];
    const edgeCount = topology.edges.length;
    for (let i = 0; i < 45; i++) {
      particles.push({
        edgeIdx: i % edgeCount,
        progress: Math.random(),
        speed: (0.003 + Math.random() * 0.004)
      });
    }
    particlesRef.current = particles;
  }, [topology]);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !topology) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      ctx.fillStyle = '#030712'; // Obsidian deep black
      ctx.fillRect(0, 0, width, height);

      // 2. Draw subtle grid dots
      ctx.fillStyle = '#111827';
      const gridSize = 32;
      for (let x = 16; x < width; x += gridSize) {
        for (let y = 16; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw Edges (Channels)
      topology.edges.forEach((edge) => {
        const srcPos = nodePositionsRef.current.get(edge.source);
        const tgtPos = nodePositionsRef.current.get(edge.target);
        if (!srcPos || !tgtPos) return;

        const isRelated =
          (selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)) ||
          (hoveredNode && (hoveredNode.id === edge.source || hoveredNode.id === edge.target));

        // Edge line
        ctx.beginPath();
        ctx.moveTo(srcPos.x, srcPos.y);
        ctx.lineTo(tgtPos.x, tgtPos.y);

        if (isRelated) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.2;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      });

      // 4. Update and Draw Flowing Particles
      particlesRef.current.forEach(p => {
        p.progress += p.speed * speedMultiplier;
        if (p.progress >= 1.0) {
          p.progress = 0.0;
        }

        const edge = topology.edges[p.edgeIdx];
        if (!edge) return;
        const srcPos = nodePositionsRef.current.get(edge.source);
        const tgtPos = nodePositionsRef.current.get(edge.target);
        if (!srcPos || !tgtPos) return;

        const curX = srcPos.x + (tgtPos.x - srcPos.x) * p.progress;
        const curY = srcPos.y + (tgtPos.y - srcPos.y) * p.progress;

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 5. Draw Nodes
      topology.nodes.forEach(node => {
        const pos = nodePositionsRef.current.get(node.id);
        if (!pos) return;

        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const theme = getCategoryTheme(node.category);
        const radius = isSelected ? 24 : isHovered ? 22 : 18;

        // Outer glow
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + (isSelected ? 8 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.25)' : theme.glow;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = theme.fill;
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = isSelected ? '#38BDF8' : theme.border;
        ctx.shadowColor = isSelected ? '#38BDF8' : theme.border;
        ctx.shadowBlur = isSelected ? 12 : 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner pulsing core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#FFFFFF' : theme.border;
        ctx.fill();

        // Node Label
        ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.fillStyle = isSelected ? '#F8FAFC' : '#94A3B8';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, pos.x, pos.y + radius + 15);

        // Latency tag
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = '#64748B';
        ctx.fillText(`${node.latency_ms}ms`, pos.x, pos.y + radius + 27);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [topology, selectedNode, hoveredNode, speedMultiplier]);

  // Mouse interaction handlers (hover, click, drag)
  const getNodeAtCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !topology) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    for (const node of topology.nodes) {
      const pos = nodePositionsRef.current.get(node.id);
      if (!pos) continue;
      const dx = mouseX - pos.x;
      const dy = mouseY - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) <= 26) {
        return node;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAtCoords(e.clientX, e.clientY);
    if (node) {
      setSelectedNode(node);
      draggingNodeRef.current = node.id;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (draggingNodeRef.current) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const pos = nodePositionsRef.current.get(draggingNodeRef.current);
      if (pos) {
        pos.x = Math.max(30, Math.min(canvas.width - 30, mouseX));
        pos.y = Math.max(30, Math.min(canvas.height - 30, mouseY));
      }
    } else {
      const node = getNodeAtCoords(e.clientX, e.clientY);
      setHoveredNode(node);
      canvas.style.cursor = node ? 'pointer' : 'default';
    }
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
  };

  // Upstream & Downstream relationships for HUD
  const getConnectedEdges = (nodeId: string) => {
    if (!topology) return { upstream: [], downstream: [] };
    const upstream = topology.edges.filter(e => e.target === nodeId);
    const downstream = topology.edges.filter(e => e.source === nodeId);
    return { upstream, downstream };
  };

  if (loading && !topology) {
    return (
      <div className="t2o-card" style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>
        Loading Obsidian Interactive Agent Topology...
      </div>
    );
  }

  const connected = selectedNode ? getConnectedEdges(selectedNode.id) : { upstream: [], downstream: [] };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Topology Status Bar */}
      <div className="t2o-card" style={{ padding: '16px 20px', background: 'linear-gradient(180deg, #090D17 0%, #030712 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#38BDF8', textTransform: 'uppercase' }}>
                Obsidian Live Agent Network
              </span>
              <span className="t2o-badge badge-bullish" style={{ fontSize: 10 }}>
                {topology?.active_agent_count || 9}/9 AGENTS SYNCHRONIZED
              </span>
              <span className="t2o-badge badge-purple" style={{ fontSize: 10 }}>
                {topology?.system_status || 'OPTIMAL_COUPLED'}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', marginTop: 4 }}>
              Interactive Mesh Topology & Inter-Agent Signal Pipeline
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              Click any agent node to inspect internal telemetry, latency, packet rates, and micro-responsibilities. Drag nodes to customize graph layout.
            </div>
          </div>

          {/* Network Controls & Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#07090E', padding: '6px 12px', borderRadius: 6, border: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#64748B' }}>TOTAL THROUGHPUT:</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#10B981' }}>
                {topology?.total_packet_throughput} pkts/s
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#07090E', padding: '4px 8px', borderRadius: 6, border: '1px solid #1E293B' }}>
              <span style={{ fontSize: 10, color: '#64748B' }}>PULSE:</span>
              {[0.5, 1.0, 2.0].map(sp => (
                <button
                  key={sp}
                  onClick={() => setSpeedMultiplier(sp)}
                  style={{
                    padding: '3px 8px',
                    border: 'none',
                    borderRadius: 4,
                    background: speedMultiplier === sp ? '#38BDF8' : 'transparent',
                    color: speedMultiplier === sp ? '#07090E' : '#94A3B8',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas & Telemetry HUD Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        {/* Canvas Graph View */}
        <div className="t2o-card" style={{ padding: 0, overflow: 'hidden', background: '#030712', border: '1px solid #1E293B', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={1100}
            height={620}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />

          {/* Canvas Legend Overlay */}
          <div style={{ position: 'absolute', bottom: 12, left: 14, display: 'flex', gap: 12, flexWrap: 'wrap', background: 'rgba(3, 7, 18, 0.85)', padding: '6px 12px', borderRadius: 6, border: '1px solid #1E293B', backdropFilter: 'blur(4px)' }}>
            {Object.entries(categoryColor).map(([cat, theme]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#94A3B8' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.border }} />
                <span>{cat.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Agent Telemetry HUD */}
        <div className="t2o-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selectedNode ? (
            <>
              {/* Header */}
              <div style={{ borderBottom: '1px solid #1E293B', paddingBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="t2o-badge badge-purple" style={{ fontSize: 9 }}>
                    {selectedNode.category}
                  </span>
                  <span className="t2o-badge badge-bullish" style={{ fontSize: 9 }}>
                    {selectedNode.status}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginTop: 6 }}>
                  {selectedNode.name}
                </div>
                <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                  Node ID: {selectedNode.id}
                </div>
              </div>

              {/* Telemetry Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#090D17', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
                  <div style={{ fontSize: 9, color: '#64748B' }}>PING LATENCY</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#10B981', marginTop: 2 }}>
                    {selectedNode.latency_ms} ms
                  </div>
                  <div style={{ fontSize: 8, color: '#94A3B8', marginTop: 1 }}>Ultra-Low IPC</div>
                </div>

                <div style={{ background: '#090D17', padding: 10, borderRadius: 6, border: '1px solid #1E293B' }}>
                  <div style={{ fontSize: 9, color: '#64748B' }}>PACKETS PROCESSED</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#38BDF8', marginTop: 2 }}>
                    {selectedNode.messages_processed.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 8, color: '#94A3B8', marginTop: 1 }}>Active 24/7</div>
                </div>
              </div>

              {/* Role & Mission */}
              <div style={{ background: '#090D17', padding: 12, borderRadius: 6, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 10, color: '#38BDF8', fontWeight: 700, marginBottom: 4 }}>
                  AGENT RESPONSIBILITY
                </div>
                <div style={{ fontSize: 11, color: '#CBD5E1', lineHeight: 1.5 }}>
                  {selectedNode.role_description}
                </div>
              </div>

              {/* Upstream Feeds */}
              <div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                  Ingesting From ({connected.upstream.length})
                </div>
                {connected.upstream.length === 0 ? (
                  <div style={{ fontSize: 10, color: '#475569', fontStyle: 'italic' }}>Primary Root Ingestion Point</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {connected.upstream.map(edge => (
                      <div key={edge.source} style={{ background: '#07090E', padding: '6px 10px', borderRadius: 4, border: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#F8FAFC' }}>{edge.source}</span>
                        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#38BDF8' }}>
                          {edge.packet_rate_per_sec} p/s
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Downstream Consumers */}
              <div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                  Streaming To ({connected.downstream.length})
                </div>
                {connected.downstream.length === 0 ? (
                  <div style={{ fontSize: 10, color: '#475569', fontStyle: 'italic' }}>Terminal Execution Point</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {connected.downstream.map(edge => (
                      <div key={edge.target} style={{ background: '#07090E', padding: '6px 10px', borderRadius: 4, border: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#F8FAFC' }}>{edge.target}</span>
                        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#10B981' }}>
                          {edge.packet_rate_per_sec} p/s
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748B' }}>
              Select a node in the graph to view telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
