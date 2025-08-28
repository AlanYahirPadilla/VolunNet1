import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/eventos/simple - Starting ===")
    
    // Consulta simple sin JOINs para probar
    const events = await sql`
      SELECT 
        id,
        title,
        description,
        status,
        "createdAt"
      FROM events 
      WHERE status = 'PUBLISHED'
      ORDER BY "createdAt" DESC
      LIMIT 10
    `

    console.log("Simple events found:", Array.isArray(events) ? events.length : 'Not an array')
    console.log("Simple events data:", events)

    return NextResponse.json({ events })
  } catch (error: unknown) {
    console.error("Error fetching simple events:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}






