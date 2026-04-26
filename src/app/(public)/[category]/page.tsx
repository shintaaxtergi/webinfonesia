import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Using a standard fallback image for MVP if featuredImage is not available
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;

  // 1. Fetch category info
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    notFound();
  }

  // 2. Fetch published articles for this category
  const articles = await prisma.article.findMany({
    where: {
      categoryId: category.id,
      status: "PUBLISHED",
    },
    take: 5,
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      author: {
        select: { fullName: true }
      },
      featuredImage: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* HEADER SECTION */}
      <div className="mb-12 border-b-4 border-ink pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-4xl tracking-tight text-ink uppercase">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 mt-2 text-lg">
              {category.description}
            </p>
          )}
        </div>
        <div 
          className="w-16 h-16 rounded-full hidden sm:block shadow-sm"
          style={{ backgroundColor: category.color || "#C0392B" }}
        />
      </div>

      {/* ARTICLES GRID */}
      {articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <span className="text-4xl mb-4 block">📭</span>
          <h3 className="text-xl font-bold text-ink mb-2">Belum ada berita</h3>
          <p className="text-gray-500">Kategori ini belum memiliki artikel yang dipublikasikan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => {
            const imageUrl = article.featuredImage?.url || article.ogImageUrl || FALLBACK_IMAGE;
            
            return (
              <Link href={`/${categorySlug}/${article.slug}`} key={article.id} className="group flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image 
                    src={imageUrl} 
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                  {article.label !== "NORMAL" && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-accent text-white text-xs font-bold tracking-wider uppercase rounded shadow-sm">
                        {article.label}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-display font-bold text-xl leading-tight mb-3 group-hover:text-accent transition-colors text-ink">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                    {article.excerpt || "Klik untuk membaca selengkapnya..."}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <span className="truncate max-w-[120px]">{article.author.fullName}</span>
                    <div className="flex items-center gap-2">
                      <span>•</span>
                      <span>{article.readTime} mnt</span>
                      <span>•</span>
                      <span>
                        {article.publishedAt 
                          ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                          : new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
