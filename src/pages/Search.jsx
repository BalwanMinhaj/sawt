import { useState } from "react";
import usePlayerStore from "../store/playerStore";

function Search({ onSurahSelect }) {
  const { surahs } = usePlayerStore();
  const [query, setQuery] = useState("");

  const results = query.trim() ? surahs.filter((s) => s.englishName.toLowerCase().includes(query.toLowerCase()) || s.number.toString() === query.trim()) : [];

  return (
    <div>
      {/* Search Field */}
      <div style={{ padding: "calc(var(--st) + 48px) 22px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r)",
            padding: "13px 14px",
          }}
        >
          <svg width="16" height="16" fill="none" stroke="var(--t3)" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Surah name or number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "15px",
              color: "var(--t1)",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "0 22px" }}>
        {!query.trim() ? (
          <div style={{ textAlign: "center", padding: "44px 24px", color: "var(--t3)", fontSize: "14px", lineHeight: 1.7 }}>
            <div style={{ fontSize: "18px", color: "var(--t2)", marginBottom: "6px", fontWeight: 600 }}>Search surahs</div>
            Try "Al-Kahf", "36", or "Rahman"
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 24px", color: "var(--t3)", fontSize: "14px" }}>
            No results for "<strong>{query}</strong>"
          </div>
        ) : (
          results.map((surah) => (
            <button
              key={surah.number}
              onClick={() => onSurahSelect(surah.number)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "13px",
                padding: "13px 0",
                borderBottom: "1px solid var(--border)",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--t2)",
                  flexShrink: 0,
                }}
              >
                {surah.number}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t1)" }}>{surah.englishName}</div>
                <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "2px" }}>
                  {surah.versesCount} verses · {surah.revelationType}
                </div>
              </div>
              <div style={{ fontFamily: "UthmanicHafs", fontSize: "16px", color: "var(--t2)", direction: "rtl", flexShrink: 0 }}>{surah.name}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default Search;
