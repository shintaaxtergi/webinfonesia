import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiResponse, apiError, withAuth, slugify } from "@/lib/middleware";
import { JwtPayload } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- GET /api/v1/articles ---
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const category    = searchParams.get("category");
    const featured    = searchParams.get("featured");
    const videoOnly   = searchParams.get("videoOnly");
    const contentType = searchParams.get("contentType");  // "ARTICLE" | "VIDEO" | null
    const status      = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};

    // Status filter — pass "ALL" to skip this filter
    if (status && status !== "ALL") {
      where.status = status;
    } else if (!status) {
      where.status = "PUBLISHED";
    }

    if (category)              where.category    = { slug: category };
    if (featured === "true")   where.isFeatured  = true;
    if (videoOnly === "true")  where.videoUrl    = { not: null };

    // Validate contentType against the enum values expected by Prisma
    const VALID_CONTENT_TYPES = ["ARTICLE", "VIDEO"];
    if (contentType && VALID_CONTENT_TYPES.includes(contentType)) {
      where.contentType = contentType;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        // Some video articles may not have publishedAt — fall back to createdAt
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id:           true,
          title:        true,
          slug:         true,
          excerpt:      true,
          content:      true,
          label:        true,
          isFeatured:   true,
          viewCount:    true,
          readTime:     true,
          publishedAt:  true,
          createdAt:    true,
          status:       true,
          authorId:     true,
          categoryId:   true,
          videoUrl:     true,   // ← required for VideoNewsTable & VideoModal
          ogImageUrl:   true,   // ← thumbnail fallback
          contentType:  true,   // ← separates ARTICLE from VIDEO
          category:     { select: { name: true, slug: true, color: true } },
          author:       { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          featuredImage:{ select: { url: true, cdnUrl: true, altText: true } },
          tags:         { select: { tag: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const responseArticles = articles.map(art => ({
      ...art,
      viewCount: Number(art.viewCount),
    }));

    return apiResponse(responseArticles, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("[ARTICLES GET] Error details:", {
      message: err?.message,
      code: err?.code,       // Prisma error code e.g. P2025
      meta: err?.meta,
    });
    return apiError(err?.message || "Internal server error", 500);
  }
}


// --- POST /api/v1/articles ---
const CreateArticleSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(500),
  subTitle: z.string().optional(),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  excerpt: z.string().max(500).optional(),
  categoryId: z.string().optional().nullable().transform((v) => (v === "" ? null : v)),
  authorId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  label: z.enum(["NORMAL", "BREAKING", "EXCLUSIVE", "OPINION", "ANALYSIS"]).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  expiresAt: z.string().optional().nullable(),
  featuredImageUrl: z.string().optional().nullable(),
  videoUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional().transform((v) => (v === "" ? null : v)),
  contentType: z.enum(["ARTICLE", "VIDEO"]).optional(),
});

export const POST = withAuth(
  async (req: NextRequest, _ctx, user: JwtPayload) => {
    try {
      const body = await req.json();
      console.log("[ARTICLES POST] Received body:", body);
      const parsed = CreateArticleSchema.safeParse(body);
      if (!parsed.success) {
        console.error("[ARTICLES POST] Zod validation failed:", parsed.error.errors);
        return apiError(parsed.error.errors.map((e) => e.path.join(".") + ": " + e.message));
      }

      const { title, subTitle, content, excerpt, categoryId, authorId, tags, label, metaTitle, metaDesc, status, featuredImageUrl, videoUrl, expiresAt } = parsed.data;

      // Generate unique slug
      let slug = slugify(title);
      const existing = await prisma.article.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${Date.now()}`;

      // Estimate read time (avg 200 words/min)
      const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      let finalFeaturedImageId = null;
      let finalOgImageUrl = null;

      if (featuredImageUrl) {
        if (!featuredImageUrl.startsWith("data:") && !featuredImageUrl.startsWith("blob:")) {
          const media = await prisma.media.findFirst({ where: { url: featuredImageUrl } });
          if (media) {
            finalFeaturedImageId = media.id;
          } else {
            finalOgImageUrl = featuredImageUrl;
          }
        } else {
          finalOgImageUrl = featuredImageUrl;
        }
      }

      const isEditorOrAdmin = ["ADMIN", "EDITOR"].includes(user.role);
      const finalStatus = status || "DRAFT";
      const finalPublishedAt = finalStatus === "PUBLISHED" ? new Date() : null;
      const finalEditorId = (finalStatus === "PUBLISHED" && isEditorOrAdmin) ? user.userId : null;
      const finalExpiresAt = expiresAt ? new Date(expiresAt) : null;
      const finalAuthorId = authorId || user.userId;
      const finalContentType = parsed.data.contentType || "ARTICLE";

      const article = await prisma.article.create({
        data: {
          authorId: finalAuthorId,
          editorId: finalEditorId,
          title,
          subTitle,
          content,
          excerpt,
          slug,
          categoryId,
          label: label || "NORMAL",
          contentType: finalContentType,
          metaTitle,
          metaDesc,
          readTime,
          status: finalStatus,
          publishedAt: finalPublishedAt,
          expiresAt: finalExpiresAt,
          videoUrl: videoUrl || null,
          featuredImageId: finalFeaturedImageId,
          ogImageUrl: finalOgImageUrl,
          tags: tags?.length
            ? {
                create: await Promise.all(
                  tags.map(async (tagName) => {
                    const tagSlug = slugify(tagName);
                    const tag = await prisma.tag.upsert({
                      where: { slug: tagSlug },
                      update: { usageCount: { increment: 1 } },
                      create: { name: tagName, slug: tagSlug, usageCount: 1 },
                    });
                    return { tagId: tag.id };
                  })
                ),
              }
            : undefined,
        },
        include: {
          author: { select: { id: true, fullName: true, username: true } },
          category: { select: { name: true, slug: true } },
          tags: { select: { tag: { select: { name: true, slug: true } } } },
        },
      });

      const responseData = {
        ...article,
        viewCount: Number(article.viewCount)
      };

      revalidatePath("/");
      return apiResponse(responseData, 201);
    } catch (err: any) {
      console.error("[ARTICLES POST] System Error:", err);
      return apiError(err.message || "Internal server error", 500);
    }
  },
  ["ADMIN", "EDITOR", "WRITER"]
);
