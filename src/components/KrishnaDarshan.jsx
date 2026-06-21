import { useState } from "react";

const HF_KEY = import.meta.env.VITE_HF_API_KEY;

// Mood → vivid art prompt
const MOOD_PROMPTS = {
  "शांति / Peace":        "Lord Krishna seated in deep meditation under a banyan tree, golden divine light, lotus petals floating, serene expression, traditional Indian miniature painting style, Rajput art, ultra detailed, sharp focus, rich jewel tones, no watermark",
  "दुःख / Sadness":       "Lord Krishna compassionately comforting Arjuna on the battlefield of Kurukshetra, warm divine glow, tears, empathy in Krishna's eyes, epic Mahabharata scene, classical Indian painting, Oleograph art style, ultra detailed, vibrant",
  "प्रेम / Love":          "Lord Krishna playing flute under a moonlit Kadamba tree, Radha nearby, golden light, lotus pond, romantic divine scene, traditional Pahari painting style, intricate gold borders, ultra detailed, jewel tones, sharp",
  "शक्ति / Strength":     "Lord Krishna in Vishwarupa form, cosmic universal form, thousand suns blazing, majestic and awe-inspiring, epic scale, traditional Indian tantric art style, ultra detailed, vivid colors, dramatic lighting",
  "मार्गदर्शन / Guidance": "Lord Krishna as charioteer holding reins in the golden chariot, white horses, divine light emanating from him, Arjuna listening, battlefield horizon, classical Indian epic art style, ultra detailed, sharp focus",
  "कृतज्ञता / Gratitude":  "Lord Krishna smiling blissfully with peacock feather, yellow dhoti, jewels, holding flute and lotus, divine aura, traditional Indian devotional calendar art, Ravi Varma style painting, ultra detailed, vibrant colors",
  "भय / Fear":            "Lord Krishna reassuring with Abhaya mudra hand raised, gentle divine smile, radiant golden light dispelling darkness, protective aura, traditional Indian painting, Kangra miniature style, ultra detailed, vivid",
  "आनंद / Joy":           "Lord Krishna dancing Raas Leela with gopinis, colorful festival, joy and celebration, moonlit forest, traditional Nathdwara Pichwai painting style, intricate floral patterns, gold details, ultra vivid, sharp",
};

const MOODS = Object.keys(MOOD_PROMPTS);

async function generateWithHF(prompt) {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_KEY}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 28,
          guidance_scale: 7.5,
          width: 768,
          height: 1024,
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`HF error: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function generateWithPollinations(prompt) {
  const encoded = encodeURIComponent(
    prompt + ", ultra detailed painting, sharp focus, no noise, no artifacts, no watermark, masterpiece"
  );
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=1024&model=flux&enhance=true&nologo=true&seed=${Date.now()}`;
}

// Lotus SVG icon for the button
function LotusIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="22" rx="6" ry="4" fill="rgba(212,175,55,0.3)" stroke="#D4AF37" strokeWidth="0.8"/>
      <path d="M16 22 C16 22 10 18 10 12 C10 8 13 6 16 10 C19 6 22 8 22 12 C22 18 16 22 16 22Z" fill="rgba(255,100,150,0.7)" stroke="#ff6699" strokeWidth="0.8"/>
      <path d="M16 22 C16 22 7 16 5 10 C4 6 8 4 11 8 C12 10 14 14 16 16" fill="rgba(255,150,180,0.5)" stroke="#ff88aa" strokeWidth="0.7"/>
      <path d="M16 22 C16 22 25 16 27 10 C28 6 24 4 21 8 C20 10 18 14 16 16" fill="rgba(255,150,180,0.5)" stroke="#ff88aa" strokeWidth="0.7"/>
      <path d="M16 22 C16 22 6 20 4 15 C3 11 7 9 10 13" fill="rgba(255,180,200,0.4)" stroke="#ffaabb" strokeWidth="0.6"/>
      <path d="M16 22 C16 22 26 20 28 15 C29 11 25 9 22 13" fill="rgba(255,180,200,0.4)" stroke="#ffaabb" strokeWidth="0.6"/>
      <circle cx="16" cy="16" r="2.5" fill="#D4AF37" opacity="0.9"/>
    </svg>
  );
}

export default function KrishnaDarshan() {
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [customMood, setCustomMood] = useState("");
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    const mood = selectedMood || customMood.trim();
    if (!mood) return;
    setLoading(true); setImgSrc(null); setError(""); setSource("");

    const prompt = MOOD_PROMPTS[mood]
      || `Lord Krishna in ${mood} mood, traditional Indian painting style, Rajput miniature art, intricate gold ornaments, blue divine skin, peacock feather crown, ultra detailed, sharp focus, rich jewel tones, no watermark, no noise, masterpiece`;

    // Try HF first
    try {
      const url = await generateWithHF(prompt);
      setImgSrc(url);
      setSource("Hugging Face · FLUX.1-schnell");
    } catch {
      // Fallback to Pollinations
      try {
        const url = generateWithPollinations(prompt);
        setImgSrc(url);
        setSource("Pollinations AI · FLUX (backup)");
      } catch {
        setError("Could not generate image. Please try again.");
      }
    }
    setLoading(false);
  }

  function reset() {
    setImgSrc(null); setSelectedMood(null); setCustomMood(""); setError(""); setSource("");
  }

  return (
    <>
      <style>{`
        @keyframes darshIn {
          from { opacity:0; transform:scale(0.94) translateY(20px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes shimmerLotus {
          0%,100% { box-shadow: 0 0 14px rgba(212,175,55,0.4), 0 0 6px rgba(255,100,150,0.25); }
          50%      { box-shadow: 0 0 26px rgba(212,175,55,0.7), 0 0 14px rgba(255,100,150,0.5); }
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        @keyframes moodHover {
          from { transform: translateY(0); }
          to   { transform: translateY(-2px); }
        }
        .mood-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(212,175,55,0.35) !important; }
        .mood-pill { transition: all 0.18s ease; }
      `}</style>

      {/* Floating Lotus Button */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          title="Krishna Darshan — Generate divine image"
          style={{
            position: "fixed", bottom: "8rem", right: "1.2rem",
            zIndex: 9995,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            cursor: "pointer",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(160deg, #1a0a14 0%, #020c10 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "shimmerLotus 2.5s ease-in-out infinite",
            border: "1px solid rgba(212,175,55,0.3)",
          }}>
            <LotusIcon />
          </div>
          <span style={{
            fontSize: "0.58rem", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
            letterSpacing: "0.07em", color: "rgba(212,175,55,0.75)",
            textShadow: "0 0 8px rgba(212,175,55,0.4)", whiteSpace: "nowrap",
          }}>DARSHAN</span>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9996,
          background: "rgba(1,8,14,0.97)",
          display: "flex", flexDirection: "column",
          animation: "darshIn 0.38s cubic-bezier(0.22,1,0.36,1) both",
          overflowY: "auto",
        }}>
          {/* Header */}
          <div style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(212,175,55,0.1)",
            background: "linear-gradient(135deg, rgba(2,12,16,0.98), rgba(212,175,55,0.04))",
            display: "flex", alignItems: "center", gap: "0.85rem", flexShrink: 0,
          }}>
            <LotusIcon />
            <div>
              <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.5rem", color: "#D4AF37", margin: 0, letterSpacing: "0.04em" }}>
                Krishna Darshan
              </h2>
              <p style={{ fontSize: "0.75rem", color: "rgba(212,175,55,0.45)", margin: 0 }}>
                Share your mood — receive a divine vision of Krishna
              </p>
            </div>
            <button onClick={() => { setOpen(false); reset(); }} style={{
              marginLeft: "auto", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px",
              color: "rgba(212,175,55,0.5)", padding: "0.4rem 0.9rem",
              cursor: "pointer", fontSize: "0.82rem",
              fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.05em",
            }}>✕ Close</button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: "1.5rem", maxWidth: 700, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
            {!imgSrc && !loading && (
              <>
                <p style={{ fontSize: "0.85rem", color: "rgba(212,245,238,0.55)", marginBottom: "1.25rem", textAlign: "center" }}>
                  Choose your mood or describe what you feel:
                </p>

                {/* Mood pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center", marginBottom: "1.5rem" }}>
                  {MOODS.map(mood => (
                    <button
                      key={mood}
                      className="mood-pill"
                      onClick={() => { setSelectedMood(mood); setCustomMood(""); }}
                      style={{
                        padding: "0.45rem 1rem",
                        borderRadius: "999px",
                        background: selectedMood === mood
                          ? "linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.1))"
                          : "rgba(212,175,55,0.07)",
                        border: `1px solid ${selectedMood === mood ? "rgba(212,175,55,0.7)" : "rgba(212,175,55,0.2)"}`,
                        color: selectedMood === mood ? "#D4AF37" : "rgba(212,175,55,0.6)",
                        fontSize: "0.8rem",
                        fontFamily: "'Rajdhani',sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        cursor: "pointer",
                        boxShadow: selectedMood === mood ? "0 0 12px rgba(212,175,55,0.3)" : "none",
                      }}
                    >
                      {mood}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <input
                    value={customMood}
                    onChange={e => { setCustomMood(e.target.value); setSelectedMood(null); }}
                    placeholder="Or type your own mood / feeling..."
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "rgba(212,175,55,0.05)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      borderRadius: "10px", padding: "0.65rem 1rem",
                      color: "#f0e6c8", fontSize: "0.85rem",
                      fontFamily: "inherit", outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.2)"}
                    onKeyDown={e => e.key === "Enter" && generate()}
                  />
                </div>

                {/* Generate button */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={generate}
                    disabled={!selectedMood && !customMood.trim()}
                    style={{
                      padding: "0.75rem 2.5rem",
                      background: "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))",
                      border: "1px solid rgba(212,175,55,0.5)",
                      borderRadius: "12px",
                      color: "#D4AF37",
                      fontSize: "0.95rem",
                      fontFamily: "'Rajdhani',sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      cursor: (!selectedMood && !customMood.trim()) ? "not-allowed" : "pointer",
                      opacity: (!selectedMood && !customMood.trim()) ? 0.4 : 1,
                      transition: "all 0.2s",
                      boxShadow: "0 0 18px rgba(212,175,55,0.2)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 28px rgba(212,175,55,0.45)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 18px rgba(212,175,55,0.2)"}
                  >
                    🪷 Receive Darshan
                  </button>
                </div>

                {error && (
                  <p style={{ textAlign: "center", color: "#ff6b6b", fontSize: "0.8rem", marginTop: "1rem" }}>{error}</p>
                )}
              </>
            )}

            {/* Loading state */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", paddingTop: "3rem" }}>
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: "2px solid transparent",
                    borderTop: "2px solid #D4AF37",
                    borderRight: "2px solid rgba(212,175,55,0.3)",
                    animation: "spinRing 1.2s linear infinite",
                  }} />
                  <div style={{
                    position: "absolute", inset: 10, borderRadius: "50%",
                    border: "1.5px solid transparent",
                    borderTop: "1.5px solid #ff88aa",
                    borderLeft: "1.5px solid rgba(255,136,170,0.3)",
                    animation: "spinRing 1.8s linear infinite reverse",
                  }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🪷</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "1.1rem", color: "#D4AF37", letterSpacing: "0.05em", margin: "0 0 0.25rem" }}>
                    Manifesting divine vision...
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "rgba(212,175,55,0.4)", margin: 0 }}>
                    This may take 15–30 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Image result */}
            {imgSrc && !loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
                <div style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(212,175,55,0.25)",
                  boxShadow: "0 8px 48px rgba(0,0,0,0.7), 0 0 40px rgba(212,175,55,0.1)",
                  maxWidth: 420, width: "100%",
                }}>
                  <img
                    src={imgSrc}
                    alt="Krishna Darshan"
                    style={{ width: "100%", display: "block" }}
                    onLoad={() => {}}
                  />
                </div>

                <p style={{ fontSize: "0.7rem", color: "rgba(212,175,55,0.35)", textAlign: "center", margin: 0 }}>
                  {source}
                </p>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <a
                    href={imgSrc}
                    download="krishna-darshan.jpg"
                    style={{
                      padding: "0.55rem 1.25rem",
                      background: "rgba(212,175,55,0.12)",
                      border: "1px solid rgba(212,175,55,0.35)",
                      borderRadius: "10px", color: "#D4AF37",
                      fontSize: "0.82rem", fontFamily: "'Rajdhani',sans-serif",
                      fontWeight: 600, letterSpacing: "0.05em",
                      textDecoration: "none",
                    }}
                  >
                    ⬇ Save Image
                  </a>
                  <button
                    onClick={reset}
                    style={{
                      padding: "0.55rem 1.25rem",
                      background: "rgba(0,195,137,0.08)",
                      border: "1px solid rgba(0,195,137,0.25)",
                      borderRadius: "10px", color: "#00C389",
                      fontSize: "0.82rem", fontFamily: "'Rajdhani',sans-serif",
                      fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer",
                    }}
                  >
                    🔄 New Darshan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
