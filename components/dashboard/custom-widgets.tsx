"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Clock, Users, TrendingUp, Calendar, MapPin, Star, Heart, Target, Zap } from "lucide-react"

interface CustomWidgetsProps {
  stats: {
    completed_events: number
    total_hours: number
    total_applications: number
    accepted_applications: number
  } | null
  upcomingEvents: Array<{
    id: string
    title: string
    date: string
    location: string
  }>
}

export function CustomWidgets({ stats, upcomingEvents, voluntario }: CustomWidgetsProps & { voluntario?: any }) {
  const successRate = stats?.total_applications
    ? Math.round((stats.accepted_applications / stats.total_applications) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards con colores personalizados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Eventos Completados */}
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Eventos</p>
                <p className="text-2xl font-bold text-slate-800">{stats?.completed_events || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Completados</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horas Voluntariado */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-700 text-sm font-medium">Horas</p>
                <p className="text-2xl font-bold text-emerald-800">{stats?.total_hours || 0}</p>
                <p className="text-xs text-emerald-600 mt-1">De servicio</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aplicaciones */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-700 text-sm font-medium">Aplicaciones</p>
                <p className="text-2xl font-bold text-amber-800">{stats?.total_applications || 0}</p>
                <p className="text-xs text-amber-600 mt-1">Enviadas</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Éxito */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-700 text-sm font-medium">Éxito</p>
                <p className="text-2xl font-bold text-violet-800">{successRate}%</p>
                <p className="text-xs text-violet-600 mt-1">Aceptación</p>
              </div>
              <div className="p-2 bg-violet-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widget de Progreso del Perfil */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg text-gray-800">
            <Target className="h-5 w-5 mr-2 text-indigo-600" />
            Progreso del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Completado</span>
              <span className="text-sm font-bold text-indigo-600">75%</span>
            </div>
            <Progress value={75} className="h-2 bg-gray-200" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <span className="text-xs text-gray-600">Info básica</span>
                <Badge className="bg-green-100 text-green-700 text-xs border-green-200">✓</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <span className="text-xs text-gray-600">Habilidades</span>
                <Badge className="bg-amber-100 text-amber-700 text-xs border-amber-200">Pendiente</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <span className="text-xs text-gray-600">Foto</span>
                <Badge className="bg-amber-100 text-amber-700 text-xs border-amber-200">Pendiente</Badge>
              </div>
            </div>
            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
              Completar ahora
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Widget de Próximos Eventos */}
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg text-gray-800">
            <Calendar className="h-5 w-5 mr-2 text-rose-600" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center p-3 bg-white rounded-lg border border-rose-100 hover:border-rose-200 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {event.date}
                      <MapPin className="h-3 w-3 ml-3 mr-1" />
                      {event.location}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-rose-200 hover:bg-rose-50 bg-transparent"
                  >
                    Ver
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                Ver todos los eventos
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-10 w-10 text-rose-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-3">No tienes eventos próximos</p>
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                Explorar eventos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Widget de Acciones Rápidas */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg text-gray-800">
            <Zap className="h-5 w-5 mr-2 text-cyan-600" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-white hover:bg-cyan-50 border-cyan-200"
          >
            <Calendar className="h-4 w-4 mr-3 text-cyan-600" />
            <span className="text-gray-700">Mis Eventos</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-white hover:bg-cyan-50 border-cyan-200"
          >
            <Users className="h-4 w-4 mr-3 text-cyan-600" />
            <span className="text-gray-700">Buscar Voluntarios</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-white hover:bg-cyan-50 border-cyan-200"
          >
            <Award className="h-4 w-4 mr-3 text-cyan-600" />
            <span className="text-gray-700">Ver Logros</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-white hover:bg-cyan-50 border-cyan-200"
          >
            <Heart className="h-4 w-4 mr-3 text-cyan-600" />
            <span className="text-gray-700">Mis Favoritos</span>
          </Button>
        </CardContent>
      </Card>

      {/* Widget de Actividad Reciente */}
      <Card className="bg-gradient-to-br from-stone-50 to-neutral-50 border-stone-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg text-gray-800">
            <Star className="h-5 w-5 mr-2 text-stone-600" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-stone-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Te registraste en "Limpieza de Playa"</p>
                <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-stone-100">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Completaste "Taller de Programación"</p>
                <p className="text-xs text-gray-500 mt-1">Ayer</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-stone-100">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Recibiste una nueva recomendación</p>
                <p className="text-xs text-gray-500 mt-1">Hace 3 días</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-stone-600 hover:text-stone-700 hover:bg-stone-50">
              Ver toda la actividad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reemplaza el widget de estadísticas del mes por uno funcional y dinámico */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-base text-gray-800">
            <span className="text-purple-500 font-bold text-xl mr-2">+</span>
            Estadísticas del Mes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
            <span className="flex items-center gap-2 text-blue-700 text-sm font-medium">
              <Clock className="h-4 w-4" /> Eventos completados
            </span>
            <span className="font-bold text-blue-700 text-base">{voluntario?.eventsParticipated ?? stats?.completed_events ?? 0}</span>
          </div>
          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
            <span className="flex items-center gap-2 text-green-700 text-sm font-medium">
              <Clock className="h-4 w-4" /> Horas servidas
            </span>
            <span className="font-bold text-green-700 text-base">{voluntario?.hoursCompleted ?? stats?.total_hours ?? 0}</span>
          </div>
          <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
            <span className="flex items-center gap-2 text-purple-700 text-sm font-medium">
              <Users className="h-4 w-4" /> Nuevos amigos
            </span>
            <span className="font-bold text-purple-700 text-base"> </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
