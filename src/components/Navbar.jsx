import { useState } from "react";

const LEFT_TABS = [
  { id: "home",     label: "Daily Sloka", icon: "🕉" },
  { id: "explorer", label: "Explorer",    icon: "📖" },
  { id: "search",   label: "Search",      icon: "🔍" },
  { id: "map",      label: "Map",         icon: "🗺" },
];

const ALL_TABS = [
  ...LEFT_TABS,
  { id: "book", label: "Sacred Book", icon: "📜" },
];

export default function Navbar({ active, onChange }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNav(id) {
    onChange(id);
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          {/* Brand */}
          <div className="nav-brand">
            <span className="brand-om">ॐ</span>
            <span className="brand-text">Bhagavad <em>Gita</em></span>
          </div>

          {/* Left tabs — hidden on mobile */}
          <div className="nav-tabs">
            <div className="nav-tabs-inner">
              {LEFT_TABS.map(t => (
                <button
                  key={t.id}
                  className={`nav-tab${active === t.id ? " active" : ""}`}
                  onClick={() => handleNav(t.id)}
                >
                  <span className="tab-icon">{t.icon}</span>
                  <span className="tab-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sacred Book — right, gold accent — hidden on mobile */}
          <button
            className={`nav-tab nav-tab-book${active === "book" ? " active-book" : ""}`}
            onClick={() => handleNav("book")}
          >
            <span className="tab-icon">📜</span>
            <span className="tab-label">Sacred Book</span>
          </button>

          {/* Hamburger — mobile only */}
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-inner" onClick={e => e.stopPropagation()}>
            {ALL_TABS.map(t => (
              <button
                key={t.id}
                className={`mobile-tab${active === t.id ? (t.id === "book" ? " mobile-tab-book-active" : " mobile-tab-active") : ""}${t.id === "book" ? " mobile-tab-book" : ""}`}
                onClick={() => handleNav(t.id)}
              >
                <span className="mobile-tab-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
