import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import NanotechBackground from "./components/NanotechBackground";

function PeacockCursor({ x, y }) {
  return (
    <svg
      style={{
        position: "fixed",
        left: x - 30, top: y - 148,
        pointerEvents: "none", zIndex: 9999,
        filter: "drop-shadow(0 0 5px rgba(0,195,137,0.9)) drop-shadow(0 0 12px rgba(61,214,200,0.5))",
      }}
      width="60" height="150" viewBox="0 0 60 150" fill="none"
    >
      <path d="M30 148 C30 148 30 120 30 90 C30 65 30 45 30 32" stroke="#a0ead8" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M30 108 C25 105 20 103 17 100" stroke="#00C389" strokeWidth="0.7" strokeLinecap="round" opacity="0.55"/>
      <path d="M30 108 C35 105 40 103 43 100" stroke="#00C389" strokeWidth="0.7" strokeLinecap="round" opacity="0.55"/>
      <path d="M30 98 C22 94 13 91 9 87"  stroke="#00A5B5" strokeWidth="0.85" strokeLinecap="round" opacity="0.65"/>
      <path d="M30 98 C38 94 47 91 51 87" stroke="#00A5B5" strokeWidth="0.85" strokeLinecap="round" opacity="0.65"/>
      <path d="M30 88 C19 83 8 79 4 73"   stroke="#3DD6C8" strokeWidth="0.9" strokeLinecap="round" opacity="0.75"/>
      <path d="M30 88 C41 83 52 79 56 73" stroke="#3DD6C8" strokeWidth="0.9" strokeLinecap="round" opacity="0.75"/>
      <path d="M30 78 C17 72 5 67 1 60"   stroke="#00C389" strokeWidth="1"   strokeLinecap="round" opacity="0.82"/>
      <path d="M30 78 C43 72 55 67 59 60" stroke="#00C389" strokeWidth="1"   strokeLinecap="round" opacity="0.82"/>
      <path d="M30 68 C16 61 3 55 0 47"   stroke="#4FC3F7" strokeWidth="1.1" strokeLinecap="round" opacity="0.88"/>
      <path d="M30 68 C44 61 57 55 60 47" stroke="#4FC3F7" strokeWidth="1.1" strokeLinecap="round" opacity="0.88"/>
      <path d="M30 58 C15 50 2 43 0 34"   stroke="#7B4FD4" strokeWidth="1.1" strokeLinecap="round" opacity="0.9"/>
      <path d="M30 58 C45 50 58 43 60 34" stroke="#7B4FD4" strokeWidth="1.1" strokeLinecap="round" opacity="0.9"/>
      <path d="M30 46 C18 40 8 33 6 24"   stroke="#3DD6C8" strokeWidth="1"   strokeLinecap="round" opacity="0.85"/>
      <path d="M30 46 C42 40 52 33 54 24" stroke="#3DD6C8" strokeWidth="1"   strokeLinecap="round" opacity="0.85"/>
      <path d="M30 34 C23 29 17 22 16 14" stroke="#00C389" strokeWidth="0.8" strokeLinecap="round" opacity="0.7"/>
      <path d="M30 34 C37 29 43 22 44 14" stroke="#00C389" strokeWidth="0.8" strokeLinecap="round" opacity="0.7"/>
      <path d="M30 68 C21 63 12 58 7 52"  stroke="#D4AF37" strokeWidth="0.45" strokeLinecap="round" opacity="0.45"/>
      <path d="M30 68 C39 63 48 58 53 52" stroke="#D4AF37" strokeWidth="0.45" strokeLinecap="round" opacity="0.45"/>
      <ellipse cx="30" cy="22" rx="14" ry="17" fill="rgba(0,60,50,0.25)" stroke="#00A5B5" strokeWidth="0.8" opacity="0.7"/>
      <ellipse cx="30" cy="22" rx="11" ry="13" fill="rgba(0,100,70,0.3)"  stroke="#00C389" strokeWidth="1"/>
      <ellipse cx="30" cy="22" rx="7.5" ry="9"  fill="rgba(0,140,120,0.35)" stroke="#3DD6C8" strokeWidth="0.9"/>
      <ellipse cx="30" cy="22" rx="4.5" ry="5.5" fill="rgba(20,60,200,0.75)" stroke="#4FC3F7" strokeWidth="0.7"/>
      <ellipse cx="30" cy="22" rx="2"   ry="2.4" fill="#D4AF37"/>
      <ellipse cx="28" cy="20" rx="0.9" ry="1.1" fill="rgba(255,255,255,0.8)"/>
    </svg>
  );
}

function TrailDot({ x, y, opacity }) {
  return (
    <div style={{
      position: "fixed", left: x, top: y,
      width: 5, height: 5, borderRadius: "50%",
      background: "radial-gradient(circle, #3DD6C8, #00C389)",
      boxShadow: "0 0 6px #00C389",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none", zIndex: 9997,
      opacity, transition: "opacity 0.3s",
    }} />
  );
}

// Pulsing glow at the quill tip
function CursorTip({ x, y }) {
  return (
    <>
      <style>{`
        @keyframes tipPulse {
          0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.9; }
          50%      { transform:translate(-50%,-50%) scale(1.7); opacity:0.4; }
        }
        @keyframes tipRing {
          0%   { transform:translate(-50%,-50%) scale(0.6); opacity:0.7; }
          100% { transform:translate(-50%,-50%) scale(2.4); opacity:0; }
        }
      `}</style>
      {/* Expanding ring */}
      <div style={{
        position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9998,
        width: 12, height: 12, borderRadius: "50%",
        border: "1.5px solid #00E5CC",
        animation: "tipRing 1.1s ease-out infinite",
      }} />
      {/* Core dot */}
      <div style={{
        position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9998,
        width: 6, height: 6, borderRadius: "50%",
        background: "#D4AF37",
        boxShadow: "0 0 8px #D4AF37, 0 0 16px rgba(212,175,55,0.6)",
        animation: "tipPulse 1.4s ease-in-out infinite",
      }} />
    </>
  );
}

// Click burst
function ClickBurst({ x, y, id, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes burstRing${id} {
          0%   { transform:translate(-50%,-50%) scale(0); opacity:1; }
          100% { transform:translate(-50%,-50%) scale(1); opacity:0; }
        }
        @keyframes burstSpark${id} {
          0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
          100% { opacity:0; transform:translate(-50%,-50%) scale(0); }
        }
      `}</style>
      {/* 3 expanding rings */}
      {[0,1,2].map(i => (
        <div key={i} style={{
          position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 10000,
          width: `${(i+1)*40}px`, height: `${(i+1)*40}px`, borderRadius: "50%",
          border: `${1.5 - i*0.4}px solid ${i===0?"#00E5CC":i===1?"#00C389":"#D4AF37"}`,
          animation: `burstRing${id} ${0.45 + i*0.1}s cubic-bezier(0.22,1,0.36,1) ${i*0.06}s both`,
        }} />
      ))}
      {/* 8 sparks radiating out */}
      {Array.from({length:8}).map((_,i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 28;
        return (
          <div key={i} style={{
            position: "fixed",
            left: x + Math.cos(angle) * dist,
            top:  y + Math.sin(angle) * dist,
            pointerEvents: "none", zIndex: 10000,
            width: 4, height: 4, borderRadius: "50%",
            background: i % 2 === 0 ? "#00E5CC" : "#D4AF37",
            boxShadow: `0 0 6px ${i%2===0?"#00C389":"#D4AF37"}`,
            animation: `burstSpark${id} 0.5s ease-out ${i*0.03}s both`,
          }} />
        );
      })}
    </>
  );
}

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;
import IntroScreen from "./components/IntroScreen";
import NanotechAssembly from "./components/NanotechAssembly";
import HomePage from "./pages/HomePage";
import ExplorerPage from "./pages/ExplorerPage";
import SearchPage from "./pages/SearchPage";
import MapPage from "./pages/MapPage";
import BookPage from "./pages/BookPage";
import PrivacyPage from "./pages/PrivacyPage";
import KrishnaChatWidget from "./components/KrishnaChatWidget";
import KrishnaDarshan from "./components/KrishnaDarshan";

export default function App() {
  const [tab, setTab] = useState("home");
  const [introVisible, setIntroVisible] = useState(true);
  const [assemblyVisible, setAssemblyVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isTouch] = useState(isTouchDevice);
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [trail, setTrail] = useState([]);
  const [bursts, setBursts] = useState([]);
  const trailRef = useRef([]);

  useEffect(() => {
    const onMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      trailRef.current = [{ x: e.clientX, y: e.clientY, id: Date.now() }, ...trailRef.current.slice(0, 5)];
      setTrail([...trailRef.current]);
    };
    const onClick = (e) => {
      setBursts(b => [...b, { x: e.clientX, y: e.clientY, id: Date.now() }]);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  const pages = {
    home:      <HomePage />,
    explorer:  <ExplorerPage />,
    search:    <SearchPage />,
    map:       <MapPage />,
    book:      <BookPage />,
    privacy:   <PrivacyPage />,
  };

  return (
    <>
      {introVisible && (
        <IntroScreen
          onLiftStart={() => setAssemblyVisible(true)}
          onDone={() => setIntroVisible(false)}
        />
      )}
      {assemblyVisible && <NanotechAssembly onDone={() => setAssemblyVisible(false)} />}
      <NanotechBackground bgActive={!assemblyVisible && !introVisible} />

      {!isTouch && !chatOpen && <PeacockCursor x={cursorPos.x} y={cursorPos.y} />}
      {!isTouch && <CursorTip x={cursorPos.x} y={cursorPos.y} />}
      {!isTouch && trail.map((t, i) => (
        <TrailDot key={t.id} x={t.x} y={t.y} opacity={(1 - i / trail.length) * 0.55} />
      ))}
      {!isTouch && bursts.map(b => (
        <ClickBurst key={b.id} x={b.x} y={b.y} id={b.id}
          onDone={() => setBursts(prev => prev.filter(p => p.id !== b.id))} />
      ))}

      {/* Subtle gradient overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 20% 80%, rgba(123,79,212,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 10%, rgba(0,195,137,0.06) 0%, transparent 50%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        opacity: assemblyVisible ? 0 : 1,
        transform: assemblyVisible ? "translateY(18px)" : "translateY(0)",
        transition: assemblyVisible ? "none" : "opacity 1.2s ease 0.2s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.2s",
      }}>
        <Navbar active={tab} onChange={setTab} />
        {pages[tab]}
        <footer style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 200,
          textAlign: "center",
          padding: "0.5rem 1rem",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
          background: "rgba(2,12,16,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,195,137,0.12)",
          fontSize: "0.75rem",
          color: "rgba(212,245,238,0.3)",
        }}>
          🕉 Madhav Geeta Saar &nbsp;·&nbsp;
          <button onClick={() => setTab("privacy")} style={{
            background: "none", border: "none", color: "#3DD6C8",
            cursor: "pointer", fontSize: "0.78rem", textDecoration: "underline", padding: 0,
          }}>Privacy Policy</button>
          &nbsp;·&nbsp; sr009j@gmail.com
        </footer>
      </div>

      <KrishnaChatWidget onOpenChange={setChatOpen} />
      <KrishnaDarshan />
    </>
  );
}
