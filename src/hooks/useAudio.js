import { useEffect, useRef, useCallback } from "react";
import usePlayerStore from "../store/playerStore";
import { getVerseAudioUrl, getVerseSegments, getActiveWordIndex, getSurahVerseKeys } from "../services/quranData";

export function useAudio() {
  const audioRef = useRef(new Audio());
  const preloadRef = useRef(new Audio());
  const nextVerseRef = useRef(null);
  const prevVerseRef = useRef(null);
  const shouldPlayRef = useRef(true);

  const { surahs, selectedReciter, currentSurah, activeVerseKey, isPlaying, timingsData, scriptData, repeatMode, playbackSpeed, setIsPlaying, setActiveVerseKey, setActiveWordIndex, setProgress, setDuration, setLastPlayed } = usePlayerStore();

  const getVerseKeys = useCallback(() => {
    if (!scriptData) return [];
    return getSurahVerseKeys(scriptData, currentSurah);
  }, [scriptData, currentSurah]);

  const preloadNext = useCallback(
    (verseKey) => {
      if (!timingsData || !scriptData) return;
      const keys = getSurahVerseKeys(scriptData, parseInt(verseKey.split(":")[0]));
      const nextIndex = keys.indexOf(verseKey) + 1;
      if (nextIndex < keys.length) {
        const nextUrl = getVerseAudioUrl(timingsData, keys[nextIndex]);
        if (nextUrl && preloadRef.current.src !== nextUrl) {
          preloadRef.current.src = nextUrl;
          preloadRef.current.load();
        }
      }
    },
    [timingsData, scriptData],
  );

  const playVerse = useCallback(
    (verseKey, seekPercent = 0) => {
      if (!timingsData) return;
      const url = getVerseAudioUrl(timingsData, verseKey);
      if (!url) return;

      const audio = audioRef.current;
      audio.pause();
      audio.oncanplay = null;
      shouldPlayRef.current = true;

      if (preloadRef.current.src.endsWith(url.split("/").pop()) && seekPercent === 0) {
        audio.src = preloadRef.current.src;
      } else {
        audio.src = url;
      }

      audio.oncanplay = () => {
        if (!shouldPlayRef.current) return;
        if (seekPercent > 0) audio.currentTime = seekPercent * audio.duration;
        audio.playbackRate = playbackSpeed;
        audio.play();

        if ("mediaSession" in navigator) {
          const surahName = surahs.find((s) => s.number === parseInt(verseKey.split(":")[0]))?.englishName || "Quran";
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `${surahName} — Verse ${verseKey.split(":")[1]}`,
            artist: selectedReciter.name,
            album: "Sawt",
          });
          navigator.mediaSession.setActionHandler("play", () => {
            audio.play();
            setIsPlaying(true);
          });
          navigator.mediaSession.setActionHandler("pause", () => {
            audio.pause();
            setIsPlaying(false);
          });
          navigator.mediaSession.setActionHandler("nexttrack", () => nextVerseRef.current?.());
          navigator.mediaSession.setActionHandler("previoustrack", () => prevVerseRef.current?.());
        }

        audio.oncanplay = null;
        preloadNext(verseKey);
      };

      setActiveVerseKey(verseKey);
      setIsPlaying(true);
      setLastPlayed(parseInt(verseKey.split(":")[0]), verseKey);
    },
    [timingsData, surahs, selectedReciter, playbackSpeed, setActiveVerseKey, setIsPlaying, setLastPlayed, preloadNext],
  );

  const nextVerse = useCallback(() => {
    const keys = getVerseKeys();
    if (!keys.length) return;
    const nextIndex = keys.indexOf(activeVerseKey) + 1;

    if (nextIndex < keys.length) {
      const nextKey = keys[nextIndex];
      const nextUrl = getVerseAudioUrl(timingsData, nextKey);
      if (!nextUrl) return;

      const audio = audioRef.current;

      if (preloadRef.current.src && preloadRef.current.readyState >= 3) {
        audio.src = preloadRef.current.src;
        audio.playbackRate = playbackSpeed;
        audio.play();
        setActiveVerseKey(nextKey);
        setIsPlaying(true);
        setLastPlayed(parseInt(nextKey.split(":")[0]), nextKey);
        preloadNext(nextKey);
      } else {
        audio.src = nextUrl;
        audio.oncanplay = () => {
          if (!shouldPlayRef.current) return;
          audio.playbackRate = playbackSpeed;
          audio.play();
          audio.oncanplay = null;
          preloadNext(nextKey);
        };
        setActiveVerseKey(nextKey);
        setIsPlaying(true);
        setLastPlayed(parseInt(nextKey.split(":")[0]), nextKey);
      }
    } else {
      if (repeatMode === "all") {
        playVerse(keys[0]);
      } else {
        setIsPlaying(false);
        setActiveVerseKey(null);
        setActiveWordIndex(null);
      }
    }
  }, [getVerseKeys, activeVerseKey, timingsData, repeatMode, playbackSpeed, playVerse, setIsPlaying, setActiveVerseKey, setActiveWordIndex, setLastPlayed, preloadNext]);

  const prevVerse = useCallback(() => {
    const keys = getVerseKeys();
    if (!keys.length) return;
    const prevIndex = keys.indexOf(activeVerseKey) - 1;
    if (prevIndex >= 0) playVerse(keys[prevIndex]);
  }, [getVerseKeys, activeVerseKey, playVerse]);

  // Keep refs fresh
  useEffect(() => {
    nextVerseRef.current = nextVerse;
  }, [nextVerse]);
  useEffect(() => {
    prevVerseRef.current = prevVerse;
  }, [prevVerse]);

  // Apply playback speed change on the fly
  useEffect(() => {
    audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      shouldPlayRef.current = false;
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!activeVerseKey) {
        const keys = getVerseKeys();
        if (keys.length) playVerse(keys[0]);
      } else {
        shouldPlayRef.current = true;
        audio.playbackRate = playbackSpeed;
        audio.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying, activeVerseKey, playbackSpeed, getVerseKeys, playVerse, setIsPlaying]);

  // Word sync + progress
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!timingsData || !activeVerseKey) return;
      const currentMs = audio.currentTime * 1000;
      const segments = getVerseSegments(timingsData, activeVerseKey);
      setActiveWordIndex(getActiveWordIndex(segments, currentMs));
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => nextVerse();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [timingsData, activeVerseKey, nextVerse, setActiveWordIndex, setProgress, setDuration]);

  // Stop when surah changes
  useEffect(() => {
    const audio = audioRef.current;
    shouldPlayRef.current = false;
    audio.pause();
    audio.src = "";
    preloadRef.current.src = "";
    setIsPlaying(false);
    setActiveVerseKey(null);
    setActiveWordIndex(null);
  }, [currentSurah]);

  return { togglePlay, nextVerse, prevVerse, playVerse, audioRef };
}
