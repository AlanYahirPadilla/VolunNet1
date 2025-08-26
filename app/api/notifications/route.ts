import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/auth/actions'
import { NotificationService } from '@/lib/services/NotificationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Obtener notificaciones del usuario
    const notifications = await notificationService.getUserNotifications(user.id, {
      status: status as any,
      category: category as any,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      notifications
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, category, subcategory, title, message, actionText, actionUrl, priority, expiresIn } = await request.json()

    // Obtener usuario autenticado
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo administradores pueden crear notificaciones para otros usuarios
    if (user.role !== 'ADMIN' && userId !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear notificaciones para otros usuarios' },
        { status: 403 }
      )
    }

    // Obtener servicio de notificaciones
    const notificationService = NotificationService.getInstance()

    // Crear notificación
    const notification = await notificationService.createNotification(userId, {
      category,
      subcategory,
      title,
      message,
      actionText,
      actionUrl,
      priority,
      expiresIn
    })

    return NextResponse.json({
      success: true,
      notification
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


