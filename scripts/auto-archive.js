#!/usr/bin/env node

/**
 * Script para archivo automático de eventos
 * Este script se puede ejecutar manualmente o configurar como cron job
 * 
 * Uso:
 * node scripts/auto-archive.js
 * 
 * Para configurar como cron job (diario a las 2 AM):
 * 0 2 * * * cd /path/to/project && node scripts/auto-archive.js
 */

const { EventArchiveService } = require('../lib/services/EventArchiveService')

async function main() {
  try {
    console.log('🚀 Iniciando proceso de archivo automático de eventos...')
    console.log(`⏰ ${new Date().toISOString()}`)
    
    const archiveService = EventArchiveService.getInstance()
    
    // Paso 1: Archivar eventos completados
    console.log('\n📦 Paso 1: Archivando eventos completados...')
    await archiveService.archiveCompletedEvents()
    
    // Paso 2: Programar recordatorios de calificación
    console.log('\n🔔 Paso 2: Programando recordatorios de calificación...')
    await archiveService.scheduleRatingReminders()
    
    // Paso 3: Limpiar notificaciones expiradas
    console.log('\n🧹 Paso 3: Limpiando notificaciones expiradas...')
    const { NotificationService } = require('../lib/services/NotificationService')
    const notificationService = NotificationService.getInstance()
    await notificationService.cleanupExpiredNotifications()
    
    // Paso 4: Obtener estadísticas
    console.log('\n📊 Paso 4: Generando estadísticas...')
    const stats = await archiveService.getArchiveStats()
    
    console.log('\n✅ Proceso completado exitosamente!')
    console.log('\n📈 Estadísticas del archivo:')
    console.log(`   • Total archivados: ${stats.totalArchived}`)
    console.log(`   • Archivados este mes: ${stats.archivedThisMonth}`)
    console.log(`   • Pendientes de archivo: ${stats.pendingArchive}`)
    
    console.log(`\n⏰ Finalizado: ${new Date().toISOString()}`)
    
  } catch (error) {
    console.error('\n❌ Error durante el proceso de archivo:', error)
    process.exit(1)
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main()
}

module.exports = { main }



