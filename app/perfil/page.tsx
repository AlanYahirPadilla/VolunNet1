"use client"
import { Star, Edit, Lock, Calendar, Clock, Award, MapPin, Heart, Home, Users, Bell, User, Settings, LogOut, CheckCircle2, AlertCircle, Share2, BadgeCheck, UserCheck, FileDown, Upload } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdaptiveLoading } from "@/components/ui/adaptive-loading"

const mockUser = {
  name: "Yahir Venegas",
  email: "novayahiro50@gmail.com",
  emailVerified: true, // Cambia a false para probar el estado no verificado
  city: "Guadalajara, Jalisco",
  events: 12,
  hours: 48,
  rating: 4.7,
  interests: ["Educación", "Tecnología", "Salud"],
  about: "Apasionado por el voluntariado y la tecnología. Siempre buscando nuevas formas de ayudar a mi comunidad.",
  level: 3,
  levelDesc: "Voluntario Oro",
  levelRank: "Oro",
  levelRankColor: "#FFD700", // dorado
  levelProgress: 0.7, // 70% al siguiente nivel
  achievements: [
    { title: "Voluntario del Mes", desc: "Reconocido por compromiso en abril 2024", icon: <Award className="h-5 w-5 text-yellow-500" /> },
    { title: "Evento destacado", desc: "Líder en 'Jornada de Salud 2023'", icon: <Calendar className="h-5 w-5 text-blue-500" /> },
  ],
  badges: [
    { label: "Top Voluntario", icon: <Star className="h-4 w-4 text-yellow-500" />, color: "bg-yellow-100 text-yellow-700" },
    { label: "Verificado", icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />, color: "bg-blue-100 text-blue-700" },
    // { label: "Organizador", icon: <Users className="h-4 w-4 text-purple-500" />, color: "bg-purple-100 text-purple-700" },
  ],
  cvFile: "CV_YahirVenegas.pdf", // null si no hay CV subido
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
          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-xl transition" onClick={async () => { router.push("/"); }}><LogOut className="h-4 w-4 text-gray-500" />Cerrar sesión</button>
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const handleAvatarChange = () => {
    window.alert('Próximamente');
  };
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  // Compartir perfil
  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    window.alert("¡Enlace de perfil copiado!");
  };
  // Descargar perfil PDF
  const handleDownloadPDF = () => {
    window.alert("Próximamente podrás descargar tu perfil en PDF");
  };
  // Subir CV
  const handleUploadCV = () => {
    window.alert("Próximamente podrás subir tu CV");
  };
  const loadingSteps = [
    { id: "perfil", label: "Preparando tu perfil...", status: (loading ? "loading" : "completed") as "loading" | "completed" },
  ];
  return (
    <AdaptiveLoading isLoading={loading} type="dashboard" loadingSteps={loadingSteps}>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 w-full">
      {/* Header superior del dashboard */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo con corazón azul */}
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
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
            <UserMenu user={mockUser} />
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
                onClick={handleShareProfile}
              >
                <Share2 className="h-4 w-4" /> Compartir
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-semibold shadow hover:from-blue-500 hover:to-purple-600 transition-all"
                title="Descargar perfil en PDF"
                onClick={handleDownloadPDF}
              >
                <FileDown className="h-4 w-4" /> PDF
              </button>
            </div>
            {/* Avatar grande con botón editar, elevado */}
            <div className="relative flex-shrink-0" style={{ marginTop: '-5.5rem' }}>
              <div className="h-32 w-32 md:h-36 md:w-36 rounded-full bg-gray-200 border-8 border-white shadow-2xl flex items-center justify-center text-6xl text-blue-600 font-bold overflow-hidden transition-shadow duration-200">
                {mockUser.name[0]}
              </div>
              {/* Input file oculto para subir foto */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition"
                title="Editar foto de perfil"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>
            {/* Info principal compacta y tagline */}
            <div className="flex-1 flex flex-col gap-1 min-w-0 pl-2 mb-8 mt-8">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900 mb-0 truncate leading-tight">{mockUser.name}</h1>
                {/* Badges automáticos */}
                {mockUser.badges.map((badge, idx) => (
                  <span key={idx} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`} title={badge.label}>
                    {badge.icon} {badge.label}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-base text-gray-500 mb-0 truncate">
                {mockUser.email}
                {mockUser.emailVerified ? (
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
                <span className="text-sm text-gray-500">{mockUser.city}</span>
              </div>
              {/* Tagline */}
              <div className="text-sm text-gray-600 italic mb-1">Voluntario apasionado por la tecnología y la comunidad</div>
              {/* Rating */}
              <div className="flex gap-1 mb-2 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(mockUser.rating) ? 'text-yellow-400 fill-yellow-300' : 'text-gray-200'}`} />
                ))}
                <span className="ml-1 text-yellow-500 font-semibold text-sm">{mockUser.rating}</span>
              </div>
              {/* Intereses en una fila, chips grandes y coloridos */}
              <div className="w-full flex flex-wrap gap-3 mt-1 mb-2">
                {mockUser.interests.map(area => (
                  <span key={area} className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold shadow-sm border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all cursor-pointer">{area}</span>
                ))}
              </div>
              {/* Botones de acción en una sola fila en la parte inferior */}
              <div className="w-full flex flex-wrap gap-2 mt-8 border-t border-purple-200 pt-4 justify-center md:justify-start">
                <button
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  type="button"
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
                  onClick={handleUploadCV}
                >
                  <Upload className="h-4 w-4" /> {mockUser.cvFile ? 'Actualizar CV' : 'Subir CV'}
                </button>
                {mockUser.cvFile && (
                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-green-400 text-green-700 font-semibold bg-white shadow hover:bg-green-50 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    type="button"
                    onClick={() => window.alert('Próximamente podrás descargar el CV')}
                  >
                    <FileDown className="h-4 w-4" /> Descargar CV
                  </button>
                )}
                {mockUser.cvFile && (
                  <span className="text-xs text-gray-500 ml-2 truncate max-w-[120px]">{mockUser.cvFile}</span>
                )}
              </div>
            </div>
          </div>
          {/* Card Sobre mí */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Sobre mí</h2>
            </div>
            <p className="text-gray-600 text-sm mb-2">{mockUser.about}</p>
          </div>
          {/* Card Logros debajo de Sobre mí */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-yellow-200 pb-1">Logros</h2>
            </div>
            <div className="flex flex-col gap-4">
              {mockUser.achievements.map((ach, idx) => (
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
        </div>
        {/* Columna derecha: Card de Nivel */}
        <div className="flex-[0.5] flex flex-col gap-6 min-w-[200px] max-w-xs relative z-20">
          <div className="relative bg-gradient-to-br from-white via-yellow-50 to-yellow-100 border border-yellow-200 shadow-2xl rounded-2xl p-6 w-full flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(200,180,80,0.18)] hover:-translate-y-1">
            <Ribbon>Nivel actual</Ribbon>
            <div className="flex items-center gap-4 w-full">
              {/* Medalla de rango */}
              <span className="flex items-center justify-center h-12 w-12 rounded-full shadow" style={{ background: mockUser.levelRankColor + '22' }}>
                <Award className="h-8 w-8" style={{ color: mockUser.levelRankColor }} />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  Nivel {mockUser.level}
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: mockUser.levelRankColor + '33', color: mockUser.levelRankColor }}>
                    {mockUser.levelRank}
                  </span>
                </h2>
                <div className="text-blue-700 font-semibold text-sm mb-1">{mockUser.levelDesc}</div>
              </div>
            </div>
            {/* Barra de progreso */}
            <div className="w-full mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">Progreso al siguiente nivel</span>
                <span className="text-xs text-blue-700 font-semibold">{Math.round(mockUser.levelProgress * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(mockUser.levelProgress * 100)}%`, background: `linear-gradient(90deg, ${mockUser.levelRankColor} 60%, #b4b4b4 100%)` }}
                />
              </div>
            </div>
            <p className="text-gray-600 text-xs w-full mt-2">¡Sigue participando para subir de nivel y desbloquear más logros!</p>
          </div>
        </div>
      </div>
    </div>
    </AdaptiveLoading>
  )
} 