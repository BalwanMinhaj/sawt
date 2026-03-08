import { useState } from "react";
import usePlayerStore from "../store/playerStore";
import { RECITERS } from "../constants/reciters";
import { SCRIPTS } from "../constants/scripts";
import { TRANSLATIONS } from "../constants/translations";
import { loadScript, loadTranslation, loadTimings, loadSurahs } from "../services/quranData";

const STEPS = ["reciter", "script", "translation"];

const groupByLanguage = (list) =>
  list.reduce((acc, tr) => {
    if (!acc[tr.languageName]) acc[tr.languageName] = [];
    acc[tr.languageName].push(tr);
    return acc;
  }, {});

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "9px 12px", marginBottom: "14px" }}>
    <svg width="14" height="14" fill="none" stroke="var(--t3)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "var(--t1)", width: "100%" }} />
    {value && (
      <button onClick={() => onChange("")} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", padding: 0, lineHeight: 1 }}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    )}
  </div>
);

function Onboarding() {
  const { selectedReciter, setSelectedReciter, selectedScript, setSelectedScript, selectedTranslation, setSelectedTranslation, setScriptData, setTranslationData, setTimingsData, setSurahs, setOnboardingDone } = usePlayerStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reciterSearch, setReciterSearch] = useState("");
  const [translationSearch, setTranslationSearch] = useState("");

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const filteredReciters = RECITERS.filter((r) => r.name.toLowerCase().includes(reciterSearch.toLowerCase()));

  const filteredTranslations = groupByLanguage(TRANSLATIONS.filter((tr) => tr.name.toLowerCase().includes(translationSearch.toLowerCase()) || tr.languageName.toLowerCase().includes(translationSearch.toLowerCase())));

  const handleNext = () => {
    if (!isLast) {
      setStep(step + 1);
    } else {
      handleStart();
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setProgress(0);
    const tasks = [
      loadSurahs().then((d) => {
        setSurahs(d);
        setProgress((p) => p + 25);
      }),
      loadScript(selectedScript).then((d) => {
        setScriptData(d);
        setProgress((p) => p + 25);
      }),
      loadTranslation(selectedTranslation).then((d) => {
        setTranslationData(d);
        setProgress((p) => p + 25);
      }),
      loadTimings(selectedReciter).then((d) => {
        setTimingsData(d);
        setProgress((p) => p + 25);
      }),
    ];
    try {
      await Promise.all(tasks);
      setOnboardingDone();
      window.dispatchEvent(new Event("sawt:onboarding-done"));
    } catch (err) {
      console.error("Failed to load:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, maxWidth: "460px", margin: "0 auto", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <div style={{ fontFamily: "UthmanicHafs", fontSize: "48px", color: "var(--accent)", marginBottom: "32px", direction: "rtl" }}>صوت</div>
        <div style={{ width: "100%", marginBottom: "16px" }}>
          <div style={{ height: "3px", background: "var(--surface-3)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--accent)", width: `${progress}%`, transition: "width .4s ease", borderRadius: "3px" }} />
          </div>
        </div>
        <div style={{ fontSize: "13px", color: "var(--t3)" }}>{progress < 100 ? "Preparing your experience…" : "Almost ready…"}</div>
      </div>
    );
  }

  const RadioDot = ({ active }) => (
    <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
      {active && (
        <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, maxWidth: "460px", margin: "0 auto", background: "var(--bg)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Top */}
      <div style={{ padding: "60px 28px 24px" }}>
        <div style={{ fontFamily: "UthmanicHafs", fontSize: "36px", color: "var(--accent)", direction: "rtl", marginBottom: "6px" }}>صوت</div>
        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "26px", letterSpacing: "-.5px", color: "var(--t1)", lineHeight: 1.2, marginBottom: "8px" }}>
          {currentStep === "reciter" && "Choose your reciter"}
          {currentStep === "script" && "Choose Arabic script"}
          {currentStep === "translation" && "Choose translation"}
        </div>
        <div style={{ fontSize: "14px", color: "var(--t2)", lineHeight: 1.6 }}>
          {currentStep === "reciter" && "The voice you'll hear reciting the Quran."}
          {currentStep === "script" && "The style of Arabic text displayed on screen."}
          {currentStep === "translation" && "Shown below each verse as you listen."}
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "20px" }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ height: "3px", width: i === step ? "20px" : "8px", borderRadius: "3px", background: i <= step ? "var(--accent)" : "var(--surface-3)", transition: "all .3s ease" }} />
          ))}
        </div>
      </div>

      {/* Options */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 28px" }}>
        {/* Reciter */}
        {currentStep === "reciter" && (
          <>
            <SearchBar value={reciterSearch} onChange={setReciterSearch} placeholder="Search reciters…" />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredReciters.map((reciter) => {
                const isActive = selectedReciter.id === reciter.id;
                return (
                  <div key={reciter.id} onClick={() => setSelectedReciter(reciter)} style={{ padding: "16px", borderRadius: "var(--r)", border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`, background: isActive ? "var(--accent-s)" : "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .15s" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--t1)" }}>{reciter.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "3px" }}>{reciter.style}</div>
                    </div>
                    <RadioDot active={isActive} />
                  </div>
                );
              })}
              {filteredReciters.length === 0 && <div style={{ padding: "20px 0", fontSize: "13px", color: "var(--t3)", textAlign: "center" }}>No results</div>}
            </div>
          </>
        )}

        {/* Script */}
        {currentStep === "script" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {SCRIPTS.map((script) => {
              const isActive = selectedScript.id === script.id;
              return (
                <div key={script.id} onClick={() => setSelectedScript(script)} style={{ padding: "16px", borderRadius: "var(--r)", border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`, background: isActive ? "var(--accent-s)" : "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .15s" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--t1)" }}>{script.name}</div>
                    <div style={{ fontFamily: script.font, fontSize: "18px", color: "var(--t2)", marginTop: "6px", direction: "rtl", lineHeight: 1.8 }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
                  </div>
                  <RadioDot active={isActive} />
                </div>
              );
            })}
          </div>
        )}

        {/* Translation */}
        {currentStep === "translation" && (
          <>
            <SearchBar value={translationSearch} onChange={setTranslationSearch} placeholder="Search translations…" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {Object.entries(filteredTranslations).map(([lang, items]) => (
                <div key={lang}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--t3)", marginBottom: "8px" }}>{lang}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {items.map((tr) => {
                      const isActive = selectedTranslation.id === tr.id;
                      return (
                        <div key={tr.id} onClick={() => setSelectedTranslation(tr)} style={{ padding: "14px 16px", borderRadius: "var(--r)", border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`, background: isActive ? "var(--accent-s)" : "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .15s" }}>
                          <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--t1)" }}>{tr.name}</div>
                          <RadioDot active={isActive} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.keys(filteredTranslations).length === 0 && <div style={{ padding: "20px 0", fontSize: "13px", color: "var(--t3)", textAlign: "center" }}>No results</div>}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "24px 28px calc(var(--sb) + 32px)" }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{ width: "100%", padding: "14px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--r)", cursor: "pointer", fontSize: "15px", fontWeight: 500, color: "var(--t2)", marginBottom: "10px" }}>
            Back
          </button>
        )}
        <button onClick={handleNext} style={{ width: "100%", padding: "16px", background: "var(--accent)", color: "white", border: "none", borderRadius: "var(--r)", cursor: "pointer", fontSize: "15px", fontWeight: 600, letterSpacing: ".2px", boxShadow: "0 4px 18px var(--accent-m)" }}>
          {isLast ? "Start Listening" : "Continue"}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;
