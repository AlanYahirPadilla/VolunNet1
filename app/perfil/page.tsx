"use client"
import { Star, Edit, Lock, Calendar, Clock, Award, MapPin, Heart, Home, Users, Bell, User, Settings, LogOut, CheckCircle2, AlertCircle, Share2, BadgeCheck, UserCheck, FileDown, Upload, Briefcase, Link as LinkIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdaptiveLoading } from "@/components/ui/adaptive-loading"
import ProfileCompletionCard from "@/components/registro/profile-completion-card"
import ProfileEditModal from "@/components/registro/profile-edit-modal";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

// Extensión del mockUser para mostrar todos los campos nuevos del perfil
const mockUser = {
  name: "Yahir Venegas",
  email: "novayahiro50@gmail.com",
  emailVerified: true,
  city: "Guadalajara, Jalisco",
  state: "Jalisco",
  country: "México",
  address: "Av. Patria 123",
  latitude: 20.6597,
  longitude: -103.3496,
  birthDate: "1998-05-12",
  gender: "Masculino",
  languages: ["Español", "Inglés"],
  skills: ["Programación", "Diseño gráfico", "Gestión de proyectos"],
  interests: ["Educación", "Tecnología", "Salud"],
  bio: "Apasionado por el voluntariado y la tecnología. Siempre buscando nuevas formas de ayudar a mi comunidad.",
  tagline: "¡Listo para ayudar donde más se necesite!",
  experience: [
    "Voluntario en Cruz Roja (2022-2023)",
    "Líder de proyecto en EcoVida (2021)",
    "Participante en Hackathon Social (2020)"
  ],
  availability: [
    { day: "Lunes", hours: "16:00-20:00" },
    { day: "Sábado", hours: "09:00-14:00" }
  ],
  rating: 4.7,
  hours: 48,
  events: 12,
  achievements: [
    { title: "Voluntario del Mes", desc: "Reconocido por compromiso en abril 2024", icon: <Award className="h-5 w-5 text-yellow-500" /> },
    { title: "Evento destacado", desc: "Líder en 'Jornada de Salud 2023'", icon: <Calendar className="h-5 w-5 text-blue-500" /> },
  ],
  badges: [
    { label: "Top Voluntario", icon: <Star className="h-4 w-4 text-yellow-500" />, color: "bg-yellow-100 text-yellow-700" },
    { label: "Verificado", icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />, color: "bg-blue-100 text-blue-700" },
  ],
  cvFile: "CV_YahirVenegas.pdf",
  cvUrl: "https://ejemplo.com/cv.pdf",
  socialLinks: [
    { label: "LinkedIn", url: "https://linkedin.com/in/yahirvenegas" },
    { label: "Twitter", url: "https://twitter.com/yahirvenegas" }
  ],
  verified: true,
  references: [
    "María López - Directora Cruz Roja",
    "Juan Pérez - Coordinador EcoVida"
  ],
  birthDateFormatted: "12 de mayo de 1998",
}

// Mock de eventos participados
const mockEventos = [
  {
    nombre: "Jornada de Salud 2023",
    fecha: "15/08/2023",
    organizador: "Cruz Roja",
    rating: 5,
  },
  {
    nombre: "Limpieza de parques",
    fecha: "10/06/2023",
    organizador: "EcoVida",
    rating: 4,
  },
  {
    nombre: "Recolección de alimentos",
    fecha: "22/04/2023",
    organizador: "Banco de Alimentos",
    rating: 5,
  },
];

// Catálogo de categorías/intereses
const CATEGORIAS = [
  { id: "cat_1", nombre: "Educación" },
  { id: "cat_2", nombre: "Medio Ambiente" },
  { id: "cat_3", nombre: "Salud" },
  { id: "cat_4", nombre: "Alimentación" },
  { id: "cat_5", nombre: "Tecnología" },
  { id: "cat_6", nombre: "Deportes" },
  { id: "cat_7", nombre: "Arte y Cultura" },
  { id: "cat_8", nombre: "Construcción" },
];

// UserMenu del dashboard
function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú de usuario"
      >
        {user?.firstName?.[0] || 'Y'}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-800 text-sm">{user?.name || 'Yahir Venegas'}</div>
            <div className="text-xs text-gray-500">{user?.email || 'novayahiro50@gmail.com'}</div>
          </div>
          <Link href="/perfil" className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"><User className="h-4 w-4 text-gray-500" />Perfil</Link>
          <Link href="/configuracion" className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"><Settings className="h-4 w-4 text-gray-500" />Configuración</Link>
          <div className="border-t border-gray-100 my-1" />
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-xl transition"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4 text-gray-500" />Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// Añade un helper para el ribbon
function Ribbon({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute -top-3 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">
      {children}
    </div>
  );
}

export default function PerfilVoluntario() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [voluntario, setVoluntario] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/perfil/voluntario", { credentials: "include" })
      .then(res => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setUser(data.user);
        setVoluntario(data.voluntario);
        setEditData(data.voluntario);
        setLoading(false);
      });
  }, []);
  const loadingSteps = [
    { id: "perfil", label: "Preparando tu perfil...", status: (loading ? "loading" : "completed") as "loading" | "completed" },
  ];
  // Checklist y progreso reales
  const profileChecklist = voluntario ? [
    { label: "Foto de perfil", completed: !!user?.avatar, link: "/perfil" },
    { label: "Biografía", completed: !!voluntario.bio, link: "/perfil" },
    { label: "Intereses", completed: voluntario.interests && voluntario.interests.length > 0, link: "/perfil" },
    { label: "Habilidades", completed: voluntario.skills && voluntario.skills.length > 0, link: "/perfil" },
    { label: "CV", completed: !!voluntario.cvUrl, link: "/perfil" },
    { label: "Verificación de email", completed: user?.verified, link: "/configuracion" },
    { label: "Experiencia", completed: voluntario.experience && voluntario.experience.length > 0, link: "/perfil" },
  ] : [];
  const completedCount = profileChecklist.filter(i => i.completed).length;
  const completion = profileChecklist.length > 0 ? Math.round((completedCount / profileChecklist.length) * 100) : 0;
  // Formulario de edición
  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/perfil/voluntario", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
      credentials: "include"
    });
    // Volver a cargar datos reales después de guardar
    const res = await fetch("/api/perfil/voluntario", { credentials: "include" });
    const data = await res.json();
    setVoluntario(data.voluntario);
    setEditMode(false);
    setSaving(false);
  };
  return (
    <AdaptiveLoading isLoading={loading} type="dashboard" loadingSteps={loadingSteps}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 w-full">
        {/* Header superior del dashboard */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
            {/* Logo con corazón azul */}
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 focus:outline-none"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                title="Ir al inicio"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
              </button>
            </div>
            {/* Barra de búsqueda */}
            <div className="flex-1 mx-8 max-w-xl">
              <input
                type="text"
                placeholder="Buscar eventos, iglesias..."
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-700 shadow-sm"
              />
            </div>
            {/* Navegación */}
            <div className="flex items-center gap-6">
              <nav className="flex gap-2 text-gray-600 text-sm font-medium">
                <Link href="/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Inicio</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
                <Link href="/eventos" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Calendar className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Eventos</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
                <Link href="/comunidad" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Users className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Comunidad</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
                <Link href="/notificaciones" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Notificaciones</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              </nav>
              {/* Separador visual */}
              <div className="w-px h-8 bg-gray-200 mx-2" />
              {/* Avatar usuario con menú */}
              <UserMenu user={user} />
            </div>
          </div>
        </div>
        {/* Layout de dos columnas en desktop, sin banner morado */}
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-12 md:mt-16 px-4 md:px-0 z-20">
          {/* Línea divisoria sutil en desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-gray-200/70 z-10" style={{transform: 'translateX(-50%)'}} />
          {/* Columna izquierda: Card principal grande */}
          <div className="flex-[2.1] min-w-[380px] max-w-3xl flex flex-col gap-5 relative z-20">
            {/* Card de perfil grande tipo LinkedIn */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-2xl rounded-2xl p-8 flex flex-row items-center gap-10 w-full min-h-[240px] transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(80,80,200,0.18)] hover:-translate-y-1">
              {/* Botón compartir y PDF en la parte superior derecha */}
              <div className="absolute top-4 right-6 flex gap-2 z-20">
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold shadow hover:from-blue-600 hover:to-purple-700 transition-all"
                  title="Compartir perfil"
                  onClick={() => window.alert("Próximamente podrás compartir tu perfil")}
                >
                  <Share2 className="h-4 w-4" /> Compartir
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-semibold shadow hover:from-blue-500 hover:to-purple-600 transition-all"
                  title="Descargar perfil en PDF"
                  onClick={() => window.alert("Próximamente podrás descargar tu perfil en PDF")}
                >
                  <FileDown className="h-4 w-4" /> PDF
                </button>
              </div>
              {/* Avatar grande con botón editar, elevado */}
              <div className="relative flex-shrink-0" style={{ marginTop: '-5.5rem' }}>
                <div className="h-32 w-32 md:h-36 md:w-36 rounded-full bg-gray-200 border-8 border-white shadow-2xl flex items-center justify-center text-6xl text-blue-600 font-bold overflow-hidden transition-shadow duration-200">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user?.firstName?.[0] || 'Y'
                  )}
                </div>
                <button
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition"
                  title="Editar foto de perfil"
                  type="button"
                  style={{ cursor: 'not-allowed', opacity: 0.5 }}
                  disabled
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              {/* Info principal compacta y tagline */}
              <div className="flex-1 flex flex-col gap-1 min-w-0 pl-2 mb-8 mt-8">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900 mb-0 truncate leading-tight">{user?.name || 'Yahir Venegas'}</h1>
                  {/* Badges automáticos */}
                  {voluntario?.badges?.map((badge: any, idx: number) => (
                    <span key={idx} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`} title={badge.label}>
                      {badge.icon} {badge.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-base text-gray-500 mb-0 truncate">
                  {user?.email || 'novayahiro50@gmail.com'}
                  {user?.verified ? (
                    <span title="Correo verificado" className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    </span>
                  ) : (
                    <span title="Correo no verificado" className="flex items-center gap-1 text-blue-500 font-medium">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-xs">No verificado</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1 mt-0.5">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-500">{user?.city || 'Guadalajara, Jalisco'}</span>
                </div>
                {/* Tagline */}
                <div className="text-sm text-gray-600 italic mb-1">Voluntario apasionado por la tecnología y la comunidad</div>
                {/* Rating */}
                <div className="flex gap-1 mb-2 mt-1">
                  {[...Array(5)].map((_, i) => {
                    const rating = voluntario?.rating ?? 0;
                    const isFull = i + 1 <= Math.floor(rating);
                    const isHalf = !isFull && i < rating;
                    return (
                      <span key={i} className="relative">
                        <Star className={`h-5 w-5 ${isFull ? 'text-yellow-400 fill-yellow-300' : isHalf ? 'text-yellow-400' : 'text-gray-200'}`} />
                        {isHalf && (
                          <span className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-300" />
                          </span>
                        )}
                      </span>
                    );
                  })}
                  <span className="ml-1 text-yellow-500 font-semibold text-sm">{(voluntario?.rating ?? 0).toFixed(1)}</span>
                </div>
                {/* Intereses en una fila, chips grandes y coloridos */}
                <div className="w-full flex flex-wrap gap-3 mt-1 mb-2">
                  {voluntario?.interests?.map((area: string, idx: number) => {
                    const cat = CATEGORIAS.find(c => c.id === area);
                    return (
                      <span key={idx} className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold shadow-sm border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all cursor-pointer">
                        {cat ? cat.nombre : area}
                      </span>
                    );
                  })}
                </div>
                {/* Botones de acción en una sola fila en la parte inferior */}
                <div className="w-full flex flex-wrap gap-2 mt-8 border-t border-purple-200 pt-4 justify-center md:justify-start">
                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    type="button"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit className="h-4 w-4" /> Editar perfil
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-blue-400 text-blue-700 font-semibold bg-white shadow hover:bg-blue-50 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="button"
                  >
                    <Lock className="h-4 w-4" /> Cambiar contraseña
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-blue-400 text-blue-700 font-semibold bg-white shadow hover:bg-blue-50 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="button"
                    onClick={() => window.alert('Próximamente podrás subir tu CV')}
                  >
                    <Upload className="h-4 w-4" /> {voluntario?.cvFile ? 'Actualizar CV' : 'Subir CV'}
                  </button>
                  {voluntario?.cvFile && (
                    <button
                      className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-green-400 text-green-700 font-semibold bg-white shadow hover:bg-green-50 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                      type="button"
                      onClick={() => window.alert('Próximamente podrás descargar el CV')}
                    >
                      <FileDown className="h-4 w-4" /> Descargar CV
                    </button>
                  )}
                  {voluntario?.cvFile && (
                    <span className="text-xs text-gray-500 ml-2 truncate max-w-[120px]">{voluntario?.cvFile}</span>
                  )}
                </div>
              </div>
            </div>
            {/* Card Sobre mí */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Sobre mí</h2>
              </div>
              <p className="text-gray-600 text-sm mb-2">{voluntario?.bio || ''}</p>
              <div className="text-sm text-gray-600 italic">{voluntario?.tagline || ''}</div>
            </div>
            {/* Card Logros debajo de Sobre mí */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-yellow-200 pb-1">Logros</h2>
              </div>
              <div className="flex flex-col gap-4">
                {voluntario?.achievements?.map((ach: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:bg-blue-100 hover:shadow-md cursor-pointer"
                    title={ach.title}
                  >
                    <span>{ach.icon}</span>
                    <div>
                      <div className="font-medium text-blue-700 text-sm">{ach.title}</div>
                      <div className="text-xs text-gray-500">{ach.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Card Eventos Participados */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Eventos en los que he participado</h2>
              </div>
              <div className="flex flex-col gap-4">
                {mockEventos.map((evento, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between bg-blue-50 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:bg-blue-100 hover:shadow-md cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <span className="font-medium text-blue-700 text-base">{evento.nombre}</span>
                      <span className="text-xs text-gray-500">{evento.fecha}</span>
                      <span className="text-xs text-gray-500">Organizador: {evento.organizador}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 md:mt-0">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < evento.rating ? 'text-yellow-400 fill-yellow-300' : 'text-gray-200'}`} />
                      ))}
                      <span className="ml-1 text-yellow-500 font-semibold text-sm">{evento.rating}.0</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Card Información Personal */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Información personal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span className="font-semibold">Nombre:</span> {user ? `${user.firstName} ${user.lastName}` : ''}</div>
                <div><span className="font-semibold">Correo:</span> {user?.email}</div>
                <div><span className="font-semibold">Fecha de nacimiento:</span> {voluntario?.birthDate ? voluntario.birthDate.split('T')[0] : ''}</div>
                <div><span className="font-semibold">Género:</span> {voluntario?.gender || ''}</div>
                <div><span className="font-semibold">Ciudad:</span> {voluntario?.city || ''}</div>
                <div><span className="font-semibold">Estado:</span> {voluntario?.state || ''}</div>
                <div><span className="font-semibold">País:</span> {voluntario?.country || ''}</div>
                <div><span className="font-semibold">Dirección:</span> {voluntario?.address || ''}</div>
                <div><span className="font-semibold">Ubicación GPS:</span> {voluntario?.latitude}, {voluntario?.longitude}</div>
                <div><span className="font-semibold">Verificado:</span> {user?.verified ? "Sí" : "No"}</div>
              </div>
            </div>
            {/* Card Habilidades e Intereses */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-purple-200 pb-1">Habilidades e intereses</h2>
              </div>
              <div className="flex flex-wrap gap-3 mb-2">
                <span className="font-semibold">Habilidades:</span>
                {voluntario?.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">{skill}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mb-2">
                <span className="font-semibold">Intereses:</span>
                {voluntario?.interests?.map((interest: string, idx: number) => {
                  // Buscar el nombre real en el catálogo
                  const cat = CATEGORIAS.find(c => c.id === interest);
                  return (
                    <span key={idx} className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200">
                      {cat ? cat.nombre : interest}
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mb-2">
                <span className="font-semibold">Idiomas:</span>
                {voluntario?.languages?.map((lang: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200">{lang}</span>
                ))}
              </div>
            </div>
            {/* Card Experiencia */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Experiencia</h2>
              </div>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                {voluntario?.experience?.map((exp: string, idx: number) => (
                  <li key={idx}>{exp}</li>
                ))}
              </ul>
            </div>
            {/* Card Disponibilidad */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Disponibilidad</h2>
              </div>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                {voluntario?.availability?.map((slot: any, idx: number) => (
                  <li key={idx}>{slot.day}: {slot.hours}</li>
                ))}
              </ul>
            </div>
            {/* Card Referencias */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Referencias</h2>
              </div>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                {voluntario?.references?.map((ref: string, idx: number) => (
                  <li key={idx}>{ref}</li>
                ))}
              </ul>
            </div>
          </div>
          {/* Columna derecha: Card de Nivel y Progreso de Perfil */}
          <div className="flex-[0.5] flex flex-col gap-6 min-w-[200px] max-w-xs relative z-20">
            {/* Progreso de perfil */}
            <ProfileCompletionCard completion={completion} checklist={profileChecklist} />
            {/* Card CV y redes sociales */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full">
              <div className="flex items-center gap-2 mb-2">
                <FileDown className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">CV y redes sociales</h2>
              </div>
              <div className="mb-2">
                <span className="font-semibold">CV:</span> {voluntario?.cvUrl ? (
                  <a href={voluntario.cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Descargar CV</a>
                ) : "No subido"}
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="font-semibold">Redes sociales:</span>
                {Array.isArray(voluntario?.socialLinks) && voluntario.socialLinks.length > 0 ? (
                  voluntario.socialLinks.map((url: string, idx: number) => {
                    let label = '';
                    let icon = <LinkIcon className="h-4 w-4 mr-1 text-gray-400 inline" />;
                    if (url.includes('facebook.com')) { label = 'Facebook'; icon = <FaFacebook className="h-4 w-4 mr-1 text-blue-600 inline" />; }
                    else if (url.includes('instagram.com')) { label = 'Instagram'; icon = <FaInstagram className="h-4 w-4 mr-1 text-pink-500 inline" />; }
                    else if (url.includes('twitter.com')) { label = 'Twitter'; icon = <FaTwitter className="h-4 w-4 mr-1 text-blue-400 inline" />; }
                    else { label = 'Red social'; }
                    return (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 hover:bg-blue-50 hover:text-blue-700 transition-all">
                        {icon} {label}
                      </a>
                    );
                  })
                ) : (
                  <span className="text-gray-400 ml-2">-</span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Modal de edición de perfil */}
        <ProfileEditModal
          open={editMode}
          onClose={() => setEditMode(false)}
          initialData={{ ...user, ...voluntario }}
          onSave={async (data: any) => {
            setSaving(true);
            await fetch("/api/perfil/voluntario", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
              credentials: "include"
            });
            // Volver a cargar datos reales después de guardar
            const res = await fetch("/api/perfil/voluntario", { credentials: "include" });
            const updated = await res.json();
            setUser(updated.user);
            setVoluntario(updated.voluntario);
            setEditMode(false);
            setSaving(false);
          }}
        />
        {/* Botón para abrir el modal */}
        <div className="max-w-2xl mx-auto my-4 flex justify-end">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => setEditMode(true)}>Editar perfil</button>
        </div>
      </div>
    </AdaptiveLoading>
  )
} 