import { useEffect, useRef, useState } from "react";

const COLORS = [
  "#00C389","#00A5B5","#3DD6C8","#7B4FD4","#00E5CC","#4FC3F7","#A5F3A0",
];

const N = 130;
const SPEED = 0.22;          // base speed — always moving
const ANGLE_DRIFT = 0.006;   // how much each particle's direction drifts per frame
const CONNECT_DIST = 135;

export default function NanotechBackground() {
  const canvasRef = useRef();
  const mouse = useRef({ x: -1000, y: -1000 });
  const particles = useRef([]);
  const rafRef = useRef();
  const peacockImg = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = "/peacock-bg.png";
    img.onload = () => { peacockImg.current = img; };

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Init particles with random angle-driven velocity (no mouse needed)
    particles.current = Array.from({ length: N }, () => {
      const angle = Math.random() * Math.PI * 2;
      return {
        x:      Math.random() * window.innerWidth,
        y:      Math.random() * window.innerHeight,
        angle,                         // direction of travel
        vx:     Math.cos(angle) * SPEED,
        vy:     Math.sin(angle) * SPEED,
        r:      1.5 + Math.random() * 2,
        color:  COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse:  Math.random() * Math.PI * 2,
        drift:  (Math.random() - 0.5) * ANGLE_DRIFT * 2, // personal drift rate
      };
    });

    // Subtle hex grid
    function hexGrid(ctx, w, h) {
      const size = 55;
      const cols = Math.ceil(w / (size * 1.5)) + 2;
      const rows = Math.ceil(h / (size * Math.sqrt(3))) + 2;
      ctx.strokeStyle = "rgba(0,195,137,0.04)";
      ctx.lineWidth = 0.5;
      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          const cx = col * size * 1.5;
          const cy = row * size * Math.sqrt(3) + (col % 2 === 0 ? 0 : (size * Math.sqrt(3)) / 2);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            i === 0
              ? ctx.moveTo(cx + size * Math.cos(a), cy + size * Math.sin(a))
              : ctx.lineTo(cx + size * Math.cos(a), cy + size * Math.sin(a));
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      hexGrid(ctx, W, H);

      // Peacock feather — drawn directly on canvas with screen blend (no box)
      if (peacockImg.current) {
        const t = Date.now() * 0.0005;
        const imgW = peacockImg.current.naturalWidth;
        const imgH = peacockImg.current.naturalHeight;
        const aspect = imgW / imgH;
        const drawH = H;
        const drawW = drawH * aspect;
        const px = W / 2 - drawW / 2;
        const py = 0;
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.28 + Math.sin(t) * 0.03;
        ctx.drawImage(peacockImg.current, px, py, drawW, drawH);
        ctx.restore();
      }

      // Mouse glow (visual only — no particle attraction)
      const mx = mouse.current.x;
      const my = mouse.current.y;
      if (mx > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
        grad.addColorStop(0, "rgba(0,195,137,0.14)");
        grad.addColorStop(0.5, "rgba(0,165,181,0.06)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mx, my, 160, 0, Math.PI * 2);
        ctx.fill();

        // Peacock eye rings at cursor
        ctx.beginPath(); ctx.arc(mx, my, 22, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,195,137,0.45)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(61,214,200,0.35)"; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,229,204,0.65)"; ctx.fill();
      }

      const ps = particles.current;

      // Update all particles autonomously
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.pulse += 0.016;

        // Drift the direction slowly — organic flow
        p.angle += p.drift;
        // Add gentle global wave to angle over time for a flowing field effect
        p.angle += Math.sin(Date.now() * 0.00012 + p.x * 0.003) * 0.002;

        p.vx = Math.cos(p.angle) * SPEED;
        p.vy = Math.sin(p.angle) * SPEED;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges smoothly
        if (p.x < -10)  p.x = W + 10;
        if (p.x > W+10) p.x = -10;
        if (p.y < -10)  p.y = H + 10;
        if (p.y > H+10) p.y = -10;

        // Draw connections to nearby particles
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.45;
            ctx.strokeStyle = `rgba(0,195,137,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles on top
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const radius = p.r + Math.sin(p.pulse) * 0.6;

        // Soft glow halo
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3.5);
        g.addColorStop(0, p.color + "55");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "cc";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    // Mouse only for the glow effect — no particle attraction
    const onMove  = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = ()  => { mouse.current = { x: -1000, y: -1000 }; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}
