import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/events/buscar - Starting ===")
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const city = searchParams.get("city")
    const state = searchParams.get("state")
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "10")
    const upcomingOnly = searchParams.get("upcomingOnly") !== "0"
    
    console.log("Search params:", { query, city, state, category, limit, upcomingOnly })

    let whereConditions = []
    let queryParams: any[] = []
    let paramIndex = 1

    // Solo eventos publicados
    whereConditions.push(`e.status = 'PUBLISHED'`)

    // Solo eventos futuros si se especifica
    if (upcomingOnly) {
      whereConditions.push(`e."startDate" > NOW()`)
    }

    if (query) {
      whereConditions.push(`(
        e.title ILIKE $${paramIndex} OR 
        e.description ILIKE $${paramIndex} OR 
        o.name ILIKE $${paramIndex}
      )`)
      queryParams.push(`%${query}%`)
      paramIndex++
    }

    if (city) {
      whereConditions.push(`e.city ILIKE $${paramIndex}`)
      queryParams.push(`%${city}%`)
      paramIndex++
    }

    if (state) {
      whereConditions.push(`e.state ILIKE $${paramIndex}`)
      queryParams.push(`%${state}%`)
      paramIndex++
    }

    if (category) {
      whereConditions.push(`e."categoryId" = $${paramIndex}`)
      queryParams.push(category)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""
    
    console.log("Where clause:", whereClause)
    console.log("Query params:", queryParams)

    const events = await sql.query(`
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
      ${whereClause}
      ORDER BY e."createdAt" DESC
      LIMIT ${limit}
    `, queryParams)

    console.log("Events found:", Array.isArray(events) ? events.length : 'Not an array')

    return NextResponse.json({ events })

  } catch (error: unknown) {
    console.error("Error fetching events:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 