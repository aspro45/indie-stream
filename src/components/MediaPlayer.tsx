"use client";

import React, { useRef, useState, useEffect } from "react";

interface MediaPlayerProps {
  src: string;
  type: "audio" | "video";
  title: string;
  mimeType: string;
}

export default function MediaPlayer({ src, type, title, mimeType }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const onLoadedMetadata = () => {
      setDuration(media.duration);
      setIsLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(media.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setError("Failed to load media. The file may not be available on the Shelby network yet.");
      setIsLoading(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    media.addEventListener("loadedmetadata", onLoadedMetadata);
    media.addEventListener("timeupdate", onTimeUpdate);
    media.addEventListener("play", onPlay);
    media.addEventListener("pause", onPause);
    media.addEventListener("ended", onEnded);
    media.addEventListener("error", onError);
    media.addEventListener("waiting", onWaiting);
    media.addEventListener("canplay", onCanPlay);

    return () => {
      media.removeEventListener("loadedmetadata", onLoadedMetadata);
      media.removeEventListener("timeupdate", onTimeUpdate);
      media.removeEventListener("play", onPlay);
      media.removeEventListener("pause", onPause);
      media.removeEventListener("ended", onEnded);
      media.removeEventListener("error", onError);
      media.removeEventListener("waiting", onWaiting);
      media.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;
    const time = parseFloat(e.target.value);
    media.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;
    const vol = parseFloat(e.target.value);
    media.volume = vol;
    setVolume(vol);
  };

  const toggleFullscreen = () => {
    const container = document.querySelector(".player__video-wrapper");
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="player player--error">
        <div className="player__error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`player player--${type}`}>
      {/* Media Element */}
      {type === "video" ? (
        <div className="player__video-wrapper" onClick={togglePlay}>
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            className="player__video"
            preload="metadata"
          >
            <source src={src} type={mimeType} />
          </video>
          {isLoading && (
            <div className="player__loading">
              <div className="player__spinner" />
            </div>
          )}
          {!isPlaying && !isLoading && (
            <div className="player__big-play">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div className="player__audio-visual">
          <div className="player__audio-art">
            <div className={`player__disc ${isPlaying ? "player__disc--spinning" : ""}`}>
              <div className="player__disc-inner">🎵</div>
            </div>
          </div>
          <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} preload="metadata">
            <source src={src} type={mimeType} />
          </audio>
        </div>
      )}

      {/* Controls */}
      <div className="player__controls">
        <button className="player__play-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <span className="player__time">{formatTime(currentTime)}</span>

        <input
          type="range"
          className="player__seek"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
        />

        <span className="player__time">{formatTime(duration)}</span>

        <div className="player__volume">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
            {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
          </svg>
          <input
            type="range"
            className="player__volume-slider"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolume}
          />
        </div>

        {type === "video" && (
          <button className="player__fullscreen-btn" onClick={toggleFullscreen} title="Fullscreen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
