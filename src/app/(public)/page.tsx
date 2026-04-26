import { prisma } from "@/lib/db";
import Link from "next/link";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop";

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

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch from Database
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 10,
    include: {
      author: {
        select: { fullName: true }
      },
      category: {
        select: { name: true, slug: true }
      },
      featuredImage: true
    }
  });

  const popularArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      viewCount: "desc",
    },
    take: 5,
    include: {
      category: { select: { name: true, slug: true } },
    }
  });

  // Handle empty state gracefully
  if (articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink">Belum ada artikel.</h2>
        <p className="text-gray-500 mt-2">Masuk ke CMS untuk mulai mempublikasikan konten perdana Anda.</p>
      </div>
    );
  }

  // Define hero and recent articles
  const heroArticle = articles.find(a => a.isFeatured) || articles[0];
  const recentArticles = articles.filter(a => a.id !== heroArticle.id).slice(0, 6);

  const heroImageUrl = heroArticle.featuredImage?.url || heroArticle.ogImageUrl || FALLBACK_IMAGE;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: HERO SECTION */}
        <section className="lg:col-span-2">
          <Link href={`/${heroArticle.category?.slug || 'uncategorized'}/${heroArticle.slug}`} className="group block">
            <div className="relative w-full aspect-[16/10] md:aspect-[2/1] rounded-2xl overflow-hidden mb-5 bg-gray-100">
              <img 
                src={heroImageUrl} 
                alt={heroArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
            </div>
            
            <div>
              <div className="text-gray-400 text-sm mb-3">
                {timeAgo(heroArticle.publishedAt || heroArticle.createdAt)}
              </div>
              <h1 className="font-display font-black text-3xl md:text-4xl lg:text-[40px] leading-tight text-ink group-hover:text-accent transition-colors">
                {heroArticle.title}
              </h1>
            </div>
          </Link>
        </section>

        {/* RIGHT: TERPOPULER */}
        <aside className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
            <div className="w-1.5 h-6 bg-accent rounded-full"></div>
            <h2 className="font-display font-bold text-xl text-ink">Terpopuler</h2>
          </div>

          <div className="flex flex-col">
            {popularArticles.map((article, index) => (
              <Link 
                href={`/${article.category?.slug || 'uncategorized'}/${article.slug}`} 
                key={article.id} 
                className="group flex gap-5 items-start py-4 border-b border-gray-100 last:border-0"
              >
                {/* Outline Number */}
                <div 
                  className="text-5xl font-display font-black text-transparent mt-1 flex-shrink-0" 
                  style={{ WebkitTextStroke: "2px #e9421e" }}
                >
                  {index + 1}
                </div>
                
                {/* Article Info */}
                <div>
                  <h3 className="font-bold text-ink leading-snug group-hover:text-accent transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                  <div className="text-xs text-gray-400 mt-2">
                    {timeAgo(article.publishedAt || article.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {/* BERITA TERBARU GRID (Below) */}
      {recentArticles.length > 0 && (
        <section className="mt-16 border-t-2 border-ink pt-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-ink rounded-full"></div>
            <h2 className="font-display font-bold text-2xl tracking-tight text-ink">Berita Terbaru</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.map((article) => {
              const imageUrl = article.featuredImage?.url || article.ogImageUrl || FALLBACK_IMAGE;

              return (
                <Link href={`/${article.category?.slug || 'uncategorized'}/${article.slug}`} key={article.id} className="group flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <img 
                      src={imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 text-ink text-xs font-bold tracking-wider uppercase rounded-full shadow-sm">
                        {article.category?.name || "Uncategorized"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-display font-bold text-xl leading-snug mb-3 group-hover:text-accent transition-colors text-ink">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                      {article.excerpt || "Klik untuk membaca selengkapnya..."}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 mt-auto pt-4 border-t border-gray-100">
                      <span className="truncate max-w-[120px]">{article.author.fullName}</span>
                      <div className="flex items-center gap-2">
                        <span>{timeAgo(article.publishedAt || article.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
