import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/auth/actions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/perfil/organizador
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: user.id },
    });

    if (!organization) {
      return NextResponse.json({ error: "Perfil de organizador no encontrado" }, { status: 404 });
    }

    const organizadorForFrontend = {
      id: organization.id,
      userId: organization.userId,
      nombre: organization.name, 
      descripcion: organization.description, 
      categoria: organization.category, 
      sitioWeb: organization.website, 
      emailContacto: organization.contactEmail, 
      telefonoContacto: organization.contactPhone, 
      ciudadEstadoPais: [organization.city, organization.state, organization.country]
        .filter(Boolean)
        .join(', ') || null,
      latitudLongitud: (organization.latitude !== null && organization.longitude !== null)
        ? `${organization.latitude},${organization.longitude}`
        : null,
      redesSociales: organization.socialLinks,
      documentosVerificacion: organization.verificationDocs,
      verificado: organization.verified,
      eventosCreados: organization.eventsCreated,
      voluntariosAyudados: organization.volunteersHelped,
      preferenciasVoluntario: organization.preferences, 
      rating: organization.rating,
      tagline: organization.tagline,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };

    return NextResponse.json({ user, organizador: organizadorForFrontend });
  } catch (error: any) {
    console.error('Error al obtener perfil de organizador:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/perfil/organizador
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const data = await req.json();

  
  let socialLinks: string[] = [];
  if (Array.isArray(data.socialLinks)) {
    if (data.socialLinks.length > 0 && typeof data.socialLinks[0] === 'object' && data.socialLinks[0] !== null) {
      socialLinks = data.socialLinks.map((l: any) => l.url || l);
    } else {
      socialLinks = data.socialLinks;
    }
  } else if (typeof data.socialLinks === 'string') {
    socialLinks = data.socialLinks.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }

  let verificationDocs: string[] = [];
  if (Array.isArray(data.verificationDocs)) {
    if (data.verificationDocs.length > 0 && typeof data.verificationDocs[0] === 'object' && data.verificationDocs[0] !== null) {
      verificationDocs = data.verificationDocs.map((l: any) => l.url || l);
    } else {
      verificationDocs = data.verificationDocs;
    }
  } else if (typeof data.verificationDocs === 'string') {
    verificationDocs = data.verificationDocs.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }

  let preferences: string[] = [];
  if (Array.isArray(data.preferences)) {
    if (data.preferences.length > 0 && typeof data.preferences[0] === 'object' && data.preferences[0] !== null) {
      preferences = data.preferences.map((l: any) => l.value || l);
    } else {
      preferences = data.preferences;
    }
  } else if (typeof data.preferences === 'string') {
    preferences = data.preferences.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }

  console.log('PUT /api/perfil/organizador data received:', JSON.stringify(data, null, 2));
  console.log('PUT /api/perfil/organizador socialLinks processed:', socialLinks);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatar: data.profileImage || data.avatar,
      },
    });

    const updatedOrganization = await prisma.organization.update({
      where: { userId: user.id },
      data: {
        name: data.name, 
        description: data.description, 
        website: data.website, 
        category: data.category, 
        contactEmail: data.contactEmail, 
        contactPhone: data.contactPhone, 
        address: data.address, 
        city: data.city,
        state: data.state,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        socialLinks: socialLinks,
        verificationDocs: verificationDocs,
        preferences: preferences,
        rating: data.rating,
        tagline: data.tagline,
      },
    });

    return NextResponse.json({ organizador: updatedOrganization });
  } catch (error: any) {
    console.error('Error actualizando organizador:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Perfil de organizador no encontrado para actualizar.' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}