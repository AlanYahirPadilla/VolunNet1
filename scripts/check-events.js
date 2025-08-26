#!/usr/bin/env node

/**
 * Script simple para verificar eventos en la base de datos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkEvents() {
  try {
    console.log('🔍 Verificando eventos en la base de datos...')
    
    // Contar total de eventos
    const totalEvents = await prisma.event.count()
    console.log(`📊 Total de eventos: ${totalEvents}`)
    
    // Contar por estado
    const eventsByStatus = await prisma.event.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })
    
    console.log('\n📈 Eventos por estado:')
    eventsByStatus.forEach(item => {
      console.log(`  ${item.status}: ${item._count.status}`)
    })
    
    // Mostrar algunos eventos de ejemplo
    const sampleEvents = await prisma.event.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        organization: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('\n📋 Ejemplos de eventos:')
    sampleEvents.forEach(event => {
      const startDate = new Date(event.startDate).toLocaleDateString('es-ES')
      const endDate = new Date(event.endDate).toLocaleDateString('es-ES')
      console.log(`  - ${event.title} (${event.status})`)
      console.log(`    Organización: ${event.organization?.name || 'N/A'}`)
      console.log(`    Fechas: ${startDate} - ${endDate}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEvents()


