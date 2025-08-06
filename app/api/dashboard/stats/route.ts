import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now
    const stats = {
      totalEvents: 1250,
      activeVolunteers: 850,
      completedHours: 15000,
      organizations: 45
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}