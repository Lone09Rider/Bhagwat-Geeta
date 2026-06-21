import { useState, useMemo } from "react";
import { CHAPTERS } from "../data/slokas";
import gitaData from "../data/gita_700.json";

// All 700 verses parsed
const ALL_VERSES = gitaData.map(entry => {
  const m = entry.verse.match(/Chapter (\d+), Verse (\d+)/);
  return {
    ch: m ? +m[1] : 0,
    v:  m ? +m[2] : 0,
    english: entry.english || "",
    hindi:   entry.hindi   || "",
    meaning: entry.meaning || "",
  };
}).filter(e => e.ch > 0);

// Topics per chapter with verse ranges
const CHAPTER_TOPICS = {
  1:  [
    { label: "Gathering of Armies",      range: [1, 11]  },
    { label: "Arjuna's Survey",           range: [12, 20] },
    { label: "Arjuna's Grief",            range: [21, 47] },
  ],
  2:  [
    { label: "Arjuna's Dilemma",          range: [1, 10]  },
    { label: "The Immortal Soul",         range: [11, 30] },
    { label: "Yoga of Duty",             range: [31, 53] },
    { label: "The Steady Wise",          range: [54, 72] },
  ],
  3:  [
    { label: "Why Act?",                 range: [1, 9]   },
    { label: "Yajna – Cycle of Sacrifice", range: [10, 16] },
    { label: "Leading by Example",       range: [17, 26] },
    { label: "Nature vs. Self",          range: [27, 35] },
    { label: "Desire is the Enemy",      range: [36, 43] },
  ],
  4:  [
    { label: "Divine Incarnation",       range: [1, 15]  },
    { label: "Types of Action",          range: [16, 24] },
    { label: "Various Sacrifices",       range: [25, 33] },
    { label: "Knowledge & Liberation",   range: [34, 42] },
  ],
  5:  [
    { label: "Renunciation vs. Action",  range: [1, 7]   },
    { label: "The Knower of Truth",      range: [8, 12]  },
    { label: "Inner Renunciation",       range: [13, 26] },
    { label: "The Yogi's Joy",           range: [27, 29] },
  ],
  6:  [
    { label: "The True Sannyasi",        range: [1, 10]  },
    { label: "Practice of Meditation",   range: [11, 20] },
    { label: "The Highest Goal",         range: [21, 32] },
    { label: "Controlling the Mind",     range: [33, 36] },
    { label: "The Yogi's Destiny",       range: [37, 47] },
  ],
  7:  [
    { label: "God's Two Natures",        range: [1, 7]   },
    { label: "The Divine Illusion",      range: [8, 14]  },
    { label: "Those Who Seek God",       range: [15, 23] },
    { label: "Beyond Maya",             range: [24, 30] },
  ],
  8:  [
    { label: "Key Questions",            range: [1, 7]   },
    { label: "Remembering God at Death", range: [8, 16]  },
    { label: "Cosmic Time",             range: [17, 22] },
    { label: "Two Paths after Death",    range: [23, 28] },
  ],
  9:  [
    { label: "Royal Knowledge",         range: [1, 6]   },
    { label: "God Pervades All",        range: [7, 15]  },
    { label: "Worship & Devotion",      range: [16, 25] },
    { label: "Equality of God",         range: [26, 34] },
  ],
  10: [
    { label: "God's Glories",           range: [1, 11]  },
    { label: "Arjuna's Praise",         range: [12, 18] },
    { label: "Divine Manifestations",   range: [19, 42] },
  ],
  11: [
    { label: "Arjuna's Request",        range: [1, 4]   },
    { label: "Universal Form Revealed", range: [5, 31]  },
    { label: "Arjuna's Awe & Fear",     range: [32, 50] },
    { label: "Path to See God",         range: [51, 55] },
  ],
  12: [
    { label: "Saguna vs. Nirguna",      range: [1, 7]   },
    { label: "Paths to God",            range: [8, 12]  },
    { label: "Qualities of a Devotee",  range: [13, 20] },
  ],
  13: [
    { label: "The Field & Knower",      range: [1, 7]   },
    { label: "Divine Knowledge",        range: [8, 12]  },
    { label: "The Knowable (Brahman)",  range: [13, 18] },
    { label: "Matter, Soul & Liberation", range: [19, 35] },
  ],
  14: [
    { label: "The Three Gunas",         range: [1, 5]   },
    { label: "Sattva Guna",            range: [6, 9]   },
    { label: "Rajas & Tamas Gunas",    range: [10, 18] },
    { label: "Beyond the Gunas",        range: [19, 27] },
  ],
  15: [
    { label: "The Ashvattha Tree",      range: [1, 6]   },
    { label: "The Living Soul",         range: [7, 11]  },
    { label: "God's Light",            range: [12, 15] },
    { label: "The Supreme Being",       range: [16, 20] },
  ],
  16: [
    { label: "Divine Qualities",        range: [1, 3]   },
    { label: "Demonic Qualities",       range: [4, 15]  },
    { label: "Fate of the Demonic",     range: [16, 24] },
  ],
  17: [
    { label: "Faith of Three Types",    range: [1, 7]   },
    { label: "Food & Sacrifice",        range: [8, 13]  },
    { label: "Austerity (Tapasya)",     range: [14, 22] },
    { label: "Om Tat Sat",             range: [23, 28] },
  ],
  18: [
    { label: "Renunciation Defined",    range: [1, 12]  },
    { label: "Five Causes of Action",   range: [13, 18] },
    { label: "Three Types of Knowledge", range: [19, 40] },
    { label: "The Four Varnas",         range: [41, 45] },
    { label: "Devotion & Liberation",   range: [46, 66] },
    { label: "Final Words of Krishna",  range: [67, 78] },
  ],
};

const ACCENT = ["#00C389","#00A5B5","#7B4FD4","#4FC3F7","#3DD6C8","#D4AF37"];

export default function ExplorerPage() {
  const [selectedCh, setSelectedCh] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const chapter = selectedCh ? CHAPTERS[selectedCh - 1] : null;
  const accent   = selectedCh ? ACCENT[(selectedCh - 1) % ACCENT.length] : "#00C389";
  const topics   = selectedCh ? CHAPTER_TOPICS[selectedCh] || [] : [];

  const verses = useMemo(() => {
    if (!selectedCh || !selectedTopic) return [];
    const [from, to] = selectedTopic.range;
    return ALL_VERSES.filter(v => v.ch === selectedCh && v.v >= from && v.v <= to);
  }, [selectedCh, selectedTopic]);

  function selectChapter(num) {
    if (selectedCh === num) { setSelectedCh(null); setSelectedTopic(null); }
    else { setSelectedCh(num); setSelectedTopic(null); }
  }

  return (
    <div className="page">
      <h2 className="section-title">Chapter Explorer</h2>
      <p className="section-sub">18 chapters · {ALL_VERSES.length} slokas from the Bhagavad Gita</p>

      {/* ── Level 1: Chapter cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: "0.55rem",
        marginBottom: "1.4rem",
      }}>
        {CHAPTERS.map(ch => {
          const a = ACCENT[(ch.num - 1) % ACCENT.length];
          const active = selectedCh === ch.num;
          return (
            <div
              key={ch.num}
              onClick={() => selectChapter(ch.num)}
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "10px",
                border: `1px solid ${active ? a : "rgba(0,195,137,0.13)"}`,
                background: active ? `${a}1a` : "rgba(2,18,28,0.65)",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.18s",
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: a, fontFamily: "'Rajdhani',sans-serif", lineHeight: 1 }}>
                {ch.num}
              </div>
              <div style={{ fontSize: "0.72rem", color: active ? "#cef5ec" : "var(--muted)", marginTop: "0.2rem", lineHeight: 1.3 }}>
                {ch.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Level 2: Topics ── */}
      {chapter && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: accent, marginBottom: "0.6rem",
          }}>
            {chapter.num}. {chapter.name} — Topics
          </div>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "0.5rem",
          }}>
            {topics.map((t, i) => {
              const active = selectedTopic === t;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedTopic(active ? null : t)}
                  style={{
                    padding: "0.4rem 0.85rem",
                    borderRadius: "20px",
                    border: `1px solid ${active ? accent : "rgba(0,195,137,0.2)"}`,
                    background: active ? `${accent}22` : "rgba(0,195,137,0.05)",
                    color: active ? "#d4f5ee" : "var(--muted)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                  <span style={{ marginLeft: "0.4rem", fontSize: "0.68rem", opacity: 0.6 }}>
                    {t.range[0]}–{t.range[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Level 3: Verse cards ── */}
      {selectedTopic && verses.length > 0 && (
        <div>
          <div style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem",
          }}>
            {selectedTopic.label} · {verses.length} verses
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {verses.map(s => (
              <div
                key={`${s.ch}.${s.v}`}
                style={{
                  padding: "0.7rem 0.9rem",
                  borderRadius: "10px",
                  background: "rgba(0,195,137,0.04)",
                  border: `1px solid ${accent}20`,
                  backdropFilter: "blur(6px)",
                }}
              >
                <div style={{
                  fontSize: "0.7rem", fontWeight: 700, color: accent,
                  fontFamily: "'Rajdhani',sans-serif", marginBottom: "0.3rem",
                  letterSpacing: "0.05em",
                }}>
                  {s.ch}.{s.v}
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: 1.65, margin: 0 }}>
                  {s.english}
                </p>
                {s.hindi && (
                  <p className="devanagari" style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.3rem", lineHeight: 1.6, margin: "0.3rem 0 0" }}>
                    {s.hindi}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedCh && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📖</div>
          <p>Select a chapter to explore its topics</p>
        </div>
      )}

      {selectedCh && !selectedTopic && (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)", fontSize: "0.85rem" }}>
          Select a topic above to read its verses
        </div>
      )}
    </div>
  );
}
