import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session-token")?.value

  // Rutas que requieren autenticación
  const protectedPaths = ["/dashboard", "/perfil", "/eventos/crear", "/admin", "/organizaciones/dashboard"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Rutas de autenticación (no accesibles si ya está logueado)
  const authPaths = ["/login", "/registro"]
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !sessionToken) {
    // Redirigir a login si intenta acceder a ruta protegida sin token
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionToken) {
    try {
      // Verificar si el token es válido y no ha expirado
      const payload = JSON.parse(Buffer.from(sessionToken, "base64").toString())
      if (Date.now() < payload.exp) {
        // Protección de dashboard según rol
        if (request.nextUrl.pathname.startsWith("/dashboard") && payload.role === "ORGANIZATION") {
          // Si es organizador y va a dashboard de voluntario, redirigir
          return NextResponse.redirect(new URL("/organizaciones/dashboard", request.url))
        }
        if (request.nextUrl.pathname.startsWith("/organizaciones/dashboard") && payload.role === "VOLUNTEER") {
          // Si es voluntario y va a dashboard de organizador, redirigir
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        // Si está logueado y accede a login/registro, redirigir a su dashboard
        if (isAuthPath) {
          if (payload.role === "ORGANIZATION") {
            return NextResponse.redirect(new URL("/organizaciones/dashboard", request.url))
          } else {
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        }
      }
    } catch (error) {
      // Si el token no es válido, permitir acceso a rutas de auth
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/perfil/:path*", "/eventos/crear/:path*", "/admin/:path*", "/organizaciones/dashboard/:path*", "/login", "/registro"],
}
