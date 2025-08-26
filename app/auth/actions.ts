"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

// Esquemas de validación actualizados
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").optional(),
    role: z.enum(["VOLUNTEER", "ORGANIZATION"]),
    // Campos opcionales para voluntarios
    interests: z.string().optional(),
    hoursPerWeek: z.string().optional(),
    timeSlots: z.string().optional(),
    // Campos opcionales para organizaciones
    focusAreas: z.string().optional(),
    organizationDescription: z.string().optional(),
    // Campos de ubicación
    city: z.string().optional(),
    state: z.string().optional(),
    maxDistance: z.string().optional(),
    transportation: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Función simple para crear un token de sesión
function createSessionToken(userId: string, email: string, role: string) {
  const payload = {
    userId,
    email,
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export async function loginAction(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Datos inválidos",
    }
  }

  const { email, password } = validatedFields.data

  try {
    // Buscar usuario en la base de datos
    const users = await sql`
      SELECT id, email, password, "firstName", "lastName", role, verified, active
      FROM users 
      WHERE email = ${email} AND active = true
    `

    if (users.length === 0) {
      return {
        success: false,
        message: "Credenciales inválidas",
      }
    }

    const user = users[0]

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return {
        success: false,
        message: "Credenciales inválidas",
      }
    }

    // Crear token de sesión simple
    const sessionToken = createSessionToken(user.id, user.email, user.role)

    // Establecer cookie
    cookies().set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    return {
      success: true,
      message: "Login exitoso",
    }
  } catch (error) {
    console.error("Error en login:", error)
    return {
      success: false,
      message: "Error interno del servidor",
    }
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  try {
    const formDataObj = Object.fromEntries(formData.entries())

    const validatedFields = registerSchema.safeParse(formDataObj)

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Datos inválidos",
      }
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      interests,
      hoursPerWeek,
      timeSlots,
      focusAreas,
      organizationDescription,
      city,
      state,
      maxDistance,
      transportation,
    } = validatedFields.data

    // Verificar si el email ya existe
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        success: false,
        message: "Este email ya está registrado",
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)
    const userId = generateId()
    const now = new Date();
    
    // Para organizaciones, usar firstName como lastName si no se proporciona
    const finalLastName = lastName || (role === "ORGANIZATION" ? firstName : "")
    
    // Crear usuario
    await sql`
      INSERT INTO users (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${hashedPassword}, ${firstName}, ${finalLastName}, ${role}, ${now}, ${now})
    `

    // Crear perfil específico según el rol
    if (role === "VOLUNTEER") {
      const volunteerId = generateId()

      // Parsear arrays JSON
      const parsedInterests = interests ? JSON.parse(interests) : []
      const parsedTimeSlots = timeSlots ? JSON.parse(timeSlots) : []

      // Solo guardar los campos que la UI pregunta actualmente
      await sql`
        INSERT INTO volunteers (
          id, "userId", skills, interests, city, state, "createdAt", "updatedAt"
        )
        VALUES (
          ${volunteerId}, ${userId}, ARRAY[]::text[], ${parsedInterests}, ${city || ""}, ${state || ""}, ${now}, ${now}
        )
      `
    } else if (role === "ORGANIZATION") {
      const organizationId = generateId()

      // Parsear arrays JSON
      const parsedFocusAreas = focusAreas ? JSON.parse(focusAreas) : []

      try {
        await sql`
          INSERT INTO organizations (
            id, "userId", name, description, "createdAt", "updatedAt"
          )
          VALUES (
            ${organizationId}, ${userId}, ${firstName}, 
            ${organizationDescription || "Nueva organización"}, ${now}, ${now}
          )
        `
        console.log("Organización creada exitosamente:", { organizationId, userId, firstName })
      } catch (orgError) {
        console.error("Error al crear organización:", orgError)
        throw new Error(`Error al crear organización: ${orgError}`)
      }
    }

    // Crear notificación de bienvenida
    const notificationId = generateId()
    await sql`
      INSERT INTO notifications (id, "userId", title, message, type, "createdAt", "updatedAt")
      VALUES (${notificationId}, ${userId}, 'Bienvenido a VolunNet', 'Tu cuenta ha sido creada exitosamente. ¡Comienza a explorar oportunidades de voluntariado!', 'SUCCESS', ${now}, ${now})
    `

    return {
      success: true,
      message:
        "¡Cuenta creada exitosamente! Ahora puedes iniciar sesión y comenzar a explorar oportunidades personalizadas para ti.",
    }
  } catch (error) {
    console.error("Error en registro:", error)
    return {
      success: false,
      message: "Error interno del servidor",
    }
  }
}

export async function logoutAction() {
  cookies().delete("session-token")
  // No usar redirect aquí para evitar problemas en el cliente
  return { success: true, message: "Logout successful" }
}

// Función para obtener el usuario actual
export async function getCurrentUser() {
  try {
    const sessionToken = cookies().get("session-token")?.value

    if (!sessionToken) {
      return null
    }

    // Decodificar el token simple
    const payload = JSON.parse(Buffer.from(sessionToken, "base64").toString())

    // Verificar si el token ha expirado
    if (Date.now() > payload.exp) {
      cookies().delete("session-token")
      return null
    }

    // Obtener datos actualizados del usuario
    const users = await sql`
      SELECT id, email, "firstName", "lastName", role, verified, active
      FROM users 
      WHERE id = ${payload.userId} AND active = true
    `

    if (users.length === 0) {
      cookies().delete("session-token")
      return null
    }

    const user = users[0]

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      verified: user.verified,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    cookies().delete("session-token")
    return null
  }
}
