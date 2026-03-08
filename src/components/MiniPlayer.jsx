import usePlayerStore from "../store/playerStore";

function MiniPlayer({ onOpen, togglePlay, nextVerse }) {
  const { isPlaying, activeVerseKey, currentSurah, surahs, selectedReciter, progress, duration, totalVerses } = usePlayerStore();

  const surah = surahs.find((s) => s.number === currentSurah);
  const ayahNumber = activeVerseKey?.split(":")[1];

  const progressPct = () => {
    if (!activeVerseKey || !totalVerses) return 0;
    const verseIndex = parseInt(ayahNumber) - 1;
    const within = duration ? progress / duration : 0;
    return ((verseIndex + within) / totalVerses) * 100;
  };

  if (!activeVerseKey) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(var(--nav-h) + var(--sb))",
        left: 0,
        right: 0,
        height: "var(--mini-h)",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "0 16px",
        zIndex: 15,
        cursor: "pointer",
      }}
      onClick={onOpen}
    >
      {/* Progress line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--surface-3)" }}>
        <div style={{ height: "100%", background: "var(--accent)", width: `${progressPct()}%`, transition: "width .1s linear" }} />
      </div>

      {/* Art */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "var(--accent-s)",
          border: "1px solid var(--accent-m)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "UthmanicHafs",
          fontSize: "16px",
          color: "var(--accent)",
          flexShrink: 0,
        }}
      >
        {surah?.name?.[0] || "ب"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--t1)" }}>{surah?.englishName}</div>
        <div style={{ fontSize: "11px", color: "var(--t2)", marginTop: "1px" }}>
          {selectedReciter.name} · Verse {ayahNumber}
        </div>
      </div>

      {/* Play/Pause */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--t1)",
          cursor: "pointer",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isPlaying ? (
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextVerse();
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--t1)",
          cursor: "pointer",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginLeft: "-4px",
        }}
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
        </svg>
      </button>
    </div>
  );
}

export default MiniPlayer;
