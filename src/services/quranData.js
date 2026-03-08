const cache = {};

const BASE = import.meta.env.BASE_URL;

async function fetchJSON(path) {
  if (cache[path]) return cache[path];
  const res = await fetch(`${BASE}${path.replace(/^\//, "")}`);
  if (!res.ok) throw new Error(`Failed to load: ${path}`);
  const data = await res.json();
  cache[path] = data;
  return data;
}

// ─── Script ───────────────────────────────────────────────────────────────────

export async function loadScript(script) {
  return await fetchJSON(script.file);
}

// ─── Translation ──────────────────────────────────────────────────────────────

export async function loadTranslation(translation) {
  return await fetchJSON(translation.file);
}

// ─── Timings ──────────────────────────────────────────────────────────────────

export async function loadTimings(reciter) {
  return await fetchJSON(reciter.timingFile);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Get all verse_keys for a surah → ["2:1", "2:2", ...]
export function getSurahVerseKeys(data, surahNumber) {
  return Object.keys(data).filter((key) => key.startsWith(`${surahNumber}:`));
}

// Get arabic text for a verse
export function getVerseText(scriptData, verseKey) {
  return scriptData[verseKey]?.text ?? "";
}

// Get translation text for a verse
export function getVerseTranslation(translationData, verseKey) {
  return translationData[verseKey]?.t ?? "";
}

// Get audio URL for a verse
export function getVerseAudioUrl(timingsData, verseKey) {
  return timingsData[verseKey]?.audio_url ?? null;
}

// Get word segments for a verse → [[index, start_ms, end_ms], ...]
export function getVerseSegments(timingsData, verseKey) {
  return timingsData[verseKey]?.segments ?? [];
}

// Get active word index within a verse based on current audio time
export function getActiveWordIndex(segments, currentTimeMs) {
  const active = segments.find(([_, start, end]) => currentTimeMs >= start && currentTimeMs < end);
  return active ? active[0] : null;
}

// ─── Surah List ───────────────────────────────────────────────────────────────

export async function loadSurahs() {
  const res = await fetch("https://api.quran.com/api/v4/chapters?language=en");
  if (!res.ok) throw new Error("Failed to load surah list");
  const data = await res.json();
  return data.chapters.map((s) => ({
    number: s.id,
    name: s.name_arabic,
    englishName: s.name_simple,
    versesCount: s.verses_count,
    revelationType: s.revelation_place,
  }));
}

/*
What Each Function Does

fetchJSON()          → fetches any JSON file, caches it so it's never fetched twice
loadScript()         → loads Arabic text data
loadTranslation()    → loads translation data  
loadTimings()        → loads reciter timing data
getSurahVerses()     → filters all ayahs for surah 2, 3 etc
getSurahTranslation()→ same but for translation
getSurahTimings()    → same but for timings
getActiveVerse()     → the core sync function — takes currentTime, returns verse_key
*/
