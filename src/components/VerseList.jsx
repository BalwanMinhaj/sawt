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

  return (
    <div style={{ paddingBottom: "120px" }}>
      {/* Bismillah */}
      {currentSurah !== 1 && currentSurah !== 9 && (
        <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
          <p
            style={{
              fontFamily: selectedScript.font,
              fontSize: "2.2rem",
              color: "var(--accent)",
              lineHeight: 2,
              direction: "rtl",
            }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <div style={{ width: "60px", height: "1px", background: "var(--border)", margin: "16px auto 0" }} />
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
              padding: "16px 0",
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
              transition: "opacity 0.3s ease",
              opacity: isActive ? 1 : 0.32,
            }}
          >
            <p
              style={{
                fontFamily: selectedScript.font,
                fontSize: selectedScript.id === "indopak" ? "2.1rem" : "1.9rem",
                lineHeight: 2.2,
                color: "var(--t1)",
                direction: "rtl",
                textAlign: "right",
                marginBottom: showTranslation ? "16px" : "0",
              }}
            >
              {arabicText}
            </p>

            {showTranslation && (
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "var(--t2)",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                {translation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default VerseList;
