import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/app/auth/actions"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  console.log("=== GET /api/organizations/me - Starting ===")
  
  try {
    console.log("Getting current user...")
    const user = await getCurrentUser()
    console.log("Current user:", user)
    
    if (!user) {
      console.log("No user found - returning 401")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("Fetching organization for user ID:", user.id)
    // Obtener la organización del usuario
    const organizations = await sql`
      SELECT 
        id,
        name,
        description,
        "userId",
        verified,
        "eventsCreated",
        "createdAt",
        "updatedAt"
      FROM organizations 
      WHERE "userId" = ${user.id}
    `
    console.log("Organizations found:", organizations)

    if (organizations.length === 0) {
      console.log("No organization found - returning 404")
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
    }

    const organization = organizations[0]
    console.log("Returning organization:", organization)

    return NextResponse.json({
      success: true,
      organization
    })

  } catch (error) {
    console.error("=== ERROR in GET /api/organizations/me ===")
    console.error("Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 