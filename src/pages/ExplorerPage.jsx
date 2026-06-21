import { useState, useMemo } from "react";
import { CHAPTERS } from "../data/slokas";
import gitaData from "../data/gita_700.json";

const CHAPTER_ICONS = [
  "⚔️","🧠","⚡","📚","🕊️","🧘","✨","🌌","👑","🌟",
  "🌀","🪷","🌿","⚖️","🌳","☯️","🙏","🌺",
];

const ACCENT_CYCLE = [
  "#00C389","#00A5B5","#7B4FD4","#4FC3F7","#3DD6C8","#D4AF37",
  "#F472B6","#34D399","#A78BFA","#60A5FA","#FBBF24","#4ADE80",
  "#00C389","#00A5B5","#7B4FD4","#4FC3F7","#3DD6C8","#D4AF37",
];

// Topics per chapter with verse ranges
const CHAPTER_TOPICS = {
  1:  [{ label:"Gathering of Armies",range:[1,11]},{ label:"Arjuna's Survey",range:[12,20]},{ label:"Arjuna's Grief",range:[21,47]}],
  2:  [{ label:"Arjuna's Dilemma",range:[1,10]},{ label:"The Immortal Soul",range:[11,30]},{ label:"Yoga of Duty",range:[31,53]},{ label:"The Steady Wise",range:[54,72]}],
  3:  [{ label:"Why Act?",range:[1,9]},{ label:"Yajna – Cycle of Sacrifice",range:[10,16]},{ label:"Leading by Example",range:[17,26]},{ label:"Nature vs. Self",range:[27,35]},{ label:"Desire is the Enemy",range:[36,43]}],
  4:  [{ label:"Divine Incarnation",range:[1,15]},{ label:"Types of Action",range:[16,24]},{ label:"Various Sacrifices",range:[25,33]},{ label:"Knowledge & Liberation",range:[34,42]}],
  5:  [{ label:"Renunciation vs. Action",range:[1,7]},{ label:"The Knower of Truth",range:[8,12]},{ label:"Inner Renunciation",range:[13,26]},{ label:"The Yogi's Joy",range:[27,29]}],
  6:  [{ label:"The True Sannyasi",range:[1,10]},{ label:"Practice of Meditation",range:[11,20]},{ label:"The Highest Goal",range:[21,32]},{ label:"Controlling the Mind",range:[33,36]},{ label:"The Yogi's Destiny",range:[37,47]}],
  7:  [{ label:"God's Two Natures",range:[1,7]},{ label:"The Divine Illusion",range:[8,14]},{ label:"Those Who Seek God",range:[15,23]},{ label:"Beyond Maya",range:[24,30]}],
  8:  [{ label:"Key Questions",range:[1,7]},{ label:"Remembering God at Death",range:[8,16]},{ label:"Cosmic Time",range:[17,22]},{ label:"Two Paths after Death",range:[23,28]}],
  9:  [{ label:"Royal Knowledge",range:[1,6]},{ label:"God Pervades All",range:[7,15]},{ label:"Worship & Devotion",range:[16,25]},{ label:"Equality of God",range:[26,34]}],
  10: [{ label:"God's Glories",range:[1,11]},{ label:"Arjuna's Praise",range:[12,18]},{ label:"Divine Manifestations",range:[19,42]}],
  11: [{ label:"Arjuna's Request",range:[1,4]},{ label:"Universal Form Revealed",range:[5,31]},{ label:"Arjuna's Awe & Fear",range:[32,50]},{ label:"Path to See God",range:[51,55]}],
  12: [{ label:"Saguna vs. Nirguna",range:[1,7]},{ label:"Paths to God",range:[8,12]},{ label:"Qualities of a Devotee",range:[13,20]}],
  13: [{ label:"The Field & Knower",range:[1,7]},{ label:"Divine Knowledge",range:[8,12]},{ label:"The Knowable (Brahman)",range:[13,18]},{ label:"Matter, Soul & Liberation",range:[19,35]}],
  14: [{ label:"The Three Gunas",range:[1,5]},{ label:"Sattva Guna",range:[6,9]},{ label:"Rajas & Tamas Gunas",range:[10,18]},{ label:"Beyond the Gunas",range:[19,27]}],
  15: [{ label:"The Ashvattha Tree",range:[1,6]},{ label:"The Living Soul",range:[7,11]},{ label:"God's Light",range:[12,15]},{ label:"The Supreme Being",range:[16,20]}],
  16: [{ label:"Divine Qualities",range:[1,3]},{ label:"Demonic Qualities",range:[4,15]},{ label:"Fate of the Demonic",range:[16,24]}],
  17: [{ label:"Faith of Three Types",range:[1,7]},{ label:"Food & Sacrifice",range:[8,13]},{ label:"Austerity (Tapasya)",range:[14,22]},{ label:"Om Tat Sat",range:[23,28]}],
  18: [{ label:"Renunciation Defined",range:[1,12]},{ label:"Five Causes of Action",range:[13,18]},{ label:"Three Types of Knowledge",range:[19,40]},{ label:"The Four Varnas",range:[41,45]},{ label:"Devotion & Liberation",range:[46,66]},{ label:"Final Words of Krishna",range:[67,78]}],
};

const ALL_VERSES = gitaData.map(entry => {
  const m = entry.verse.match(/Chapter (\d+), Verse (\d+)/);
  return {
    ch: m ? +m[1] : 0,
    v:  m ? +m[2] : 0,
    sanskrit: entry.sanskrit  || "",
    hindi:    entry.hindi     || "",
    english:  entry.english   || "",
    meaning:  entry.meaning   || "",
    krishna:  entry.krishna_message || "",
  };
}).filter(e => e.ch > 0);

function VerseCard({ v, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: "rgba(0,195,137,0.05)",
        border: "1px solid rgba(0,195,137,0.18)",
        borderRadius: "12px",
        padding: "1rem 1.2rem",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}80`; e.currentTarget.style.background = `${accent}0e`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,195,137,0.18)"; e.currentTarget.style.background = "rgba(0,195,137,0.05)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "0.72rem", color: accent, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'Rajdhani',sans-serif" }}>
          {v.ch}.{v.v}
        </span>
        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{open ? "▲" : "▼"}</span>
      </div>
      {v.sanskrit && (
        <pre style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: "0.82rem", whiteSpace: "pre-wrap", color: "var(--pk-aqua)", lineHeight: 1.7, marginBottom: "0.4rem" }}>
          {v.sanskrit}
        </pre>
      )}
      <p style={{ fontSize: "0.8rem", color: "rgba(212,245,238,0.7)", lineHeight: 1.6, margin: 0 }}>{v.english}</p>

      {open && (
        <div style={{ marginTop: "0.75rem", borderTop: `1px solid ${accent}22`, paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {v.hindi && (
            <p style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: "0.82rem", color: "rgba(255,220,180,0.8)", lineHeight: 1.7 }}>{v.hindi}</p>
          )}
          {v.krishna && (
            <div style={{ padding: "0.45rem 0.8rem", background: "rgba(0,195,137,0.07)", borderLeft: `3px solid ${accent}`, borderRadius: "0 6px 6px 0" }}>
              <p style={{ fontSize: "0.76rem", fontStyle: "italic", color: "var(--pk-aqua)", lineHeight: 1.65 }}>🪷 {v.krishna}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChapterPortal({ ch, accent, icon, onClose }) {
  const topics = CHAPTER_TOPICS[ch.num] || [];
  const [activeTopic, setActiveTopic] = useState(null);

  const verses = useMemo(() => {
    if (!activeTopic) return ALL_VERSES.filter(v => v.ch === ch.num);
    const [from, to] = activeTopic.range;
    return ALL_VERSES.filter(v => v.ch === ch.num && v.v >= from && v.v <= to);
  }, [ch.num, activeTopic]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(2,12,16,0.97)",
      display: "flex", flexDirection: "column",
      animation: "portalIn 0.38s cubic-bezier(0.22,1,0.36,1) both",
    }}>
      <style>{`@keyframes portalIn { from { opacity:0; transform:scale(0.96) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

      {/* Header */}
      <div style={{
        padding: "1.25rem 1.5rem",
        borderBottom: `1px solid ${accent}33`,
        background: `linear-gradient(135deg, rgba(2,12,16,0.98), ${accent}0a)`,
        display: "flex", alignItems: "center", gap: "1rem",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: "2rem" }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.5rem", color: accent, margin: 0, letterSpacing: "0.04em" }}>
            {ch.num}. {ch.name}
          </h2>
          <p className="devanagari" style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>{ch.dev}</p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "8px", color: "var(--muted)", padding: "0.45rem 1rem",
            cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.06em",
          }}
        >✕ Close</button>
      </div>

      {/* Topic filter pills */}
      <div style={{
        padding: "0.75rem 1.5rem",
        borderBottom: `1px solid ${accent}18`,
        display: "flex", flexWrap: "wrap", gap: "0.5rem",
        flexShrink: 0,
      }}>
        <button
          onClick={() => setActiveTopic(null)}
          style={{
            padding: "0.3rem 0.8rem", borderRadius: "20px",
            border: `1px solid ${!activeTopic ? accent : "rgba(0,195,137,0.2)"}`,
            background: !activeTopic ? `${accent}22` : "rgba(0,195,137,0.05)",
            color: !activeTopic ? "#d4f5ee" : "var(--muted)",
            fontSize: "0.76rem", cursor: "pointer",
          }}
        >All {ch.slokas} verses</button>
        {topics.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTopic(activeTopic === t ? null : t)}
            style={{
              padding: "0.3rem 0.8rem", borderRadius: "20px",
              border: `1px solid ${activeTopic === t ? accent : "rgba(0,195,137,0.2)"}`,
              background: activeTopic === t ? `${accent}22` : "rgba(0,195,137,0.05)",
              color: activeTopic === t ? "#d4f5ee" : "var(--muted)",
              fontSize: "0.76rem", cursor: "pointer",
            }}
          >
            {t.label} <span style={{ opacity: 0.55, fontSize: "0.68rem" }}>{t.range[0]}–{t.range[1]}</span>
          </button>
        ))}
      </div>

      {/* Verse grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1rem" }}>
          {verses.map(v => <VerseCard key={`${v.ch}.${v.v}`} v={v} accent={accent} />)}
        </div>
      </div>
    </div>
  );
}

export default function ExplorerPage() {
  const [activeChapter, setActiveChapter] = useState(null);

  return (
    <>
      <div className="page">
        <h2 className="section-title">Chapter Explorer</h2>
        <p className="section-sub">18 chapters · {ALL_VERSES.length} slokas — click a chapter to explore</p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
          marginTop: "1.5rem",
        }}>
          {CHAPTERS.map((ch, i) => {
            const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
            const icon = CHAPTER_ICONS[i];
            return (
              <button
                key={ch.num}
                onClick={() => setActiveChapter({ ch, accent, icon })}
                style={{
                  background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
                  border: `1px solid ${accent}40`,
                  borderRadius: "14px",
                  padding: "1.25rem 1rem",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                  transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
                  e.currentTarget.style.boxShadow = `0 8px 32px ${accent}44`;
                  e.currentTarget.style.borderColor = accent;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = `${accent}40`;
                }}
              >
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: `linear-gradient(120deg, transparent 30%, ${accent}18 50%, transparent 70%)`,
                  animation: `shimmerCh${i} ${3 + (i % 4) * 0.5}s ease-in-out ${(i * 0.15) % 2}s infinite`,
                }} />
                <style>{`@keyframes shimmerCh${i} { 0%,100%{opacity:0;transform:translateX(-100%)} 50%{opacity:1;transform:translateX(100%)} }`}</style>

                <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{icon}</span>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: accent, lineHeight: 1 }}>
                  {ch.num}
                </span>
                <span style={{ fontSize: "0.72rem", color: "rgba(212,245,238,0.7)", textAlign: "center", lineHeight: 1.3 }}>
                  {ch.name}
                </span>
                <span style={{ fontSize: "0.62rem", color: "var(--muted)", letterSpacing: "0.04em" }}>
                  {ch.slokas} slokas →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeChapter && (
        <ChapterPortal
          ch={activeChapter.ch}
          accent={activeChapter.accent}
          icon={activeChapter.icon}
          onClose={() => setActiveChapter(null)}
        />
      )}
    </>
  );
}
