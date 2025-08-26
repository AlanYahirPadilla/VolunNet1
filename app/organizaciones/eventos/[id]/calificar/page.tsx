'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Users, Calendar, MapPin } from 'lucide-react'
import { RatingModal } from '@/components/RatingModal/RatingModal'

interface Volunteer {
  id: string
  firstName: string
  lastName: string
  email: string
  rating?: number
}

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  address: string
  city: string
  state: string
  status: string
  organization: {
    id: string
    name: string
  }
}

interface Application {
  id: string
  volunteerId: string
  status: string
  appliedAt: string
  volunteer: Volunteer
  rating?: number
}

export default function EventRatingPage() {
  const router = useRouter()
  const { id: eventId } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadEventData()
  }, [eventId])

  const loadEventData = async () => {
    try {
      setLoading(true)
      
      // Cargar datos del evento
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) throw new Error('Error al cargar el evento')
      const eventData = await eventResponse.json()
      if (eventData.event) {
        setEvent(eventData.event)
      } else {
        throw new Error('Formato de respuesta del evento inválido')
      }

      // Cargar aplicaciones completadas (incluyendo las que ya tienen rating)
      const applicationsResponse = await fetch(`/api/events/${eventId}/applications?status=COMPLETED`)
      if (!applicationsResponse.ok) throw new Error('Error al cargar las aplicaciones')
      const applicationsData = await applicationsResponse.json()
      console.log("📊 Applications loaded:", applicationsData)
      setApplications(applicationsData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleRateVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer)
    setShowRatingModal(true)
  }

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!selectedVolunteer || !event) return

    try {
      const response = await fetch(`/api/events/${eventId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volunteerId: selectedVolunteer.id,
          rating,
          comment,
          type: 'ORGANIZATION_TO_VOLUNTEER'
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar la calificación')
      }

      // Actualizar la lista de aplicaciones
      console.log("🔄 Reloading event data after rating...")
      await loadEventData()
      console.log("✅ Event data reloaded")
      setShowRatingModal(false)
      setSelectedVolunteer(null)

    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Error al enviar la calificación')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'COMPLETED': { label: 'Completado', className: 'bg-green-100 text-green-700' },
      'ACCEPTED': { label: 'Aceptado', className: 'bg-blue-100 text-blue-700' },
      'PENDING': { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
      'REJECTED': { label: 'Rechazado', className: 'bg-red-100 text-red-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-700' }
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  // Evitar render hasta que el componente esté montado en el cliente
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del evento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="mb-4">Error: {error}</p>
              <Button onClick={() => router.back()}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="mb-4">Evento no encontrado</p>
              <Button onClick={() => router.back()}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedApplications = applications.filter(app => app.status === 'COMPLETED')
  const ratedApplications = applications.filter(app => app.rating)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calificar Voluntarios</h1>
            <p className="text-gray-600 mt-2">Califica a los voluntarios que participaron en tu evento</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </div>

        {/* Event Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {event.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {event.address}, {event.city}, {event.state}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {completedApplications.length} voluntarios participantes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Progreso de Calificaciones</h3>
              <Badge variant="secondary">
                {ratedApplications.length} de {completedApplications.length} calificados
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completedApplications.length > 0 ? (ratedApplications.length / completedApplications.length) * 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volunteers List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Voluntarios Participantes</h2>
        
        {completedApplications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay voluntarios que hayan completado este evento</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          completedApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {application.volunteer.firstName[0]}{application.volunteer.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {application.volunteer.firstName} {application.volunteer.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{application.volunteer.email}</p>
                      <p className="text-xs text-gray-500">
                        Participó el {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {application.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{application.rating}/5</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Calificado
                        </Badge>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleRateVolunteer(application.volunteer)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Calificar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

             {/* Rating Modal */}
       {showRatingModal && selectedVolunteer && event && (
         <RatingModal
           isOpen={showRatingModal}
           onClose={() => setShowRatingModal(false)}
           onSubmit={handleRatingSubmit}
           event={{
             id: event.id,
             title: event.title,
             startDate: event.startDate,
             endDate: event.endDate
           }}
           userToRate={{
             id: selectedVolunteer.id,
             name: `${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`,
             role: 'VOLUNTEER'
           }}
         />
       )}
    </div>
  )
}

