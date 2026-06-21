import { motion } from "framer-motion";

export default function SlokaCard({ sloka, showFull = true }) {
  const chName = ["","Arjuna Visada","Sankhya","Karma","Jnana Karma","Karma Sanyasa","Dhyana","Jnana Vijnana","Akshara Brahma","Raja Vidya","Vibhuti","Vishwaroopa","Bhakti","Kshetra","Gunatraya","Purushottama","Daivasura","Shraddhatraya","Moksha Sanyasa"][sloka.ch];
  return (
    <motion.div
      className="sloka-card"
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <pre className="sloka-sanskrit devanagari">{sloka.sanskrit}</pre>
      {showFull && <p className="sloka-trans">{sloka.trans}</p>}
      {showFull && <div className="sloka-hindi devanagari">{sloka.hindi}</div>}
      <p className="sloka-meaning">{sloka.english}</p>
      <div className="sloka-meta">
        <span className="badge badge-chapter">Ch {sloka.ch}.{sloka.v} — {chName} Yoga</span>
        {sloka.themes.map(t => <span key={t} className="badge badge-theme">{t}</span>)}
      </div>
    </motion.div>
  );
}
