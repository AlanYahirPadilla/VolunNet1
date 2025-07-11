import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Eliminar la cookie de sesión
    cookies().delete("session-token")

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Error in logout:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
