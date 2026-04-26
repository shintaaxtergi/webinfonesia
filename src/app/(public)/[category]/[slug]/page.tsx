import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import CommentSection from "@/components/CommentSection";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ category: string, slug: string }> }) {
  const { slug } = await params;
  
  // Fetch article from DB
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      featuredImage: true,
      tags: { include: { tag: true } },
      comments: { 
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Get 3 related articles (from same category) excluding current one
  let relatedArticles: any[] = [];
  if (article.categoryId) {
    relatedArticles = await prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
        status: "PUBLISHED"
      },
      take: 3,
      include: {
        category: true,
        featuredImage: true
      },
      orderBy: { publishedAt: 'desc' }
    });
  }

  const heroImageUrl = article.featuredImage?.url || article.ogImageUrl || FALLBACK_IMAGE;

  // Convert any YouTube / Vimeo watch URL into an embeddable src
  function getEmbedUrl(url: string): string | null {
    try {
      const u = new URL(url);
      // YouTube: https://www.youtube.com/watch?v=ID  or  https://youtu.be/ID
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        return v ? `https://www.youtube.com/embed/${v}` : null;
      }
      if (u.hostname === "youtu.be") {
        return `https://www.youtube.com/embed${u.pathname}`;
      }
      // Vimeo: https://vimeo.com/ID
      if (u.hostname.includes("vimeo.com")) {
        return `https://player.vimeo.com/video${u.pathname}`;
      }
      return null;
    } catch {
      return null;
    }
  }

  const videoEmbedUrl = article.videoUrl ? getEmbedUrl(article.videoUrl) : null;

  return (
    <main className="pb-12">
      <BackButton categoryName={article.category?.name} categorySlug={article.category?.slug} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <div className="mb-6">
          <Link 
            href={`/${article.category?.slug || 'uncategorized'}`}
            className="inline-block px-4 py-1.5 text-white text-xs font-bold tracking-widest uppercase rounded-full hover:opacity-80 transition-opacity"
            style={{ backgroundColor: article.category?.color || '#0d0d0d' }}
          >
            {article.category?.name || 'Uncategorized'}
          </Link>
        </div>
        
        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 text-ink">
          {article.title}
        </h1>
        
        {article.excerpt && (
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-8">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium text-gray-500 border-y border-border py-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border bg-gray-200">
              {article.author.avatarUrl ? (
                <img src={article.author.avatarUrl} alt={article.author.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center justify-center h-full w-full text-lg">
                  {article.author.fullName.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-ink font-bold">{article.author.fullName}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <time dateTime={article.publishedAt?.toISOString() || article.createdAt.toISOString()}>
            {article.publishedAt 
              ? new Date(article.publishedAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : new Date(article.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </time>
          <span className="hidden sm:inline">•</span>
          <span>{article.readTime} mnt Baca</span>
        </div>
      </header>

      {/* HERO IMAGE */}
      <figure className="mb-12">
        <div className="relative w-full h-[50vh] min-h-[300px] rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={heroImageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        {article.featuredImage?.altText && (
          <figcaption className="mt-3 text-center text-xs text-gray-500">
            {article.featuredImage.altText}
          </figcaption>
        )}
      </figure>

      {/* VIDEO EMBED — shown only when videoUrl is set */}
      {videoEmbedUrl && (
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={videoEmbedUrl}
              title={`Video: ${article.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-2xl shadow-lg border border-border"
            />
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">Video terkait artikel ini</p>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto">
        {(() => {
          const text = article.content;
          if (!text) return null;
          
          // Check if content already contains HTML tags for backward compatibility
          const isHtml = /<\/?(p|div|br|h[1-6]|ul|li|blockquote|img|a|strong|em|b|i)[^>]*>/i.test(text);
          if (isHtml) {
            return (
              <div 
                className="prose prose-lg md:prose-xl prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold prose-a:text-accent hover:prose-a:text-accent-hover mx-auto"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            );
          }

          // Plain text formatting
          const paragraphs = text.replace(/\r\n/g, '\n').split('\n\n');
          return (
            <div className="prose prose-lg md:prose-xl prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold prose-a:text-accent hover:prose-a:text-accent-hover mx-auto">
              {paragraphs.map((p, i) => {
                if (!p.trim()) return <p key={i}><br /></p>;
                const lines = p.split('\n');
                return (
                  <p key={i}>
                    {lines.map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
          );
        })()}

        {/* TAGS */}
        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((tagRel) => (
              <span key={tagRel.tag.id} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-md">
                #{tagRel.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* SHARE BAR */}
        <div className="mt-12 py-6 border-y border-border flex items-center justify-between">
          <span className="font-bold text-ink text-sm uppercase tracking-wider">Bagikan Artikel</span>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-accent hover:text-white transition-colors">📱</button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-accent hover:text-white transition-colors">🔗</button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-accent hover:text-white transition-colors">📧</button>
          </div>
        </div>
      </div>

      {/* RELATED ARTICLES */}
      {relatedArticles.length > 0 && (
        <section className="mt-20 border-t-4 border-ink pt-12">
          <h2 className="font-display font-bold text-3xl mb-8 text-ink">Berita Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((rel) => {
              const relImgUrl = rel.featuredImage?.url || rel.ogImageUrl || FALLBACK_IMAGE;
              return (
                <Link href={`/${rel.category?.slug || 'uncategorized'}/${rel.slug}`} key={rel.id} className="group">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 border border-gray-100">
                    <Image 
                      src={relImgUrl} 
                      alt={rel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-display font-bold text-lg leading-tight mb-2 group-hover:text-accent transition-colors text-ink">
                    {rel.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">
                    {rel.publishedAt 
                      ? new Date(rel.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
                      : new Date(rel.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* COMMENT SECTION */}
      <CommentSection 
        articleId={article.id} 
        initialComments={article.comments as any} 
        // userId={session?.user?.id} // Uncomment ini jika sudah setup next-auth
      />

      </article>
    </main>
  );
}
