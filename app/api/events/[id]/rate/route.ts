import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== POST /api/events/[id]/rate - Starting ===")
    
    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ No user found")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const eventId = params.id
    const body = await request.json()
    const { volunteerId, rating, comment, type } = body
    
    console.log("🎯 Event ID:", eventId)
    console.log("👤 User ID:", user.id)
    console.log("📊 Request body:", body)
    console.log("🔍 Extracted data:", { volunteerId, rating, comment, type })

    // Validar datos requeridos
    if (!volunteerId || !rating || !type) {
      console.log("❌ Missing required data:", { volunteerId: !!volunteerId, rating: !!rating, type: !!type })
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // Validar que el rating esté entre 1 y 5
    if (rating < 1 || rating > 5) {
      console.log("❌ Invalid rating:", rating)
      return NextResponse.json({ error: "La calificación debe estar entre 1 y 5" }, { status: 400 })
    }

    // Verificar que el evento existe y obtener información
    console.log("📊 Fetching event...")
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
      console.log("❌ Event not found")
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    console.log("✅ Event found:", { 
      id: event.id, 
      title: event.title, 
      status: event.status,
      organizationId: event.organization.id,
      organizationUserId: event.organization.userId
    })

    // Verificar que el evento esté completado
    if (event.status !== 'COMPLETED') {
      console.log("❌ Event status is not COMPLETED:", event.status)
      return NextResponse.json({ error: "Solo se pueden calificar eventos completados" }, { status: 400 })
    }

    // Verificar que existe una aplicación para este voluntario en este evento
    console.log("📊 Fetching application...")
    const application = await prisma.eventApplication.findFirst({
      where: {
        eventId,
        volunteerId,
        status: { in: ['ACCEPTED', 'COMPLETED'] } // Aceptar tanto ACCEPTED como COMPLETED
      }
    })

    if (!application) {
      console.log("❌ Application not found for volunteer:", volunteerId)
      return NextResponse.json({ error: "El voluntario no participó en este evento" }, { status: 400 })
    }

    console.log("✅ Application found:", { 
      id: application.id, 
      status: application.status,
      volunteerId: application.volunteerId
    })

    // Verificar permisos según el tipo de calificación
    if (type === 'ORGANIZATION_TO_VOLUNTEER') {
      // Solo el organizador puede calificar a los voluntarios
      if (event.organization.userId !== user.id) {
        console.log("❌ User not authorized - not event owner")
        return NextResponse.json({ error: "Solo el organizador puede calificar a los voluntarios" }, { status: 403 })
      }
      console.log("✅ User authorized - is event owner")
    } else if (type === 'VOLUNTEER_TO_ORGANIZATION') {
      // Solo el voluntario puede calificar a la organización
      if (application.volunteerId !== user.id) {
        console.log("❌ User not authorized - not volunteer")
        return NextResponse.json({ error: "Solo puedes calificar eventos en los que participaste" }, { status: 403 })
      }
      console.log("✅ User authorized - is volunteer")
    } else {
      console.log("❌ Invalid rating type:", type)
      return NextResponse.json({ error: "Tipo de calificación inválido" }, { status: 400 })
    }

    console.log("✅ All validations passed, updating application...")

    // Actualizar la aplicación con el rating y comment
    await prisma.eventApplication.update({
      where: { id: application.id },
      data: { 
        status: 'COMPLETED',
        rating: rating,
        feedback: comment,
        completedAt: new Date()
      }
    })

    console.log("✅ Application updated with rating:", { rating, comment })

    return NextResponse.json({
      message: "Calificación enviada exitosamente",
      rating: { rating, comment }
    })

  } catch (error) {
    console.error("❌ Error creating rating:", error)
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

    // Verificar que el evento existe
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

    // Por ahora, devolver un array vacío
    // TODO: Implementar cuando el modelo EventRating esté disponible
    return NextResponse.json([])

  } catch (error) {
    console.error("Error fetching ratings:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
