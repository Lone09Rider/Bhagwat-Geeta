import { useState, useEffect, useRef } from "react";
import gitaData from "../data/gita_700.json";
import { findBestSlokas } from "../services/krishnaAI";

const TOTAL = gitaData.length;

// ── Groq healing call ─────────────────────────────────────────────────────────
async function getHealingResponse(feeling, entry) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const m = entry.verse.match(/Chapter (\d+), Verse (\d+)/);
  const ch = m ? +m[1] : "?", v = m ? +m[2] : "?";

  if (!apiKey) return fallbackHealing(feeling, entry, ch, v);

  const system = `You are Lord Krishna speaking directly to a devotee who is emotionally struggling.
Your tone is warm, healing, compassionate — like a loving guide, not a preacher.
Given the devotee's feeling and a Gita verse, return ONLY this JSON (no other text):
{
  "healing": "2-3 sentences of direct emotional healing in English — address their exact feeling, give comfort and a practical shift in perspective using the verse's wisdom.",
  "hindi_healing": "2-3 वाक्य हिंदी में — उनकी भावना को सीधे सम्बोधित करो, प्रेमपूर्ण और गहरे शब्दों में।",
  "krishna_line": "One powerful, poetic line as Krishna speaking directly to this person about their pain. End with '— Krishna'"
}`;

  const user = `Devotee feels: "${feeling}"

Gita verse — Chapter ${ch}, Verse ${v}:
Sanskrit: ${entry.sanskrit || ""}
English: ${entry.english || ""}
Meaning: ${entry.meaning || ""}
Life application: ${entry.life_application || ""}
Krishna's message: ${entry.krishna_message || ""}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.88,
        max_tokens: 400,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });
    const data = await res.json();
    const text = data.choices[0].message.content.trim();
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    return { ch, v, healing: json.healing, hindi: json.hindi_healing, krishna: json.krishna_line };
  } catch {
    return fallbackHealing(feeling, entry, ch, v);
  }
}

function fallbackHealing(feeling, entry, ch, v) {
  return {
    ch, v,
    healing: entry.english || "",
    hindi: entry.hindi || "",
    krishna: (entry.krishna_message || entry.life_application || "") + " — Krishna",
  };
}

function parseVerse(entry) {
  const match = entry.verse.match(/Chapter (\d+), Verse (\d+)/);
  return {
    ch: match ? parseInt(match[1]) : 0,
    v: match ? parseInt(match[2]) : 0,
    sanskrit: entry.sanskrit || "",
    hindi: entry.hindi || "",
    english: entry.english || "",
    meaning: entry.meaning || "",
    life: entry.life_application || "",
    krishna: entry.krishna_message || "",
  };
}

export default function BookPage() {
  const savedIdx = parseInt(localStorage.getItem("gita_book_idx") || "0", 10);
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [idx, setIdx] = useState(savedIdx);
  const [flip, setFlip] = useState(null); // "next" | "prev"
  const [displayIdx, setDisplayIdx] = useState(savedIdx);
  const pageRef = useRef();

  // Krishna chat
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { from: "krishna", text: "🪷 Ask me anything, dear one. Tell me what you feel, and I will show you the light of the Gita." }
  ]);
  const [searchPool, setSearchPool] = useState([]); // ranked verse indices for current query
  const [poolPos, setPoolPos] = useState(0);        // which rank we're showing
  const chatEndRef = useRef();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const verse = parseVerse(gitaData[displayIdx]);

  function openBook() {
    setOpening(true);
    setTimeout(() => { setOpen(true); setOpening(false); }, 700);
  }

  function closeBook() {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 700);
  }

  function goNext() {
    if (idx >= TOTAL - 1 || flip) return;
    setFlip("next");
    setTimeout(() => {
      const ni = idx + 1;
      setIdx(ni); setDisplayIdx(ni);
      localStorage.setItem("gita_book_idx", ni);
      setFlip(null);
    }, 400);
  }

  function goPrev() {
    if (idx <= 0 || flip) return;
    setFlip("prev");
    setTimeout(() => {
      const ni = idx - 1;
      setIdx(ni); setDisplayIdx(ni);
      localStorage.setItem("gita_book_idx", ni);
      setFlip(null);
    }, 400);
  }

  function jumpToVerse(verseIdx) {
    setFlip("next");
    setTimeout(() => {
      setIdx(verseIdx);
      setDisplayIdx(verseIdx);
      localStorage.setItem("gita_book_idx", verseIdx);
      setFlip(null);
    }, 400);
  }

  const [chatLoading, setChatLoading] = useState(false);
  const lastFeelingRef = useRef("");

  async function handleChatSend() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");

    const isNext = /^next$/i.test(text);

    if (isNext && searchPool.length > 0) {
      const nextPos = poolPos + 1;
      if (nextPos >= searchPool.length) {
        setChatMessages(m => [...m,
          { from: "user", text },
          { from: "krishna", text: "🙏 I have shared all relevant teachings for this feeling. Sit quietly and let them heal you, dear one." }
        ]);
        return;
      }
      setPoolPos(nextPos);
      setChatMessages(m => [...m, { from: "user", text }, { from: "krishna", text: "🪷 Seeking another healing verse for you…", loading: true }]);
      setChatLoading(true);
      const picked = searchPool[nextPos];
      const resp = await getHealingResponse(lastFeelingRef.current, picked.entry);
      jumpToVerse(gitaData.indexOf(picked.entry));
      setChatMessages(m => [
        ...m.filter(x => !x.loading),
        { from: "krishna", healing: resp, verse: `${resp.ch}.${resp.v}` }
      ]);
      setChatLoading(false);
      return;
    }

    // New feeling
    lastFeelingRef.current = text;
    setChatMessages(m => [...m, { from: "user", text }, { from: "krishna", text: "🪷 Let me search the Gita for your healing…", loading: true }]);
    setChatLoading(true);

    const candidates = findBestSlokas(text);
    if (!candidates.length) {
      setChatMessages(m => [...m.filter(x => !x.loading), { from: "krishna", text: "🙏 Dear one, could you share more about what you feel? I am here." }]);
      setChatLoading(false);
      return;
    }

    setSearchPool(candidates);
    setPoolPos(0);
    const picked = candidates[0];
    const entryIdx = gitaData.indexOf(picked.entry);
    const resp = await getHealingResponse(text, picked.entry);
    jumpToVerse(entryIdx);
    setChatMessages(m => [
      ...m.filter(x => !x.loading),
      { from: "krishna", healing: resp, verse: `${resp.ch}.${resp.v}` }
    ]);
    setChatLoading(false);
  }

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") closeBook();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, idx, flip]);

  return (
    <div className="book-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600&family=Inter:wght@400;500;600&display=swap');

        .book-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0d0618 60%, #000 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem 3rem;
          position: relative;
          overflow: hidden;
        }

        /* Starfield */
        .book-page-wrapper::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 15%, rgba(255,220,100,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 20%, rgba(255,220,100,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 10%, rgba(255,220,100,0.7) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 20% 75%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 85%, rgba(255,200,80,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 35%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 80%, rgba(255,220,100,0.6) 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        .book-section-title {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          color: #f5c842;
          text-shadow: 0 0 30px rgba(245,200,66,0.7), 0 0 60px rgba(245,200,66,0.3);
          margin-bottom: 0.25rem;
          letter-spacing: 0.12em;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .book-section-sub {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 0.95rem;
          color: rgba(245,200,66,0.6);
          text-align: center;
          margin-bottom: 2.5rem;
          position: relative;
          z-index: 1;
        }

        /* ── CLOSED BOOK ── */
        .closed-book-scene {
          perspective: 1200px;
          position: relative;
          z-index: 2;
          cursor: pointer;
        }

        .closed-book {
          width: 220px;
          height: 300px;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateY(-25deg) rotateX(8deg);
          transition: transform 0.4s ease;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.7));
        }

        .closed-book-scene:hover .closed-book {
          transform: rotateY(-15deg) rotateX(5deg) translateY(-8px);
          filter: drop-shadow(0 40px 80px rgba(245,200,66,0.4));
        }

        .closed-book-scene.opening .closed-book {
          animation: bookOpenAnim 0.7s ease-in-out forwards;
        }

        @keyframes bookOpenAnim {
          0%   { transform: rotateY(-25deg) rotateX(8deg); }
          50%  { transform: rotateY(0deg) rotateX(0deg) scale(1.05); }
          100% { transform: rotateY(0deg) rotateX(0deg) scale(0) translateZ(-200px); opacity: 0; }
        }

        .book-cover {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #8B6914 0%, #D4AF37 20%, #F5C842 40%, #D4AF37 55%, #B8860B 70%, #8B6914 85%, #6B4F0A 100%);
          border-radius: 4px 12px 12px 4px;
          box-shadow:
            inset -3px 0 8px rgba(0,0,0,0.4),
            inset 3px 0 6px rgba(255,255,255,0.15),
            4px 0 0 #5a3d08,
            8px 0 0 #4a3206,
            12px 0 0 #3a2604;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          overflow: hidden;
        }

        .book-cover::before {
          content: '';
          position: absolute;
          inset: 8px;
          border: 1.5px solid rgba(255,220,80,0.5);
          border-radius: 2px 8px 8px 2px;
          pointer-events: none;
        }

        .book-cover::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(105deg, rgba(255,255,255,0.18) 0%, transparent 40%);
          border-radius: inherit;
          pointer-events: none;
        }

        .book-spine {
          position: absolute;
          left: -12px; top: 0;
          width: 12px; height: 100%;
          background: linear-gradient(90deg, #3a2604, #6B4F0A, #8B6914);
          border-radius: 2px 0 0 2px;
          box-shadow: inset -2px 0 4px rgba(0,0,0,0.3);
          transform: rotateY(-90deg) translateX(-6px);
          transform-origin: right;
        }

        .cover-om {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 2.8rem;
          color: #fff8dc;
          text-shadow: 0 0 20px rgba(255,220,80,0.9), 0 0 40px rgba(255,200,50,0.5);
          margin-bottom: 0.5rem;
          animation: omPulse 3s ease-in-out infinite;
        }

        @keyframes omPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(255,220,80,0.9), 0 0 40px rgba(255,200,50,0.5); }
          50% { text-shadow: 0 0 30px rgba(255,220,80,1), 0 0 60px rgba(255,200,50,0.8), 0 0 90px rgba(255,180,30,0.4); }
        }

        .cover-title {
          font-family: 'Cinzel', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a0800;
          text-align: center;
          line-height: 1.4;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 2px rgba(255,220,80,0.4);
          margin-bottom: 0.4rem;
        }

        .cover-dev {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 0.85rem;
          color: #2a1400;
          text-align: center;
          opacity: 0.8;
        }

        .cover-sanskrit-bg {
          position: absolute;
          bottom: 10px;
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 0.55rem;
          color: rgba(255,220,80,0.35);
          text-align: center;
          line-height: 1.6;
          padding: 0 0.5rem;
          animation: shimmer 4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; color: rgba(255,240,120,0.6); }
        }

        .open-btn {
          margin-top: 2rem;
          font-family: 'Cinzel', serif;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #8B6914, #D4AF37, #F5C842, #D4AF37, #8B6914);
          border: none;
          border-radius: 30px;
          color: #1a0800;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(245,200,66,0.5), 0 0 40px rgba(245,200,66,0.2);
          transition: all 0.3s;
          position: relative;
          z-index: 2;
        }

        .open-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(245,200,66,0.7), 0 0 60px rgba(245,200,66,0.3);
        }

        /* ── OPEN BOOK ── */
        .open-book-scene {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 900px;
          animation: bookAppear 0.6s ease-out;
        }

        @keyframes bookAppear {
          from { opacity: 0; transform: scale(0.85) rotateX(15deg); }
          to   { opacity: 1; transform: scale(1) rotateX(0deg); }
        }

        .open-book {
          display: flex;
          background: linear-gradient(180deg, #1a0a2e 0%, #0d0618 100%);
          border-radius: 6px 6px 4px 4px;
          box-shadow:
            0 40px 100px rgba(0,0,0,0.8),
            0 0 0 1px rgba(245,200,66,0.3),
            0 0 60px rgba(245,200,66,0.15);
          min-height: 520px;
          position: relative;
          overflow: hidden;
        }

        /* Book glow border */
        .open-book::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid rgba(245,200,66,0.25);
          pointer-events: none;
          z-index: 10;
        }

        /* Center spine */
        .book-center-spine {
          position: absolute;
          left: 50%;
          top: 0; bottom: 0;
          width: 4px;
          transform: translateX(-50%);
          background: linear-gradient(180deg, #D4AF37, #8B6914, #D4AF37);
          box-shadow: 0 0 12px rgba(245,200,66,0.5);
          z-index: 5;
        }

        /* Pages */
        .book-left-page, .book-right-page {
          flex: 1;
          padding: 2.5rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .book-left-page {
          border-right: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 60% 50%, rgba(245,200,66,0.05) 0%, transparent 70%);
        }

        .book-right-page {
          background: radial-gradient(ellipse at 40% 50%, rgba(245,200,66,0.05) 0%, transparent 70%);
        }

        /* Page flip animation */
        .book-right-page.flip-next {
          animation: flipNext 0.4s ease-in-out;
        }
        .book-right-page.flip-prev {
          animation: flipPrev 0.4s ease-in-out;
        }

        @keyframes flipNext {
          0%   { opacity: 1; transform: rotateY(0deg); }
          50%  { opacity: 0; transform: rotateY(-25deg) translateX(20px); }
          100% { opacity: 1; transform: rotateY(0deg); }
        }

        @keyframes flipPrev {
          0%   { opacity: 1; transform: rotateY(0deg); }
          50%  { opacity: 0; transform: rotateY(25deg) translateX(-20px); }
          100% { opacity: 1; transform: rotateY(0deg); }
        }

        /* Left page: decorative Sanskrit */
        .left-page-om {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 5rem;
          color: rgba(245,200,66,0.15);
          line-height: 1;
          margin-bottom: 1rem;
        }

        .left-page-sanskrit {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 1.05rem;
          line-height: 2;
          text-align: center;
          background: linear-gradient(135deg, #F5C842, #D4AF37, #F5C842, #FFE680, #D4AF37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 8px rgba(245,200,66,0.6));
          white-space: pre-wrap;
          animation: textGlow 3s ease-in-out infinite;
        }

        @keyframes textGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(245,200,66,0.6)); }
          50% { filter: drop-shadow(0 0 16px rgba(245,200,66,0.9)) drop-shadow(0 0 30px rgba(245,200,66,0.4)); }
        }

        .verse-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 1rem;
          background: linear-gradient(135deg, rgba(245,200,66,0.15), rgba(245,200,66,0.05));
          border: 1px solid rgba(245,200,66,0.4);
          border-radius: 999px;
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          color: #D4AF37;
          letter-spacing: 0.08em;
          margin-bottom: 1rem;
        }

        /* Right page content */
        .right-content {
          height: 100%;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(245,200,66,0.3) transparent;
          padding-right: 0.5rem;
        }

        .right-content::-webkit-scrollbar { width: 4px; }
        .right-content::-webkit-scrollbar-track { background: transparent; }
        .right-content::-webkit-scrollbar-thumb { background: rgba(245,200,66,0.3); border-radius: 2px; }

        .content-section {
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(245,200,66,0.1);
        }

        .content-section:last-child { border-bottom: none; margin-bottom: 0; }

        .content-label {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          color: #D4AF37;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }

        .content-hindi {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 0.95rem;
          line-height: 1.8;
          color: #f0e6c8;
          font-weight: 600;
        }

        .content-english {
          font-size: 0.9rem;
          line-height: 1.75;
          color: #e0d5b8;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        .content-meaning {
          font-size: 0.85rem;
          line-height: 1.7;
          color: rgba(224,213,184,0.75);
          font-family: 'Inter', sans-serif;
        }

        .krishna-msg {
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, rgba(245,200,66,0.1), rgba(245,200,66,0.05));
          border-left: 3px solid #D4AF37;
          border-radius: 0 6px 6px 0;
          font-size: 0.88rem;
          font-style: italic;
          color: #F5C842;
          line-height: 1.65;
          font-family: 'Cinzel', serif;
        }

        /* Navigation */
        .book-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
          width: 100%;
          max-width: 900px;
          position: relative;
          z-index: 2;
        }

        .book-nav-btn {
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          padding: 0.65rem 1.5rem;
          background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05));
          border: 1px solid rgba(212,175,55,0.5);
          border-radius: 6px;
          color: #D4AF37;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .book-nav-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(245,200,66,0.25), rgba(245,200,66,0.1));
          box-shadow: 0 4px 20px rgba(245,200,66,0.3);
          transform: translateY(-1px);
        }

        .book-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .book-counter {
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          color: rgba(212,175,55,0.6);
          letter-spacing: 0.1em;
        }

        .close-btn {
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          padding: 0.5rem 1.25rem;
          background: rgba(255,80,80,0.1);
          border: 1px solid rgba(255,100,100,0.4);
          border-radius: 6px;
          color: #ff9090;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          z-index: 2;
          margin-top: 1rem;
        }

        .close-btn:hover {
          background: rgba(255,80,80,0.2);
          box-shadow: 0 4px 15px rgba(255,80,80,0.3);
        }

        /* Corner ornaments */
        .corner {
          position: absolute;
          width: 20px; height: 20px;
          border-color: rgba(245,200,66,0.3);
          border-style: solid;
          pointer-events: none;
        }
        .corner-tl { top: 8px; left: 8px; border-width: 1.5px 0 0 1.5px; }
        .corner-tr { top: 8px; right: 8px; border-width: 1.5px 1.5px 0 0; }
        .corner-bl { bottom: 8px; left: 8px; border-width: 0 0 1.5px 1.5px; }
        .corner-br { bottom: 8px; right: 8px; border-width: 0 1.5px 1.5px 0; }

        /* ── Krishna Chat ── */
        .krishna-chat-panel {
          width: 100%;
          max-width: 900px;
          margin-top: 1.5rem;
          background: linear-gradient(135deg, rgba(26,10,46,0.95), rgba(13,6,24,0.98));
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          z-index: 2;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1);
        }

        .chat-header {
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04));
          border-bottom: 1px solid rgba(212,175,55,0.2);
          display: flex; align-items: center; gap: 0.6rem;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          color: #D4AF37;
          letter-spacing: 0.08em;
        }

        .chat-messages {
          max-height: 260px;
          overflow-y: auto;
          padding: 1rem 1.25rem;
          display: flex; flex-direction: column; gap: 0.75rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(212,175,55,0.3) transparent;
        }
        .chat-messages::-webkit-scrollbar { width: 3px; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 2px; }

        .chat-bubble-user {
          align-self: flex-end;
          background: rgba(0,195,137,0.15);
          border: 1px solid rgba(0,195,137,0.35);
          border-radius: 12px 12px 2px 12px;
          padding: 0.5rem 0.9rem;
          font-size: 0.83rem;
          color: #d4f5ea;
          max-width: 70%;
          font-family: 'Inter', sans-serif;
        }

        .chat-bubble-krishna {
          align-self: flex-start;
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.22);
          border-radius: 12px 12px 12px 2px;
          padding: 0.6rem 0.9rem;
          font-size: 0.82rem;
          color: #f0e0a0;
          max-width: 85%;
          font-family: 'Inter', sans-serif;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        .chat-verse-tag {
          display: inline-block;
          margin-top: 0.35rem;
          font-family: 'Cinzel', serif;
          font-size: 0.68rem;
          color: #D4AF37;
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 999px;
          padding: 0.15rem 0.6rem;
          letter-spacing: 0.06em;
        }

        .chat-input-row {
          display: flex; gap: 0.6rem;
          padding: 0.75rem 1.25rem;
          border-top: 1px solid rgba(212,175,55,0.15);
          background: rgba(0,0,0,0.2);
        }

        .chat-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 8px;
          padding: 0.55rem 0.9rem;
          color: #f0e6c8;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input:focus { border-color: rgba(212,175,55,0.6); }
        .chat-input::placeholder { color: rgba(212,175,55,0.3); }

        .chat-send-btn {
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          padding: 0.55rem 1.1rem;
          background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08));
          border: 1px solid rgba(212,175,55,0.45);
          border-radius: 8px;
          color: #D4AF37;
          cursor: pointer;
          letter-spacing: 0.06em;
          transition: all 0.2s;
        }
        .chat-send-btn:hover {
          background: linear-gradient(135deg, rgba(245,200,66,0.3), rgba(245,200,66,0.12));
          box-shadow: 0 4px 16px rgba(245,200,66,0.25);
        }

        @media (max-width: 700px) {
          .open-book { flex-direction: column; }
          .book-center-spine { display: none; }
          .book-left-page { padding: 1.5rem 1rem; min-height: unset; }
          .book-right-page { padding: 1.5rem 1rem; }
          .left-page-sanskrit { font-size: 0.9rem; }
          .book-section-title { font-size: 1.4rem; }
        }
      `}</style>

      <h1 className="book-section-title">📖 The Sacred Book</h1>
      <p className="book-section-sub">भगवद्गीता — सम्पूर्ण ७०० श्लोक</p>

      {!open && (
        <div className={`closed-book-scene${opening ? " opening" : ""}`} onClick={openBook}>
          <div className="closed-book">
            <div className="book-spine" />
            <div className="book-cover">
              <div className="cover-om">ॐ</div>
              <div className="cover-title">BHAGAVAD<br />GITA</div>
              <div className="cover-dev">श्रीमद्भगवद्गीता</div>
              <div className="cover-sanskrit-bg">
                {"कर्मण्येवाधिकारस्ते\nमा फलेषु कदाचन\nमा कर्मफलहेतुर्भूः\nमा ते सङ्गोऽस्त्वकर्मणि"}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button className="open-btn">✦ Open the Sacred Book ✦</button>
          </div>
        </div>
      )}

      {open && (
        <>
          <div className="open-book-scene">
            <div className="open-book">
              <div className="book-center-spine" />

              {/* Corner ornaments */}
              <div className="corner corner-tl" />
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              <div className="corner corner-br" />

              {/* LEFT PAGE — Sanskrit */}
              <div className="book-left-page">
                <div className="left-page-om">ॐ</div>
                <div className="verse-badge">
                  ✦ अध्याय {verse.ch} · श्लोक {verse.v} ✦
                </div>
                <div className="left-page-sanskrit">{verse.sanskrit}</div>
              </div>

              {/* RIGHT PAGE — Meanings */}
              <div className={`book-right-page${flip ? ` flip-${flip}` : ""}`}>
                <div className="right-content">
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "#D4AF37", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                      Chapter {verse.ch} · Verse {verse.v}
                    </div>
                    <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: "0.8rem", color: "rgba(212,175,55,0.5)" }}>
                      अध्याय {verse.ch}, श्लोक {verse.v}
                    </div>
                  </div>

                  <div className="content-section">
                    <div className="content-label">🇮🇳 हिंदी अर्थ</div>
                    <p className="content-hindi">{verse.hindi}</p>
                  </div>

                  <div className="content-section">
                    <div className="content-label">🌐 English Translation</div>
                    <p className="content-english">{verse.english}</p>
                  </div>

                  {verse.meaning && (
                    <div className="content-section">
                      <div className="content-label">💡 Understanding</div>
                      <p className="content-meaning">{verse.meaning}</p>
                    </div>
                  )}

                  {verse.life && (
                    <div className="content-section">
                      <div className="content-label">🌱 Life Application</div>
                      <p className="content-meaning">{verse.life}</p>
                    </div>
                  )}

                  {verse.krishna && (
                    <div className="content-section">
                      <div className="content-label">🕉 Krishna's Message</div>
                      <div className="krishna-msg">{verse.krishna}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="book-nav">
              <button className="book-nav-btn" onClick={goPrev} disabled={idx === 0}>
                ← Prev
              </button>
              <span className="book-counter">{idx + 1} / {TOTAL}</span>
              <button className="book-nav-btn" onClick={goNext} disabled={idx === TOTAL - 1}>
                Next →
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
              <button className="close-btn" onClick={closeBook}>✕ Close Book</button>
            </div>
          </div>

          {/* ── Krishna Chat ── */}
          <div className="krishna-chat-panel">
            <div className="chat-header">
              <span style={{ fontSize: "1.1rem" }}>🪈🦚</span> Ask Krishna — type how you feel
            </div>

            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                msg.from === "user"
                  ? <div key={i} className="chat-bubble-user">{msg.text}</div>
                  : <div key={i} className="chat-bubble-krishna">
                      {msg.healing ? (
                        <>
                          <div style={{ marginBottom: "0.5rem", color: "#f0e0a0", lineHeight: 1.7 }}>{msg.healing.healing}</div>
                          {msg.healing.hindi && (
                            <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: "0.8rem", color: "rgba(240,230,200,0.75)", marginBottom: "0.5rem", lineHeight: 1.7 }}>
                              {msg.healing.hindi}
                            </div>
                          )}
                          {msg.healing.krishna && (
                            <div style={{ borderLeft: "2px solid #D4AF37", paddingLeft: "0.6rem", fontStyle: "italic", color: "#F5C842", fontSize: "0.8rem", marginTop: "0.4rem" }}>
                              {msg.healing.krishna}
                            </div>
                          )}
                          <div><span className="chat-verse-tag">✦ {msg.verse} · Type "next" for more</span></div>
                        </>
                      ) : (
                        <>
                          {msg.text}
                          {msg.verse && <div><span className="chat-verse-tag">✦ {msg.verse}</span></div>}
                        </>
                      )}
                    </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder='e.g. "I am scared today" or type "next" for more…'
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleChatSend()}
              />
              <button className="chat-send-btn" onClick={handleChatSend} disabled={chatLoading}>
                {chatLoading ? "…" : "Ask ✦"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
