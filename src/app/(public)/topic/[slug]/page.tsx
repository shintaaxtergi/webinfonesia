import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Image as ImageIcon } from "lucide-react";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

function timeAgo(date: Date | null | undefined): string {
  if (!date) return "";
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return "Baru saja";
}

function getYoutubeThumbnail(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
}

export default async function TopicPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ filter?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { slug } = resolvedParams;
  const filter = resolvedSearchParams.filter || "semua";

  // Reconstruct Topic Name from slug (e.g., teknologi-ai -> Teknologi AI)
  // For exact match, we can also fetch the tag or category from DB
  let topicName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const tagDb = await prisma.tag.findUnique({ where: { slug } });
  if (tagDb) topicName = tagDb.name;
  else {
    const catDb = await prisma.category.findUnique({ where: { slug } });
    if (catDb) topicName = catDb.name;
  }

  // Base where condition
  const where: any = {
    status: "PUBLISHED",
    OR: [
      { category: { slug } },
      { tags: { some: { tag: { slug } } } }
    ]
  };

  if (filter === "artikel") {
    where.contentType = "ARTICLE";
  } else if (filter === "video") {
    where.contentType = "VIDEO";
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      featuredImage: true
    }
  });

  // Separate media (Video/Photo) and regular articles for layout
  const mediaArticles = articles.filter(a => a.contentType === "VIDEO" || a.featuredImageId !== null).slice(0, 4);
  const listArticles = articles.filter(a => !mediaArticles.find(ma => ma.id === a.id));

  const getImageUrl = (article: any) => {
    if (article.featuredImage?.url) return article.featuredImage.url;
    if (article.ogImageUrl) return article.ogImageUrl;
    if (article.videoUrl) {
      return getYoutubeThumbnail(article.videoUrl) || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop";
    }
    return "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop";
  };

  const filters = [
    { label: "Semua", value: "semua" },
    { label: "Artikel", value: "artikel" },
    { label: "Video", value: "video" }
  ];

  return (
    <main className="pb-12">
      <BackButton categoryName={topicName} categorySlug={`topic/${slug}`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER DINAMIS */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-ink mb-4">Liputan {topicName}</h1>
        
        {/* SUB-NAVIGASI */}
        <div className="flex items-center gap-6 border-b border-gray-200">
          {filters.map(f => (
            <Link 
              key={f.value}
              href={`/topic/${slug}?filter=${f.value}`}
              className={`pb-3 text-sm font-bold tracking-wide uppercase transition-colors relative ${
                filter === f.value ? "text-[#e9421e]" : "text-gray-500 hover:text-ink"
              }`}
            >
              {f.label}
              {filter === f.value && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e9421e]" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SISI KIRI (MEDIA) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mediaArticles.length > 0 ? (
            mediaArticles.map((article) => (
              <Link href={`/read/${article.slug}`} key={article.id} className="group flex flex-col gap-2">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={getImageUrl(article)} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {article.contentType === "VIDEO" ? (
                      <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <PlayCircle className="w-3 h-3 text-[#e9421e]" /> VIDEO
                      </span>
                    ) : (
                      <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-blue-400" /> FOTO
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase text-[#e9421e] mt-1">
                  <span>{article.category?.name || topicName}</span>
                  <span className="text-gray-400 font-normal lowercase">{timeAgo(article.publishedAt)}</span>
                </div>
                <h3 className="font-display font-bold text-sm text-ink leading-snug group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
              </Link>
            ))
          ) : (
             <div className="text-gray-500 text-sm py-4 col-span-2">Tidak ada media untuk topik ini.</div>
          )}
        </div>

        {/* SISI KANAN (LIST BERITA HORIZONTAL) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {listArticles.length > 0 ? (
            listArticles.map((article) => (
              <Link href={`/read/${article.slug}`} key={article.id} className="group flex gap-4 md:gap-6 bg-white p-4 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden relative bg-gray-100">
                  <img 
                    src={getImageUrl(article)} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {article.contentType === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white opacity-80" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#e9421e] mb-2">
                    <span>{article.category?.name || topicName}</span>
                    <span className="text-gray-400 font-normal lowercase">{timeAgo(article.publishedAt)}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug group-hover:text-accent transition-colors mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {article.excerpt || "Klik untuk membaca selengkapnya..."}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-gray-500 text-sm py-4">Tidak ada artikel untuk topik ini.</div>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
