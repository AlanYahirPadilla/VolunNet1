"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, MapPin, Calendar, Users, Clock, Building, Star, ArrowLeft, Share2, Bookmark, Phone, Mail, Globe, Edit, Users as UsersIcon, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/app/auth/actions"
import { EventStatusControl } from "@/components/EventStatusControl"
import { EventCompletionButton } from "@/components/EventCompletionButton"

interface Event {
  id: string
  title: string
  description: string
  organization_name: string
  organization_verified: boolean
  city: string
  state: string
  country: string
  address: string
  startDate: string
  endDate: string
  maxVolunteers: number
  currentVolunteers: number
  category_name: string
  category_icon: string
  category_color: string
  skills: string[]
  requirements: string[]
  benefits: string[]
  status: string
  imageUrl?: string
  latitude?: number
  longitude?: number
  organizationId?: string
}

interface Organization {
  name: string
  description?: string
  email?: string
  phone?: string
  website?: string
  verified: boolean
  rating?: number
  totalEvents?: number
}

export default function OrganizadorEventDetails() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isEventOwner, setIsEventOwner] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser && currentUser.role === 'ORGANIZATION') {
        setUser(currentUser)
      } else {
        router.push('/login')
      }
    }
    loadUser()
  }, [router])

  useEffect(() => {
    if (params.id && user) {
      fetchEventDetails()
    }
  }, [params.id, user])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener detalles del evento
      const response = await fetch(`/api/events/${params.id}`)
      if (!response.ok) {
        throw new Error('Error al cargar el evento')
      }
      
      const data = await response.json()
      if (!data.event) {
        throw new Error('Evento no encontrado')
      }

      setEvent(data.event)
      
      // Verificar si el usuario es dueño del evento
      if (user && user.role === 'ORGANIZATION') {
        const orgResponse = await fetch('/api/organizations/me')
        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          
          // Verificar por ID de organización (más confiable)
          if (orgData.organization && data.event.organizationId === orgData.organization.id) {
            console.log("✅ Usuario ES dueño del evento (por ID)")
            setIsEventOwner(true)
          } else {
            // Fallback: comparar nombres
            const eventOrgName = data.event.organization_name?.toLowerCase().trim()
            const userOrgName = orgData.organization?.name?.toLowerCase().trim()
            
            if (eventOrgName === userOrgName) {
              console.log("✅ Usuario ES dueño del evento (por nombre)")
              setIsEventOwner(true)
            } else {
              console.log("❌ Usuario NO es dueño del evento")
              setIsEventOwner(false)
            }
          }
        }
      }
      
    } catch (error) {
      console.error("Error fetching event details:", error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/organizaciones/dashboard')
  }

  const handleEditEvent = () => {
    router.push(`/eventos/editar/${params.id}`)
  }

  const handleManageApplications = () => {
    router.push(`/organizaciones/eventos/${params.id}/postulaciones`)
  }

  const handleStatusChange = (newStatus: string) => {
    if (event) {
      setEvent({ ...event, status: newStatus })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
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
    if (diffDays < 7) return `En ${diffDays} días`
    if (diffDays < 30) return `En ${Math.floor(diffDays / 7)} semanas`
    return `En ${Math.floor(diffDays / 30)} meses`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
      'PUBLISHED': { label: 'Publicado', color: 'bg-blue-100 text-blue-700' },
      'ONGOING': { label: 'En Proceso', color: 'bg-green-100 text-green-700' },
      'COMPLETED': { label: 'Completado', color: 'bg-purple-100 text-purple-700' },
      'ARCHIVED': { label: 'Archivado', color: 'bg-gray-100 text-gray-700' },
      'CANCELLED': { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-700' }
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando evento...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBackToDashboard}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Evento no encontrado</p>
          <Button onClick={handleBackToDashboard}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!isEventOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No tienes permisos para ver este evento</p>
          <Button onClick={handleBackToDashboard}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                <Heart className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Detalles del Evento</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleEditEvent}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del evento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{event.category_icon}</span>
                  <Badge className={event.category_color}>
                    {event.category_name}
                  </Badge>
                  {getStatusBadge(event.status)}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{event.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(event.startDate)}</p>
                    <p className="text-sm text-gray-600">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">{event.city}, {event.state}</p>
                    <p className="text-sm text-gray-600">{event.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.currentVolunteers}/{event.maxVolunteers} voluntarios
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.maxVolunteers - event.currentVolunteers} cupos disponibles
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">{getTimeUntilEvent(event.startDate)}</p>
                    <p className="text-sm text-gray-600">Tiempo restante</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Detalles del evento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalles del Evento</h2>
              
              {event.skills && event.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Habilidades requeridas</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {event.requirements && event.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h3>
                  <ul className="space-y-2">
                    {event.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.benefits && event.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Beneficios</h3>
                  <ul className="space-y-2">
                    {event.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Control de estado del evento */}
            {isEventOwner && (
              <EventStatusControl
                eventId={event.id}
                currentStatus={event.status}
                startDate={event.startDate}
                endDate={event.endDate}
                onStatusChange={handleStatusChange}
                isEventOwner={isEventOwner}
              />
            )}

            {/* Botón de completar evento para eventos ONGOING */}
            {isEventOwner && event.status === 'ONGOING' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-green-200 p-8"
              >
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Evento en Proceso</h3>
                  <p className="text-gray-600 mb-6">
                    El evento está en ejecución. Cuando termine, puedes marcarlo como completado para que los voluntarios y la organización se califiquen mutuamente.
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
                      fetchEventDetails()
                    }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acciones rápidas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleManageApplications}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Gestionar Postulaciones
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleEditEvent}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Evento
                </Button>
              </div>
            </motion.div>

            {/* Información de la organización */}
            {organization && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Building className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-900">Tu Organización</h3>
                  {organization.verified && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      Verificada
                    </Badge>
                  )}
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{organization.name}</h4>
                
                <div className="flex items-center gap-2 mb-3">
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
                      <Mail className="h-4 w-4" />
                      {organization.email}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



