"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Clock, 
  FileText, 
  Image, 
  Plus, 
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import React from "react"

// Tipos
interface EventFormData {
  // Información básica
  title: string
  description: string
  categoryId: string
  
  // Ubicación
  address: string
  city: string
  state: string
  country: string
  latitude?: number
  longitude?: number
  
  // Fechas
  startDate: Date | undefined
  endDate: Date | undefined
  
  // Capacidad
  maxVolunteers: number
  
  // Detalles
  skills: string[]
  requirements: string[]
  benefits: string[]
  
  // Imagen
  imageUrl?: string
}

// Categorías de eventos
const EVENT_CATEGORIES = [
  { id: "cat_1", name: "Educación", icon: "🎓", color: "bg-blue-100 text-blue-700" },
  { id: "cat_2", name: "Medio Ambiente", icon: "🌱", color: "bg-green-100 text-green-700" },
  { id: "cat_3", name: "Salud", icon: "❤️", color: "bg-red-100 text-red-700" },
  { id: "cat_4", name: "Alimentación", icon: "🍽️", color: "bg-orange-100 text-orange-700" },
  { id: "cat_5", name: "Tecnología", icon: "💻", color: "bg-purple-100 text-purple-700" },
  { id: "cat_6", name: "Deportes", icon: "🏆", color: "bg-yellow-100 text-yellow-700" },
  { id: "cat_7", name: "Arte y Cultura", icon: "🎨", color: "bg-pink-100 text-pink-700" },
  { id: "cat_8", name: "Construcción", icon: "🔨", color: "bg-gray-100 text-gray-700" },
]

// Habilidades disponibles
const AVAILABLE_SKILLS = [
  "Programación", "Diseño gráfico", "Comunicación", "Liderazgo", "Enseñanza",
  "Logística", "Fotografía", "Marketing", "Atención al cliente", "Redacción",
  "Música", "Arte", "Deportes", "Cocina", "Jardinería", "Construcción",
  "Mecánica", "Electricidad", "Plomería", "Carpintería"
]

const STEPS = [
  { id: 1, title: "Información Básica", icon: FileText },
  { id: 2, title: "Ubicación y Fechas", icon: MapPin },
  { id: 3, title: "Capacidad y Requisitos", icon: Users },
  { id: 4, title: "Detalles Adicionales", icon: Clock },
  { id: 5, title: "Revisión", icon: CheckCircle2 },
]

export default function CrearEventoPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    categoryId: "",
    address: "",
    city: "",
    state: "",
    country: "México",
    startDate: undefined,
    endDate: undefined,
    maxVolunteers: 10,
    skills: [],
    requirements: [],
    benefits: [],
  })

  // Cargar usuario actual
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error loading user:", error)
        router.push("/login")
      }
    }
    loadUser()
  }, [router])

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: 'skills' | 'requirements' | 'benefits', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }))
  }

  const removeArrayItem = (field: 'skills' | 'requirements' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      })

      if (response.ok) {
        await response.json()
        router.push(`/organizaciones/dashboard`)
      } else {
        throw new Error("Error creating event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Error al crear el evento. Por favor intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.categoryId
      case 2:
        return formData.address.trim() && formData.city.trim() && formData.state.trim() && formData.startDate && formData.endDate
      case 3:
        return formData.maxVolunteers > 0 && formData.requirements.length > 0 && formData.requirements.some(req => req.trim() !== "")
      case 4:
        return formData.skills.length > 0 && formData.benefits.length > 0
      default:
        return true
    }
  }

  if (loading) {
    return <LoadingScreen type="page" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Paso {currentStep} de {STEPS.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      currentStep > step.id
                        ? "bg-green-500 border-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      React.createElement(step.icon, { className: "h-5 w-5" })
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 hidden sm:block">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-16 h-0.5 mx-4 transition-all",
                      currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "h-6 w-6 text-blue-500" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title">Título del Evento *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateFormData("title", e.target.value)}
                        placeholder="Ej: Jornada de Limpieza Comunitaria"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descripción *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData("description", e.target.value)}
                        placeholder="Describe detalladamente el evento, qué se hará, por qué es importante..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label>Categoría *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        {EVENT_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => updateFormData("categoryId", category.id)}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all text-left",
                              formData.categoryId === category.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="text-2xl mb-2">{category.icon}</div>
                            <div className="font-medium text-sm">{category.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="address">Dirección *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => updateFormData("address", e.target.value)}
                          placeholder="Calle y número"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => updateFormData("city", e.target.value)}
                          placeholder="Ej: Guadalajara"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => updateFormData("state", e.target.value)}
                          placeholder="Ej: Jalisco"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">País</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => updateFormData("country", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Fecha de inicio *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !formData.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? format(formData.startDate, "PPP", { locale: es }) : "Selecciona fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date: Date | undefined) => updateFormData("startDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>Fecha de fin *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !formData.endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.endDate ? format(formData.endDate, "PPP", { locale: es }) : "Selecciona fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.endDate}
                              onSelect={(date: Date | undefined) => updateFormData("endDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="maxVolunteers">Número máximo de voluntarios *</Label>
                      <Input
                        id="maxVolunteers"
                        type="number"
                        min="1"
                        value={formData.maxVolunteers}
                        onChange={(e) => updateFormData("maxVolunteers", parseInt(e.target.value) || 1)}
                        className="mt-1 w-32"
                      />
                    </div>

                    <div>
                      <Label>Requisitos para voluntarios *</Label>
                      <div className="mt-2 space-y-2">
                        {formData.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={req}
                              onChange={(e) => {
                                const newReqs = [...formData.requirements]
                                newReqs[index] = e.target.value
                                updateFormData("requirements", newReqs)
                              }}
                              placeholder="Ej: Mayor de 18 años"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem("requirements", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addArrayItem("requirements", "")}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar requisito
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label>Habilidades necesarias *</Label>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeArrayItem("skills", index)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {AVAILABLE_SKILLS.filter(skill => !formData.skills.includes(skill)).map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => addArrayItem("skills", skill)}
                              className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Beneficios para voluntarios *</Label>
                      <div className="mt-2 space-y-2">
                        {formData.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={benefit}
                              onChange={(e) => {
                                const newBenefits = [...formData.benefits]
                                newBenefits[index] = e.target.value
                                updateFormData("benefits", newBenefits)
                              }}
                              placeholder="Ej: Certificado de participación"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem("benefits", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addArrayItem("benefits", "")}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar beneficio
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Resumen del Evento</h3>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>Título:</strong> {formData.title}</p>
                        <p><strong>Categoría:</strong> {EVENT_CATEGORIES.find(c => c.id === formData.categoryId)?.name}</p>
                        <p><strong>Ubicación:</strong> {formData.address}, {formData.city}, {formData.state}</p>
                        <p><strong>Fechas:</strong> {formData.startDate && format(formData.startDate, "PPP", { locale: es })} - {formData.endDate && format(formData.endDate, "PPP", { locale: es })}</p>
                        <p><strong>Voluntarios:</strong> Máximo {formData.maxVolunteers}</p>
                        <p><strong>Habilidades:</strong> {formData.skills.join(", ")}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Antes de publicar</span>
                      </div>
                      <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                        <li>• Revisa que toda la información sea correcta</li>
                        <li>• Asegúrate de que las fechas sean apropiadas</li>
                        <li>• Verifica que los requisitos sean claros</li>
                        <li>• El evento será revisado antes de ser publicado</li>
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving || !isStepValid(currentStep)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600"
            >
              {saving ? "Creando..." : "Crear Evento"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 