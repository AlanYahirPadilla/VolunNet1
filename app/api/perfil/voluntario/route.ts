import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/auth/actions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const voluntario = await prisma.volunteer.findUnique({
    where: { userId: user.id },
  });
  if (!voluntario) {
    return NextResponse.json({ error: "Perfil de voluntario no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ user, voluntario });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const data = await req.json();
  // Validar y transformar socialLinks si es necesario
  let socialLinks = data.socialLinks;
  if (Array.isArray(socialLinks)) {
    // Si es array de objetos, extraer solo las URLs
    if (socialLinks.length > 0 && typeof socialLinks[0] === 'object' && socialLinks[0] !== null) {
      socialLinks = socialLinks.map((l: any) => l.url || l);
    }
  } else {
    socialLinks = [];
  }
  console.log('PUT /api/perfil/voluntario data:', JSON.stringify(data, null, 2));
  console.log('PUT /api/perfil/voluntario socialLinks:', socialLinks);
  try {
    // Actualizar User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email, // solo si permites editar email
        avatar: data.profileImage || data.avatar,
      },
    });
    // Actualizar Volunteer
    const updated = await prisma.volunteer.update({
      where: { userId: user.id },
      data: {
        bio: data.bio,
        interests: data.interests,
        skills: data.skills,
        cvUrl: data.cvUrl,
        experience: data.experience,
        gender: data.gender,
        languages: data.languages,
        city: data.city,
        state: data.state,
        address: data.address,
        tagline: data.tagline,
        references: data.references,
        socialLinks,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
    return NextResponse.json({ voluntario: updated });
  } catch (error: any) {
    console.error('Error actualizando voluntario:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
} 