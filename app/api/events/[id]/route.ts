import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== GET /api/events/[id] - Starting ===")
    console.log("Event ID:", params.id)

    // Primero, intentar obtener solo el evento básico sin includes
    console.log("📊 Ejecutando consulta Prisma básica...")
    const basicEvent = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!basicEvent) {
      console.log("❌ Event not found")
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    console.log("✅ Basic event found:", basicEvent.id)
    console.log("📊 Basic event data:", {
      id: basicEvent.id,
      title: basicEvent.title,
      status: basicEvent.status,
      organizationId: basicEvent.organizationId,
      categoryId: basicEvent.categoryId
    })

    // Ahora intentar obtener las relaciones por separado
    console.log("📊 Obteniendo organización...")
    const organization = await prisma.organization.findUnique({
      where: { id: basicEvent.organizationId },
      select: {
        name: true,
        verified: true
      }
    })

    console.log("📊 Obteniendo categoría...")
    const category = await prisma.eventCategory.findUnique({
      where: { id: basicEvent.categoryId },
      select: {
        name: true,
        icon: true,
        color: true
      }
    })

    // Transformar los datos para mantener compatibilidad con el frontend
    const transformedEvent = {
      id: basicEvent.id,
      title: basicEvent.title,
      description: basicEvent.description,
      address: basicEvent.address,
      city: basicEvent.city,
      state: basicEvent.state,
      country: basicEvent.country,
      startDate: basicEvent.startDate,
      endDate: basicEvent.endDate,
      maxVolunteers: basicEvent.maxVolunteers,
      currentVolunteers: basicEvent.currentVolunteers,
      skills: basicEvent.skills,
      requirements: basicEvent.requirements,
      benefits: basicEvent.benefits,
      imageUrl: basicEvent.imageUrl,
      status: basicEvent.status,
      createdAt: basicEvent.createdAt,
      updatedAt: basicEvent.updatedAt,
      latitude: basicEvent.latitude,
      longitude: basicEvent.longitude,
      organizationId: basicEvent.organizationId,
      organization_name: organization?.name || 'Sin organización',
      organization_verified: organization?.verified || false,
      categoryId: basicEvent.categoryId,
      category_name: category?.name || 'Sin categoría',
      category_icon: category?.icon || '📋',
      category_color: category?.color || 'bg-gray-100 text-gray-700'
    }

    console.log("✅ Event transformed successfully")
    return NextResponse.json({ event: transformedEvent })

  } catch (error: unknown) {
    console.error("❌ Error fetching event:", error)
    console.error("❌ Error type:", typeof error)
    console.error("❌ Error message:", (error as Error).message)
    console.error("❌ Error stack:", (error as Error).stack)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Error interno del servidor", 
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    console.log("=== PUT /api/events/[id] - Starting ===")
    console.log("Event ID:", id)
    console.log("Request body:", body)

    const {
      title,
      description,
      address,
      city,
      state,
      country,
      startDate,
      endDate,
      maxVolunteers,
      skills,
      requirements,
      benefits,
      categoryId,
      status
    } = body

    console.log("=== Campos extraídos del body ===")
    console.log("title:", title)
    console.log("description:", description)
    console.log("city:", city)
    console.log("state:", state)
    console.log("startDate:", startDate)
    console.log("endDate:", endDate)
    console.log("categoryId:", categoryId)
    console.log("categoryId type:", typeof categoryId)
    console.log("categoryId === null:", categoryId === null)
    console.log("categoryId === undefined:", categoryId === undefined)

    // Validaciones
    if (!title || !description || !city || !state || !startDate || !endDate) {
      return NextResponse.json({ 
        error: "Campos requeridos faltantes",
        missing: {
          title: !title,
          description: !description,
          city: !city,
          state: !state,
          startDate: !startDate,
          endDate: !endDate
        }
      }, { status: 400 })
    }

    // Validar que categoryId no sea null
    if (!categoryId) {
      return NextResponse.json({ 
        error: "categoryId es requerido y no puede ser null",
        received: categoryId
      }, { status: 400 })
    }

    // Verificar que la categoría existe
    const categoryExists = await prisma.eventCategory.findUnique({
      where: { id: categoryId }
    })

    if (!categoryExists) {
      return NextResponse.json({ 
        error: "Categoría no encontrada",
        categoryId: categoryId
      }, { status: 400 })
    }

    // Actualizar el evento usando Prisma
    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: {
        title: title,
        description: description,
        address: address || '',
        city: city,
        state: state,
        country: country || 'México',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxVolunteers: maxVolunteers || 10,
        skills: skills || [],
        requirements: requirements || [],
        benefits: benefits || [],
        categoryId: categoryId,
        status: status || 'DRAFT',
        updatedAt: new Date()
      },
      include: {
        organization: {
          select: {
            name: true,
            verified: true
          }
        },
        category: {
          select: {
            name: true,
            icon: true,
            color: true
          }
        }
      }
    })

    console.log("Event updated successfully:", updatedEvent.id)

    // Transformar los datos para mantener compatibilidad
    const transformedEvent = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      address: updatedEvent.address,
      city: updatedEvent.city,
      state: updatedEvent.state,
      country: updatedEvent.country,
      startDate: updatedEvent.startDate,
      endDate: updatedEvent.endDate,
      maxVolunteers: updatedEvent.maxVolunteers,
      currentVolunteers: updatedEvent.currentVolunteers,
      skills: updatedEvent.skills,
      requirements: updatedEvent.requirements,
      benefits: updatedEvent.benefits,
      imageUrl: updatedEvent.imageUrl,
      status: updatedEvent.status,
      createdAt: updatedEvent.createdAt,
      updatedAt: updatedEvent.updatedAt,
      latitude: updatedEvent.latitude,
      longitude: updatedEvent.longitude,
      organization_name: updatedEvent.organization?.name || 'Sin organización',
      organization_verified: updatedEvent.organization?.verified || false,
      category_name: updatedEvent.category?.name || 'Sin categoría',
      category_icon: updatedEvent.category?.icon || '📋',
      category_color: updatedEvent.category?.color || 'bg-gray-100 text-gray-700'
    }

    return NextResponse.json({ event: transformedEvent })

  } catch (error: unknown) {
    console.error("Error updating event:", (error as Error).message)
    console.error("Error details:", error)
    
    // Devolver error más específico
    if (error instanceof Error) {
      if (error.message.includes('categoryId')) {
        return NextResponse.json({ 
          error: "Error con categoryId: " + error.message,
          details: "Verifica que la categoría existe y sea válida"
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: (error as Error).message
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log("=== DELETE /api/events/[id] - Starting ===")
    console.log("Event ID:", id)

    // Verificar que el evento existe antes de eliminarlo
    const eventExists = await prisma.event.findUnique({
      where: { id: id }
    })

    if (!eventExists) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Eliminar el evento usando Prisma
    await prisma.event.delete({
      where: { id: id }
    })

    console.log("Event deleted successfully:", id)

    return NextResponse.json({ message: "Evento eliminado correctamente" })
  } catch (error: unknown) {
    console.error("Error deleting event:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

