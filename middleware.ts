import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TEMPORAL: Deshabilitar middleware para debugging
  // Solo proteger rutas del dashboard
  if (pathname.startsWith("/dashboard")) {
    console.log("🔍 Middleware (DESHABILITADO):", {
      path: pathname,
      message: "Middleware deshabilitado temporalmente para debugging",
    });

    // TEMPORAL: Permitir acceso sin verificar token
    // const token = request.cookies.get("access_token")?.value;
    // if (!token) {
    //   console.log("🚫 Sin token, redirigiendo a login");
    //   return NextResponse.redirect(new URL("/login", request.url));
    // }
  }

  // Para todas las demás rutas, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
