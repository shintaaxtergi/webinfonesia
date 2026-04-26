import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiResponse, apiError, withAuth, slugify } from "@/lib/middleware";

// --- GET /api/v1/categories ---
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        metaTitle: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true, color: true },
        },
        _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
      },
    });
    return apiResponse(categories);
  } catch (err) {
    console.error("[CATEGORIES GET]", err);
    return apiError("Internal server error", 500);
  }
}

// --- POST /api/v1/categories ---
const CreateCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().optional(),
});

export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const parsed = CreateCategorySchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.errors.map((e) => e.message));

      const { name, description, color, parentId, sortOrder } = parsed.data;
      const slug = slugify(name);

      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) return apiError("Kategori dengan nama tersebut sudah ada", 409);

      const category = await prisma.category.create({
        data: { name, slug, description, color, parentId, sortOrder: sortOrder ?? 0 },
      });

      return apiResponse(category, 201);
    } catch (err) {
      console.error("[CATEGORIES POST]", err);
      return apiError("Internal server error", 500);
    }
  },
  ["ADMIN", "EDITOR"]
);
