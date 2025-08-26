import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener perfil del voluntario usando el ID del usuario
    const volunteer = await prisma.volunteer.findUnique({
      where: { userId: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            emailVerified: true,
            phoneVerified: true,
            createdAt: true
          }
        }
      }
    })

    if (!volunteer) {
      return NextResponse.json({ error: "Voluntario no encontrado" }, { status: 404 })
    }

    // Obtener eventos en los que ha participado
    const participatedEvents = await prisma.eventApplication.findMany({
      where: {
        volunteerId: params.id, // Usar el ID del usuario directamente
        status: { in: ['ACCEPTED', 'COMPLETED'] }
      },
      include: {
        event: {
          include: {
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        event: {
          startDate: 'desc'
        }
      },
      take: 10
    })

    // Obtener estadísticas de participación
    const stats = await prisma.eventApplication.groupBy({
      by: ['status'],
      where: {
        volunteerId: params.id // Usar el ID del usuario directamente
      },
      _count: {
        status: true
      }
    })

    // Calcular estadísticas
    const totalApplications = stats.reduce((acc, stat) => acc + stat._count.status, 0)
    const acceptedApplications = stats.find(s => s.status === 'ACCEPTED')?._count.status || 0
    const rejectedApplications = stats.find(s => s.status === 'REJECTED')?._count.status || 0
    const completedEvents = stats.find(s => s.status === 'COMPLETED')?._count.status || 0

    // Transformar datos para la respuesta
    const profile = {
      id: volunteer.id,
      firstName: volunteer.user.firstName,
      lastName: volunteer.user.lastName,
      email: volunteer.user.email,
      bio: volunteer.bio,
      city: volunteer.city,
      state: volunteer.state,
      country: volunteer.country,
      rating: volunteer.rating,
      hoursCompleted: volunteer.hoursCompleted,
      eventsParticipated: volunteer.eventsParticipated,
      skills: volunteer.skills,
      interests: volunteer.interests,
      experience: volunteer.experience,
      languages: volunteer.languages,
      gender: volunteer.gender,
      birthDate: volunteer.birthDate,
      tagline: volunteer.tagline,
      verified: volunteer.verified,
      avatar: volunteer.user.avatar,
      participatedEvents: participatedEvents.map(app => ({
        id: app.event.id,
        title: app.event.title,
        startDate: app.event.startDate,
        endDate: app.event.endDate,
        status: app.status,
        rating: app.rating,
        feedback: app.feedback,
        organization_name: app.event.organization.name
      })),
      stats: {
        totalApplications,
        acceptedApplications,
        rejectedApplications,
        completedEvents,
        averageRating: volunteer.rating || 0
      }
    }

    return NextResponse.json({ profile })

  } catch (error: unknown) {
    console.error("Error fetching volunteer profile:", (error as Error).message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
