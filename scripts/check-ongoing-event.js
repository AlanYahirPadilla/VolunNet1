#!/usr/bin/env node

/**
 * Script para verificar específicamente el evento "Cucei" ONGOING
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkOngoingEvent() {
  try {
    console.log('🔍 Verificando evento "Cucei" ONGOING...')
    
    // Buscar el evento "Cucei" que está ONGOING
    const event = await prisma.event.findFirst({
      where: {
        title: 'Cucei',
        status: 'ONGOING'
      },
      include: {
        organization: true,
        category: true
      }
    })
    
    if (event) {
      console.log('\n📋 Evento ONGOING encontrado:')
      console.log(`  ID: ${event.id}`)
      console.log(`  Título: ${event.title}`)
      console.log(`  Estado: ${event.status}`)
      console.log(`  Fecha inicio: ${event.startDate}`)
      console.log(`  Fecha fin: ${event.endDate}`)
      console.log(`  organizationId: ${event.organizationId}`)
      console.log(`  Organización: ${event.organization?.name || 'N/A'}`)
      console.log(`  Categoría: ${event.category?.name || 'N/A'}`)
      
      // Verificar la organización
      if (event.organization) {
        console.log('\n🏢 Detalles de la organización:')
        console.log(`  ID: ${event.organization.id}`)
        console.log(`  Nombre: ${event.organization.name}`)
        console.log(`  userId: ${event.organization.userId}`)
        console.log(`  Verificada: ${event.organization.verified}`)
      }
      
      // Verificar si el usuario de la organización coincide
      const user = await prisma.user.findUnique({
        where: { id: event.organization.userId }
      })
      
      if (user) {
        console.log('\n👤 Usuario de la organización:')
        console.log(`  ID: ${user.id}`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Nombre: ${user.firstName} ${user.lastName}`)
        console.log(`  Rol: ${user.role}`)
      }
      
    } else {
      console.log('❌ Evento "Cucei" ONGOING no encontrado')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOngoingEvent()



