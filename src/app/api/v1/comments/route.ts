import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiResponse, apiError, withAuth } from "@/lib/middleware";
import { JwtPayload } from "@/lib/auth";

// --- GET /api/v1/comments?articleId=xxx ---
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");
    if (!articleId) return apiError("articleId diperlukan");

    const comments = await prisma.comment.findMany({
      where: { articleId, parentId: null, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        replies: {
          where: { status: "APPROVED" },
          include: {
            user: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return apiResponse(comments);
  } catch (err) {
    console.error("[COMMENTS GET]", err);
    return apiError("Internal server error", 500);
  }
}

// --- POST /api/v1/comments ---
const CreateCommentSchema = z.object({
  articleId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  content: z.string().min(1).max(2000, "Komentar maksimal 2000 karakter"),
});

export const POST = withAuth(
  async (req: NextRequest, _ctx, user: JwtPayload) => {
    try {
      const body = await req.json();
      const parsed = CreateCommentSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.errors.map((e) => e.message));

      const { articleId, parentId, content } = parsed.data;

      // Verify article exists
      const article = await prisma.article.findUnique({ where: { id: articleId, status: "PUBLISHED" } });
      if (!article) return apiError("Artikel tidak ditemukan", 404);

      // Max 2 levels of nesting
      if (parentId) {
        const parent = await prisma.comment.findUnique({ where: { id: parentId } });
        if (!parent) return apiError("Komentar parent tidak ditemukan", 404);
        if (parent.parentId) return apiError("Maksimal 2 level komentar", 400);
      }

      const comment = await prisma.comment.create({
        data: { articleId, userId: user.userId, parentId, content, status: "PENDING" },
        include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true } } },
      });

      return apiResponse(comment, 201);
    } catch (err) {
      console.error("[COMMENTS POST]", err);
      return apiError("Internal server error", 500);
    }
  }
);
