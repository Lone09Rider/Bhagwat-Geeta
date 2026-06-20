import { useState, useMemo } from "react";
import { CHAPTERS } from "../data/slokas";
import gitaData from "../data/gita_700.json";

// Curated top 10 key verse numbers per chapter
const TOP_VERSES = {
  1:  [1, 28, 29, 32, 36, 38, 40, 43, 45, 46],
  2:  [7, 11, 13, 14, 17, 20, 22, 47, 62, 72],
  3:  [3, 5, 8, 9, 16, 19, 21, 27, 35, 42],
  4:  [2, 7, 8, 11, 13, 18, 24, 34, 39, 42],
  5:  [2, 7, 10, 11, 12, 18, 21, 24, 27, 29],
  6:  [1, 5, 6, 17, 20, 23, 25, 34, 35, 47],
  7:  [3, 7, 8, 14, 16, 19, 21, 25, 27, 30],
  8:  [5, 6, 7, 9, 10, 12, 13, 14, 15, 16],
  9:  [2, 4, 10, 11, 22, 26, 27, 29, 32, 34],
  10: [3, 8, 9, 10, 11, 20, 32, 36, 39, 42],
  11: [1, 7, 12, 15, 24, 32, 33, 36, 41, 55],
  12: [1, 2, 6, 7, 8, 10, 13, 14, 15, 20],
  13: [1, 2, 5, 12, 13, 17, 22, 27, 28, 34],
  14: [1, 2, 5, 6, 7, 8, 14, 18, 20, 27],
  15: [1, 2, 5, 6, 7, 12, 13, 15, 17, 20],
  16: [1, 2, 3, 4, 5, 6, 7, 21, 22, 24],
  17: [1, 2, 3, 14, 15, 16, 17, 20, 23, 28],
  18: [2, 9, 17, 46, 47, 54, 62, 65, 66, 78],
};

// Parse all 700 entries once
const ALL_VERSES = gitaData.map(entry => {
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

const ACCENT = ["#00C389","#00A5B5","#7B4FD4","#4FC3F7","#3DD6C8","#D4AF37"];

function VerseCard({ s }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="sloka-card" style={{ cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
      {/* Verse badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <span className="badge badge-chapter" style={{ fontSize: "0.75rem" }}>
          {s.ch}.{s.v}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{expanded ? "▲ collapse" : "▼ expand"}</span>
      </div>

      {/* Sanskrit */}
      <pre className="sloka-sanskrit devanagari" style={{ fontSize: "0.95rem", whiteSpace: "pre-wrap", marginBottom: "0.6rem" }}>
        {s.sanskrit}
      </pre>

      {/* Hindi */}
      <div className="sloka-hindi devanagari" style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
        {s.hindi}
      </div>

      {/* English */}
      <p className="sloka-meaning" style={{ fontSize: "0.88rem", marginBottom: expanded ? "0.75rem" : 0 }}>
        {s.english}
      </p>

      {/* Expanded: meaning + life + krishna */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {s.meaning && (
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--pk-green)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>💡 Understanding</p>
              <p style={{ fontSize: "0.84rem", color: "var(--text-dim)", lineHeight: 1.7 }}>{s.meaning}</p>
            </div>
          )}
          {s.life && (
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--pk-green)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>🌱 Life Application</p>
              <p style={{ fontSize: "0.84rem", color: "var(--text-dim)", lineHeight: 1.7 }}>{s.life}</p>
            </div>
          )}
          {s.krishna && (
            <div style={{ padding: "0.5rem 0.85rem", background: "rgba(0,195,137,0.07)", borderLeft: "3px solid var(--pk-green)", borderRadius: "0 6px 6px 0" }}>
              <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--pk-aqua)", lineHeight: 1.65 }}>🪷 {s.krishna}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExplorerPage() {
  const [selectedCh, setSelectedCh] = useState(null);

  const chVerses = useMemo(() => {
    if (!selectedCh) return [];
    const topNums = new Set(TOP_VERSES[selectedCh] || []);
    return ALL_VERSES
      .filter(v => v.ch === selectedCh && topNums.has(v.v))
      .sort((a, b) => a.v - b.v);
  }, [selectedCh]);

  const chapter = selectedCh ? CHAPTERS[selectedCh - 1] : null;
  const accent = selectedCh ? ACCENT[(selectedCh - 1) % ACCENT.length] : "#00C389";

  return (
    <div className="page">
      <h2 className="section-title">Chapter Explorer</h2>
      <p className="section-sub">Browse all 18 chapters · {ALL_VERSES.length} slokas from the Bhagavad Gita</p>

      <div className="chapter-grid">
        {CHAPTERS.map(ch => {
          const a = ACCENT[(ch.num - 1) % ACCENT.length];
          return (
            <div
              key={ch.num}
              className={`chapter-card${selectedCh === ch.num ? " active" : ""}`}
              onClick={() => setSelectedCh(selectedCh === ch.num ? null : ch.num)}
              style={{ borderLeftColor: a }}
            >
              <div className="chapter-num" style={{ color: a }}>{ch.num}</div>
              <div className="chapter-name">{ch.name}</div>
              <div className="chapter-dev devanagari">{ch.dev}</div>
              <div className="chapter-count">{ch.slokas} slokas</div>
            </div>
          );
        })}
      </div>

      {chapter && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* Chapter header */}
          <div className="card" style={{ marginBottom: "1.5rem", borderLeft: `4px solid ${accent}` }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ fontSize: "3rem", fontWeight: 700, color: accent, lineHeight: 1, fontFamily: "'Rajdhani',sans-serif" }}>
                {chapter.num}
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", color: "var(--pk-aqua)", marginBottom: "0.2rem" }}>{chapter.name}</h3>
                <p className="devanagari" style={{ color: "var(--muted)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>{chapter.dev}</p>
                <p style={{ fontSize: "0.92rem", color: "var(--text-dim)", lineHeight: 1.7 }}>{chapter.desc}</p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: accent, fontWeight: 600 }}>
                  {chVerses.length} verses — click any card to expand
                </p>
              </div>
            </div>
          </div>

          {/* Verse grid */}
          <div className="grid-2">
            {chVerses.map(s => <VerseCard key={`${s.ch}.${s.v}`} s={s} />)}
          </div>
        </div>
      )}

      {!selectedCh && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📖</div>
          <p>Click a chapter above to explore all its slokas</p>
        </div>
      )}
    </div>
  );
}
