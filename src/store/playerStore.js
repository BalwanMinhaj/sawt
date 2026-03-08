import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_RECITER } from "../constants/reciters";
import { DEFAULT_SCRIPT } from "../constants/scripts";
import { DEFAULT_TRANSLATION } from "../constants/translations";

const usePlayerStore = create(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      surahs: [],
      setSurahs: (surahs) => set({ surahs }),

      // ─── Quran Data ─────────────────────────────────────────────────────────
      scriptData: null,
      translationData: null,
      timingsData: null,

      // ─── User Selections ────────────────────────────────────────────────────
      selectedReciter: DEFAULT_RECITER,
      selectedScript: DEFAULT_SCRIPT,
      selectedTranslation: DEFAULT_TRANSLATION,

      // ─── Navigation ─────────────────────────────────────────────────────────
      currentSurah: 1,
      currentVerseKey: "1:1",

      // ─── Playback ───────────────────────────────────────────────────────────
      isPlaying: false,
      activeVerseKey: null,
      activeWordIndex: null,
      progress: 0,
      duration: 0,
      totalVerses: 0,

      // ─── UI ─────────────────────────────────────────────────────────────────
      showTranslation: true,
      onboardingDone: false,
      repeatMode: "off", // "off" | "all"
      playbackSpeed: 1,
      lastPlayedSurah: null,
      lastPlayedVerseKey: null,

      // ─── Actions ────────────────────────────────────────────────────────────
      setScriptData: (data) => set({ scriptData: data }),
      setTranslationData: (data) => set({ translationData: data }),
      setTimingsData: (data) => set({ timingsData: data }),

      setSelectedReciter: (reciter) => set({ selectedReciter: reciter, timingsData: null }),
      setSelectedScript: (script) => set({ selectedScript: script, scriptData: null }),
      setSelectedTranslation: (translation) => set({ selectedTranslation: translation, translationData: null }),

      setCurrentSurah: (surah) =>
        set({
          currentSurah: surah,
          currentVerseKey: `${surah}:1`,
          activeVerseKey: null,
        }),
      setCurrentVerseKey: (key) => set({ currentVerseKey: key }),

      setIsPlaying: (val) => set({ isPlaying: val }),
      setActiveVerseKey: (key) => set({ activeVerseKey: key }),
      setActiveWordIndex: (index) => set({ activeWordIndex: index }),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      setTotalVerses: (total) => set({ totalVerses: total }),

      setOnboardingDone: () => set({ onboardingDone: true }),
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      setLastPlayed: (surah, verseKey) => set({ lastPlayedSurah: surah, lastPlayedVerseKey: verseKey }),
      toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
    }),
    {
      name: "sawt-settings",
      partialize: (state) => ({
        theme: state.theme,
        selectedReciter: state.selectedReciter,
        selectedScript: state.selectedScript,
        selectedTranslation: state.selectedTranslation,
        showTranslation: state.showTranslation,
        onboardingDone: state.onboardingDone,
        repeatMode: state.repeatMode,
        playbackSpeed: state.playbackSpeed,
        lastPlayedSurah: state.lastPlayedSurah,
        lastPlayedVerseKey: state.lastPlayedVerseKey,
      }),
    },
  ),
);

export default usePlayerStore;
