#!/usr/bin/env node

/**
 * Script para actualizar automáticamente los estados de los eventos
 * Se puede ejecutar manualmente o como cron job
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateEventStatuses() {
  try {
    console.log('🔄 Iniciando actualización de estados de eventos...')
    
    const now = new Date()
    console.log(`⏰ Hora actual: ${now.toISOString()}`)
    
    // Eventos que deben cambiar a ONGOING (fecha de inicio alcanzada)
    const eventsToStart = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        startDate: {
          lte: now
        }
      },
      select: {
        id: true,
        title: true,
        startDate: true
      }
    })

    console.log(`📅 Eventos para iniciar: ${eventsToStart.length}`)
    
    for (const event of eventsToStart) {
      await prisma.event.update({
        where: { id: event.id },
        data: { 
          status: 'ONGOING',
          updatedAt: now
        }
      })
      console.log(`✅ Evento "${event.title}" cambiado a ONGOING`)
    }

    // Eventos que deben cambiar a COMPLETED (fecha de fin alcanzada)
    const eventsToComplete = await prisma.event.findMany({
      where: {
        status: 'ONGOING',
        endDate: {
          lte: now
        }
      },
      select: {
        id: true,
        title: true,
        endDate: true
      }
    })

    console.log(`🏁 Eventos para completar: ${eventsToComplete.length}`)
    
    for (const event of eventsToComplete) {
      await prisma.event.update({
        where: { id: event.id },
        data: { 
          status: 'COMPLETED',
          updatedAt: now
        }
      })
      console.log(`✅ Evento "${event.title}" cambiado a COMPLETED`)
    }

    // Eventos que deben cambiar a ARCHIVED (completados hace más de 30 días)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const eventsToArchive = await prisma.event.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          lte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        title: true,
        updatedAt: true
      }
    })

    console.log(`📦 Eventos para archivar: ${eventsToArchive.length}`)
    
    for (const event of eventsToArchive) {
      await prisma.event.update({
        where: { id: event.id },
        data: { 
          status: 'ARCHIVED',
          updatedAt: now
        }
      })
      console.log(`✅ Evento "${event.title}" cambiado a ARCHIVED`)
    }

    // Mostrar resumen de cambios
    const summary = {
      started: eventsToStart.length,
      completed: eventsToComplete.length,
      archived: eventsToArchive.length,
      total: eventsToStart.length + eventsToComplete.length + eventsToArchive.length
    }

    console.log('\n📊 Resumen de cambios:')
    console.log(`   • Eventos iniciados: ${summary.started}`)
    console.log(`   • Eventos completados: ${summary.completed}`)
    console.log(`   • Eventos archivados: ${summary.archived}`)
    console.log(`   • Total de cambios: ${summary.total}`)

    if (summary.total === 0) {
      console.log('✨ No se requirieron cambios en los estados de eventos')
    } else {
      console.log('🎉 Actualización de estados completada exitosamente')
    }

    return summary

  } catch (error) {
    console.error('❌ Error actualizando estados de eventos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateEventStatuses()
    .then(() => {
      console.log('🚀 Script ejecutado exitosamente')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error ejecutando script:', error)
      process.exit(1)
    })
}

module.exports = { updateEventStatuses }


