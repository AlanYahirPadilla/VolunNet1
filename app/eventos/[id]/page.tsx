"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, MapPin, Calendar, Users, Clock, Building, Star, ArrowLeft, Share2, Bookmark, Phone, Mail, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/app/auth/actions"
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

export default function EventDetails() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [isEventOwner, setIsEventOwner] = useState(false)
  
  // Estados para el modal de postulación
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<'checking' | 'already-applied' | 'can-apply' | 'applying' | 'success' | 'error'>('checking')
  const [modalMessage, setModalMessage] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (params.id) {
      fetchEventDetails()
    }
  }, [params.id])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      
      // Obtener detalles del evento
      const response = await fetch(`/api/events/${params.id}`)
      const data = await response.json()

      if (data.event) {
        setEvent(data.event)
        
        // Obtener información de la organización
        if (data.event.organization_name) {
          setOrganization({
            name: data.event.organization_name,
            verified: data.event.organization_verified,
            rating: 4.5, // Mock data
            totalEvents: 15 // Mock data
          })
        }

                  // Verificar si el usuario ya se postuló
          if (user) {
            const applicationResponse = await fetch(`/api/events/apply?eventId=${params.id}`)
            const applicationData = await applicationResponse.json()
            setHasApplied(applicationData.hasApplied || false)
            
            // Verificar si el usuario es organizador y dueño del evento
            if (user.role === 'ORGANIZATION') {
              console.log("=== Verificando propiedad del evento ===")
              console.log("Usuario es ORGANIZATION:", user.role === 'ORGANIZATION')
              
              // Verificar si el evento pertenece a la organización del usuario
              const orgResponse = await fetch('/api/organizations/me')
              if (orgResponse.ok) {
                const orgData = await orgResponse.json()
                console.log("Datos de organización:", orgData)
                console.log("ID de organización del evento:", data.event.organizationId)
                console.log("ID de organización del usuario:", orgData.organization?.id)
                
                // Verificar por ID de organización (más confiable)
                if (orgData.organization && data.event.organizationId === orgData.organization.id) {
                  console.log("✅ Usuario ES dueño del evento (por ID)")
                  setIsEventOwner(true)
                } else {
                  // Fallback: comparar nombres (para compatibilidad)
                  const eventOrgName = data.event.organization_name?.toLowerCase().trim()
                  const userOrgName = orgData.organization?.name?.toLowerCase().trim()
                  const userName = user.firstName?.toLowerCase().trim()
                  
                  console.log("Comparando nombres de organización:")
                  console.log("Evento:", eventOrgName)
                  console.log("Organización:", userOrgName)
                  console.log("Usuario:", userName)
                  
                  // Verificar si el nombre del usuario está contenido en el nombre de la organización del evento
                  const isOwner = eventOrgName && (
                    (userOrgName && (
                      eventOrgName === userOrgName || 
                      eventOrgName.includes(userOrgName) || 
                      userOrgName.includes(eventOrgName)
                    )) ||
                    (userName && (
                      eventOrgName === userName || 
                      eventOrgName.includes(userName) || 
                      userName.includes(eventOrgName)
                    ))
                  )
                  
                  if (isOwner) {
                    console.log("✅ Usuario ES dueño del evento (por nombre)")
                    setIsEventOwner(true)
                  } else {
                    console.log("❌ Usuario NO es dueño del evento")
                    setIsEventOwner(false)
                  }
                }
              } else {
                console.log("❌ Error al obtener datos de organización")
              }
            } else {
              console.log("❌ Usuario NO es ORGANIZATION, es:", user.role)
            }
          }
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!event) return

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
    if (!event) return

    setApplicationStatus('applying')
    setModalMessage('Enviando postulación...')

    try {
      const response = await fetch("/api/events/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: event.id }),
      })

      if (response.ok) {
        setHasApplied(true)
        setEvent(prev => prev ? { ...prev, currentVolunteers: prev.currentVolunteers + 1 } : null)
        
        setApplicationStatus('success')
        setModalMessage('¡Postulación enviada exitosamente!')
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          setShowApplicationModal(false)
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
    setApplicationStatus('checking')
    setModalMessage('')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando evento...</span>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h2>
          <Button onClick={() => router.push("/eventos/buscar")}>
            Volver a buscar eventos
          </Button>
        </div>
      </div>
    )
  }

  const isEventFull = event.currentVolunteers >= event.maxVolunteers
  const isEventPast = new Date(event.startDate) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header del evento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{event.category_icon}</span>
                    <Badge className={`${event.category_color} text-sm`}>
                      {event.category_name}
                    </Badge>
                    {isEventPast && (
                      <Badge variant="secondary" className="text-sm">
                        Evento pasado
                      </Badge>
                    )}
                    {isEventFull && !isEventPast && (
                      <Badge variant="destructive" className="text-sm">
                        Completo
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                  <p className="text-lg text-gray-700 leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(event.startDate)}</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{event.city}, {event.state}</p>
                    <p className="text-sm text-gray-600">{event.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-500" />
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
                  <Clock className="h-5 w-5 text-purple-500" />
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
              transition={{ delay: 0.1 }}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Botón de postulación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {hasApplied ? "Ya te has postulado" : "¿Te interesa participar?"}
                </h3>
                <p className="text-gray-600">
                  {hasApplied 
                    ? "Tu postulación está siendo revisada"
                    : "Únete a este evento y haz la diferencia"
                  }
                </p>
              </div>

              {!hasApplied && !isEventPast && (
                <Button
                  onClick={handleApply}
                  disabled={isEventFull || applying}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                >
                  {applying ? "Postulando..." : isEventFull ? "Evento completo" : "Postularme"}
                </Button>
              )}

              {hasApplied && (
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-700 text-sm">
                    Postulación enviada
                  </Badge>
                </div>
              )}

              {isEventPast && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    Evento finalizado
                  </Badge>
                </div>
              )}

              {/* Botón de gestión para organizadores */}
              {isEventOwner && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => router.push(`/eventos/${params.id}/gestionar`)}
                    variant="outline"
                    className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gestionar Evento
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Ver participantes y gestionar aplicaciones
                  </p>
                </div>
              )}

              {/* Botón de completar evento para organizadores */}
              {/* Debug info para organizadores */}
              {user?.role === 'ORGANIZATION' && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-yellow-50 p-3 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Debug:</strong> isEventOwner: {isEventOwner ? '✅ Sí' : '❌ No'} | 
                    Event Status: {event.status} | 
                    ¿Mostrar botón?: {isEventOwner && (event.status === 'PUBLISHED' || event.status === 'ONGOING') ? '✅ Sí' : '❌ No'}
                  </p>
                </div>
              )}

              {isEventOwner && event.status === 'PUBLISHED' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <EventCompletionButton
                    eventId={event.id}
                    eventTitle={event.title}
                    currentVolunteers={event.currentVolunteers}
                    maxVolunteers={event.maxVolunteers}
                    startDate={event.startDate}
                    city={event.city}
                    state={event.state}
                    canComplete={isEventOwner}
                    onCompletion={() => {
                      // Recargar detalles del evento
                      fetchEventDetails()
                    }}
                  />
                </div>
              )}

              {/* Botón específico para eventos ONGOING */}
              {isEventOwner && event.status === 'ONGOING' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Evento en Proceso</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      El evento está en ejecución. Cuando termine, puedes marcarlo como completado.
                    </p>
                    <Button
                      onClick={() => router.push(`/organizaciones/eventos/${params.id}/gestionar`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Gestionar Evento
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Ve a la página de gestión para completar el evento
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Información de la organización */}
            {organization && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Building className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-900">Organización</h3>
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

                <div className="space-y-2 text-sm text-gray-600">
                  <p>{organization.totalEvents} eventos organizados</p>
                  {organization.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{organization.email}</span>
                    </div>
                  )}
                  {organization.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>{organization.website}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/organizaciones/${event.organization_name}`)}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Ver perfil completo
                </Button>
              </motion.div>
            )}

            {/* Eventos similares */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Eventos similares</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">Limpieza de Playa</h4>
                  <p className="text-xs text-gray-600">Puerto Vallarta • 15 ago</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">Taller de Programación</h4>
                  <p className="text-xs text-gray-600">Guadalajara • 18 ago</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver más eventos
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Postulación */}
      {showApplicationModal && event && (
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
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">📅</span>
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">📍</span>
                  <span>{event.city}, {event.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">👥</span>
                  <span>{event.currentVolunteers}/{event.maxVolunteers} voluntarios</span>
                </div>
              </div>
            </div>

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
    </div>
  )
}

