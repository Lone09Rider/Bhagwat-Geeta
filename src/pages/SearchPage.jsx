import { useState, useMemo } from "react";
import gitaData from "../data/gita_700.json";

// All themes with icons + keyword hints for searching 700 verses
const PORTAL_THEMES = [
  { id: "karma",        label: "Karma",        icon: "⚡", keywords: ["karma","action","fruit","result","deed"] },
  { id: "dharma",       label: "Dharma",        icon: "☸️", keywords: ["dharma","duty","righteousness","righteous"] },
  { id: "soul",         label: "Soul / Atman",  icon: "✨", keywords: ["soul","atman","self","eternal","immortal","spirit"] },
  { id: "devotion",     label: "Bhakti",        icon: "🪷", keywords: ["devotion","bhakti","worship","love","surrender"] },
  { id: "knowledge",    label: "Knowledge",     icon: "📖", keywords: ["knowledge","wisdom","jnana","truth","understanding"] },
  { id: "meditation",   label: "Meditation",    icon: "🧘", keywords: ["meditation","mind","focus","concentration","dhyana"] },
  { id: "peace",        label: "Peace",         icon: "🕊️", keywords: ["peace","tranquil","calm","equanimity","serenity"] },
  { id: "detachment",   label: "Detachment",    icon: "🌊", keywords: ["detach","non-attach","renounce","let go","without desire"] },
  { id: "liberation",   label: "Moksha",        icon: "🌟", keywords: ["liberation","moksha","freedom","salvation","nirvana"] },
  { id: "nature",       label: "Nature / Gunas", icon: "🌿", keywords: ["nature","guna","sattva","rajas","tamas","quality"] },
  { id: "courage",      label: "Courage",       icon: "🦁", keywords: ["courage","fearless","brave","warrior","strength"] },
  { id: "ego",          label: "Ego / Pride",   icon: "🌀", keywords: ["ego","pride","arrogance","vanity","self-conceit"] },
  { id: "death",        label: "Death & Beyond",icon: "🌙", keywords: ["death","die","born","rebirth","reincarnation","cycle"] },
  { id: "god",          label: "God / Krishna", icon: "🪈", keywords: ["krishna","divine","god","lord","vishnu","supreme"] },
  { id: "anger",        label: "Anger",         icon: "🔥", keywords: ["anger","wrath","rage","fury","agitation"] },
  { id: "desire",       label: "Desire",        icon: "💫", keywords: ["desire","lust","craving","longing","greed"] },
  { id: "yoga",         label: "Yoga Paths",    icon: "🧩", keywords: ["yoga","path","way","discipline","practice"] },
  { id: "society",      label: "Society",       icon: "🏛️", keywords: ["society","world","people","class","varna","order"] },
  { id: "mind",         label: "Mind & Senses", icon: "👁️", keywords: ["mind","senses","sense","control","perceive"] },
  { id: "love",         label: "Love",          icon: "❤️", keywords: ["love","beloved","dear","affection","compassion"] },
  { id: "sacrifice",    label: "Sacrifice",     icon: "🙏", keywords: ["sacrifice","yajna","offering","give","selfless"] },
  { id: "time",         label: "Time",          icon: "⏳", keywords: ["time","eternity","age","moment","cycle","kala"] },
  { id: "cosmic",       label: "Cosmic Vision", icon: "🌌", keywords: ["cosmic","universe","creation","manifest","infinite"] },
  { id: "faith",        label: "Faith",         icon: "🌸", keywords: ["faith","belief","trust","shraddha","conviction"] },
];

const ACCENT_CYCLE = [
  "#00C389","#00A5B5","#7B4FD4","#4FC3F7","#3DD6C8","#D4AF37",
  "#F472B6","#34D399","#A78BFA","#60A5FA","#FBBF24","#4ADE80",
];

// Parse all 700 verses once
const ALL_700 = gitaData.map(entry => {
  const m = entry.verse.match(/Chapter (\d+), Verse (\d+)/);
  return {
    ch:      m ? +m[1] : 0,
    v:       m ? +m[2] : 0,
    sanskrit: entry.sanskrit || "",
    hindi:    entry.hindi    || "",
    english:  entry.english  || "",
    meaning:  entry.meaning  || "",
    life:     entry.life_application || "",
    krishna:  entry.krishna_message  || "",
  };
});

function searchByTheme(theme) {
  const kws = theme.keywords;
  const scored = ALL_700.map(v => {
    const haystack = `${v.english} ${v.meaning} ${v.life} ${v.krishna}`.toLowerCase();
    let score = 0;
    for (const k of kws) {
      // Count occurrences — more hits = more relevant
      const matches = haystack.split(k).length - 1;
      score += matches * (k.length > 6 ? 3 : 1); // longer keywords weighted more
    }
    return { ...v, score };
  });
  return scored
    .filter(v => v.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function PortalVerseCard({ v }) {
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
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,195,137,0.5)"; e.currentTarget.style.background = "rgba(0,195,137,0.09)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,195,137,0.18)"; e.currentTarget.style.background = "rgba(0,195,137,0.05)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--pk-green)", fontWeight: 700, letterSpacing: "0.06em" }}>
          {v.ch}.{v.v}
        </span>
        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{open ? "▲" : "▼"}</span>
      </div>
      <pre style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: "0.82rem", whiteSpace: "pre-wrap", color: "var(--pk-aqua)", lineHeight: 1.7, marginBottom: "0.4rem" }}>
        {v.sanskrit}
      </pre>
      <p style={{ fontSize: "0.8rem", color: "rgba(212,245,238,0.65)", lineHeight: 1.6, margin: 0 }}>{v.english}</p>

      {open && (
        <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(0,195,137,0.15)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {v.hindi && (
            <p style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: "0.82rem", color: "rgba(255,220,180,0.8)", lineHeight: 1.7 }}>{v.hindi}</p>
          )}
          {v.meaning && (
            <div>
              <p style={{ fontSize: "0.65rem", color: "var(--pk-green)", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "0.2rem" }}>💡 Understanding</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.7 }}>{v.meaning}</p>
            </div>
          )}
          {v.krishna && (
            <div style={{ padding: "0.45rem 0.8rem", background: "rgba(0,195,137,0.07)", borderLeft: "3px solid var(--pk-green)", borderRadius: "0 6px 6px 0" }}>
              <p style={{ fontSize: "0.76rem", fontStyle: "italic", color: "var(--pk-aqua)", lineHeight: 1.65 }}>🪷 {v.krishna}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Portal({ theme, onClose }) {
  const verses = useMemo(() => searchByTheme(theme), [theme]);
  const accent = ACCENT_CYCLE[PORTAL_THEMES.indexOf(theme) % ACCENT_CYCLE.length];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(2,12,16,0.97)",
      display: "flex", flexDirection: "column",
      animation: "portalIn 0.38s cubic-bezier(0.22,1,0.36,1) both",
    }}>
      <style>{`
        @keyframes portalIn {
          from { opacity: 0; transform: scale(0.96) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Portal header */}
      <div style={{
        padding: "1.25rem 2rem",
        borderBottom: `1px solid ${accent}33`,
        background: `linear-gradient(135deg, rgba(2,12,16,0.98), ${accent}0a)`,
        display: "flex", alignItems: "center", gap: "1rem",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: "2rem" }}>{theme.icon}</span>
        <div>
          <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.6rem", color: accent, margin: 0, letterSpacing: "0.04em" }}>
            {theme.label}
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>
            Top {verses.length} most relevant slokas from all 700 verses
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            marginLeft: "auto", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
            color: "var(--muted)", padding: "0.45rem 1rem", cursor: "pointer",
            fontSize: "0.85rem", fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.06em",
          }}
        >
          ✕ Close Portal
        </button>
      </div>

      {/* Verses scroll area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem" }}>
        {verses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
            No slokas matched this theme.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "1rem" }}>
            {verses.map(v => <PortalVerseCard key={`${v.ch}.${v.v}`} v={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [activePortal, setActivePortal] = useState(null);

  return (
    <>
      <div className="page">
        <h2 className="section-title">Explore by Theme</h2>
        <p className="section-sub">Choose a theme — a portal opens with all related slokas from all 700 verses</p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}>
          {PORTAL_THEMES.map((theme, i) => {
            const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
            return (
              <button
                key={theme.id}
                onClick={() => setActivePortal(theme)}
                style={{
                  background: `linear-gradient(145deg, rgba(4,22,32,0.88) 0%, ${accent}22 100%)`,
                  border: `1px solid ${accent}66`,
                  borderRadius: "14px",
                  padding: "1.25rem 1rem",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem",
                  transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s, background 0.18s",
                  position: "relative", overflow: "hidden",
                  boxShadow: `0 2px 16px rgba(0,0,0,0.45), 0 0 0 0 ${accent}`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px) scale(1.04)";
                  e.currentTarget.style.boxShadow = `0 10px 36px ${accent}55, 0 0 20px ${accent}22`;
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.background = `linear-gradient(145deg, ${accent}28 0%, rgba(4,22,32,0.9) 100%)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = `0 2px 16px rgba(0,0,0,0.45)`;
                  e.currentTarget.style.borderColor = `${accent}66`;
                  e.currentTarget.style.background = `linear-gradient(145deg, rgba(4,22,32,0.88) 0%, ${accent}22 100%)`;
                }}
              >
                {/* Shimmer sweep */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: `linear-gradient(110deg, transparent 20%, ${accent}33 50%, transparent 80%)`,
                  animation: `shimmer${i} ${2.5 + (i % 4) * 0.6}s ease-in-out ${(i * 0.18) % 2.2}s infinite`,
                }} />
                <style>{`
                  @keyframes shimmer${i} {
                    0%,100% { opacity: 0; transform: translateX(-120%); }
                    45%,55% { opacity: 1; transform: translateX(120%); }
                  }
                `}</style>
                {/* Corner accent glow */}
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 60, height: 60, pointerEvents: "none",
                  background: `radial-gradient(circle at bottom right, ${accent}30, transparent 70%)`,
                }} />

                <span style={{ fontSize: "2rem", lineHeight: 1 }}>{theme.icon}</span>
                <span style={{
                  fontFamily: "'Rajdhani',sans-serif",
                  fontSize: "0.95rem", fontWeight: 700,
                  color: accent, letterSpacing: "0.05em",
                  textAlign: "center",
                }}>
                  {theme.label}
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.04em" }}>
                  Open Portal →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activePortal && (
        <Portal theme={activePortal} onClose={() => setActivePortal(null)} />
      )}
    </>
  );
}
