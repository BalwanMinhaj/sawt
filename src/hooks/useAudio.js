import { useEffect, useRef, useCallback } from "react";
import usePlayerStore from "../store/playerStore";
import { getVerseAudioUrl, getVerseSegments, getActiveWordIndex, getSurahVerseKeys } from "../services/quranData";

export function useAudio() {
  const audioRef = useRef(new Audio());
  const preloadRef = useRef(new Audio());
  const nextVerseRef = useRef(null);
  const prevVerseRef = useRef(null);
  const shouldPlayRef = useRef(true);
  const activeVerseKeyRef = useRef(null);

  const { surahs, selectedReciter, currentSurah, activeVerseKey, isPlaying, timingsData, scriptData, repeatMode, playbackSpeed, setIsPlaying, setActiveVerseKey, setActiveWordIndex, setProgress, setDuration, setLastPlayed, totalVerses } = usePlayerStore();

  // Keep activeVerseKey in a ref so event handlers always have fresh value
  useEffect(() => {
    activeVerseKeyRef.current = activeVerseKey;
  }, [activeVerseKey]);

  // Attach audio element to DOM for consistent media session / lock screen
  useEffect(() => {
    const audio = audioRef.current;
    audio.style.display = "none";
    document.body.appendChild(audio);
    return () => {
      if (document.body.contains(audio)) document.body.removeChild(audio);
    };
  }, []);

  const getVerseKeys = useCallback(() => {
    if (!scriptData) return [];
    return getSurahVerseKeys(scriptData, currentSurah);
  }, [scriptData, currentSurah]);

  // Sum verse durations for surah-level position state
  const getSurahDuration = useCallback(() => {
    if (!timingsData || !scriptData) return 0;
    const keys = getSurahVerseKeys(scriptData, currentSurah);
    return keys.reduce((sum, k) => sum + (timingsData[k]?.duration ?? 0) / 1000, 0);
  }, [timingsData, scriptData, currentSurah]);

  const getSurahPosition = useCallback(
    (verseKey, currentTime) => {
      if (!timingsData || !scriptData) return 0;
      const keys = getSurahVerseKeys(scriptData, currentSurah);
      const idx = keys.indexOf(verseKey);
      const elapsed = keys.slice(0, idx).reduce((sum, k) => sum + (timingsData[k]?.duration ?? 0) / 1000, 0);
      return elapsed + currentTime;
    },
    [timingsData, scriptData, currentSurah],
  );

  const updateMediaSession = useCallback(
    (verseKey) => {
      if (!("mediaSession" in navigator)) return;
      const audio = audioRef.current;
      const surahName = surahs.find((s) => s.number === parseInt(verseKey.split(":")[0]))?.englishName || "Quran";
      navigator.mediaSession.metadata = new MediaMetadata({
        title: surahName,
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

      const total = getSurahDuration();
      if (total > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: total,
            playbackRate: audio.playbackRate || 1,
            position: getSurahPosition(verseKey, audio.currentTime),
          });
        } catch (_) {}
      }
    },
    [surahs, selectedReciter, getSurahDuration, getSurahPosition, setIsPlaying],
  );

  const preloadNext = useCallback(
    (verseKey) => {
      if (!timingsData || !scriptData) return;
      const keys = getSurahVerseKeys(scriptData, parseInt(verseKey.split(":")[0]));
      const nextIndex = keys.indexOf(verseKey) + 1;
      if (nextIndex < keys.length) {
        const nextUrl = getVerseAudioUrl(timingsData, keys[nextIndex]);
        if (nextUrl && preloadRef.current.src !== nextUrl) {
          preloadRef.current.src = nextUrl;
          preloadRef.current.preload = "auto";
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

      // Use preloaded if available and no seek
      const preloadUrl = preloadRef.current.src;
      if (seekPercent === 0 && preloadUrl && (preloadUrl === url || preloadUrl.endsWith(url.split("/").pop())) && preloadRef.current.readyState >= 2) {
        audio.src = preloadUrl;
      } else {
        audio.src = url;
      }

      audio.oncanplay = () => {
        if (!shouldPlayRef.current) return;
        if (seekPercent > 0) audio.currentTime = seekPercent * (audio.duration || 0);
        audio.playbackRate = playbackSpeed;
        audio.play().catch(() => {});
        updateMediaSession(verseKey);
        audio.oncanplay = null;
        preloadNext(verseKey);
      };

      setActiveVerseKey(verseKey);
      setIsPlaying(true);
      setLastPlayed(parseInt(verseKey.split(":")[0]), verseKey);
    },
    [timingsData, playbackSpeed, setActiveVerseKey, setIsPlaying, setLastPlayed, updateMediaSession, preloadNext],
  );

  const nextVerse = useCallback(() => {
    const keys = getVerseKeys();
    if (!keys.length) return;
    const currentKey = activeVerseKeyRef.current;
    const nextIndex = keys.indexOf(currentKey) + 1;

    if (nextIndex < keys.length) {
      const nextKey = keys[nextIndex];
      const nextUrl = getVerseAudioUrl(timingsData, nextKey);
      if (!nextUrl) return;

      const audio = audioRef.current;
      const preload = preloadRef.current;

      if (preload.src && (preload.src === nextUrl || preload.src.endsWith(nextUrl.split("/").pop())) && preload.readyState >= 3) {
        // Preloaded and ready — swap immediately for minimal gap
        audio.src = preload.src;
        audio.playbackRate = playbackSpeed;
        audio.play().catch(() => {});
        setActiveVerseKey(nextKey);
        setIsPlaying(true);
        setLastPlayed(parseInt(nextKey.split(":")[0]), nextKey);
        updateMediaSession(nextKey);
        preloadNext(nextKey);
      } else {
        // Fallback
        audio.src = nextUrl;
        audio.playbackRate = playbackSpeed;
        audio.oncanplay = () => {
          if (!shouldPlayRef.current) return;
          audio.play().catch(() => {});
          audio.oncanplay = null;
          updateMediaSession(nextKey);
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
  }, [getVerseKeys, timingsData, repeatMode, playbackSpeed, playVerse, setIsPlaying, setActiveVerseKey, setActiveWordIndex, setLastPlayed, updateMediaSession, preloadNext]);

  const prevVerse = useCallback(() => {
    const keys = getVerseKeys();
    if (!keys.length) return;
    const prevIndex = keys.indexOf(activeVerseKeyRef.current) - 1;
    if (prevIndex >= 0) playVerse(keys[prevIndex]);
  }, [getVerseKeys, playVerse]);

  useEffect(() => {
    nextVerseRef.current = nextVerse;
  }, [nextVerse]);
  useEffect(() => {
    prevVerseRef.current = prevVerse;
  }, [prevVerse]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      shouldPlayRef.current = false;
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!activeVerseKeyRef.current) {
        const keys = getVerseKeys();
        if (keys.length) playVerse(keys[0]);
      } else {
        shouldPlayRef.current = true;
        audio.playbackRate = playbackSpeed;
        audio.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [isPlaying, playbackSpeed, getVerseKeys, playVerse, setIsPlaying]);

  // Word sync + progress + position state update
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      const vk = activeVerseKeyRef.current;
      if (!timingsData || !vk) return;
      const currentMs = audio.currentTime * 1000;
      const segments = getVerseSegments(timingsData, vk);
      setActiveWordIndex(getActiveWordIndex(segments, currentMs));
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);

      // Preload next when 70% through current verse
      if (audio.duration && audio.currentTime / audio.duration > 0.7) {
        preloadNext(vk);
      }

      // Update position state every few seconds
      if (Math.round(audio.currentTime) % 3 === 0 && "mediaSession" in navigator) {
        const total = getSurahDuration();
        if (total > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: total,
              playbackRate: audio.playbackRate || 1,
              position: getSurahPosition(vk, audio.currentTime),
            });
          } catch (_) {}
        }
      }
    };

    const handleEnded = () => nextVerseRef.current?.();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [timingsData, preloadNext, getSurahDuration, getSurahPosition, setActiveWordIndex, setProgress, setDuration]);

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
