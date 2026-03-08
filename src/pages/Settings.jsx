import { useState } from "react";
import usePlayerStore from "../store/playerStore";
import { RECITERS } from "../constants/reciters";
import { TRANSLATIONS } from "../constants/translations";
import { SCRIPTS } from "../constants/scripts";

const groupedTranslations = (filter) => {
  const filtered = TRANSLATIONS.filter((tr) => tr.name.toLowerCase().includes(filter.toLowerCase()) || tr.languageName.toLowerCase().includes(filter.toLowerCase()));
  return filtered.reduce((acc, tr) => {
    if (!acc[tr.languageName]) acc[tr.languageName] = [];
    acc[tr.languageName].push(tr);
    return acc;
  }, {});
};

const Toggle = ({ on, onClick }) => (
  <button onClick={onClick} style={{ width: "42px", height: "24px", borderRadius: "12px", background: on ? "var(--accent)" : "var(--surface-3)", border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: "50%", left: on ? "calc(100% - 21px)" : "3px", transform: "translateY(-50%)", width: "18px", height: "18px", borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,.15)", transition: "left .2s" }} />
  </button>
);

const Card = ({ children }) => <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden" }}>{children}</div>;

const Label = ({ children }) => <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "var(--t3)", marginBottom: "10px" }}>{children}</div>;

const SelectTrigger = ({ label, value, open, onToggle }) => (
  <div onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", background: open ? "var(--surface-2)" : "transparent", transition: "background .15s" }}>
    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, background: "var(--accent-s)", border: "1px solid var(--accent-m)", padding: "3px 10px", borderRadius: "20px", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
      <svg width="15" height="15" fill="none" stroke="var(--t3)" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  </div>
);

const SearchInput = ({ value, onChange, placeholder }) => (
  <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "7px 10px" }}>
      <svg width="14" height="14" fill="none" stroke="var(--t3)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onClick={(e) => e.stopPropagation()} style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "var(--t1)", width: "100%" }} />
      {value && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", padding: 0, lineHeight: 1 }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

const CheckIcon = () => (
  <svg width="15" height="15" fill="none" stroke="var(--accent)" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function Settings() {
  const { theme, setTheme, showTranslation, toggleTranslation, selectedReciter, setSelectedReciter, selectedTranslation, setSelectedTranslation, selectedScript, setSelectedScript } = usePlayerStore();

  const [reciterOpen, setReciterOpen] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [reciterSearch, setReciterSearch] = useState("");
  const [translationSearch, setTranslationSearch] = useState("");

  const filteredReciters = RECITERS.filter((r) => r.name.toLowerCase().includes(reciterSearch.toLowerCase()));

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{ padding: "calc(var(--st) + 48px) 22px 8px" }}>
        <div style={{ fontFamily: "Lora, serif", fontSize: "26px", letterSpacing: "-.3px", color: "var(--t1)" }}>Settings</div>
      </div>

      <div style={{ padding: "20px 22px 0" }}>
        <Label>Appearance</Label>
        <Card>
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>Dark Mode</div>
            <Toggle on={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} />
          </div>
        </Card>
      </div>

      <div style={{ padding: "20px 22px 0" }}>
        <Label>Arabic Script</Label>
        <Card>
          {SCRIPTS.map((script, i) => (
            <div key={script.id} onClick={() => setSelectedScript(script)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < SCRIPTS.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", background: selectedScript.id === script.id ? "var(--accent-s)" : "transparent", transition: "background .15s" }}>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>{script.name}</div>
              {selectedScript.id === script.id && <CheckIcon />}
            </div>
          ))}
        </Card>
      </div>

      <div style={{ padding: "20px 22px 0" }}>
        <Label>Translation</Label>
        <Card>
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>Show Translation</div>
            <Toggle on={showTranslation} onClick={toggleTranslation} />
          </div>
          <SelectTrigger
            label="Translation"
            value={selectedTranslation.name}
            open={translationOpen}
            onToggle={() => {
              setTranslationOpen(!translationOpen);
              setTranslationSearch("");
            }}
          />
          {translationOpen && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              <SearchInput value={translationSearch} onChange={setTranslationSearch} placeholder="Search translations…" />
              <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                {Object.entries(groupedTranslations(translationSearch)).map(([lang, items]) => (
                  <div key={lang}>
                    <div style={{ padding: "7px 16px", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--t3)", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0 }}>{lang}</div>
                    {items.map((tr) => (
                      <div
                        key={tr.id}
                        onClick={() => {
                          setSelectedTranslation(tr);
                          setTranslationOpen(false);
                          setTranslationSearch("");
                        }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: selectedTranslation.id === tr.id ? "var(--accent-s)" : "transparent", transition: "background .15s" }}
                      >
                        <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>{tr.name}</div>
                        {selectedTranslation.id === tr.id && <CheckIcon />}
                      </div>
                    ))}
                  </div>
                ))}
                {Object.keys(groupedTranslations(translationSearch)).length === 0 && <div style={{ padding: "20px 16px", fontSize: "13px", color: "var(--t3)", textAlign: "center" }}>No results</div>}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div style={{ padding: "20px 22px 0" }}>
        <Label>Reciter</Label>
        <Card>
          <SelectTrigger
            label="Reciter"
            value={selectedReciter.name.split(" ").slice(0, 2).join(" ")}
            open={reciterOpen}
            onToggle={() => {
              setReciterOpen(!reciterOpen);
              setReciterSearch("");
            }}
          />
          {reciterOpen && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              <SearchInput value={reciterSearch} onChange={setReciterSearch} placeholder="Search reciters…" />
              <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                {filteredReciters.map((reciter) => (
                  <div
                    key={reciter.id}
                    onClick={() => {
                      setSelectedReciter(reciter);
                      setReciterOpen(false);
                      setReciterSearch("");
                    }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: selectedReciter.id === reciter.id ? "var(--accent-s)" : "transparent", transition: "background .15s" }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>{reciter.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "2px" }}>{reciter.style}</div>
                    </div>
                    {selectedReciter.id === reciter.id && <CheckIcon />}
                  </div>
                ))}
                {filteredReciters.length === 0 && <div style={{ padding: "20px 16px", fontSize: "13px", color: "var(--t3)", textAlign: "center" }}>No results</div>}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div style={{ padding: "20px 22px 0" }}>
        <Label>Feedback</Label>
        <Card>
          <a href="https://forms.gle/3aZuqZc6nFFyWkqV7" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", textDecoration: "none" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>Share Feedback</div>
              <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "2px" }}>Help us improve Sawt</div>
            </div>
            <svg width="16" height="16" fill="none" stroke="var(--t3)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </Card>
      </div>

      {/* Attribution */}
      <div style={{ padding: "20px 22px 0" }}>
        <Label>Credits</Label>
        <Card>
          <a href="https://tarteel.ai" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", textDecoration: "none" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>Audio & Data</div>
              <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "2px" }}>Powered by Tarteel · QUL</div>
            </div>
            <svg width="16" height="16" fill="none" stroke="var(--t3)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
