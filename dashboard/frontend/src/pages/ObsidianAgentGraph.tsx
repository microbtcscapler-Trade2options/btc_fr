import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AgentNetworkTopology, AgentNetworkNode } from '../types';
import { fetchAgentTopology } from '../api';
import { QuantTacticalRadar3D } from '../components/QuantTacticalRadar3D';

interface Props {
  currentPrice?: number;
}

interface FlowParticle {
  edgeIdx: number;
  progress: number; // 0.0 to 1.0
  speed: number;
  size: number;
  color: string;
}

interface SpaceStar {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  color: string;
}

interface ParticleBurst {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
}

export const ObsidianAgentGraph: React.FC<Props> = ({ currentPrice = 81681.69 }) => {
  const [topology, setTopology] = useState<AgentNetworkTopology | null>(null);
  const [selectedNode, setSelectedNode] = useState<AgentNetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<AgentNetworkNode | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState<boolean>(true);
  const [isWaveSurging, setIsWaveSurging] = useState<boolean>(false);
  const [starCount] = useState<number>(360);

  // Oscilloscope probe interactive telemetry
  const [waveProbe, setWaveProbe] = useState({
    freq: '14.82 GHz',
    amplitude: '94.2 dB',
    phase: '+0.42 rad',
    jitter: '0.12 ms',
    active: false,
    x: 0,
    y: 0
  });

  // Canvas Refs
  const spaceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Physics & Particle state refs
  const flowParticlesRef = useRef<FlowParticle[]>([]);
  const spaceStarsRef = useRef<SpaceStar[]>([]);
  const burstsRef = useRef<ParticleBurst[]>([]);
  const nodePositionsRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number; baseRadius: number }>>(new Map());
  const draggingNodeRef = useRef<string | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const waveAnimFrameRef = useRef<number | null>(null);

  // Mouse camera & Gravity tracking
  const mousePosRef = useRef<{ x: number; y: number; isDown: boolean; isInside: boolean }>({ x: 0, y: 0, isDown: false, isInside: false });
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomScaleRef = useRef<number>(1.0);
  const isPanningRef = useRef<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Category Color Map (Cosmic Apex Theme)
  const categoryColor: Record<string, { fill: string; border: string; glow: string; label: string }> = {
    DATA_FEED: { fill: 'rgba(172, 88, 233,  0.16)', border: '#AC58E9', glow: 'rgba(172, 88, 233,  0.45)', label: 'Data Feed' },
    AI_MODEL: { fill: 'rgba(172, 88, 233,  0.22)', border: '#AC58E9', glow: 'rgba(172, 88, 233,  0.55)', label: 'AI Model' },
    RESEARCH_COUNCIL: { fill: 'rgba(172, 88, 233, 0.22)', border: '#AC58E9', glow: 'rgba(172, 88, 233, 0.5)', label: 'Research Council' },
    ON_CHAIN_RESEARCH: { fill: 'rgba(172, 88, 233, 0.22)', border: '#AC58E9', glow: 'rgba(172, 88, 233, 0.5)', label: 'On-Chain' },
    DERIVATIVES: { fill: 'rgba(121, 40, 202,  0.22)', border: '#c084fc', glow: 'rgba(121, 40, 202,  0.5)', label: 'Derivatives' },
    EXECUTION: { fill: 'rgba(244, 63, 94, 0.22)', border: '#c084fc', glow: 'rgba(244, 63, 94, 0.55)', label: 'Execution' }
  };

  const getCategoryTheme = (cat: string) => {
    return categoryColor[cat] || { fill: 'rgba(172, 88, 233,  0.2)', border: '#AC58E9', glow: 'rgba(172, 88, 233,  0.45)', label: cat };
  };

  // Keyboard shortcut listener for ESC to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Load Topology Data
  useEffect(() => {
    fetchAgentTopology()
      .then(top => {
        setTopology(top);
        if (top.nodes.length > 0) {
          const defaultNode = top.nodes.find(n => n.id === 'vibe_council') || top.nodes[0];
          setSelectedNode(defaultNode);
        }
      })
      .catch(err => console.error('Error fetching agent topology:', err))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchAgentTopology().then(setTopology).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Stars & Particles
  useEffect(() => {
    const stars: SpaceStar[] = [];
    const colors = ['#FFFFFF', '#c084fc', '#AC58E9', '#FFFFFF', '#AC58E9', '#e9d5ff'];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 3200,
        y: (Math.random() - 0.5) * 2200,
        z: Math.random() * 800 + 100,
        size: Math.random() * 2.2 + 0.6,
        baseAlpha: Math.random() * 0.7 + 0.25,
        twinklePhase: Math.random() * Math.PI * 2,
        color: colors[i % colors.length]
      });
    }
    spaceStarsRef.current = stars;
  }, [starCount]);

  // Initialize Node Spatial Layout
  useEffect(() => {
    if (!topology || topology.nodes.length === 0) return;

    // Organic cosmic arrangement across coordinate plane
    const layoutCoords: Record<string, { x: number; y: number }> = {
      binance_streamer: { x: 140, y: 320 },
      canonical_sanitizer: { x: 320, y: 320 },
      regime_engine: { x: 500, y: 160 },
      kronos_forecaster: { x: 740, y: 130 },
      vibe_council: { x: 520, y: 470 },
      toric_onchain: { x: 740, y: 320 },
      deribit_hedger: { x: 740, y: 510 },
      sor_router: { x: 920, y: 320 },
      mt5_ea: { x: 1060, y: 320 }
    };

    topology.nodes.forEach(n => {
      const init = layoutCoords[n.id] || { x: 600, y: 320 };
      if (!nodePositionsRef.current.has(n.id)) {
        nodePositionsRef.current.set(n.id, {
          x: init.x,
          y: init.y,
          vx: 0,
          vy: 0,
          baseRadius: n.id === 'vibe_council' ? 24 : 19
        });
      }
    });

    // Create 60 high-velocity photon particles traveling along curved conduits
    const edgeCount = topology.edges.length;
    const particles: FlowParticle[] = [];
    const photonColors = ['#AC58E9', '#FFFFFF', '#c084fc', '#AC58E9', '#AC58E9', '#AC58E9'];
    for (let i = 0; i < 60; i++) {
      particles.push({
        edgeIdx: i % edgeCount,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.0045,
        size: Math.random() * 2.2 + 1.8,
        color: photonColors[i % photonColors.length]
      });
    }
    flowParticlesRef.current = particles;
  }, [topology]);

  // Trigger Burst of Stardust / Quantum Sparks
  const spawnBurst = useCallback((x: number, y: number, count = 28, customColor?: string) => {
    const newBursts: ParticleBurst[] = [];
    const palette = ['#AC58E9', '#FFFFFF', '#AC58E9', '#FFFFFF', '#AC58E9'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.5;
      newBursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.015,
        color: customColor || palette[i % palette.length],
        size: Math.random() * 2.8 + 1.2
      });
    }
    burstsRef.current.push(...newBursts);
  }, []);

  // Main Deep Space Canvas Render Loop (Graph + Stars + Curved Wave Conduits)
  useEffect(() => {
    const canvas = spaceCanvasRef.current;
    if (!canvas || !topology) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let time = 0;

    const render = () => {
      if (!running) return;
      time += 0.02 * speedMultiplier;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Deep Space Midnight Violet Void
      ctx.fillStyle = '#030804';
      ctx.fillRect(0, 0, width, height);

      // Save transform for pan and zoom
      ctx.save();
      ctx.translate(panOffsetRef.current.x, panOffsetRef.current.y);
      ctx.scale(zoomScaleRef.current, zoomScaleRef.current);

      // 2. Ambient Nebula Clouds
      const grad1 = ctx.createRadialGradient(width * 0.35, height * 0.4, 40, width * 0.35, height * 0.4, 550);
      grad1.addColorStop(0, 'rgba(172, 88, 233,  0.12)');
      grad1.addColorStop(0.5, 'rgba(172, 88, 233,  0.05)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(-600, -400, width + 1200, height + 800);

      const grad2 = ctx.createRadialGradient(width * 0.75, height * 0.6, 30, width * 0.75, height * 0.6, 500);
      grad2.addColorStop(0, 'rgba(172, 88, 233,  0.09)');
      grad2.addColorStop(0.6, 'rgba(172, 88, 233,  0.03)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(-600, -400, width + 1200, height + 800);

      // 3. 3D Drifting Starfield Particles with Mouse Parallax
      const mouse = mousePosRef.current;
      const parallaxX = (mouse.x - width / 2) * 0.03;
      const parallaxY = (mouse.y - height / 2) * 0.03;

      spaceStarsRef.current.forEach(star => {
        const factor = 200 / star.z;
        const sx = star.x + width / 2 - parallaxX * factor;
        const sy = star.y + height / 2 - parallaxY * factor;

        // Twinkle modulation
        const twinkle = Math.sin(time * 2 + star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size * Math.min(1.6, factor), 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 4. Subtle Celestial Grid Reticle Dots
      ctx.fillStyle = 'rgba(172, 88, 233,  0.12)';
      const gridSize = 40;
      for (let gx = 0; gx < width + 400; gx += gridSize) {
        for (let gy = 0; gy < height + 400; gy += gridSize) {
          ctx.beginPath();
          ctx.arc(gx - 200, gy - 200, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Cursor Gravitational Attractor Halo
      if (mouse.isInside) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 45, 0, Math.PI * 2);
        const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 2, mouse.x, mouse.y, 45);
        mouseGrad.addColorStop(0, 'rgba(172, 88, 233,  0.35)');
        mouseGrad.addColorStop(0.5, 'rgba(172, 88, 233,  0.1)');
        mouseGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGrad;
        ctx.fill();
      }

      // 6. Draw Organic Curved Energy Conduits (Bézier Wave Lines)
      topology.edges.forEach((edge, edgeIdx) => {
        const srcPos = nodePositionsRef.current.get(edge.source);
        const tgtPos = nodePositionsRef.current.get(edge.target);
        if (!srcPos || !tgtPos) return;

        const isRelated =
          (selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)) ||
          (hoveredNode && (hoveredNode.id === edge.source || hoveredNode.id === edge.target));

        const isFiltered =
          selectedCategory !== 'ALL' &&
          topology.nodes.find(n => n.id === edge.source)?.category !== selectedCategory &&
          topology.nodes.find(n => n.id === edge.target)?.category !== selectedCategory;

        // Calculate organic Bézier control point with harmonic sway
        const midX = (srcPos.x + tgtPos.x) / 2;
        const midY = (srcPos.y + tgtPos.y) / 2;
        const dx = tgtPos.x - srcPos.x;
        const dy = tgtPos.y - srcPos.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));

        const normalX = -dy / dist;
        const normalY = dx / dist;

        // Curvature sign alternates for natural web geometry
        const curveSign = edgeIdx % 2 === 0 ? 1 : -1;
        const curveOffset = Math.sin(time * 0.9 + edgeIdx) * 10 + 38 * curveSign;

        // Dynamic cursor deflection (plucking the cosmic string)
        let cursorInfluenceX = 0;
        let cursorInfluenceY = 0;
        if (mouse.isInside) {
          const cdx = mouse.x - midX;
          const cdy = mouse.y - midY;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < 140) {
            const force = (1 - cdist / 140) * 32;
            cursorInfluenceX = (cdx / cdist) * force;
            cursorInfluenceY = (cdy / cdist) * force;
          }
        }

        const cpX = midX + normalX * curveOffset + cursorInfluenceX;
        const cpY = midY + normalY * curveOffset + cursorInfluenceY;

        // Draw curved energy conduit
        ctx.beginPath();
        ctx.moveTo(srcPos.x, srcPos.y);
        ctx.quadraticCurveTo(cpX, cpY, tgtPos.x, tgtPos.y);

        if (isFiltered) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1;
        } else if (isRelated) {
          ctx.strokeStyle = '#AC58E9';
          ctx.lineWidth = 2.8;
          ctx.shadowColor = 'rgba(172, 88, 233,  0.85)';
          ctx.shadowBlur = 14;
        } else {
          ctx.strokeStyle = 'rgba(172, 88, 233,  0.35)';
          ctx.lineWidth = 1.4;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 7. Flowing Photon Packet Clusters along Quadratic Bézier Curves
      flowParticlesRef.current.forEach(p => {
        p.progress += p.speed * speedMultiplier;
        if (p.progress >= 1.0) p.progress = 0.0;

        const edge = topology.edges[p.edgeIdx];
        if (!edge) return;
        const srcPos = nodePositionsRef.current.get(edge.source);
        const tgtPos = nodePositionsRef.current.get(edge.target);
        if (!srcPos || !tgtPos) return;

        const isFiltered =
          selectedCategory !== 'ALL' &&
          topology.nodes.find(n => n.id === edge.source)?.category !== selectedCategory &&
          topology.nodes.find(n => n.id === edge.target)?.category !== selectedCategory;

        if (isFiltered) return;

        const midX = (srcPos.x + tgtPos.x) / 2;
        const midY = (srcPos.y + tgtPos.y) / 2;
        const dx = tgtPos.x - srcPos.x;
        const dy = tgtPos.y - srcPos.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const curveSign = p.edgeIdx % 2 === 0 ? 1 : -1;
        const curveOffset = Math.sin(time * 0.9 + p.edgeIdx) * 10 + 38 * curveSign;
        const cpX = midX + (-dy / dist) * curveOffset;
        const cpY = midY + (dx / dist) * curveOffset;

        // Quadratic Bézier Point: B(t) = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
        const t = p.progress;
        const omt = 1 - t;
        const curX = omt * omt * srcPos.x + 2 * omt * t * cpX + t * t * tgtPos.x;
        const curY = omt * omt * srcPos.y + 2 * omt * t * cpY + t * t * tgtPos.y;

        // Particle Head
        ctx.beginPath();
        ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();

        // Trailing Comet Spark
        const trailT = Math.max(0, t - 0.04);
        const omtt = 1 - trailT;
        const trailX = omtt * omtt * srcPos.x + 2 * omtt * trailT * cpX + trailT * trailT * tgtPos.x;
        const trailY = omtt * omtt * srcPos.y + 2 * omtt * trailT * cpY + trailT * trailT * tgtPos.y;

        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(trailX, trailY);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.6;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      // 8. Render Stardust Bursts & Explosive Click Sparks
      burstsRef.current.forEach((b, idx) => {
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.96;
        b.vy *= 0.96;
        b.alpha -= b.decay;

        if (b.alpha <= 0) {
          burstsRef.current.splice(idx, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = Math.max(0, b.alpha);
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      // 9. Celestial Agent Nodes
      topology.nodes.forEach(node => {
        const pos = nodePositionsRef.current.get(node.id);
        if (!pos) return;

        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isCategoryActive = selectedCategory === 'ALL' || selectedCategory === node.category;
        const theme = getCategoryTheme(node.category);
        const radius = (isSelected ? 26 : isHovered ? 23 : pos.baseRadius);

        // Alpha fade if filtered
        ctx.globalAlpha = isCategoryActive ? 1.0 : 0.2;

        // Outer Gravitational Breathing Halo
        const breathe = Math.sin(time * 3 + node.name.length) * 4;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 12 + breathe, 0, Math.PI * 2);
        const haloGrad = ctx.createRadialGradient(pos.x, pos.y, radius, pos.x, pos.y, radius + 14 + breathe);
        haloGrad.addColorStop(0, theme.glow);
        haloGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // Rotating Dashed Orbit Ring with Satellite Photons
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(time * 0.8 + node.name.length);
        ctx.beginPath();
        ctx.arc(0, 0, radius + 7, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#AC58E9' : theme.border;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 7]);
        ctx.stroke();

        // Mini Orbiting Satellite
        ctx.beginPath();
        ctx.arc(radius + 7, 0, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = theme.border;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();

        // Core Node Sphere Body
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(pos.x - radius * 0.3, pos.y - radius * 0.3, 2, pos.x, pos.y, radius);
        coreGrad.addColorStop(0, '#FFFFFF');
        coreGrad.addColorStop(0.3, theme.border);
        coreGrad.addColorStop(1, '#070312');
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Glowing Node Rim
        ctx.strokeStyle = isSelected ? '#FFFFFF' : theme.border;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.shadowColor = theme.border;
        ctx.shadowBlur = isSelected ? 16 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner Pulsing Core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Node Title Tag
        ctx.font = isSelected ? '800 11.5px "Plus Jakarta Sans", sans-serif' : '700 10.5px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 4;
        ctx.fillText(node.name, pos.x, pos.y + radius + 16);

        // Latency & Category Sub-label
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillStyle = theme.border;
        ctx.fillText(`${node.latency_ms}ms`, pos.x, pos.y + radius + 28);
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 1.0;
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [topology, selectedNode, hoveredNode, speedMultiplier, selectedCategory, isFullscreen]);

  // Section 2: Real-Time Inter-Agent IPC Harmonic Waveform (Curve & Wave Line Laboratory)
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let waveTime = 0;

    const renderWave = () => {
      if (!running) return;
      waveTime += 0.03 * (isWaveSurging ? 2.5 : 1.0);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Dark Cosmic Glass Void
      ctx.fillStyle = '#080314';
      ctx.fillRect(0, 0, width, height);

      // Horizontal Center Reference Reticle Line
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertical Harmonic Frequency Grid lines
      for (let x = 60; x < width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = 'rgba(172, 88, 233,  0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const surgeGain = isWaveSurging ? 1.6 : 1.0;

      // Curve 1: High-Frequency Ingestion Stream Carrier (Cyan #AC58E9)
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const harmonic = Math.sin(x * 0.025 + waveTime * 2.8) * 22 * surgeGain + Math.sin(x * 0.06 - waveTime * 1.5) * 8;
        const y = centerY + harmonic;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#AC58E9';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(172, 88, 233,  0.65)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Curve 2: AI Neural Consensus & Entropy Modulation Wave (Fuchsia / Neon Violet #FFFFFF)
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const harmonic = Math.sin(x * 0.012 + waveTime * 1.4) * 32 * surgeGain + Math.cos(x * 0.035 + waveTime * 0.8) * 14;
        const y = centerY + harmonic;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(172, 88, 233,  0.7)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Curve 3: Execution Settlement & SOR Risk Trigger Pulse Wave (Emerald #AC58E9)
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const step = Math.sin(x * 0.018 + waveTime * 3.2);
        const harmonic = (step > 0.4 ? 24 : step < -0.4 ? -24 : 0) * surgeGain;
        const y = centerY + harmonic + Math.sin(x * 0.04) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#AC58E9';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(172, 88, 233, 0.6)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Interactive Cursor Frequency Probe Crosshair & Modulation Line
      if (waveProbe.active) {
        ctx.beginPath();
        ctx.moveTo(waveProbe.x, 0);
        ctx.lineTo(waveProbe.x, height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Luminous crosshair point
        ctx.beginPath();
        ctx.arc(waveProbe.x, waveProbe.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#AC58E9';
        ctx.shadowColor = '#AC58E9';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      waveAnimFrameRef.current = requestAnimationFrame(renderWave);
    };

    waveAnimFrameRef.current = requestAnimationFrame(renderWave);
    return () => {
      running = false;
      if (waveAnimFrameRef.current) cancelAnimationFrame(waveAnimFrameRef.current);
    };
  }, [isWaveSurging, waveProbe, isFullscreen]);

  // Handle Space Canvas Mouse Interactions (Dragging Nodes, Panning & Zooming)
  const getNodeAtCoords = (clientX: number, clientY: number) => {
    const canvas = spaceCanvasRef.current;
    if (!canvas || !topology) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    // Apply inverse pan and zoom
    const worldX = (mouseX - panOffsetRef.current.x) / zoomScaleRef.current;
    const worldY = (mouseY - panOffsetRef.current.y) / zoomScaleRef.current;

    for (const node of topology.nodes) {
      const pos = nodePositionsRef.current.get(node.id);
      if (!pos) continue;
      const dx = worldX - pos.x;
      const dy = worldY - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) <= 30) {
        return node;
      }
    }
    return null;
  };

  const handleSpaceMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAtCoords(e.clientX, e.clientY);
    if (node) {
      setSelectedNode(node);
      draggingNodeRef.current = node.id;
      // Spawn vibrant click shockwave on node
      const pos = nodePositionsRef.current.get(node.id);
      if (pos) {
        spawnBurst(pos.x, pos.y, 35, getCategoryTheme(node.category).border);
      }
    } else {
      // Start camera panning
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - panOffsetRef.current.x, y: e.clientY - panOffsetRef.current.y };
      // Spawn ambient space burst at clicked coordinates
      const canvas = spaceCanvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const worldX = ((e.clientX - rect.left) * (canvas.width / rect.width) - panOffsetRef.current.x) / zoomScaleRef.current;
        const worldY = ((e.clientY - rect.top) * (canvas.height / rect.height) - panOffsetRef.current.y) / zoomScaleRef.current;
        spawnBurst(worldX, worldY, 20);
      }
    }
  };

  const handleSpaceMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = spaceCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    mousePosRef.current = { x: mouseX, y: mouseY, isDown: e.buttons > 0, isInside: true };

    if (draggingNodeRef.current) {
      const worldX = (mouseX - panOffsetRef.current.x) / zoomScaleRef.current;
      const worldY = (mouseY - panOffsetRef.current.y) / zoomScaleRef.current;

      const pos = nodePositionsRef.current.get(draggingNodeRef.current);
      if (pos) {
        pos.x = worldX;
        pos.y = worldY;
      }
    } else if (isPanningRef.current) {
      panOffsetRef.current = {
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      };
    } else {
      const node = getNodeAtCoords(e.clientX, e.clientY);
      setHoveredNode(node);
      canvas.style.cursor = node ? 'grab' : isPanningRef.current ? 'grabbing' : 'crosshair';
    }
  };

  const handleSpaceMouseUp = () => {
    draggingNodeRef.current = null;
    isPanningRef.current = false;
  };

  const handleSpaceWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    zoomScaleRef.current = Math.min(2.2, Math.max(0.65, zoomScaleRef.current * zoomFactor));
  };

  // Oscilloscope Mouse Modulation
  const handleWaveMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const freqGHz = (8 + (x / canvas.width) * 16).toFixed(2);
    const ampDb = (60 + ((canvas.height - y) / canvas.height) * 45).toFixed(1);
    const phaseRad = (((x / canvas.width) * Math.PI * 2) - Math.PI).toFixed(2);
    const jitterMs = (0.05 + Math.random() * 0.15).toFixed(2);

    setWaveProbe({
      freq: `${freqGHz} GHz`,
      amplitude: `${ampDb} dB`,
      phase: `${phaseRad > '0' ? '+' : ''}${phaseRad} rad`,
      jitter: `${jitterMs} ms`,
      active: true,
      x,
      y
    });
  };

  const handleWaveMouseLeave = () => {
    setWaveProbe(prev => ({ ...prev, active: false }));
  };

  // Ingest Synaptic Burst Along Selected Node
  const handleTriggerNodeBurst = () => {
    if (!selectedNode || !topology) return;
    const pos = nodePositionsRef.current.get(selectedNode.id);
    if (pos) {
      spawnBurst(pos.x, pos.y, 45, getCategoryTheme(selectedNode.category).border);
    }
    setIsWaveSurging(true);
    setTimeout(() => setIsWaveSurging(false), 1200);
  };

  // Upstream & Downstream calculations
  const getConnectedEdges = (nodeId: string) => {
    if (!topology) return { upstream: [], downstream: [] };
    const upstream = topology.edges.filter(e => e.target === nodeId);
    const downstream = topology.edges.filter(e => e.source === nodeId);
    return { upstream, downstream };
  };

  if (loading && !topology) {
    return (
      <div className="t2o-card" style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>
        <div className="pulse-dot" style={{ width: 12, height: 12, background: 'var(--accent-cyan-bright)', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>INITIALIZING OBSIDIAN DEEP SPACE NEURAL TOPOLOGY...</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>Establishing inter-agent WebSocket pipes & zero-latency shared memory</div>
      </div>
    );
  }

  const connected = selectedNode ? getConnectedEdges(selectedNode.id) : { upstream: [], downstream: [] };
  const categories = ['ALL', 'DATA_FEED', 'AI_MODEL', 'RESEARCH_COUNCIL', 'ON_CHAIN_RESEARCH', 'DERIVATIVES', 'EXECUTION'];

  const content = (
    <div
      ref={containerRef}
      className={`obsidian-spatial-root ${isFullscreen ? 'obsidian-fullscreen-active' : ''}`}
      style={
        isFullscreen
          ? {
              position: 'fixed',
              inset: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 99999,
              background: '#030804',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              position: 'relative'
            }
      }
    >
      {/* =========================================================================
          SECTION 1: HIGH-TECH TOPOLOGY CONTROL & METRICS COMMAND BAR
          ========================================================================= */}
      <div
        className="t2o-card stagger-card"
        style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, rgba(8, 22, 10,  0.88) 0%, rgba(4, 12, 6,  0.94) 100%)',
          border: '1px solid rgba(172, 88, 233,  0.3)',
          backdropFilter: 'blur(20px)',
          borderRadius: isFullscreen ? 0 : '20px',
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Left Title & Status */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="price-beacon-dot" />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.2, color: '#AC58E9', textTransform: 'uppercase' }}>
                OBSIDIAN AGENT MESH &bull; DEEP SPACE TOPOLOGY
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: 'rgba(172, 88, 233,  0.18)',
                  color: '#AC58E9',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(172, 88, 233,  0.4)'
                }}
              >
                {topology?.active_agent_count || 9}/9 AGENTS SYNCHRONIZED
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: 'rgba(172, 88, 233,  0.22)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(172, 88, 233,  0.45)'
                }}
              >
                CURVED ENERGY GEODESICS ACTIVE
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', marginTop: 4, letterSpacing: -0.2 }}>
              High-Dimensional Multi-Agent Spatial Pipeline &amp; Inter-Process Comms
            </div>
          </div>

          {/* Right Action Buttons & Fullscreen Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Speed Multiplier */}
            <div className="segmented-pill-container" style={{ padding: '3px 6px', background: 'rgba(11, 29, 14,  0.8)' }}>
              <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 800, paddingLeft: 6 }}>SPEED:</span>
              {[0.5, 1.0, 2.5, 5.0].map(sp => (
                <button
                  key={sp}
                  onClick={() => setSpeedMultiplier(sp)}
                  className={`segmented-pill-btn ${speedMultiplier === sp ? 'segmented-pill-btn-active' : ''}`}
                  style={{ padding: '3px 8px', fontSize: 10 }}
                >
                  {sp}x
                </button>
              ))}
            </div>

            {/* Spark Storm Action */}
            <button
              onClick={() => {
                const canvas = spaceCanvasRef.current;
                if (canvas) {
                  spawnBurst(canvas.width / 2, canvas.height / 2, 60);
                }
              }}
              className="control-pill-btn shimmer-sweep"
              style={{
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 800,
                color: '#FFFFFF',
                borderColor: 'rgba(172, 88, 233,  0.4)',
                background: 'rgba(172, 88, 233,  0.15)'
              }}
              title="Spawn interactive stardust particle shockwave"
            >
              ✨ Stardust Storm
            </button>

            {/* Fullscreen Spatial Mode Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="control-pill-btn shimmer-sweep"
              style={{
                padding: '7px 16px',
                fontSize: 11,
                fontWeight: 900,
                color: isFullscreen ? '#c084fc' : '#AC58E9',
                borderColor: isFullscreen ? 'rgba(251, 113, 133, 0.5)' : 'rgba(172, 88, 233,  0.5)',
                background: isFullscreen ? 'rgba(244, 63, 94, 0.18)' : 'linear-gradient(135deg, rgba(172, 88, 233,  0.25) 0%, rgba(172, 88, 233,  0.15) 100%)',
                boxShadow: isFullscreen ? '0 0 20px rgba(244, 63, 94, 0.4)' : '0 0 20px rgba(172, 88, 233,  0.3)'
              }}
            >
              {isFullscreen ? '✕ Exit Fullscreen (Esc)' : '⛶ Deep Space Fullscreen'}
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, overflowX: 'auto', paddingBottom: 2 }}>
          <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 800, letterSpacing: 0.5 }}>FILTER FOCUS:</span>
          {categories.map(cat => {
            const isAct = selectedCategory === cat;
            const theme = cat === 'ALL' ? null : categoryColor[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: isAct ? `1px solid ${theme ? theme.border : '#AC58E9'}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isAct ? (theme ? theme.fill : 'rgba(172, 88, 233,  0.18)') : 'rgba(255, 255, 255, 0.03)',
                  color: isAct ? '#FFFFFF' : '#94A3B8',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {theme && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: theme.border,
                      boxShadow: `0 0 6px ${theme.border}`
                    }}
                  />
                )}
                <span>{cat.replace(/_/g, ' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: DEEP SPACE 3D NEURAL MESH GALAXY (CANVAS + HUD)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showTelemetryDrawer ? 'minmax(0, 1fr) 390px' : '1fr',
          gap: 18,
          flex: isFullscreen ? 1 : 'unset',
          minHeight: isFullscreen ? 0 : '620px',
          position: 'relative'
        }}
      >
        {/* Main Deep Space Canvas Viewport */}
        <div
          className="t2o-card stagger-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            background: '#030804',
            border: '1px solid rgba(172, 88, 233,  0.3)',
            borderRadius: isFullscreen ? 0 : '20px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), inset 0 0 40px rgba(172, 88, 233,  0.06)'
          }}
        >
          {/* Floating Instructions & Zoom Controls */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 18,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                background: 'rgba(6, 16, 8,  0.85)',
                border: '1px solid rgba(172, 88, 233,  0.35)',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: 10.5,
                fontWeight: 700,
                color: '#c084fc',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>🪐 DRAG NODES</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>&bull;</span>
              <span>🌌 DRAG VOID TO PAN</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>&bull;</span>
              <span>🔍 SCROLL TO ZOOM</span>
            </div>
          </div>

          {/* Floating Zoom & Camera Reset Buttons */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 18,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <button
              onClick={() => (zoomScaleRef.current = Math.min(2.2, zoomScaleRef.current * 1.15))}
              className="control-pill-btn"
              style={{ padding: '5px 10px', fontSize: 13, fontWeight: 900 }}
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => (zoomScaleRef.current = Math.max(0.65, zoomScaleRef.current * 0.85))}
              className="control-pill-btn"
              style={{ padding: '5px 10px', fontSize: 13, fontWeight: 900 }}
              title="Zoom Out"
            >
              &minus;
            </button>
            <button
              onClick={() => {
                panOffsetRef.current = { x: 0, y: 0 };
                zoomScaleRef.current = 1.0;
              }}
              className="control-pill-btn"
              style={{ padding: '5px 12px', fontSize: 10.5, fontWeight: 700 }}
              title="Reset Spatial Camera"
            >
              ↺ Reset Focus
            </button>
            <button
              onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
              className="control-pill-btn"
              style={{ padding: '5px 12px', fontSize: 10.5, fontWeight: 700, color: '#AC58E9' }}
              title={showTelemetryDrawer ? 'Collapse Telemetry' : 'Expand Telemetry'}
            >
              {showTelemetryDrawer ? '◧ Hide HUD' : '◨ Show HUD'}
            </button>
          </div>

          {/* HTML5 Canvas */}
          <canvas
            ref={spaceCanvasRef}
            width={1280}
            height={720}
            onMouseDown={handleSpaceMouseDown}
            onMouseMove={handleSpaceMouseMove}
            onMouseUp={handleSpaceMouseUp}
            onWheel={handleSpaceWheel}
            style={{
              width: '100%',
              height: isFullscreen ? '100%' : '600px',
              display: 'block',
              background: '#030804'
            }}
          />

          {/* Bottom Space Mesh Legend Strip */}
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: 16,
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              background: 'rgba(6, 16, 8,  0.88)',
              padding: '8px 16px',
              borderRadius: 12,
              border: '1px solid rgba(172, 88, 233,  0.35)',
              backdropFilter: 'blur(16px)',
              zIndex: 20
            }}
          >
            {Object.entries(categoryColor).map(([cat, theme]) => (
              <div
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 10,
                  color: selectedCategory === 'ALL' || selectedCategory === cat ? '#F1F5F9' : '#64748B',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.border, boxShadow: `0 0 8px ${theme.border}` }} />
                <span>{theme.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Agent Telemetry HUD Side Panel */}
        {showTelemetryDrawer && (
          <div
            className="t2o-card stagger-card"
            style={{
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              background: 'linear-gradient(180deg, rgba(8, 22, 10,  0.92) 0%, rgba(4, 12, 6,  0.98) 100%)',
              border: '1px solid rgba(172, 88, 233,  0.35)',
              borderRadius: isFullscreen ? 0 : '20px',
              backdropFilter: 'blur(24px)',
              overflowY: 'auto'
            }}
          >
            {selectedNode ? (
              <>
                {/* Node Identity Header */}
                <div style={{ borderBottom: '1px solid rgba(172, 88, 233,  0.25)', paddingBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '10px',
                        background: getCategoryTheme(selectedNode.category).fill,
                        border: `1px solid ${getCategoryTheme(selectedNode.category).border}`,
                        color: getCategoryTheme(selectedNode.category).border
                      }}
                    >
                      {selectedNode.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '10px',
                        background: 'rgba(172, 88, 233, 0.2)',
                        border: '1px solid #AC58E9',
                        color: '#FFFFFF'
                      }}
                    >
                      {selectedNode.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', marginTop: 10, letterSpacing: -0.3 }}>
                    {selectedNode.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                    SYSTEM ID: {selectedNode.id}
                  </div>
                </div>

                {/* Micro-Telemetry Key Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="exec-level-box" style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 800, letterSpacing: 0.5 }}>IPC LATENCY</div>
                    <div style={{ fontSize: 19, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: '#AC58E9', marginTop: 4 }}>
                      {selectedNode.latency_ms} ms
                    </div>
                    <div style={{ fontSize: 8.5, color: '#AC58E9', marginTop: 2, fontWeight: 700 }}>&bull; SUB-MILLISECOND IPC</div>
                  </div>

                  <div className="exec-level-box" style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 800, letterSpacing: 0.5 }}>PACKET PIPELINE</div>
                    <div style={{ fontSize: 19, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: '#FFFFFF', marginTop: 4 }}>
                      {selectedNode.messages_processed.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 8.5, color: '#c084fc', marginTop: 2, fontWeight: 700 }}>&bull; 24/7 DEDICATED STREAM</div>
                  </div>
                </div>

                {/* Interactive Action: Synaptic Burst Injection */}
                <button
                  onClick={handleTriggerNodeBurst}
                  className="shimmer-sweep"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(172, 88, 233,  0.5)',
                    background: 'linear-gradient(135deg, rgba(172, 88, 233,  0.25) 0%, rgba(172, 88, 233,  0.2) 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: 11,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 0 20px rgba(172, 88, 233,  0.3)'
                  }}
                >
                  <span>⚡ EMIT SYNAPTIC BURST</span>
                </button>

                {/* Role Description */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(172, 88, 233,  0.2)'
                  }}
                >
                  <div style={{ fontSize: 9, color: '#AC58E9', fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
                    AGENT RESPONSIBILITY &amp; MISSION
                  </div>
                  <div style={{ fontSize: 11, color: '#CBD5E1', lineHeight: 1.5 }}>
                    {selectedNode.role_description}
                  </div>
                </div>

                {/* Ingestion & Outbound Feeds */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 9.5, color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                      Ingesting Streams ({connected.upstream.length})
                    </div>
                    {connected.upstream.length === 0 ? (
                      <div style={{ fontSize: 10.5, color: '#64748B', fontStyle: 'italic' }}>Primary Root Ingestion Point</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {connected.upstream.map(edge => (
                          <div
                            key={edge.source}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'rgba(172, 88, 233,  0.08)',
                              border: '1px solid rgba(172, 88, 233,  0.25)',
                              fontSize: 10.5
                            }}
                          >
                            <span style={{ color: '#E2E8F0', fontWeight: 700 }}>{edge.source}</span>
                            <span style={{ color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
                              {edge.packet_rate_per_sec} p/s
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: 9.5, color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                      Outbound Consumers ({connected.downstream.length})
                    </div>
                    {connected.downstream.length === 0 ? (
                      <div style={{ fontSize: 10.5, color: '#64748B', fontStyle: 'italic' }}>Terminal Execution Point</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {connected.downstream.map(edge => (
                          <div
                            key={edge.target}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'rgba(172, 88, 233,  0.08)',
                              border: '1px solid rgba(172, 88, 233,  0.25)',
                              fontSize: 10.5
                            }}
                          >
                            <span style={{ color: '#E2E8F0', fontWeight: 700 }}>{edge.target}</span>
                            <span style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
                              {edge.packet_rate_per_sec} p/s
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                Select an agent node on the space map to inspect telemetry.
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: 3D QUANT TACTICAL RECONNAISSANCE & INTER-AGENT SIGNAL MATRIX
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 18,
          alignItems: 'stretch'
        }}
      >
        {/* Component 1: 3D Quant Tactical Liquidity Radar (Transferred to Obsidian Page) */}
        <QuantTacticalRadar3D currentPrice={currentPrice} />

        {/* Component 2: Inter-Agent Harmonic Oscilloscope & Synapse Waveform */}
        <div
          className="t2o-card stagger-card"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(8, 22, 10,  0.9) 0%, rgba(4, 12, 6,  0.95) 100%)',
            border: '1px solid rgba(172, 88, 233,  0.35)',
            borderRadius: isFullscreen ? 0 : '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="hud-corner-bracket hud-corner-tl" />
          <div className="hud-corner-bracket hud-corner-tr" />
          <div className="hud-corner-bracket hud-corner-bl" />
          <div className="hud-corner-bracket hud-corner-br" />

          {/* Section Header & Telemetry Probe Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15 }}>〰️</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#FFFFFF', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    INTER-AGENT HARMONIC OSCILLOSCOPE
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      background: 'rgba(172, 88, 233,  0.18)',
                      color: '#AC58E9',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      border: '1px solid rgba(172, 88, 233,  0.4)'
                    }}
                  >
                    CURSOR MODULATED
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  Carrier wave velocity, IPC queue telemetry, and phase synchrony
                </div>
              </div>
            </div>

            {/* Live Wave Probe Readout Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(6, 16, 8,  0.9)',
                border: '1px solid rgba(172, 88, 233,  0.4)',
                borderRadius: '12px',
                padding: '5px 14px',
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              <div>
                <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>PROBE: </span>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#AC58E9' }}>{waveProbe.freq}</span>
              </div>
              <div style={{ width: 1, height: 14, background: 'rgba(255, 255, 255, 0.1)' }} />
              <div>
                <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>AMP: </span>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#FFFFFF' }}>{waveProbe.amplitude}</span>
              </div>
              <div style={{ width: 1, height: 14, background: 'rgba(255, 255, 255, 0.1)' }} />
              <div>
                <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>PHASE: </span>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#AC58E9' }}>{waveProbe.phase}</span>
              </div>
            </div>
          </div>

          {/* Waveform Canvas View */}
          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(172, 88, 233,  0.25)', flex: 1, minHeight: '220px' }}>
            <canvas
              ref={waveCanvasRef}
              width={1240}
              height={220}
              onMouseMove={handleWaveMouseMove}
              onMouseLeave={handleWaveMouseLeave}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '220px',
                display: 'block',
                background: '#080314',
                cursor: 'crosshair'
              }}
            />

            {/* Floating Wave Stream Legend Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(5, 14, 6,  0.8)',
                padding: '4px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: 9.5,
                fontWeight: 700
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#AC58E9' }}>
                <span style={{ width: 8, height: 2, background: '#AC58E9', display: 'inline-block' }} />
                <span>CARRIER INGESTION</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#FFFFFF' }}>
                <span style={{ width: 8, height: 2, background: '#FFFFFF', display: 'inline-block' }} />
                <span>NEURAL CONSENSUS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#AC58E9' }}>
                <span style={{ width: 8, height: 2, background: '#AC58E9', display: 'inline-block' }} />
                <span>SOR DISPATCH GATE</span>
              </div>
            </div>
          </div>

          {/* Oscilloscope Tactical Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#94A3B8' }}>
              <span className="pulse-dot" style={{ color: '#AC58E9', width: 6, height: 6 }} />
              <span>CARRIER SYNC: <strong style={{ color: '#AC58E9' }}>ACTIVE (0.08ms JITTER)</strong></span>
            </div>
            <button
              onClick={() => {
                setIsWaveSurging(true);
                setTimeout(() => setIsWaveSurging(false), 1400);
              }}
              className="control-pill-btn"
              style={{
                padding: '6px 14px',
                fontSize: 10.5,
                fontWeight: 800,
                color: isWaveSurging ? '#AC58E9' : '#FFFFFF',
                borderColor: isWaveSurging ? 'rgba(172, 88, 233,  0.6)' : 'rgba(172, 88, 233,  0.4)'
              }}
            >
              <span>{isWaveSurging ? '⚡ WAVE SURGING...' : '⚡ EMIT HARMONIC SURGE'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
};
