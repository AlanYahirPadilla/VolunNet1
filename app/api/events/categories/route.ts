import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/events/categories - Starting ===")

    // Obtener todas las categorías de eventos
    const categories = await sql`
      SELECT 
        id,
        name,
        icon,
        color,
        description
      FROM event_categories
      ORDER BY name ASC
    `

    console.log("Categories found:", categories.length)

    return NextResponse.json({ categories })

  } catch (error: unknown) {
    console.error("Error fetching categories:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}





