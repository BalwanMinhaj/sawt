import { useEffect, useRef } from "react";
import usePlayerStore from "../store/playerStore";
import { getSurahVerseKeys, getVerseText, getVerseTranslation } from "../services/quranData";

function VerseList({ playVerse }) {
  const { currentSurah, scriptData, translationData, activeVerseKey, showTranslation, selectedScript, setTotalVerses } = usePlayerStore();

  const activeRef = useRef(null);

  useEffect(() => {
    if (!scriptData) return;
    const keys = getSurahVerseKeys(scriptData, currentSurah);
    setTotalVerses(keys.length);
  }, [currentSurah, scriptData]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeVerseKey]);

  if (!scriptData || !translationData) return null;

  const verseKeys = getSurahVerseKeys(scriptData, currentSurah);
  const hasActive = activeVerseKey !== null;

  return (
    <div style={{ paddingBottom: "140px" }}>
      {/* Bismillah */}
      {currentSurah !== 1 && currentSurah !== 9 && (
        <div style={{ textAlign: "center", padding: "32px 16px 28px" }}>
          <p
            style={{
              fontFamily: selectedScript.font,
              fontSize: "2rem",
              color: "var(--accent)",
              lineHeight: 2,
              direction: "rtl",
              opacity: 0.9,
            }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

      {verseKeys.map((verseKey) => {
        const isActive = activeVerseKey === verseKey;
        const arabicText = getVerseText(scriptData, verseKey);
        const translation = getVerseTranslation(translationData, verseKey);
        const ayahNumber = verseKey.split(":")[1];

        return (
          <div
            key={verseKey}
            ref={isActive ? activeRef : null}
            onClick={() => playVerse(verseKey)}
            style={{
              padding: "20px 4px",
              cursor: "pointer",
              transition: "opacity .4s ease, filter .4s ease, transform .4s ease",
              opacity: !hasActive ? 1 : isActive ? 1 : 0.25,
              filter: !hasActive ? "none" : isActive ? "none" : "blur(0.6px)",
              transform: isActive ? "scale(1.01)" : "scale(1)",
              transformOrigin: "right center",
            }}
          >
            {/* Arabic text */}
            <p
              style={{
                fontFamily: selectedScript.font,
                fontSize: selectedScript.id === "indopak" ? "2.1rem" : "1.95rem",
                lineHeight: 2.3,
                color: isActive ? "var(--t1)" : "var(--t1)",
                direction: "rtl",
                textAlign: "right",
                marginBottom: 0,
                transition: "font-size .3s ease",
              }}
            >
              {arabicText}
            </p>

            {/* Translation */}
            {showTranslation && (
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.75,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: isActive ? "var(--t2)" : "var(--t3)",
                  marginTop: "14px",
                  direction: "ltr",
                  textAlign: "left",
                  transition: "color .4s ease",
                }}
              >
                {translation}
              </p>
            )}

            {/* Active indicator line */}
            {isActive && (
              <div
                style={{
                  height: "1.5px",
                  background: "linear-gradient(to left, var(--accent), transparent)",
                  marginTop: "16px",
                  borderRadius: "2px",
                  opacity: 0.6,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default VerseList;
