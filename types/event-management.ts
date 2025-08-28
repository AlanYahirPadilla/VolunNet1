// Tipos para la gestión de eventos por organizadores

export interface EventParticipant {
  application_id: string
  application_status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
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

export interface EventManagementStats {
  totalVolunteers: number
  maxVolunteers: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  totalApplications: number
}

export interface ApplicationAction {
  action: 'accept' | 'reject' | 'remove'
  applicationId: string
  eventId: string
}

export interface ApplicationActionResponse {
  success: boolean
  message: string
  currentVolunteers?: number
  error?: string
}

export interface VolunteerProfile {
  id: string
  skills: string[]
  interests: string[]
  bio?: string
  rating: number
  hoursCompleted: number
  eventsParticipated: number
  address?: string
  city?: string
  state?: string
  country?: string
  latitude?: number
  longitude?: number
  birthDate?: string
  gender?: string
  languages: string[]
  experience: string[]
  socialLinks: string[]
  cvUrl?: string
  achievements: string[]
  verified: boolean
  references: string[]
  tagline?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    emailVerified: boolean
    phoneVerified: boolean
    createdAt: string
  }
  participatedEvents: ParticipatedEvent[]
  availability: Availability[]
  stats: VolunteerStats
}

export interface ParticipatedEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  status: string
  rating?: number
  feedback?: string
  organization_name: string
}

export interface Availability {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:MM format
  endTime: string // HH:MM format
}

export interface VolunteerStats {
  total_applications: number
  accepted_applications: number
  rejected_applications: number
  completed_events: number
  average_rating: number
}

export interface ParticipantFilters {
  searchQuery: string
  status: string
  skills: string[]
}

export interface EventManagementState {
  event: EventManagementEvent | null
  participants: EventParticipant[]
  filteredParticipants: EventParticipant[]
  loading: boolean
  selectedParticipant: EventParticipant | null
  showProfileModal: boolean
  actionLoading: string | null
  filters: ParticipantFilters
}

export interface EventManagementEvent {
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

// Tipos para las acciones de la API
export interface ParticipantsResponse {
  participants: EventParticipant[]
}

export interface VolunteerProfileResponse {
  profile: VolunteerProfile
}

// Tipos para los filtros de búsqueda
export interface SearchFilters {
  query?: string
  status?: string
  skills?: string[]
}

// Tipos para las notificaciones
export interface EventNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR'
  actionUrl?: string
  createdAt: string
}

// Tipos para el estado de las acciones
export type ActionStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ActionState {
  status: ActionStatus
  message?: string
  error?: string
}

// Tipos para las estadísticas del evento
export interface EventStatistics {
  totalParticipants: number
  acceptedParticipants: number
  pendingParticipants: number
  rejectedParticipants: number
  completionRate: number
  averageRating: number
  topSkills: string[]
  participantLocations: LocationStats[]
}

export interface LocationStats {
  city: string
  state: string
  country: string
  participantCount: number
}

// Tipos para la exportación de datos
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel'
  includeFields: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface ExportData {
  filename: string
  data: string | Blob
  mimeType: string
}

// Tipos para la comunicación con participantes
export interface BulkMessage {
  recipients: string[] // Array de IDs de participantes
  subject: string
  message: string
  type: 'INFO' | 'REMINDER' | 'UPDATE' | 'URGENT'
}

export interface MessageTemplate {
  id: string
  name: string
  subject: string
  message: string
  variables: string[]
  category: 'WELCOME' | 'REMINDER' | 'UPDATE' | 'CUSTOM'
}

// Tipos para el calendario de eventos
export interface EventCalendar {
  eventId: string
  title: string
  startDate: string
  endDate: string
  participants: string[]
  maxParticipants: number
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
}

// Tipos para reportes y analytics
export interface EventReport {
  eventId: string
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  metrics: {
    totalApplications: number
    acceptanceRate: number
    completionRate: number
    averageRating: number
    participantRetention: number
  }
  trends: {
    applicationsOverTime: TimeSeriesData[]
    participantEngagement: TimeSeriesData[]
  }
}

export interface TimeSeriesData {
  date: string
  value: number
  label: string
}

// Tipos para permisos y roles
export interface EventPermission {
  userId: string
  eventId: string
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'VIEWER'
  permissions: {
    canManageParticipants: boolean
    canEditEvent: boolean
    canDeleteEvent: boolean
    canViewAnalytics: boolean
    canSendMessages: boolean
  }
}

// Tipos para auditoría
export interface EventAuditLog {
  id: string
  eventId: string
  userId: string
  action: string
  details: Record<string, any>
  timestamp: string
  ipAddress?: string
  userAgent?: string
}



