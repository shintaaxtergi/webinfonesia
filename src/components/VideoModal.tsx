"use client";

import { useState } from "react";
import { X, PlayCircle } from "lucide-react";

interface VideoModalProps {
  videoUrl: string;
  title: string;
  categoryName?: string;
  children: React.ReactNode;
}

export default function VideoModal({ videoUrl, title, categoryName, children }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert watch URLs to embed
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtube.com/watch")) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get("v");
        return `https://www.youtube.com/embed/${v}?autoplay=1`;
      }
      if (url.includes("youtu.be/")) {
        const v = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${v}?autoplay=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer h-full">
        {children}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl flex flex-col lg:flex-row bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-[#e9421e] text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* VIDEO PLAYER */}
            <div className="w-full lg:w-2/3 aspect-video bg-black flex items-center justify-center relative">
              <iframe 
                src={getEmbedUrl(videoUrl)}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* INFO PANEL */}
            <div className="w-full lg:w-1/3 p-6 sm:p-8 flex flex-col justify-center bg-zinc-900 text-white">
              <div className="mb-4">
                <span className="px-3 py-1 bg-[#e9421e] text-white text-xs font-bold tracking-wider uppercase rounded shadow-sm inline-block mb-3">
                  {categoryName || "Video"}
                </span>
                <h2 className="font-display font-bold text-2xl lg:text-3xl leading-tight text-white mb-4">
                  {title}
                </h2>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <PlayCircle className="w-4 h-4 text-[#e9421e]" /> SEDANG DIPUTAR
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
