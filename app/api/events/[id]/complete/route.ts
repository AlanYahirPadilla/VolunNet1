import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== POST /api/events/[id]/complete - Starting ===")
    console.log("Event ID:", params.id)
    
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const eventId = params.id

    // Verificar que el usuario es el organizador del evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: true,
        applications: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            volunteer: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    if (event.organization.userId !== user.id) {
      return NextResponse.json({ error: "Solo el organizador puede marcar el evento como completado" }, { status: 403 })
    }

    console.log("Event status:", event.status)
    console.log("Event organization userId:", event.organization.userId)
    console.log("Current user id:", user.id)
    
    if (event.status !== 'ONGOING' && event.status !== 'PUBLISHED') {
      console.log("Event status validation failed")
      return NextResponse.json({ error: "Solo eventos en curso o publicados pueden marcarse como completados" }, { status: 400 })
    }

    // Marcar evento como completado
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    })

    // Actualizar estado de todas las aplicaciones aceptadas a COMPLETED
    await prisma.eventApplication.updateMany({
      where: {
        eventId: eventId,
        status: 'ACCEPTED'
      },
      data: {
        status: 'COMPLETED'
      }
    })

    // TODO: Implementar notificaciones cuando el sistema esté listo
    console.log(`Evento "${event.title}" marcado como completado`)
    console.log(`Aplicaciones actualizadas: ${event.applications.length}`)

    return NextResponse.json({
      message: "Evento marcado como completado exitosamente",
      event: updatedEvent
    })

  } catch (error) {
    console.error("Error completing event:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const eventId = params.id

    // Obtener información del evento y sus aplicaciones
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: true,
        applications: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            volunteer: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Verificar permisos
    const canComplete = event.organization.userId === user.id
    const isParticipant = event.applications.some(app => app.volunteer.userId === user.id)

    if (!canComplete && !isParticipant) {
      return NextResponse.json({ error: "No tienes permisos para ver este evento" }, { status: 403 })
    }

    return NextResponse.json({
      event,
      canComplete,
      isParticipant,
      participantsCount: event.applications.length
    })

  } catch (error) {
    console.error("Error fetching event completion info:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
