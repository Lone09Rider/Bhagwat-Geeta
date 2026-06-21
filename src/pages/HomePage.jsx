import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SLOKAS, CHAPTERS } from "../data/slokas";
import SlokaCard from "../components/SlokaCard";
import gitaData from "../data/gita_700.json";

// ── Stagger reveal variants for the daily hero ──────────────────────────────
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.05 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function fetchKrishnaMessage(verse) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.85,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content: `You are Krishna speaking directly to the reader. Based ONLY on this specific verse, give a short personal message (2-3 sentences) in the style of Sourabh Raaj Jain's Krishna from Mahabharat — poetic, dignified, warm. No chapter/verse numbers. No slang. Speak as if whispering to a beloved friend.`
          },
          {
            role: "user",
            content: `Verse: "${verse.english}"\nMeaning: "${verse.meaning}"\n\nSpeak your message to the reader.`
          }
        ]
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// ── Daily sloka logic ─────────────────────────────────────────────────────────
// Fixed epoch: Jan 1 2024. Day 0 = verse 1, Day 1 = verse 2, cycles all 700.
// Same for every user on the same calendar day — locked at midnight.
const EPOCH = new Date("2024-01-01T00:00:00+05:30").getTime(); // IST midnight

function getDailyVerse() {
  const nowIST = Date.now() + (5.5 * 60 * 60 * 1000); // offset to IST
  const daysSinceEpoch = Math.floor((nowIST - EPOCH) / 86400000);
  const idx = ((daysSinceEpoch % 700) + 700) % 700;
  const entry = gitaData[idx];
  const m = entry.verse.match(/Chapter (\d+), Verse (\d+)/);
  return {
    ch:      m ? +m[1] : 1,
    v:       m ? +m[2] : 1,
    sanskrit: entry.sanskrit || "",
    hindi:    entry.hindi    || "",
    english:  entry.english  || "",
    meaning:  entry.meaning  || "",
    life:     entry.life_application || "",
    krishna:  entry.krishna_message  || "",
    dayNum:   daysSinceEpoch + 1, // Day 1-based for display
  };
}

const daily = getDailyVerse(); // compute once, stable for the day

export default function HomePage() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const ch = CHAPTERS[daily.ch - 1];
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [krishnaMsg, setKrishnaMsg] = useState(null);
  const [krishnaLoading, setKrishnaLoading] = useState(false);

  async function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !krishnaMsg && !krishnaLoading) {
      setKrishnaLoading(true);
      const msg = await fetchKrishnaMessage(daily);
      setKrishnaMsg(msg);
      setKrishnaLoading(false);
    }
  }

  return (
    <div className="page">

      {/* ── Daily Sloka Hero ── */}
      <motion.div
        className="daily-hero"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div className="daily-date" variants={heroItem}>
          🕉 Sloka of the Day — {dateStr}
          <span style={{ marginLeft: "1rem", fontSize: "0.72rem", opacity: 0.6 }}>
            Day #{daily.dayNum} · Verse {daily.ch}.{daily.v}
          </span>
        </motion.div>

        {/* Sanskrit */}
        <motion.pre className="daily-sanskrit" variants={heroItem}>{daily.sanskrit}</motion.pre>

        {/* Hindi */}
        <motion.div
          variants={heroItem}
          style={{
            fontFamily: "'Noto Sans Devanagari', sans-serif",
            fontSize: "0.98rem", lineHeight: 1.85,
            color: "rgba(212,245,238,0.82)",
            marginBottom: "0.85rem",
            padding: "0.75rem 1rem",
            background: "rgba(0,195,137,0.08)",
            borderRadius: "8px",
            borderLeft: "3px solid rgba(0,195,137,0.4)",
          }}>
          {daily.hindi}
        </motion.div>

        {/* English */}
        <motion.p className="daily-english" variants={heroItem}>{daily.english}</motion.p>

        {/* Ref */}
        <motion.div className="daily-ref" variants={heroItem}>— Bhagavad Gita {daily.ch}.{daily.v} · {ch?.name}</motion.div>

        {/* Expand button */}
        <motion.button
          className="btn"
          variants={heroItem}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExpand}
          style={{ marginTop: "1rem", background: "rgba(0,195,137,0.12)", color: "var(--pk-aqua)", border: "1px solid rgba(0,195,137,0.3)" }}
        >
          {expanded ? "▲ Less" : "▼ More — Understanding & Krishna's Message"}
        </motion.button>

        {/* Expanded details */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="expanded-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {daily.meaning && (
                  <div>
                    <p style={{ fontSize: "0.72rem", color: "var(--pk-green)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.3rem" }}>💡 Understanding</p>
                    <p style={{ fontSize: "0.92rem", color: "rgba(212,245,238,0.75)", lineHeight: 1.75 }}>{daily.meaning}</p>
                  </div>
                )}
                {daily.life && (
                  <div>
                    <p style={{ fontSize: "0.72rem", color: "var(--pk-green)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.3rem" }}>🌱 Life Application</p>
                    <p style={{ fontSize: "0.92rem", color: "rgba(212,245,238,0.75)", lineHeight: 1.75 }}>{daily.life}</p>
                  </div>
                )}
                <div style={{ padding: "0.75rem 1rem", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", minHeight: "3rem" }}>
                  {krishnaLoading
                    ? (
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ fontSize: "0.85rem", color: "rgba(212,175,55,0.7)", fontStyle: "italic" }}
                      >
                        🪷 Krishna is speaking...
                      </motion.p>
                    )
                    : <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "#F5C842", lineHeight: 1.7 }}>🪷 {krishnaMsg || daily.krishna}</p>
                  }
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save button */}
        <motion.button
          className="btn"
          variants={heroItem}
          whileTap={{ scale: 0.9 }}
          animate={liked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onClick={() => setLiked(l => !l)}
          style={{ marginTop: "2.5rem", background: liked ? "rgba(0,195,137,0.2)" : "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          {liked ? "♥ Saved" : "♡ Save this sloka"}
        </motion.button>
      </motion.div>

      {/* ── Key Slokas ── */}
      <h2 className="section-title">Key Slokas</h2>
      <p className="section-sub">Timeless teachings from the Bhagavad Gita</p>
      <div className="grid-2">
        {SLOKAS.filter(s => s.key).map(s => <SlokaCard key={s.id} sloka={s} />)}
      </div>

      {/* ── Info box ── */}
      <div className="info-box" style={{ marginTop: "2.5rem" }}>
        <h3 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.3rem", color: "var(--pk-aqua)", marginBottom: "0.5rem" }}>
          About the Bhagavad Gita
        </h3>
        <p style={{ fontSize: "0.95rem", color: "var(--muted)", lineHeight: 1.8 }}>
          The Bhagavad Gita is a 700-verse Hindu scripture, part of the epic Mahabharata. It is a dialogue between prince Arjuna and his guide Krishna on the battlefield of Kurukshetra, covering jnana (knowledge), bhakti (devotion), karma (action), and raja (meditation) yogas.
        </p>
        <div className="stats-row">
          {[["18","Chapters"],["700","Slokas"],["3","Main Yogas"],["5000+","Years of wisdom"]].map(([n,l]) => (
            <div key={l}>
              <span className="stat-num">{n}</span><br />
              <span className="stat-label">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
