import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"
import { NotificationService } from "@/lib/services/NotificationService"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    // Si se proporciona un eventId, verificar si el usuario se ha postulado a ese evento específico
    if (eventId) {
      const application = await prisma.eventApplication.findFirst({
        where: {
          eventId: eventId,
          volunteerId: user.id
        },
        select: {
          id: true,
          status: true,
          appliedAt: true,
          message: true
        }
      })

      return NextResponse.json({ 
        hasApplied: !!application,
        application: application
      })
    }

    // Obtener todas las aplicaciones del usuario
    const applications = await prisma.eventApplication.findMany({
      where: {
        volunteerId: user.id
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        message: true,
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    })

    // Transformar los datos para mantener compatibilidad
    const transformedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      message: app.message,
      eventId: app.event.id,
      event_title: app.event.title,
      event_start_date: app.event.startDate,
      event_end_date: app.event.endDate,
      organization_name: app.event.organization.name
    }))

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: "ID del evento requerido" }, { status: 400 })
    }

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        maxVolunteers: true, 
        currentVolunteers: true 
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Verificar que no se haya postulado ya
    const existingApplication = await prisma.eventApplication.findFirst({
      where: {
        eventId: eventId,
        volunteerId: user.id
      }
    })

    if (existingApplication) {
      return NextResponse.json({ error: "Ya te has postulado a este evento" }, { status: 400 })
    }

    // Crear la aplicación usando transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Crear la aplicación
      const application = await tx.eventApplication.create({
        data: {
          eventId: eventId,
          volunteerId: user.id,
          status: 'PENDING'
        },
        select: {
          id: true,
          status: true,
          appliedAt: true
        }
      })

      // Actualizar contador de voluntarios del evento
      await tx.event.update({
        where: { id: eventId },
        data: {
          currentVolunteers: {
            increment: 1
          }
        }
      })

      return application
    })

    // Crear notificaciones para el voluntario y el organizador
    const notificationService = new NotificationService()
    
    // Obtener información del evento y organización para las notificaciones
    const eventInfo = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: {
          include: {
            user: true
          }
        }
      }
    })

    if (eventInfo) {
      // Notificación para el voluntario (confirmación de postulación)
      await notificationService.createNotification({
        userId: user.id,
        title: "Postulación Enviada",
        message: `Te has postulado exitosamente al evento "${eventInfo.title}". El organizador revisará tu solicitud.`,
        category: "APPLICATION",
        subcategory: "APPLICATION_RECEIVED",
        priority: "NORMAL",
        actionUrl: `/eventos/${eventId}`,
        actionText: "Ver Evento",
        relatedEventId: eventId
      })

      // Notificación para el organizador (nueva postulación)
      await notificationService.createNotification({
        userId: eventInfo.organization.userId,
        title: "Nueva Postulación",
        message: `${user.firstName} ${user.lastName} se ha postulado al evento "${eventInfo.title}".`,
        category: "APPLICATION",
        subcategory: "APPLICATION_RECEIVED",
        priority: "NORMAL",
        actionUrl: `/eventos/${eventId}`,
        actionText: "Ver Postulación",
        relatedEventId: eventId
      })
    }

    return NextResponse.json({ 
      message: "Postulación enviada exitosamente",
      application: result
    })
  } catch (error) {
    console.error("Error applying to event:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

