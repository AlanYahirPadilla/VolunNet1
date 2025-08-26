"use server"

import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "../auth/actions"

const sql = neon(process.env.DATABASE_URL!)

interface SearchFilters {
  query?: string
  category?: string
  city?: string
  state?: string
  dateFrom?: string
  dateTo?: string
  skills?: string[]
  maxDistance?: number
  sortBy?: "relevance" | "date" | "distance" | "popularity"
  page?: number
  limit?: number
}

// Función para calcular distancia entre dos puntos
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

// Función para calcular similitud entre arrays
function calculateSimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1
  if (arr1.length === 0 || arr2.length === 0) return 0

  const intersection = arr1.filter((item) => arr2.includes(item))
  const union = [...new Set([...arr1, ...arr2])]

  return intersection.length / union.length
}

export async function searchEvents(filters: SearchFilters) {
  try {
    const user = await getCurrentUser()
    const {
      query,
      category,
      city,
      state,
      dateFrom,
      dateTo,
      skills,
      maxDistance,
      sortBy,
      page = 1,
      limit = 12,
    } = filters

    // Obtener perfil del usuario para personalización
    let userProfile = null
    if (user && user.role === "VOLUNTEER") {
      const volunteers = await sql`
        SELECT * FROM volunteers WHERE user_id = ${user.id}
      `
      userProfile = volunteers[0] || null
    }

    // Construir query base
    const whereConditions = [
      "e.status = 'PUBLISHED'",
      "e.start_date > NOW()",
      "e.current_volunteers < e.max_volunteers",
    ]
    const queryParams: any[] = []
    let paramIndex = 1

    // Filtro por texto de búsqueda
    if (query && query.trim()) {
      whereConditions.push(`(
        e.title ILIKE $${paramIndex} OR 
        e.description ILIKE $${paramIndex} OR 
        o.name ILIKE $${paramIndex} OR
        ec.name ILIKE $${paramIndex}
      )`)
      queryParams.push(`%${query.trim()}%`)
      paramIndex++
    }

    // Filtro por categoría
    if (category && category !== "all") {
      whereConditions.push(`e.category_id = $${paramIndex}`)
      queryParams.push(category)
      paramIndex++
    }

    // Filtro por ciudad
    if (city && city.trim()) {
      whereConditions.push(`e.city ILIKE $${paramIndex}`)
      queryParams.push(`%${city.trim()}%`)
      paramIndex++
    }

    // Filtro por estado
    if (state && state !== "all") {
      whereConditions.push(`e.state = $${paramIndex}`)
      queryParams.push(state)
      paramIndex++
    }

    // Filtro por fecha desde
    if (dateFrom) {
      whereConditions.push(`e.start_date >= $${paramIndex}`)
      queryParams.push(dateFrom)
      paramIndex++
    }

    // Filtro por fecha hasta
    if (dateTo) {
      whereConditions.push(`e.start_date <= $${paramIndex}`)
      queryParams.push(dateTo)
      paramIndex++
    }

    // Filtro por habilidades
    if (skills && skills.length > 0) {
      whereConditions.push(`e.skills && $${paramIndex}`)
      queryParams.push(skills)
      paramIndex++
    }

    const whereClause = whereConditions.join(" AND ")

    // Query principal
    const eventsQuery = `
      SELECT 
        e.*,
        ec.name as category_name,
        ec.icon as category_icon,
        ec.color as category_color,
        o.name as organization_name,
        o.verified as organization_verified,
        o.description as organization_description,
        COUNT(ea.id) as application_count
      FROM events e
      JOIN event_categories ec ON e.category_id = ec.id
      JOIN organizations o ON e.organization_id = o.id
      LEFT JOIN event_applications ea ON e.id = ea.event_id
      WHERE ${whereClause}
      GROUP BY e.id, ec.id, o.id
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, (page - 1) * limit)

    const events = await sql.unsafe(eventsQuery, queryParams)

    // Calcular puntuaciones de recomendación si hay usuario logueado
    const eventsWithScores = events.map((event) => {
      let recommendationScore = 0
      const recommendationReasons: string[] = []
      let distance: number | null = null

      if (userProfile) {
        // Similitud de intereses
        const interestSimilarity = calculateSimilarity(userProfile.preferred_categories || [], [event.category_id])
        recommendationScore += interestSimilarity * 0.4
        if (interestSimilarity > 0) {
          recommendationReasons.push(`Coincide con tus intereses`)
        }

        // Similitud de habilidades
        const skillSimilarity = calculateSimilarity(userProfile.skills || [], event.skills || [])
        recommendationScore += skillSimilarity * 0.3
        if (skillSimilarity > 0) {
          recommendationReasons.push(`Requiere tus habilidades`)
        }

        // Proximidad geográfica
        if (userProfile.latitude && userProfile.longitude && event.latitude && event.longitude) {
          distance = calculateDistance(userProfile.latitude, userProfile.longitude, event.latitude, event.longitude)
          const userMaxDistance = maxDistance || userProfile.max_distance_km || 50
          if (distance <= userMaxDistance) {
            const proximityScore = 1 - distance / userMaxDistance
            recommendationScore += proximityScore * 0.2
            recommendationReasons.push(`A ${Math.round(distance)} km de ti`)
          }
        } else if (userProfile.city === event.city) {
          recommendationScore += 0.2
          recommendationReasons.push(`En tu ciudad`)
        }

        // Disponibilidad de tiempo
        const eventDate = new Date(event.start_date)
        const eventDay = eventDate.getDay()
        const eventHour = eventDate.getHours()

        if (userProfile.preferred_time_slots) {
          let timeMatch = false
          if (userProfile.preferred_time_slots.includes("morning") && eventHour >= 6 && eventHour < 12) timeMatch = true
          if (userProfile.preferred_time_slots.includes("afternoon") && eventHour >= 12 && eventHour < 18)
            timeMatch = true
          if (userProfile.preferred_time_slots.includes("evening") && eventHour >= 18 && eventHour < 22)
            timeMatch = true
          if (userProfile.preferred_time_slots.includes("weekend") && (eventDay === 0 || eventDay === 6))
            timeMatch = true

          if (timeMatch) {
            recommendationScore += 0.1
            recommendationReasons.push(`En tu horario preferido`)
          }
        }
      }

      return {
        ...event,
        recommendation_score: recommendationScore,
        recommendation_reasons: recommendationReasons,
        distance,
        popularity_score: event.application_count / Math.max(event.max_volunteers, 1),
      }
    })

    // Aplicar ordenamiento
    const sortedEvents = [...eventsWithScores]
    switch (sortBy) {
      case "relevance":
        sortedEvents.sort((a, b) => b.recommendation_score - a.recommendation_score)
        break
      case "date":
        sortedEvents.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        break
      case "distance":
        if (userProfile) {
          sortedEvents.sort((a, b) => {
            if (a.distance === null && b.distance === null) return 0
            if (a.distance === null) return 1
            if (b.distance === null) return -1
            return a.distance - b.distance
          })
        }
        break
      case "popularity":
        sortedEvents.sort((a, b) => b.popularity_score - a.popularity_score)
        break
    }

    // Obtener total de resultados para paginación
    const countQuery = `
      SELECT COUNT(DISTINCT e.id) as total
      FROM events e
      JOIN event_categories ec ON e.category_id = ec.id
      JOIN organizations o ON e.organization_id = o.id
      WHERE ${whereClause}
    `

    const countResult = await sql.unsafe(countQuery, queryParams.slice(0, -2))
    const total = Number.parseInt(countResult[0]?.total || "0")

    return {
      events: sortedEvents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }
  } catch (error) {
    console.error("Error searching events:", error)
    return {
      events: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false,
      error: "Error al buscar eventos",
    }
  }
}

export async function getEventCategories() {
  try {
    const categories = await sql`
      SELECT * FROM event_categories 
      WHERE active = true 
      ORDER BY name ASC
    `
    return { categories }
  } catch (error) {
    console.error("Error getting categories:", error)
    return { categories: [] }
  }
}

export async function getPopularSearches() {
  try {
    // Obtener búsquedas populares basadas en eventos con más aplicaciones
    const popularEvents = await sql`
      SELECT 
        e.title,
        ec.name as category_name,
        COUNT(ea.id) as application_count
      FROM events e
      JOIN event_categories ec ON e.category_id = ec.id
      LEFT JOIN event_applications ea ON e.id = ea.event_id
      WHERE e.status = 'PUBLISHED' 
      AND e.start_date > NOW()
      GROUP BY e.id, e.title, ec.name
      ORDER BY application_count DESC
      LIMIT 8
    `

    const popularCategories = await sql`
      SELECT 
        ec.name,
        ec.icon,
        COUNT(e.id) as event_count
      FROM event_categories ec
      JOIN events e ON ec.id = e.category_id
      WHERE e.status = 'PUBLISHED' 
      AND e.start_date > NOW()
      GROUP BY ec.id, ec.name, ec.icon
      ORDER BY event_count DESC
      LIMIT 6
    `

    return {
      popularEvents: popularEvents.map((e) => e.title),
      popularCategories,
    }
  } catch (error) {
    console.error("Error getting popular searches:", error)
    return {
      popularEvents: [],
      popularCategories: [],
    }
  }
}

export async function getSuggestedFilters() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VOLUNTEER") {
      return { suggestions: [] }
    }

    const volunteer = await sql`
      SELECT * FROM volunteers WHERE user_id = ${user.id}
    `

    if (volunteer.length === 0) {
      return { suggestions: [] }
    }

    const userProfile = volunteer[0]
    const suggestions = []

    // Sugerir categorías basadas en intereses
    if (userProfile.preferred_categories && userProfile.preferred_categories.length > 0) {
      const categories = await sql`
        SELECT * FROM event_categories 
        WHERE id = ANY(${userProfile.preferred_categories})
      `
      suggestions.push({
        type: "category",
        label: "Tus intereses",
        items: categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
      })
    }

    // Sugerir ubicación
    if (userProfile.city) {
      suggestions.push({
        type: "location",
        label: "En tu área",
        items: [{ city: userProfile.city, state: userProfile.state }],
      })
    }

    // Sugerir horarios
    if (userProfile.preferred_time_slots && userProfile.preferred_time_slots.length > 0) {
      suggestions.push({
        type: "time",
        label: "En tus horarios preferidos",
        items: userProfile.preferred_time_slots,
      })
    }

    return { suggestions }
  } catch (error) {
    console.error("Error getting suggested filters:", error)
    return { suggestions: [] }
  }
}
