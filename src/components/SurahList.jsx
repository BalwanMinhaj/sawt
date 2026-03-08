import { useState } from "react";
import usePlayerStore from "../store/playerStore";

function SurahList({ onSelect }) {
  const { surahs, currentSurah, selectedScript } = usePlayerStore();
  const [search, setSearch] = useState("");

  const filtered = surahs.filter((s) => s.englishName.toLowerCase().includes(search.toLowerCase()) || s.number.toString().includes(search));

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Search */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1C1814" }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#141210",
            border: "1px solid #2a2520",
            borderRadius: "6px",
            padding: "8px 12px",
            color: "#E8E0D4",
            fontFamily: "Cormorant Garamond",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((surah) => {
          const isActive = currentSurah === surah.number;
          return (
            <button
              key={surah.number}
              onClick={() => onSelect(surah.number)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 20px",
                background: isActive ? "#141210" : "transparent",
                borderLeft: `2px solid ${isActive ? "#C9A84C" : "transparent"}`,
                cursor: "pointer",
                transition: "all 0.15s",
                border: "none",
                borderLeft: `2px solid ${isActive ? "#C9A84C" : "transparent"}`,
              }}
            >
              {/* Number */}
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: isActive ? "#1e1a14" : "#111009",
                  color: isActive ? "#C9A84C" : "#3a3530",
                  fontSize: "0.7rem",
                  flexShrink: 0,
                  fontFamily: "Cormorant Garamond",
                }}
              >
                {surah.number}
              </span>

              {/* English Name */}
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontFamily: "Cormorant Garamond",
                  fontSize: "0.95rem",
                  color: isActive ? "#E8E0D4" : "#6a6560",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {surah.englishName}
              </span>

              {/* Arabic Name */}
              <span
                style={{
                  fontFamily: selectedScript.font,
                  fontSize: "1rem",
                  color: isActive ? "#C9A84C" : "#2a2520",
                  flexShrink: 0,
                }}
              >
                {surah.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SurahList;
