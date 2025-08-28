const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function seedEvents() {
  try {
    console.log('🌱 Iniciando inserción de eventos de ejemplo...');

    // Primero, asegurar que existan las categorías
    console.log('📋 Creando categorías...');
    await sql`
      INSERT INTO event_categories (id, name, description, icon, color, active, "updatedAt")
      VALUES 
        ('cat_1', 'Educación', 'Enseñanza y capacitación', '🎓', 'bg-blue-100 text-blue-700', true, ${new Date()}),
        ('cat_2', 'Medio Ambiente', 'Conservación y sostenibilidad', '🌱', 'bg-green-100 text-green-700', true, ${new Date()}),
        ('cat_3', 'Salud', 'Bienestar y salud comunitaria', '❤️', 'bg-red-100 text-red-700', true, ${new Date()}),
        ('cat_4', 'Alimentación', 'Programas de nutrición', '🍽️', 'bg-orange-100 text-orange-700', true, ${new Date()}),
        ('cat_5', 'Tecnología', 'Capacitación digital', '💻', 'bg-purple-100 text-purple-700', true, ${new Date()}),
        ('cat_6', 'Deportes', 'Actividades deportivas', '🏆', 'bg-yellow-100 text-yellow-700', true, ${new Date()}),
        ('cat_7', 'Arte y Cultura', 'Expresión artística', '🎨', 'bg-pink-100 text-pink-700', true, ${new Date()}),
        ('cat_8', 'Construcción', 'Proyectos comunitarios', '🔨', 'bg-gray-100 text-gray-700', true, ${new Date()})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        active = EXCLUDED.active,
        "updatedAt" = ${new Date()}
    `;
    console.log('✅ Categorías creadas/actualizadas');

    // Crear una organización de ejemplo si no existe
    console.log('🏢 Creando organización de ejemplo...');
    const orgId = 'org_example_' + Date.now();
    await sql`
      INSERT INTO organizations (id, "userId", name, description, "createdAt", "updatedAt")
      VALUES (${orgId}, 'user_example', 'EcoMar Jalisco', 'Organización dedicada a la conservación del medio ambiente', ${new Date()}, ${new Date()})
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Organización creada');

    // Crear eventos de ejemplo
    console.log('📅 Creando eventos de ejemplo...');
    const events = [
      {
        id: 'event_1',
        title: 'Limpieza de Playa Vallarta',
        description: 'Actividad de limpieza en la playa principal de Puerto Vallarta para mantener el ecosistema marino limpio y saludable.',
        organizationId: orgId,
        address: 'Playa Principal, Puerto Vallarta',
        city: 'Puerto Vallarta',
        state: 'Jalisco',
        country: 'México',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días en el futuro
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 horas después
        maxVolunteers: 20,
        currentVolunteers: 8,
        skills: ['Trabajo en equipo', 'Resistencia física'],
        categoryId: 'cat_2',
        status: 'PUBLISHED',
        requirements: ['Ropa cómoda', 'Protector solar', 'Botella de agua'],
        benefits: ['Experiencia en conservación', 'Networking', 'Certificado de participación'],
        imageUrl: null
      },
      {
        id: 'event_2',
        title: 'Taller de Programación para Niños',
        description: 'Enseñanza básica de programación a niños de primaria usando Scratch y herramientas educativas divertidas.',
        organizationId: orgId,
        address: 'Centro Comunitario Zapopan',
        city: 'Guadalajara',
        state: 'Jalisco',
        country: 'México',
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días en el futuro
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 horas después
        maxVolunteers: 10,
        currentVolunteers: 3,
        skills: ['Programación', 'Paciencia', 'Comunicación'],
        categoryId: 'cat_1',
        status: 'PUBLISHED',
        requirements: ['Conocimientos básicos de programación', 'Disposición para enseñar'],
        benefits: ['Experiencia docente', 'Networking', 'Certificado'],
        imageUrl: null
      },
      {
        id: 'event_3',
        title: 'Donación de Alimentos',
        description: 'Recolección y distribución de alimentos para familias necesitadas en la zona metropolitana de Guadalajara.',
        organizationId: orgId,
        address: 'Centro de Acopio GDL',
        city: 'Zapopan',
        state: 'Jalisco',
        country: 'México',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 horas después
        maxVolunteers: 15,
        currentVolunteers: 12,
        skills: ['Organización', 'Trabajo en equipo'],
        categoryId: 'cat_4',
        status: 'PUBLISHED',
        requirements: ['Ropa cómoda', 'Disposición para cargar peso'],
        benefits: ['Experiencia en logística', 'Impacto social directo'],
        imageUrl: null
      },
      {
        id: 'event_4',
        title: 'Clínica de Salud Comunitaria',
        description: 'Proporcionar servicios básicos de salud y orientación médica a la comunidad de Tlaquepaque.',
        organizationId: orgId,
        address: 'Plaza Principal Tlaquepaque',
        city: 'Tlaquepaque',
        state: 'Jalisco',
        country: 'México',
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días en el futuro
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 horas después
        maxVolunteers: 12,
        currentVolunteers: 9,
        skills: ['Atención al cliente', 'Organización'],
        categoryId: 'cat_3',
        status: 'PUBLISHED',
        requirements: ['Disposición para ayudar', 'Buen trato con la gente'],
        benefits: ['Experiencia en salud pública', 'Networking médico'],
        imageUrl: null
      },
      {
        id: 'event_5',
        title: 'Taller de Arte para Adultos Mayores',
        description: 'Actividades artísticas y manualidades para promover la creatividad y socialización en adultos mayores.',
        organizationId: orgId,
        address: 'Casa de la Cultura',
        city: 'Guadalajara',
        state: 'Jalisco',
        country: 'México',
        startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 días en el futuro
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 horas después
        maxVolunteers: 8,
        currentVolunteers: 6,
        skills: ['Arte', 'Paciencia', 'Comunicación'],
        categoryId: 'cat_7',
        status: 'PUBLISHED',
        requirements: ['Conocimientos básicos de arte', 'Disposición para trabajar con adultos mayores'],
        benefits: ['Experiencia intergeneracional', 'Desarrollo de habilidades artísticas'],
        imageUrl: null
      }
    ];

    for (const event of events) {
      await sql`
        INSERT INTO events (
          id, title, description, "organizationId", address, city, state, country,
          "startDate", "endDate", "maxVolunteers", "currentVolunteers", skills,
          "categoryId", status, requirements, benefits, "imageUrl", "createdAt", "updatedAt"
        ) VALUES (
          ${event.id}, ${event.title}, ${event.description}, ${event.organizationId},
          ${event.address}, ${event.city}, ${event.state}, ${event.country},
          ${event.startDate}, ${event.endDate}, ${event.maxVolunteers}, ${event.currentVolunteers},
          ${event.skills}, ${event.categoryId}, ${event.status}, ${event.requirements},
          ${event.benefits}, ${event.imageUrl}, ${new Date()}, ${new Date()}
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          "startDate" = EXCLUDED."startDate",
          "endDate" = EXCLUDED."endDate",
          "updatedAt" = ${new Date()}
      `;
      console.log(`✅ Evento creado: ${event.title}`);
    }

    console.log('🎉 ¡Eventos de ejemplo insertados exitosamente!');
    console.log(`📊 Total de eventos creados: ${events.length}`);

  } catch (error) {
    console.error('❌ Error insertando eventos:', error);
  } finally {
    process.exit(0);
  }
}

seedEvents();






