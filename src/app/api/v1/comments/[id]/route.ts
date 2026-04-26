import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiResponse, apiError, withAuth } from "@/lib/middleware";
import { JwtPayload } from "@/lib/auth";

type RouteCtx = { params: Promise<{ id: string }> };

// --- DELETE /api/v1/comments/[id] ---
export const DELETE = withAuth(
  async (_req: NextRequest, { params }: RouteCtx, user: JwtPayload) => {
    try {
      const { id } = await params;
      const comment = await prisma.comment.findUnique({ where: { id }, select: { id: true, userId: true } });
      if (!comment) return apiError("Komentar tidak ditemukan", 404);

      const isOwner = comment.userId === user.userId;
      const isAdmin = user.role === "ADMIN" || user.role === "EDITOR";
      if (!isOwner && !isAdmin) return apiError("Forbidden", 403);

      await prisma.comment.delete({ where: { id } });
      return apiResponse({ message: "Komentar berhasil dihapus" });
    } catch (err) {
      console.error("[COMMENT DELETE]", err);
      return apiError("Internal server error", 500);
    }
  }
);

// --- PATCH /api/v1/comments/[id] (untuk moderasi: APPROVED/REJECTED) ---
export const PATCH = withAuth(
  async (req: NextRequest, { params }: RouteCtx, _user: JwtPayload) => {
    try {
      const { id } = await params;
      const { status } = await req.json();

      if (!["APPROVED", "REJECTED"].includes(status)) {
        return apiError("Status tidak valid");
      }

      const comment = await prisma.comment.update({
        where: { id },
        data: { status },
        include: { user: { select: { id: true, fullName: true } } },
      });

      return apiResponse(comment);
    } catch (err) {
      console.error("[COMMENT PATCH]", err);
      return apiError("Internal server error", 500);
    }
  },
  ["ADMIN", "EDITOR"]
);
