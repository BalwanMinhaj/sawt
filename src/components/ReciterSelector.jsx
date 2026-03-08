import { useState } from "react";
import usePlayerStore from "../store/playerStore";
import { RECITERS } from "../constants/reciters";
import { SCRIPTS } from "../constants/scripts";
import { TRANSLATIONS } from "../constants/translations";

function ReciterSelector() {
  const [open, setOpen] = useState(false);

  const { selectedReciter, selectedScript, selectedTranslation, showTranslation, setSelectedReciter, setSelectedScript, setSelectedTranslation, toggleTranslation } = usePlayerStore();

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "1px solid #2a2520",
          borderRadius: "6px",
          padding: "7px 14px",
          color: "#6a6560",
          fontFamily: "Cormorant Garamond",
          fontSize: "0.85rem",
          letterSpacing: "0.08em",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#C9A84C";
          e.currentTarget.style.color = "#C9A84C";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#2a2520";
          e.currentTarget.style.color = "#6a6560";
        }}
      >
        Settings
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 50,
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "300px",
          background: "#0A0806",
          borderLeft: "1px solid #1C1814",
          zIndex: 51,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px",
            borderBottom: "1px solid #1C1814",
          }}
        >
          <p
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "1rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#6a6560",
            }}
          >
            Settings
          </p>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#3a3530", cursor: "pointer", fontSize: "1.2rem" }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Reciter */}
          <div>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a3530", marginBottom: "12px", fontFamily: "Cormorant Garamond" }}>Reciter</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {RECITERS.map((reciter) => {
                const isSelected = selectedReciter.id === reciter.id;
                return (
                  <button
                    key={reciter.id}
                    onClick={() => setSelectedReciter(reciter)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      background: isSelected ? "#141210" : "transparent",
                      border: "none",
                      borderLeft: `2px solid ${isSelected ? "#C9A84C" : "transparent"}`,
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontFamily: "Cormorant Garamond", fontSize: "0.95rem", color: isSelected ? "#E8E0D4" : "#6a6560" }}>{reciter.name}</p>
                      <p style={{ fontSize: "0.7rem", color: "#3a3530", marginTop: "1px" }}>{reciter.style}</p>
                    </div>
                    <span style={{ fontFamily: selectedScript.font, fontSize: "0.9rem", color: isSelected ? "#C9A84C" : "#2a2520" }}>{reciter.arabicName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Script */}
          <div>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a3530", marginBottom: "12px", fontFamily: "Cormorant Garamond" }}>Script</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {SCRIPTS.map((script) => {
                const isSelected = selectedScript.id === script.id;
                return (
                  <button
                    key={script.id}
                    onClick={() => setSelectedScript(script)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: isSelected ? "#141210" : "transparent",
                      border: `1px solid ${isSelected ? "#C9A84C40" : "#1C1814"}`,
                      borderRadius: "4px",
                      color: isSelected ? "#C9A84C" : "#3a3530",
                      fontFamily: "Cormorant Garamond",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {script.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Translation */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a3530", fontFamily: "Cormorant Garamond" }}>Translation</p>
              <button
                onClick={toggleTranslation}
                style={{
                  padding: "3px 10px",
                  background: showTranslation ? "#141210" : "transparent",
                  border: `1px solid ${showTranslation ? "#C9A84C40" : "#1C1814"}`,
                  borderRadius: "4px",
                  color: showTranslation ? "#C9A84C" : "#3a3530",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  fontFamily: "Cormorant Garamond",
                  letterSpacing: "0.1em",
                }}
              >
                {showTranslation ? "On" : "Off"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {TRANSLATIONS.map((translation) => {
                const isSelected = selectedTranslation.id === translation.id;
                return (
                  <button
                    key={translation.id}
                    onClick={() => setSelectedTranslation(translation)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      background: isSelected ? "#141210" : "transparent",
                      border: "none",
                      borderLeft: `2px solid ${isSelected ? "#C9A84C" : "transparent"}`,
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    <p style={{ fontFamily: "Cormorant Garamond", fontSize: "0.95rem", color: isSelected ? "#E8E0D4" : "#6a6560" }}>{translation.name}</p>
                    <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a3530" }}>{translation.language}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReciterSelector;
