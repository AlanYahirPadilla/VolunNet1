<<<<<<< HEAD
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  MapPin, 
  Users, 
  PlusCircle, 
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Edit,
  Users as UsersIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/app/auth/actions"

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  city: string
  state: string
  country: string
  status: string
  maxVolunteers: number
  currentVolunteers: number
  category_name: string
  organization_name: string
}

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      // Una vez que tenemos el usuario, cargar los eventos
      if (currentUser) {
        fetchEvents(currentUser)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchEvents(user)
    }
  }, [user])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, selectedStatus])

  const fetchEvents = async (currentUser: any) => {
    try {
      setLoading(true)
      
      if (!currentUser) return

      // Obtener la organización del usuario
      let organizationId = null
      
      try {
        let orgResponse = await fetch('/api/organizations/me')
        
        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          
          if (orgData.organization) {
            organizationId = orgData.organization.id
          }
        }
      } catch (error) {
        console.error('Error fetching organization:', error)
      }

      if (!organizationId) {
        console.error('No organization found')
        return
      }

      // Obtener eventos de la organización
      console.log('Fetching events for organization:', organizationId) // Debug
      const eventsResponse = await fetch(`/api/eventos?organizationId=${organizationId}`)
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        console.log('Events loaded:', eventsData) // Debug
        console.log('Events array:', eventsData.events) // Debug
        setEvents(eventsData.events || eventsData || [])
      } else {
        console.error('Error fetching events:', eventsResponse.status)
        const errorText = await eventsResponse.text()
        console.error('Error response:', errorText) // Debug
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtro por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === selectedStatus)
    }

    setFilteredEvents(filtered)
  }

  const getStatusBadge = (status: string, startDate: string) => {
    const now = new Date()
    const eventDate = new Date(startDate)
    
    if (status === 'DRAFT') {
      return { text: 'Borrador', color: 'bg-gray-100 text-gray-700' }
    } else if (status === 'PUBLISHED') {
      if (eventDate > now) {
        return { text: 'Próximo', color: 'bg-yellow-100 text-yellow-700' }
      } else if (eventDate <= now && eventDate.getTime() + (24 * 60 * 60 * 1000) >= now.getTime()) {
        return { text: 'Hoy', color: 'bg-blue-100 text-blue-700' }
      } else {
        return { text: 'Pasado', color: 'bg-gray-100 text-gray-600' }
      }
    } else if (status === 'ONGOING') {
      return { text: 'En Curso', color: 'bg-green-100 text-green-700' }
    } else if (status === 'COMPLETED') {
      return { text: 'Completado', color: 'bg-purple-100 text-purple-700' }
    } else if (status === 'CANCELLED') {
      return { text: 'Cancelado', color: 'bg-red-100 text-red-700' }
    }
    
    return { text: status, color: 'bg-gray-100 text-gray-700' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Menú siempre visible */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/organizaciones/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link href="/eventos/crear" className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors">
                <PlusCircle className="h-4 w-4" />
                <span className="font-medium">Crear Evento</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link href="/organizaciones" className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors">
                <span className="font-medium">Mi Organización</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {events.length} evento{events.length !== 1 ? 's' : ''} en total
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log('Current state:', { events, filteredEvents, loading, user })
                  if (user) {
                    fetchEvents(user)
                  }
                }}
                className="text-xs"
              >
                Debug
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Todos los Eventos
                </h1>
                <p className="text-gray-600 text-lg">
                  Gestiona y visualiza todos los eventos de tu organización
                </p>
              </div>
              
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => router.push('/eventos/crear')}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Crear Nuevo Evento
              </Button>
            </div>
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="text-sm text-yellow-800">
                  <strong>Debug:</strong> Usuario: {user ? 'Sí' : 'No'} | 
                  Eventos: {events.length} | 
                  Filtrados: {filteredEvents.length} | 
                  Loading: {loading ? 'Sí' : 'No'}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtros y búsqueda */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro por estado */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="DRAFT">Borradores</option>
                  <option value="PUBLISHED">Publicados</option>
                  <option value="ONGOING">En Curso</option>
                  <option value="COMPLETED">Completados</option>
                  <option value="CANCELLED">Cancelados</option>
                </select>

                {/* Contador de eventos */}
                <div className="flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de eventos */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8 max-w-md mx-auto">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {events.length === 0 ? 'No tienes eventos aún' : 'No se encontraron eventos'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {events.length === 0 
                    ? 'Crea tu primer evento para comenzar a recibir voluntarios'
                    : 'Intenta ajustar los filtros de búsqueda'
                  }
                </p>
                {events.length === 0 && (
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => router.push('/eventos/crear')}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Crear mi primer evento
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => {
                const statusBadge = getStatusBadge(event.status, event.startDate)
                return (
                  <motion.div
                    key={event.id}
                    className="bg-white rounded-3xl shadow-lg border border-blue-50 overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🎯</span>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight flex-1">
                          {event.title}
                        </h3>
                        <Badge className={statusBadge.color}>
                          {statusBadge.text}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          {formatDate(event.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-green-400" />
                          {event.city}, {event.state}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs mb-4">
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <UsersIcon className="h-3 w-3 text-green-500" />
                          {event.currentVolunteers} postulaciones
                        </span>
                        <span className="text-gray-500">
                          {event.currentVolunteers}/{event.maxVolunteers} voluntarios
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 rounded-full px-4 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all"
                          onClick={() => router.push(`/eventos/${event.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                        
                        {event.currentVolunteers > 0 && (
                          <Button 
                            size="sm" 
                            className="rounded-full px-4 py-2 font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all"
                            onClick={() => router.push(`/eventos/${event.id}/gestionar`)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="rounded-full px-4 py-2 font-semibold border-gray-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
                          onClick={() => router.push(`/eventos/editar/${event.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
=======
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function EventosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full flex flex-col items-center border border-blue-100">
        <div className="mb-4">
          <Calendar className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Explora Eventos</h1>
        <div className="text-gray-500 text-sm mb-6 text-center">Próximamente podrás ver y buscar todos los eventos aquí.</div>
        <Link href="/" className="mt-2 inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all">Regresar al Inicio</Link>
      </div>
    </div>
  );
>>>>>>> ec1cbbc69193834a0a8ca358b8538c352ee8b7bb
}
