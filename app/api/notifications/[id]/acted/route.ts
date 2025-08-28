import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/auth/actions'
import { NotificationService } from '@/lib/services/NotificationService'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id

    // Obtener usuario autenticado
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener servicio de notificaciones
    const notificationService = NotificationService.getInstance()

    // Marcar como actuada
    await notificationService.markAsActed(notificationId)

    return NextResponse.json({
      success: true,
      message: 'Notificación marcada como actuada'
    })

  } catch (error) {
    console.error('Error marking notification as acted:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



