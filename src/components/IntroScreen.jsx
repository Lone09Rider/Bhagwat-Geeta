import { useState, useEffect } from "react";

export default function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("glow"),  2000);
    const t2 = setTimeout(() => setPhase("lift"),  5500);
    const t3 = setTimeout(() => { setPhase("done"); onDone(); }, 7500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "done") return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: phase === "lift" ? "none" : "all" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@700&family=Cinzel:wght@700&display=swap');

        .intro-curtain {
          position: absolute; inset: 0;
          background: #000 url('/krishna-bg.png') center center / cover no-repeat;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 1.4rem;
          transform: translateY(0);
          transition: transform 2.2s cubic-bezier(0.76, 0, 0.24, 1);
          overflow: hidden;
        }
        .intro-curtain::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.35) 0%,
            rgba(0,0,0,0.15) 40%,
            rgba(0,0,0,0.55) 100%
          );
          z-index: 0;
        }
        .intro-curtain > * { position: relative; z-index: 1; }
        .intro-curtain.lift { transform: translateY(-100%); }

        .intro-om {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: clamp(1.8rem, 4vw, 3rem);
          color: rgba(212,175,55,0.45);
          opacity: 0; transition: opacity 1.6s ease 0.5s;
          user-select: none;
        }
        .intro-om.visible { opacity: 1; }
        .intro-om.glow { animation: omGlow 2.4s ease-in-out infinite alternate; }
        @keyframes omGlow {
          from { color: rgba(212,175,55,0.45); text-shadow: none; }
          to   { color: rgba(245,200,66,0.95); text-shadow: 0 0 50px rgba(245,200,66,0.7), 0 0 100px rgba(212,175,55,0.3); }
        }

        .intro-line {
          width: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #D4AF37, #F5C842, #D4AF37, transparent);
          transition: width 1.6s ease 0.7s;
          box-shadow: 0 0 12px rgba(212,175,55,0.4);
        }
        .intro-line.visible { width: min(60vw, 420px); }

        .intro-text {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: clamp(2.8rem, 9vw, 6rem);
          font-weight: 700;
          letter-spacing: 0.16em;
          background: linear-gradient(135deg,
            #8B6914 0%, #D4AF37 18%, #F5C842 38%,
            #FFE680 52%, #F5C842 66%, #D4AF37 82%, #8B6914 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0; transform: translateY(24px);
          transition: opacity 1.6s ease, transform 1.6s ease;
          text-align: center; user-select: none;
        }
        .intro-text.visible { opacity: 1; transform: translateY(0); }
        .intro-text.glow { animation: radhePulse 1.8s ease-in-out infinite alternate; }
        @keyframes radhePulse {
          from { filter: drop-shadow(0 0 20px rgba(212,175,55,0.55)) drop-shadow(0 0 50px rgba(245,200,66,0.2)); }
          to   { filter: drop-shadow(0 0 45px rgba(245,200,66,1)) drop-shadow(0 0 110px rgba(212,175,55,0.5)); }
        }

        .intro-sub {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.65rem, 1.8vw, 1rem);
          letter-spacing: 0.45em; text-transform: uppercase;
          color: rgba(212,175,55,0);
          transition: color 1.6s ease 1.2s;
          user-select: none;
        }
        .intro-sub.visible { color: rgba(212,175,55,0.45); }

        .intro-edge {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, #00C389, #3DD6C8, #00C389, transparent);
          box-shadow: 0 0 28px rgba(0,195,137,0.85), 0 0 70px rgba(61,214,200,0.4);
          opacity: 0; transition: opacity 0.6s ease;
        }
        .intro-edge.lift { opacity: 1; }

        @keyframes particleFly {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          15%  { opacity: 0.7; }
          85%  { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-110vh) scale(1.3); }
        }
      `}</style>

      <div className={`intro-curtain${phase === "lift" ? " lift" : ""}`}>

        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%",
            background: "radial-gradient(circle, #F5C842, #D4AF37)",
            width: `${1.5 + Math.random() * 3.5}px`,
            height: `${1.5 + Math.random() * 3.5}px`,
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 30}%`,
            pointerEvents: "none",
            animation: `particleFly ${10 + Math.random() * 8}s ease-in-out ${Math.random() * 5}s infinite`,
          }} />
        ))}

        <div className={`intro-om${phase !== "enter" ? " visible" : ""}${phase === "glow" || phase === "lift" ? " glow" : ""}`}>ॐ</div>
        <div className={`intro-line${phase !== "enter" ? " visible" : ""}`} />
        <div className={`intro-text${phase !== "enter" ? " visible" : ""}${phase === "glow" || phase === "lift" ? " glow" : ""}`}>राधे राधे ।।</div>
        <div className={`intro-line${phase !== "enter" ? " visible" : ""}`} />
        <div className={`intro-sub${phase !== "enter" ? " visible" : ""}`}>Bhagavad Gita</div>

        <div className={`intro-edge${phase === "lift" ? " lift" : ""}`} />
      </div>
    </div>
  );
}
