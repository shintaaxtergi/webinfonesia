import { prisma } from "@/lib/db";
import VideoGrid from "./VideoGrid";

export default async function VideoSection() {
  // Fetch latest articles (simulating video articles by just getting the recent ones)
  const videoArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { contentType: "VIDEO" },
        { videoUrl: { not: null } }
      ]
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    include: {
      category: { select: { name: true, slug: true } },
      featuredImage: true
    }
  });

  if (videoArticles.length === 0) return null;

  const heroVideo = videoArticles[0];
  const carouselVideos = videoArticles.slice(1, 6);

  const getImageUrl = (article: any) => article.featuredImage?.url || article.ogImageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop";

  return (
    <section className="mt-16 w-full max-w-7xl mx-auto border-t-2 border-ink pt-8">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-1.5 h-6 bg-[#e9421e] rounded-full"></div>
        <h2 className="font-display font-bold text-2xl tracking-tight text-ink uppercase">Berita Video</h2>
      </div>

      <VideoGrid heroVideo={heroVideo} carouselVideos={carouselVideos} />
    </section>
  );
}
