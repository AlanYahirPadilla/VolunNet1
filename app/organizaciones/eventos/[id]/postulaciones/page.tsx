"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  X,
  User,
  Mail,
  Eye,
  Target
} from "lucide-react"
import { getCurrentUser } from "@/app/auth/actions"

interface Event {
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
  organization_name: string
}

interface Application {
  id: string
  eventId: string
  volunteerId: string
  status: string
  appliedAt: string
  volunteer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export default function EventoPostulacionesPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isEventOwner, setIsEventOwner] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user && eventId) {
      loadEventDetails()
      loadApplications()
    }
  }, [user, eventId])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        if (currentUser.role !== 'ORGANIZATION') {
          router.push('/login')
          return
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error("Error loading user:", error)
      router.push('/login')
    }
  }

  const loadEventDetails = async () => {
    try {
      console.log(`🔍 Loading event details for event: ${eventId}`)
      const eventResponse = await fetch(`/api/events/${eventId}`)
      console.log(`📡 Event API response status:`, eventResponse.status)
      
      if (!eventResponse.ok) {
        throw new Error('Error loading event')
      }
      
      const eventData = await eventResponse.json()
      console.log(`📊 Event API response data:`, eventData)
      setEvent(eventData.event)

      // Verificar si el usuario es dueño del evento
      const orgResponse = await fetch('/api/organizations/me')
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        console.log(`🏢 Organization data:`, orgData)
        console.log(`🎯 Event organization:`, eventData.event.organizationId)
        console.log(`👤 Current user:`, user?.id)
        
        // Verificar propiedad usando organizationId en lugar de organization_name
        if (orgData.organization && eventData.event.organizationId === orgData.organization.id) {
          console.log(`✅ User is event owner`)
          setIsEventOwner(true)
        } else {
          console.log(`❌ User is NOT event owner`)
          setIsEventOwner(false)
        }
      }
    } catch (error) {
      console.error("❌ Error loading event details:", error)
    }
  }

  const loadApplications = async () => {
    try {
      console.log(`🔍 Loading applications for event: ${eventId}`)
      const response = await fetch(`/api/events/${eventId}/applications`)
      console.log(`📡 Applications API response status:`, response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`📊 Applications API response data:`, data)
        console.log(`📊 Data type:`, typeof data)
        console.log(`📊 Is array:`, Array.isArray(data))
        console.log(`📊 Data length:`, Array.isArray(data) ? data.length : 'N/A')
        
        // La API devuelve directamente el array de aplicaciones, no data.applications
        const applicationsArray = Array.isArray(data) ? data : []
        setApplications(applicationsArray)
        console.log(`✅ Applications set:`, applicationsArray.length)
      } else {
        console.error("❌ Error loading applications:", response.status, response.statusText)
        setApplications([])
      }
    } catch (error) {
      console.error("❌ Error loading applications:", error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/organizaciones/dashboard')
  }

  const handleBackToEvent = () => {
    router.push(`/organizaciones/eventos/${eventId}/gestionar`)
  }

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject' | 'remove') => {
    try {
      const response = await fetch(`/api/events/${eventId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        // Recargar aplicaciones
        loadApplications()
        // Recargar detalles del evento para actualizar contadores
        loadEventDetails()
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error)
    }
  }

  const handleViewVolunteerProfile = (volunteerId: string) => {
    // El volunteerId que recibimos es el ID del usuario, no del voluntario
    router.push(`/voluntarios/${volunteerId}`)
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === "" || 
      app.volunteer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.volunteer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.volunteer.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
      'ACCEPTED': { label: 'Aceptada', color: 'bg-green-100 text-green-700' },
      'REJECTED': { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
      'COMPLETED': { label: 'Completada', color: 'bg-purple-100 text-purple-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-700' }
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getStatusCounts = () => {
    const counts = {
      pending: applications.filter(app => app.status === 'PENDING').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      completed: applications.filter(app => app.status === 'COMPLETED').length
    }
    return counts
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando postulaciones...</p>
        </div>
      </div>
    )
  }

  if (!event || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Evento no encontrado o no autorizado</p>
          <Button onClick={handleBackToDashboard} className="mt-4">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!isEventOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No tienes permisos para gestionar este evento</p>
          <Button onClick={handleBackToDashboard} className="mt-4">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToEvent} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Evento</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Gestión de Postulaciones</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título del evento */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h2>
          <p className="text-gray-600">Gestiona las postulaciones de voluntarios para este evento</p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.pending}</div>
              <div className="text-sm text-blue-600">Pendientes</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.accepted}</div>
              <div className="text-sm text-green-600">Aceptadas</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <div className="text-sm text-red-600">Rechazadas</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.completed}</div>
              <div className="text-sm text-purple-600">Completadas</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Buscar por nombre o email..." 
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
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="ACCEPTED">Aceptadas</SelectItem>
                  <SelectItem value="REJECTED">Rechazadas</SelectItem>
                  <SelectItem value="COMPLETED">Completadas</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadApplications} variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de postulaciones */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay postulaciones</h3>
                <p className="text-gray-600">
                  {applications.length === 0 
                    ? "Aún no hay voluntarios postulados para este evento."
                    : "No se encontraron postulaciones con los filtros aplicados."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.volunteer.firstName} {application.volunteer.lastName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {application.volunteer.email}
                            </span>
                            
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(application.status)}
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewVolunteerProfile(application.volunteer.id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Perfil</span>
                          </Button>
                          
                          {application.status === 'PENDING' && (
                            <>
                              <Button
                                onClick={() => handleApplicationAction(application.id, 'accept')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aceptar
                              </Button>
                              <Button
                                onClick={() => handleApplicationAction(application.id, 'reject')}
                                variant="destructive"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          
                          {application.status === 'ACCEPTED' && (
                            <Button
                              onClick={() => handleApplicationAction(application.id, 'remove')}
                              variant="destructive"
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
