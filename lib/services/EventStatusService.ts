import { prisma } from "@/lib/prisma"

export class EventStatusService {
  /**
   * Actualiza automáticamente el estado de los eventos basado en fechas
   */
  static async updateEventStatuses() {
    try {
      const now = new Date()
      
      // Eventos que deben cambiar a ONGOING (fecha de inicio alcanzada)
      const eventsToStart = await prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          startDate: {
            lte: now
          }
        }
      })

      for (const event of eventsToStart) {
        await prisma.event.update({
          where: { id: event.id },
          data: { 
            status: 'ONGOING',
            updatedAt: now
          }
        })
        console.log(`Evento ${event.title} cambiado a ONGOING`)
      }

      // Eventos que deben cambiar a COMPLETED (fecha de fin alcanzada)
      const eventsToComplete = await prisma.event.findMany({
        where: {
          status: 'ONGOING',
          endDate: {
            lte: now
          }
        }
      })

      for (const event of eventsToComplete) {
        await prisma.event.update({
          where: { id: event.id },
          data: { 
            status: 'COMPLETED',
            updatedAt: now
          }
        })
        console.log(`Evento ${event.title} cambiado a COMPLETED`)
      }

      // Eventos que deben cambiar a ARCHIVED (completados hace más de 30 días)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const eventsToArchive = await prisma.event.findMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lte: thirtyDaysAgo
          }
        }
      })

      for (const event of eventsToArchive) {
        await prisma.event.update({
          where: { id: event.id },
          data: { 
            status: 'ARCHIVED',
            updatedAt: now
          }
        })
        console.log(`Evento ${event.title} cambiado a ARCHIVED`)
      }

      return {
        started: eventsToStart.length,
        completed: eventsToComplete.length,
        archived: eventsToArchive.length
      }
    } catch (error) {
      console.error('Error updating event statuses:', error)
      throw error
    }
  }

  /**
   * Obtiene el estado recomendado para un evento basado en fechas
   */
  static getRecommendedStatus(startDate: Date, endDate: Date): string {
    const now = new Date()
    
    if (now < startDate) {
      return 'PUBLISHED' // Evento futuro
    } else if (now >= startDate && now <= endDate) {
      return 'ONGOING' // Evento en proceso
    } else if (now > endDate) {
      return 'COMPLETED' // Evento terminado
    }
    
    return 'PUBLISHED'
  }

  /**
   * Verifica si un evento está abierto para postulaciones
   */
  static isEventOpenForApplications(event: any): boolean {
    const now = new Date()
    const startDate = new Date(event.startDate)
    
    // Los eventos están abiertos para postulaciones hasta 24 horas antes del inicio
    const applicationDeadline = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
    
    return now <= applicationDeadline && event.status === 'PUBLISHED'
  }

  /**
   * Obtiene el tiempo restante para postularse
   */
  static getTimeUntilApplicationDeadline(event: any): string {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const applicationDeadline = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
    
    if (now > applicationDeadline) {
      return 'Cerrado'
    }
    
    const timeDiff = applicationDeadline.getTime() - now.getTime()
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days} día${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`
    } else {
      return 'Menos de 1 hora'
    }
  }

  /**
   * Obtiene el estado de visualización para el usuario
   */
  static getDisplayStatus(event: any): {
    status: string
    label: string
    color: string
    description: string
  } {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    
    if (event.status === 'DRAFT') {
      return {
        status: 'DRAFT',
        label: 'Borrador',
        color: 'bg-gray-100 text-gray-700',
        description: 'Evento en preparación'
      }
    }
    
    if (event.status === 'PUBLISHED') {
      if (now < startDate) {
        const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return {
          status: 'PUBLISHED',
          label: 'Próximo',
          color: 'bg-yellow-100 text-yellow-700',
          description: `En ${daysUntilStart} día${daysUntilStart > 1 ? 's' : ''}`
        }
      } else {
        return {
          status: 'PUBLISHED',
          label: 'Iniciando',
          color: 'bg-blue-100 text-blue-700',
          description: 'Evento comenzando'
        }
      }
    }
    
    if (event.status === 'ONGOING') {
      return {
        status: 'ONGOING',
        label: 'En Proceso',
        color: 'bg-green-100 text-green-700',
        description: 'Evento en ejecución'
      }
    }
    
    if (event.status === 'COMPLETED') {
      return {
        status: 'COMPLETED',
        label: 'Completado',
        color: 'bg-purple-100 text-purple-700',
        description: 'Evento finalizado'
      }
    }
    
    if (event.status === 'ARCHIVED') {
      return {
        status: 'ARCHIVED',
        label: 'Archivado',
        color: 'bg-gray-100 text-gray-700',
        description: 'Evento histórico'
      }
    }
    
    return {
      status: event.status,
      label: event.status,
      color: 'bg-gray-100 text-gray-700',
      description: 'Estado desconocido'
    }
  }
}


