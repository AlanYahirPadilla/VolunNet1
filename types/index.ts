// Tipos principales para VolunNet

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: "volunteer" | "organization" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Volunteer extends User {
  role: "volunteer"
  skills: string[]
  interests: string[]
  location: Location
  availability: Availability[]
  rating: number
  hoursCompleted: number
  eventsParticipated: number
}

export interface Organization extends User {
  role: "organization"
  name: string
  description: string
  website?: string
  verified: boolean
  location: Location
  eventsCreated: number
  volunteersHelped: number
}

export interface Event {
  id: string
  title: string
  description: string
  organizationId: string
  organization: Organization
  location: Location
  startDate: Date
  endDate: Date
  maxVolunteers: number
  currentVolunteers: number
  skills: string[]
  category: EventCategory
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled"
  requirements: string[]
  benefits: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  address: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

export interface Availability {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:MM format
  endTime: string // HH:MM format
}

export interface EventCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: Date
  actionUrl?: string
}

export interface EventApplication {
  id: string
  eventId: string
  volunteerId: string
  status: "pending" | "accepted" | "rejected" | "completed"
  appliedAt: Date
  message?: string
  rating?: number
  feedback?: string
}

// Tipos para Machine Learning y Recomendaciones
export interface UserVector {
  userId: string
  features: number[]
  lastUpdated: Date
}

export interface RecommendationScore {
  eventId: string
  score: number
  reasons: string[]
}

export interface MLMetrics {
  precision: number
  recall: number
  f1Score: number
  accuracy: number
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Tipos para formularios
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: "volunteer" | "organization"
}

export interface EventForm {
  title: string
  description: string
  location: Partial<Location>
  startDate: string
  endDate: string
  maxVolunteers: number
  skills: string[]
  categoryId: string
  requirements: string[]
  benefits: string[]
}

// Tipos para WebSocket
export interface SocketMessage {
  type: "notification" | "event_update" | "chat_message"
  payload: any
  timestamp: Date
}

// Tipos para configuración del sistema
export interface SystemConfig {
  maxEventsPerOrganization: number
  maxVolunteersPerEvent: number
  recommendationRefreshInterval: number
  notificationSettings: {
    email: boolean
    push: boolean
    sms: boolean
  }
}
