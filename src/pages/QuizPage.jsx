import { useState, useCallback } from "react";
import { SLOKAS } from "../data/slokas";

export default function QuizPage() {
  const [mode, setMode] = useState("menu");
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  const generateQ = useCallback(() => {
    const sloka = SLOKAS[Math.floor(Math.random() * SLOKAS.length)];
    const others = SLOKAS.filter(s => s.id !== sloka.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...others.map(s => s.english), sloka.english].sort(() => Math.random() - 0.5);
    setCurrent(sloka);
    setOptions(opts);
    setSelected(null);
  }, []);

  const start = () => { setScore(0); setTotal(0); setMode("playing"); generateQ(); };

  const answer = opt => {
    if (selected) return;
    setSelected(opt);
    setTotal(t => t + 1);
    if (opt === current.english) setScore(s => s + 1);
  };

  const next = () => { if (total >= 10) { setMode("result"); return; } generateQ(); };

  if (mode === "menu") return (
    <div className="page" style={{ textAlign: "center", paddingTop: "4rem" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏆</div>
      <h2 className="section-title">Sloka Quiz</h2>
      <p className="section-sub" style={{ marginBottom: "2rem" }}>Test your knowledge of the Bhagavad Gita's teachings</p>
      <div className="grid-3" style={{ maxWidth: "700px", margin: "0 auto 2rem" }}>
        {[["📝","Match the Meaning","Read a Sanskrit sloka and choose the correct English meaning"],
          ["⚡","10 Questions","Complete 10 questions and see your final score"],
          ["📖","Learn as you play","Every answer reveals the Hindi meaning too"]
        ].map(([icon,title,desc]) => (
          <div key={title} className="card" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{title}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{desc}</div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ padding: "0.8rem 2.5rem", fontSize: "1rem" }} onClick={start}>Start Quiz</button>
    </div>
  );

  if (mode === "result") return (
    <div className="page" style={{ textAlign: "center", paddingTop: "4rem" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{score >= 8 ? "🌟" : score >= 5 ? "⭐" : "🙏"}</div>
      <h2 className="section-title">Quiz Complete!</h2>
      <div style={{ fontSize: "3.5rem", fontFamily: "Georgia,serif", fontWeight: 700, color: "var(--saffron)", margin: "1rem 0" }}>{score} / {total}</div>
      <p style={{ color: "var(--muted)", marginBottom: "0.75rem" }}>
        {score >= 8 ? "Excellent! You have deep knowledge of the Gita." : score >= 5 ? "Good effort! Keep studying the slokas." : "Keep practicing. The Gita reveals itself slowly."}
      </p>
      <p className="devanagari" style={{ fontSize: "1.2rem", color: "var(--deep2)", margin: "1rem 0" }}>अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते</p>
      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "2rem" }}>"Through practice and detachment, the mind can be controlled." — Gita 6.35</p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={start}>Play Again</button>
        <button className="btn btn-outline" onClick={() => setMode("menu")}>Back to Menu</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Sloka Quiz</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Question {total + 1} of 10</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.6rem", fontFamily: "Georgia,serif", fontWeight: 700, color: "var(--saffron)" }}>{score}/{total}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Score</div>
        </div>
      </div>

      <div style={{ width: "100%", height: "6px", background: "var(--border)", borderRadius: "3px", marginBottom: "2rem" }}>
        <div style={{ width: `${total * 10}%`, height: "100%", background: "var(--saffron)", borderRadius: "3px", transition: "width 0.4s" }} />
      </div>

      {current && (
        <>
          <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--saffron)" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem" }}>Bhagavad Gita {current.ch}.{current.v}</p>
            <pre className="sloka-sanskrit devanagari">{current.sanskrit}</pre>
            <p className="sloka-trans" style={{ marginBottom: 0 }}>{current.trans}</p>
          </div>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "var(--deep2)" }}>What does this sloka mean?</p>
          {options.map((opt, i) => {
            let cls = "quiz-option";
            if (selected) {
              if (opt === current.english) cls += " correct";
              else if (opt === selected) cls += " wrong";
            }
            return <button key={i} className={cls} onClick={() => answer(opt)}>{opt}</button>;
          })}
          {selected && (
            <div style={{ marginTop: "1.25rem" }}>
              <div className="sloka-hindi devanagari" style={{ marginBottom: "1rem" }}>{current.hindi}</div>
              <button className="btn btn-primary" onClick={next}>
                {total >= 9 ? "See Results" : "Next Question →"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
