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

      {/* Floating button */}
      <button
        onClick={() => toggleOpen(!open)}
        onMouseEnter={handleMouseEnterChat}
        onMouseLeave={handleMouseLeaveChat}
        title="Krishna Sakha"
        style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem",
          zIndex: 9998,
          width: 56, height: 56, borderRadius: "50%",
          border: "2px solid rgba(212,175,55,0.6)",
          padding: 0, overflow: "hidden", cursor: "pointer",
          boxShadow: open
            ? "0 0 0 4px rgba(212,175,55,0.2), 0 8px 32px rgba(0,0,0,0.6)"
            : "0 0 20px rgba(212,175,55,0.4), 0 4px 20px rgba(0,0,0,0.5)",
          transition: "box-shadow 0.3s, transform 0.2s",
          transform: open ? "scale(0.95)" : "scale(1)",
          background: "#000",
        }}
      >
        <img src="/krishna-icon.png" alt="Krishna" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
      </button>

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
          border: "1px solid rgba(212,175,55,0.22)",
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
            borderBottom: "1px solid rgba(212,175,55,0.15)",
            display: "flex", alignItems: "center", gap: "0.6rem",
            flexShrink: 0,
          }}>
            <img src="/krishna-icon.png" style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid rgba(212,175,55,0.5)", objectFit:"cover" }}/>
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
                  <img src="/krishna-icon.png" style={{ width:22, height:22, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.35)", objectFit:"cover", flexShrink:0 }}/>
                )}
                <div style={{
                  maxWidth:"80%",
                  padding:"0.5rem 0.75rem",
                  borderRadius: msg.from==="u" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  background: msg.from==="u"
                    ? "linear-gradient(135deg,rgba(0,195,137,0.18),rgba(0,165,181,0.1))"
                    : "linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.05))",
                  border: msg.from==="u" ? "1px solid rgba(0,195,137,0.28)" : "1px solid rgba(212,175,55,0.18)",
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
                <img src="/krishna-icon.png" style={{ width:22,height:22,borderRadius:"50%",border:"1px solid rgba(212,175,55,0.35)",objectFit:"cover" }}/>
                <div style={{ padding:"0.5rem 0.75rem", borderRadius:"14px 14px 14px 3px", background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.15)", display:"flex", gap:3, alignItems:"center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:5,height:5,borderRadius:"50%",background:"#D4AF37",animation:`dot 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
                </div>
              </div>
            )}

            {/* Gender buttons */}
            {phase === P_GENDER && (
              <div className="kw-msg" style={{ display:"flex", gap:"0.5rem", paddingLeft:"1.8rem" }}>
                {[["sakha","⚡ Sakha"],["sakhi","🌸 Sakhi"]].map(([val,label]) => (
                  <button key={val} onClick={() => handleGenderSelect(val)} style={{
                    padding:"0.4rem 0.9rem", background:"rgba(212,175,55,0.1)", border:"1px solid rgba(212,175,55,0.35)",
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
            <div style={{ padding:"0.65rem 0.85rem", borderTop:"1px solid rgba(212,175,55,0.12)", background:"rgba(0,0,0,0.3)", display:"flex", gap:"0.5rem", flexShrink:0 }}>
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
