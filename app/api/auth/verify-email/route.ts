import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "@/app/auth/actions"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/auth/verify-email - Starting ===")

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { action, email, code } = await request.json()

    if (action === "send") {
      // Generar código de verificación (6 dígitos)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

      // Guardar código en la base de datos
      await sql`
        INSERT INTO email_verification_codes ("userId", email, code, "expiresAt")
        VALUES (${currentUser.id}, ${email}, ${verificationCode}, ${expiresAt.toISOString()})
        ON CONFLICT ("userId") 
        DO UPDATE SET 
          code = ${verificationCode},
          "expiresAt" = ${expiresAt.toISOString()},
          "createdAt" = NOW()
      `

      // Aquí iría la lógica para enviar el email
      // Por ahora simulamos el envío
      console.log(`Código de verificación para ${email}: ${verificationCode}`)

      return NextResponse.json({ 
        success: true, 
        message: "Código de verificación enviado" 
      })

    } else if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Código requerido" }, { status: 400 })
      }

      // Verificar código
      const verificationResult = await sql`
        SELECT * FROM email_verification_codes 
        WHERE "userId" = ${currentUser.id} 
        AND code = ${code}
        AND "expiresAt" > NOW()
        ORDER BY "createdAt" DESC
        LIMIT 1
      `

      if (verificationResult.length === 0) {
        return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 })
      }

      // Marcar email como verificado
      await sql`
        UPDATE users 
        SET email_verified = true, 
            email_verified_at = NOW()
        WHERE id = ${currentUser.id}
      `

      // Eliminar código usado
      await sql`
        DELETE FROM email_verification_codes 
        WHERE "userId" = ${currentUser.id}
      `

      return NextResponse.json({ 
        success: true, 
        message: "Email verificado correctamente" 
      })

    } else {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }

  } catch (error: unknown) {
    console.error("Error in email verification:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
