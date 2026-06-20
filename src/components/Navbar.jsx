const LEFT_TABS = [
  { id: "home",     label: "Daily Sloka", icon: "🕉" },
  { id: "explorer", label: "Explorer",    icon: "📖" },
  { id: "search",   label: "Search",      icon: "🔍" },
  { id: "map",      label: "Map",         icon: "🗺" },
];

export default function Navbar({ active, onChange }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        {/* Brand */}
        <div className="nav-brand">
          <span className="brand-om">ॐ</span>
          <span className="brand-text">Bhagavad <em>Gita</em></span>
        </div>

        {/* Left tabs */}
        <div className="nav-tabs">
          <div className="nav-tabs-inner">
            {LEFT_TABS.map(t => (
              <button
                key={t.id}
                className={`nav-tab${active === t.id ? " active" : ""}`}
                onClick={() => onChange(t.id)}
              >
                <span className="tab-icon">{t.icon}</span>
                <span className="tab-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sacred Book — right, gold accent */}
        <button
          className={`nav-tab nav-tab-book${active === "book" ? " active-book" : ""}`}
          onClick={() => onChange("book")}
        >
          <span className="tab-icon">📜</span>
          <span className="tab-label">Sacred Book</span>
        </button>
      </div>
    </nav>
  );
}
