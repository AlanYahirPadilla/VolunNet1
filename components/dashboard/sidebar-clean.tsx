"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Search, User, Settings, Bell, BarChart3, Heart, Users, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { logoutAction } from "@/app/auth/actions"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Explorar", href: "/eventos", icon: Search },
  { name: "Mis Eventos", href: "/my-events", icon: Calendar },
  { name: "Comunidad", href: "/community", icon: Users },
  { name: "Notificaciones", href: "/notifications", icon: Bell },
  { name: "Estadísticas", href: "/stats", icon: BarChart3 },
]

const secondaryNavigation = [
  { name: "Perfil", href: "/profile", icon: User },
  { name: "Configuración", href: "/settings", icon: Settings },
]

interface SidebarProps {
  user?: {
    firstName: string
    lastName: string
    role: string
  }
}

export function SidebarClean({ user = { firstName: "Usuario", lastName: "", role: "Voluntario" } }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutAction()
      router.push("/")
    } catch (error) {
      // Fallback: intentar logout via API
      try {
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/")
      } catch (apiError) {
        window.location.href = "/"
      }
    }
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0) || ""}`.toUpperCase()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-full shadow-md bg-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">VolunNet</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                Cerrar sesión
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" alt={user.firstName} />
                  <AvatarFallback className="bg-blue-600 text-white">{initials}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center px-6 mb-6">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">VolunNet</span>
          </div>

          <div className="px-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    pathname === item.href ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </div>

          <Separator className="my-4 mx-3" />

          <div className="px-3 space-y-1">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    pathname === item.href ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut
                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt={user.firstName} />
              <AvatarFallback className="bg-blue-600 text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}