import { useState } from "react";
import Navbar from "./components/Navbar";
import NanotechBackground from "./components/NanotechBackground";
import IntroScreen from "./components/IntroScreen";
import NanotechAssembly from "./components/NanotechAssembly";
import HomePage from "./pages/HomePage";
import ExplorerPage from "./pages/ExplorerPage";
import SearchPage from "./pages/SearchPage";
import MapPage from "./pages/MapPage";
import BookPage from "./pages/BookPage";
import PrivacyPage from "./pages/PrivacyPage";
import KrishnaChatWidget from "./components/KrishnaChatWidget";

export default function App() {
  const [tab, setTab] = useState("home");
  const [introVisible, setIntroVisible] = useState(true);
  const [assemblyVisible, setAssemblyVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const pages = {
    home:      <HomePage />,
    explorer:  <ExplorerPage />,
    search:    <SearchPage />,
    map:       <MapPage />,
    book:      <BookPage />,
    privacy:   <PrivacyPage />,
  };

  return (
    <>
      {introVisible && (
        <IntroScreen
          onLiftStart={() => setAssemblyVisible(true)}
          onDone={() => setIntroVisible(false)}
        />
      )}
      {assemblyVisible && <NanotechAssembly onDone={() => setAssemblyVisible(false)} />}
      <NanotechBackground bgActive={!assemblyVisible && !introVisible} />

      {/* Subtle gradient overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 20% 80%, rgba(123,79,212,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 10%, rgba(0,195,137,0.06) 0%, transparent 50%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        opacity: assemblyVisible ? 0 : 1,
        transform: assemblyVisible ? "translateY(18px)" : "translateY(0)",
        transition: assemblyVisible ? "none" : "opacity 1.2s ease 0.2s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.2s",
      }}>
        <Navbar active={tab} onChange={setTab} />
        {pages[tab]}
        <footer style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 200,
          textAlign: "center",
          padding: "0.5rem 1rem",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
          background: "rgba(2,12,16,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,195,137,0.12)",
          fontSize: "0.75rem",
          color: "rgba(212,245,238,0.3)",
        }}>
          🕉 Madhav Geeta Saar &nbsp;·&nbsp;
          <button onClick={() => setTab("privacy")} style={{
            background: "none", border: "none", color: "#3DD6C8",
            cursor: "pointer", fontSize: "0.78rem", textDecoration: "underline", padding: 0,
          }}>Privacy Policy</button>
          &nbsp;·&nbsp; sr009j@gmail.com
        </footer>
      </div>

      <KrishnaChatWidget onOpenChange={setChatOpen} />
    </>
  );
}
