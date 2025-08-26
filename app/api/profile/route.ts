import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/app/auth/actions"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET /api/profile - Starting ===")
    
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener información del usuario
    const [userProfile] = await sql`
      SELECT 
        u.id,
        u."firstName",
        u."lastName",
        u.email,
        u.role,
        u.avatar,
        u."createdAt",
        u."updatedAt"
      FROM users u
      WHERE u.id = ${user.id}
      LIMIT 1
    `

    if (!userProfile) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("User profile found:", userProfile.id)

    return NextResponse.json({ 
      user: userProfile,
      success: true 
    })

  } catch (error: unknown) {
    console.error("Error fetching user profile:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 