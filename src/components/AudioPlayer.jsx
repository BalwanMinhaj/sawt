import usePlayerStore from "../store/playerStore";
import { useAudio } from "../hooks/useAudio";
import { getSurahVerseKeys } from "../services/quranData";

function AudioPlayer() {
  const { isPlaying, activeVerseKey, currentSurah, surahs, selectedReciter, progress, duration, totalVerses, scriptData } = usePlayerStore();

  const { togglePlay, nextVerse, prevVerse, playVerse } = useAudio();

  const surah = surahs.find((s) => s.number === currentSurah);
  const ayahNumber = activeVerseKey?.split(":")[1];

  const getSurahProgress = () => {
    if (!activeVerseKey || !totalVerses) return 0;
    const verseIndex = parseInt(ayahNumber) - 1;
    const withinVerse = duration ? progress / duration : 0;
    return ((verseIndex + withinVerse) / totalVerses) * 100;
  };

  const handleSeek = (e) => {
    if (!scriptData || !totalVerses) return;
    const bar = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bar.left) / bar.width;
    const targetPosition = percent * totalVerses;
    const targetVerseIndex = Math.floor(targetPosition);
    const withinVerse = targetPosition - targetVerseIndex;
    const keys = getSurahVerseKeys(scriptData, currentSurah);
    const targetKey = keys[Math.min(targetVerseIndex, keys.length - 1)];
    if (targetKey) playVerse(targetKey, withinVerse);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0A0806",
        borderTop: "1px solid #1C1814",
        padding: "12px 32px 16px",
        zIndex: 50,
      }}
    >
      {/* Progress */}
      <div
        onClick={handleSeek}
        style={{
          height: "2px",
          background: "#1C1814",
          borderRadius: "1px",
          cursor: "pointer",
          marginBottom: "14px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${getSurahProgress()}%`,
            background: "#C9A84C",
            borderRadius: "1px",
            transition: "width 0.3s",
          }}
        />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Info */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "1rem",
              color: "#E8E0D4",
              fontWeight: 500,
            }}
          >
            {surah?.englishName}
          </p>
          <p
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              color: "#3a3530",
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            {activeVerseKey ? `Verse ${ayahNumber} of ${totalVerses}` : `${totalVerses} verses`}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button onClick={prevVerse} style={{ background: "none", border: "none", cursor: "pointer", color: "#3a3530", padding: 0, transition: "color 0.15s" }} onMouseEnter={(e) => (e.target.style.color = "#E8E0D4")} onMouseLeave={(e) => (e.target.style.color = "#3a3530")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#C9A84C",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#D4B85C")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#C9A84C")}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#0A0806">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#0A0806">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button onClick={nextVerse} style={{ background: "none", border: "none", cursor: "pointer", color: "#3a3530", padding: 0, transition: "color 0.15s" }} onMouseEnter={(e) => (e.target.style.color = "#E8E0D4")} onMouseLeave={(e) => (e.target.style.color = "#3a3530")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2.5-6 6-4.5v9L8.5 12zM16 6h2v12h-2z" />
            </svg>
          </button>
        </div>

        {/* Reciter */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <p
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "0.85rem",
              color: "#3a3530",
              fontStyle: "italic",
            }}
          >
            {selectedReciter.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
