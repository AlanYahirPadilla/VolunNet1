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
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
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
      SELECT id, email, password, first_name, last_name, role, verified, active
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

    // Crear usuario
    await sql`
      INSERT INTO users (id, email, password, first_name, last_name, role)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${firstName}, ${lastName}, ${role})
    `

    // Crear perfil específico según el rol
    if (role === "VOLUNTEER") {
      const volunteerId = generateId()

      // Parsear arrays JSON
      const parsedInterests = interests ? JSON.parse(interests) : []
      const parsedTimeSlots = timeSlots ? JSON.parse(timeSlots) : []

      await sql`
        INSERT INTO volunteers (
          id, user_id, preferred_categories, available_hours_per_week, 
          preferred_time_slots, city, state, max_distance_km, 
          transportation, onboarding_completed
        )
        VALUES (
          ${volunteerId}, ${userId}, ${parsedInterests}, 
          ${hoursPerWeek ? Number.parseInt(hoursPerWeek.split("-")[0]) : 0},
          ${parsedTimeSlots}, ${city || ""}, ${state || ""}, 
          ${maxDistance ? Number.parseInt(maxDistance) : 10}, 
          ${transportation || ""}, true
        )
      `
    } else if (role === "ORGANIZATION") {
      const organizationId = generateId()

      // Parsear arrays JSON
      const parsedFocusAreas = focusAreas ? JSON.parse(focusAreas) : []

      await sql`
        INSERT INTO organizations (
          id, user_id, name, description, focus_areas, 
          city, state, onboarding_completed
        )
        VALUES (
          ${organizationId}, ${userId}, ${firstName + " " + lastName}, 
          ${organizationDescription || "Nueva organización"}, ${parsedFocusAreas},
          ${city || ""}, ${state || ""}, true
        )
      `
    }

    // Crear notificación de bienvenida
    const notificationId = generateId()
    await sql`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (${notificationId}, ${userId}, 'Bienvenido a VolunNet', 'Tu cuenta ha sido creada exitosamente. ¡Comienza a explorar oportunidades de voluntariado!', 'SUCCESS')
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
      SELECT id, email, first_name, last_name, role, verified, active
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
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      verified: user.verified,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    cookies().delete("session-token")
    return null
  }
}
