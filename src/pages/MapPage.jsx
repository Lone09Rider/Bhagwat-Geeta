import { useState } from "react";
import { CHAPTERS } from "../data/slokas";

const COLORS = ["#E8871A","#0D7377","#6B21A8","#15803D","#B5640A","#1D4ED8"];

export default function MapPage() {
  const [hovered, setHovered] = useState(null);
  const W = 900, H = 380, padX = 60, padY = 50;
  const cols = 6;
  const cellW = (W - padX * 2) / (cols - 1);
  const cellH = (H - padY * 2) / 2;

  const positions = CHAPTERS.map((ch, i) => ({
    x: padX + (i % cols) * cellW,
    y: padY + Math.floor(i / cols) * cellH,
    ...ch,
  }));

  return (
    <div className="page">
      <h2 className="section-title">Chapter Visual Map</h2>
      <p className="section-sub">Interactive overview of all 18 chapters and their themes</p>

      <div className="card" style={{ padding: "1rem", overflowX: "auto", marginBottom: "2rem" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: "600px", display: "block" }}>
          {[0, 6, 12].map(start =>
            [0, 1, 2, 3, 4].map(i => {
              const a = positions[start + i], b = positions[start + i + 1];
              if (!a || !b) return null;
              return <line key={`h-${start}-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#E8E2F5" strokeWidth="1.5" />;
            })
          )}
          {[0, 1, 2, 3, 4, 5].map(col =>
            [0, 1].map(row => {
              const a = positions[col + row * 6], b = positions[col + (row + 1) * 6];
              if (!a || !b) return null;
              return <line key={`v-${col}-${row}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#E8E2F5" strokeWidth="1.5" />;
            })
          )}

          {positions.map((ch, i) => {
            const color = COLORS[Math.floor(i / 3) % COLORS.length];
            const isHov = hovered === ch.num;
            return (
              <g key={ch.num} onMouseEnter={() => setHovered(ch.num)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                <circle cx={ch.x} cy={ch.y} r={isHov ? 22 : 16} fill={isHov ? color : color + "22"} stroke={color} strokeWidth={isHov ? 2 : 1.5} style={{ transition: "all 0.2s" }} />
                <text x={ch.x} y={ch.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={isHov ? 11 : 10} fontWeight="700" fill={isHov ? "#fff" : color}>{ch.num}</text>
                {isHov && (
                  <>
                    <rect x={ch.x - 95} y={ch.y + 28} width={190} height={56} rx="6" fill="white" stroke="#E8E2F5" strokeWidth="1" />
                    <text x={ch.x} y={ch.y + 46} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1A1035">{ch.name}</text>
                    <text x={ch.x} y={ch.y + 60} textAnchor="middle" fontSize="8.5" fill="#6B6585">{ch.slokas} slokas</text>
                    <text x={ch.x} y={ch.y + 74} textAnchor="middle" fontSize="8" fill="#6B6585" fontStyle="italic">{ch.dev}</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>Hover over a chapter node to see details</p>
      </div>

      <h3 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", color: "var(--pk-aqua)", marginBottom: "1rem", letterSpacing: "0.04em" }}>All 18 Chapters</h3>
      <div className="grid-3">
        {CHAPTERS.map((ch, i) => {
          const color = COLORS[Math.floor(i / 3) % COLORS.length];
          return (
            <div key={ch.num} className="card" style={{ borderLeft: `3px solid ${color}` }}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.6rem", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color, lineHeight: 1, flexShrink: 0 }}>{ch.num}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color, marginBottom: "0.15rem", letterSpacing: "0.02em" }}>{ch.name}</p>
                  <p className="devanagari" style={{ fontSize: "0.78rem", color: "rgba(212,245,238,0.55)", marginBottom: "0.35rem" }}>{ch.dev}</p>
                  <p style={{ fontSize: "0.8rem", color: "rgba(212,245,238,0.75)", lineHeight: 1.6 }}>{ch.desc}</p>
                  <span style={{ fontSize: "0.75rem", color, marginTop: "0.3rem", display: "block", fontWeight: 600 }}>{ch.slokas} slokas</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
