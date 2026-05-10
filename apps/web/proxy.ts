import { authMiddleware } from "@/lib/auth/middleware";
import { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await authMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
