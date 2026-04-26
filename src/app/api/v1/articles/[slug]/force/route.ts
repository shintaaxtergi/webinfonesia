import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiResponse, apiError, withAuth } from "@/lib/middleware";
import { JwtPayload } from "@/lib/auth";

type RouteCtx = { params: Promise<{ slug: string }> };

export const DELETE = withAuth(
  async (_req: NextRequest, { params }: RouteCtx, user: JwtPayload) => {
    try {
      const { slug } = await params;
      const article = await prisma.article.findUnique({
        where: { slug },
        select: { id: true, authorId: true, deletedAt: true }
      });

      if (!article) return apiError("Artikel tidak ditemukan", 404);
      if (!article.deletedAt) return apiError("Hapus permanen hanya untuk artikel di sampah", 400);

      const isOwner = article.authorId === user.userId;
      const isAdminOrEditor = ["ADMIN", "EDITOR"].includes(user.role);
      if (!isOwner && !isAdminOrEditor) return apiError("Forbidden", 403);

      await prisma.article.delete({ where: { id: article.id } });

      return apiResponse({ message: "Artikel dihapus permanen" });
    } catch (err) {
      console.error("[FORCE DELETE]", err);
      return apiError("Internal server error", 500);
    }
  },
  ["ADMIN", "EDITOR", "WRITER"]
);
