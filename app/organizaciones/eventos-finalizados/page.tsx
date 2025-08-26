"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle, 
  Star,
  Eye,
  Archive
} from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/app/auth/actions"

interface CompletedEvent {
  id: string
  title: string
  description: string
  city: string
  state: string
  startDate: string
  endDate: string
  maxVolunteers: number
  currentVolunteers: number
  status: string
  category_name: string
  category_icon: string
  category_color: string
  completedAt: string
  participantsCount: number
  ratingsPending: number
}

export default function EventosFinalizadosPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CompletedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadCompletedEvents()
    }
  }, [user])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const loadCompletedEvents = async () => {
    try {
      setLoading(true)
      console.log("🔍 Loading completed events...")
      
      // Cargar eventos completados y archivados
      const response = await fetch('/api/organizaciones/eventos-finalizados', {
        credentials: 'include'
      })
      
      console.log("📡 API response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("📊 API response data:", data)
        console.log("📊 Events array:", data.events)
        console.log("📊 Events count:", data.events?.length || 0)
        
        setEvents(data.events || [])
      } else {
        console.error("❌ Error loading completed events:", response.status, response.statusText)
        setEvents([])
      }
    } catch (error) {
      console.error("❌ Error:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    const matchesCategory = categoryFilter === "all" || event.category_name === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-700">Completado</Badge>
      case 'ARCHIVED':
        return <Badge className="bg-gray-100 text-gray-700">Archivado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: string, icon: string, color: string) => (
    <Badge className={`${color} text-xs`}>
      <span className="mr-1">{icon}</span>
      {category}
    </Badge>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando eventos finalizados...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver esta página</p>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/organizaciones/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al Dashboard</span>
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">Eventos Finalizados</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Historial de Eventos</h2>
          <p className="text-gray-600">
            Revisa todos los eventos que has completado y gestiona el historial de tu organización
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="COMPLETED">Completados</SelectItem>
                <SelectItem value="ARCHIVED">Archivados</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
                <SelectItem value="Educación">Educación</SelectItem>
                <SelectItem value="Salud">Salud</SelectItem>
                <SelectItem value="Alimentación">Alimentación</SelectItem>
                <SelectItem value="Tecnología">Tecnología</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={loadCompletedEvents}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Completados</p>
                  <p className="text-2xl font-bold text-green-900">
                    {events.filter(e => e.status === 'COMPLETED').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Participantes</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {events.reduce((sum, e) => sum + e.participantsCount, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Calificaciones Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {events.reduce((sum, e) => sum + e.ratingsPending, 0)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
                <Archive className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de eventos */}
        {filteredEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {events.length === 0 ? "No hay eventos finalizados" : "No se encontraron eventos"}
              </h3>
              <p className="text-gray-600 mb-6">
                {events.length === 0 
                  ? "Los eventos que marques como completados aparecerán aquí"
                  : "Intenta ajustar los filtros de búsqueda"
                }
              </p>
              <Link href="/organizaciones/dashboard">
                <Button>Volver al Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                          {getStatusBadge(event.status)}
                          {getCategoryBadge(event.category_name, event.category_icon, event.category_color)}
                        </div>
                        <p className="text-gray-600 line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.city}, {event.state}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{event.currentVolunteers}/{event.maxVolunteers} participantes</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Completado: {new Date(event.completedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Calificaciones pendientes: <span className="font-semibold">{event.ratingsPending}</span>
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/eventos/${event.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </Link>
                        
                        <Link href={`/eventos/${event.id}/gestionar`}>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Gestionar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

