import { useEffect } from "react";
import usePlayerStore from "../store/playerStore";
import { loadScript, loadTranslation, loadTimings, loadSurahs } from "../services/quranData";

export function useQuran() {
  const { selectedScript, selectedTranslation, selectedReciter, scriptData, translationData, timingsData, setScriptData, setTranslationData, setTimingsData, surahs, setSurahs } = usePlayerStore();

  // Initial load — all in parallel
  useEffect(() => {
    const promises = [];

    if (!surahs.length) promises.push(loadSurahs().then(setSurahs));

    if (!scriptData) promises.push(loadScript(selectedScript).then(setScriptData));

    if (!translationData) promises.push(loadTranslation(selectedTranslation).then(setTranslationData));

    if (!timingsData) promises.push(loadTimings(selectedReciter).then(setTimingsData));

    if (promises.length) {
      Promise.all(promises).catch((err) => console.error("Load error:", err));
    }
  }, []);

  // Reload when user changes reciter
  useEffect(() => {
    if (timingsData) return;
    loadTimings(selectedReciter).then(setTimingsData).catch(console.error);
  }, [selectedReciter]);

  // Reload when user changes script
  useEffect(() => {
    if (scriptData) return;
    loadScript(selectedScript).then(setScriptData).catch(console.error);
  }, [selectedScript]);

  // Reload when user changes translation
  useEffect(() => {
    if (translationData) return;
    loadTranslation(selectedTranslation).then(setTranslationData).catch(console.error);
  }, [selectedTranslation]);

  return {
    isLoading: !scriptData || !translationData || !timingsData || !surahs.length,
  };
}
