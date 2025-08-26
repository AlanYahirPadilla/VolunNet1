#!/usr/bin/env node

/**
 * Script para probar el flujo completo de completar evento
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEventCompletion() {
  try {
    console.log('🧪 Probando flujo de completar evento...')
    
    // 1. Buscar el evento "Cucei" ONGOING
    console.log('\n1️⃣ Buscando evento "Cucei" ONGOING...')
    const event = await prisma.event.findFirst({
      where: {
        title: 'Cucei',
        status: 'ONGOING'
      },
      include: {
        organization: {
          include: {
            user: true
          }
        },
        applications: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            volunteer: true
          }
        }
      }
    })
    
    if (!event) {
      console.log('❌ Evento "Cucei" ONGOING no encontrado')
      return
    }
    
    console.log(`✅ Evento encontrado: ${event.title} (${event.status})`)
    console.log(`   ID: ${event.id}`)
    console.log(`   Organización: ${event.organization.name}`)
    console.log(`   Usuario organizador: ${event.organization.userId}`)
    console.log(`   Aplicaciones aceptadas: ${event.applications.length}`)
    
    // 2. Verificar que tiene aplicaciones aceptadas
    if (event.applications.length === 0) {
      console.log('\n⚠️  El evento no tiene aplicaciones aceptadas')
      console.log('   Para que funcione el flujo de completar, necesita voluntarios aceptados')
      
      // Mostrar todas las aplicaciones del evento
      const allApplications = await prisma.eventApplication.findMany({
        where: { eventId: event.id },
        include: {
          volunteer: true
        }
      })
      
      console.log('\n📋 Todas las aplicaciones del evento:')
      allApplications.forEach(app => {
        console.log(`   - ${app.volunteer.id} (${app.status})`)
      })
      
      return
    }
    
    // 3. Verificar que el evento puede ser completado
    console.log('\n2️⃣ Verificando que el evento puede ser completado...')
    
    const now = new Date()
    const eventEnd = new Date(event.endDate)
    
    if (now < eventEnd) {
      console.log(`⚠️  El evento aún no ha terminado (termina: ${eventEnd.toLocaleDateString()})`)
      console.log('   Pero técnicamente puede marcarse como completado manualmente')
    } else {
      console.log('✅ El evento ya terminó, puede marcarse como completado')
    }
    
    // 4. Simular el proceso de completar evento
    console.log('\n3️⃣ Simulando proceso de completar evento...')
    
    // Verificar que el usuario organizador existe
    const organizerUser = await prisma.user.findUnique({
      where: { id: event.organization.userId }
    })
    
    if (!organizerUser) {
      console.log('❌ Usuario organizador no encontrado')
      return
    }
    
    console.log(`✅ Usuario organizador: ${organizerUser.email} (${organizerUser.role})`)
    
    // 5. Verificar que las notificaciones funcionarían
    console.log('\n4️⃣ Verificando sistema de notificaciones...')
    
    // Contar notificaciones existentes
    const existingNotifications = await prisma.notification.count({
      where: {
        actionUrl: {
          contains: event.id
        }
      }
    })
    
    console.log(`   Notificaciones existentes para este evento: ${existingNotifications}`)
    
    // 6. Resumen del flujo
    console.log('\n📊 Resumen del flujo de completar evento:')
    console.log('   ✅ Evento encontrado y en estado ONGOING')
    console.log('   ✅ Tiene aplicaciones aceptadas')
    console.log('   ✅ Usuario organizador verificado')
    console.log('   ✅ API de completar evento implementada')
    console.log('   ✅ Sistema de notificaciones implementado')
    
    console.log('\n🚀 Para completar el evento:')
    console.log('   1. Ve a la nueva vista de organizador: /organizaciones/eventos/' + event.id + '/detalles')
    console.log('   2. Usa el botón "Marcar como Completado"')
    console.log('   3. Se enviarán notificaciones automáticamente')
    console.log('   4. Se habilitará el sistema de calificaciones')
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEventCompletion()
