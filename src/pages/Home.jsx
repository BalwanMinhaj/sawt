import usePlayerStore from "../store/playerStore";

function Home({ onSurahSelect }) {
  const { surahs } = usePlayerStore();

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Salam Header */}
      <div style={{ padding: "calc(var(--st) + 48px) 22px 24px" }}>
        <div
          style={{
            fontFamily: "Lora, serif",
            fontSize: "28px",
            letterSpacing: "-.5px",
            lineHeight: 1.2,
            color: "var(--t1)",
          }}
        >
          Assalamu Alaykum
        </div>
        <div style={{ marginTop: "20px" }} />
      </div>

      {/* Surahs */}
      <div style={{ padding: "0 22px" }}>
        {surahs.map((surah, i) => (
          <button
            key={surah.number}
            onClick={() => onSurahSelect(surah.number)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "13px",
              padding: "13px 0",
              background: "none",
              border: "none",
              borderBottom: i < surahs.length - 1 ? `1px solid ${(i + 1) % 10 === 0 ? "var(--surface-3)" : "var(--border)"}` : "none",
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
        ))}
      </div>
    </div>
  );
}

export default Home;
