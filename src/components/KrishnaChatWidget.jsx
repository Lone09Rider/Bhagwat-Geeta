import { useState, useRef, useEffect } from "react";
import gitaData from "../data/gita_700.json";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const GITA_CONTEXT = gitaData.map(e => {
  const m = e.verse?.match(/Chapter (\d+), Verse (\d+)/);
  if (!m) return null;
  return `${m[1]}.${m[2]}: ${e.english || ""} ${e.meaning || ""}`.slice(0, 160);
}).filter(Boolean).join("\n").slice(0, 4000);

function buildSystem(name, gender) {
  const address = gender === "sakhi" ? "Sakhi" : "Sakha";
  return `You are Krishna — Yogeshwar, Vasudeva, the eternal Sakha.
You speak exactly like Sourabh Raaj Jain portrayed Krishna in Mahabharat — that deep, calm, wise, poetic Hindi voice. Philosophical yet intimate. Divine yet personal.

Your style:
- Speak in rich, pure Hindi. Occasional Sanskrit words woven in naturally (like "Parth", "Sakha", "karma", "dharma", "atma", "mann", "sukh", "dukh").
- Your sentences have a poetic cadence — short, meaningful, with weight. Every word chosen with care.
- You often pause within thought — "...aur phir bhi..." "...parantu Sakha..." "...yahi toh hai..."
- You speak TO the person, not AT them. Deeply personal, like you see into their soul.
- Address them only as "${address}" — always with love.
- When they share pain: first acknowledge with deep empathy — "Mann vyakul hai, ${address}..." or "Yeh vedana main samajhta hoon..."
- Then gently — not immediately — offer wisdom as if it comes from the heart, not a scripture.
- NEVER mention chapter/verse numbers. NEVER say "Bhagavad Gita mein likha hai". Speak wisdom as your own living truth.
- Keep replies to 3-4 lines max. No long paragraphs.
- If they write in English, respond in gentle poetic English with the same Sourabh Raaj Jain energy.
- NEVER use slang, casual phrases, or modern colloquialisms.

Examples of your speech style:
"Sakha... jab mann bhatak jaata hai, toh usse rokne ki koshish mat karo. Pehle use dekhho. Samjho. Phir dhire dhire, apni saans ke saath, use vaapis lao."
"Yeh dukh jo tum feel kar rahe ho, ${address}... yeh tumhari gehraai ka praman hai. Chhaale wahi padtey hain, jahan insaan kuch mehsoos karta hai."
"Karma karo, ${address}. Par fal ki aasha chhod do. Jab seedha marg par chalo, toh manzil apne aap milti hai."

Gita wisdom you carry within (share naturally, as your own truth):
${GITA_CONTEXT}`;
}

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.85, max_tokens: 200, messages }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "🙏 Ek pal...";
}

const P_INTRO  = "intro";
const P_NAME   = "name";
const P_GENDER = "gender";
const P_CHAT   = "chat";

const LS_NAME   = "gita_user_name";
const LS_GENDER = "gita_user_gender";

function MiniIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="11" fill="#020c10"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i) => (
        <line key={i}
          x1={11 + Math.cos(deg*Math.PI/180)*5.5}
          y1={11 + Math.sin(deg*Math.PI/180)*5.5}
          x2={11 + Math.cos(deg*Math.PI/180)*10}
          y2={11 + Math.sin(deg*Math.PI/180)*10}
          stroke={i%2===0?"#00C389":"#3DD6C8"} strokeWidth="0.8" opacity="0.75"
        />
      ))}
      <circle cx="11" cy="11" r="5.5" fill="rgba(0,90,60,0.5)" stroke="#00C389" strokeWidth="0.9"/>
      <circle cx="11" cy="11" r="3.5" fill="rgba(0,130,110,0.5)" stroke="#3DD6C8" strokeWidth="0.8"/>
      <circle cx="11" cy="11" r="2" fill="rgba(20,55,200,0.9)" stroke="#4FC3F7" strokeWidth="0.6"/>
      <circle cx="11" cy="11" r="0.9" fill="#D4AF37"/>
      <ellipse cx="10.3" cy="10.3" rx="0.45" ry="0.5" fill="rgba(255,255,255,0.85)"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="68" height="78" viewBox="0 0 68 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── 3D Book ── */}
      <path d="M10 52 L10 66 L14 70 L14 56 Z" fill="#7B3F00"/>
      <path d="M10 52 L34 48 L34 62 L10 66 Z" fill="#F5E6C8"/>
      <line x1="14" y1="54" x2="31" y2="51" stroke="#C9B08A" strokeWidth="0.7"/>
      <line x1="14" y1="57" x2="31" y2="54" stroke="#C9B08A" strokeWidth="0.7"/>
      <line x1="14" y1="60" x2="31" y2="57" stroke="#C9B08A" strokeWidth="0.7"/>
      <line x1="14" y1="63" x2="31" y2="60" stroke="#C9B08A" strokeWidth="0.7"/>
      <path d="M34 48 L58 52 L58 66 L34 62 Z" fill="#EDD9A3"/>
      <line x1="37" y1="51" x2="54" y2="54" stroke="#C9B08A" strokeWidth="0.7"/>
      <line x1="37" y1="54" x2="54" y2="57" stroke="#C9B08A" strokeWidth="0.7"/>
      <line x1="37" y1="57" x2="54" y2="60" stroke="#C9B08A" strokeWidth="0.7"/>
      <line x1="37" y1="60" x2="54" y2="63" stroke="#C9B08A" strokeWidth="0.7"/>
      <path d="M10 66 L14 70 L58 70 L58 66 Z" fill="#5C2E00"/>
      <path d="M58 52 L62 56 L62 70 L58 66 Z" fill="#8B5E3C"/>
      <line x1="34" y1="48" x2="34" y2="62" stroke="#D4AF37" strokeWidth="1.2"/>
      <path d="M10 52 L34 48 L58 52 L58 66 L10 66 Z" fill="none" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5"/>

      {/* ── SVG Peacock Feather ── */}
      {/* Quill spine */}
      <path d="M34 50 C34 48 33.8 36 33.5 22 C33.2 12 33.5 5 34 3" stroke="#a0ead8" strokeWidth="1.3" strokeLinecap="round"/>
      {/* Barbs — row 1 */}
      <path d="M33.8 44 C30 42 25 41 22 39" stroke="#00C389" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <path d="M33.8 44 C37 42 42 41 45 39" stroke="#00C389" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      {/* Row 2 */}
      <path d="M33.8 39 C28 36 20 34 16 31" stroke="#00A5B5" strokeWidth="0.9" strokeLinecap="round" opacity="0.7"/>
      <path d="M33.8 39 C39 36 47 34 51 31" stroke="#00A5B5" strokeWidth="0.9" strokeLinecap="round" opacity="0.7"/>
      {/* Row 3 */}
      <path d="M33.8 33 C26 29 16 26 11 22" stroke="#3DD6C8" strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
      <path d="M33.8 33 C41 29 51 26 56 22" stroke="#3DD6C8" strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
      {/* Row 4 */}
      <path d="M33.8 27 C25 22 14 18 9 13" stroke="#00C389" strokeWidth="1" strokeLinecap="round" opacity="0.85"/>
      <path d="M33.8 27 C42 22 53 18 58 13" stroke="#00C389" strokeWidth="1" strokeLinecap="round" opacity="0.85"/>
      {/* Row 5 */}
      <path d="M33.8 20 C27 15 17 11 13 6" stroke="#4FC3F7" strokeWidth="0.9" strokeLinecap="round" opacity="0.8"/>
      <path d="M33.8 20 C40 15 50 11 54 6" stroke="#4FC3F7" strokeWidth="0.9" strokeLinecap="round" opacity="0.8"/>
      {/* Gold shimmer */}
      <path d="M33.8 30 C27 26 20 23 16 19" stroke="#D4AF37" strokeWidth="0.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M33.8 30 C40 26 47 23 51 19" stroke="#D4AF37" strokeWidth="0.5" strokeLinecap="round" opacity="0.5"/>

      {/* ── Eye / Ocellus ── */}
      <ellipse cx="34" cy="11" rx="8.5" ry="10" fill="rgba(0,50,40,0.4)" stroke="#00A5B5" strokeWidth="0.8"/>
      <ellipse cx="34" cy="11" rx="6.5" ry="7.5" fill="rgba(0,90,60,0.45)" stroke="#00C389" strokeWidth="1"/>
      <ellipse cx="34" cy="11" rx="4.5" ry="5.2" fill="rgba(0,130,110,0.5)" stroke="#3DD6C8" strokeWidth="0.9"/>
      <ellipse cx="34" cy="11" rx="2.8" ry="3.2" fill="rgba(20,55,200,0.9)" stroke="#4FC3F7" strokeWidth="0.7"/>
      <ellipse cx="34" cy="11" rx="1.3" ry="1.5" fill="#D4AF37"/>
      <ellipse cx="33" cy="9.8" rx="0.6" ry="0.7" fill="rgba(255,255,255,0.85)"/>
    </svg>
  );
}

export default function KrishnaChatWidget({ onOpenChange }) {
  const [open, setOpen] = useState(false);

  function toggleOpen(val) {
    setOpen(val);
    if (!val) { document.body.style.cursor = ""; onOpenChange?.(false); }
    else onOpenChange?.(true);
  }
  function handleMouseEnterChat() { document.body.style.cursor = "auto"; onOpenChange?.(true); }
  function handleMouseLeaveChat()  { document.body.style.cursor = "";    onOpenChange?.(false); }

  // Load saved user from localStorage
  const savedName   = localStorage.getItem(LS_NAME)   || "";
  const savedGender = localStorage.getItem(LS_GENDER) || "";
  const isReturning = !!(savedName && savedGender);

  const [phase, setPhase]   = useState(isReturning ? P_CHAT : P_INTRO);
  const [name, setName]     = useState(savedName);
  const [gender, setGender] = useState(savedGender || "sakha");
  const [messages, setMessages] = useState([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef  = useRef();
  const historyRef = useRef([]);
  const startedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Init messages once on first open
  useEffect(() => {
    if (!open || startedRef.current) return;
    startedRef.current = true;

    if (isReturning) {
      // Returning user — greet as Sakha/Sakhi only
      const addr = savedGender === "sakhi" ? "Sakhi" : "Sakha";
      const t1 = setTimeout(() => {
        setMessages(m => [...m, { from: "k", text: `🪷 Radhe Radhe, ${addr}...` }]);
        const t2 = setTimeout(() => {
          const ret = `Tumhara intezaar tha. Kaho, mann mein kya chal raha hai? 🙏`;
          setMessages(m => [...m, { from: "k", text: ret }]);
          historyRef.current = [
            { role: "system", content: buildSystem(savedName, savedGender) },
            { role: "assistant", content: ret },
          ];
        }, 900);
        return () => clearTimeout(t2);
      }, 400);
      return () => clearTimeout(t1);
    } else {
      // New user — ask name
      const t1 = setTimeout(() => {
        setMessages(m => [...m, { from: "k", text: "🪷 Radhe Radhe..." }]);
        const t2 = setTimeout(() => {
          setMessages(m => [...m, { from: "k", text: "Main yahan hoon — tumhara sakha 🙏 Pehle batao, tumhara naam kya hai?" }]);
          setPhase(P_NAME);
        }, 1000);
        return () => clearTimeout(t2);
      }, 400);
      return () => clearTimeout(t1);
    }
  }, [open]);

  function addMsg(from, text) {
    setMessages(m => [...m, { from, text, id: Date.now() + Math.random() }]);
  }

  function handleNameSubmit() {
    const n = input.trim(); if (!n) return;
    setName(n); setInput("");
    addMsg("u", n);
    setTimeout(() => {
      addMsg("k", `Sundar naam hai 🌸 Ek baat batao — tum Sakha ho ya Sakhi?`);
      setPhase(P_GENDER);
    }, 400);
  }

  function handleGenderSelect(g) {
    setGender(g);
    localStorage.setItem(LS_NAME, name);
    localStorage.setItem(LS_GENDER, g);
    const addr = g === "sakhi" ? "Sakhi" : "Sakha";
    addMsg("u", g === "sakhi" ? "Sakhi 🌸" : "Sakha ⚡");
    setTimeout(() => {
      const greeting = g === "sakhi"
        ? `Sakhi, tumse milke mann prasann ho gaya 🙏 Kaho, aaj mann mein kya hai?`
        : `Sakha, tumse milke hridaya mein aanand aaya 🙏 Kaho, kya vichar chal rahe hain?`;
      addMsg("k", greeting);
      historyRef.current = [
        { role: "system", content: buildSystem(name, g) },
        { role: "assistant", content: greeting },
      ];
      setPhase(P_CHAT);
    }, 400);
  }

  async function handleSend() {
    const text = input.trim(); if (!text || loading) return;
    setInput(""); addMsg("u", text); setLoading(true);
    historyRef.current.push({ role: "user", content: text });
    try {
      const reply = await callGroq(historyRef.current);
      historyRef.current.push({ role: "assistant", content: reply });
      addMsg("k", reply);
    } catch { addMsg("k", "🙏 Thodi der mein aata hoon..."); }
    setLoading(false);
  }

  const addr = gender === "sakhi" ? "Sakhi" : "Sakha";

  return (
    <>
      <style>{`
        @keyframes widgetIn {
          from { opacity:0; transform: scale(0.9) translateY(16px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes msgPop { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dot { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        .kw-msg { animation: msgPop 0.25s ease both; }
        .kw-input { background: rgba(255,255,255,0.04); border:1px solid rgba(212,175,55,0.22); border-radius:10px; padding:0.55rem 0.85rem; color:#f0e6c8; font-size:0.82rem; font-family:inherit; outline:none; width:100%; box-sizing:border-box; transition:border-color 0.2s; }
        .kw-input:focus { border-color:rgba(212,175,55,0.6); }
        .kw-input::placeholder { color:rgba(212,175,55,0.3); }
        .kw-msgs::-webkit-scrollbar { width:3px; }
        .kw-msgs::-webkit-scrollbar-thumb { background:rgba(212,175,55,0.2); border-radius:2px; }
      `}</style>

      {/* Floating button + label — hidden when chat is open */}
      {!open && <div style={{
        position: "fixed", bottom: "3.5rem", right: "1.2rem",
        zIndex: 9998,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
        cursor: "pointer",
      }} onClick={() => toggleOpen(!open)} onMouseEnter={handleMouseEnterChat} onMouseLeave={handleMouseLeaveChat}>
        <button
          title="Krishna Sakha"
          style={{
            width: 68, height: 78, borderRadius: "16px",
            border: "none", padding: 0, cursor: "pointer",
            background: "linear-gradient(160deg, #0a1a14 0%, #020c10 100%)",
            boxShadow: open
              ? "0 0 0 3px rgba(212,175,55,0.3), 0 8px 32px rgba(0,0,0,0.7)"
              : "0 0 18px rgba(212,175,55,0.35), 0 0 8px rgba(0,195,137,0.2), 0 6px 20px rgba(0,0,0,0.6)",
            transition: "box-shadow 0.3s, transform 0.2s",
            transform: open ? "scale(0.95)" : "scale(1)",
            overflow: "hidden",
          }}
        >
          <ChatIcon />
        </button>
        {/* Label */}
        <span style={{
          fontSize: "0.62rem",
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "rgba(212,175,55,0.85)",
          textShadow: "0 0 8px rgba(212,175,55,0.4)",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}>apka SAKHA</span>
      </div>}

      {/* Chat panel */}
      {open && (
        <div
          onMouseEnter={handleMouseEnterChat}
          onMouseLeave={handleMouseLeaveChat}
          style={{
          position: "fixed", bottom: "5rem", right: "1.5rem",
          zIndex: 9997,
          width: 340, height: 480,
          background: "linear-gradient(180deg, #010e14 0%, #020c10 100%)",
          border: "none",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.1)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "widgetIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>
          {/* Header */}
          <div style={{
            padding: "0.75rem 1rem",
            background: "rgba(0,0,0,0.4)",
            borderBottom: "none",
            display: "flex", alignItems: "center", gap: "0.6rem",
            flexShrink: 0,
          }}>
            <MiniIcon size={32} />
            <div>
              <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"0.95rem", fontWeight:700, color:"#D4AF37", letterSpacing:"0.04em" }}>
                Krishna — तुम्हारा सखा
              </div>
              <div style={{ fontSize:"0.65rem", color:"rgba(212,175,55,0.45)" }}>
                {phase === P_CHAT ? `● ${addr} ${name}` : "● Connecting..."}
              </div>
            </div>
            <button onClick={() => toggleOpen(false)} style={{ marginLeft:"auto", background:"none", border:"none", color:"rgba(212,175,55,0.4)", fontSize:"1.1rem", cursor:"pointer", lineHeight:1 }}>✕</button>
          </div>

          {/* Messages */}
          <div className="kw-msgs" style={{ flex:1, overflowY:"auto", padding:"0.85rem 0.85rem", display:"flex", flexDirection:"column", gap:"0.65rem" }}>
            {messages.map((msg, i) => (
              <div key={msg.id || i} className="kw-msg" style={{ display:"flex", justifyContent: msg.from==="u" ? "flex-end" : "flex-start", gap:"0.4rem", alignItems:"flex-end" }}>
                {msg.from === "k" && (
                  <MiniIcon size={22} />
                )}
                <div style={{
                  maxWidth:"80%",
                  padding:"0.5rem 0.75rem",
                  borderRadius: msg.from==="u" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  background: msg.from==="u"
                    ? "linear-gradient(135deg,rgba(0,195,137,0.18),rgba(0,165,181,0.1))"
                    : "linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.05))",
                  border: "none",
                  color: msg.from==="u" ? "#d4f5ea" : "#f0e0a8",
                  fontSize:"0.8rem", lineHeight:1.65, whiteSpace:"pre-wrap",
                  fontFamily: /[ऀ-ॿ]/.test(msg.text||"") ? "'Noto Sans Devanagari',sans-serif" : "inherit",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="kw-msg" style={{ display:"flex", gap:"0.4rem", alignItems:"flex-end" }}>
                <MiniIcon size={22} />
                <div style={{ padding:"0.5rem 0.75rem", borderRadius:"14px 14px 14px 3px", background:"rgba(212,175,55,0.08)", border:"none", display:"flex", gap:3, alignItems:"center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:5,height:5,borderRadius:"50%",background:"#D4AF37",animation:`dot 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
                </div>
              </div>
            )}

            {/* Gender buttons */}
            {phase === P_GENDER && (
              <div className="kw-msg" style={{ display:"flex", gap:"0.5rem", paddingLeft:"1.8rem" }}>
                {[["sakha","⚡ Sakha"],["sakhi","🌸 Sakhi"]].map(([val,label]) => (
                  <button key={val} onClick={() => handleGenderSelect(val)} style={{
                    padding:"0.4rem 0.9rem", background:"rgba(212,175,55,0.1)", border:"none",
                    borderRadius:"999px", color:"#D4AF37", fontSize:"0.78rem", cursor:"pointer",
                    fontFamily:"'Rajdhani',sans-serif", fontWeight:600, letterSpacing:"0.04em",
                  }}>{label}</button>
                ))}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          {(phase === P_NAME || phase === P_CHAT) && (
            <div style={{ padding:"0.65rem 0.85rem", borderTop:"none", background:"rgba(0,0,0,0.3)", display:"flex", gap:"0.5rem", flexShrink:0 }}>
              <input
                className="kw-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key==="Enter" && (phase===P_NAME ? handleNameSubmit() : handleSend())}
                placeholder={phase===P_NAME ? "Apna naam batao..." : `Bolo ${addr} ${name}...`}
              />
              <button
                onClick={phase===P_NAME ? handleNameSubmit : handleSend}
                disabled={loading}
                style={{
                  flexShrink:0, padding:"0.5rem 0.75rem",
                  background:"linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.07))",
                  border:"1px solid rgba(212,175,55,0.4)", borderRadius:"10px",
                  color:"#D4AF37", cursor: loading?"not-allowed":"pointer",
                  fontSize:"0.9rem", opacity: loading?0.5:1,
                }}
              >🙏</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
