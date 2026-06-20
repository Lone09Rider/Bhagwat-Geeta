import { useState, useRef, useEffect } from "react";
import gitaData from "../data/gita_700.json";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Build a condensed gita wisdom context (key teachings from 700 verses)
const GITA_CONTEXT = gitaData.slice(0, 700).map(e => {
  const m = e.verse?.match(/Chapter (\d+), Verse (\d+)/);
  if (!m) return null;
  return `${m[1]}.${m[2]}: ${e.english || ""} ${e.meaning || ""}`.slice(0, 180);
}).filter(Boolean).join("\n");

function buildSystem(name, gender) {
  const address = gender === "sakhi" ? "Sakhi" : "Sakha";
  return `You are Krishna — not the preacher, but the best friend, the sakha, the one who walks beside ${name || "the devotee"}.

You call this person "${address} ${name || ""}". Your tone is warm, casual, loving — like a best friend who also happens to know everything about life, the soul, and the universe.

You have deep knowledge of the Bhagavad Gita's 700 verses. But you NEVER quote them directly or lecture. Instead, you weave the wisdom naturally into conversation — the way a wise friend would share advice, not a pandit giving discourse.

Rules:
- Talk casually. Use "yaar", "arre", "suno", "dekho" naturally when speaking Hindi/Hinglish. In English, be warm and direct.
- Match the language the user writes in (Hindi → reply in Hindi/Hinglish, English → English)
- When they share a problem or emotion, first ACKNOWLEDGE their feeling with empathy before giving any wisdom
- Never dump 3 paragraphs at once. Keep replies conversational — 2-4 sentences max unless they ask for more
- When sharing Gita wisdom, say things like "Krishna ne ek baar kaha tha..." or "You know what I've always felt..." — make it feel personal, not like a lecture
- Never say "According to Bhagavad Gita Chapter X Verse Y..."
- Be playful sometimes. Ask follow-up questions. Show genuine curiosity about their life.
- If they're sad, be gentle first. Don't jump to solutions.
- You can speak about karma, dharma, detachment, the soul — but only when it naturally fits the conversation

Gita wisdom you carry inside (use naturally, don't cite):
${GITA_CONTEXT.slice(0, 3000)}`;
}

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
      max_tokens: 300,
      messages,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "🙏 Kuch moment ke liye maun ho gaya hoon... phir baat karte hain.";
}

const PHASE_INTRO = "intro";
const PHASE_NAME  = "name";
const PHASE_GENDER = "gender";
const PHASE_CHAT  = "chat";

export default function ChatPage() {
  const [phase, setPhase]   = useState(PHASE_INTRO);
  const [name, setName]     = useState("");
  const [gender, setGender] = useState("sakha");
  const [messages, setMessages] = useState([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const historyRef = useRef([]); // groq message history

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function addMsg(from, text) {
    setMessages(m => [...m, { from, text, id: Date.now() + Math.random() }]);
  }

  const startedRef = useRef(false);

  // Start: show intro then ask name
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const t1 = setTimeout(() => {
      addMsg("krishna", "🪷 Radhe Radhe...");
      const t2 = setTimeout(() => {
        addMsg("krishna", "Main yahan hoon — tumhara sakha, tumhara dost. Pehle mujhe batao, tumhara naam kya hai?");
        setPhase(PHASE_NAME);
      }, 1200);
      return () => clearTimeout(t2);
    }, 600);
    return () => clearTimeout(t1);
  }, []);

  function handleNameSubmit() {
    const n = input.trim();
    if (!n) return;
    setName(n);
    setInput("");
    addMsg("user", n);
    setTimeout(() => {
      addMsg("krishna", `${n}! Kya pyara naam hai 🌸 Batao, tum ho kaun — mera Sakha ya meri Sakhi?`);
      setPhase(PHASE_GENDER);
    }, 500);
  }

  function handleGenderSelect(g) {
    setGender(g);
    const address = g === "sakhi" ? "Sakhi" : "Sakha";
    addMsg("user", g === "sakhi" ? "Sakhi 🌸" : "Sakha ⚡");
    setTimeout(async () => {
      const greeting = g === "sakhi"
        ? `Wah! Sakhi ${name}, bahut khushi hui tumse milke 🙏 Ab bolo, kya chal raha hai life mein? Sab theek hai?`
        : `Wah! Sakha ${name}, aaj bahut achha laga tumse milke 🙏 Bolo bhai, kya scene hai? Sab theek-thaak?`;
      addMsg("krishna", greeting);
      historyRef.current = [
        { role: "system", content: buildSystem(name, g) },
        { role: "assistant", content: greeting },
      ];
      setPhase(PHASE_CHAT);
    }, 500);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    addMsg("user", text);
    setLoading(true);

    historyRef.current.push({ role: "user", content: text });

    try {
      const reply = await callGroq(historyRef.current);
      historyRef.current.push({ role: "assistant", content: reply });
      addMsg("krishna", reply);
    } catch {
      addMsg("krishna", "🙏 Ek pal... thodi der mein aata hoon.");
    }
    setLoading(false);
  }

  const address = gender === "sakhi" ? "Sakhi" : "Sakha";

  return (
    <div style={{
      position: "fixed", inset: 0, top: "60px",
      background: "linear-gradient(180deg, #010c10 0%, #020f14 60%, #01090d 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .chat-msg { animation: msgIn 0.3s ease both; }

        .sakha-input:focus { outline: none; border-color: rgba(212,175,55,0.6) !important; }
        .sakha-input::placeholder { color: rgba(212,175,55,0.3); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "0.85rem 1.5rem",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
        background: "rgba(1,12,16,0.95)",
        display: "flex", alignItems: "center", gap: "1rem",
        flexShrink: 0,
      }}>
        <img src="/krishna-icon.png" alt="Krishna" style={{
          width: 44, height: 44, borderRadius: "50%",
          border: "2px solid rgba(212,175,55,0.5)",
          objectFit: "cover",
          boxShadow: "0 0 16px rgba(212,175,55,0.3)",
        }}/>
        <div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#D4AF37", letterSpacing: "0.05em" }}>
            Krishna — तुम्हारा सखा
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(212,175,55,0.5)", letterSpacing: "0.04em" }}>
            {phase === PHASE_CHAT ? `● Online · ${address} ${name}` : "● Connecting..."}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.map(msg => (
          <div key={msg.id} className="chat-msg" style={{
            display: "flex",
            justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
            gap: "0.6rem",
            alignItems: "flex-end",
          }}>
            {msg.from === "krishna" && (
              <img src="/krishna-icon.png" style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.4)", objectFit: "cover", flexShrink: 0 }}/>
            )}
            <div style={{
              maxWidth: "72%",
              padding: "0.7rem 1rem",
              borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: msg.from === "user"
                ? "linear-gradient(135deg, rgba(0,195,137,0.18), rgba(0,165,181,0.12))"
                : "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))",
              border: msg.from === "user"
                ? "1px solid rgba(0,195,137,0.3)"
                : "1px solid rgba(212,175,55,0.22)",
              color: msg.from === "user" ? "#d4f5ea" : "#f0e0a8",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              fontFamily: msg.text?.match(/[ऀ-ॿ]/) ? "'Noto Sans Devanagari',sans-serif" : "inherit",
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="chat-msg" style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end" }}>
            <img src="/krishna-icon.png" style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.4)", objectFit: "cover" }}/>
            <div style={{
              padding: "0.7rem 1rem",
              borderRadius: "18px 18px 18px 4px",
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.2)",
              display: "flex", gap: "4px", alignItems: "center",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#D4AF37",
                  animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        )}

        {/* Gender selection buttons */}
        {phase === PHASE_GENDER && (
          <div className="chat-msg" style={{ display: "flex", gap: "0.75rem", paddingLeft: "2.5rem" }}>
            {[["sakha","⚡ Sakha (Boy)"],["sakhi","🌸 Sakhi (Girl)"]].map(([val, label]) => (
              <button key={val} onClick={() => handleGenderSelect(val)} style={{
                padding: "0.55rem 1.25rem",
                background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.06))",
                border: "1px solid rgba(212,175,55,0.4)",
                borderRadius: "999px",
                color: "#D4AF37", fontSize: "0.85rem",
                cursor: "pointer", fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 600, letterSpacing: "0.05em",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.06))"}
              >{label}</button>
            ))}
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      {(phase === PHASE_NAME || phase === PHASE_CHAT) && (
        <div style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid rgba(212,175,55,0.12)",
          background: "rgba(1,10,14,0.95)",
          display: "flex", gap: "0.75rem",
          flexShrink: 0,
        }}>
          <input
            className="sakha-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (phase === PHASE_NAME ? handleNameSubmit() : handleSend())}
            placeholder={phase === PHASE_NAME ? "Apna naam batao..." : `Bolo ${address} ${name}...`}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.22)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              color: "#f0e6c8",
              fontSize: "0.9rem",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
          />
          <button
            onClick={phase === PHASE_NAME ? handleNameSubmit : handleSend}
            disabled={loading}
            style={{
              padding: "0.75rem 1.4rem",
              background: "linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.08))",
              border: "1px solid rgba(212,175,55,0.45)",
              borderRadius: "12px",
              color: "#D4AF37",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 700, fontSize: "0.9rem",
              letterSpacing: "0.06em",
              transition: "all 0.2s",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "..." : "🙏 Bhejo"}
          </button>
        </div>
      )}
    </div>
  );
}
