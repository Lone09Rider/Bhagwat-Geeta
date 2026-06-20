import { useRef, useEffect, useCallback, useState } from "react";
import { SLOKAS, WALLPAPER_THEMES } from "../data/slokas";

export default function WallpaperPage() {
  const canvasRef = useRef();
  const [themeIdx, setThemeIdx] = useState(0);
  const [slokaIdx, setSlokaIdx] = useState(0);

  const sloka = SLOKAS[slokaIdx];
  const theme = WALLPAPER_THEMES[themeIdx];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = theme.accent + "25";
    ctx.lineWidth = 55;
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.42, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = theme.accent + "55";
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.47, 0, Math.PI * 2); ctx.stroke();

    ctx.font = "bold 80px serif";
    ctx.fillStyle = theme.accent + "35";
    ctx.textAlign = "center";
    ctx.fillText("ॐ", W / 2, 90);

    ctx.font = "bold 21px serif";
    ctx.fillStyle = theme.accent;
    ctx.textAlign = "center";
    sloka.sanskrit.split("\n").forEach((line, i) => ctx.fillText(line, W / 2, H * 0.28 + i * 35));

    ctx.strokeStyle = theme.accent + "70";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.5); ctx.lineTo(W * 0.8, H * 0.5); ctx.stroke();

    ctx.font = "16px serif";
    ctx.fillStyle = theme.text + "BB";
    const words = sloka.english.split(" ");
    let line = "", y = H * 0.54;
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > W * 0.75 && line) {
        ctx.fillText(line, W / 2, y); y += 26; line = word;
      } else { line = test; }
    }
    if (line) { ctx.fillText(line, W / 2, y); y += 26; }

    y += 12;
    ctx.font = "italic 14px serif";
    ctx.fillStyle = theme.accent;
    ctx.fillText(`— Bhagavad Gita ${sloka.ch}.${sloka.v}`, W / 2, y);

    ctx.font = "11px sans-serif";
    ctx.fillStyle = theme.text + "45";
    ctx.fillText("🕉 Bhagavad Gita Wisdom", W / 2, H - 20);
  }, [sloka, theme]);

  useEffect(() => { draw(); }, [draw]);

  const download = () => {
    const a = document.createElement("a");
    a.download = `gita-${sloka.ch}-${sloka.v}.png`;
    a.href = canvasRef.current.toDataURL();
    a.click();
  };

  return (
    <div className="page">
      <h2 className="section-title">Wisdom Wallpaper</h2>
      <p className="section-sub">Generate and download shareable Gita sloka image cards</p>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", marginBottom: "1rem" }}>
            <canvas ref={canvasRef} width={600} height={520} style={{ width: "100%", display: "block" }} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={download}>⬇ Download PNG</button>
            <button className="btn btn-outline" onClick={draw}>↺ Refresh</button>
          </div>
        </div>

        <div style={{ width: "240px" }}>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Color Theme</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {WALLPAPER_THEMES.map((t, i) => (
                <button
                  key={i}
                  title={t.name}
                  onClick={() => setThemeIdx(i)}
                  style={{
                    width: "30px", height: "30px", borderRadius: "50%", border: `2.5px solid ${themeIdx === i ? t.accent : "transparent"}`,
                    background: t.bg, cursor: "pointer", transform: themeIdx === i ? "scale(1.15)" : "scale(1)", transition: "transform 0.15s"
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>{theme.name}</p>
          </div>

          <div className="card">
            <p style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Choose Sloka</p>
            <select
              style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "0.75rem" }}
              value={slokaIdx}
              onChange={e => setSlokaIdx(Number(e.target.value))}
            >
              {SLOKAS.map((s, i) => (
                <option key={s.id} value={i}>Ch {s.ch}.{s.v} — {s.english.substring(0, 38)}…</option>
              ))}
            </select>
            <button className="btn btn-outline" style={{ width: "100%", fontSize: "0.82rem" }}
              onClick={() => setSlokaIdx(Math.floor(Math.random() * SLOKAS.length))}>
              🎲 Random sloka
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
