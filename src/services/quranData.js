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

// ─── Reciter data ─────────────────────────────────────────────────────────────
export async function loadSurahAudio(reciter) {
  return await fetchJSON(`${reciter.dir}/surah.json`);
}

export async function loadSegments(reciter) {
  return await fetchJSON(`${reciter.dir}/segments.json`);
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getSurahVerseKeys(scriptData, surahNumber) {
  return Object.keys(scriptData).filter((key) => key.startsWith(`${surahNumber}:`));
}

export function getVerseText(scriptData, verseKey) {
  return scriptData[verseKey]?.text ?? "";
}

export function getVerseTranslation(translationData, verseKey) {
  return translationData[verseKey]?.t ?? "";
}

// Get surah audio URL from surahAudioData
export function getSurahAudioUrl(surahAudioData, surahNumber) {
  return surahAudioData[surahNumber]?.audio_url ?? null;
}

// Get verse start/end timestamps in the full surah audio (in seconds)
export function getVerseTimestamp(segmentsData, verseKey) {
  const verse = segmentsData[verseKey];
  if (!verse) return null;
  return {
    from: verse.timestamp_from / 1000,
    to: verse.timestamp_to / 1000,
  };
}

// Get word segments for a verse
export function getVerseSegments(segmentsData, verseKey) {
  return segmentsData[verseKey]?.segments ?? [];
}

// Get active word index based on current time in full surah audio (ms)
export function getActiveWordIndex(segments, currentTimeMs) {
  const active = segments.find(([_, start, end]) => currentTimeMs >= start && currentTimeMs < end);
  return active ? active[0] : null;
}

// Get active verse key based on current time in full surah audio (ms)
export function getActiveVerseKey(segmentsData, surahNumber, currentTimeMs) {
  const keys = Object.keys(segmentsData).filter((k) => k.startsWith(`${surahNumber}:`));
  for (const key of keys) {
    const verse = segmentsData[key];
    if (currentTimeMs >= verse.timestamp_from && currentTimeMs <= verse.timestamp_to) {
      return key;
    }
  }
  return null;
}
