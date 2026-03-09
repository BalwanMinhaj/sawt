import { useState, useEffect } from "react";
import { useQuran } from "./hooks/useQuran";
import { useAudio } from "./hooks/useAudio";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import PlayerSheet from "./components/PlayerSheet";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import usePlayerStore from "./store/playerStore";
import { getSurahVerseKeys } from "./services/quranData";

function App() {
  const { isLoading } = useQuran();
  const { setCurrentSurah, theme, onboardingDone, lastPlayedSurah, lastPlayedVerseKey, surahs, scriptData, selectedReciter } = usePlayerStore();
  const { togglePlay, nextVerse, prevVerse, playVerse, isBuffering } = useAudio();
  const [tab, setTab] = useState("home");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const hasPlayer = usePlayerStore((s) => s.activeVerseKey !== null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (lastPlayedVerseKey) setShowResume(true);
  }, []);

  // Close player when reciter changes
  useEffect(() => {
    setPlayerOpen(false);
  }, [selectedReciter]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (installPrompt) setShowInstall(true);
    };
    window.addEventListener("sawt:onboarding-done", handler);
    return () => window.removeEventListener("sawt:onboarding-done", handler);
  }, [installPrompt]);

  const handleSurahSelect = (num) => {
    setCurrentSurah(num);
    setPlayerOpen(true);
    setTab("home");
    const keys = getSurahVerseKeys(scriptData, num);
    if (keys.length) playVerse(keys[0]);
  };

  const handleResume = () => {
    setShowResume(false);
    setCurrentSurah(lastPlayedSurah);
    setPlayerOpen(true);
    playVerse(lastPlayedVerseKey);
  };

  if (!onboardingDone) return <Onboarding />;

  if (isLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, maxWidth: "460px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "26px", height: "26px", border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin .75s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ fontSize: "13px", color: "var(--t3)" }}>Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, maxWidth: "460px", margin: "0 auto", overflow: "hidden" }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {["home", "search", "settings"].map((pageId) => (
        <div
          key={pageId}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: hasPlayer ? "calc(var(--nav-h) + var(--mini-h) + var(--sb))" : "calc(var(--nav-h) + var(--sb))",
            background: "var(--bg)",
            overflowY: "auto",
            overflowX: "hidden",
            opacity: tab === pageId ? 1 : 0,
            pointerEvents: tab === pageId ? "all" : "none",
            transform: tab === pageId ? "none" : "translateY(6px)",
            transition: "opacity .22s ease, transform .22s ease, bottom .25s ease",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {pageId === "home" && <Home onSurahSelect={handleSurahSelect} />}
          {pageId === "search" && <Search onSurahSelect={handleSurahSelect} />}
          {pageId === "settings" && <Settings />}
        </div>
      ))}

      {/* Install prompt */}
      {showInstall && (
        <div style={{ position: "absolute", bottom: "calc(var(--nav-h) + var(--sb) + 12px)", left: "12px", right: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", zIndex: 25, boxShadow: "0 4px 24px rgba(0,0,0,.12)", animation: "slideUp .3s ease" }}>
          <div style={{ fontSize: "28px" }}>📲</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--t1)" }}>Install Sawt</div>
            <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "2px" }}>Add to home screen for the best experience</div>
          </div>
          <button
            onClick={async () => {
              setShowInstall(false);
              await installPrompt.prompt();
            }}
            style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
          >
            Install
          </button>
          <button onClick={() => setShowInstall(false)} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", padding: "4px", flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Resume prompt */}
      {showResume && !showInstall && lastPlayedVerseKey && (
        <div style={{ position: "absolute", bottom: "calc(var(--nav-h) + var(--sb) + 12px)", left: "12px", right: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", zIndex: 25, boxShadow: "0 4px 24px rgba(0,0,0,.12)", animation: "slideUp .3s ease" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", color: "var(--t3)", marginBottom: "2px" }}>Continue where you left off</div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {surahs.find((s) => s.number === lastPlayedSurah)?.englishName} · Verse {lastPlayedVerseKey.split(":")[1]}
            </div>
          </div>
          <button onClick={handleResume} style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            Resume
          </button>
          <button onClick={() => setShowResume(false)} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", flexShrink: 0, padding: "4px" }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <MiniPlayer onOpen={() => setPlayerOpen(true)} togglePlay={togglePlay} nextVerse={nextVerse} prevVerse={prevVerse} isBuffering={isBuffering} />
      <BottomNav active={tab} onChange={setTab} />
      <PlayerSheet open={playerOpen} onClose={() => setPlayerOpen(false)} togglePlay={togglePlay} nextVerse={nextVerse} prevVerse={prevVerse} playVerse={playVerse} isBuffering={isBuffering} />
    </div>
  );
}

export default App;
