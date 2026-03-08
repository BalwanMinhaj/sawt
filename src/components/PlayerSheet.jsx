import { useRef } from "react";
import usePlayerStore from "../store/playerStore";
import { getSurahVerseKeys } from "../services/quranData";
import VerseList from "./VerseList";

function PlayerSheet({ open, onClose, togglePlay, nextVerse, prevVerse, playVerse }) {
  const { isPlaying, activeVerseKey, currentSurah, surahs, selectedReciter, progress, duration, totalVerses, scriptData, repeatMode, setRepeatMode, playbackSpeed, setPlaybackSpeed } = usePlayerStore();

  const surah = surahs.find((s) => s.number === currentSurah);
  const ayahNumber = activeVerseKey?.split(":")[1];

  const progressPct = () => {
    if (!activeVerseKey || !totalVerses) return 0;
    const verseIndex = parseInt(ayahNumber) - 1;
    const within = duration ? progress / duration : 0;
    return ((verseIndex + within) / totalVerses) * 100;
  };

  const handleSeek = (e) => {
    if (!scriptData || !totalVerses) return;
    const bar = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - bar.left) / bar.width));
    const target = pct * totalVerses;
    const idx = Math.floor(target);
    const within = target - idx;
    const keys = getSurahVerseKeys(scriptData, currentSurah);
    const key = keys[Math.min(idx, keys.length - 1)];
    if (key) playVerse(key, within);
  };

  const cycleRepeat = () => setRepeatMode(repeatMode === "off" ? "all" : "off");

  const speeds = [0.75, 1, 1.25, 1.5];
  const cycleSpeed = () => {
    const idx = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(idx + 1) % speeds.length]);
  };

  const RepeatIcon = () => (
    <svg width="20" height="20" fill="none" stroke={repeatMode === "all" ? "var(--accent)" : "var(--t2)"} strokeWidth="1.8" viewBox="0 0 24 24">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );

  const touchStart = useRef(0);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform .38s cubic-bezier(.32,.72,0,1)",
        paddingTop: "var(--st)",
      }}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (e.changedTouches[0].clientY - touchStart.current > 80) onClose();
      }}
    >
      {/* Handle */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0 4px" }}>
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "var(--border)" }} />
      </div>

      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "12px", padding: "4px 20px 10px" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--t1)" }}>{surah?.englishName}</div>
          <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "1px" }}>{selectedReciter.name}</div>
        </div>
        <div style={{ width: "36px" }} />
      </div>

      {/* Verse List */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 22px" }}>{open && <VerseList playVerse={playVerse} />}</div>

      {/* Controls */}
      <div style={{ flexShrink: 0, padding: "10px 22px calc(var(--sb) + 10px)", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
        {/* Progress */}
        <div style={{ marginBottom: "10px" }}>
          <div onClick={handleSeek} style={{ height: "2px", background: "var(--surface-3)", borderRadius: "2px", cursor: "pointer" }}>
            <div style={{ height: "100%", background: "var(--accent)", borderRadius: "2px", width: `${progressPct()}%`, transition: "width .1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--t3)", marginTop: "5px" }}>
            <span>{activeVerseKey ? `Verse ${ayahNumber}` : "—"}</span>
            <span>{totalVerses} verses</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            style={{
              border: "none",
              cursor: "pointer",
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: repeatMode !== "off" ? "var(--accent-s)" : "none",
              transition: "background .15s",
            }}
          >
            <RepeatIcon />
          </button>

          {/* Prev */}
          <button onClick={prevVerse} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", width: "46px", height: "46px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 18px var(--accent-m)",
            }}
          >
            {isPlaying ? (
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button onClick={nextVerse} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", width: "46px", height: "46px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
            </svg>
          </button>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            style={{
              border: "none",
              cursor: "pointer",
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: playbackSpeed !== 1 ? "var(--accent-s)" : "none",
              transition: "background .15s",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "-.3px",
                color: playbackSpeed !== 1 ? "var(--accent)" : "var(--t2)",
              }}
            >
              {playbackSpeed}x
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayerSheet;
