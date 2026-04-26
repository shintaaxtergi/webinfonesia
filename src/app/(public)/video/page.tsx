import { prisma } from "@/lib/db";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Video Terkini - InfoNesia",
  description: "Tonton berbagai video berita terkini, terpopuler, dan eksklusif dari InfoNesia.",
};

export default async function VideoPage() {
  // Fetch videos: either contentType is VIDEO, or they have a videoUrl
  const videos = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { contentType: "VIDEO" },
        { videoUrl: { not: null } }
      ]
    },
    orderBy: {
      publishedAt: "desc"
    },
    include: {
      category: { select: { name: true, slug: true } },
      featuredImage: true
    }
  });

  const featuredVideo = videos[0];
  const gridVideos = videos.slice(1);

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* HEADER SECTION */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-black text-ink mb-4">
            Kumpulan <span className="text-[#e9421e]">Video</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Saksikan berbagai liputan eksklusif, wawancara, dan berita visual terhangat dari seluruh penjuru dunia.
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <span className="text-4xl mb-4 block">🎬</span>
            <h3 className="text-xl font-bold text-ink mb-2">Belum ada video</h3>
            <p className="text-gray-500">Koleksi video saat ini belum tersedia.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* FEATURED VIDEO */}
            {featuredVideo && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-[#e9421e] rounded-full" />
                  <h2 className="text-2xl font-bold text-ink">Video Utama</h2>
                </div>
                <VideoCard article={featuredVideo} isFeatured />
              </section>
            )}

            {/* GRID SECTION */}
            {gridVideos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-[#e9421e] rounded-full" />
                  <h2 className="text-2xl font-bold text-ink">Video Terbaru</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {gridVideos.map(video => (
                    <VideoCard key={video.id} article={video} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
