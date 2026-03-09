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

      scriptData: null,
      translationData: null,
      surahAudioData: null,
      segmentsData: null,

      selectedReciter: DEFAULT_RECITER,
      selectedScript: DEFAULT_SCRIPT,
      selectedTranslation: DEFAULT_TRANSLATION,

      currentSurah: 1,
      currentVerseKey: "1:1",

      isPlaying: false,
      activeVerseKey: null,
      activeWordIndex: null,
      progress: 0,
      duration: 0,
      totalVerses: 0,

      showTranslation: true,
      onboardingDone: false,
      repeatMode: "off",
      playbackSpeed: 1,
      lastPlayedSurah: null,
      lastPlayedVerseKey: null,
      autoPlayNextSurah: true,

      setScriptData: (data) => set({ scriptData: data }),
      setTranslationData: (data) => set({ translationData: data }),
      setSurahAudioData: (data) => set({ surahAudioData: data }),
      setSegmentsData: (data) => set({ segmentsData: data }),

      setSelectedReciter: (reciter) => set({ selectedReciter: reciter, surahAudioData: null, segmentsData: null }),
      setSelectedScript: (script) => set({ selectedScript: script, scriptData: null }),
      setSelectedTranslation: (translation) => set({ selectedTranslation: translation, translationData: null }),

      setCurrentSurah: (surah) => set({ currentSurah: surah, currentVerseKey: `${surah}:1`, activeVerseKey: null }),
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
      setAutoPlayNextSurah: (val) => set({ autoPlayNextSurah: val }),
    }),
    {
      name: "sawt-settings-v2",
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
        autoPlayNextSurah: state.autoPlayNextSurah,
      }),
    },
  ),
);

export default usePlayerStore;
