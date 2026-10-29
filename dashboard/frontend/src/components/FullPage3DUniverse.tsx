import React, { useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

// 3D Point for true perspective projection
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 3D Floating Geodesic Wireframe Polyhedron (Reference 1)
interface WireframePolyhedron3D {
  center: Point3D;
  size: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  color: string;
  glowColor: string;
}

// 3D Floating Glass Cube (Reference 1)
interface GlassCube3D {
  center: Point3D;
  size: number;
  rotX: number;
  rotY: number;
  speedX: number;
  speedY: number;
  color: string;
  coreColor: string;
}

// 3D Warp Star
interface WarpStar3D {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  alpha: number;
}

export const FullPage3DUniverse: React.FC<Props> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Retina / High-DPI crystal clarity scale
    const setupDPR = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setupDPR();

    // Mouse and scroll parallax state (instant responsive)
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let scrollY = window.scrollY;
    let targetScrollY = scrollY;

    const handleResize = () => {
      setupDPR();
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 1. Initialize 3D Warp Stars (Deep field spanning whole page)
    const starCount = 260;
    const stars: WarpStar3D[] = [];
    const starColors = ['#ffffff', '#c084fc', '#c084fc', '#e879f9', '#a78bfa', '#AC58E9'];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 3200,
        y: (Math.random() - 0.5) * 2600,
        z: Math.random() * 2200 + 100,
        size: Math.random() * 2.2 + 0.8,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    // 2. Initialize 3D Floating Geodesic Wireframe Spheres (Reference 1 NEURA FLOW)
    const polyhedrons: WireframePolyhedron3D[] = [
      {
        center: { x: -width * 0.38, y: -height * 0.15, z: 650 },
        size: 95,
        rotX: 0.2,
        rotY: 0.4,
        rotZ: 0.1,
        speedX: 0.007,
        speedY: 0.009,
        speedZ: 0.004,
        color: 'rgba(172, 88, 233, 0.75)',
        glowColor: '#AC58E9'
      },
      {
        center: { x: width * 0.42, y: -height * 0.22, z: 580 },
        size: 110,
        rotX: 0.5,
        rotY: 0.2,
        rotZ: 0.3,
        speedX: -0.006,
        speedY: 0.008,
        speedZ: 0.005,
        color: 'rgba(172, 88, 233, 0.75)',
        glowColor: '#AC58E9'
      },
      {
        center: { x: -width * 0.36, y: height * 0.35, z: 700 },
        size: 85,
        rotX: 0.3,
        rotY: 0.6,
        rotZ: 0.2,
        speedX: 0.008,
        speedY: -0.007,
        speedZ: 0.003,
        color: 'rgba(172, 88, 233, 0.75)',
        glowColor: '#AC58E9'
      },
      {
        center: { x: width * 0.38, y: height * 0.38, z: 620 },
        size: 100,
        rotX: 0.1,
        rotY: 0.5,
        rotZ: 0.4,
        speedX: -0.007,
        speedY: 0.006,
        speedZ: -0.004,
        color: 'rgba(172, 88, 233, 0.75)',
        glowColor: '#AC58E9'
      }
    ];

    // Unit Icosahedron Vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseIcoVertices: Point3D[] = [
      { x: -1, y: phi, z: 0 }, { x: 1, y: phi, z: 0 }, { x: -1, y: -phi, z: 0 }, { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi }, { x: 0, y: 1, z: phi }, { x: 0, y: -1, z: -phi }, { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 }, { x: phi, y: 0, z: 1 }, { x: -phi, y: 0, z: -1 }, { x: -phi, y: 0, z: 1 }
    ];
    // Normalize vertices to unit sphere
    const icoVertices = baseIcoVertices.map(v => {
      const len = Math.hypot(v.x, v.y, v.z);
      return { x: v.x / len, y: v.y / len, z: v.z / len };
    });

    // 3. Initialize 3D Floating Glass Cubes (Reference 1)
    const glassCubes: GlassCube3D[] = [
      {
        center: { x: -width * 0.28, y: 0, z: 520 },
        size: 55,
        rotX: 0.4,
        rotY: 0.5,
        speedX: 0.01,
        speedY: 0.012,
        color: 'rgba(172, 88, 233, 0.8)',
        coreColor: '#AC58E9'
      },
      {
        center: { x: width * 0.32, y: height * 0.12, z: 490 },
        size: 60,
        rotX: 0.3,
        rotY: 0.7,
        speedX: -0.009,
        speedY: 0.011,
        color: 'rgba(172, 88, 233, 0.8)',
        coreColor: '#AC58E9'
      }
    ];

    // Unit Cube Vertices
    const cubeVertices: Point3D[] = [
      { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 },  { x: 1, y: -1, z: 1 },  { x: 1, y: 1, z: 1 },  { x: -1, y: 1, z: 1 }
    ];
    const cubeEdges = [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [7,4],
      [0,4], [1,5], [2,6], [3,7]
    ];

    // 4. 3D Rotation helper
    const rotate3D = (p: Point3D, rx: number, ry: number, rz: number): Point3D => {
      // Rotate around X
      let y1 = p.y * Math.cos(rx) - p.z * Math.sin(rx);
      let z1 = p.y * Math.sin(rx) + p.z * Math.cos(rx);
      // Rotate around Y
      let x2 = p.x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -p.x * Math.sin(ry) + z1 * Math.cos(ry);
      // Rotate around Z
      let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
      return { x: x3, y: y3, z: z2 };
    };

    // Camera focal length
    const fov = 750;
    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth mouse and scroll easing
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      scrollY += (targetScrollY - scrollY) * 0.08;

      const camX = (mouseX - width / 2) * 0.15;
      const camY = (mouseY - height / 2) * 0.15 - scrollY * 0.18;

      ctx.clearRect(0, 0, width, height);

      // --- 1. Full-Page Cosmic Ambient Nebula Glows ---
      const cosmicGlowTop = ctx.createRadialGradient(
        width * 0.5 + camX * 0.5, height * 0.35 + camY * 0.5, 30,
        width * 0.5 + camX * 0.5, height * 0.35 + camY * 0.5, width * 0.7
      );
      cosmicGlowTop.addColorStop(0, 'rgba(139, 92, 246, 0.28)');
      cosmicGlowTop.addColorStop(0.4, 'rgba(172, 88, 233, 0.12)');
      cosmicGlowTop.addColorStop(0.7, 'rgba(172, 88, 233, 0.05)');
      cosmicGlowTop.addColorStop(1, 'rgba(5, 7, 22, 0)');
      ctx.fillStyle = cosmicGlowTop;
      ctx.fillRect(0, 0, width, height);

      // --- 2. 3D Warp Stars Projection (Spanning full page) ---
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // Move stars forward in 3D
        s.z -= 1.8 + (Math.abs(scrollY - targetScrollY) * 0.08);
        if (s.z <= 20) {
          s.z = 2200;
          s.x = (Math.random() - 0.5) * 3200;
          s.y = (Math.random() - 0.5) * 2600;
        }

        const scale = fov / (fov + s.z);
        const px = width / 2 + (s.x - camX) * scale;
        const py = height / 2 + (s.y - camY) * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.6, s.size * scale * 1.8), 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.min(1.0, s.alpha * (1 - s.z / 2200) * 1.5);
          ctx.shadowBlur = s.size * scale * 4;
          ctx.shadowColor = s.color;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;



      // --- 4. Render 3D Floating Geodesic Wireframe Polyhedrons (Reference 1) ---
      for (let pIdx = 0; pIdx < polyhedrons.length; pIdx++) {
        const poly = polyhedrons[pIdx];
        poly.rotX += poly.speedX;
        poly.rotY += poly.speedY;
        poly.rotZ += poly.speedZ;

        // Subtle vertical hovering
        const hoverY = poly.center.y + Math.sin(time * 1.5 + pIdx * 1.5) * 18;

        const projVerts: { x: number; y: number; z: number }[] = [];
        for (let v = 0; v < icoVertices.length; v++) {
          const raw = icoVertices[v];
          const scaled = { x: raw.x * poly.size, y: raw.y * poly.size, z: raw.z * poly.size };
          const rot = rotate3D(scaled, poly.rotX, poly.rotY, poly.rotZ);
          const world = {
            x: poly.center.x + rot.x - camX * 0.8,
            y: hoverY + rot.y - camY * 0.8,
            z: poly.center.z + rot.z
          };
          const scale = fov / (fov + world.z);
          projVerts.push({
            x: width / 2 + world.x * scale,
            y: height / 2 + world.y * scale,
            z: world.z
          });
        }

        // Draw edges connecting close vertices on the icosahedron
        ctx.save();
        ctx.strokeStyle = poly.color;
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 14;
        ctx.shadowColor = poly.glowColor;

        for (let i = 0; i < projVerts.length; i++) {
          for (let j = i + 1; j < projVerts.length; j++) {
            const dx = icoVertices[i].x - icoVertices[j].x;
            const dy = icoVertices[i].y - icoVertices[j].y;
            const dz = icoVertices[i].z - icoVertices[j].z;
            const dist3D = Math.hypot(dx, dy, dz);
            // Icosahedron edge length threshold is approx 1.05
            if (dist3D < 1.15) {
              ctx.beginPath();
              ctx.moveTo(projVerts[i].x, projVerts[i].y);
              ctx.lineTo(projVerts[j].x, projVerts[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw glowing vertex nodes
        for (let i = 0; i < projVerts.length; i++) {
          ctx.beginPath();
          ctx.arc(projVerts[i].x, projVerts[i].y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
        ctx.restore();
      }

      // --- 5. Render 3D Floating Glass Cubes (Reference 1) ---
      for (let cIdx = 0; cIdx < glassCubes.length; cIdx++) {
        const cube = glassCubes[cIdx];
        cube.rotX += cube.speedX;
        cube.rotY += cube.speedY;

        const hoverY = cube.center.y + Math.cos(time * 1.6 + cIdx * 2.0) * 16;
        const projCubeVerts: { x: number; y: number }[] = [];

        for (let v = 0; v < cubeVertices.length; v++) {
          const raw = cubeVertices[v];
          const scaled = { x: raw.x * cube.size, y: raw.y * cube.size, z: raw.z * cube.size };
          const rot = rotate3D(scaled, cube.rotX, cube.rotY, 0);
          const world = {
            x: cube.center.x + rot.x - camX * 0.8,
            y: hoverY + rot.y - camY * 0.8,
            z: cube.center.z + rot.z
          };
          const scale = fov / (fov + world.z);
          projCubeVerts.push({
            x: width / 2 + world.x * scale,
            y: height / 2 + world.y * scale
          });
        }

        // Draw cube wireframe
        ctx.save();
        ctx.strokeStyle = cube.color;
        ctx.lineWidth = 1.6;
        ctx.shadowBlur = 18;
        ctx.shadowColor = cube.coreColor;

        for (let e = 0; e < cubeEdges.length; e++) {
          const [i, j] = cubeEdges[e];
          ctx.beginPath();
          ctx.moveTo(projCubeVerts[i].x, projCubeVerts[i].y);
          ctx.lineTo(projCubeVerts[j].x, projCubeVerts[j].y);
          ctx.stroke();
        }

        // Glowing center microchip core
        const coreScale = fov / (fov + cube.center.z);
        const coreX = width / 2 + (cube.center.x - camX * 0.8) * coreScale;
        const coreY = height / 2 + (hoverY - camY * 0.8) * coreScale;
        ctx.beginPath();
        ctx.arc(coreX, coreY, 6 * coreScale, 0, Math.PI * 2);
        ctx.fillStyle = cube.coreColor;
        ctx.shadowBlur = 20;
        ctx.shadowColor = cube.coreColor;
        ctx.fill();
        ctx.restore();
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className={`full-page-3d-universe-root ${className || ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};
