import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now
    const notifications = [
      {
        id: '1',
        title: 'Nuevo evento disponible',
        message: 'Se ha publicado un nuevo evento de voluntariado cerca de ti',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Recordatorio',
        message: 'Tienes un evento programado para mañana',
        type: 'reminder',
        read: false,
        createdAt: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}