// src/components/VideoBackground.jsx
import React, { useEffect, useRef } from 'react';

export default function VideoBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const attemptPlay = () => {
      video
        .play()
        .catch(() => {
          /* Autoplay blocked – ignore */
        });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptPlay();
      }
    };

    const handlePause = () => {
      if (document.visibilityState === 'visible' && video.paused && !video.ended) {
        attemptPlay();
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      attemptPlay();
    };

    attemptPlay();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <img src="/Fond.png" alt="Background" className="w-full h-full object-cover" />

      {/* Overlay noir semi-transparent fixé */}
      <div className="absolute inset-0 bg-black bg-opacity-70" />
    </div>
  );
}
