import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now
    const events = [
      {
        id: '1',
        title: 'Limpieza de parques',
        date: '2024-01-15',
        organization: 'EcoVida',
        status: 'upcoming'
      },
      {
        id: '2',
        title: 'Recolección de alimentos',
        date: '2024-01-20',
        organization: 'Banco de Alimentos',
        status: 'upcoming'
      }
    ]
    
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}