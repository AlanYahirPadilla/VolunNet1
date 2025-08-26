"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Trash2, Calendar, MapPin, Users, AlertCircle, CheckCircle, Heart, Home, Bell, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getCurrentUser } from "@/app/auth/actions"

interface EventData {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  country: string
  startDate: string
  endDate: string
  maxVolunteers: number
  skills: string[]
  requirements: string[]
  benefits: string[]
  categoryId: string
  status: string
  organization_name?: string
  category_name?: string
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    loadUser()
    loadEventData()
  }, [params.id])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const loadEventData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar categorías
      const categoriesResponse = await fetch("/api/events/categories")
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        if (categoriesData?.categories) {
          setCategories(categoriesData.categories)
        }
      }

      // Cargar datos del evento
      const eventResponse = await fetch(`/api/events/${params.id}`)
      if (eventResponse.ok) {
        const eventData = await eventResponse.json()
        if (eventData?.event) {
          // Formatear fechas para input type="date"
          const formattedEvent = {
            ...eventData.event,
            startDate: eventData.event.startDate ? new Date(eventData.event.startDate).toISOString().split('T')[0] : '',
            endDate: eventData.event.endDate ? new Date(eventData.event.endDate).toISOString().split('T')[0] : ''
          }
          setEvent(formattedEvent)
        } else {
          setError("Evento no encontrado")
        }
      } else {
        setError("Error al cargar el evento")
      }
    } catch (error) {
      console.error("Error loading event data:", error)
      setError("Error al cargar los datos del evento")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!event) return
    
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validaciones básicas
      if (!event.title.trim()) {
        setError("El título es obligatorio")
        return
      }
      if (!event.description.trim()) {
        setError("La descripción es obligatoria")
        return
      }
      if (!event.city.trim()) {
        setError("La ciudad es obligatoria")
        return
      }
      if (!event.startDate) {
        setError("La fecha de inicio es obligatoria")
        return
      }
      if (!event.endDate) {
        setError("La fecha de fin es obligatoria")
        return
      }
      if (new Date(event.startDate) >= new Date(event.endDate)) {
        setError("La fecha de fin debe ser posterior a la fecha de inicio")
        return
      }
      if (event.maxVolunteers <= 0) {
        setError("El número máximo de voluntarios debe ser mayor a 0")
        return
      }

      // Preparar datos para enviar
      const eventDataToSend = {
        ...event,
        startDate: new Date(event.startDate).toISOString(),
        endDate: new Date(event.endDate).toISOString(),
      }

      console.log("=== Enviando datos del evento ===")
      console.log("Event ID:", event.id)
      console.log("Category ID:", event.categoryId)
      console.log("Datos completos:", eventDataToSend)

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDataToSend),
      })

      if (response.ok) {
        setSuccess("Evento actualizado correctamente")
        setTimeout(() => {
          router.push('/organizaciones/dashboard')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al guardar el evento')
      }
    } catch (error) {
      console.error("Error saving event:", error)
      setError('Error al guardar el evento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) return
    
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess("Evento eliminado correctamente")
        setTimeout(() => {
          router.push('/organizaciones/dashboard')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al eliminar el evento')
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      setError('Error al eliminar el evento')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h2>
          <p className="text-gray-600 mb-6">El evento que buscas no existe o no tienes permisos para editarlo.</p>
          <Link href="/organizaciones/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header superior tipo LinkedIn */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo con corazón azul */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 focus:outline-none">
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
            </Link>
          </div>
          
          {/* Navegación */}
          <div className="flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link href="/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Inicio</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/eventos/buscar" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Calendar className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Eventos</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/organizaciones/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg text-blue-700 bg-blue-50 transition group relative">
                <Users className="h-5 w-5 text-blue-700 transition" />
                <span>Organizaciones</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 w-full rounded-full"></span>
              </Link>
            </nav>
            
            {/* Separador visual */}
            <div className="w-px h-8 bg-gray-200 mx-2" />
            
            {/* Avatar usuario con menú */}
            <div className="relative">
              <button
                className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Abrir menú de usuario"
              >
                {user?.firstName?.[0] || 'U'}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-gray-800 text-sm">{user?.firstName || 'Usuario'} {user?.lastName || ''}</div>
                    <div className="text-xs text-gray-500">{user?.email || 'usuario@volunnet.com'}</div>
                  </div>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    Perfil
                  </Link>
                  <Link
                    href="/configuracion"
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    Configuración
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-xl transition"
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      router.push("/");
                    }}
                  >
                    <LogOut className="h-4 w-4 text-gray-500" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header de la página */}
      <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-md border-b border-blue-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/organizaciones/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 group">
                <span className="text-lg">←</span>
                <span>Volver al Dashboard</span>
              </Link>
              <div className="h-8 w-px bg-gray-300/50" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Editar Evento
                </h1>
                <p className="text-sm text-gray-600 mt-1">Modifica la información de tu evento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDelete}
                disabled={saving}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 transition-all duration-200 group"
              >
                <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Eliminar Evento
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alertas */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Información del Evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Título */}
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Título del evento *</Label>
                    <Input
                      id="title"
                      value={event.title}
                      onChange={(e) => setEvent({ ...event, title: e.target.value })}
                      placeholder="Ej: Limpieza de Playa Vallarta"
                      className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={event.description}
                      onChange={(e) => setEvent({ ...event, description: e.target.value })}
                      placeholder="Describe detalladamente tu evento, qué harán los voluntarios, qué impacto tendrá..."
                      className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  {/* Ubicación */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      Ubicación
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-xs text-gray-600">Ciudad *</Label>
                        <Input
                          id="city"
                          value={event.city}
                          onChange={(e) => setEvent({ ...event, city: e.target.value })}
                          placeholder="Guadalajara"
                          className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-xs text-gray-600">Estado *</Label>
                        <Input
                          id="state"
                          value={event.state}
                          onChange={(e) => setEvent({ ...event, state: e.target.value })}
                          placeholder="Jalisco"
                          className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-xs text-gray-600">País</Label>
                        <Input
                          id="country"
                          value={event.country}
                          onChange={(e) => setEvent({ ...event, country: e.target.value })}
                          placeholder="México"
                          className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Fechas del Evento
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="text-xs text-gray-600">Fecha de inicio *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={event.startDate}
                          onChange={(e) => setEvent({ ...event, startDate: e.target.value })}
                          className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="text-xs text-gray-600">Fecha de fin *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={event.endDate}
                          onChange={(e) => setEvent({ ...event, endDate: e.target.value })}
                          className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Capacidad */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-green-500" />
                      Capacidad
                    </Label>
                    <div>
                      <Label htmlFor="maxVolunteers" className="text-xs text-gray-600">Número máximo de voluntarios *</Label>
                      <Input
                        id="maxVolunteers"
                        type="number"
                        min="1"
                        value={event.maxVolunteers}
                        onChange={(e) => setEvent({ ...event, maxVolunteers: parseInt(e.target.value) || 0 })}
                        placeholder="10"
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Categoría y Estado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700">Categoría</Label>
                      <Select value={event.categoryId} onValueChange={(value) => setEvent({ ...event, categoryId: value })}>
                        <SelectTrigger className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <span>{c.icon}</span>
                                <span>{c.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</Label>
                      <Select value={event.status} onValueChange={(value) => setEvent({ ...event, status: value })}>
                        <SelectTrigger className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">
                            <Badge variant="secondary">Borrador</Badge>
                          </SelectItem>
                          <SelectItem value="PUBLISHED">
                            <Badge className="bg-green-100 text-green-700">Publicado</Badge>
                          </SelectItem>
                          <SelectItem value="ONGOING">
                            <Badge className="bg-blue-100 text-blue-700">En Proceso</Badge>
                          </SelectItem>
                          <SelectItem value="COMPLETED">
                            <Badge className="bg-purple-100 text-purple-700">Completado</Badge>
                          </SelectItem>
                          <SelectItem value="ARCHIVED">
                            <Badge className="bg-gray-100 text-gray-700">Archivado</Badge>
                          </SelectItem>
                          <SelectItem value="CANCELLED">
                            <Badge variant="destructive">Cancelado</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del evento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <CardTitle className="text-lg font-bold text-gray-900">Información del Evento</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ID del evento:</span>
                    <span className="text-sm font-mono text-gray-900">{event.id}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Organización:</span>
                    <span className="text-sm font-medium text-gray-900">{event.organization_name || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Categoría:</span>
                    <span className="text-sm font-medium text-gray-900">{event.category_name || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado actual:</span>
                    <Badge 
                      variant={event.status === 'PUBLISHED' ? 'default' : event.status === 'CANCELLED' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {event.status === 'PUBLISHED' ? 'Publicado' : event.status === 'CANCELLED' ? 'Cancelado' : 'Borrador'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Consejos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">💡 Consejos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <strong>• Título claro:</strong> Usa un título descriptivo y atractivo
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>• Descripción detallada:</strong> Explica qué harán los voluntarios
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>• Fechas realistas:</strong> Asegúrate de que las fechas sean correctas
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>• Capacidad adecuada:</strong> Define un número razonable de voluntarios
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 