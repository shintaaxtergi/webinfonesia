"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import VideoModal from "@/components/VideoModal";

interface VideoNews {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  publishedAt: string | null;
  createdAt: string;
  category?: { name: string; slug: string };
  featuredImage?: { url: string };
  ogImageUrl?: string;
  status: string;
}

export default function VideoNewsTable() {
  const [videos, setVideos] = useState<VideoNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("infonesia_token");
      
      try {
        const res = await fetch(`/api/video-news?status=ALL`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Respon server bukan format JSON yang valid");
        }

        if (!res.ok) {
          throw new Error(data.errors?.[0] || data.message || "Gagal mengambil data dari server");
        }

        setVideos(data.data || []);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Apakah yakin mau menghapus berita video ini? Data tidak dapat dikembalikan.")) return;

    const token = localStorage.getItem("infonesia_token");
    try {
      const res = await fetch(`/api/v1/articles/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setVideos((prev) => prev.filter((v: any) => v.slug !== slug));
      } else {
        const data = await res.json();
        window.alert("Gagal menghapus: " + (data.errors?.join("\n") || data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("[DELETE] Fetch Error:", err);
      window.alert("Terjadi kesalahan sistem saat menghubungi server.");
    }
  };

  const handleOpenModal = (index: number) => {
    setActiveVideoIndex(index);
  };

  const handleCloseModal = () => {
    setActiveVideoIndex(null);
  };

  const handleNext = () => {
    if (activeVideoIndex !== null && activeVideoIndex < videos.length - 1) {
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
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-bold text-ink">Manajemen Berita Video</h2>
        <div className="flex items-center gap-3">
          <Link 
            href="/cms/video-news/new"
            className="bg-[#e9421e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            + Tambah Berita Video
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Preview</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Video</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Memuat data video...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-red-500 font-medium">⚠️ {error}</td></tr>
            ) : videos.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Belum ada berita video yang dibuat.</td></tr>
            ) : (
              videos.map((video: any, index: number) => (
                <tr key={video.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div 
                      className="relative w-16 h-16 md:w-20 md:h-14 rounded-md overflow-hidden cursor-pointer group/thumb bg-black"
                      onClick={() => handleOpenModal(index)}
                    >
                      <img src={getImageUrl(video)} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <PlayCircle className="text-white w-6 h-6 opacity-70 group-hover/thumb:opacity-100 group-hover/thumb:text-[#e9421e] transition-all" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-ink line-clamp-2 group-hover:text-accent transition-colors cursor-pointer" onClick={() => handleOpenModal(index)}>
                      {video.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                      {video.category?.name || "Tanpa Kategori"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(video.publishedAt || video.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleOpenModal(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Video"
                      >
                        <span className="text-sm font-bold">Lihat</span>
                      </button>
                      <Link 
                        href={`/cms/video-news/edit/${video.slug}`} 
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Video"
                      >
                        <span className="text-sm font-bold">Edit</span>
                      </Link>
                      <button 
                        type="button"
                        onClick={() => handleDelete(video.slug)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Video"
                      >
                        <span className="text-sm font-bold">Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REUSABLE VIDEO MODAL */}
      <VideoModal 
        isOpen={activeVideoIndex !== null}
        onClose={handleCloseModal}
        video={activeVideoIndex !== null ? videos[activeVideoIndex] : null}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={activeVideoIndex !== null && activeVideoIndex < videos.length - 1}
        hasPrev={activeVideoIndex !== null && activeVideoIndex > 0}
      />
    </div>
  );
}
