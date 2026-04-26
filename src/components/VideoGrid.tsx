"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle, Play } from "lucide-react";
import VideoModal from "./VideoModal";

interface VideoGridProps {
  heroVideo: any;
  carouselVideos: any[];
}

export default function VideoGrid({ heroVideo, carouselVideos }: VideoGridProps) {
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  
  // Combine all videos for easy navigation
  const allVideos = [heroVideo, ...carouselVideos];

  const handleOpenModal = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setActiveVideoIndex(index);
  };

  const handleCloseModal = () => {
    setActiveVideoIndex(null);
  };

  const handleNext = () => {
    if (activeVideoIndex !== null && activeVideoIndex < allVideos.length - 1) {
      setActiveVideoIndex(activeVideoIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeVideoIndex !== null && activeVideoIndex > 0) {
      setActiveVideoIndex(activeVideoIndex - 1);
    }
  };

  const getImageUrl = (article: any) => {
    if (article.featuredImage?.url) return article.featuredImage.url;
    if (article.ogImageUrl) return article.ogImageUrl;
    if (article.videoUrl) {
      const match = article.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    return "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HERO VIDEO */}
      <div className="flex flex-col md:flex-row bg-black rounded-xl overflow-hidden shadow-sm h-auto md:h-[380px] lg:h-[420px]">
        {/* Left: Thumbnail */}
        <div 
          className="relative w-full md:w-[60%] lg:w-[65%] h-[240px] md:h-full group cursor-pointer flex-shrink-0"
          onClick={(e) => handleOpenModal(e, 0)}
        >
          <div className="block w-full h-full">
            <img 
              src={getImageUrl(heroVideo)} 
              alt={heroVideo.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-[#e9421e] transition-colors">
                <PlayCircle className="text-white w-10 h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Box */}
        <div className="w-full md:w-[40%] lg:w-[35%] p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <span className="text-[#e9421e] font-bold text-xs tracking-widest uppercase mb-3">
            ENAM+
          </span>
          <div 
            onClick={(e) => handleOpenModal(e, 0)} 
            className="group cursor-pointer"
          >
            <h3 className="font-display font-bold text-white text-xl md:text-2xl lg:text-[26px] leading-snug mb-5 group-hover:text-[#e9421e] transition-colors line-clamp-4">
              {heroVideo.title}
            </h3>
          </div>
          <Link 
            href="/video"
            suppressHydrationWarning
            className="inline-block border border-gray-700 text-white font-medium px-5 py-2.5 rounded-full hover:bg-white hover:text-black hover:border-white transition-all w-fit text-xs mt-2"
          >
            Tonton Selengkapnya
          </Link>
        </div>
      </div>

      {/* CAROUSEL VIDEOS */}
      {carouselVideos.length > 0 && (
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {carouselVideos.map((video, idx) => {
            const actualIndex = idx + 1; // +1 because hero is 0
            return (
              <div 
                key={video.id}
                onClick={(e) => handleOpenModal(e, actualIndex)}
                className="group relative flex-none w-[160px] md:w-[220px] aspect-[9/16] rounded-xl overflow-hidden shadow-sm snap-start cursor-pointer"
              >
                <img 
                  src={getImageUrl(video)} 
                  alt={video.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                <div className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="text-white w-4 h-4 ml-0.5" />
                </div>

                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <span className="inline-block px-2 py-1 bg-[#e9421e] text-white text-[10px] font-bold rounded mb-2 uppercase shadow-sm">
                    {video.category?.name || "Video"}
                  </span>
                  <h4 className="text-white font-medium text-sm line-clamp-3 leading-snug group-hover:text-[#e9421e] transition-colors">
                    {video.title}
                  </h4>
                  {/* Fake Duration for UI */}
                  <span className="text-gray-300 text-xs mt-2 block font-mono bg-black/50 w-fit px-2 py-0.5 rounded">03:45</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER MODAL */}
      <VideoModal 
        isOpen={activeVideoIndex !== null}
        onClose={handleCloseModal}
        video={activeVideoIndex !== null ? allVideos[activeVideoIndex] : null}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={activeVideoIndex !== null && activeVideoIndex < allVideos.length - 1}
        hasPrev={activeVideoIndex !== null && activeVideoIndex > 0}
      />
    </div>
  );
}
