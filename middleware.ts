import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo proteger rutas del dashboard
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("access_token")?.value;

    console.log("🔍 Middleware:", {
      path: pathname,
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : null,
    });

    // Si no hay token, redirigir al login
    if (!token) {
      console.log("🚫 Sin token, redirigiendo a login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Para todas las demás rutas, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
