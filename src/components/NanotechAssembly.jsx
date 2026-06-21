import { useEffect, useRef, useState } from "react";

export default function NanotechAssembly({ onDone }) {
  const canvasRef = useRef();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;

    // ── Build hex grid ──
    const SIZE = 32;
    const cells = [];
    const cols = Math.ceil(W / (SIZE * 1.5)) + 3;
    const rows = Math.ceil(H / (SIZE * Math.sqrt(3))) + 3;
    let maxDist = 0;

    for (let col = -1; col < cols; col++) {
      for (let row = -1; row < rows; row++) {
        const hx = col * SIZE * 1.5;
        const hy = row * SIZE * Math.sqrt(3) + (col % 2 === 0 ? 0 : SIZE * Math.sqrt(3) / 2);
        const dist = Math.hypot(hx - cx, hy - cy);
        if (dist > maxDist) maxDist = dist;
        cells.push({ hx, hy, dist });
      }
    }

    function hexPath(hx, hy, s) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const x = hx + s * Math.cos(a);
        const y = hy + s * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    // ── Timing ──
    const ASSEMBLE  = 2400; // ms for wave to cover screen
    const HOLD      = 400;
    const DISSOLVE  = 600;
    const SCANLINE  = 300;
    const TOTAL     = ASSEMBLE + HOLD + DISSOLVE + SCANLINE;

    let startTime = null;
    let raf;

    function draw(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010a0e";
      ctx.fillRect(0, 0, W, H);

      const assembleP = Math.min(elapsed / ASSEMBLE, 1);
      const holdDone  = elapsed > ASSEMBLE + HOLD;
      const dissolveP = holdDone ? Math.min((elapsed - ASSEMBLE - HOLD) / DISSOLVE, 1) : 0;

      // ── Draw hex cells (nanotech armor plates) ──
      cells.forEach(({ hx, hy, dist }) => {
        const revealAt = (dist / maxDist); // 0..1
        const localP   = Math.max(0, (assembleP - revealAt * 0.85) / 0.18);
        if (localP <= 0) return;

        const flash  = Math.max(0, 1 - localP * 2);       // bright flash on arrival
        const locked = Math.min(localP * 0.6, 0.55);      // dark metallic fill
        const edge   = Math.min(localP * 1.5, 1);         // edge glow

        // Dissolve: cells near center dissolve first
        let dissolveAlpha = 1;
        if (dissolveP > 0) {
          const dReveal = 1 - (dist / maxDist);           // center dissolves first
          dissolveAlpha = 1 - Math.max(0, (dissolveP - dReveal * 0.7) / 0.3);
        }
        if (dissolveAlpha <= 0) return;

        ctx.globalAlpha = dissolveAlpha;

        // Dark metallic fill
        hexPath(hx, hy, SIZE - 1);
        ctx.fillStyle = `rgba(2,18,28,${locked + flash * 0.4})`;
        ctx.fill();

        // Inner metallic sheen
        if (localP > 0.5) {
          hexPath(hx, hy, SIZE * 0.7);
          const sheen = ctx.createRadialGradient(hx - SIZE * 0.2, hy - SIZE * 0.2, 0, hx, hy, SIZE * 0.7);
          sheen.addColorStop(0, `rgba(0,195,137,${0.06 + flash * 0.1})`);
          sheen.addColorStop(1, "transparent");
          ctx.fillStyle = sheen;
          ctx.fill();
        }

        // Leading edge glow — bright teal on first arrival
        hexPath(hx, hy, SIZE - 0.5);
        ctx.strokeStyle = flash > 0.1
          ? `rgba(0,229,204,${Math.min(edge, 0.9) + flash * 0.5})`
          : `rgba(0,195,137,${edge * 0.35})`;
        ctx.lineWidth = flash > 0.2 ? 2 : 0.8;
        ctx.stroke();

        // Gold accent on some cells (every 7th)
        if ((Math.round(hx / 10) + Math.round(hy / 10)) % 7 === 0 && localP > 0.8) {
          hexPath(hx, hy, SIZE * 0.25);
          ctx.strokeStyle = `rgba(212,175,55,${(localP - 0.8) * 2 * dissolveAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;

      // ── Arc reactor — center pulse ──
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 0.008);
      if (dissolveP < 0.9) {
        for (let r = 3; r >= 0; r--) {
          const radius = [8, 18, 32, 55][r];
          const alpha  = [0.9, 0.5, 0.3, 0.12][r];
          const color  = r === 0 ? "#ffffff" : r === 1 ? "#00E5CC" : r === 2 ? "#00C389" : "#3DD6C8";
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * (1 + pulse * 0.15));
          grad.addColorStop(0, color + (r === 0 ? "ff" : "aa"));
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius * (1 + pulse * 0.15), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = Math.max(0, 1 - dissolveP * 1.5);
        }
        ctx.globalAlpha = 1;

        // Arc reactor hex shape
        hexPath(cx, cy, 10);
        ctx.strokeStyle = `rgba(0,229,204,${0.8 + pulse * 0.2})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Scan lines after full assembly ──
      if (assembleP >= 1 && dissolveP < 0.5) {
        const scanAlpha = Math.min(1, (elapsed - ASSEMBLE) / SCANLINE) * (1 - dissolveP * 2);
        for (let y = 0; y < H; y += 4) {
          ctx.fillStyle = `rgba(0,195,137,${0.015 * scanAlpha})`;
          ctx.fillRect(0, y, W, 1);
        }
        // Moving scan beam
        const scanY = ((elapsed - ASSEMBLE) / (HOLD + DISSOLVE)) * H;
        const sg = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        sg.addColorStop(0, "transparent");
        sg.addColorStop(0.5, `rgba(0,229,204,${0.18 * scanAlpha})`);
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg;
        ctx.fillRect(0, scanY - 20, W, 40);
      }

      if (elapsed < TOTAL) {
        raf = requestAnimationFrame(draw);
      } else {
        setOpacity(0);
        setTimeout(onDone, 650);
      }
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "#010a0e",
      opacity, transition: "opacity 0.65s ease",
      pointerEvents: opacity === 0 ? "none" : "all",
    }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
