import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    if (!q || q.length < 2) {
      return apiError("Query pencarian minimal 2 karakter");
    }

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ],
    };

    if (category) {
      where.category = { slug: category };
    }

    const [results, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          readTime: true,
          publishedAt: true,
          category: { select: { name: true, slug: true, color: true } },
          author: { select: { fullName: true, username: true } },
          featuredImage: { select: { url: true, altText: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return apiResponse(results, 200, { query: q, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[SEARCH]", err);
    return apiError("Internal server error", 500);
  }
}
