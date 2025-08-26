import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const eventId = params.id
    const applicationId = params.applicationId
    const { action } = await request.json()

    if (!action || !['accept', 'reject', 'remove'].includes(action)) {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
    }

    // Verificar que el evento existe y pertenece al usuario
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    if (event.organization.userId !== user.id) {
      return NextResponse.json({ error: "No autorizado para gestionar este evento" }, { status: 403 })
    }

    // Verificar que la aplicación existe
    const application = await prisma.eventApplication.findUnique({
      where: { id: applicationId },
      include: {
        event: true
      }
    })

    if (!application) {
      return NextResponse.json({ error: "Aplicación no encontrada" }, { status: 404 })
    }

    if (application.eventId !== eventId) {
      return NextResponse.json({ error: "Aplicación no pertenece a este evento" }, { status: 400 })
    }

    let newStatus: 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
    let currentVolunteersChange = 0

    switch (action) {
      case 'accept':
        if (application.status !== 'PENDING') {
          return NextResponse.json({ error: "Solo se pueden aceptar aplicaciones pendientes" }, { status: 400 })
        }
        newStatus = 'ACCEPTED'
        currentVolunteersChange = 1
        break

      case 'reject':
        if (application.status !== 'PENDING') {
          return NextResponse.json({ error: "Solo se pueden rechazar aplicaciones pendientes" }, { status: 400 })
        }
        newStatus = 'REJECTED'
        currentVolunteersChange = 0
        break

      case 'remove':
        if (application.status !== 'ACCEPTED') {
          return NextResponse.json({ error: "Solo se pueden remover aplicaciones aceptadas" }, { status: 400 })
        }
        newStatus = 'REJECTED'
        currentVolunteersChange = -1
        break

      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }

    // Actualizar la aplicación y el contador de voluntarios en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar el estado de la aplicación
      const updatedApplication = await tx.eventApplication.update({
        where: { id: applicationId },
        data: { status: newStatus }
      })

      // Actualizar el contador de voluntarios del evento
      if (currentVolunteersChange !== 0) {
        await tx.event.update({
          where: { id: eventId },
          data: {
            currentVolunteers: {
              increment: currentVolunteersChange
            }
          }
        })
      }

      return updatedApplication
    })

    return NextResponse.json({
      message: `Aplicación ${action === 'accept' ? 'aceptada' : action === 'reject' ? 'rechazada' : 'removida'} exitosamente`,
      application: result
    })

  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
