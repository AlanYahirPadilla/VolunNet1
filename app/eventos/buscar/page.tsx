"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Calendar, Users, Filter, Grid, List, Star, Clock, Building2, AlertTriangle, Heart, Home, Bell, ArrowLeft } from "lucide-react"
import { getCurrentUser } from "@/app/auth/actions"
import Link from "next/link"
import { ApplicationStatusBadge } from "@/components/ui/application-status-badge"

// Funciones auxiliares globales
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const getTimeUntilEvent = (dateString: string) => {
  const now = new Date()
  const eventDate = new Date(dateString)
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return "Evento pasado"
  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Mañana"
  return `En ${diffDays} días`
}

const getAvailabilityStatus = (event: Event) => {
  if (event.currentVolunteers >= event.maxVolunteers) {
    return { text: "Completo", color: "bg-red-100 text-red-700" }
  }
  if (event.currentVolunteers >= event.maxVolunteers * 0.8) {
    return { text: "Casi completo", color: "bg-yellow-100 text-yellow-700" }
  }
  return { text: "Disponible", color: "bg-green-100 text-green-700" }
}

interface Event {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  country: string
  startDate: string
  endDate: string
  maxVolunteers: number
  currentVolunteers: number
  skills: string[]
  requirements: string[]
  benefits: string[]
  imageUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
  organization_name: string
  organization_verified: boolean
  category_name: string
  category_icon: string
  category_color: string
  alreadyRegistered?: boolean
  hasApplied?: boolean
  applicationStatus?: string
}

interface Filters {
  query: string
  city: string
  state: string
  category: string | "all"
  skills: string[]
  maxDistance: number
  onlyVerified: boolean
  onlyAvailable: boolean
}

export default function EventSearchPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    query: "",
    city: "",
    state: "",
    category: "all",
    skills: [],
    maxDistance: 50,
    onlyVerified: false,
    onlyAvailable: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("date")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    console.log("🔍 useEffect ejecutándose - cargando datos iniciales")
    loadUser()
    fetchEvents()
  }, [])

  

  const loadUser = async () => {
    try {
      setUserLoading(true)
      const currentUser = await getCurrentUser()
      console.log("🔍 Usuario cargado:", currentUser)
      setUser(currentUser)
    } catch (error) {
      console.error("Error loading user:", error)
      setUser(null)
    } finally {
      setUserLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (filters.query) params.append("query", filters.query)
      if (filters.city) params.append("city", filters.city)
      if (filters.state) params.append("state", filters.state)
      if (filters.category) params.append("category", filters.category)
      params.append("limit", "50")
      params.append("upcomingOnly", "true")

      const response = await fetch(`/api/eventos?${params.toString()}`)
      if (response.ok) {
        let data = await response.json()
        
        console.log("🔍 Respuesta de la API eventos:", data)
        console.log("🔍 Tipo de data:", typeof data)
        console.log("🔍 Es array:", Array.isArray(data))
        
        // Verificar que data sea un array
        if (!Array.isArray(data)) {
          console.error("❌ Error: data no es un array:", data)
          // Intentar extraer eventos del objeto si existe
          if (data && typeof data === 'object' && data.events && Array.isArray(data.events)) {
            data = data.events
            console.log("✅ Eventos extraídos del objeto:", data)
          } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
            data = data.data
            console.log("✅ Eventos extraídos de data.data:", data)
          } else {
            console.error("❌ No se pudieron extraer eventos de la respuesta")
            setEvents([])
            return
          }
        }
        
        console.log("🔍 Eventos antes de filtros:", data.length)
        
        // Aplicar filtros adicionales del cliente
        if (filters.onlyVerified) {
          data = data.filter((event: Event) => event.organization_verified)
        }
        if (filters.onlyAvailable) {
          data = data.filter((event: Event) => event.currentVolunteers < event.maxVolunteers)
        }
        if (filters.category && filters.category !== "all") {
          data = data.filter((event: Event) => event.category_name === filters.category)
        }
        if (filters.skills.length > 0) {
          data = data.filter((event: Event) => 
            filters.skills.some(skill => event.skills.includes(skill))
          )
        }

        console.log("🔍 Eventos después de filtros:", data.length)

        // Aplicar ordenamiento
        data.sort((a: Event, b: Event) => {
          switch (sortBy) {
            case "date":
              return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            case "volunteers":
              return b.currentVolunteers - a.currentVolunteers
            case "title":
              return a.title.localeCompare(b.title)
            default:
              return 0
          }
        })

        console.log("🔍 Eventos finales:", data.length)
        
        // Verificar el estado de postulación para cada evento
        const eventsWithApplicationStatus = await Promise.all(
          data.map(async (event: Event) => {
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
        
        setEvents(eventsWithApplicationStatus)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

     const handleApply = async (event: Event) => {
     if (!user) {
       alert("Debes iniciar sesión para postularte a eventos")
       return
     }

     // Abrir modal de confirmación
     setSelectedEvent({ ...event, alreadyRegistered: false })
     setShowConfirmModal(true)
   }

  const confirmApplication = async () => {
    if (!selectedEvent) return

    try {
      const response = await fetch("/api/events/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEvent.id }),
      })

      const data = await response.json()

      if (response.ok) {
        // Actualizar el estado local para mostrar que se aplicó
        setEvents(prev => prev.map(e =>
          e.id === selectedEvent.id
            ? { 
                ...e, 
                currentVolunteers: e.currentVolunteers + 1,
                hasApplied: true,
                applicationStatus: 'PENDING'
              }
            : e
        ))
        
        // Mostrar mensaje apropiado según el estado
        if (data.status === 'ACCEPTED') {
          alert("¡Felicidades! Has sido aceptado al evento")
        } else {
          alert("Postulación enviada exitosamente. Estás en lista de espera.")
        }
        
        // Cerrar modal
        setShowConfirmModal(false)
        setSelectedEvent(null)
      } else {
        if (response.status === 400 && data.error === "Ya te has postulado a este evento") {
          alert("Ya te has postulado a este evento anteriormente")
        } else {
          alert(data.error || "Error al postularse al evento")
        }
        // Cerrar modal en caso de error
        setShowConfirmModal(false)
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error("Error applying to event:", error)
      alert("Error al postularse al evento")
      // Cerrar modal en caso de error
      setShowConfirmModal(false)
      setSelectedEvent(null)
    }
  }





  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando eventos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header con navegación como el dashboard */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y navegación izquierda */}
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver al Dashboard</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VolunNet
                </span>
              </div>
            </div>

            {/* Navegación central */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
              <Link href="/eventos/buscar" className="text-blue-600 font-medium flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Eventos</span>
              </Link>
              <Link href="/comunidad" className="text-gray-600 hover:text-blue-600 transition flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Comunidad</span>
              </Link>
            </nav>

            {/* Usuario y acciones derecha */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white/50 hover:bg-white/80 border-blue-200"
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </Button>
              
              <div className="flex items-center space-x-2 border border-blue-200 rounded-lg p-1 bg-white/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

                             {userLoading ? (
                 <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                   <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               ) : user ? (
                 <div className="flex items-center space-x-3">
                   <Link href="/notificaciones" className="relative p-2 text-gray-600 hover:text-blue-600 transition">
                     <Bell className="h-5 w-5" />
                     <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                   </Link>
                   <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                     {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                   </div>
                 </div>
               ) : (
                 <Link href="/login" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition">
                   <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                     <Users className="h-4 w-4" />
                   </div>
                   <span className="hidden sm:block text-sm font-medium">Iniciar Sesión</span>
                 </Link>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título y descripción */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Buscar Eventos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra oportunidades de voluntariado que se ajusten a tus intereses y habilidades
          </p>
        </div>

        {/* Barra de búsqueda mejorada */}
        <div className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <Input
                placeholder="Buscar eventos por título, descripción o habilidades..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="pl-12 pr-32 py-4 text-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-lg"
              />
              <Button 
                onClick={fetchEvents}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg"
                size="sm"
              >
                Buscar
              </Button>
            </div>
            
            {/* Contador de eventos */}
            <div className="mt-4 text-center">
              <span className="text-gray-600 font-medium">
                {events.length} eventos encontrados
              </span>
            </div>
          </div>
        </div>

        {/* Panel de filtros mejorado */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100/50 p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Ciudad"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="Estado"
                  value={filters.state}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                                 <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                   <SelectTrigger>
                     <SelectValue placeholder="Seleccionar categoría" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Todas las categorías</SelectItem>
                     <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
                     <SelectItem value="Educación">Educación</SelectItem>
                     <SelectItem value="Salud">Salud</SelectItem>
                     <SelectItem value="Alimentación">Alimentación</SelectItem>
                     <SelectItem value="Arte y Cultura">Arte y Cultura</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <div>
                <Label htmlFor="sort">Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Fecha</SelectItem>
                    <SelectItem value="volunteers">Voluntarios</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.onlyVerified}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyVerified: !!checked }))}
                />
                <Label htmlFor="verified">Solo organizaciones verificadas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={filters.onlyAvailable}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyAvailable: !!checked }))}
                />
                <Label htmlFor="available">Solo eventos con espacios disponibles</Label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={fetchEvents} className="bg-purple-600 hover:bg-purple-700">
                Aplicar Filtros
              </Button>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Vista:</span>
            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Events Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onApply={handleApply} user={user} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventListCard key={event.id} event={event} onApply={handleApply} user={user} />
            ))}
          </div>
        )}

        {events.length === 0 && !loading && (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
            <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
          </div>
                 )}
       </div>

                                               {/* Modal de Confirmación */}
        {/* Modal de Confirmación Mejorado */}
        {showConfirmModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirmar Postulación
                </h3>
                
                <p className="text-gray-600 text-sm">
                  ¿Estás seguro de que quieres postularte a este evento?
                </p>
              </div>

              {/* Detalles del evento */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedEvent.title}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📅</span>
                    <span>{formatDate(selectedEvent.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📍</span>
                    <span>{selectedEvent.city}, {selectedEvent.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">👥</span>
                    <span>{selectedEvent.currentVolunteers}/{selectedEvent.maxVolunteers} voluntarios</span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false)
                    setSelectedEvent(null)
                  }}
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
              </div>
            </motion.div>
          </div>
        )}
     </div>
   )
 }

function EventCard({ event, onApply, user }: { event: Event; onApply: (event: Event) => void; user: any }) {
  const availability = getAvailabilityStatus(event)
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full bg-white/80 backdrop-blur-sm border border-blue-100/50 hover:shadow-xl hover:border-blue-200/50 transition-all duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Badge className={`${event.category_color} px-3 py-1 rounded-full text-sm font-medium shadow-sm`}>
                  {event.category_icon} {event.category_name}
                </Badge>
                {event.organization_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    <Star className="h-3 w-3 mr-1" />
                    Verificada
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-3 text-gray-600 text-sm leading-relaxed">
                {event.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{event.address}, {event.city}</span>
            </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="font-medium">{formatDate(event.startDate)}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Users className="h-4 w-4 text-green-500" />
            <span className="font-medium">{event.currentVolunteers}/{event.maxVolunteers} voluntarios</span>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{event.organization_name}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Badge className={`${availability.color} px-3 py-1 rounded-full text-sm font-medium shadow-sm`}>
                {availability.text}
              </Badge>
              <ApplicationStatusBadge 
                hasApplied={event.hasApplied}
                status={event.applicationStatus}
              />
            </div>
            
            <div className="flex gap-2">
              {!event.hasApplied && (
                <Button
                  onClick={() => {
                    console.log("🔍 Botón Postular clickeado para:", event.title)
                    console.log("🔍 Evento completo:", event)
                    onApply(event)
                  }}
                  disabled={event.currentVolunteers >= event.maxVolunteers}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  {event.currentVolunteers >= event.maxVolunteers ? "Completo" : "Postular"}
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-lg px-4 py-2 font-semibold border-gray-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
                onClick={() => window.location.href = `/eventos/${event.id}`}
              >
                Ver detalles
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
}

function EventListCard({ event, onApply, user }: { event: Event; onApply: (event: Event) => void; user: any }) {
  const availability = getAvailabilityStatus(event)
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Badge className={event.category_color}>
                {event.category_icon} {event.category_name}
              </Badge>
              {event.organization_verified && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Star className="h-3 w-3 mr-1" />
                  Verificada
                </Badge>
              )}
              <Badge className={availability.color}>
                {availability.text}
              </Badge>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{event.city}, {event.state}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{getTimeUntilEvent(event.startDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{event.currentVolunteers}/{event.maxVolunteers}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>{event.organization_name}</span>
              </div>
            </div>
          </div>
          
          <div className="ml-6 flex flex-col items-end space-y-3">
            <div className="flex items-center gap-2">
              <ApplicationStatusBadge 
                hasApplied={event.hasApplied}
                status={event.applicationStatus}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              {!event.hasApplied && (
                <Button
                  onClick={() => {
                    console.log("🔍 Botón Postular clickeado para:", event.title)
                    console.log("🔍 Evento completo:", event)
                    onApply(event)
                  }}
                  disabled={event.currentVolunteers >= event.maxVolunteers}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  Postular
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = `/eventos/${event.id}`}
              >
                Ver Detalles
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 