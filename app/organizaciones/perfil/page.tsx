"use client"
import { Star, Edit, Lock, Calendar, Clock, Award, MapPin, Heart, Home, Users, Bell, User, Settings, LogOut, CheckCircle2, AlertCircle, Share2, BadgeCheck, UserCheck, FileDown, Upload, Briefcase, Link as LinkIcon, PlusCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdaptiveLoading } from "@/components/ui/adaptive-loading"
import ProfileCompletionCard from "@/components/registro/profile-completion-card"
import ProfileEditModal from "@/components/registro/profile-edit-modal-organizacion"; 
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";


const mockOrganizer = {
  nombre: "Organización de Ayuda Comunitaria A.C.",
  emailContacto: "contacto@ayudacomunitaria.org",
  telefonoContacto: "+52 33 1234 5678",
  ciudadEstadoPais: "Tlaquepaque, Jalisco, México",
  categoria: "ONG", 
  descripcion: "Somos una organización sin fines de lucro dedicada a mejorar la calidad de vida en nuestra comunidad a través de programas educativos y de asistencia social.",
  sitioWeb: "https://www.ayudacomunitaria.org",
  redesSociales: [
    "https://facebook.com/ayudacomunitaria",
    "https://twitter.com/ayudacomunitaria"
  ],
  verificado: true,
  eventosCreados: 25, // "eventosCreados"
  voluntariosAyudados: 150, // "voluntariosAyudados"
  preferenciasVoluntario: ["skills_educacion", "edad_18-30"], //  "preferenciasVoluntario"
  rating: 4.9, 
};

// Catálogo de categorías/intereses (reused or adapted)
const CATEGORIAS = [
  { id: "ONG", nombre: "ONG" },
  { id: "iglesia", nombre: "Iglesia" },
  { id: "empresa", nombre: "Empresa" },
  { id: "gubernamental", nombre: "Gubernamental" },
  { id: "escuela", nombre: "Escuela" },
];

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
        {user?.firstName?.[0] || 'O'} {}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-800 text-sm">{user?.name || 'Organizador'}</div>
            <div className="text-xs text-gray-500">{user?.email || 'organizador@ejemplo.com'}</div>
          </div>
          <Link href="/perfil-organizador" className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"><User className="h-4 w-4 text-gray-500" />Perfil</Link>
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

function Ribbon({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute -top-3 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">
      {children}
    </div>
  );
}

export default function PerfilOrganizador() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [organizador, setOrganizador] = useState<any>(null); 
  const [editData, setEditData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/perfil/organizador", { credentials: "include" })
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
        setOrganizador(data.organizador || mockOrganizer); 
        setEditData(data.organizador || mockOrganizer); 
        setLoading(false);
      });
  }, []);

  const loadingSteps = [
    { id: "perfil", label: "Preparando perfil de organizador...", status: (loading ? "loading" : "completed") as "loading" | "completed" },
  ];


  const profileChecklist = organizador ? [
    { label: "Foto de perfil", completed: !!user?.avatar, link: "/perfil-organizador" },
    { label: "Nombre de la organización", completed: !!organizador.nombre, link: "/perfil-organizador" },
    { label: "Descripción", completed: !!organizador.descripcion, link: "/perfil-organizador" },
    { label: "Categoría", completed: !!organizador.categoria, link: "/perfil-organizador" },
    { label: "Sitio Web", completed: !!organizador.sitioWeb, link: "/perfil-organizador" },
    { label: "Contacto Email", completed: !!organizador.emailContacto, link: "/perfil-organizador" },
    { label: "Contacto Telefónico", completed: !!organizador.telefonoContacto, link: "/perfil-organizador" },
    { label: "Ubicación", completed: !!organizador.ciudadEstadoPais, link: "/perfil-organizador" },
    { label: "Redes Sociales", completed: Array.isArray(organizador.redesSociales) && organizador.redesSociales.length > 0, link: "/perfil-organizador" },
    { label: "Verificación de email", completed: user?.verified, link: "/configuracion" },
    { label: "Perfil Verificado", completed: organizador.verificado, link: "/perfil-organizador" },
  ] : [];

  const completedCount = profileChecklist.filter(i => i.completed).length;
  const completion = profileChecklist.length > 0 ? Math.round((completedCount / profileChecklist.length) * 100) : 0;

  // Formulario de edición 
  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/perfil/organizador", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
      credentials: "include"
    });
    const res = await fetch("/api/perfil/organizador", { credentials: "include" });
    const data = await res.json();
    setOrganizador(data.organizador);
    setEditMode(false);
    setSaving(false);
  };

  return (
    <AdaptiveLoading isLoading={loading} type="dashboard" loadingSteps={loadingSteps}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 w-full">
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
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
            <div className="flex-1 mx-8 max-w-xl">
              <input
                type="text"
                placeholder="Buscar eventos, organizaciones..."
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-700 shadow-sm"
              />
            </div>
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
              <div className="w-px h-8 bg-gray-200 mx-2" />
              <UserMenu user={user} />
            </div>
          </div>
        </div>

        {/* Layout de dos columnas en desktop */}
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-12 md:mt-16 px-4 md:px-0 z-20">
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-gray-200/70 z-10" style={{transform: 'translateX(-50%)'}} />

          {/* Columna izquierda: Card principal grande */}
          <div className="flex-[2.1] min-w-[380px] max-w-3xl flex flex-col gap-5 relative z-20">
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-2xl rounded-2xl p-8 flex flex-row items-center gap-10 w-full min-h-[240px] transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(80,80,200,0.18)] hover:-translate-y-1">
              <div className="absolute top-4 right-6 flex gap-2 z-20">
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold shadow hover:from-blue-600 hover:to-purple-700 transition-all"
                  title="Compartir perfil"
                  onClick={() => window.alert("Próximamente podrás compartir el perfil de tu organización")}
                >
                  <Share2 className="h-4 w-4" /> Compartir
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-semibold shadow hover:from-blue-500 hover:to-purple-600 transition-all"
                  title="Descargar perfil en PDF"
                  onClick={() => window.alert("Próximamente podrás descargar el perfil de tu organización en PDF")}
                >
                  <FileDown className="h-4 w-4" /> PDF
                </button>
              </div>

              {/* Avatar grande con botón editar */}
              <div className="relative flex-shrink-0" style={{ marginTop: '-5.5rem' }}>
                <div className="h-32 w-32 md:h-36 md:w-36 rounded-full bg-gray-200 border-8 border-white shadow-2xl flex items-center justify-center text-6xl text-blue-600 font-bold overflow-hidden transition-shadow duration-200">
                  {user?.avatar ? ( 
                    <img src={user.avatar} alt="Logo de Organización" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    organizador?.nombre?.[0] || 'O' 
                  )}
                </div>
                <button
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition"
                  title="Editar logo de organización"
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-0 truncate leading-tight">
                    {organizador?.nombre || 'Nombre de la Organización'}
                  </h1>
                  {organizador?.verificado && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700" title="Organización verificada">
                      <BadgeCheck className="h-4 w-4 text-blue-500" /> Verificado
                    </span>
                  )}
                </div>

                {/*  Email */}
                <div className="flex items-center gap-2 text-base text-gray-500 mb-0 truncate">
                  {user?.email || 'contacto@organizacion.org'}
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

                {/* Localizacion */}
                <div className="flex items-center gap-2 mb-1 mt-0.5">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-500">
                    {organizador?.ciudadEstadoPais || 'Guadalajara, Jalisco, México'}
                  </span>
                </div>

                {/* Descripcion */}
                <div className="text-sm text-gray-600 italic mb-1">
                  {organizador?.tagline || 'Descripción de la organización...'}
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-2 mt-1">
                  {[...Array(5)].map((_, i) => {
                    const rating = organizador?.rating ?? 0;
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
                  <span className="ml-1 text-yellow-500 font-semibold text-sm">{(organizador?.rating ?? 0).toFixed(1)}</span>
                </div>

                {/* Categoria */}
                <div className="w-full flex flex-wrap gap-2 mt-1 mb-2">
                  {Array.isArray(organizador?.categoria) && organizador.categoria.length > 0 ? (
                    organizador.categoria.map((cat: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-semibold shadow-sm border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all cursor-pointer">
                        {CATEGORIAS.find(c => c.id === cat)?.nombre || cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm ml-2">- No hay categorías añadidas -</span>
                  )}
                </div>

                <div className="w-full flex flex-wrap gap-2 mt-8 border-t border-purple-200 pt-4 justify-center md:justify-start">
                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    type="button"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit className="h-4 w-4" /> Editar perfil
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-blue-400 text-blue-700 font-semibold bg-white shadow hover:bg-blue-50 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-2 focus:ring-blue-200"
                    type="button"
                    onClick={() => router.push('/eventos/crear')} 
                  >
                    <PlusCircle className="h-4 w-4" /> Crear evento
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-blue-400 text-blue-700 font-semibold bg-white shadow hover:bg-blue-50 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="button"
                  >
                    <Lock className="h-4 w-4" /> Cambiar contraseña
                  </button>
                </div>
              </div>
            </div>

            {/* "Sobre mí" */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Sobre la Organización</h2>
              </div>
              <p className="text-gray-600 text-sm mb-2">{organizador?.descripcion || 'Aún no has añadido una descripción para tu organización.'}</p>
              <div className="text-sm text-gray-600 italic">
                {organizador?.sitioWeb && (
                  <Link href={organizador.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" /> Sitio Web: {organizador.sitioWeb}
                  </Link>
                )}
              </div>
            </div>

            {/* Card Métricas (Eventos Creados, Voluntarios Ayudados) */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Actividad Reciente</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Eventos creados:</span> {organizador?.eventosCreados ?? 0}
                </div>
                <div>
                  <span className="font-semibold">Voluntarios ayudados:</span> {organizador?.voluntariosAyudados ?? 0}
                </div>
              </div>
            </div>

            {/* Card Información de Contacto */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Información de Contacto</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span className="font-semibold">Correo de contacto:</span> {organizador?.emailContacto || ''}</div>
                <div><span className="font-semibold">Teléfono de contacto:</span> {organizador?.telefonoContacto || ''}</div>
                <div><span className="font-semibold">Ubicación:</span> {organizador?.ciudadEstadoPais || ''}</div>
                {organizador?.latitudLongitud && (
                  <div>
                    <span className="font-semibold">Ubicación GPS:</span> {Array.isArray(organizador.latitudLongitud) ? `${organizador.latitudLongitud[0]}, ${organizador.latitudLongitud[1]}` : organizador.latitudLongitud}
                  </div>
                )}
              </div>
            </div>

            {/* Card Preferencias de Voluntario  */}
            {Array.isArray(organizador?.preferenciasVoluntario) && organizador.preferenciasVoluntario.length > 0 && (
              <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-purple-200 pb-1">Buscamos Voluntarios con</h2>
                </div>
                <div className="flex flex-wrap gap-3 mb-2">
                  {organizador.preferenciasVoluntario.map((pref: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200">{pref}</span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Columna derecha: Card de Nivel y Progreso de Perfil */}
          <div className="flex-[0.5] flex flex-col gap-6 min-w-[200px] max-w-xs relative z-20">
            <ProfileCompletionCard completion={completion} checklist={profileChecklist} />
            {/* Card Redes sociales */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-xl rounded-2xl p-6 w-full">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 pb-1">Redes sociales</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {Array.isArray(organizador?.redesSociales) && organizador.redesSociales.length > 0 ? (
                  organizador.redesSociales.map((url: string, idx: number) => {
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
                  <span className="text-gray-400 ml-2">- No hay redes sociales añadidas -</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de edición de perfil  */}
        <ProfileEditModal
          open={editMode}
          onClose={() => setEditMode(false)}
          initialData={{ ...user, ...organizador }} 
          onSave={async (data: any) => {
            setSaving(true);
            
            await fetch("/api/perfil/organizador", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
              credentials: "include"
            });
            const res = await fetch("/api/perfil/organizador", { credentials: "include" });
            const updated = await res.json();
            setUser(updated.user);
            setOrganizador(updated.organizador);
            setEditMode(false);
            setSaving(false);
          }}
        />

        <div className="max-w-2xl mx-auto my-4 flex justify-end">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => setEditMode(true)}>Editar perfil</button>
        </div>
      </div>
    </AdaptiveLoading>
  )
}