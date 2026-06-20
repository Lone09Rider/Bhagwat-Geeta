import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import NanotechBackground from "./components/NanotechBackground";
import IntroScreen from "./components/IntroScreen";
import HomePage from "./pages/HomePage";
import ExplorerPage from "./pages/ExplorerPage";
import SearchPage from "./pages/SearchPage";
import MapPage from "./pages/MapPage";
import BookPage from "./pages/BookPage";
import KrishnaChatWidget from "./components/KrishnaChatWidget";

// Peacock feather SVG cursor — eye at top, quill tip at bottom (real feather shape)
function PeacockCursor({ x, y }) {
  return (
    <svg
      style={{
        position: "fixed",
        // hotspot = quill tip at bottom center of SVG (30, 148)
        left: x - 30,
        top:  y - 148,
        pointerEvents: "none",
        zIndex: 9999,
        filter: "drop-shadow(0 0 5px rgba(0,195,137,0.9)) drop-shadow(0 0 12px rgba(61,214,200,0.5))",
      }}
      width="60" height="150" viewBox="0 0 60 150" fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Quill / rachis — thin spine from tip (bottom) to eye (top) ── */}
      <path d="M30 148 C30 148 30 120 30 90 C30 65 30 45 30 32"
        stroke="#a0ead8" strokeWidth="1.2" strokeLinecap="round"/>

      {/* ── Barbs fanning out — widest near eye, tapering down ──
          Each pair: left barb curves out-and-up, right mirrors it        */}

      {/* Row 1 — near tip, very short */}
      <path d="M30 108 C25 105 20 103 17 100" stroke="#00C389" strokeWidth="0.7" strokeLinecap="round" opacity="0.55"/>
      <path d="M30 108 C35 105 40 103 43 100" stroke="#00C389" strokeWidth="0.7" strokeLinecap="round" opacity="0.55"/>

      {/* Row 2 */}
      <path d="M30 98 C22 94 13 91 9 87"  stroke="#00A5B5" strokeWidth="0.85" strokeLinecap="round" opacity="0.65"/>
      <path d="M30 98 C38 94 47 91 51 87" stroke="#00A5B5" strokeWidth="0.85" strokeLinecap="round" opacity="0.65"/>

      {/* Row 3 */}
      <path d="M30 88 C19 83 8 79 4 73"   stroke="#3DD6C8" strokeWidth="0.9" strokeLinecap="round" opacity="0.75"/>
      <path d="M30 88 C41 83 52 79 56 73" stroke="#3DD6C8" strokeWidth="0.9" strokeLinecap="round" opacity="0.75"/>

      {/* Row 4 */}
      <path d="M30 78 C17 72 5 67 1 60"   stroke="#00C389" strokeWidth="1"   strokeLinecap="round" opacity="0.82"/>
      <path d="M30 78 C43 72 55 67 59 60" stroke="#00C389" strokeWidth="1"   strokeLinecap="round" opacity="0.82"/>

      {/* Row 5 */}
      <path d="M30 68 C16 61 3 55 0 47"   stroke="#4FC3F7" strokeWidth="1.1" strokeLinecap="round" opacity="0.88"/>
      <path d="M30 68 C44 61 57 55 60 47" stroke="#4FC3F7" strokeWidth="1.1" strokeLinecap="round" opacity="0.88"/>

      {/* Row 6 — widest, near eye */}
      <path d="M30 58 C15 50 2 43 0 34"   stroke="#7B4FD4" strokeWidth="1.1" strokeLinecap="round" opacity="0.9"/>
      <path d="M30 58 C45 50 58 43 60 34" stroke="#7B4FD4" strokeWidth="1.1" strokeLinecap="round" opacity="0.9"/>

      {/* Row 7 — upper, framing eye */}
      <path d="M30 46 C18 40 8 33 6 24"   stroke="#3DD6C8" strokeWidth="1"   strokeLinecap="round" opacity="0.85"/>
      <path d="M30 46 C42 40 52 33 54 24" stroke="#3DD6C8" strokeWidth="1"   strokeLinecap="round" opacity="0.85"/>

      {/* Row 8 — top short barbs above eye */}
      <path d="M30 34 C23 29 17 22 16 14" stroke="#00C389" strokeWidth="0.8" strokeLinecap="round" opacity="0.7"/>
      <path d="M30 34 C37 29 43 22 44 14" stroke="#00C389" strokeWidth="0.8" strokeLinecap="round" opacity="0.7"/>

      {/* ── Gold shimmer accent on mid barbs ── */}
      <path d="M30 68 C21 63 12 58 7 52"  stroke="#D4AF37" strokeWidth="0.45" strokeLinecap="round" opacity="0.45"/>
      <path d="M30 68 C39 63 48 58 53 52" stroke="#D4AF37" strokeWidth="0.45" strokeLinecap="round" opacity="0.45"/>

      {/* ── Peacock Eye (ocellus) — centred at (30, 22) ── */}
      {/* Outermost teal halo */}
      <ellipse cx="30" cy="22" rx="14" ry="17" fill="rgba(0,60,50,0.25)" stroke="#00A5B5" strokeWidth="0.8" opacity="0.7"/>
      {/* Outer green ring */}
      <ellipse cx="30" cy="22" rx="11" ry="13" fill="rgba(0,100,70,0.3)"  stroke="#00C389" strokeWidth="1"/>
      {/* Mid teal ring */}
      <ellipse cx="30" cy="22" rx="7.5" ry="9"  fill="rgba(0,140,120,0.35)" stroke="#3DD6C8" strokeWidth="0.9"/>
      {/* Inner cobalt blue */}
      <ellipse cx="30" cy="22" rx="4.5" ry="5.5" fill="rgba(20,60,200,0.75)" stroke="#4FC3F7" strokeWidth="0.7"/>
      {/* Gold pupil */}
      <ellipse cx="30" cy="22" rx="2"   ry="2.4" fill="#D4AF37"/>
      {/* White specular highlight */}
      <ellipse cx="28" cy="20" rx="0.9" ry="1.1" fill="rgba(255,255,255,0.8)"/>
    </svg>
  );
}

// Trailing feather dot (smaller, faded)
function TrailDot({ x, y, opacity }) {
  return (
    <div style={{
      position: "fixed",
      left: x, top: y,
      width: 5, height: 5,
      borderRadius: "50%",
      background: "radial-gradient(circle, #3DD6C8, #00C389)",
      boxShadow: "0 0 6px #00C389",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      zIndex: 9997,
      opacity,
      transition: "opacity 0.3s",
    }} />
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [introVisible, setIntroVisible] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [trail, setTrail] = useState([]);
  const trailRef = useRef([]);
  const rafRef = useRef();
  const posRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Update trail
      trailRef.current = [
        { x: e.clientX, y: e.clientY, id: Date.now() },
        ...trailRef.current.slice(0, 5),
      ];
      setTrail([...trailRef.current]);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const pages = {
    home:      <HomePage />,
    explorer:  <ExplorerPage />,
    search:    <SearchPage />,
    map:       <MapPage />,
    book:      <BookPage />,
  };

  return (
    <>
      {introVisible && <IntroScreen onDone={() => setIntroVisible(false)} />}
      <NanotechBackground />

      {/* Peacock feather cursor — hidden when chat is open */}
      {!chatOpen && <PeacockCursor x={cursorPos.x} y={cursorPos.y} />}

      {/* Trailing glow dots */}
      {trail.map((t, i) => (
        <TrailDot key={t.id} x={t.x} y={t.y} opacity={(1 - i / trail.length) * 0.55} />
      ))}

      {/* Peacock gradient overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 20% 80%, rgba(123,79,212,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 10%, rgba(0,195,137,0.06) 0%, transparent 50%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar active={tab} onChange={setTab} />
        {pages[tab]}
      </div>

      <KrishnaChatWidget onOpenChange={setChatOpen} />
    </>
  );
}
