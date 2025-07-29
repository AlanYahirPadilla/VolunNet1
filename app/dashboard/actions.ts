"use server"

import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "../auth/actions"

const sql = neon(process.env.DATABASE_URL!)

// Cache simple en memoria para datos que no cambian frecuentemente
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCachedData(key: string, data: any, ttlMinutes = 5) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000,
  })
}

// Función para calcular similitud entre arrays
function calculateSimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1
  if (arr1.length === 0 || arr2.length === 0) return 0

  const intersection = arr1.filter((item) => arr2.includes(item))
  const union = [...new Set([...arr1, ...arr2])]

  return intersection.length / union.length
}

// Función para calcular distancia entre dos puntos (aproximada)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function getPersonalizedRecommendations() {
  try {
    console.log("🔄 Iniciando carga de recomendaciones personalizadas...")

    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ Usuario no autenticado")
      return { recommendations: [], error: "Usuario no autenticado" }
    }

    console.log(`✅ Usuario autenticado: ${user.email} (${user.role})`)

    // Verificar cache primero
    const cacheKey = `recommendations_${user.id}`
    const cachedRecommendations = getCachedData(cacheKey)
    if (cachedRecommendations) {
      console.log("📦 Usando recomendaciones desde cache")
      return cachedRecommendations
    }

    if (user.role === "VOLUNTEER") {
      // Obtener perfil del voluntario con timeout
      console.log("🔍 Obteniendo perfil del voluntario...")
      const volunteers = (await Promise.race([
        sql`SELECT * FROM volunteers WHERE "userId" = ${user.id}`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
      ])) as any[]

      if (volunteers.length === 0) {
        console.log("⚠️ Perfil de voluntario no encontrado")
        return { recommendations: [], error: "Perfil de voluntario no encontrado" }
      }

      const volunteer = volunteers[0]
      console.log(`✅ Perfil encontrado: ${volunteer.first_name || "Sin nombre"}`)

      // Obtener eventos disponibles con query optimizada
      console.log("🔍 Obteniendo eventos disponibles...")
      const events = (await Promise.race([
        sql`
          SELECT e.*, ec.name as category_name, ec.icon as category_icon,
                 o.name as organization_name, o.verified as organization_verified
          FROM events e
          JOIN event_categories ec ON e.categoryId = ec.id
          JOIN organizations o ON e.organization_id = o.id
          WHERE e.status = 'PUBLISHED' 
          AND e.start_date > NOW()
          AND e.current_volunteers < e.max_volunteers
          ORDER BY e.created_at DESC
          LIMIT 20
        `,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
      ])) as any[]

      console.log(`✅ ${events.length} eventos encontrados`)

      // Calcular puntuaciones de recomendación de forma optimizada
      const recommendations = events.map((event) => {
        let score = 0
        const reasons = []

        // Similitud de intereses (peso: 40%)
        const interestSimilarity = calculateSimilarity(volunteer.preferred_categories || [], [event.categoryId])
        score += interestSimilarity * 0.4
        if (interestSimilarity > 0) {
          reasons.push(`Coincide con tus intereses en ${event.category_name}`)
        }

        // Similitud de habilidades (peso: 30%)
        const skillSimilarity = calculateSimilarity(volunteer.skills || [], event.skills || [])
        score += skillSimilarity * 0.3
        if (skillSimilarity > 0) {
          reasons.push(`Requiere habilidades que tienes`)
        }

        // Proximidad geográfica (peso: 20%)
        if (volunteer.latitude && volunteer.longitude && event.latitude && event.longitude) {
          const distance = calculateDistance(volunteer.latitude, volunteer.longitude, event.latitude, event.longitude)
          const maxDistance = volunteer.max_distance_km || 10
          if (distance <= maxDistance) {
            const proximityScore = 1 - distance / maxDistance
            score += proximityScore * 0.2
            reasons.push(`Está a ${Math.round(distance)} km de ti`)
          }
        } else if (volunteer.city === event.city) {
          score += 0.2
          reasons.push(`En tu ciudad: ${event.city}`)
        }

        // Disponibilidad de tiempo (peso: 10%)
        const eventDate = new Date(event.start_date)
        const eventDay = eventDate.getDay()
        const eventHour = eventDate.getHours()

        let timeMatch = false
        if (volunteer.preferred_time_slots) {
          if (volunteer.preferred_time_slots.includes("morning") && eventHour >= 6 && eventHour < 12) timeMatch = true
          if (volunteer.preferred_time_slots.includes("afternoon") && eventHour >= 12 && eventHour < 18)
            timeMatch = true
          if (volunteer.preferred_time_slots.includes("evening") && eventHour >= 18 && eventHour < 22) timeMatch = true
          if (volunteer.preferred_time_slots.includes("weekend") && (eventDay === 0 || eventDay === 6)) timeMatch = true
        }

        if (timeMatch) {
          score += 0.1
          reasons.push(`En tu horario preferido`)
        }

        return {
          ...event,
          recommendation_score: score,
          recommendation_reasons: reasons,
          distance:
            volunteer.latitude && volunteer.longitude && event.latitude && event.longitude
              ? calculateDistance(volunteer.latitude, volunteer.longitude, event.latitude, event.longitude)
              : null,
        }
      })

      // Ordenar por puntuación y tomar los top 6
      const topRecommendations = recommendations
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, 6)

      console.log(`✅ ${topRecommendations.length} recomendaciones generadas`)

      // Guardar en cache por 5 minutos
      const result = { recommendations: topRecommendations }
      setCachedData(cacheKey, result, 5)

      return result
    } else if (user.role === "ORGANIZATION") {
      // Para organizaciones, mostrar eventos similares o voluntarios potenciales
      console.log("🔍 Obteniendo datos de organización...")
      const organizations = (await Promise.race([
        sql`SELECT * FROM organizations WHERE "userId" = ${user.id}`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
      ])) as any[]

      if (organizations.length === 0) {
        console.log("⚠️ Perfil de organización no encontrado")
        return { recommendations: [], error: "Perfil de organización no encontrado" }
      }

      const organization = organizations[0]
      console.log(`✅ Organización encontrada: ${organization.name}`)

      // Obtener voluntarios que podrían estar interesados
      const volunteers = (await Promise.race([
        sql`
          SELECT v.*, u.first_name, u.last_name, u.email
          FROM volunteers v
          JOIN users u ON v.userId = u.id
          WHERE u.active = true
          AND v.onboarding_completed = true
          LIMIT 20
        `,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
      ])) as any[]

      console.log(`✅ ${volunteers.length} voluntarios encontrados`)

      const recommendations = volunteers.map((volunteer) => {
        let score = 0
        const reasons = []

        // Similitud de áreas de enfoque
        const focusSimilarity = calculateSimilarity(
          organization.focus_areas || [],
          volunteer.preferred_categories || [],
        )
        score += focusSimilarity * 0.5
        if (focusSimilarity > 0) {
          reasons.push(`Interesado en las mismas áreas que tu organización`)
        }

        // Proximidad geográfica
        if (organization.city === volunteer.city) {
          score += 0.3
          reasons.push(`Vive en ${volunteer.city}`)
        }

        // Experiencia (horas completadas)
        if (volunteer.hours_completed > 0) {
          score += Math.min(volunteer.hours_completed / 100, 0.2)
          reasons.push(`${volunteer.hours_completed} horas de experiencia`)
        }

        return {
          ...volunteer,
          recommendation_score: score,
          recommendation_reasons: reasons,
        }
      })

      const topRecommendations = recommendations
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, 6)

      console.log(`✅ ${topRecommendations.length} recomendaciones de voluntarios generadas`)

      // Guardar en cache por 10 minutos (datos menos volátiles)
      const result = { recommendations: topRecommendations }
      setCachedData(cacheKey, result, 10)

      return result
    }

    console.log("⚠️ Rol de usuario no reconocido")
    return { recommendations: [] }
  } catch (error) {
    console.error("❌ Error getting recommendations:", error)

    // En caso de error, intentar devolver datos básicos
    try {
      const basicEvents = await sql`
        SELECT e.*, ec.name as category_name, ec.icon as category_icon,
               o.name as organization_name, o.verified as organization_verified
        FROM events e
        JOIN event_categories ec ON e."categoryId" = ec.id
        JOIN organizations o ON e."organizationId" = o.id
        WHERE e.status = 'PUBLISHED' 
        AND e."startDate" > NOW()
        AND e."currentVolunteers" < e."maxVolunteers"
        ORDER BY e."createdAt" DESC
        LIMIT 6
      `

      console.log(`🔄 Fallback: ${basicEvents.length} eventos básicos obtenidos`)
      return { recommendations: basicEvents }
    } catch (fallbackError) {
      console.error("❌ Error en fallback:", fallbackError)
      return { recommendations: [], error: "Error al obtener recomendaciones" }
    }
  }
}

export async function getUserStats() {
  try {
    console.log("🔄 Iniciando carga de estadísticas de usuario...")

    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ Usuario no autenticado para estadísticas")
      return { stats: null, error: "Usuario no autenticado" }
    }

    console.log(`✅ Cargando estadísticas para: ${user.email}`)

    // Verificar cache primero
    const cacheKey = `stats_${user.id}`
    const cachedStats = getCachedData(cacheKey)
    if (cachedStats) {
      console.log("📦 Usando estadísticas desde cache")
      return cachedStats
    }

    if (user.role === "VOLUNTEER") {
      const volunteers = (await Promise.race([
        sql`SELECT * FROM volunteers WHERE "userId" = ${user.id}`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
      ])) as any[]

      if (volunteers.length === 0) {
        console.log("⚠️ Perfil de voluntario no encontrado para estadísticas")
        // Devolver estadísticas por defecto
        const defaultStats = {
          totalApplications: 0,
          acceptedApplications: 0,
          completedApplications: 0,
          totalHours: 0,
          averageRating: 0,
          eventsParticipated: 0,
          hoursCompleted: 0,
          topCategories: [],
          recentEvents: [],
          successRate: 0,
        }
        return { stats: defaultStats }
      }

      const volunteer = volunteers[0]
      console.log(`✅ Perfil de voluntario encontrado`)

      // Obtener estadísticas de aplicaciones de forma optimizada
      const [applications, completedEvents, categoryStats] = await Promise.all([
        Promise.race([
          sql`
            SELECT status, COUNT(*) as count
            FROM event_applications 
            WHERE volunteer_id = ${user.id}
            GROUP BY status
          `,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
        ]).catch(() => []),

        Promise.race([
          sql`
            SELECT ea.rating, ea.completed_at, e.title, e.start_date, e.end_date
            FROM event_applications ea
            JOIN events e ON ea.event_id = e.id
            WHERE ea.volunteer_id = ${user.id} 
            AND ea.status = 'COMPLETED'
            ORDER BY ea.completed_at DESC
            LIMIT 5
          `,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
        ]).catch(() => []),

        Promise.race([
          sql`
            SELECT ec.name, ec.icon, COUNT(*) as count
            FROM event_applications ea
            JOIN events e ON ea.event_id = e.id
            JOIN event_categories ec ON e.categoryId = ec.id
            WHERE ea.volunteer_id = ${user.id}
            AND ea.status IN ('ACCEPTED', 'COMPLETED')
            GROUP BY ec.id, ec.name, ec.icon
            ORDER BY count DESC
            LIMIT 3
          `,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
        ]).catch(() => []),
      ])

      console.log(
        `✅ Estadísticas obtenidas: ${applications.length} aplicaciones, ${completedEvents.length} eventos completados`,
      )

      // Calcular estadísticas
      const totalApplications = Array.isArray(applications)
        ? applications.reduce((sum, app) => sum + Number.parseInt(app.count), 0)
        : 0
      const acceptedApplications = Array.isArray(applications)
        ? applications.find((app) => app.status === "ACCEPTED")?.count || 0
        : 0
      const completedApplications = Array.isArray(applications)
        ? applications.find((app) => app.status === "COMPLETED")?.count || 0
        : 0

      const averageRating =
        Array.isArray(completedEvents) && completedEvents.length > 0
          ? completedEvents.reduce((sum, event) => sum + (event.rating || 0), 0) / completedEvents.length
          : 0

      // Calcular horas totales (estimación basada en eventos completados)
      const totalHours = Array.isArray(completedEvents)
        ? completedEvents.reduce((sum, event) => {
            const start = new Date(event.start_date)
            const end = new Date(event.end_date)
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            return sum + Math.max(hours, 0)
          }, 0)
        : 0

      const stats = {
        totalApplications,
        acceptedApplications,
        completedApplications,
        totalHours: Math.round(totalHours),
        averageRating: Math.round(averageRating * 10) / 10,
        eventsParticipated: volunteer.events_participated || 0,
        hoursCompleted: volunteer.hours_completed || 0,
        topCategories: Array.isArray(categoryStats) ? categoryStats : [],
        recentEvents: Array.isArray(completedEvents) ? completedEvents : [],
        successRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0,
      }

      console.log(`✅ Estadísticas calculadas: ${stats.totalApplications} aplicaciones, ${stats.totalHours} horas`)

      // Guardar en cache por 3 minutos
      const result = { stats }
      setCachedData(cacheKey, result, 3)

      return result
    } else if (user.role === "ORGANIZATION") {
      const organizations = (await Promise.race([
        sql`SELECT * FROM organizations WHERE "userId" = ${user.id}`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
      ])) as any[]

      if (organizations.length === 0) {
        console.log("⚠️ Perfil de organización no encontrado para estadísticas")
        const defaultStats = {
          totalEvents: 0,
          publishedEvents: 0,
          completedEvents: 0,
          totalVolunteers: 0,
          averageFillRate: 0,
          eventsCreated: 0,
          volunteersHelped: 0,
          recentApplications: [],
          popularEvents: [],
          verified: false,
        }
        return { stats: defaultStats }
      }

      const organization = organizations[0]
      console.log(`✅ Organización encontrada: ${organization.name}`)

      // Obtener estadísticas de eventos de forma optimizada
      const [eventStats, recentApplications, popularEvents] = await Promise.all([
        Promise.race([
          sql`
            SELECT 
              COUNT(*) as total_events,
              COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published_events,
              COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_events,
              COALESCE(SUM(current_volunteers), 0) as total_volunteers,
              COALESCE(AVG(current_volunteers::float / NULLIF(max_volunteers::float, 0)), 0) as avg_fill_rate
            FROM events 
            WHERE organization_id = ${organization.id}
          `,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
        ]).catch(() => [
          { total_events: 0, published_events: 0, completed_events: 0, total_volunteers: 0, avg_fill_rate: 0 },
        ]),

        Promise.race([
          sql`
            SELECT ea.*, u.first_name, u.last_name, e.title as event_title
            FROM event_applications ea
            JOIN users u ON ea.volunteer_id = u.id
            JOIN events e ON ea.event_id = e.id
            WHERE e.organization_id = ${organization.id}
            ORDER BY ea.applied_at DESC
            LIMIT 10
          `,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
        ]).catch(() => []),

        Promise.race([
          sql`
            SELECT e.title, e.current_volunteers, e.max_volunteers, 
                   (e.current_volunteers::float / NULLIF(e.max_volunteers::float, 0)) as fill_rate
            FROM events e
            WHERE e.organization_id = ${organization.id}
            AND e.current_volunteers > 0
            ORDER BY fill_rate DESC
            LIMIT 5
          `,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
        ]).catch(() => []),
      ])

      const stats =
        Array.isArray(eventStats) && eventStats.length > 0
          ? eventStats[0]
          : {
              total_events: 0,
              published_events: 0,
              completed_events: 0,
              total_volunteers: 0,
              avg_fill_rate: 0,
            }

      const organizationStats = {
        totalEvents: Number.parseInt(stats.total_events) || 0,
        publishedEvents: Number.parseInt(stats.published_events) || 0,
        completedEvents: Number.parseInt(stats.completed_events) || 0,
        totalVolunteers: Number.parseInt(stats.total_volunteers) || 0,
        averageFillRate: Math.round((Number.parseFloat(stats.avg_fill_rate) || 0) * 100),
        eventsCreated: organization.events_created || 0,
        volunteersHelped: organization.volunteers_helped || 0,
        recentApplications: Array.isArray(recentApplications) ? recentApplications : [],
        popularEvents: Array.isArray(popularEvents) ? popularEvents : [],
        verified: organization.verified || false,
      }

      console.log(`✅ Estadísticas de organización calculadas: ${organizationStats.totalEvents} eventos`)

      // Guardar en cache por 5 minutos
      const result = { stats: organizationStats }
      setCachedData(cacheKey, result, 5)

      return result
    }

    console.log("⚠️ Rol de usuario no reconocido para estadísticas")
    return { stats: null }
  } catch (error) {
    console.error("❌ Error getting user stats:", error)

    // Devolver estadísticas por defecto en caso de error
    const defaultStats = {
      totalApplications: 0,
      acceptedApplications: 0,
      completedApplications: 0,
      totalHours: 0,
      averageRating: 0,
      eventsParticipated: 0,
      hoursCompleted: 0,
      topCategories: [],
      recentEvents: [],
      successRate: 0,
    }

    return { stats: defaultStats }
  }
}

export async function getRecentNotifications() {
  try {
    console.log("🔄 Iniciando carga de notificaciones...")

    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ Usuario no autenticado para notificaciones")
      return { notifications: [] }
    }

    console.log(`✅ Cargando notificaciones para: ${user.email}`)

    // Verificar cache primero
    const cacheKey = `notifications_${user.id}`
    const cachedNotifications = getCachedData(cacheKey)
    if (cachedNotifications) {
      console.log("📦 Usando notificaciones desde cache")
      return cachedNotifications
    }

    const notifications = (await Promise.race([
      sql`
        SELECT * FROM notifications 
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 10
      `,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
    ]).catch(() => [])) as any[]

    console.log(`✅ ${notifications.length} notificaciones obtenidas`)

    // Guardar en cache por 2 minutos (datos más volátiles)
    const result = { notifications: Array.isArray(notifications) ? notifications : [] }
    setCachedData(cacheKey, result, 2)

    return result
  } catch (error) {
    console.error("❌ Error getting notifications:", error)
    return { notifications: [] }
  }
}

// Función para limpiar cache expirado (se puede llamar periódicamente)
export async function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp >= value.ttl) {
      cache.delete(key)
    }
  }
  console.log(`🧹 Cache limpiado. Entradas restantes: ${cache.size}`)
}

// Función para invalidar cache específico
export async function invalidateCache(pattern: string) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
  console.log(`🗑️ Cache invalidado para patrón: ${pattern}`)
}
