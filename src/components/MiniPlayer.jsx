import usePlayerStore from "../store/playerStore";

function fmt(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MiniPlayer({ onOpen, togglePlay, nextVerse, prevVerse, isBuffering }) {
  const { isPlaying, activeVerseKey, currentSurah, surahs, selectedReciter, progress, duration } = usePlayerStore();

  const surah = surahs.find((s) => s.number === currentSurah);
  const progressPct = duration ? (progress / duration) * 100 : 0;

  if (!activeVerseKey) return null;

  return (
    <div style={{ position: "absolute", bottom: "calc(var(--nav-h) + var(--sb))", left: 0, right: 0, height: "var(--mini-h)", background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 15, cursor: "pointer" }} onClick={onOpen}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--surface-3)" }}>
        <div style={{ height: "100%", background: "var(--accent)", width: `${progressPct}%`, transition: "width .1s linear" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 14px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{surah?.englishName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            <span style={{ fontSize: "11px", color: "var(--t3)" }}>{selectedReciter.name}</span>
            <span style={{ fontSize: "11px", color: "var(--border)" }}>·</span>
            <span style={{ fontSize: "11px", color: "var(--t3)", fontVariantNumeric: "tabular-nums" }}>
              {fmt(progress)} / {fmt(duration)}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            prevVerse();
          }}
          style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          style={{ background: "var(--accent)", border: "none", color: "#fff", cursor: "pointer", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          {isBuffering ? (
            <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .75s linear infinite" }} />
          ) : isPlaying ? (
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextVerse();
          }}
          style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default MiniPlayer;
