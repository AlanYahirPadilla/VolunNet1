"use client"

import type React from "react"

import { createContext, useContext, useEffect } from "react"
import { usePathname } from "next/navigation"
import { usePreloader } from "@/hooks/use-preloader"

interface PreloadContextType {
  trackRouteVisit: (route: string) => void
  preloadPredictedRoutes: (currentRoute: string) => void
  getPreloadedData: (route: string) => any
  preloadOnHover: (route: string) => void
  isPreloading: boolean
  preloadedRoutes: string[]
}

const PreloadContext = createContext<PreloadContextType | null>(null)

export function PreloadProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const preloader = usePreloader()

  // Rastrear cambios de ruta y precargar rutas predichas
  useEffect(() => {
    preloader.trackRouteVisit(pathname)

    // Precargar rutas predichas después de un breve delay
    const timer = setTimeout(() => {
      preloader.preloadPredictedRoutes(pathname)
    }, 2000)

    return () => clearTimeout(timer)
  }, [pathname, preloader])

  return <PreloadContext.Provider value={preloader}>{children}</PreloadContext.Provider>
}

export function usePreloadContext() {
  const context = useContext(PreloadContext)
  if (!context) {
    throw new Error("usePreloadContext must be used within PreloadProvider")
  }
  return context
}
