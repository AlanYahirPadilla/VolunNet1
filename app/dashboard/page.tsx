"use client"

<<<<<<< HEAD
import { useEffect, useState, useRef, useCallback } from "react"
=======
import { useEffect, useState, useRef } from "react"
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { TopHeader } from "@/components/dashboard/top-header"
import { EnhancedSidebar } from "@/components/dashboard/enhanced-sidebar"
import { CustomWidgets } from "@/components/dashboard/custom-widgets"
import { EventCard } from "@/components/dashboard/event-card"
import { CalendarView } from "@/components/dashboard/calendar-view"
<<<<<<< HEAD
import { Star, Heart, Home, Calendar, Users, Bell, LogOut, User, Settings, Search } from "lucide-react"
import Link from "next/link"
import { getPersonalizedRecommendations, getUserStats, getRecentNotifications, getRecentCompletedEvents } from "./actions"
import { getCurrentUser } from "../auth/actions"
import { AdaptiveLoading } from "@/components/ui/adaptive-loading"
import { safeAsync, logError, safeStateUpdate, safeFetch } from "@/lib/error-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ApplicationStatusBadge } from "@/components/ui/application-status-badge"
=======
import { Star, Heart, Home, Calendar, Users, Bell, LogOut, User, Settings } from "lucide-react"
import Link from "next/link"
import { getPersonalizedRecommendations, getUserStats, getRecentNotifications } from "./actions"
import { getCurrentUser } from "../auth/actions"
import { AdaptiveLoading } from "@/components/ui/adaptive-loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb

interface Event {
  id: string
  title: string
  description: string
  organization_name: string
  city: string
  state: string
  start_date: string
  end_date?: string
  max_volunteers: number
  current_volunteers: number
  category_name: string
  skills: string[]
  recommendation_score?: number
  recommendation_reasons?: string[]
<<<<<<< HEAD
  hasApplied?: boolean
  applicationStatus?: string
=======
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
}

interface UserStats {
  total_applications: number
  accepted_applications: number
  completed_events: number
  total_hours: number
  favorite_categories: string[]
  averageRating?: number;
  eventsParticipated?: number;
  hoursCompleted?: number;
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  read: boolean
}

// Agrega el tipo explícito para los pasos de carga
type LoadingStepStatus = "loading" | "pending" | "completed" | "error";
interface LoadingStep {
  id: string;
  label: string;
  status: LoadingStepStatus;
}

<<<<<<< HEAD
// Dashboard Error Boundary Component
function DashboardErrorBoundary({ children }: { children: any }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default function Dashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])
=======
export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
  const [stats, setStats] = useState<UserStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [voluntario, setVoluntario] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: "user", label: "Cargando información del usuario", status: "loading" },
    { id: "stats", label: "Obteniendo estadísticas", status: "pending" },
    { id: "events", label: "Buscando eventos recomendados", status: "pending" },
    { id: "notifications", label: "Cargando notificaciones", status: "pending" },
  ])
<<<<<<< HEAD
  
  // Estados para el modal de postulación
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<'checking' | 'already-applied' | 'can-apply' | 'applying' | 'success' | 'error'>('checking')
  const [modalMessage, setModalMessage] = useState('')

  // Use refs to prevent double effect execution
  const isInitialized = useRef(false)
  const abortController = useRef<AbortController | null>(null)

  const updateLoadingStep = useCallback((stepId: string, status: "loading" | "completed" | "error") => {
    setLoadingSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }, [])

  const loadMyEvents = useCallback(async () => {
    try {
      console.log("🔄 Cargando mis eventos...")
      const response = await safeFetch("/api/events/apply", { 
        credentials: "include",
        signal: abortController.current?.signal
      }, 8000)
      
      if (response.ok) {
        const data = await response.json()
        console.log("📋 Respuesta de la API:", data)
        
        if (data.applications && data.applications.length > 0) {
          console.log("📋 Aplicaciones encontradas:", data.applications.length)
          
          // Crear eventos directamente desde las aplicaciones con datos reales
          const eventsFromApplications = data.applications.map((app: any) => {
            // Formatear la fecha correctamente
            const eventDate = new Date(app.event_start_date)
            const formattedDate = eventDate.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            })
            
            return {
              id: app.eventId,
              title: app.event_title || "Evento sin título",
              description: "Descripción del evento",
              organization_name: app.organization_name || "Organización no especificada",
              city: "Guadalajara",
              state: "Jalisco",
              start_date: app.event_start_date || new Date().toISOString(),
              max_volunteers: 10,
              current_volunteers: 5,
              category_name: "Sin categoría",
              skills: [],
              applicationStatus: app.status,
              applicationId: app.id,
              // Datos adicionales para mostrar
              formattedDate: formattedDate
            }
          })
          
          console.log("📋 Eventos creados:", eventsFromApplications)
          console.log("📋 Estados de aplicación:", eventsFromApplications.map(e => ({ title: e.title, status: e.applicationStatus })))
          
          console.log("✅ Eventos creados desde aplicaciones:", eventsFromApplications)
          safeStateUpdate(setMyEvents, eventsFromApplications)
        } else {
          console.log("📋 No hay aplicaciones")
          safeStateUpdate(setMyEvents, [])
        }
      } else {
        console.error("❌ Error en la respuesta:", response.status)
        safeStateUpdate(setMyEvents, [])
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("🔄 Carga de eventos cancelada")
        return
      }
      logError("Error loading my events", error)
      safeStateUpdate(setMyEvents, [])
    }
  }, [])

  // Separate data loading functions to prevent race conditions
  const loadUserData = useCallback(async () => {
    try {
      updateLoadingStep("user", "loading")
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        // Obtener perfil de voluntario
        try {
          const res = await fetch("/api/perfil/voluntario", { 
            credentials: "include",
            signal: abortController.current?.signal
          })
          if (res.ok) {
            const data = await res.json()
            setVoluntario(data.voluntario)
          }
        } catch (profileError) {
          console.warn("Error cargando perfil de voluntario:", profileError)
        }
        updateLoadingStep("user", "completed")
      } else {
        updateLoadingStep("user", "error")
        setUser({ firstName: "Alan Padilla", lastName: "Venegas", role: "VOLUNTEER" })
      }
    } catch (userError) {
      console.error("Error cargando usuario:", userError)
      updateLoadingStep("user", "error")
      setUser({ firstName: "Alan Padilla", lastName: "Venegas", role: "VOLUNTEER" })
    }
  }, [updateLoadingStep])

  const loadStatsData = useCallback(async () => {
    try {
      updateLoadingStep("stats", "loading")
      const statsResponse = await getUserStats()
      const statsData = statsResponse?.stats ||
        statsResponse || {
          total_applications: 12,
          accepted_applications: 8,
          completed_events: 5,
          total_hours: 24,
          favorite_categories: ["Educación", "Medio Ambiente"],
          averageRating: 4.5,
          eventsParticipated: 24,
          hoursCompleted: 156,
        }
      setStats(statsData)
      updateLoadingStep("stats", "completed")
    } catch (statsError) {
      console.error("Error cargando estadísticas:", statsError)
      updateLoadingStep("stats", "error")
      setStats({
        total_applications: 12,
        accepted_applications: 8,
        completed_events: 5,
        total_hours: 24,
        favorite_categories: ["Educación", "Medio Ambiente"],
        averageRating: 4.5,
        eventsParticipated: 24,
        hoursCompleted: 156,
      })
    }
  }, [updateLoadingStep])

  const loadEventsData = useCallback(async () => {
    try {
      updateLoadingStep("events", "loading")
      console.log("🔄 Iniciando carga de eventos desde API...")
      
      // Crear un nuevo AbortController específico para esta petición
      const eventsAbortController = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log("⏰ Timeout de 30 segundos alcanzado, cancelando petición de eventos")
        eventsAbortController.abort()
      }, 30000) // 30 segundos de timeout
      
      try {
        // Cargar eventos reales desde la API
        const response = await fetch('/api/eventos?limit=10', {
          signal: eventsAbortController.signal
        })
        
        clearTimeout(timeoutId) // Limpiar timeout si la petición se completa
        console.log("📡 Respuesta de la API:", response.status, response.statusText)
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("📊 Datos de eventos recibidos:", data)
        
        if (data.events && Array.isArray(data.events)) {
          console.log("✅ Eventos encontrados:", data.events.length)
          const realEvents = data.events.map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            organization_name: e.organization_name,
            city: e.city,
            state: e.state,
            start_date: e.startDate || e.start_date,
            end_date: e.endDate || e.end_date,
            max_volunteers: e.maxVolunteers || e.max_volunteers || 10,
            current_volunteers: e.currentVolunteers || e.current_volunteers || 0,
            category_name: e.category_name,
            skills: e.skills || [],
            requirements: e.requirements || [],
            benefits: e.benefits || [],
            status: e.status,
            imageUrl: e.imageUrl,
            hasApplied: false, // Se actualizará después
            applicationStatus: undefined, // Se actualizará después
          }))
          
          console.log("🎯 Eventos procesados:", realEvents)
          
          // Verificar el estado de postulación para cada evento
          const eventsWithApplicationStatus = await Promise.all(
            realEvents.map(async (event) => {
              try {
                const checkResponse = await fetch(`/api/events/apply?eventId=${event.id}`)
                if (checkResponse.ok) {
                  const checkData = await checkResponse.json()
                  return {
                    ...event,
                    hasApplied: checkData.hasApplied,
                    applicationStatus: checkData.application?.status
                  }
                }
              } catch (error) {
                console.warn(`Error checking application status for event ${event.id}:`, error)
              }
              return event
            })
          )
          
          safeStateUpdate(setEvents, eventsWithApplicationStatus)
        } else {
          console.log("⚠️ No se encontraron eventos reales, usando eventos de ejemplo")
          // Fallback a eventos de ejemplo si no hay eventos reales
          const sampleEvents = [
            {
              id: "sample-1",
              title: "Limpieza de Playa Vallarta",
              description: "Actividad de limpieza en la playa principal de Puerto Vallarta",
              organization_name: "EcoMar Jalisco",
              city: "Puerto Vallarta",
              state: "Jalisco",
              start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              max_volunteers: 20,
              current_volunteers: 8,
              category_name: "Medio Ambiente",
              skills: ["Trabajo en equipo", "Resistencia física"],
            },
            {
              id: "sample-2",
              title: "Taller de Programación para Niños",
              description: "Enseñanza básica de programación a niños de primaria",
              organization_name: "CodeForAll",
              city: "Guadalajara",
              state: "Jalisco",
              start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              max_volunteers: 10,
              current_volunteers: 3,
              category_name: "Educación",
              skills: ["Programación", "Paciencia", "Comunicación"],
            },
            {
              id: "sample-3",
              title: "Donación de Alimentos",
              description: "Recolección y distribución de alimentos para familias necesitadas",
              organization_name: "Banco de Alimentos GDL",
              city: "Zapopan",
              state: "Jalisco",
              start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              max_volunteers: 15,
              current_volunteers: 12,
              category_name: "Asistencia Social",
              skills: ["Organización", "Trabajo en equipo"],
            },
          ]
          safeStateUpdate(setEvents, sampleEvents)
        }
        
        updateLoadingStep("events", "completed")
      } catch (fetchError) {
        clearTimeout(timeoutId) // Limpiar timeout en caso de error
        throw fetchError
      }
    } catch (eventsError) {
      if (eventsError instanceof Error && eventsError.name === 'AbortError') {
        console.log("🔄 Carga de eventos cancelada por timeout")
        // Mostrar eventos de ejemplo en caso de timeout
        const timeoutEvents = [
          {
            id: "timeout-1",
            title: "Limpieza de Playa Vallarta",
            description: "Actividad de limpieza en la playa principal de Puerto Vallarta",
            organization_name: "EcoMar Jalisco",
            city: "Puerto Vallarta",
            state: "Jalisco",
            start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            max_volunteers: 20,
            current_volunteers: 8,
            category_name: "Medio Ambiente",
            skills: ["Trabajo en equipo", "Resistencia física"],
          },
          {
            id: "timeout-2",
            title: "Taller de Programación para Niños",
            description: "Enseñanza básica de programación a niños de primaria",
            organization_name: "CodeForAll",
            city: "Guadalajara",
            state: "Jalisco",
            start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            max_volunteers: 10,
            current_volunteers: 3,
            category_name: "Educación",
            skills: ["Programación", "Paciencia", "Comunicación"],
          },
        ]
        safeStateUpdate(setEvents, timeoutEvents)
        updateLoadingStep("events", "completed")
        
        // Cargar eventos recientes completados
        try {
          const completedResult = await getRecentCompletedEvents()
          if (completedResult.events) {
            setCompletedEvents(completedResult.events)
            console.log(`✅ Cargados ${completedResult.events.length} eventos completados`)
          }
        } catch (error) {
          console.warn("Error cargando eventos completados:", error)
        }
        
        return
      }
      
      console.error("❌ Error cargando eventos:", eventsError)
      updateLoadingStep("events", "error")
      
      // En caso de error, mostrar eventos de ejemplo
      console.log("🔄 Mostrando eventos de ejemplo debido al error")
      const fallbackEvents = [
        {
          id: "fallback-1",
          title: "Limpieza de Playa Vallarta",
          description: "Actividad de limpieza en la playa principal de Puerto Vallarta",
          organization_name: "EcoMar Jalisco",
          city: "Puerto Vallarta",
          state: "Jalisco",
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          max_volunteers: 20,
          current_volunteers: 8,
          category_name: "Medio Ambiente",
          skills: ["Trabajo en equipo", "Resistencia física"],
        },
        {
          id: "fallback-2",
          title: "Taller de Programación para Niños",
          description: "Enseñanza básica de programación a niños de primaria",
          organization_name: "CodeForAll",
          city: "Guadalajara",
          state: "Jalisco",
          start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          max_volunteers: 10,
          current_volunteers: 3,
          category_name: "Educación",
          skills: ["Programación", "Paciencia", "Comunicación"],
        },
        {
          id: "fallback-3",
          title: "Donación de Alimentos",
          description: "Recolección y distribución de alimentos para familias necesitadas",
          organization_name: "Banco de Alimentos GDL",
          city: "Zapopan",
          state: "Jalisco",
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_volunteers: 15,
          current_volunteers: 12,
          category_name: "Asistencia Social",
          skills: ["Organización", "Trabajo en equipo"],
        },
      ]
      safeStateUpdate(setEvents, fallbackEvents)
    }
  }, [updateLoadingStep])

  const loadNotificationsData = useCallback(async () => {
    try {
      updateLoadingStep("notifications", "loading")
      
      // Intentar cargar notificaciones reales desde la API
      const response = await fetch('/api/notifications?limit=5', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const notificationsData = data.notifications || []
        setNotifications(notificationsData)
      } else {
        // Fallback a notificaciones mock si la API falla
        const notificationsData = [
          {
            id: "1",
            title: "Nuevo evento disponible",
            message: "Se ha publicado un nuevo evento de limpieza de playa",
            type: "info",
            created_at: new Date().toISOString(),
            read: false,
          },
          {
            id: "2",
            title: "Aplicación aceptada",
            message: "Tu aplicación para el taller de programación ha sido aceptada",
            type: "success",
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
          },
          {
            id: "3",
            title: "Recordatorio de evento",
            message: "Tu evento de mañana comienza a las 9:00 AM",
            type: "reminder",
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: true,
          },
        ]
        setNotifications(notificationsData)
      }
      
      updateLoadingStep("notifications", "completed")
    } catch (notificationsError) {
      console.error("Error cargando notificaciones:", notificationsError)
      updateLoadingStep("notifications", "error")
      setNotifications([])
    }
  }, [updateLoadingStep])

  useEffect(() => {
    // Prevent double execution
    if (isInitialized.current) {
      return
    }
    isInitialized.current = true

=======

  const updateLoadingStep = (stepId: string, status: "loading" | "completed" | "error") => {
    setLoadingSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  useEffect(() => {
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
    async function loadData() {
      const startTime = Date.now()
      console.log("🚀 Iniciando carga optimizada del dashboard...")

      try {
<<<<<<< HEAD
        // Load user data first
        await loadUserData()

        // Load user events
        await loadMyEvents()

        // Load other data in parallel with proper error handling
        await Promise.allSettled([
          loadStatsData(),
          loadEventsData(),
          loadNotificationsData(),
        ])

=======
        // Cargar usuario primero
        updateLoadingStep("user", "loading")
        try {
          const currentUser = await getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            // Obtener perfil de voluntario
            const res = await fetch("/api/perfil/voluntario", { credentials: "include" })
            if (res.ok) {
              const data = await res.json()
              setVoluntario(data.voluntario)
            }
            updateLoadingStep("user", "completed")
          } else {
            updateLoadingStep("user", "error")
            setUser({ firstName: "Alan Padilla", lastName: "Venegas", role: "VOLUNTEER" })
          }
        } catch (userError) {
          console.error("Error cargando usuario:", userError)
          updateLoadingStep("user", "error")
          setUser({ firstName: "Alan Padilla", lastName: "Venegas", role: "VOLUNTEER" })
        }

        // Cargar datos en paralelo
        const dataPromises = [
          // Estadísticas
          (async () => {
            updateLoadingStep("stats", "loading")
            try {
              const statsResponse = await getUserStats()
              const statsData = statsResponse?.stats ||
                statsResponse || {
                  total_applications: 12,
                  accepted_applications: 8,
                  completed_events: 5,
                  total_hours: 24,
                  favorite_categories: ["Educación", "Medio Ambiente"],
                  averageRating: 4.5,
                  eventsParticipated: 24,
                  hoursCompleted: 156,
                }
              setStats(statsData)
              updateLoadingStep("stats", "completed")
            } catch (statsError) {
              console.error("Error cargando estadísticas:", statsError)
              updateLoadingStep("stats", "error")
              setStats({
                total_applications: 12,
                accepted_applications: 8,
                completed_events: 5,
                total_hours: 24,
                favorite_categories: ["Educación", "Medio Ambiente"],
                averageRating: 4.5,
                eventsParticipated: 24,
                hoursCompleted: 156,
              })
            }
          })(),

          // Eventos recomendados
          (async () => {
            updateLoadingStep("events", "loading")
            try {
              const eventsResponse = await getPersonalizedRecommendations()
              const eventsData = Array.isArray(eventsResponse) ? eventsResponse : eventsResponse?.recommendations || []

              // Agregar algunos eventos de ejemplo para demostrar el calendario
              const sampleEvents = [
                {
                  id: "sample-1",
                  title: "Limpieza de Playa Vallarta",
                  description: "Actividad de limpieza en la playa principal de Puerto Vallarta",
                  organization_name: "EcoMar Jalisco",
                  city: "Puerto Vallarta",
                  state: "Jalisco",
                  start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                  max_volunteers: 20,
                  current_volunteers: 8,
                  category_name: "Medio Ambiente",
                  skills: ["Trabajo en equipo", "Resistencia física"],
                },
                {
                  id: "sample-2",
                  title: "Taller de Programación para Niños",
                  description: "Enseñanza básica de programación a niños de primaria",
                  organization_name: "CodeForAll",
                  city: "Guadalajara",
                  state: "Jalisco",
                  start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                  max_volunteers: 10,
                  current_volunteers: 3,
                  category_name: "Educación",
                  skills: ["Programación", "Paciencia", "Comunicación"],
                },
                {
                  id: "sample-3",
                  title: "Donación de Alimentos",
                  description: "Recolección y distribución de alimentos para familias necesitadas",
                  organization_name: "Banco de Alimentos GDL",
                  city: "Zapopan",
                  state: "Jalisco",
                  start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  max_volunteers: 15,
                  current_volunteers: 12,
                  category_name: "Asistencia Social",
                  skills: ["Organización", "Trabajo en equipo"],
                },
                {
                  id: "sample-4",
                  title: "Construcción de Casa Habitación",
                  description: "Apoyo en construcción de vivienda para familia de bajos recursos",
                  organization_name: "Hábitat para la Humanidad",
                  city: "Tlaquepaque",
                  state: "Jalisco",
                  start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                  max_volunteers: 25,
                  current_volunteers: 18,
                  category_name: "Construcción",
                  skills: ["Construcción", "Trabajo físico", "Herramientas"],
                },
              ]

              setEvents([...eventsData, ...sampleEvents])
              updateLoadingStep("events", "completed")
            } catch (eventsError) {
              console.error("Error cargando eventos:", eventsError)
              updateLoadingStep("events", "error")
              setEvents([])
            }
          })(),

          // Notificaciones
          (async () => {
            updateLoadingStep("notifications", "loading")
            try {
              const notificationsResponse = await getRecentNotifications()
              const notificationsData = notificationsResponse?.notifications || [
                {
                  id: "1",
                  title: "Nuevo evento disponible",
                  message: "Se ha publicado un nuevo evento de limpieza de playa",
                  type: "info",
                  created_at: new Date().toISOString(),
                  read: false,
                },
                {
                  id: "2",
                  title: "Aplicación aceptada",
                  message: "Tu aplicación para el taller de programación ha sido aceptada",
                  type: "success",
                  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  read: false,
                },
                {
                  id: "3",
                  title: "Recordatorio de evento",
                  message: "Tu evento de mañana comienza a las 9:00 AM",
                  type: "reminder",
                  created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                  read: true,
                },
              ]
              setNotifications(notificationsData)
              updateLoadingStep("notifications", "completed")
            } catch (notificationsError) {
              console.error("Error cargando notificaciones:", notificationsError)
              updateLoadingStep("notifications", "error")
              setNotifications([])
            }
          })(),
        ]

        await Promise.allSettled(dataPromises)
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
        const totalTime = Date.now() - startTime
        console.log(`✅ Carga completa del dashboard en ${totalTime}ms`)
      } catch (error) {
        console.error("Error general en carga de datos:", error)
        setError("Error cargando el dashboard. Por favor, recarga la página.")
<<<<<<< HEAD
        setLoadingSteps((prev: LoadingStep[]) =>
          prev.map((step: LoadingStep) =>
=======
        setLoadingSteps((prev) =>
          prev.map((step) =>
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
            step.status === "loading" || step.status === "pending" ? { ...step, status: "error" } : step,
          ),
        )
      } finally {
        const minLoadingTime = 800
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsed)

        setTimeout(() => {
          setLoading(false)
        }, remainingTime)
      }
    }

    loadData()
<<<<<<< HEAD

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [loadUserData, loadMyEvents, loadStatsData, loadEventsData, loadNotificationsData])
=======
  }, [])
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb

  // Datos para la barra lateral
  const sidebarStats = {
    completedEvents: stats?.completed_events || 5,
    totalHours: stats?.total_hours || 24,
    profileCompletion: 75,
  }

  const upcomingEvents = events.slice(0, 3).map((event) => ({
    id: event.id,
    title: event.title,
    date: new Date(event.start_date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    location: `${event.city}, ${event.state}`,
  }))

<<<<<<< HEAD
  const handleEventClick = async (event: Event) => {
    if (!user) {
      router.push("/login")
      return
    }

    setSelectedEvent(event)
    setShowApplicationModal(true)
    setApplicationStatus('checking')
    setModalMessage('Verificando estado de postulación...')

    try {
      // Verificar si ya se ha postulado
      const checkResponse = await fetch(`/api/events/apply?eventId=${event.id}&volunteerId=${user.id}`)
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json()
        
        if (checkData.applications && checkData.applications.length > 0) {
          // Ya se ha postulado
          setApplicationStatus('already-applied')
          setModalMessage('Ya te has postulado a este evento anteriormente')
          return
        }
      }

      // Si no se ha postulado, mostrar modal de confirmación
      setApplicationStatus('can-apply')
      setModalMessage('¿Estás seguro de que quieres postularte a este evento?')
    } catch (error) {
      console.error("Error checking application status:", error)
      setApplicationStatus('error')
      setModalMessage('Error al verificar el estado de la postulación')
    }
  }

  const confirmApplication = async () => {
    if (!selectedEvent) return

    setApplicationStatus('applying')
    setModalMessage('Enviando postulación...')

    try {
      const response = await fetch("/api/events/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: selectedEvent.id }),
      })

      if (response.ok) {
        // Actualizar el estado local para mostrar que se aplicó
        setEvents(prev => prev.map(e => 
          e.id === selectedEvent.id 
            ? { 
                ...e, 
                current_volunteers: e.current_volunteers + 1,
                hasApplied: true,
                applicationStatus: 'PENDING'
              }
            : e
        ))
        
        setApplicationStatus('success')
        setModalMessage('¡Postulación enviada exitosamente!')
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          setShowApplicationModal(false)
          setSelectedEvent(null)
          setApplicationStatus('checking')
          setModalMessage('')
        }, 2000)
      } else {
        const errorData = await response.json()
        if (response.status === 400 && errorData.error === "Ya te has postulado a este evento") {
          setApplicationStatus('already-applied')
          setModalMessage('Ya te has postulado a este evento anteriormente')
        } else {
          setApplicationStatus('error')
          setModalMessage(errorData.error || "Error al postularse al evento")
        }
      }
    } catch (error) {
      console.error("Error applying to event:", error)
      setApplicationStatus('error')
      setModalMessage('Error al postularse al evento')
    }
  }

  const closeModal = () => {
    setShowApplicationModal(false)
    setSelectedEvent(null)
    setApplicationStatus('checking')
    setModalMessage('')
=======
  const handleEventClick = (event: Event) => {
    console.log("Evento seleccionado:", event)
    // Aquí puedes agregar la lógica para mostrar detalles del evento
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
  }

  // Mapeo de iconos por categoría
  const CATEGORY_ICONS: Record<string, string> = {
    "Educación": "🎓",
    "Medio Ambiente": "🌱",
    "Salud": "❤️",
    "Alimentación": "🍽️",
    "Tecnología": "💻",
    "Deportes": "🏆",
    "Arte y Cultura": "🎨",
    "Construcción": "🔨",
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Carga</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Recargar Página
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // --- NUEVO LAYOUT ---
  return (
<<<<<<< HEAD
    <DashboardErrorBoundary>
      <AdaptiveLoading type="dashboard" isLoading={loading} loadingSteps={loadingSteps}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
=======
    <AdaptiveLoading type="dashboard" isLoading={loading} loadingSteps={loadingSteps}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
        {/* Header superior tipo LinkedIn */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
            {/* Logo con corazón azul */}
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 focus:outline-none"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                title="Ir al inicio"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
              </button>
            </div>
            {/* Barra de búsqueda */}
            <div className="flex-1 mx-8 max-w-xl">
              <input
                type="text"
                placeholder="Buscar eventos, iglesias..."
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-700 shadow-sm"
              />
            </div>
            {/* Navegación */}
            <div className="flex items-center gap-6">
              <nav className="flex gap-2 text-gray-600 text-sm font-medium">
                <Link href="/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Inicio</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
<<<<<<< HEAD
                            <Link href="/eventos/buscar" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
              <Calendar className="h-5 w-5 group-hover:text-blue-700 transition" />
              <span>Eventos</span>
              <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
=======
                <Link href="/eventos" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Calendar className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Eventos</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
                <Link href="/comunidad" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Users className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Comunidad</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
                <Link href="/notificaciones" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Notificaciones</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              </nav>
              {/* Separador visual */}
              <div className="w-px h-8 bg-gray-200 mx-2" />
              {/* Avatar usuario con menú */}
              <UserMenu user={user} />
            </div>
          </div>
        </div>

        {/* Grid principal 3 columnas */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 py-6 grid grid-cols-1 md:grid-cols-[minmax(0,320px)_1fr_minmax(0,320px)] gap-6">
          {/* Columna Izquierda: Perfil y Próximos Eventos (más angosta y moderna) */}
          <div className="space-y-6 w-full max-w-xs mx-auto">
            {/* Tarjeta Perfil rediseñada animada */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-50 relative overflow-visible"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
            >
              <div className="relative mb-3">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 border-4 border-white shadow-lg flex items-center justify-center text-4xl text-blue-500 font-bold">
                  {user?.firstName?.[0] || 'M'}
                </div>
                <span className="absolute -bottom-2 right-0 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full shadow font-semibold border-2 border-white">★ Oro</span>
              </div>
              <div className="text-lg font-bold text-gray-900 text-center">{user?.firstName || 'María'} {user?.lastName || 'González'}</div>
              {/* Rol dinámico */}
              <div className="text-xs text-blue-700 font-semibold mb-1">{user?.role === 'VOLUNTEER' ? 'Voluntario' : user?.role || ''}</div>
              {/* Estrellas de calificación fraccionarias */}
              <div className="flex gap-1 mb-2 mt-1 items-center">
                {Array.from({ length: 5 }).map((_, i) => {
                  const rating = voluntario?.rating ?? stats?.averageRating ?? 0;
                  const isFull = i + 1 <= Math.floor(rating);
                  const isHalf = !isFull && i < rating;
                  return (
                    <span key={i} className="relative">
                      <Star className={`h-5 w-5 ${isFull ? 'text-yellow-400 fill-yellow-300' : isHalf ? 'text-yellow-400' : 'text-gray-200'}`} />
                      {isHalf && (
                        <span className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-300" />
                        </span>
                      )}
                    </span>
                  );
                })}
                <span className="ml-2 text-yellow-600 font-semibold text-sm">{(voluntario?.rating ?? stats?.averageRating ?? 0).toFixed(1)}</span>
              </div>
              {/* Ubicación real: ciudad y país */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Home className="h-4 w-4 text-blue-400" />
                <span>{voluntario?.city && voluntario?.country ? `${voluntario.city}, ${voluntario.country}` : 'Ubicación no registrada'}</span>
              </div>
              {/* Eventos y horas reales */}
              <div className="flex gap-6 mt-2 mb-1">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-blue-700">{voluntario?.eventsParticipated ?? stats?.eventsParticipated ?? 0}</span>
                  <span className="text-xs text-gray-500">Eventos</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-green-700">{voluntario?.hoursCompleted ?? stats?.hoursCompleted ?? 0}</span>
                  <span className="text-xs text-gray-500">Horas</span>
                </div>
              </div>
            </motion.div>
            {/* Próximos Eventos rediseñados animada */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-5 border border-blue-50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
            >
              <div className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Próximos Eventos
              </div>
              <ul className="space-y-3">
                {upcomingEvents.map(ev => (
                  <li key={ev.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-50 transition">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-blue-700 text-xs leading-tight truncate">{ev.title}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M4 11h16M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
                        {ev.date}
                        <svg className="h-3 w-3 text-gray-400 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 12.414a2 2 0 1 0-2.828 2.828l4.243 4.243a8 8 0 1 1 2.828-2.828z"/></svg>
                        {ev.location}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Columna Central: Tabs y Eventos */}
          <div className="space-y-6 col-span-1">
            {/* Tabs de eventos */}
            <Tabs defaultValue="disponibles" className="w-full">
              <TabsList className="w-full bg-gray-50 border rounded-lg mb-4">
                <TabsTrigger value="disponibles" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Eventos Disponibles</TabsTrigger>
                <TabsTrigger value="mis-eventos" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Mis Eventos</TabsTrigger>
<<<<<<< HEAD
                <TabsTrigger value="notificaciones" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Notificaciones</TabsTrigger>
                <TabsTrigger value="calificaciones" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Calificaciones</TabsTrigger>
              </TabsList>
              <TabsContent value="disponibles">
                <div className="space-y-5">
                  {/* Eventos Disponibles */}
=======
              </TabsList>
              <TabsContent value="disponibles">
                <div className="space-y-5">
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
                  {events.slice(0, 3).map((event, idx) => (
                    <motion.div
                      key={event.id}
                      className="bg-white rounded-3xl shadow-lg border border-blue-50 p-7 flex flex-col gap-3"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {/* Icono de categoría */}
                        {CATEGORY_ICONS[event.category_name] && (
                          <span className="text-xl mr-1">{CATEGORY_ICONS[event.category_name]}</span>
                        )}
                        <span className="font-bold text-blue-700 text-lg leading-tight">{event.title}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 ml-2 font-semibold">{event.category_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {event.organization_name}
                        <svg className="h-3 w-3 text-gray-400 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M4 11h16M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
                        {new Date(event.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {event.city}, {event.state}
                      </div>
                      <div className="text-sm text-gray-700 mb-2 line-clamp-2">{event.description}</div>
                      <div className="flex items-center gap-4 text-xs mb-2">
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                          {event.current_volunteers}/{event.max_volunteers} voluntarios
                        </span>
                        <span className="bg-green-100 text-green-700 rounded px-2 py-0.5 font-medium">
                          {event.max_volunteers - event.current_volunteers} lugares disponibles
                        </span>
                      </div>
<<<<<<< HEAD
                                          <div className="flex items-center justify-between mt-2">
                        <ApplicationStatusBadge 
                          hasApplied={event.hasApplied}
                          status={event.applicationStatus}
                        />
                        <div className="flex gap-2">
                          {!event.hasApplied && (
                            <Button 
                              size="sm" 
                              className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all"
                              onClick={() => handleEventClick(event)}
                            >
                              Postular
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-full px-5 py-2 font-semibold border-gray-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
                            onClick={() => window.location.href = `/eventos/${event.id}`}
                          >
                            Ver detalles
                          </Button>
                        </div>
                                              </div>
                      </motion.div>
                    ))}
                    
                    {/* Eventos Recientes Completados */}
                    {completedEvents.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          Eventos Recientes Completados
                        </h3>
                        <div className="space-y-3">
                          {completedEvents.slice(0, 3).map((event, idx) => (
                            <motion.div
                              key={event.id}
                              className="bg-gray-50 rounded-xl border border-gray-200 p-4"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">Completado</Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(event.start_date).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{event.organization_name}</span>
                                <span>{event.city}, {event.state}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
              </TabsContent>
              <TabsContent value="mis-eventos">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Mis Eventos Inscritos</h3>
                  <Button 
                    onClick={loadMyEvents}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Actualizar
                  </Button>
                </div>
                <div className="space-y-5">
                  {myEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes eventos inscritos</h3>
                      <p className="text-gray-600 mb-6">Postúlate a eventos para verlos aquí</p>
                      <Link href="/eventos/buscar">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                          <Search className="h-4 w-4 mr-2" />
                          Buscar Eventos
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    myEvents.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <EventCard 
                          event={event} 
                          showStatus={true}
                          applicationStatus={event.applicationStatus}
                        />
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              {/* Tab de Notificaciones */}
              <TabsContent value="notificaciones">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                    <Button 
                      onClick={() => window.location.href = '/notificaciones'}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Bell className="h-4 w-4" />
                      Ver Todas
                    </Button>
                  </div>
                  
                  {/* Lista de notificaciones recientes */}
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification, idx) => (
                        <motion.div
                          key={notification.id}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-gray-600 text-xs line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.created_at).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                        <p className="text-gray-600">Todas tus notificaciones aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab de Calificaciones */}
              <TabsContent value="calificaciones">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Calificaciones Pendientes</h3>
                    <Button 
                      onClick={() => window.location.href = '/calificaciones'}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Star className="h-4 w-4" />
                      Ver Todas
                    </Button>
                  </div>
                  
                  {/* Lista de eventos que necesitan calificación */}
                  <div className="space-y-3">
                    {completedEvents.filter(event => event.applicationStatus === 'COMPLETED').length > 0 ? (
                      completedEvents
                        .filter(event => event.applicationStatus === 'COMPLETED')
                        .slice(0, 3)
                        .map((event, idx) => (
                          <motion.div
                            key={event.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm mb-1">
                                  {event.title}
                                </h4>
                                <p className="text-gray-600 text-xs mb-2">
                                  {event.organization_name} • {new Date(event.start_date).toLocaleDateString('es-ES')}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                    Pendiente de calificación
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="ml-auto"
                                    onClick={() => window.location.href = `/calificaciones?eventId=${event.id}`}
                                  >
                                    Calificar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay calificaciones pendientes</h3>
                        <p className="text-gray-600">Los eventos completados aparecerán aquí para calificar</p>
                      </div>
                      )}
                  </div>
                </div>
=======
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all">Postular</Button>
                        <Button size="sm" variant="outline" className="rounded-full px-5 py-2 font-semibold border-gray-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all">Me gusta</Button>
                        <Button size="sm" variant="ghost" className="rounded-full px-5 py-2 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all">Comentar</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="mis-eventos">
                <div className="text-gray-500 text-sm text-center py-8">Aquí aparecerán tus eventos inscritos.</div>
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
              </TabsContent>
            </Tabs>
          </div>

          {/* Columna Derecha: Estadísticas y Voluntarios Destacados */}
          <div className="space-y-6 w-full max-w-xs mx-auto">
            {/* Estadísticas del Mes rediseñadas animada */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.13 }}
              whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
            >
              <div className="font-semibold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <svg className="h-5 w-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20.5V3.5"/><path d="M5 12h14"/></svg>
                Estadísticas del Mes
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-blue-700 font-medium">
                    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                    Eventos completados
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-100 rounded px-2 py-0.5">{stats?.completed_events ?? 0}</span>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-green-700 font-medium">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                    Horas servidas
                  </span>
                  <span className="font-bold text-green-700 bg-green-100 rounded px-2 py-0.5">{voluntario?.hoursCompleted ?? stats?.hoursCompleted ?? 0}</span>
                </div>
                <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-violet-700 font-medium">
                    <svg className="h-4 w-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15l4-4 4 4"/></svg>
                    Nuevos amigos
                  </span>
                  <span className="font-bold text-violet-700 bg-purple-100 rounded px-2 py-0.5"> </span>
                </div>
              </div>
            </motion.div>
            {/* Voluntarios Destacados rediseñados animada */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
            >
              <div className="font-semibold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                Voluntarios Destacados
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 bg-yellow-50 rounded-lg px-3 py-2 shadow-sm">
                  <span className="bg-yellow-400 text-white rounded-full px-2 py-1 text-xs font-bold">AM</span>
                  <span className="flex-1 font-medium text-gray-800">Ana Martínez</span>
                  <span className="text-yellow-500 font-bold">#1</span>
                </li>
                <li className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="bg-gray-300 text-gray-700 rounded-full px-2 py-1 text-xs font-bold">CR</span>
                  <span className="flex-1 font-medium text-gray-800">Carlos Ruiz</span>
                  <span className="text-gray-400 font-bold">#2</span>
                </li>
                <li className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="bg-gray-300 text-gray-700 rounded-full px-2 py-1 text-xs font-bold">LT</span>
                  <span className="flex-1 font-medium text-gray-800">Lucía Torres</span>
                  <span className="text-gray-400 font-bold">#3</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
<<<<<<< HEAD

      {/* Modal de Postulación */}
      {showApplicationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                {applicationStatus === 'checking' && (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {applicationStatus === 'already-applied' && (
                  <span className="text-white text-2xl">⚠️</span>
                )}
                {applicationStatus === 'can-apply' && (
                  <span className="text-white text-2xl">🎯</span>
                )}
                {applicationStatus === 'applying' && (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {applicationStatus === 'success' && (
                  <span className="text-white text-2xl">✅</span>
                )}
                {applicationStatus === 'error' && (
                  <span className="text-white text-2xl">❌</span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {applicationStatus === 'checking' && 'Verificando...'}
                {applicationStatus === 'already-applied' && 'Ya te has postulado'}
                {applicationStatus === 'can-apply' && 'Confirmar Postulación'}
                {applicationStatus === 'applying' && 'Enviando...'}
                {applicationStatus === 'success' && '¡Éxito!'}
                {applicationStatus === 'error' && 'Error'}
              </h3>
              
              <p className="text-gray-600 text-sm">
                {modalMessage}
              </p>
            </div>

            {/* Detalles del evento */}
            {selectedEvent && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedEvent.title}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📅</span>
                    <span>{new Date(selectedEvent.start_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📍</span>
                    <span>{selectedEvent.city}, {selectedEvent.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">👥</span>
                    <span>{selectedEvent.current_volunteers}/{selectedEvent.max_volunteers} voluntarios</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
              {applicationStatus === 'already-applied' && (
                <button
                  onClick={closeModal}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  Entendido
                </button>
              )}
              
              {applicationStatus === 'can-apply' && (
                <>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmApplication}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                  >
                    Confirmar
                  </button>
                </>
              )}
              
              {applicationStatus === 'success' && (
                <button
                  onClick={closeModal}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  ¡Perfecto!
                </button>
              )}
              
              {applicationStatus === 'error' && (
                <>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setApplicationStatus('can-apply')
                      setModalMessage('¿Estás seguro de que quieres postularte a este evento?')
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                  >
                    Reintentar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

        </AdaptiveLoading>
      </DashboardErrorBoundary>
=======
    </AdaptiveLoading>
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
  )
}

// Menú de usuario/avatar
function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú de usuario"
      >
        {user?.firstName?.[0] || 'M'}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-800 text-sm">{user?.firstName || 'María'} {user?.lastName || 'González'}</div>
            <div className="text-xs text-gray-500">{user?.email || 'voluntario@volunnet.com'}</div>
          </div>
          <Link
            href="/perfil"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
          >
            <User className="h-4 w-4 text-gray-500" />
            Perfil
          </Link>
          <Link
            href="/configuracion"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
          >
            <Settings className="h-4 w-4 text-gray-500" />
            Configuración
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-xl transition"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4 text-gray-500" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
