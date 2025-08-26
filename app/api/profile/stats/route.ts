import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/app/auth/actions"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/profile/stats - Starting ===")
    
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let stats = {}

    if (user.role === "VOLUNTEER") {
      // Estadísticas para voluntarios
      const [volunteerStats] = await sql`
        SELECT 
          COALESCE("eventsParticipated", 0) as "eventsParticipated",
          COALESCE("hoursCompleted", 0) as "hoursCompleted",
          COALESCE(rating, 0) as rating
        FROM volunteers 
        WHERE "userId" = ${user.id}
      `

      // Contar aplicaciones
      const [applicationsCount] = await sql`
        SELECT COUNT(*) as "totalApplications"
        FROM event_applications ea
        WHERE ea."volunteerId" = ${user.id}
      `

      stats = {
        eventsParticipated: volunteerStats?.eventsParticipated || 0,
        hoursCompleted: volunteerStats?.hoursCompleted || 0,
        rating: volunteerStats?.rating || 0,
        totalApplications: applicationsCount?.totalApplications || 0
      }
    } else if (user.role === "ORGANIZATION") {
      // Estadísticas para organizaciones
      const [orgStats] = await sql`
        SELECT 
          COALESCE("eventsCreated", 0) as "eventsCreated"
        FROM organizations 
        WHERE "userId" = ${user.id}
      `

      // Contar eventos activos
      const [activeEventsCount] = await sql`
        SELECT COUNT(*) as "activeEvents"
        FROM events e
        JOIN organizations o ON e."organizationId" = o.id
        WHERE o."userId" = ${user.id} AND e.status = 'PUBLISHED'
      `

      // Calcular total de voluntarios desde las aplicaciones
      const [totalVolunteersCount] = await sql`
        SELECT COUNT(DISTINCT ea."volunteerId") as "totalVolunteers"
        FROM event_applications ea
        JOIN events e ON ea."eventId" = e.id
        JOIN organizations o ON e."organizationId" = o.id
        WHERE o."userId" = ${user.id} AND ea.status IN ('ACCEPTED', 'COMPLETED')
      `

      stats = {
        eventsCreated: orgStats?.eventsCreated || 0,
        totalVolunteers: totalVolunteersCount?.totalVolunteers || 0,
        activeEvents: activeEventsCount?.activeEvents || 0
      }
    }

    console.log("Profile stats retrieved for user:", user.id)

    return NextResponse.json({ 
      stats,
      success: true 
    })

  } catch (error: unknown) {
    console.error("Error fetching profile stats:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 