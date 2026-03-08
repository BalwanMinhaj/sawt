import { useEffect, useRef, useCallback } from "react";
import usePlayerStore from "../store/playerStore";
import { getSurahVerseKeys, getSurahAudioUrl, getVerseTimestamp, getVerseSegments, getActiveWordIndex, getActiveVerseKey } from "../services/quranData";

export function useAudio() {
  const audioRef = useRef(new Audio());
  const shouldPlayRef = useRef(true);
  const activeVerseKeyRef = useRef(null);
  const currentSurahRef = useRef(null);
  const nextVerseRef = useRef(null);
  const prevVerseRef = useRef(null);

  const { surahs, selectedReciter, currentSurah, activeVerseKey, isPlaying, surahAudioData, segmentsData, scriptData, repeatMode, playbackSpeed, setIsPlaying, setActiveVerseKey, setActiveWordIndex, setProgress, setDuration, setLastPlayed } = usePlayerStore();

  // Keep refs fresh
  useEffect(() => {
    activeVerseKeyRef.current = activeVerseKey;
  }, [activeVerseKey]);
  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  // Attach audio to DOM for reliable lock screen / media session
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

  const updateMediaSession = useCallback(
    (verseKey) => {
      if (!("mediaSession" in navigator)) return;
      const audio = audioRef.current;
      const surahNum = parseInt(verseKey.split(":")[0]);
      const surahName = surahs.find((s) => s.number === surahNum)?.englishName || "Quran";

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
      navigator.mediaSession.setActionHandler("seekto", (e) => {
        if (e.seekTime !== undefined) {
          audio.currentTime = e.seekTime;
        }
      });

      // Full surah duration from audio element
      if (audio.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: audio.currentTime,
          });
        } catch (_) {}
      }
    },
    [surahs, selectedReciter, setIsPlaying],
  );

  // Load surah audio and seek to verse
  const playSurah = useCallback(
    (surahNumber, verseKey, seekPercent = 0) => {
      if (!surahAudioData || !segmentsData) return;
      const url = getSurahAudioUrl(surahAudioData, surahNumber);
      if (!url) return;

      const audio = audioRef.current;
      shouldPlayRef.current = true;

      // If same surah is already loaded, just seek
      if (audio.src && (audio.src === url || audio.src.endsWith(url.split("/").pop()))) {
        const timestamp = getVerseTimestamp(segmentsData, verseKey);
        if (timestamp) {
          if (seekPercent > 0) {
            const keys = getSurahVerseKeys(scriptData, surahNumber);
            const lastKey = keys[keys.length - 1];
            const lastTs = getVerseTimestamp(segmentsData, lastKey);
            const totalDuration = lastTs ? lastTs.to : audio.duration;
            audio.currentTime = seekPercent * totalDuration;
          } else {
            audio.currentTime = timestamp.from;
          }
          audio.playbackRate = playbackSpeed;
          audio.play().catch(() => {});
          setActiveVerseKey(verseKey);
          setIsPlaying(true);
          setLastPlayed(surahNumber, verseKey);
          updateMediaSession(verseKey);
        }
        return;
      }

      // Load new surah
      audio.pause();
      audio.oncanplay = null;
      audio.src = url;
      audio.preload = "auto";

      audio.oncanplay = () => {
        if (!shouldPlayRef.current) return;
        const timestamp = getVerseTimestamp(segmentsData, verseKey);
        if (timestamp) {
          if (seekPercent > 0) {
            audio.currentTime = seekPercent * audio.duration;
          } else {
            audio.currentTime = timestamp.from;
          }
        }
        audio.playbackRate = playbackSpeed;
        audio.play().catch(() => {});
        updateMediaSession(verseKey);
        audio.oncanplay = null;
      };

      setActiveVerseKey(verseKey);
      setIsPlaying(true);
      setLastPlayed(surahNumber, verseKey);
    },
    [surahAudioData, segmentsData, scriptData, playbackSpeed, setActiveVerseKey, setIsPlaying, setLastPlayed, updateMediaSession],
  );

  // playVerse — public API, seeks within current surah audio
  const playVerse = useCallback(
    (verseKey, seekPercent = 0) => {
      const surahNumber = parseInt(verseKey.split(":")[0]);
      playSurah(surahNumber, verseKey, seekPercent);
    },
    [playSurah],
  );

  const nextVerse = useCallback(() => {
    const keys = getVerseKeys();
    if (!keys.length) return;
    const nextIndex = keys.indexOf(activeVerseKeyRef.current) + 1;
    if (nextIndex < keys.length) {
      playVerse(keys[nextIndex]);
    } else {
      if (repeatMode === "all") {
        playVerse(keys[0]);
      } else {
        setIsPlaying(false);
        setActiveVerseKey(null);
        setActiveWordIndex(null);
      }
    }
  }, [getVerseKeys, repeatMode, playVerse, setIsPlaying, setActiveVerseKey, setActiveWordIndex]);

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

  // timeupdate — track active verse, word, progress
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!segmentsData || !scriptData) return;
      const currentMs = audio.currentTime * 1000;
      const surahNum = currentSurahRef.current;

      // Detect active verse from timestamp
      const newVerseKey = getActiveVerseKey(segmentsData, surahNum, currentMs);
      if (newVerseKey && newVerseKey !== activeVerseKeyRef.current) {
        setActiveVerseKey(newVerseKey);
        setLastPlayed(surahNum, newVerseKey);
        updateMediaSession(newVerseKey);
      }

      // Word highlighting
      const vk = newVerseKey || activeVerseKeyRef.current;
      if (vk) {
        const segments = getVerseSegments(segmentsData, vk);
        setActiveWordIndex(getActiveWordIndex(segments, currentMs));
      }

      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);

      // Update position state
      if ("mediaSession" in navigator && audio.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: audio.currentTime,
          });
        } catch (_) {}
      }
    };

    const handleEnded = () => {
      if (repeatMode === "all") {
        // Replay surah from beginning
        const keys = getVerseKeys();
        if (keys.length) playVerse(keys[0]);
      } else {
        setIsPlaying(false);
        setActiveVerseKey(null);
        setActiveWordIndex(null);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [segmentsData, scriptData, repeatMode, getVerseKeys, playVerse, updateMediaSession, setActiveVerseKey, setActiveWordIndex, setProgress, setDuration, setIsPlaying, setLastPlayed]);

  // Stop when surah changes
  useEffect(() => {
    const audio = audioRef.current;
    shouldPlayRef.current = false;
    audio.pause();
    audio.src = "";
    setIsPlaying(false);
    setActiveVerseKey(null);
    setActiveWordIndex(null);
  }, [currentSurah]);

  return { togglePlay, nextVerse, prevVerse, playVerse, audioRef };
}
