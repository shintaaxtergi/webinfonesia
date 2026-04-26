import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiResponse, apiError, withAuth, slugify } from "@/lib/middleware";
import { JwtPayload, getTokenFromHeader, verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type RouteCtx = { params: Promise<{ slug: string }> };

const articleSelect = {
  id: true,
  title: true,
  subTitle: true,
  slug: true,
  content: true,
  excerpt: true,
  label: true,
  isFeatured: true,
  viewCount: true,
  readTime: true,
  metaTitle: true,
  metaDesc: true,
  ogImageUrl: true,
  canonicalUrl: true,
  status: true,
  publishedAt: true,
  expiresAt: true,
  videoUrl: true,
  contentType: true,
  categoryId: true,   // needed so the edit form can pre-select the category
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true, slug: true, color: true } },
  author: { select: { id: true, fullName: true, username: true, avatarUrl: true, bio: true } },
  editor: { select: { id: true, fullName: true, username: true } },
  featuredImage: { select: { url: true, cdnUrl: true, altText: true, width: true, height: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
  _count: { select: { comments: true } },
};

// --- GET /api/v1/articles/[slug] ---
export async function GET(req: NextRequest, { params }: RouteCtx) {
  try {
    const { slug } = await params;

    // Check if request comes from an authenticated CMS user
    const token = getTokenFromHeader(req.headers.get("authorization"));
    const user = token ? verifyToken(token) : null;
    const isCmsUser = user && ["ADMIN", "EDITOR", "WRITER"].includes(user.role);

    const article = await prisma.article.findUnique({ where: { slug }, select: articleSelect });
    if (!article) return apiError("Artikel tidak ditemukan", 404);

    // Public access: only PUBLISHED articles
    // CMS users: can access any article regardless of status
    if (!isCmsUser && article.status !== "PUBLISHED") {
      return apiError("Artikel tidak tersedia", 404);
    }

    // Only increment view count for public (non-authenticated) access
    if (!isCmsUser) {
      await prisma.article.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
    }

    const responseData = {
      ...article,
      viewCount: Number(article.viewCount)
    };

    return apiResponse(responseData);
  } catch (err) {
    console.error("[ARTICLE GET]", err);
    return apiError("Internal server error", 500);
  }
}

// --- PUT /api/v1/articles/[slug] ---
const UpdateArticleSchema = z.object({
  title: z.string().min(5).max(500).optional(),
  subTitle: z.string().optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  // Accept UUID or empty string (empty → null)
  categoryId: z.string().optional().nullable().transform((v) => (v === "" ? null : v)),
  authorId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  label: z.enum(["NORMAL", "BREAKING", "EXCLUSIVE", "OPINION", "ANALYSIS"]).optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
  expiresAt: z.string().optional().nullable(),
  // Accept full URL, empty string (→ null), or explicit null to clear the field
  videoUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional().transform((v) => (v === "" ? null : v)),
  // URL of image to link as featuredImage (optional; can be a blob/data URL for direct save)
  featuredImageUrl: z.string().optional().nullable(),
  contentType: z.enum(["ARTICLE", "VIDEO"]).optional(),
});

export const PUT = withAuth(
  async (req: NextRequest, { params }: RouteCtx, user: JwtPayload) => {
    try {
      const { slug } = await params;
      const article = await prisma.article.findUnique({ where: { slug }, select: { id: true, authorId: true } });
      if (!article) return apiError("Artikel tidak ditemukan", 404);

      // Only owner, editor, or admin can edit
      const isOwner = article.authorId === user.userId;
      const isEditorOrAdmin = ["ADMIN", "EDITOR"].includes(user.role);
      if (!isOwner && !isEditorOrAdmin) return apiError("Forbidden", 403);

      const body = await req.json();
      const parsed = UpdateArticleSchema.safeParse(body);
      if (!parsed.success) {
        console.error("[ARTICLE PUT] Validation errors:", JSON.stringify(parsed.error.errors, null, 2));
        return apiError(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`));
      }

      // Extract featuredImageUrl and tags before spreading into data (it's not a DB column / needs special handling)
      const { featuredImageUrl, tags, ...parsedWithoutImage } = parsed.data as typeof parsed.data & { featuredImageUrl?: string | null };
      const data: Record<string, unknown> = { ...parsedWithoutImage };

      // Handle tags update
      if (tags !== undefined) {
        // Delete old tags mapping
        await prisma.articleTag.deleteMany({ where: { articleId: article.id } });
        
        if (tags.length > 0) {
          data.tags = {
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
          };
        }
      }

      // Calculate read time if content updated
      if (parsed.data.content) {
        const wordCount = parsed.data.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
        data.readTime = Math.max(1, Math.ceil(wordCount / 200));
      }

      // Set publishedAt when publishing
      if (parsed.data.status === "PUBLISHED") {
        data.publishedAt = new Date();
        if (isEditorOrAdmin) data.editorId = user.userId;
      }

      // expiresAt: parse date string or set null to clear
      if (parsed.data.expiresAt !== undefined) {
        data.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
      }

      // videoUrl: always write the transformed value (null clears the field)
      if ("videoUrl" in parsed.data) {
        data.videoUrl = (parsed.data as any).videoUrl ?? null;
      }

      // featuredImage: try to find an existing Media row by URL, otherwise
      // store the URL in ogImageUrl as a fallback so it's at least saved.
      if (featuredImageUrl !== undefined) {
        if (featuredImageUrl) {
          // If it's a standard URL, try to find an existing media
          if (!featuredImageUrl.startsWith("data:") && !featuredImageUrl.startsWith("blob:")) {
            const media = await prisma.media.findFirst({ where: { url: featuredImageUrl } });
            if (media) {
              data.featuredImageId = media.id;
              data.ogImageUrl = null;
            } else {
              data.ogImageUrl = featuredImageUrl;
              data.featuredImageId = null;
            }
          } else {
            // For data: URIs (frontend uploads), store directly in ogImageUrl
            data.ogImageUrl = featuredImageUrl;
            data.featuredImageId = null;
          }
        } else {
          // Empty string means "clear the image"
          data.featuredImageId = null;
          data.ogImageUrl = null;
        }
      }

      const updated = await prisma.article.update({ where: { slug }, data, select: articleSelect });
      const responseData = {
        ...updated,
        viewCount: Number(updated.viewCount)
      };
      revalidatePath("/");
      return apiResponse(responseData);
    } catch (err) {
      console.error("[ARTICLE PUT]", err);
      return apiError("Internal server error", 500);
    }
  },
  ["ADMIN", "EDITOR", "WRITER"]
);

// --- DELETE /api/v1/articles/[slug] ---
export const DELETE = withAuth(
  async (_req: NextRequest, { params }: RouteCtx, user: JwtPayload) => {
    try {
      const { slug: idOrSlug } = await params;
      const article = await prisma.article.findFirst({ 
        where: { 
          OR: [
            { slug: idOrSlug },
            { id: idOrSlug }
          ]
        }, 
        select: { id: true, authorId: true } 
      });
      if (!article) return apiError("Artikel tidak ditemukan", 404);

      const isOwner = article.authorId === user.userId;
      const isAdminOrEditor = ["ADMIN", "EDITOR"].includes(user.role);
      if (!isOwner && !isAdminOrEditor) return apiError("Forbidden", 403);

      await prisma.article.delete({ 
        where: { id: article.id }
      });
      revalidatePath("/");
      return apiResponse({ message: "Artikel berhasil dihapus permanen" });
    } catch (err) {
      console.error("[ARTICLE DELETE]", err);
      return apiError("Internal server error", 500);
    }
  },
  ["ADMIN", "EDITOR", "WRITER"]
);
