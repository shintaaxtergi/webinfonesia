import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiResponse, apiError, withAuth } from "@/lib/middleware";

export const GET = withAuth(async (_req: NextRequest) => {
  try {
    const [articleCount, categoryCount, userCount] = await Promise.all([
      prisma.article.count(),
      prisma.category.count(),
      prisma.user.count(),
    ]);

    // For "views", we could sum up view counts if we had them in the schema.
    // For now, let's return a realistic mock or 0 if not tracked yet.
    const stats = {
      articles: articleCount,
      categories: categoryCount,
      users: userCount,
      views: 0, // Placeholder as schema doesn't have view tracking yet
    };

    return apiResponse(stats);
  } catch (err) {
    console.error("[CMS STATS]", err);
    return apiError("Gagal mengambil statistik", 500);
  }
}, ["ADMIN", "EDITOR"]);
