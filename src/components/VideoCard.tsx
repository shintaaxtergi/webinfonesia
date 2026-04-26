import Image from "next/image";
import { Play } from "lucide-react";
import VideoModal from "./VideoModal";

interface VideoCardProps {
  article: any;
  isFeatured?: boolean;
}

function getYoutubeThumbnail(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
}

export default function VideoCard({ article, isFeatured = false }: VideoCardProps) {
  const imageUrl = 
    article.featuredImage?.url || 
    getYoutubeThumbnail(article.videoUrl) || 
    article.ogImageUrl || 
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop";

  return (
    <VideoModal 
      videoUrl={article.videoUrl || ""} 
      title={article.title} 
      categoryName={article.category?.name}
    >
      <div className={`group flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden ${isFeatured ? 'md:flex-row' : ''}`}>
        {/* THUMBNAIL */}
        <div className={`relative overflow-hidden bg-gray-900 ${isFeatured ? 'w-full md:w-2/3 aspect-video' : 'w-full aspect-[16/9]'}`}>
          <Image 
            src={imageUrl} 
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 group-hover:opacity-80 transition-all duration-500 ease-in-out"
          />
          
          {/* PLAY ICON OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" fill="currentColor" />
            </div>
          </div>

          {/* DURATION BADGE */}
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
             03:45 {/* Static duration for demo since we don't fetch duration from YouTube API */}
          </div>
        </div>
        
        {/* CONTENT */}
        <div className={`flex flex-col flex-grow ${isFeatured ? 'w-full md:w-1/3 p-6 md:p-8 justify-center bg-gray-50' : 'p-5'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-[#e9421e]">
              {article.category?.name || "Video"}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[10px] sm:text-xs font-medium text-gray-500">
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h3 className={`font-display font-bold leading-tight group-hover:text-[#e9421e] transition-colors text-ink ${isFeatured ? 'text-2xl md:text-3xl mb-4' : 'text-lg mb-2 line-clamp-2'}`}>
            {article.title}
          </h3>
          {isFeatured && article.excerpt && (
            <p className="text-gray-600 text-sm md:text-base line-clamp-3">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>
    </VideoModal>
  );
}
