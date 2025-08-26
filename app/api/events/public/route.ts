import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/events/public - Starting ===")
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get("limit") || "50")
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"
    const upcomingOnly = searchParams.get("upcomingOnly") === "true"
    const search = searchParams.get("search") || ""
    
    console.log("Public events params:", { limit, category, status, upcomingOnly, search })

    // Construir la consulta base
    let whereConditions = ["e.status IN ('PUBLISHED', 'ONGOING')"]
    let params: any[] = []
    let paramIndex = 1

    // Filtrar por categoría
    if (category && category !== "all") {
      whereConditions.push(`ec.name = $${paramIndex}`)
      params.push(category)
      paramIndex++
    }

    // Filtrar por estado específico
    if (status && status !== "all") {
      whereConditions.push(`e.status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    // Filtrar solo eventos futuros
    if (upcomingOnly) {
      whereConditions.push(`e."startDate" > NOW()`)
    }

    // Búsqueda por texto
    if (search) {
      whereConditions.push(`(e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.join(" AND ")

    console.log("Where clause:", whereClause)
    console.log("Params:", params)

    // Obtener eventos públicos
    const events = await sql`
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
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY 
        CASE 
          WHEN e.status = 'ONGOING' THEN 1
          WHEN e.status = 'PUBLISHED' THEN 2
          ELSE 3
        END,
        e."startDate" ASC
      LIMIT ${limit}
    `

    console.log("Public events found:", Array.isArray(events) ? events.length : 'Not an array')

    return NextResponse.json({ 
      events,
      total: events.length,
      filters: { category, status, upcomingOnly, search }
    })

  } catch (error: unknown) {
    console.error("Error fetching public events:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


