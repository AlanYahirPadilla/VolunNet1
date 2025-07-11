import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session-token")?.value

  // Rutas que requieren autenticación
  const protectedPaths = ["/dashboard", "/perfil", "/eventos/crear", "/admin"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Rutas de autenticación (no accesibles si ya está logueado)
  const authPaths = ["/login", "/registro"]
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !sessionToken) {
    // Redirigir a login si intenta acceder a ruta protegida sin token
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthPath && sessionToken) {
    try {
      // Verificar si el token es válido y no ha expirado
      const payload = JSON.parse(Buffer.from(sessionToken, "base64").toString())
      if (Date.now() < payload.exp) {
        // Si el token es válido, redirigir al dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      // Si el token no es válido, permitir acceso a rutas de auth
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/perfil/:path*", "/eventos/crear/:path*", "/admin/:path*", "/login", "/registro"],
}
