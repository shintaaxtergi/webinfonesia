import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiResponse, apiError, withAuth } from "@/lib/middleware";

export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          username: true,
          role: true
        },
        where: {
          isActive: true
        },
        orderBy: {
          fullName: "asc"
        }
      });
      return apiResponse(users);
    } catch (err) {
      console.error("[USERS GET]", err);
      return apiError("Internal server error", 500);
    }
  },
  ["ADMIN", "EDITOR", "WRITER"]
);
