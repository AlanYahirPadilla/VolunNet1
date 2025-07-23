"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, Home, Calendar, Users, Bell, LogOut, User, Settings, PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/app/auth/actions"

// Mock de eventos del organizador
const mockEvents = [
  {
    id: "org-1",
    title: "Jornada de Donación de Sangre",
    description: "Organiza una jornada de donación en tu comunidad.",
    date: "2024-07-10",
    city: "Guadalajara",
    state: "Jalisco",
    postulaciones: 5,
    status: "Activo",
  },
  {
    id: "org-2",
    title: "Recolección de Ropa de Invierno",
    description: "Campaña para recolectar ropa para personas vulnerables.",
    date: "2024-08-01",
    city: "Zapopan",
    state: "Jalisco",
    postulaciones: 2,
    status: "Activo",
  },
]

const mockPostulaciones = [
  {
    id: "post-1",
    event: "Jornada de Donación de Sangre",
    postulante: "Ana Martínez",
    estado: "Pendiente",
  },
  {
    id: "post-2",
    event: "Recolección de Ropa de Invierno",
    postulante: "Carlos Ruiz",
    estado: "Aceptado",
  },
]

// Mock de datos de organización solo para averageRating
const mockOrganization = {
  averageRating: 4.5,
}

const mockStats = {
  totalEventos: 2,
  postulaciones: 7,
  voluntarios: 5,
  averageRating: 4.5,
}

export default function OrganizadorDashboard() {
  const [tab, setTab] = useState("mis-eventos")
  const [organizationName, setOrganizationName] = useState(mockOrganization.name)
  const [organizationEmail, setOrganizationEmail] = useState("")

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser()
      if (user?.firstName) setOrganizationName(user.firstName)
      if (user?.email) setOrganizationEmail(user.email)
    })()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header superior */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
          </div>
          {/* Navegación */}
          <div className="flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link href="/organizaciones/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Inicio</span>
              </Link>
              <Link href="/organizaciones/dashboard?tab=mis-eventos" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Calendar className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Mis Eventos</span>
              </Link>
              <Link href="/organizaciones/dashboard?tab=postulaciones" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Users className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Postulaciones</span>
              </Link>
              <Link href="/organizaciones/dashboard?tab=estadisticas" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Estadísticas</span>
              </Link>
            </nav>
            {/* Separador visual */}
            <div className="w-px h-8 bg-gray-200 mx-2" />
            {/* Avatar usuario con menú */}
            <UserMenu organizationName={organizationName} organizationEmail={organizationEmail} />
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 py-6 grid grid-cols-1 md:grid-cols-[minmax(0,320px)_1fr_minmax(0,320px)] gap-6">
        {/* Sidebar izquierda */}
        <div className="space-y-6 w-full max-w-xs mx-auto">
          {/* Perfil organizador */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-50 relative overflow-visible"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.025 }}
          >
            <div className="relative mb-3">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 border-4 border-white shadow-lg flex items-center justify-center text-4xl text-blue-500 font-bold">
                {(organizationName && organizationName.length > 0) ? organizationName[0] : 'O'}
              </div>
              <span className="absolute -bottom-2 right-0 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full shadow font-semibold border-2 border-white">Organizador</span>
            </div>
            <div className="text-lg font-bold text-gray-900 text-center">{organizationName}</div>
            <div className="text-xs text-gray-500 mb-2">{organizationEmail}</div>
            {/* Estrellas de calificación */}
            <div className="flex gap-1 mb-2 mt-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`h-5 w-5 ${i < Math.floor(mockOrganization.averageRating) ? 'text-yellow-400 fill-yellow-300' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.7 4.8,17.6 9.9,14.6 15,17.6 13.8,11.7 18.2,7.6 12.2,6.6" /></svg>
              ))}
              <span className="ml-1 text-yellow-500 font-semibold text-sm">{mockOrganization.averageRating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-purple-600 font-medium mb-1">Panel de Control</div>
            <div className="flex gap-3 mt-2 text-xs w-full justify-center">
              <div className="flex flex-col items-center">
                <span className="font-bold text-blue-700 text-base">{mockStats.totalEventos}</span>
                <span className="text-gray-500">Eventos</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-green-600 text-base">{mockStats.postulaciones}</span>
                <span className="text-gray-500">Postulaciones</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-purple-700 text-base">{mockStats.voluntarios}</span>
                <span className="text-gray-500">Voluntarios</span>
              </div>
            </div>
          </motion.div>
          {/* Tarjeta de estadísticas debajo */}
          <Card className="bg-white rounded-2xl shadow-lg border border-blue-50 mt-6">
            <CardHeader>
              <CardTitle>Estadísticas de la Organización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-blue-700 font-medium">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Eventos creados
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-100 rounded px-2 py-0.5">{mockStats.totalEventos}</span>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-green-700 font-medium">
                    <Users className="h-4 w-4 text-green-500" />
                    Postulaciones recibidas
                  </span>
                  <span className="font-bold text-green-700 bg-green-100 rounded px-2 py-0.5">{mockStats.postulaciones}</span>
                </div>
                <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-violet-700 font-medium">
                    <User className="h-4 w-4 text-violet-500" />
                    Voluntarios únicos
                  </span>
                  <span className="font-bold text-violet-700 bg-purple-100 rounded px-2 py-0.5">{mockStats.voluntarios}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna central: Tabs */}
        <div className="space-y-6 col-span-1">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full bg-gray-50 border rounded-lg mb-4">
              <TabsTrigger value="mis-eventos" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Mis Eventos</TabsTrigger>
              <TabsTrigger value="postulaciones" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Postulaciones</TabsTrigger>
              <TabsTrigger value="estadisticas" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Estadísticas</TabsTrigger>
            </TabsList>
            <TabsContent value="mis-eventos">
              <div className="flex justify-end mb-4">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <PlusCircle className="h-5 w-5" /> Crear Evento
                </Button>
              </div>
              <div className="space-y-5">
                {mockEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="bg-white rounded-3xl shadow-lg border border-blue-50 p-7 flex flex-col gap-3"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.025 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl mr-1">🏢</span>
                      <span className="font-bold text-blue-700 text-lg leading-tight">{event.title}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 ml-2 font-semibold">{event.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      {event.date} - {event.city}, {event.state}
                    </div>
                    <div className="text-sm text-gray-700 mb-2 line-clamp-2">{event.description}</div>
                    <div className="flex items-center gap-4 text-xs mb-2">
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <Users className="h-3 w-3 text-green-500" />
                        {event.postulaciones} postulaciones
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all">Ver Detalles</Button>
                      <Button size="sm" variant="outline" className="rounded-full px-5 py-2 font-semibold border-gray-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all">Editar</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="postulaciones">
              <div className="space-y-5">
                {mockPostulaciones.map((post) => (
                  <motion.div
                    key={post.id}
                    className="bg-white rounded-2xl shadow border border-blue-50 p-5 flex flex-col gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-blue-700">{post.postulante}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5 ml-2 font-semibold">{post.estado}</span>
                    </div>
                    <div className="text-xs text-gray-500">Evento: {post.event}</div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm">Ver Perfil</Button>
                      <Button size="sm" variant="outline" className="rounded-full px-5 py-2 font-semibold border-gray-300 text-blue-700 bg-blue-50">Aceptar</Button>
                      <Button size="sm" variant="ghost" className="rounded-full px-5 py-2 font-semibold text-red-600">Rechazar</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="estadisticas">
              <Card className="bg-white rounded-2xl shadow-lg border border-blue-50">
                <CardHeader>
                  <CardTitle>Estadísticas de la Organización</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 text-sm">
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                      <span className="flex items-center gap-2 text-blue-700 font-medium">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Eventos creados
                      </span>
                      <span className="font-bold text-blue-700 bg-blue-100 rounded px-2 py-0.5">{mockStats.totalEventos}</span>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                      <span className="flex items-center gap-2 text-green-700 font-medium">
                        <Users className="h-4 w-4 text-green-500" />
                        Postulaciones recibidas
                      </span>
                      <span className="font-bold text-green-700 bg-green-100 rounded px-2 py-0.5">{mockStats.postulaciones}</span>
                    </div>
                    <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                      <span className="flex items-center gap-2 text-violet-700 font-medium">
                        <User className="h-4 w-4 text-violet-500" />
                        Voluntarios únicos
                      </span>
                      <span className="font-bold text-violet-700 bg-purple-100 rounded px-2 py-0.5">{mockStats.voluntarios}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Columna derecha: espacio para widgets futuros */}
        <div className="space-y-6 w-full max-w-xs mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50 flex flex-col items-center justify-center min-h-[200px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.13 }}
            whileHover={{ scale: 1.025 }}
          >
            <div className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              Notificaciones (próximamente)
            </div>
            <div className="text-gray-500 text-xs text-center">Aquí verás notificaciones relevantes para tu organización.</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function UserMenu({ organizationName, organizationEmail }: { organizationName: string, organizationEmail: string }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <User className="h-7 w-7 text-blue-500" />
        <span className="font-medium text-gray-700">Organizador</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-800 text-sm">{organizationName}</div>
            <div className="text-xs text-gray-500">{organizationEmail}</div>
          </div>
          <Link
            href="/organizaciones/perfil"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
          >
            <User className="h-4 w-4 text-gray-500" />
            Perfil
          </Link>
          <Link href="/organizaciones/configuracion" className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"><Settings className="h-4 w-4 text-gray-500" />Configuración</Link>
          <div className="border-t border-gray-100 my-1" />
          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-xl transition" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}><LogOut className="h-4 w-4 text-gray-500" />Cerrar sesión</button>
        </div>
      )}
    </div>
  )
} 