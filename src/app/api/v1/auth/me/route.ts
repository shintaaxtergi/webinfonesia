import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get("authorization"));
    if (!token) return apiError("Unauthorized", 401);

    const payload = verifyToken(token);
    if (!payload) return apiError("Invalid or expired token", 401);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) return apiError("User not found", 404);

    return apiResponse({ user });
  } catch (err) {
    console.error("[ME]", err);
    return apiError("Internal server error", 500);
  }
}
