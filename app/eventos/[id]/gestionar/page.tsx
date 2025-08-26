"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  UserX, 
  Clock, 
  MapPin, 
  Calendar,
  Star,
  Award,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Eye,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getCurrentUser } from "@/app/auth/actions"
import { useToast } from "@/hooks/use-toast"
import { EventStats } from "@/components/event-management/event-stats"
import { ParticipantFilters } from "@/components/event-management/participant-filters"

interface Participant {
  application_id: string
  application_status: string
  appliedAt: string
  message?: string
  rating?: number
  feedback?: string
  user_id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  user_created_at: string
  skills?: string[]
  interests?: string[]
  bio?: string
  volunteer_rating?: number
  hoursCompleted?: number
  eventsParticipated?: number
  city?: string
  state?: string
  country?: string
}

interface Event {
  id: string
  title: string
  description: string
  organization_name: string
  city: string
  state: string
  country: string
  startDate: string
  endDate: string
  maxVolunteers: number
  currentVolunteers: number
  status: string
}

export default function EventManagement() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
      fetchParticipants()
    }
  }, [params.id])

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      const data = await response.json()
      if (data.event) {
        setEvent(data.event)
      }
    } catch (error) {
      console.error("Error fetching event:", error)
    }
  }

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${params.id}/participants`)
      const data = await response.json()
      
      if (data.participants) {
        setParticipants(data.participants)
        setFilteredParticipants(data.participants)
      }
    } catch (error) {
      console.error("Error fetching participants:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los participantes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Funciones de filtrado
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredParticipants(participants)
      return
    }

    const filtered = participants.filter(participant =>
      participant.firstName.toLowerCase().includes(query.toLowerCase()) ||
      participant.lastName.toLowerCase().includes(query.toLowerCase()) ||
      participant.email.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredParticipants(filtered)
  }

  const handleFilterStatus = (status: string) => {
    if (status === 'all') {
      setFilteredParticipants(participants)
      return
    }

    const filtered = participants.filter(participant =>
      participant.application_status === status
    )
    setFilteredParticipants(filtered)
  }

  const handleFilterSkills = (skills: string[]) => {
    if (skills.length === 0) {
      setFilteredParticipants(participants)
      return
    }

    const filtered = participants.filter(participant =>
      participant.skills && participant.skills.some(skill => skills.includes(skill))
    )
    setFilteredParticipants(filtered)
  }

  const handleClearFilters = () => {
    setFilteredParticipants(participants)
  }

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject' | 'remove') => {
    try {
      setActionLoading(applicationId)
      
      const response = await fetch(`/api/events/${params.id}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: data.message,
        })
        
        // Actualizar la lista de participantes
        await fetchParticipants()
        await fetchEventDetails()
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al procesar la acción",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error processing action:", error)
      toast({
        title: "Error",
        description: "Error interno del servidor",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Pendiente', variant: 'secondary' as const },
      'ACCEPTED': { label: 'Aceptado', variant: 'default' as const },
      'REJECTED': { label: 'Rechazado', variant: 'destructive' as const },
      'COMPLETED': { label: 'Completado', variant: 'default' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'text-green-600'
      case 'REJECTED': return 'text-red-600'
      case 'PENDING': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h1>
            <Button onClick={() => router.back()}>Volver</Button>
          </div>
        </div>
      </div>
    )
  }

  const acceptedParticipants = filteredParticipants.filter(p => p.application_status === 'ACCEPTED')
  const pendingParticipants = filteredParticipants.filter(p => p.application_status === 'PENDING')
  const rejectedParticipants = filteredParticipants.filter(p => p.application_status === 'REJECTED')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión del Evento
              </h1>
              <p className="text-gray-600 text-lg">{event.title}</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {event.currentVolunteers}/{event.maxVolunteers}
              </div>
              <div className="text-sm text-gray-500">Voluntarios</div>
            </div>
          </div>
        </div>

        {/* Event Stats */}
        <EventStats event={event} participants={filteredParticipants} />

        {/* Participant Filters */}
        <ParticipantFilters
          onSearch={handleSearch}
          onFilterStatus={handleFilterStatus}
          onFilterSkills={handleFilterSkills}
          onClearFilters={handleClearFilters}
          availableSkills={Array.from(new Set(participants.flatMap(p => p.skills || [])))}
        />

        {/* Event Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Información del Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {event.city}, {event.state}, {event.country}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {event.currentVolunteers} de {event.maxVolunteers} voluntarios
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="accepted" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Aceptados ({acceptedParticipants.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendientes ({pendingParticipants.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rechazados ({rejectedParticipants.length})
            </TabsTrigger>
          </TabsList>

          {/* Accepted Participants */}
          <TabsContent value="accepted" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Voluntarios Aceptados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {acceptedParticipants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay voluntarios aceptados aún
                  </p>
                ) : (
                  <div className="space-y-4">
                    {acceptedParticipants.map((participant) => (
                      <ParticipantCard
                        key={participant.application_id}
                        participant={participant}
                        onViewProfile={() => {
                          setSelectedParticipant(participant)
                          setShowProfileModal(true)
                        }}
                        onRemove={() => handleApplicationAction(participant.application_id, 'remove')}
                        actionLoading={actionLoading === participant.application_id}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Participants */}
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Clock className="w-5 h-5" />
                  Aplicaciones Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingParticipants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay aplicaciones pendientes
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingParticipants.map((participant) => (
                      <ParticipantCard
                        key={participant.application_id}
                        participant={participant}
                        onViewProfile={() => {
                          setSelectedParticipant(participant)
                          setShowProfileModal(true)
                        }}
                        onAccept={() => handleApplicationAction(participant.application_id, 'accept')}
                        onReject={() => handleApplicationAction(participant.application_id, 'reject')}
                        actionLoading={actionLoading === participant.application_id}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Participants */}
          <TabsContent value="rejected" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  Aplicaciones Rechazadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedParticipants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay aplicaciones rechazadas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {rejectedParticipants.map((participant) => (
                      <ParticipantCard
                        key={participant.application_id}
                        participant={participant}
                        onViewProfile={() => {
                          setSelectedParticipant(participant)
                          setShowProfileModal(true)
                        }}
                        onRemove={() => handleApplicationAction(participant.application_id, 'remove')}
                        actionLoading={actionLoading === participant.application_id}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Profile Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Perfil del Voluntario</DialogTitle>
            </DialogHeader>
            {selectedParticipant && (
              <VolunteerProfileModal participant={selectedParticipant} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Componente para mostrar cada participante
function ParticipantCard({ 
  participant, 
  onViewProfile, 
  onAccept, 
  onReject, 
  onRemove, 
  actionLoading, 
  showActions 
}: {
  participant: Participant
  onViewProfile: () => void
  onAccept?: () => void
  onReject?: () => void
  onRemove?: () => void
  actionLoading: boolean
  showActions: boolean
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {participant.avatar ? (
                <img 
                  src={participant.avatar} 
                  alt={`${participant.firstName} ${participant.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {participant.firstName[0]}{participant.lastName[0]}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">
                  {participant.firstName} {participant.lastName}
                </h3>
                {participant.volunteer_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      {participant.volunteer_rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>{participant.email}</span>
                {participant.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {participant.city}, {participant.state}
                  </span>
                )}
              </div>
              
              {participant.skills && participant.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {participant.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {participant.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{participant.skills.length - 3} más
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Se postuló: {formatDate(participant.appliedAt)}</span>
                {participant.hoursCompleted && (
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {participant.hoursCompleted}h completadas
                  </span>
                )}
                {participant.eventsParticipated && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {participant.eventsParticipated} eventos
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewProfile}
                className="flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Ver
              </Button>
              
              {onAccept && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAccept}
                  disabled={actionLoading}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aceptar
                </Button>
              )}
              
              {onReject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReject}
                  disabled={actionLoading}
                  className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </Button>
              )}
              
              {onRemove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRemove}
                  disabled={actionLoading}
                  className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Modal para mostrar el perfil completo del voluntario
function VolunteerProfileModal({ participant }: { participant: Participant }) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Aquí deberías hacer la llamada a la API para obtener el perfil completo
        // Por ahora usamos los datos que ya tenemos
        setProfile({
          ...participant,
          // Datos adicionales que podrían venir de la API
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [participant])

  if (loading) {
    return <div className="animate-pulse">Cargando perfil...</div>
  }

  if (!profile) {
    return <div>Error al cargar el perfil</div>
  }

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {profile.avatar ? (
            <img 
              src={profile.avatar} 
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <span className="text-blue-600 font-semibold text-3xl">
              {profile.firstName[0]}{profile.lastName[0]}
            </span>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {profile.firstName} {profile.lastName}
        </h2>
        
        {profile.tagline && (
          <p className="text-gray-600 italic mb-4">"{profile.tagline}"</p>
        )}
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          {profile.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {profile.email}
            </span>
          )}
          {profile.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {profile.city}, {profile.state}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {profile.hoursCompleted || 0}
          </div>
          <div className="text-sm text-gray-500">Horas Completadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {profile.eventsParticipated || 0}
          </div>
          <div className="text-sm text-gray-500">Eventos Participados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {profile.volunteer_rating ? profile.volunteer_rating.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-gray-500">Calificación</div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Biografía</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Habilidades */}
      {profile.skills && profile.skills.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Habilidades</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="default">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Intereses */}
      {profile.interests && profile.interests.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Intereses</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest: string, index: number) => (
              <Badge key={index} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile.languages && profile.languages.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Idiomas</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang: string, index: number) => (
                <Badge key={index} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {profile.experience && profile.experience.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Experiencia</h3>
            <div className="flex flex-wrap gap-2">
              {profile.experience.map((exp: string, index: number) => (
                <Badge key={index} variant="outline">
                  {exp}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de aplicación */}
      {profile.message && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Mensaje de Aplicación</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 text-sm italic">"{profile.message}"</p>
          </div>
        </div>
      )}
    </div>
  )
}
