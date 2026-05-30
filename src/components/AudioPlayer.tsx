"use client";

import React, { useState, useEffect, useRef } from "react";

interface Track {
  id: number;
  title: string;
  composer: string;
  show: string;
  src: string;
}

const TRACKS: Track[] = [
  {
    id: 1,
    title: "Carmen - Act I: Habanera",
    composer: "Georges Bizet",
    show: "Carmen",
    src: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Bizet_-_Carmen_-_Act_I_-_Habanera.ogg",
  },
  {
    id: 2,
    title: "La Traviata - Act I: Libiamo ne' lieti calici",
    composer: "Giuseppe Verdi",
    show: "La Traviata",
    src: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Giuseppe_Verdi_-_Libiamo_ne%27_lieti_calici.ogg",
  },
  {
    id: 3,
    title: "Swan Lake - Act I: No. 2 Waltz",
    composer: "Pyotr Ilyich Tchaikovsky",
    show: "El Lago de los Cisnes",
    src: "https://upload.wikimedia.org/wikipedia/commons/d/df/Tchaikovsky_-_Swan_Lake_-_Act_I%2C_No._2_Waltz.ogg",
  },
];

export default function AudioPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Reset progress and load new track
    if (audioRef.current) {
      audioRef.current.src = currentTrack.src;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.error("Audio playback error:", err);
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    handleNext();
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ease-in-out ${
        isExpanded ? "w-80 md:w-96" : "w-14 h-14 rounded-full overflow-hidden"
      }`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {isExpanded ? (
        // Expanded Luxury Player
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col gap-4 border border-[rgba(186,154,99,0.25)] bg-[rgba(15,3,5,0.9)] shadow-2xl rounded-2xl">
          {/* Spotlight aura */}
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[rgba(186,154,99,0.1)] blur-2xl pointer-events-none" />

          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-[rgba(186,154,99,0.1)] pb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--camel)] font-semibold">
              OPERA PRIMA PLAY
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-[var(--smoky-rose)] hover:text-[var(--eggshell)] transition-colors p-1"
              aria-label="Minimizar reproductor"
            >
              ✕
            </button>
          </div>

          {/* Track details & Visualizer */}
          <div className="flex items-center gap-4">
            {/* Visualizer animation */}
            <div className="w-12 h-12 rounded-lg bg-[rgba(115,28,43,0.2)] border border-[rgba(186,154,99,0.15)] flex items-center justify-center relative overflow-hidden shrink-0">
              <div className="flex items-end gap-[3px] h-6 w-8 justify-center">
                <span
                  className={`w-[3px] bg-[var(--camel)] rounded-full transition-all ${
                    isPlaying ? "animate-bar1" : "h-1"
                  }`}
                />
                <span
                  className={`w-[3px] bg-[var(--camel)] rounded-full transition-all ${
                    isPlaying ? "animate-bar2" : "h-2"
                  }`}
                />
                <span
                  className={`w-[3px] bg-[var(--camel)] rounded-full transition-all ${
                    isPlaying ? "animate-bar3" : "h-1"
                  }`}
                />
                <span
                  className={`w-[3px] bg-[var(--camel)] rounded-full transition-all ${
                    isPlaying ? "animate-bar4" : "h-3"
                  }`}
                />
              </div>
            </div>

            {/* Title */}
            <div className="overflow-hidden flex flex-col justify-center">
              <h4 className="text-sm font-semibold truncate text-[var(--eggshell)]">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[var(--smoky-rose)] truncate">
                {currentTrack.composer} • <span className="italic">{currentTrack.show}</span>
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div
              ref={progressRef}
              onClick={handleProgressBarClick}
              className="h-1.5 w-full bg-[rgba(241,233,218,0.1)] rounded-full overflow-hidden cursor-pointer relative group"
            >
              <div
                className="h-full bg-gradient-to-r from-[var(--burnt-rose)] to-[var(--camel)] rounded-full relative"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--smoky-rose)] font-light">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="flex items-center justify-between mt-1">
            {/* Volume Control */}
            <div className="flex items-center gap-2 w-20">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-[var(--smoky-rose)] hover:text-[var(--camel)]"
                aria-label={isMuted ? "Activar sonido" : "Silenciar"}
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.63 3.63L2.37 4.89 7.48 10H4v4h3l5 5v-5.11l4.07 4.07C15.18 18.59 14.13 19 13 19v2c1.9 0 3.62-.68 4.96-1.81l2.15 2.15 1.26-1.26L3.63 3.63zM10 15.17L7.83 13H6v-2h1.83l.17-.17 2 2v2.34zM12 4L9.91 6.09 12 8.18V4zm4 8c0-1.77-1.02-3.29-2.5-4.03v2.28l2.48 2.48c.01-.25.02-.48.02-.73zm2 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C19.57 14.82 20 13.46 20 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-full accent-[var(--camel)] h-1 bg-[rgba(241,233,218,0.1)] rounded-full appearance-none outline-none cursor-pointer"
              />
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="text-[var(--smoky-rose)] hover:text-[var(--camel)] transition-colors p-1"
                aria-label="Pista anterior"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[var(--burnt-rose)] hover:bg-[var(--camel)] text-[var(--eggshell)] hover:text-[#0c0204] flex items-center justify-center border border-[rgba(186,154,99,0.3)] shadow-[0_0_10px_rgba(135,75,82,0.3)] transition-all transform hover:scale-105"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 fill-current translate-x-[1px]" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                className="text-[var(--smoky-rose)] hover:text-[var(--camel)] transition-colors p-1"
                aria-label="Siguiente pista"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6zm9-12v12h2V6z" />
                </svg>
              </button>
            </div>

            {/* Tracks count */}
            <span className="text-[10px] text-[var(--camel)] font-medium">
              {currentTrackIndex + 1}/{TRACKS.length}
            </span>
          </div>
        </div>
      ) : (
        // Circular Floating Button Player (Minimized)
        <button
          onClick={() => setIsExpanded(true)}
          className="w-14 h-14 rounded-full bg-[var(--dark-amaranth)] hover:bg-[var(--burnt-rose)] border border-[var(--camel)] flex items-center justify-center shadow-2xl relative transition-all duration-300 transform hover:scale-110 group animate-float"
          aria-label="Abrir reproductor de música"
        >
          {/* Pulsing ring */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border border-[var(--camel)] animate-ping opacity-75" />
          )}

          {/* Visualizer bars or music icon */}
          {isPlaying ? (
            <div className="flex items-end gap-[2px] h-4">
              <span className="w-[2px] h-2 bg-[var(--eggshell)] rounded-full animate-bar1" />
              <span className="w-[2px] h-3 bg-[var(--eggshell)] rounded-full animate-bar2" />
              <span className="w-[2px] h-1 bg-[var(--eggshell)] rounded-full animate-bar3" />
            </div>
          ) : (
            <svg
              className="w-5 h-5 text-[var(--eggshell)] group-hover:text-[var(--camel)] transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </button>
      )}

      {/* Tailwind-like animation helpers specifically written in standard CSS as fallback or injected */}
      <style jsx global>{`
        @keyframes playBar1 {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        @keyframes playBar2 {
          0%, 100% { height: 6px; }
          50% { height: 22px; }
        }
        @keyframes playBar3 {
          0%, 100% { height: 8px; }
          50% { height: 12px; }
        }
        @keyframes playBar4 {
          0%, 100% { height: 5px; }
          50% { height: 18px; }
        }
        .animate-bar1 {
          animation: playBar1 1s ease-in-out infinite;
        }
        .animate-bar2 {
          animation: playBar2 1.2s ease-in-out infinite;
        }
        .animate-bar3 {
          animation: playBar3 0.8s ease-in-out infinite;
        }
        .animate-bar4 {
          animation: playBar4 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
