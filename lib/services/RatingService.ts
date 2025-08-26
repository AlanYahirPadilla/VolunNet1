import { prisma } from '@/lib/prisma'
import { NotificationService } from './NotificationService'
import { RatingStatus } from '@prisma/client'

export interface CreateRatingData {
  eventId: string
  raterId: string
  ratedId: string
  rating: number
  feedback?: string
}

export interface RatingSummary {
  averageRating: number
  totalRatings: number
  ratingDistribution: Record<number, number>
}

export class RatingService {
  private static instance: RatingService
  private notificationService: NotificationService

  constructor() {
    this.notificationService = NotificationService.getInstance()
  }

  // Singleton pattern
  public static getInstance(): RatingService {
    if (!RatingService.instance) {
      RatingService.instance = new RatingService()
    }
    return RatingService.instance
  }

  // Crear calificación
  async createRating(ratingData: CreateRatingData): Promise<any> {
    const { eventId, raterId, ratedId, rating, feedback } = ratingData

    try {
      // Validar que el rating esté en el rango correcto
      if (rating < 1 || rating > 5) {
        throw new Error('Rating debe estar entre 1 y 5')
      }

      // Verificar que no exista una calificación previa
      const existingRating = await prisma.eventRating.findUnique({
        where: {
          eventId_raterId_ratedId: {
            eventId,
            raterId,
            ratedId
          }
        }
      })

      if (existingRating) {
        throw new Error('Ya has calificado a este usuario para este evento')
      }

      // Crear la calificación
      const eventRating = await prisma.eventRating.create({
        data: {
          eventId,
          raterId,
          ratedId,
          rating,
          feedback
        }
      })

      // Actualizar estado de la aplicación
      await this.updateApplicationRatingStatus(eventId, raterId)

      // Calcular rating promedio del usuario calificado
      await this.updateUserRating(ratedId)

      // Enviar notificaciones inteligentes
      await this.sendRatingNotifications(eventRating)

      return eventRating
    } catch (error) {
      console.error('Error creating rating:', error)
      throw error
    }
  }

  // Actualizar estado de calificación de la aplicación
  private async updateApplicationRatingStatus(eventId: string, raterId: string): Promise<void> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { 
        applications: true,
        organization: true
      }
    })

    if (!event) return

    // Determinar si el rater es voluntario u organización
    const isVolunteer = event.applications.some(app => app.volunteerId === raterId)
    const isOrganization = event.organization.userId === raterId

    if (isVolunteer) {
      // Voluntario calificando a la organización
      await prisma.eventApplication.updateMany({
        where: { 
          eventId,
          volunteerId: raterId
        },
        data: { ratingStatus: 'VOLUNTEER_RATED' }
      })
    } else if (isOrganization) {
      // Organización calificando a voluntarios
      await prisma.eventApplication.updateMany({
        where: { 
          eventId,
          volunteerId: ratedId
        },
        data: { ratingStatus: 'ORGANIZATION_RATED' }
      })
    }

    // Verificar si ambas partes calificaron
    await this.checkAndUpdateBothRated(eventId)
  }

  // Verificar si ambas partes calificaron y actualizar estado
  private async checkAndUpdateBothRated(eventId: string): Promise<void> {
    const applications = await prisma.eventApplication.findMany({
      where: { eventId }
    })

    for (const application of applications) {
      if (application.ratingStatus === 'BOTH_RATED') continue

      // Verificar si ambas partes calificaron
      const volunteerRating = await prisma.eventRating.findFirst({
        where: {
          eventId,
          raterId: application.volunteerId,
          ratedId: application.event.organization.userId
        }
      })

      const organizationRating = await prisma.eventRating.findFirst({
        where: {
          eventId,
          raterId: application.event.organization.userId,
          ratedId: application.volunteerId
        }
      })

      if (volunteerRating && organizationRating) {
        // Ambas partes calificaron
        await prisma.eventApplication.update({
          where: { id: application.id },
          data: { ratingStatus: 'BOTH_RATED' }
        })

        // Enviar notificación de calificación completada
        await this.sendCompletionNotification(eventId, application.volunteerId)
      }
    }

    // Verificar si todos los voluntarios fueron calificados
    await this.checkAllVolunteersRated(eventId)
  }

  // Verificar si todos los voluntarios fueron calificados
  private async checkAllVolunteersRated(eventId: string): Promise<void> {
    const applications = await prisma.eventApplication.findMany({
      where: { eventId }
    })

    const allRated = applications.every(app => app.ratingStatus === 'BOTH_RATED')

    if (allRated) {
      // Marcar evento como completamente calificado
      await prisma.event.update({
        where: { id: eventId },
        data: { status: 'ARCHIVED' }
      })

      // Enviar notificación de evento completamente calificado
      await this.sendEventFullyRatedNotification(eventId)
    }
  }

  // Enviar notificaciones de calificación
  private async sendRatingNotifications(eventRating: any): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventRating.eventId },
        include: { organization: true }
      })

      if (!event) return

      // Notificación para el usuario calificado
      await this.notificationService.createFromTemplate(
        eventRating.ratedId,
        'rating_received',
        {
          eventTitle: event.title,
          rating: eventRating.rating,
          feedback: eventRating.feedback || 'Sin comentarios'
        },
        {
          category: 'RATING',
          subcategory: 'RATING_RECEIVED',
          priority: 'NORMAL',
          relatedEventId: event.id
        }
      )

      // Verificar si ambas partes calificaron
      const bothRated = await this.checkBothRated(eventRating.eventId)

      if (bothRated) {
        // Notificación de calificación completa
        await this.sendCompletionNotifications(eventRating.eventId)
      }
    } catch (error) {
      console.error('Error sending rating notifications:', error)
    }
  }

  // Verificar si ambas partes calificaron
  private async checkBothRated(eventId: string): Promise<boolean> {
    const applications = await prisma.eventApplication.findMany({
      where: { eventId }
    })

    return applications.every(app => app.ratingStatus === 'BOTH_RATED')
  }

  // Enviar notificaciones de completado
  private async sendCompletionNotifications(eventId: string): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { 
          applications: { include: { volunteer: true } },
          organization: true
        }
      })

      if (!event) return

      // Notificar a todos los participantes
      for (const application of event.applications) {
        await this.notificationService.createFromTemplate(
          application.volunteerId,
          'rating_completed',
          {
            eventTitle: event.title
          },
          {
            category: 'RATING',
            subcategory: 'RATING_COMPLETED',
            priority: 'NORMAL',
            relatedEventId: event.id
          }
        )
      }

      // Notificar a la organización
      await this.notificationService.createFromTemplate(
        event.organization.userId,
        'rating_completed',
        {
          eventTitle: event.title
        },
        {
          category: 'RATING',
          subcategory: 'RATING_COMPLETED',
          priority: 'NORMAL',
          relatedEventId: event.id
        }
      )
    } catch (error) {
      console.error('Error sending completion notifications:', error)
    }
  }

  // Enviar notificación de calificación completada para un voluntario específico
  private async sendCompletionNotification(eventId: string, volunteerId: string): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      })

      if (!event) return

      await this.notificationService.createFromTemplate(
        volunteerId,
        'rating_completed',
        {
          eventTitle: event.title
        },
        {
          category: 'RATING',
          subcategory: 'RATING_COMPLETED',
          priority: 'NORMAL',
          relatedEventId: event.id
        }
      )
    } catch (error) {
      console.error('Error sending completion notification:', error)
    }
  }

  // Enviar notificación de evento completamente calificado
  private async sendEventFullyRatedNotification(eventId: string): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { 
          applications: { include: { volunteer: true } },
          organization: true
        }
      })

      if (!event) return

      // Notificar a todos los participantes
      for (const application of event.applications) {
        await this.notificationService.createFromTemplate(
          application.volunteerId,
          'event_archived',
          {
            eventTitle: event.title
          },
          {
            category: 'EVENT',
            subcategory: 'EVENT_ARCHIVED',
            priority: 'NORMAL',
            relatedEventId: event.id
          }
        )
      }

      // Notificar a la organización
      await this.notificationService.createFromTemplate(
        event.organization.userId,
        'event_archived',
        {
          eventTitle: event.title
        },
        {
          category: 'EVENT',
          subcategory: 'EVENT_ARCHIVED',
          priority: 'NORMAL',
          relatedEventId: event.id
        }
      )
    } catch (error) {
      console.error('Error sending event fully rated notification:', error)
    }
  }

  // Calcular y actualizar rating promedio del usuario
  private async updateUserRating(userId: string): Promise<void> {
    try {
      const ratings = await prisma.eventRating.findMany({
        where: { ratedId: userId },
        select: { rating: true }
      })

      if (ratings.length === 0) return

      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

      // Actualizar rating en Volunteer u Organization según el rol
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { volunteer: true, organization: true }
      })

      if (user?.volunteer) {
        await prisma.volunteer.update({
          where: { id: user.volunteer.id },
          data: { rating: averageRating }
        })
      } else if (user?.organization) {
        await prisma.organization.update({
          where: { id: user.organization.id },
          data: { rating: averageRating }
        })
      }
    } catch (error) {
      console.error('Error updating user rating:', error)
    }
  }

  // Obtener calificaciones de un evento
  async getEventRatings(eventId: string): Promise<any[]> {
    return await prisma.eventRating.findMany({
      where: { eventId },
      include: {
        rater: {
          include: {
            volunteer: true,
            organization: true
          }
        },
        rated: {
          include: {
            volunteer: true,
            organization: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Obtener calificaciones de un usuario
  async getUserRatings(userId: string): Promise<any[]> {
    return await prisma.eventRating.findMany({
      where: { ratedId: userId },
      include: {
        event: true,
        rater: {
          include: {
            volunteer: true,
            organization: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Obtener resumen de calificaciones de un usuario
  async getUserRatingSummary(userId: string): Promise<RatingSummary> {
    const ratings = await prisma.eventRating.findMany({
      where: { ratedId: userId },
      select: { rating: true }
    })

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    const totalRatings = ratings.length
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.forEach(r => {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++
    })

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution
    }
  }

  // Obtener eventos que necesitan calificación
  async getEventsNeedingRating(userId: string): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { volunteer: true, organization: true }
    })

    if (!user) return []

    if (user.volunteer) {
      // Buscar eventos donde el voluntario debe calificar a la organización
      // Solo eventos COMPLETED donde el voluntario participó pero no calificó
      return await prisma.eventApplication.findMany({
        where: {
          volunteerId: userId,
          status: 'COMPLETED',
          rating: null, // No ha calificado aún
          event: {
            status: 'COMPLETED'
          }
        },
        include: {
          event: {
            include: { organization: true }
          }
        }
      })
    } else if (user.organization) {
      // Buscar eventos donde la organización debe calificar a voluntarios
      // Solo eventos COMPLETED donde hay voluntarios que no han sido calificados
      return await prisma.event.findMany({
        where: {
          organizationId: user.organization.id,
          status: 'COMPLETED',
          applications: {
            some: {
              status: 'COMPLETED',
              rating: null // No ha sido calificado por la organización
            }
          }
        },
        include: {
          applications: {
            where: {
              status: 'COMPLETED',
              rating: null
            },
            include: { volunteer: true }
          }
        }
      })
    }

    return []
  }

  // Verificar si un usuario puede calificar a otro en un evento
  async canRateUser(eventId: string, raterId: string, ratedId: string): Promise<boolean> {
    // Verificar que no exista una calificación previa
    const existingRating = await prisma.eventRating.findUnique({
      where: {
        eventId_raterId_ratedId: {
          eventId,
          raterId,
          ratedId
        }
      }
    })

    if (existingRating) return false

    // Verificar que el evento esté completado o archivado
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event || !['COMPLETED', 'ARCHIVED'].includes(event.status)) {
      return false
    }

    // Verificar que el rater esté autorizado (participante o organizador)
    const application = await prisma.eventApplication.findFirst({
      where: {
        eventId,
        volunteerId: raterId
      }
    })

    const isOrganizer = event.organizationId === raterId

    return !!(application || isOrganizer)
  }
}


