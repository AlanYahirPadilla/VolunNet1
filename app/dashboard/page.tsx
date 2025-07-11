"use client"

import { useEffect, useState } from "react"
import { TopHeader } from "@/components/dashboard/top-header"
import { EnhancedSidebar } from "@/components/dashboard/enhanced-sidebar"
import { CustomWidgets } from "@/components/dashboard/custom-widgets"
import { EventCard } from "@/components/dashboard/event-card"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { Star } from "lucide-react"
import { getPersonalizedRecommendations, getUserStats, getRecentNotifications } from "./actions"
import { getCurrentUser } from "../auth/actions"
import { AdaptiveLoading } from "@/components/ui/adaptive-loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
}

interface UserStats {
  total_applications: number
  accepted_applications: number
  completed_events: number
  total_hours: number
  favorite_categories: string[]
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  read: boolean
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingSteps, setLoadingSteps] = useState([
    { id: "user", label: "Cargando información del usuario", status: "loading" as const },
    { id: "stats", label: "Obteniendo estadísticas", status: "pending" as const },
    { id: "events", label: "Buscando eventos recomendados", status: "pending" as const },
    { id: "notifications", label: "Cargando notificaciones", status: "pending" as const },
  ])

  const updateLoadingStep = (stepId: string, status: "loading" | "completed" | "error") => {
    setLoadingSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  useEffect(() => {
    async function loadData() {
      const startTime = Date.now()
      console.log("🚀 Iniciando carga optimizada del dashboard...")

      try {
        // Cargar usuario primero
        updateLoadingStep("user", "loading")
        try {
          const currentUser = await getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
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
        const totalTime = Date.now() - startTime
        console.log(`✅ Carga completa del dashboard en ${totalTime}ms`)
      } catch (error) {
        console.error("Error general en carga de datos:", error)
        setError("Error cargando el dashboard. Por favor, recarga la página.")
        setLoadingSteps((prev) =>
          prev.map((step) =>
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
  }, [])

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

  const handleEventClick = (event: Event) => {
    console.log("Evento seleccionado:", event)
    // Aquí puedes agregar la lógica para mostrar detalles del evento
  }

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

  return (
    <AdaptiveLoading type="dashboard" isLoading={loading} loadingSteps={loadingSteps}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
        <EnhancedSidebar
          user={user || { firstName: "Alan Padilla", lastName: "Venegas", role: "Voluntario" }}
          upcomingEvents={upcomingEvents}
          stats={sidebarStats}
        />

        <div className="lg:pl-80">
          {/* Header superior */}
          <TopHeader
            user={user || { firstName: "Alan Padilla", lastName: "Venegas", role: "VOLUNTEER" }}
            notifications={notifications}
          />

          <main className="py-6 lg:py-8">
            <div className="max-w-6xl mx-auto px-4 lg:px-8">
              {/* Contenido principal con tabs */}
              <Tabs defaultValue="dashboard" className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                  <TabsList className="bg-white shadow-sm border w-full sm:w-auto">
                    <TabsTrigger
                      value="dashboard"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm flex-1 sm:flex-none"
                    >
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger
                      value="calendario"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm flex-1 sm:flex-none"
                    >
                      Calendario
                    </TabsTrigger>
                    <TabsTrigger
                      value="recomendados"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm flex-1 sm:flex-none"
                    >
                      Recomendados
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="dashboard" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna principal - Widgets personalizados */}
                    <div className="lg:col-span-2">
                      <CustomWidgets stats={stats} upcomingEvents={upcomingEvents} />
                    </div>

                    {/* Columna lateral - Widgets adicionales */}
                    <div className="space-y-6">
                      {/* Widget de eventos recomendados compacto */}
                      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center text-lg text-gray-800">
                            <Star className="h-5 w-5 mr-2 text-indigo-600" />
                            Sugerencias
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {Array.isArray(events) && events.length > 0 ? (
                            <div className="space-y-3">
                              {events.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className="p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-200 transition-colors cursor-pointer"
                                  onClick={() => handleEventClick(event)}
                                >
                                  <h5 className="font-medium text-gray-900 text-sm">{event.title}</h5>
                                  <p className="text-xs text-gray-500 mt-1">{event.organization_name}</p>
                                  <p className="text-xs text-indigo-600 mt-1">
                                    {new Date(event.start_date).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                </div>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              >
                                Ver más sugerencias
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <Star className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Cargando sugerencias...</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="calendario" className="mt-0">
                  <CalendarView events={events} onEventClick={handleEventClick} />
                </TabsContent>

                <TabsContent value="recomendados" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center text-lg text-gray-800">
                            <Star className="h-5 w-5 mr-2 text-yellow-600" />
                            Eventos Recomendados para Ti
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {Array.isArray(events) && events.length > 0 ? (
                            <div className="grid gap-4">
                              {events.slice(0, 4).map((event) => (
                                <EventCard key={event.id} event={event} />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Star className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                              <p className="text-gray-500 mb-2">No hay recomendaciones disponibles</p>
                              <p className="text-sm text-gray-400 mb-4">
                                Completa tu perfil para recibir mejores recomendaciones
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-yellow-300 hover:bg-yellow-50 bg-transparent"
                              >
                                Completar perfil
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <CustomWidgets stats={stats} upcomingEvents={upcomingEvents} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </AdaptiveLoading>
  )
}
