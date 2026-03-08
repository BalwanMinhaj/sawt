import { useEffect } from "react";
import usePlayerStore from "../store/playerStore";
import { loadScript, loadTranslation, loadSurahAudio, loadSegments, loadSurahs } from "../services/quranData";

export function useQuran() {
  const { selectedScript, selectedTranslation, selectedReciter, scriptData, translationData, surahAudioData, segmentsData, setScriptData, setTranslationData, setSurahAudioData, setSegmentsData, surahs, setSurahs } = usePlayerStore();

  // Initial load — all in parallel
  useEffect(() => {
    const promises = [];
    if (!surahs.length) promises.push(loadSurahs().then(setSurahs));
    if (!scriptData) promises.push(loadScript(selectedScript).then(setScriptData));
    if (!translationData) promises.push(loadTranslation(selectedTranslation).then(setTranslationData));
    if (!surahAudioData) promises.push(loadSurahAudio(selectedReciter).then(setSurahAudioData));
    if (!segmentsData) promises.push(loadSegments(selectedReciter).then(setSegmentsData));
    if (promises.length) Promise.all(promises).catch(console.error);
  }, []);

  // Reload when reciter changes
  useEffect(() => {
    if (surahAudioData && segmentsData) return;
    const promises = [];
    if (!surahAudioData) promises.push(loadSurahAudio(selectedReciter).then(setSurahAudioData));
    if (!segmentsData) promises.push(loadSegments(selectedReciter).then(setSegmentsData));
    if (promises.length) Promise.all(promises).catch(console.error);
  }, [selectedReciter]);

  // Reload when script changes
  useEffect(() => {
    if (scriptData) return;
    loadScript(selectedScript).then(setScriptData).catch(console.error);
  }, [selectedScript]);

  // Reload when translation changes
  useEffect(() => {
    if (translationData) return;
    loadTranslation(selectedTranslation).then(setTranslationData).catch(console.error);
  }, [selectedTranslation]);

  return {
    isLoading: !scriptData || !translationData || !surahAudioData || !segmentsData || !surahs.length,
  };
}
