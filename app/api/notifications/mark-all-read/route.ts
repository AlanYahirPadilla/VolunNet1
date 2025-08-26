import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/auth/actions'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Marcar todas las notificaciones del usuario como leídas
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'SENT', 'DELIVERED'] }
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    })

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


