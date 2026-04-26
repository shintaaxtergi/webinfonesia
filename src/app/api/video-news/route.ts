import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/middleware";

/**
 * Dedicated API Route for Video News
 * GET /api/video-news
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PUBLISHED";
    
    const where: any = {
      contentType: "VIDEO",
    };

    if (status !== "ALL") {
      where.status = status;
    }

    const videos = await prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        videoUrl: true,
        contentType: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        ogImageUrl: true,
        category: {
          select: { name: true, slug: true }
        },
        author: {
          select: { fullName: true }
        },
        featuredImage: {
          select: { url: true }
        }
      }
    });

    return apiResponse(videos);
  } catch (err: any) {
    console.error("[API VIDEO NEWS] Error:", err);
    
    // Provide a more specific error message if it's a Prisma error
    if (err.code) {
      return apiError(`Database Error (${err.code}): Gagal mengambil data video.`, 500);
    }
    
    return apiError(err.message || "Gagal mengambil data video news.", 500);
  }
}
