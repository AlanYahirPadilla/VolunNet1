"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface PreloadConfig {
  priority: "high" | "medium" | "low"
  delay?: number
  condition?: () => boolean
}

interface UserPattern {
  route: string
  frequency: number
  lastVisited: number
  timeSpent: number
  nextRoutes: Record<string, number>
}

interface PreloadCache {
  [key: string]: {
    data: any
    timestamp: number
    expiry: number
  }
}

export function usePreloader() {
  const router = useRouter()
  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set())
  const preloadCache = useRef<PreloadCache>({})
  const userPatterns = useRef<Record<string, UserPattern>>({})
  const currentRoute = useRef<string>("")
  const routeStartTime = useRef<number>(Date.now())

  // Cargar patrones de usuario desde localStorage
  useEffect(() => {
    const savedPatterns = localStorage.getItem("volun-net-user-patterns")
    if (savedPatterns) {
      try {
        userPatterns.current = JSON.parse(savedPatterns)
      } catch (error) {
        console.error("Error loading user patterns:", error)
      }
    }
  }, [])

  // Guardar patrones de usuario
  const saveUserPatterns = useCallback(() => {
    localStorage.setItem("volun-net-user-patterns", JSON.stringify(userPatterns.current))
  }, [])

  // Registrar visita a una ruta
  const trackRouteVisit = useCallback(
    (route: string) => {
      const now = Date.now()
      const timeSpent = now - routeStartTime.current

      if (currentRoute.current && currentRoute.current !== route) {
        // Actualizar tiempo gastado en la ruta anterior
        const prevRoute = currentRoute.current
        if (!userPatterns.current[prevRoute]) {
          userPatterns.current[prevRoute] = {
            route: prevRoute,
            frequency: 0,
            lastVisited: 0,
            timeSpent: 0,
            nextRoutes: {},
          }
        }

        userPatterns.current[prevRoute].timeSpent += timeSpent
        userPatterns.current[prevRoute].lastVisited = now

        // Registrar transición a la nueva ruta
        if (!userPatterns.current[prevRoute].nextRoutes[route]) {
          userPatterns.current[prevRoute].nextRoutes[route] = 0
        }
        userPatterns.current[prevRoute].nextRoutes[route]++
      }

      // Actualizar frecuencia de la nueva ruta
      if (!userPatterns.current[route]) {
        userPatterns.current[route] = {
          route,
          frequency: 0,
          lastVisited: 0,
          timeSpent: 0,
          nextRoutes: {},
        }
      }

      userPatterns.current[route].frequency++
      userPatterns.current[route].lastVisited = now
      currentRoute.current = route
      routeStartTime.current = now

      saveUserPatterns()
    },
    [saveUserPatterns],
  )

  // Obtener rutas más probables basadas en patrones
  const getPredictedRoutes = useCallback((currentRoute: string): string[] => {
    const pattern = userPatterns.current[currentRoute]
    if (!pattern) return []

    // Ordenar rutas siguientes por frecuencia
    const nextRoutes = Object.entries(pattern.nextRoutes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([route]) => route)

    // Agregar rutas frecuentes globales
    const frequentRoutes = Object.values(userPatterns.current)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 2)
      .map((pattern) => pattern.route)
      .filter((route) => route !== currentRoute && !nextRoutes.includes(route))

    return [...nextRoutes, ...frequentRoutes].slice(0, 4)
  }, [])

  // Precargar datos para una ruta específica
  const preloadRouteData = useCallback(
    async (route: string, config: PreloadConfig = { priority: "medium" }) => {
      if (preloadedRoutes.has(route)) return

      // Verificar condición si existe
      if (config.condition && !config.condition()) return

      // Aplicar delay si está configurado
      if (config.delay) {
        await new Promise((resolve) => setTimeout(resolve, config.delay))
      }

      setIsPreloading(true)

      try {
        let data = null

        // Precargar datos específicos según la ruta
        switch (route) {
          case "/dashboard":
            data = await preloadDashboardData()
            break
          case "/eventos":
            data = await preloadEventsData()
            break
          case "/perfil":
            data = await preloadProfileData()
            break
          case "/notificaciones":
            data = await preloadNotificationsData()
            break
<<<<<<< HEAD
            default:
              // Para rutas dinámicas como /eventos/[id]
              if (route.startsWith("/eventos/")) {
                const eventId = route.split("/")[2]
                // Evitar precargar en la ruta de creación
                if (eventId && eventId !== "crear") {
                  data = await preloadEventDetailsData(eventId)
                }
              }
              break
=======
          default:
            // Para rutas dinámicas como /eventos/[id]
            if (route.startsWith("/eventos/")) {
              const eventId = route.split("/")[2]
              data = await preloadEventDetailsData(eventId)
            }
            break
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
        }

        if (data) {
          // Guardar en cache con expiración
          preloadCache.current[route] = {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + (config.priority === "high" ? 300000 : 600000), // 5-10 min
          }

          setPreloadedRoutes((prev) => new Set([...prev, route]))
        }
      } catch (error) {
        console.error(`Error preloading ${route}:`, error)
      } finally {
        setIsPreloading(false)
      }
    },
    [preloadedRoutes],
  )

  // Precargar rutas basadas en patrones de usuario
  const preloadPredictedRoutes = useCallback(
    (currentRoute: string) => {
      const predictedRoutes = getPredictedRoutes(currentRoute)

      predictedRoutes.forEach((route, index) => {
        const priority = index === 0 ? "high" : index === 1 ? "medium" : "low"
        const delay = index * 1000 // Escalonar las precargas

        preloadRouteData(route, {
          priority,
          delay,
          condition: () => navigator.connection?.effectiveType !== "slow-2g",
        })
      })
    },
    [getPredictedRoutes, preloadRouteData],
  )

  // Obtener datos precargados
  const getPreloadedData = useCallback((route: string) => {
    const cached = preloadCache.current[route]
    if (!cached) return null

    // Verificar si los datos han expirado
    if (Date.now() > cached.expiry) {
      delete preloadCache.current[route]
      setPreloadedRoutes((prev) => {
        const newSet = new Set(prev)
        newSet.delete(route)
        return newSet
      })
      return null
    }

    return cached.data
  }, [])

  // Limpiar cache expirado
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now()
    Object.keys(preloadCache.current).forEach((route) => {
      if (preloadCache.current[route].expiry < now) {
        delete preloadCache.current[route]
        setPreloadedRoutes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(route)
          return newSet
        })
      }
    })
  }, [])

  // Precargar en hover (para enlaces)
  const preloadOnHover = useCallback(
    (route: string) => {
      if (!preloadedRoutes.has(route)) {
        preloadRouteData(route, { priority: "high", delay: 100 })
      }
    },
    [preloadRouteData, preloadedRoutes],
  )

  // Limpiar cache periódicamente
  useEffect(() => {
    const interval = setInterval(cleanExpiredCache, 60000) // Cada minuto
    return () => clearInterval(interval)
  }, [cleanExpiredCache])

  return {
    trackRouteVisit,
    preloadPredictedRoutes,
    preloadRouteData,
    getPreloadedData,
    preloadOnHover,
    isPreloading,
    preloadedRoutes: Array.from(preloadedRoutes),
    userPatterns: userPatterns.current,
  }
}

// Funciones de precarga específicas para cada ruta
async function preloadDashboardData() {
  const [stats, events, notifications] = await Promise.all([
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .catch(() => null),
    fetch("/api/dashboard/events")
      .then((r) => r.json())
      .catch(() => null),
    fetch("/api/dashboard/notifications")
      .then((r) => r.json())
      .catch(() => null),
  ])

  return { stats, events, notifications }
}

async function preloadEventsData() {
  const [categories, popular, events] = await Promise.all([
    fetch("/api/events/categories")
      .then((r) => r.json())
      .catch(() => null),
    fetch("/api/events/popular")
      .then((r) => r.json())
      .catch(() => null),
<<<<<<< HEAD
    fetch("/api/events/buscar?limit=12")
=======
    fetch("/api/events/search?limit=12")
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
      .then((r) => r.json())
      .catch(() => null),
  ])

  return { categories, popular, events }
}

async function preloadProfileData() {
  const [profile, stats] = await Promise.all([
    fetch("/api/profile")
      .then((r) => r.json())
      .catch(() => null),
    fetch("/api/profile/stats")
      .then((r) => r.json())
      .catch(() => null),
  ])

  return { profile, stats }
}

async function preloadNotificationsData() {
  const notifications = await fetch("/api/notifications")
    .then((r) => r.json())
    .catch(() => null)

  return { notifications }
}

async function preloadEventDetailsData(eventId: string) {
  const [event, similar] = await Promise.all([
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .catch(() => null),
    fetch(`/api/events/${eventId}/similar`)
      .then((r) => r.json())
      .catch(() => null),
  ])

  return { event, similar }
}
