import { useState, useMemo } from "react";
import { CHAPTERS } from "../data/slokas";
import gitaData from "../data/gita_700.json";

const ALL_VERSES = gitaData.map(entry => {
  const m = entry.verse.match(/Chapter (\d+), Verse (\d+)/);
  return {
    ch: m ? +m[1] : 0,
    v:  m ? +m[2] : 0,
    english: entry.english || "",
    hindi:   entry.hindi   || "",
  };
}).filter(e => e.ch > 0);

const ACCENT = ["#00C389","#00A5B5","#7B4FD4","#4FC3F7","#3DD6C8","#D4AF37"];

export default function ExplorerPage() {
  const [selectedCh, setSelectedCh] = useState(null);

  const chVerses = useMemo(() =>
    ALL_VERSES.filter(v => v.ch === selectedCh).sort((a, b) => a.v - b.v),
    [selectedCh]
  );

  const chapter = selectedCh ? CHAPTERS[selectedCh - 1] : null;
  const accent  = selectedCh ? ACCENT[(selectedCh - 1) % ACCENT.length] : "#00C389";

  return (
    <div className="page">
      <h2 className="section-title">Chapter Explorer</h2>
      <p className="section-sub">18 chapters · {ALL_VERSES.length} slokas from the Bhagavad Gita</p>

      {/* Chapter grid — name only */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "0.6rem",
        marginBottom: "1.5rem",
      }}>
        {CHAPTERS.map(ch => {
          const a = ACCENT[(ch.num - 1) % ACCENT.length];
          const active = selectedCh === ch.num;
          return (
            <div
              key={ch.num}
              onClick={() => setSelectedCh(active ? null : ch.num)}
              style={{
                padding: "0.65rem 0.8rem",
                borderRadius: "10px",
                border: `1px solid ${active ? a : "rgba(0,195,137,0.14)"}`,
                background: active ? `${a}18` : "rgba(2,18,28,0.7)",
                cursor: "pointer",
                transition: "all 0.2s",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: a, lineHeight: 1, fontFamily: "'Rajdhani',sans-serif" }}>
                {ch.num}
              </div>
              <div style={{ fontSize: "0.75rem", color: active ? "#d4f5ee" : "var(--muted)", marginTop: "0.2rem", lineHeight: 1.3 }}>
                {ch.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Verse list */}
      {chapter && (
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            marginBottom: "1rem", paddingBottom: "0.6rem",
            borderBottom: `1px solid ${accent}30`,
          }}>
            <span style={{ fontSize: "2rem", fontWeight: 700, color: accent, fontFamily: "'Rajdhani',sans-serif" }}>
              {chapter.num}
            </span>
            <div>
              <div style={{ color: "var(--pk-aqua)", fontWeight: 600 }}>{chapter.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{chVerses.length} verses</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {chVerses.map(s => (
              <div
                key={`${s.ch}.${s.v}`}
                style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  padding: "0.55rem 0.75rem",
                  borderRadius: "8px",
                  background: "rgba(0,195,137,0.04)",
                  border: "1px solid rgba(0,195,137,0.08)",
                }}
              >
                <span style={{
                  minWidth: "2.8rem", fontSize: "0.72rem", fontWeight: 700,
                  color: accent, paddingTop: "0.1rem", fontFamily: "'Rajdhani',sans-serif",
                  letterSpacing: "0.03em",
                }}>
                  {s.ch}.{s.v}
                </span>
                <span style={{ fontSize: "0.84rem", color: "var(--text-dim)", lineHeight: 1.6 }}>
                  {s.english}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedCh && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📖</div>
          <p>Select a chapter to read all its verses</p>
        </div>
      )}
    </div>
  );
}
