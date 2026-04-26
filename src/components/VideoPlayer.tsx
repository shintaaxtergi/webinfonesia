"use client";

import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoUrl: string | null;
  posterUrl: string;
}

/** Extract YouTube video ID from any youtube.com/youtu.be URL */
function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?#\s]{11})/
  );
  return match ? match[1] : null;
}

/** Convert any YouTube URL to embed format */
function toEmbedUrl(url: string): string {
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
  }
  return url;
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

export default function VideoPlayer({ videoUrl, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallback = "https://www.w3schools.com/html/mov_bbb.mp4";
  const src = videoUrl || fallback;
  const isYt = isYouTubeUrl(src);
  const embedUrl = isYt ? toEmbedUrl(src) : null;

  // Reset <video> element when src changes (only for direct video files)
  useEffect(() => {
    if (!isYt && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [src, isYt]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Watermark Logo */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
        <div className="w-5 h-5 bg-red-600 text-white flex items-center justify-center font-bold text-xs rounded-full">
          N
        </div>
        <span className="text-white text-xs font-bold tracking-wider">InfoNesia</span>
      </div>

      {isYt && embedUrl ? (
        /* ── YouTube iframe ── */
        <iframe
          src={embedUrl}
          className="w-full h-full max-h-[85vh]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="InfoNesia Video"
        />
      ) : (
        /* ── Direct video file ── */
        <video
          ref={videoRef}
          className="w-full h-full max-h-[85vh] object-contain"
          controls
          playsInline
          poster={posterUrl}
        >
          <source src={src} type="video/mp4" />
          Browser Anda tidak mendukung pemutaran video.
        </video>
      )}
    </div>
  );
}
