#!/usr/bin/env node

/**
 * Script para verificar específicamente el evento "Cucei"
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSpecificEvent() {
  try {
    console.log('🔍 Verificando evento específico "Cucei"...')
    
    // Buscar el evento "Cucei"
    const event = await prisma.event.findFirst({
      where: {
        title: 'Cucei'
      },
      include: {
        organization: true,
        category: true
      }
    })
    
    if (event) {
      console.log('\n📋 Evento encontrado:')
      console.log(`  ID: ${event.id}`)
      console.log(`  Título: ${event.title}`)
      console.log(`  Estado: ${event.status}`)
      console.log(`  Fecha inicio: ${event.startDate}`)
      console.log(`  Fecha fin: ${event.endDate}`)
      console.log(`  organizationId: ${event.organizationId}`)
      console.log(`  Organización: ${event.organization?.name || 'N/A'}`)
      console.log(`  Categoría: ${event.category?.name || 'N/A'}`)
      
      // Verificar si tiene organizationId
      if (event.organizationId) {
        console.log('\n✅ El evento SÍ tiene organizationId')
        
        // Verificar la organización
        const org = await prisma.organization.findUnique({
          where: { id: event.organizationId }
        })
        
        if (org) {
          console.log(`✅ Organización encontrada: ${org.name}`)
          console.log(`  ID: ${org.id}`)
          console.log(`  userId: ${org.userId}`)
        } else {
          console.log('❌ Organización NO encontrada')
        }
      } else {
        console.log('\n❌ El evento NO tiene organizationId')
      }
      
    } else {
      console.log('❌ Evento "Cucei" no encontrado')
    }
    
    // También verificar todos los eventos de "Social new"
    console.log('\n🔍 Verificando todos los eventos de "Social new"...')
    
    const socialNewEvents = await prisma.event.findMany({
      where: {
        organization: {
          name: 'Social new'
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        organizationId: true
      }
    })
    
    console.log(`\n📊 Eventos de "Social new": ${socialNewEvents.length}`)
    socialNewEvents.forEach(event => {
      console.log(`  - ${event.title} (${event.status}) - organizationId: ${event.organizationId}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSpecificEvent()


