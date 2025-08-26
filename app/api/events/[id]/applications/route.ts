import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

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

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Solo el organizador del evento puede ver las aplicaciones
    if (event.organization.userId !== user.id) {
      return NextResponse.json({ error: "No autorizado para ver las aplicaciones de este evento" }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    console.log("🔍 Status filter:", status)

    // Construir filtros
    const where: any = { eventId }
    if (status) {
      // Si hay múltiples status separados por coma, usar el operador 'in'
      if (status.includes(',')) {
        const statusArray = status.split(',').map(s => s.trim())
        where.status = { in: statusArray }
        console.log("🔍 Using 'in' operator with statuses:", statusArray)
      } else {
        where.status = status
        console.log("🔍 Using single status:", status)
      }
    }
    console.log("🔍 Where clause:", where)

    // Obtener aplicaciones para el evento
    const applications = await prisma.eventApplication.findMany({
      where,
      include: {
        volunteer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log("📊 Applications found:", applications.length)

    const mappedApplications = applications.map(app => ({
      id: app.id,
      eventId: app.eventId,
      volunteerId: app.volunteerId,
      status: app.status,
      appliedAt: app.createdAt,
      volunteer: app.volunteer,
      rating: app.rating || null,
      ratingComment: app.feedback || null,
      ratingDate: app.completedAt || null
    }))

    console.log("✅ Returning mapped applications:", mappedApplications.length)
    return NextResponse.json(mappedApplications)

  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
