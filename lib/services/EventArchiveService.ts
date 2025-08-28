import { prisma } from '@/lib/prisma'
import { NotificationService } from './NotificationService'
import { EventStatus } from '@prisma/client'

export class EventArchiveService {
  private static instance: EventArchiveService
  private notificationService: NotificationService

  constructor() {
    this.notificationService = NotificationService.getInstance()
  }

  // Singleton pattern
  public static getInstance(): EventArchiveService {
    if (!EventArchiveService.instance) {
      EventArchiveService.instance = new EventArchiveService()
    }
    return EventArchiveService.instance
  }

  // Archivar eventos completados automáticamente
  async archiveCompletedEvents(): Promise<void> {
    try {
      console.log('Starting automatic event archive process...')
      
      // Buscar eventos completados que han pasado más de 7 días
      const completedEvents = await prisma.event.findMany({
        where: {
          status: 'COMPLETED',
          endDate: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días después
          }
        },
        include: {
          applications: {
            include: {
              volunteer: true
            }
          },
          organization: true
        }
      })

      console.log(`Found ${completedEvents.length} events to archive`)

      for (const event of completedEvents) {
        await this.archiveEvent(event)
      }

      console.log('Automatic event archive process completed')
    } catch (error) {
      console.error('Error in automatic event archive process:', error)
      throw error
    }
  }

  // Archivar un evento específico
  async archiveEvent(event: any): Promise<void> {
    try {
      console.log(`Archiving event: ${event.title} (ID: ${event.id})`)

      // Marcar evento como archivado
      await prisma.event.update({
        where: { id: event.id },
        data: { status: 'ARCHIVED' }
      })

      // Enviar notificaciones de archivo
      await this.sendArchiveNotifications(event)

      console.log(`Event ${event.title} archived successfully`)
    } catch (error) {
      console.error(`Error archiving event ${event.id}:`, error)
      throw error
    }
  }

  // Enviar notificaciones de archivo
  private async sendArchiveNotifications(event: any): Promise<void> {
    try {
      // Notificar a todos los voluntarios participantes
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
        'organization_rating_reminder',
        {
          eventTitle: event.title,
          volunteersCount: event.applications.length
        },
        {
          category: 'RATING',
          subcategory: 'RATING_REMINDER',
          priority: 'NORMAL',
          relatedEventId: event.id
        }
      )

      console.log(`Archive notifications sent for event ${event.id}`)
    } catch (error) {
      console.error(`Error sending archive notifications for event ${event.id}:`, error)
    }
  }

  // Programar recordatorios de calificación
  async scheduleRatingReminders(): Promise<void> {
    try {
      console.log('Starting rating reminder scheduling...')
      
      // Buscar eventos archivados que necesitan recordatorios
      const archivedEvents = await prisma.event.findMany({
        where: {
          status: 'ARCHIVED',
          applications: {
            some: {
              ratingStatus: { in: ['PENDING', 'VOLUNTEER_RATED', 'ORGANIZATION_RATED'] }
            }
          }
        },
        include: {
          applications: {
            include: {
              volunteer: true
            }
          },
          organization: true
        }
      })

      console.log(`Found ${archivedEvents.length} archived events needing rating reminders`)

      for (const event of archivedEvents) {
        await this.scheduleEventRatingReminders(event)
      }

      console.log('Rating reminder scheduling completed')
    } catch (error) {
      console.error('Error scheduling rating reminders:', error)
      throw error
    }
  }

  // Programar recordatorios para un evento específico
  private async scheduleEventRatingReminders(event: any): Promise<void> {
    try {
      const now = new Date()
      const archivedAt = event.updatedAt // Asumiendo que updatedAt se actualiza cuando se archiva
      const daysSinceArchived = Math.floor((now.getTime() - archivedAt.getTime()) / (1000 * 60 * 60 * 24))

      // Recordatorios escalonados
      if (daysSinceArchived === 1) {
        await this.sendFirstRatingReminder(event)
      } else if (daysSinceArchived === 3) {
        await this.sendSecondRatingReminder(event)
      } else if (daysSinceArchived === 7) {
        await this.sendFinalRatingReminder(event)
      }
    } catch (error) {
      console.error(`Error scheduling reminders for event ${event.id}:`, error)
    }
  }

  // Primer recordatorio de calificación
  private async sendFirstRatingReminder(event: any): Promise<void> {
    try {
      // Para voluntarios
      for (const application of event.applications) {
        if (application.ratingStatus === 'PENDING') {
          await this.notificationService.createFromTemplate(
            application.volunteerId,
            'rating_reminder_first',
            {
              eventTitle: event.title,
              daysLeft: 6
            },
            {
              category: 'RATING',
              subcategory: 'RATING_REMINDER',
              priority: 'NORMAL',
              relatedEventId: event.id
            }
          )
        }
      }

      // Para la organización
      await this.notificationService.createFromTemplate(
        event.organization.userId,
        'organization_rating_reminder',
        {
          eventTitle: event.title,
          volunteersCount: event.applications.length,
          daysLeft: 6
        },
        {
          category: 'RATING',
          subcategory: 'RATING_REMINDER',
          priority: 'NORMAL',
          relatedEventId: event.id
        }
      )

      console.log(`First rating reminders sent for event ${event.id}`)
    } catch (error) {
      console.error(`Error sending first rating reminders for event ${event.id}:`, error)
    }
  }

  // Segundo recordatorio de calificación
  private async sendSecondRatingReminder(event: any): Promise<void> {
    try {
      // Para voluntarios
      for (const application of event.applications) {
        if (application.ratingStatus === 'PENDING') {
          await this.notificationService.createFromTemplate(
            application.volunteerId,
            'rating_reminder_second',
            {
              eventTitle: event.title
            },
            {
              category: 'RATING',
              subcategory: 'RATING_REMINDER',
              priority: 'HIGH',
              relatedEventId: event.id
            }
          )
        }
      }

      // Para la organización
      await this.notificationService.createFromTemplate(
        event.organization.userId,
        'organization_rating_reminder',
        {
          eventTitle: event.title,
          volunteersCount: event.applications.length,
          daysLeft: 4
        },
        {
          category: 'RATING',
          subcategory: 'RATING_REMINDER',
          priority: 'HIGH',
          relatedEventId: event.id
        }
      )

      console.log(`Second rating reminders sent for event ${event.id}`)
    } catch (error) {
      console.error(`Error sending second rating reminders for event ${event.id}:`, error)
    }
  }

  // Recordatorio final de calificación
  private async sendFinalRatingReminder(event: any): Promise<void> {
    try {
      // Para voluntarios
      for (const application of event.applications) {
        if (application.ratingStatus === 'PENDING') {
          await this.notificationService.createFromTemplate(
            application.volunteerId,
            'rating_reminder_final',
            {
              eventTitle: event.title
            },
            {
              category: 'RATING',
              subcategory: 'RATING_REMINDER',
              priority: 'URGENT',
              relatedEventId: event.id
            }
          )
        }
      }

      // Para la organización
      await this.notificationService.createFromTemplate(
        event.organization.userId,
        'organization_rating_reminder',
        {
          eventTitle: event.title,
          volunteersCount: event.applications.length,
          daysLeft: 1
        },
        {
          category: 'RATING',
          subcategory: 'RATING_REMINDER',
          priority: 'URGENT',
          relatedEventId: event.id
        }
      )

      console.log(`Final rating reminders sent for event ${event.id}`)
    } catch (error) {
      console.error(`Error sending final rating reminders for event ${event.id}:`, error)
    }
  }

  // Obtener eventos que necesitan archivo
  async getEventsNeedingArchive(): Promise<any[]> {
    return await prisma.event.findMany({
      where: {
        status: 'COMPLETED',
        endDate: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        applications: {
          include: {
            volunteer: true
          }
        },
        organization: true
      },
      orderBy: { endDate: 'asc' }
    })
  }

  // Obtener eventos archivados recientemente
  async getRecentlyArchivedEvents(limit: number = 10): Promise<any[]> {
    return await prisma.event.findMany({
      where: {
        status: 'ARCHIVED'
      },
      include: {
        applications: {
          include: {
            volunteer: true
          }
        },
        organization: true
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })
  }

  // Obtener estadísticas de archivo
  async getArchiveStats(): Promise<any> {
    const totalArchived = await prisma.event.count({
      where: { status: 'ARCHIVED' }
    })

    const archivedThisMonth = await prisma.event.count({
      where: {
        status: 'ARCHIVED',
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    const pendingArchive = await prisma.event.count({
      where: {
        status: 'COMPLETED',
        endDate: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    return {
      totalArchived,
      archivedThisMonth,
      pendingArchive
    }
  }

  // Restaurar evento desde archivo (para casos especiales)
  async restoreEvent(eventId: string): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      })

      if (!event || event.status !== 'ARCHIVED') {
        throw new Error('Event not found or not archived')
      }

      await prisma.event.update({
        where: { id: eventId },
        data: { status: 'COMPLETED' }
      })

      console.log(`Event ${eventId} restored from archive`)
    } catch (error) {
      console.error(`Error restoring event ${eventId}:`, error)
      throw error
    }
  }

  // Limpiar eventos archivados muy antiguos (opcional)
  async cleanupOldArchivedEvents(daysOld: number = 365): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
      
      const oldEvents = await prisma.event.findMany({
        where: {
          status: 'ARCHIVED',
          updatedAt: { lt: cutoffDate }
        }
      })

      console.log(`Found ${oldEvents.length} old archived events to cleanup`)

      for (const event of oldEvents) {
        // Aquí podrías implementar lógica para mover a almacenamiento frío
        // o eliminar completamente según tus necesidades
        console.log(`Event ${event.id} is ${daysOld} days old and eligible for cleanup`)
      }
    } catch (error) {
      console.error('Error cleaning up old archived events:', error)
      throw error
    }
  }
}



