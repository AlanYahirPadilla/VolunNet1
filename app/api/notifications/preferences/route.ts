import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/auth/actions'
import { NotificationService } from '@/lib/services/NotificationService'

export async function GET(request: NextRequest) {
  try {
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

    // Obtener preferencias del usuario
    const preferences = await notificationService.getUserPreferences(user.id)

    return NextResponse.json({
      success: true,
      preferences
    })

  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const preferences = await request.json()

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

    // Actualizar preferencias
    await notificationService.updatePreferences(user.id, preferences)

    return NextResponse.json({
      success: true,
      message: 'Preferencias actualizadas correctamente'
    })

  } catch (error) {
    console.error('Error updating notification preferences:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



