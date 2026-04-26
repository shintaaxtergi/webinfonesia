import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

    const tags = await prisma.tag.findMany({
      take: limit,
      orderBy: { usageCount: "desc" },
      select: { id: true, name: true, slug: true, usageCount: true },
    });

    return apiResponse(tags);
  } catch (err) {
    console.error("[TAGS GET]", err);
    return apiError("Internal server error", 500);
  }
}
