"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Building, 
  Star,
  CheckCircle,
  Eye,
  User,
  Clock,
  Target
} from "lucide-react"
import { EventCompletionButton } from "@/components/EventCompletionButton"
import { EventStatusControl } from "@/components/EventStatusControl"
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
  category_name: string
  category_icon: string
  category_color: string
  skills: string[]
  requirements: string[]
  benefits: string[]
}

interface Organization {
  id: string
  name: string
  description: string
  verified: boolean
  rating: number
  totalEvents: number
  email?: string
  website?: string
}

export default function EventoGestionarPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isEventOwner, setIsEventOwner] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user && eventId) {
      loadEventDetails()
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
      setLoading(true)
      
      // Cargar detalles del evento
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) {
        throw new Error('Error loading event')
      }
      const eventData = await eventResponse.json()
      setEvent(eventData.event)

      // Cargar datos de la organización del usuario
      const orgResponse = await fetch('/api/organizations/me')
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganization(orgData.organization)
        
        // Verificar si el usuario es dueño del evento
        if (orgData.organization && eventData.event.organization_name === orgData.organization.name) {
          setIsEventOwner(true)
        }
      }
    } catch (error) {
      console.error("Error loading event details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/organizaciones/dashboard')
  }

  const handleViewEventDetails = () => {
    router.push(`/eventos/${eventId}`)
  }

  const handleManageApplications = () => {
    router.push(`/organizaciones/eventos/${eventId}/postulaciones`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PUBLISHED': { label: 'Publicado', color: 'bg-blue-100 text-blue-700' },
      'ONGOING': { label: 'En Curso', color: 'bg-green-100 text-green-700' },
      'COMPLETED': { label: 'Completado', color: 'bg-purple-100 text-purple-700' },
      'ARCHIVED': { label: 'Archivado', color: 'bg-gray-100 text-gray-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-700' }
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Dashboard</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Gestión del Evento</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleViewEventDetails}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título del evento */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h2>
          <p className="text-gray-600">Gestiona y administra este evento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del evento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Información del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {event.city}, {event.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {event.currentVolunteers} de {event.maxVolunteers} voluntarios
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Estado: {getStatusBadge(event.status)}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                </div>

                {event.skills && event.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Habilidades requeridas</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas del evento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Estadísticas del Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{event.currentVolunteers}</div>
                    <div className="text-sm text-blue-600">Voluntarios</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{event.maxVolunteers - event.currentVolunteers}</div>
                    <div className="text-sm text-green-600">Cupos Disponibles</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">0</div>
                    <div className="text-sm text-yellow-600">Pendientes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{event.currentVolunteers}</div>
                    <div className="text-sm text-purple-600">Confirmados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

                                    {/* Control de estado del evento */}
                        <EventStatusControl
                          eventId={event.id}
                          currentStatus={event.status}
                          startDate={event.startDate}
                          endDate={event.endDate}
                          onStatusChange={(newStatus) => {
                            loadEventDetails()
                          }}
                          isEventOwner={isEventOwner}
                        />

                        {/* Botón de completar evento (solo para eventos en proceso) */}
                        {event.status === 'ONGOING' && (
                          <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="h-5 w-5" />
                                Completar Evento
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-green-700 mb-4">
                                Cuando el evento haya terminado, puedes marcarlo como completado. Esto permitirá que los voluntarios y la organización se califiquen mutuamente.
                              </p>
                              <EventCompletionButton
                                eventId={event.id}
                                eventTitle={event.title}
                                currentVolunteers={event.currentVolunteers}
                                maxVolunteers={event.maxVolunteers}
                                startDate={event.startDate}
                                city={event.city}
                                state={event.state}
                                canComplete={true}
                                onCompletion={() => {
                                  loadEventDetails()
                                }}
                              />
                            </CardContent>
                          </Card>
                        )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información de la organización */}
            {organization && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Tu Organización
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{organization.name}</h4>
                      {organization.verified && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          Verificada
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(organization.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({organization.rating})</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>{organization.totalEvents} eventos organizados</p>
                    {organization.email && (
                      <p className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4" />
                        {organization.email}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleManageApplications}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar Postulaciones
                </Button>
                
                {event.status === 'COMPLETED' && (
                  <Button 
                    onClick={() => router.push(`/organizaciones/eventos/${eventId}/calificar`)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Calificar Voluntarios
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={handleViewEventDetails}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles Públicos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
