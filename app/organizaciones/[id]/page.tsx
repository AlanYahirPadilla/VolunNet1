"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, MapPin, Calendar, Users, Clock, Building, Star, ArrowLeft, Share2, Bookmark, Phone, Mail, Globe, Award, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Organization {
  id: string
  name: string
  description?: string
  email?: string
  phone?: string
  website?: string
  verified: boolean
  rating?: number
  totalEvents?: number
  city?: string
  state?: string
  country?: string
  address?: string
  founded?: string
  mission?: string
  vision?: string
  categories?: string[]
  totalVolunteers?: number
  totalHours?: number
}

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  city: string
  state: string
  category_name: string
  currentVolunteers: number
  maxVolunteers: number
  status: string
}

export default function OrganizationProfile() {
  const params = useParams()
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrganizationDetails()
    }
  }, [params.id])

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true)
      
      // Mock data - en producción esto vendría de la API
      const mockOrganization: Organization = {
        id: params.id as string,
        name: "EcoMar Jalisco",
        description: "Organización dedicada a la conservación del medio ambiente y la promoción de actividades sostenibles en la región de Jalisco. Trabajamos con voluntarios comprometidos para crear un impacto positivo en nuestras comunidades.",
        email: "contacto@ecomarjalisco.org",
        phone: "+52 33 1234 5678",
        website: "www.ecomarjalisco.org",
        verified: true,
        rating: 4.5,
        totalEvents: 15,
        city: "Guadalajara",
        state: "Jalisco",
        country: "México",
        address: "Av. Vallarta 1234, Col. Americana",
        founded: "2020",
        mission: "Promover la conservación ambiental y el desarrollo sostenible a través de la participación ciudadana y la educación ambiental.",
        vision: "Ser la organización líder en la promoción de prácticas sostenibles y la conservación del medio ambiente en Jalisco.",
        categories: ["Medio Ambiente", "Educación", "Salud", "Arte y Cultura"],
        totalVolunteers: 245,
        totalHours: 1847
      }

      const mockEvents: Event[] = [
        {
          id: "1",
          title: "Limpieza de Playa Vallarta",
          description: "Actividad de limpieza en la playa principal de Puerto Vallarta",
          startDate: "2025-08-15T18:55:00Z",
          endDate: "2025-08-15T22:00:00Z",
          city: "Puerto Vallarta",
          state: "Jalisco",
          category_name: "Medio Ambiente",
          currentVolunteers: 8,
          maxVolunteers: 20,
          status: "ACTIVE"
        },
        {
          id: "2",
          title: "Taller de Programación para Niños",
          description: "Enseñanza básica de programación a niños de primaria",
          startDate: "2025-08-18T18:55:00Z",
          endDate: "2025-08-18T22:00:00Z",
          city: "Guadalajara",
          state: "Jalisco",
          category_name: "Educación",
          currentVolunteers: 3,
          maxVolunteers: 10,
          status: "ACTIVE"
        },
        {
          id: "3",
          title: "Clínica de Salud Comunitaria",
          description: "Proporcionar servicios básicos de salud y orientación médica",
          startDate: "2025-08-23T18:55:00Z",
          endDate: "2025-08-23T22:00:00Z",
          city: "Tlaquepaque",
          state: "Jalisco",
          category_name: "Salud",
          currentVolunteers: 9,
          maxVolunteers: 12,
          status: "ACTIVE"
        }
      ]

      setOrganization(mockOrganization)
      setEvents(mockEvents)
    } catch (error) {
      console.error("Error fetching organization details:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando organización...</span>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Organización no encontrada</h2>
          <Button onClick={() => router.push("/eventos/buscar")}>
            Volver a buscar eventos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Seguir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header de la organización */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="h-8 w-8 text-blue-500" />
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                      {organization.verified && (
                        <Badge className="bg-blue-100 text-blue-700 text-sm mt-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificada
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(organization.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-lg text-gray-600">({organization.rating})</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{organization.totalEvents} eventos organizados</span>
                  </div>

                  <p className="text-lg text-gray-700 leading-relaxed mb-6">{organization.description}</p>

                  {/* Información de contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organization.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <span className="text-gray-700">{organization.email}</span>
                      </div>
                    )}
                    {organization.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">{organization.phone}</span>
                      </div>
                    )}
                    {organization.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-purple-500" />
                        <span className="text-gray-700">{organization.website}</span>
                      </div>
                    )}
                    {organization.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-red-500" />
                        <span className="text-gray-700">{organization.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Misión y Visión */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Misión y Visión</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    Misión
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{organization.mission}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Visión
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{organization.vision}</p>
                </div>
              </div>
            </motion.div>

            {/* Estadísticas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Impacto en la Comunidad</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{organization.totalEvents}</div>
                  <div className="text-gray-600">Eventos Organizados</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">{organization.totalVolunteers}</div>
                  <div className="text-gray-600">Voluntarios Participantes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{organization.totalHours}</div>
                  <div className="text-gray-600">Horas de Servicio</div>
                </div>
              </div>
            </motion.div>

            {/* Categorías */}
            {organization.categories && organization.categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Áreas de Trabajo</h2>
                <div className="flex flex-wrap gap-3">
                  {organization.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                      {category}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información adicional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Información Adicional</h3>
              
              <div className="space-y-4">
                {organization.founded && (
                  <div>
                    <p className="text-sm text-gray-500">Fundada en</p>
                    <p className="font-medium text-gray-900">{organization.founded}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-medium text-gray-900">
                    {organization.city}, {organization.state}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Estado de verificación</p>
                  <div className="flex items-center gap-2 mt-1">
                    {organization.verified ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificada
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        En proceso
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Eventos recientes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Eventos Recientes</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                    <p className="text-xs text-gray-600">{event.city} • {formatDate(event.startDate)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {event.category_name}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {event.currentVolunteers}/{event.maxVolunteers} voluntarios
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver todos los eventos
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}




