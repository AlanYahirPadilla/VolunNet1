import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Buscar el evento base para obtener su categoría y ciudad
    const events = await sql`SELECT "categoryId", city FROM events WHERE id = ${id} LIMIT 1`
    if (events.length === 0) {
      return NextResponse.json({ events: [] })
    }

    const base = events[0]

    const similar = await sql`
      SELECT id, title, city, state, "startDate", "imageUrl"
      FROM events 
      WHERE id != ${id}
        AND "categoryId" = ${base.categoryId}
      ORDER BY "createdAt" DESC
      LIMIT 6
    `

    return NextResponse.json({ events: similar })
  } catch (error: unknown) {
    return NextResponse.json({ events: [] })
  }
}

