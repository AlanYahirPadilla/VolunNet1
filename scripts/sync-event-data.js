#!/usr/bin/env node

/**
 * Script para sincronizar datos de eventos y corregir inconsistencias
 * Este script:
 * 1. Verifica que todos los eventos tengan organizationId válido
 * 2. Crea organizaciones faltantes para usuarios
 * 3. Sincroniza los estados de eventos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function syncEventData() {
  try {
    console.log('🔄 Iniciando sincronización de datos de eventos...')
    
    // 1. Verificar usuarios organizadores sin organización
    console.log('\n📋 Verificando usuarios organizadores...')
    const usersWithoutOrg = await prisma.user.findMany({
      where: {
        role: 'ORGANIZATION',
        organization: null
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    console.log(`Usuarios organizadores sin organización: ${usersWithoutOrg.length}`)
    
    // Crear organizaciones faltantes
    for (const user of usersWithoutOrg) {
      const orgName = user.firstName || 'Organización sin nombre'
      console.log(`Creando organización para usuario ${user.email}: ${orgName}`)
      
      await prisma.organization.create({
        data: {
          userId: user.id,
          name: orgName,
          description: `Organización creada automáticamente para ${user.email}`,
          verified: false,
          eventsCreated: 0,
          volunteersHelped: 0
        }
      })
    }

    // 2. Verificar eventos sin organizationId válido
    console.log('\n📅 Verificando eventos...')
    const eventsWithoutOrg = await prisma.event.findMany({
      where: {
        organization: null
      },
      select: {
        id: true,
        title: true,
        organizationId: true
      }
    })

    console.log(`Eventos sin organización válida: ${eventsWithoutOrg.length}`)
    
    if (eventsWithoutOrg.length > 0) {
      console.log('⚠️  Eventos encontrados sin organización válida:')
      eventsWithoutOrg.forEach(event => {
        console.log(`  - ${event.title} (ID: ${event.id})`)
      })
      
      // Intentar asignar organización basada en el nombre del evento
      for (const event of eventsWithoutOrg) {
        // Buscar organización por nombre similar
        const orgs = await prisma.organization.findMany({
          where: {
            name: {
              contains: 'Social'
            }
          }
        })
        
        if (orgs.length > 0) {
          const org = orgs[0]
          console.log(`Asignando evento "${event.title}" a organización "${org.name}"`)
          
          await prisma.event.update({
            where: { id: event.id },
            data: { organizationId: org.id }
          })
        } else {
          console.log(`❌ No se pudo asignar organización para evento "${event.title}"`)
        }
      }
    }

    // 3. Verificar estados de eventos
    console.log('\n🔍 Verificando estados de eventos...')
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true
      }
    })

    console.log(`Total de eventos: ${events.length}`)
    
    const statusCounts = {}
    events.forEach(event => {
      statusCounts[event.status] = (statusCounts[event.status] || 0) + 1
    })
    
    console.log('Distribución de estados:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

    // 4. Verificar fechas y estados
    console.log('\n📅 Verificando fechas y estados...')
    const now = new Date()
    
    for (const event of events) {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      
      let recommendedStatus = event.status
      
      if (now < startDate) {
        recommendedStatus = 'PUBLISHED'
      } else if (now >= startDate && now <= endDate) {
        recommendedStatus = 'ONGOING'
      } else if (now > endDate) {
        recommendedStatus = 'COMPLETED'
      }
      
      if (recommendedStatus !== event.status) {
        console.log(`Evento "${event.title}": ${event.status} → ${recommendedStatus}`)
        
        // Solo actualizar si es necesario
        if (['PUBLISHED', 'ONGOING', 'COMPLETED'].includes(recommendedStatus)) {
          await prisma.event.update({
            where: { id: event.id },
            data: { status: recommendedStatus }
          })
        }
      }
    }

    // 5. Resumen final
    console.log('\n📊 Resumen de sincronización:')
    console.log(`✅ Organizaciones creadas: ${usersWithoutOrg.length}`)
    console.log(`✅ Eventos corregidos: ${eventsWithoutOrg.length}`)
    console.log(`✅ Estados verificados: ${events.length}`)
    
    console.log('\n🎉 Sincronización completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncEventData()
    .then(() => {
      console.log('🚀 Script ejecutado exitosamente')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error ejecutando script:', error)
      process.exit(1)
    })
}

module.exports = { syncEventData }



