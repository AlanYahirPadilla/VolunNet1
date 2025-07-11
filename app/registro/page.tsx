"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Loader2, ArrowLeft, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useCallback, useMemo, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { registerAction } from "../auth/actions"
import { useRouter } from "next/navigation"
import { useFormAutosave } from "@/hooks/use-form-autosave"
import { AutosaveIndicator } from "@/components/ui/autosave-indicator"
import { RecoveryBanner } from "@/components/ui/recovery-banner"

const INTEREST_CATEGORIES = [
  { id: "cat_1", name: "Educación", icon: "🎓", description: "Enseñanza y capacitación" },
  { id: "cat_2", name: "Medio Ambiente", icon: "🌱", description: "Conservación y sostenibilidad" },
  { id: "cat_3", name: "Salud", icon: "❤️", description: "Bienestar y salud comunitaria" },
  { id: "cat_4", name: "Alimentación", icon: "🍽️", description: "Programas de nutrición" },
  { id: "cat_5", name: "Tecnología", icon: "💻", description: "Capacitación digital" },
  { id: "cat_6", name: "Deportes", icon: "🏆", description: "Actividades deportivas" },
  { id: "cat_7", name: "Arte y Cultura", icon: "🎨", description: "Expresión artística" },
  { id: "cat_8", name: "Construcción", icon: "🔨", description: "Proyectos comunitarios" },
]

const TIME_SLOTS = [
  { id: "morning", name: "Mañanas", time: "6:00 - 12:00", icon: "🌅" },
  { id: "afternoon", name: "Tardes", time: "12:00 - 18:00", icon: "☀️" },
  { id: "evening", name: "Noches", time: "18:00 - 22:00", icon: "🌙" },
  { id: "weekend", name: "Fines de semana", time: "Sábados y domingos", icon: "🎉" },
]

const MEXICAN_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
]

const AUTOSAVE_KEY = "volun-net-registration-form"

// Componente para el botón de envío con estado de carga
function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creando cuenta...
        </>
      ) : (
        "Crear Cuenta"
      )}
    </Button>
  )
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false)
  const [recoveryData, setRecoveryData] = useState<any>(null)
  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "VOLUNTEER",

    // Paso 2: Intereses (solo voluntarios)
    interests: [] as string[],

    // Paso 3: Disponibilidad (solo voluntarios)
    hoursPerWeek: "",
    timeSlots: [] as string[],

    // Paso 4: Ubicación
    city: "",
    state: "",
    maxDistance: "10",
    transportation: "",

    // Paso 2 alternativo: Áreas de enfoque (solo organizaciones)
    focusAreas: [] as string[],
    organizationDescription: "",
  })

  const [state, formAction] = useFormState(registerAction, null)
  const router = useRouter()

  // Hook de autoguardado
  const { loadFromStorage, clearStorage } = useFormAutosave({
    key: AUTOSAVE_KEY,
    data: { ...formData, currentStep },
    delay: 2000, // Guardar cada 2 segundos después de cambios
    enabled: !state?.success, // No guardar mientras se está enviando
  })

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const savedData = loadFromStorage()
    if (savedData && savedData.data) {
      setRecoveryData(savedData)
      setShowRecoveryBanner(true)
    }
  }, [loadFromStorage])

  // Limpiar datos guardados cuando el registro sea exitoso
  useEffect(() => {
    if (state?.success) {
      clearStorage()
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }
  }, [state?.success, router, clearStorage])

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const toggleArrayItem = useCallback((field: string, item: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(item)
        ? (prev[field as keyof typeof prev] as string[]).filter((i) => i !== item)
        : [...(prev[field as keyof typeof prev] as string[]), item],
    }))
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const getTotalSteps = useCallback(() => {
    return formData.role === "VOLUNTEER" ? 4 : 3
  }, [formData.role])

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.firstName &&
          formData.lastName &&
          formData.role
        )
      case 2:
        if (formData.role === "VOLUNTEER") {
          return formData.interests.length > 0
        } else {
          return formData.focusAreas.length > 0 && formData.organizationDescription
        }
      case 3:
        if (formData.role === "VOLUNTEER") {
          return formData.hoursPerWeek && formData.timeSlots.length > 0
        } else {
          return formData.city && formData.state
        }
      case 4:
        return formData.city && formData.state
      default:
        return false
    }
  }, [currentStep, formData])

  const handleSubmit = useCallback(() => {
    const submitFormData = new FormData()

    // Datos básicos
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        submitFormData.append(key, JSON.stringify(value))
      } else {
        submitFormData.append(key, value.toString())
      }
    })

    formAction(submitFormData)
  }, [formData, formAction])

  const handleRestoreData = useCallback(() => {
    if (recoveryData?.data) {
      const { currentStep: savedStep, ...savedFormData } = recoveryData.data
      setFormData(savedFormData)
      setCurrentStep(savedStep || 1)
      setShowRecoveryBanner(false)
    }
  }, [recoveryData])

  const handleDismissRecovery = useCallback(() => {
    setShowRecoveryBanner(false)
    clearStorage()
  }, [clearStorage])

  // Definir componentes antes de usarlos en useMemo
  const BasicInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Información Básica</h3>
        <p className="text-gray-600">Comencemos con lo esencial</p>
      </div>

      {/* Tipo de cuenta */}
      <div className="space-y-3">
        <Label>¿Cómo quieres participar?</Label>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              formData.role === "VOLUNTEER" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => updateFormData("role", "VOLUNTEER")}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  formData.role === "VOLUNTEER" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                }`}
              >
                {formData.role === "VOLUNTEER" && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
              </div>
              <span className="font-medium">Voluntario</span>
            </div>
          </div>
          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              formData.role === "ORGANIZATION"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => updateFormData("role", "ORGANIZATION")}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  formData.role === "ORGANIZATION" ? "border-purple-500 bg-purple-500" : "border-gray-300"
                }`}
              >
                {formData.role === "ORGANIZATION" && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
              </div>
              <span className="font-medium">Organización</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData("firstName", e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData("lastName", e.target.value)}
            placeholder="Tu apellido"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          placeholder="tu@email.com"
          required
        />
      </div>

      {/* Contraseñas */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              placeholder="••••••••"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData("confirmPassword", e.target.value)}
              placeholder="••••••••"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const InterestsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Qué te apasiona?</h3>
        <p className="text-gray-600">Selecciona las causas que más te interesan</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {INTEREST_CATEGORIES.map((category) => (
          <motion.div key={category.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              className={`cursor-pointer transition-all duration-300 ${
                formData.interests.includes(category.id) ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
              }`}
              onClick={() => toggleArrayItem("interests", category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h4 className="font-medium text-sm mb-1">{category.name}</h4>
                <p className="text-xs text-gray-500">{category.description}</p>
                {formData.interests.includes(category.id) && (
                  <div className="mt-2">
                    <Star className="h-4 w-4 text-blue-500 mx-auto fill-current" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        Seleccionadas: {formData.interests.length} de {INTEREST_CATEGORIES.length}
      </div>
    </motion.div>
  )

  const OrganizationStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sobre tu organización</h3>
        <p className="text-gray-600">Cuéntanos en qué áreas trabajas</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="organizationDescription">Descripción de la organización</Label>
          <textarea
            id="organizationDescription"
            value={formData.organizationDescription}
            onChange={(e) => updateFormData("organizationDescription", e.target.value)}
            placeholder="Describe brevemente la misión y actividades de tu organización..."
            className="w-full p-3 border rounded-lg resize-none h-24"
            required
          />
        </div>

        <div>
          <Label className="mb-3 block">Áreas de enfoque</Label>
          <div className="grid grid-cols-2 gap-3">
            {INTEREST_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.focusAreas.includes(category.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleArrayItem("focusAreas", category.id)}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const AvailabilityStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu disponibilidad</h3>
        <p className="text-gray-600">¿Cuándo puedes hacer voluntariado?</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="hoursPerWeek">Horas por semana que puedes dedicar</Label>
          <Select value={formData.hoursPerWeek} onValueChange={(value) => updateFormData("hoursPerWeek", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona las horas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2">1-2 horas</SelectItem>
              <SelectItem value="3-5">3-5 horas</SelectItem>
              <SelectItem value="6-10">6-10 horas</SelectItem>
              <SelectItem value="11-15">11-15 horas</SelectItem>
              <SelectItem value="16+">Más de 16 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-3 block">¿Cuándo prefieres hacer voluntariado?</Label>
          <div className="grid grid-cols-2 gap-4">
            {TIME_SLOTS.map((slot) => (
              <motion.div key={slot.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    formData.timeSlots.includes(slot.id) ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                  }`}
                  onClick={() => toggleArrayItem("timeSlots", slot.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{slot.icon}</div>
                    <h4 className="font-medium text-sm mb-1">{slot.name}</h4>
                    <p className="text-xs text-gray-500">{slot.time}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const LocationStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Dónde te encuentras?</h3>
        <p className="text-gray-600">Esto nos ayuda a mostrarte oportunidades cercanas</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData("city", e.target.value)}
              placeholder="Tu ciudad"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select value={formData.state} onValueChange={(value) => updateFormData("state", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu estado" />
              </SelectTrigger>
              <SelectContent>
                {MEXICAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.role === "VOLUNTEER" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxDistance">Distancia máxima que estás dispuesto a viajar</Label>
              <Select value={formData.maxDistance} onValueChange={(value) => updateFormData("maxDistance", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la distancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Hasta 5 km</SelectItem>
                  <SelectItem value="10">Hasta 10 km</SelectItem>
                  <SelectItem value="20">Hasta 20 km</SelectItem>
                  <SelectItem value="50">Hasta 50 km</SelectItem>
                  <SelectItem value="100">Más de 50 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportation">¿Cómo te transportas?</Label>
              <Select
                value={formData.transportation}
                onValueChange={(value) => updateFormData("transportation", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu medio de transporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Auto propio</SelectItem>
                  <SelectItem value="public">Transporte público</SelectItem>
                  <SelectItem value="bike">Bicicleta</SelectItem>
                  <SelectItem value="walk">Caminando</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />
      case 2:
        return formData.role === "VOLUNTEER" ? <InterestsStep /> : <OrganizationStep />
      case 3:
        return formData.role === "VOLUNTEER" ? <AvailabilityStep /> : <LocationStep />
      case 4:
        return <LocationStep />
      default:
        return null
    }
  }, [
    currentStep,
    formData.role,
    formData.interests,
    formData.focusAreas,
    formData.organizationDescription,
    formData.hoursPerWeek,
    formData.timeSlots,
    formData.city,
    formData.state,
    formData.maxDistance,
    formData.transportation,
    formData.firstName,
    formData.lastName,
    formData.email,
    formData.password,
    formData.confirmPassword,
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Recovery Banner */}
        <RecoveryBanner
          isVisible={showRecoveryBanner}
          onRestore={handleRestoreData}
          onDismiss={handleDismissRecovery}
          timestamp={recoveryData?.timestamp || 0}
        />

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Heart className="h-8 w-8 text-white fill-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Únete a VolunNet
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Paso {currentStep} de {getTotalSteps()}
              </CardDescription>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Autosave Indicator */}
            <AutosaveIndicator isEnabled={!state?.success} className="justify-center" />
          </CardHeader>

          <CardContent className="space-y-6">
            {state?.message && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant={state.success ? "default" : "destructive"}>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <AnimatePresence mode="wait">{renderStep}</AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Anterior</span>
              </Button>

              {currentStep < getTotalSteps() ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <form action={formAction} className="space-y-6">
                  {/* Basic Info */}
                  <BasicInfoStep />
                  {/* Interests */}
                  {formData.role === "VOLUNTEER" ? <InterestsStep /> : <OrganizationStep />}
                  {/* Availability */}
                  {formData.role === "VOLUNTEER" ? <AvailabilityStep /> : <LocationStep />}
                  {/* Location */}
                  <LocationStep />
                  <SubmitButton />
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
          <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center mt-2">
            ← Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
