export default function SlokaCard({ sloka, showFull = true }) {
  const chName = ["","Arjuna Visada","Sankhya","Karma","Jnana Karma","Karma Sanyasa","Dhyana","Jnana Vijnana","Akshara Brahma","Raja Vidya","Vibhuti","Vishwaroopa","Bhakti","Kshetra","Gunatraya","Purushottama","Daivasura","Shraddhatraya","Moksha Sanyasa"][sloka.ch];
  return (
    <div className="sloka-card">
      <pre className="sloka-sanskrit devanagari">{sloka.sanskrit}</pre>
      {showFull && <p className="sloka-trans">{sloka.trans}</p>}
      {showFull && <div className="sloka-hindi devanagari">{sloka.hindi}</div>}
      <p className="sloka-meaning">{sloka.english}</p>
      <div className="sloka-meta">
        <span className="badge badge-chapter">Ch {sloka.ch}.{sloka.v} — {chName} Yoga</span>
        {sloka.themes.map(t => <span key={t} className="badge badge-theme">{t}</span>)}
      </div>
    </div>
  );
}
