import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/app/auth/actions"

const sql = neon(process.env.DATABASE_URL!)

// Categorías predefinidas
const EVENT_CATEGORIES = [
  { id: "cat_1", name: "Educación", description: "Enseñanza y capacitación", icon: "🎓", color: "bg-blue-100 text-blue-700" },
  { id: "cat_2", name: "Medio Ambiente", description: "Conservación y sostenibilidad", icon: "🌱", color: "bg-green-100 text-green-700" },
  { id: "cat_3", name: "Salud", description: "Bienestar y salud comunitaria", icon: "❤️", color: "bg-red-100 text-red-700" },
  { id: "cat_4", name: "Alimentación", description: "Programas de nutrición", icon: "🍽️", color: "bg-orange-100 text-orange-700" },
  { id: "cat_5", name: "Tecnología", description: "Capacitación digital", icon: "💻", color: "bg-purple-100 text-purple-700" },
  { id: "cat_6", name: "Deportes", description: "Actividades deportivas", icon: "🏆", color: "bg-yellow-100 text-yellow-700" },
  { id: "cat_7", name: "Arte y Cultura", description: "Expresión artística", icon: "🎨", color: "bg-pink-100 text-pink-700" },
  { id: "cat_8", name: "Construcción", description: "Proyectos comunitarios", icon: "🔨", color: "bg-gray-100 text-gray-700" },
]

// Función para asegurar que las categorías existan
async function ensureCategories() {
  try {
    for (const category of EVENT_CATEGORIES) {
      await sql`
        INSERT INTO event_categories (id, name, description, icon, color, active, "updatedAt")
        VALUES (${category.id}, ${category.name}, ${category.description}, ${category.icon}, ${category.color}, true, ${new Date()})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          color = EXCLUDED.color,
          active = EXCLUDED.active,
          "updatedAt" = ${new Date()}
      `
    }
  } catch (error) {
    console.error("Error ensuring categories:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/eventos - Starting ===")
    
    // Asegurar que las categorías existan
    console.log("Ensuring categories exist...")
    await ensureCategories()
    console.log("Categories ensured successfully")

    console.log("Getting current user...")
    const user = await getCurrentUser()
    console.log("Current user:", user)
    
    if (!user) {
      console.log("No user found - returning 401")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el usuario sea una organización
    if (user.role !== "ORGANIZATION") {
      console.log("User is not an organization - returning 403")
      return NextResponse.json({ error: "Solo las organizaciones pueden crear eventos" }, { status: 403 })
    }

    console.log("Parsing request body...")
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))
    
    const {
      title,
      description,
      categoryId,
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
      imageUrl
    } = body

    console.log("Extracted fields:", {
      title, description, categoryId, address, city, state, country, 
      startDate, endDate, maxVolunteers, skills, requirements, benefits, imageUrl
    })

    // Validaciones básicas
    if (!title || !description || !categoryId || !address || !city || !state || !startDate || !endDate) {
      console.log("Missing required fields - returning 400")
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    console.log("Getting user's organization...")
    // Obtener la organización del usuario
    const organizations = await sql`
      SELECT id FROM organizations WHERE "userId" = ${user.id}
    `
    console.log("Organizations found:", organizations)
    
    if (organizations.length === 0) {
      console.log("No organization found for user - returning 404")
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
    }

    const organizationId = organizations[0].id
    console.log("Organization ID:", organizationId)

    console.log("Creating event with data:", {
      title,
      description,
      organizationId,
      address,
      city,
      state,
      country: country || 'México',
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxVolunteers: maxVolunteers || 10,
      currentVolunteers: 0,
      skills: skills || [],
      categoryId,
      status: 'PUBLISHED',
      requirements: requirements || [],
      benefits: benefits || [],
      imageUrl: imageUrl || null
    })

    // Crear el evento
    const now = new Date()
    const eventId = `evt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
    const [newEvent] = await sql`
      INSERT INTO events (
        id,
        title,
        description,
        "organizationId",
        address,
        city,
        state,
        country,
        latitude,
        longitude,
        "startDate",
        "endDate",
        "maxVolunteers",
        "currentVolunteers",
        skills,
        "categoryId",
        status,
        requirements,
        benefits,
        "imageUrl",
        "updatedAt"
      ) VALUES (
        ${eventId},
        ${title},
        ${description},
        ${organizationId},
        ${address},
        ${city},
        ${state},
        ${country || 'México'},
        ${body.latitude || 0},
        ${body.longitude || 0},
        ${new Date(startDate)},
        ${new Date(endDate)},
        ${maxVolunteers || 10},
        0,
        ${skills || []},
        ${categoryId},
        'PUBLISHED',
        ${requirements || []},
        ${benefits || []},
        ${imageUrl || null},
        ${now}
      )
      RETURNING id, title, description, "organizationId", address, city, state, country, "startDate", "endDate", "maxVolunteers", "currentVolunteers", skills, "categoryId", status, requirements, benefits, "imageUrl", "createdAt", "updatedAt"
    `
    console.log("Event created successfully:", newEvent)

    console.log("Updating organization events counter...")
    // Actualizar contador de eventos creados en la organización
    await sql`
      UPDATE organizations 
      SET "eventsCreated" = "eventsCreated" + 1 
      WHERE id = ${organizationId}
    `
    console.log("Organization counter updated successfully")

    console.log("Returning success response")
    return NextResponse.json({
      success: true,
      id: newEvent.id,
      event: newEvent
    })

  } catch (error: unknown) {
    console.error("=== ERROR in POST /api/eventos ===")
    if (error instanceof Error) {
      console.error("Error type:", error.constructor.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
      console.error("Full error object:", error)
    } else {
      console.error("Non-Error thrown:", error)
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/eventos - Starting ===")
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const organizationId = searchParams.get("organizationId")
    const status = searchParams.get("status")
    const upcomingOnly = searchParams.get("upcomingOnly") === "true"
    const includeDrafts = searchParams.get("includeDrafts") === "1"
    
    console.log("Fetching events with limit:", limit, "organizationId:", organizationId, "status:", status, "upcomingOnly:", upcomingOnly)

    let events
    if (organizationId) {
      // Filtrar por organización específica
      events = await sql`
        SELECT 
          e.id,
          e.title,
          e.description,
          e.address,
          e.city,
          e.state,
          e.country,
          e."startDate",
          e."endDate",
          e."maxVolunteers",
          e."currentVolunteers",
          e.skills,
          e.requirements,
          e.benefits,
          e."imageUrl",
          e.status,
          e."createdAt",
          e."updatedAt",
          o.name as organization_name,
          o.verified as organization_verified,
          ec.name as category_name,
          ec.icon as category_icon,
          ec.color as category_color
        FROM events e
        JOIN organizations o ON e."organizationId" = o.id
        JOIN event_categories ec ON e."categoryId" = ec.id
        WHERE e."organizationId" = ${organizationId}
        ORDER BY e."createdAt" DESC
        LIMIT ${limit}
      `
    } else {
      // Construir la consulta base
      let whereClause = "WHERE 1=1"
      let params: any[] = []
      let paramIndex = 1
      
      // Filtrar por estado si se especifica
      if (status) {
        whereClause += ` AND e.status = $${paramIndex}`
        params.push(status)
        paramIndex++
      } else {
        // Por defecto, mostrar eventos públicos y en proceso
        whereClause += ` AND e.status IN ('PUBLISHED', 'ONGOING')`
      }
      
      // Filtrar solo eventos futuros si se solicita
      if (upcomingOnly) {
        whereClause += ` AND e."startDate" > NOW()`
      }
      
      // Incluir borradores si se solicita (solo para organizadores)
      if (includeDrafts) {
        whereClause += ` OR e.status = 'DRAFT'`
      }
      
      // Obtener eventos según los filtros
      events = await sql`
        SELECT 
          e.id,
          e.title,
          e.description,
          e.address,
          e.city,
          e.state,
          e.country,
          e."startDate",
          e."endDate",
          e."maxVolunteers",
          e."currentVolunteers",
          e.skills,
          e.requirements,
          e.benefits,
          e."imageUrl",
          e.status,
          e."createdAt",
          e."updatedAt",
          o.name as organization_name,
          o.verified as organization_verified,
          ec.name as category_name,
          ec.icon as category_icon,
          ec.color as category_color
        FROM events e
        JOIN organizations o ON e."organizationId" = o.id
        JOIN event_categories ec ON e."categoryId" = ec.id
        ${sql.unsafe(whereClause)}
        ORDER BY e."createdAt" DESC
        LIMIT ${limit}
      `
    }

    console.log("Events found:", Array.isArray(events) ? events.length : 'Not an array')
    console.log("Events data:", events)

    return NextResponse.json({ events })
  } catch (error: unknown) {
    console.error("Error fetching events:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 