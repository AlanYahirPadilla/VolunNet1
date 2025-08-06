import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Expirar la cookie en el navegador
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    })
    response.cookies.set("session-token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    })
    return response
  } catch (error) {
    console.error("Error in logout:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
