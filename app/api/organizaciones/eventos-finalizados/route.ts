import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/organizaciones/eventos-finalizados - Starting ===")
    
    const user = await getCurrentUser()
    if (!user) {
      console.log("Usuario no autorizado")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("Usuario autenticado:", { id: user.id, role: user.role, email: user.email })

    if (user.role !== 'ORGANIZATION') {
      console.log("Usuario no es organización")
      return NextResponse.json({ error: "Solo organizaciones pueden acceder a esta información" }, { status: 403 })
    }

    // Obtener la organización del usuario
    const organization = await prisma.organization.findUnique({
      where: { userId: user.id }
    })

    if (!organization) {
      console.log("Organización no encontrada para usuario:", user.id)
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
    }

    console.log("Organización encontrada:", { id: organization.id, name: organization.name })

    console.log("=== Consultando eventos ===")
    console.log("Organization ID:", organization.id)
    console.log("Buscando eventos con status: COMPLETED")
    
    // Obtener eventos completados de la organización usando Prisma
    console.log("📊 Ejecutando consulta Prisma...")
    const events = await prisma.event.findMany({
      where: {
        organizationId: organization.id,
        status: 'COMPLETED' as any
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true
          }
        },
        applications: {
          where: {
            status: 'COMPLETED' as any
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log("=== Eventos encontrados ===")
    console.log("Total eventos:", events.length)
    console.log("Estados encontrados:", events.map(e => e.status))

    // Transformar los datos para incluir información adicional
    const transformedEvents = events.map(event => {
      const participantsCount = event.applications?.length || 0
      const ratingsPending = 0 // No ratingStatus column, so no pending ratings
      
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        city: event.city,
        state: event.state,
        startDate: event.startDate,
        endDate: event.endDate,
        maxVolunteers: event.maxVolunteers,
        currentVolunteers: event.currentVolunteers,
        status: event.status,
        category_name: event.category?.name || 'Sin categoría',
        category_icon: event.category?.icon || '📋',
        category_color: event.category?.color || 'bg-gray-100 text-gray-700',
        completedAt: event.updatedAt, // Usar updatedAt como fecha de completado
        participantsCount,
        ratingsPending
      }
    })

    return NextResponse.json({
      events: transformedEvents,
      total: transformedEvents.length,
      organization: {
        id: organization.id,
        name: organization.name
      }
    })

  } catch (error) {
    console.error("Error fetching completed events:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
