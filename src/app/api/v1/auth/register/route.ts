import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/middleware";

const RegisterSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-z0-9_]+$/, "Username hanya boleh huruf kecil, angka, dan underscore"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  fullName: z.string().min(2).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors.map((e) => e.message));
    }

    const { username, email, password, fullName } = parsed.data;

    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return apiError(existing.email === email ? "Email sudah terdaftar" : "Username sudah digunakan", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, email, passwordHash, fullName, role: "USER" },
      select: { id: true, username: true, email: true, fullName: true, role: true, createdAt: true },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return apiResponse({ user, token }, 201);
  } catch (err) {
    console.error("[REGISTER]", err);
    return apiError("Internal server error", 500);
  }
}
