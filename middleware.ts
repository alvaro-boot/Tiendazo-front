import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/register", "/register-employee"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Proteger rutas del dashboard y otras rutas protegidas
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/app")) {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      console.log("🚫 Sin token, redirigiendo a login desde:", pathname);
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Para todas las demás rutas, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
