"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getCurrentUser } from "../auth/actions"
import { RatingModal } from "@/components/RatingModal/RatingModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

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
  status: string
}

interface RatingPendingEvent {
  id: string
  event: {
    id: string
    title: string
    description: string
    city: string
    state: string
    startDate: string
    endDate?: string
    status: string
    organization: {
      id: string
      name: string
    }
  }
  status: string
  volunteerId: string
}

export default function CalificacionesPage() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<RatingPendingEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<RatingPendingEvent | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [eventIdFromUrl, setEventIdFromUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    const eventId = searchParams.get('eventId')
    if (eventId) {
      setEventIdFromUrl(eventId)
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      loadRatingPendingEvents()
    }
  }, [user])

  const loadRatingPendingEvents = async () => {
    try {
      // Usar la misma API que el dashboard para eventos completados
      const response = await fetch('/api/dashboard/events', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("📊 Dashboard events API response:", data)
        
        // Filtrar solo eventos COMPLETED que necesitan calificación
        const completedEvents = data.events?.filter((event: any) => event.status === 'COMPLETED') || []
        console.log("📊 Completed events:", completedEvents)
        
        // Transformar a la estructura esperada
        const eventsData = completedEvents.map((event: any) => ({
          id: event.id,
          event: {
            id: event.id,
            title: event.title || 'Evento sin título',
            description: event.description || 'Sin descripción',
            city: event.city || 'Ciudad no especificada',
            state: event.state || 'Estado no especificado',
            startDate: event.start_date || event.startDate,
            endDate: event.end_date || event.endDate,
            status: event.status,
            organization: {
              id: event.organization_id || 'org_unknown',
              name: event.organization_name || 'Organización no especificada'
            }
          },
          status: 'COMPLETED',
          volunteerId: user?.id || ''
        }))
        
        console.log("📊 Transformed events:", eventsData)
        setEvents(eventsData)
        
        // Si hay un eventId en la URL, abrir el modal automáticamente
        if (eventIdFromUrl) {
          const eventToRate = eventsData.find((e: RatingPendingEvent) => e.event.id === eventIdFromUrl)
          if (eventToRate) {
            setSelectedEvent(eventToRate)
            setShowRatingModal(true)
            setEventIdFromUrl(null) // Limpiar para evitar re-apertura
          }
        }
      }
    } catch (error) {
      console.error("Error loading rating pending events:", error)
    }
  }

  const handleRateEvent = (event: RatingPendingEvent) => {
    setSelectedEvent(event)
    setShowRatingModal(true)
  }

  const handleRatingComplete = () => {
    setShowRatingModal(false)
    setSelectedEvent(null)
    // Recargar la lista de eventos
    loadRatingPendingEvents()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calificaciones...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tus calificaciones</p>
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al Dashboard</span>
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-600" />
                <h1 className="text-xl font-bold text-gray-900">Calificaciones</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Eventos Pendientes de Calificación</h2>
          <p className="text-gray-600">
            Califica los eventos en los que has participado para ayudar a la comunidad
          </p>
        </div>

        {events.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos pendientes de calificación</h3>
              <p className="text-gray-600 mb-6">
                Los eventos completados aparecerán aquí para que puedas calificarlos
              </p>
              <Link href="/dashboard">
                <Button>Volver al Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((eventItem) => (
              <Card key={eventItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {eventItem.event.title}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {eventItem.event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{eventItem.event.organization.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(eventItem.event.startDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{eventItem.event.city}, {eventItem.event.state}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {eventItem.event.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                      Pendiente de calificación
                    </Badge>
                    <Button 
                      onClick={() => handleRateEvent(eventItem)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Calificar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Calificación */}
      {showRatingModal && selectedEvent && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          event={{
            id: selectedEvent.event.id,
            title: selectedEvent.event.title,
            startDate: selectedEvent.event.startDate,
            endDate: selectedEvent.event.endDate || selectedEvent.event.startDate
          }}
          userToRate={{
            id: selectedEvent.event.organization.id,
            name: selectedEvent.event.organization.name,
            role: 'ORGANIZATION'
          }}
          onSubmit={async (rating, feedback) => {
            try {
              console.log("📤 Submitting rating for event:", selectedEvent.event.id)
              console.log("📤 Rating data:", { rating, feedback })
              
              const response = await fetch(`/api/events/${selectedEvent.event.id}/rate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  volunteerId: user.id, // El voluntario que está calificando
                  rating,
                  comment: feedback,
                  type: 'VOLUNTEER_TO_ORGANIZATION' // Tipo de calificación
                })
              })
              
              if (response.ok) {
                console.log("✅ Rating submitted successfully")
                handleRatingComplete()
              } else {
                const errorText = await response.text()
                console.error('❌ Error submitting rating:', response.status, errorText)
              }
            } catch (error) {
              console.error('❌ Error submitting rating:', error)
            }
          }}
        />
      )}
    </div>
  )
}
