import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader, JwtPayload } from "./auth";

export type AuthedRequest = NextRequest & { user: JwtPayload };

export function withAuth<T = Record<string, string>>(
  handler: (req: NextRequest, ctx: { params: Promise<T> }, user: JwtPayload) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (req: NextRequest, ctx: { params: Promise<T> }) => {
    const token = getTokenFromHeader(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ success: false, errors: ["Unauthorized: No token provided"] }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, errors: ["Unauthorized: Invalid or expired token"] }, { status: 401 });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ success: false, errors: ["Forbidden: Insufficient permissions"] }, { status: 403 });
    }

    return handler(req, ctx, user);
  };
}

export function apiResponse<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, meta: meta || {} }, { status });
}

export function apiError(message: string | string[], status = 400) {
  const errors = Array.isArray(message) ? message : [message];
  return NextResponse.json({ success: false, errors }, { status });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
