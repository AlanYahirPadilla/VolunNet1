"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useFormState } from "react-dom"
import { useRouter } from "next/navigation"
import { registerAction } from "@/app/auth/actions"
import OrganizationStep from "@/components/registro/organization-step"
import { useFormAutosave } from "@/hooks/use-form-autosave"
import { AutosaveIndicator } from "@/components/ui/autosave-indicator"
import { RecoveryBanner } from "@/components/ui/recovery-banner"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ArrowRight, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const AUTOSAVE_KEY = "volun-net-registration-form-organizacion"

export default function RegistroOrganizacion() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false)
  const [recoveryData, setRecoveryData] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    role: "ORGANIZATION",
    focusAreas: [] as string[],
    organizationDescription: "",
    city: "",
    state: "",
  })
  const [state, formAction] = useFormState(registerAction, null)
  const router = useRouter()

  const { loadFromStorage, clearStorage } = useFormAutosave({
    key: AUTOSAVE_KEY,
    data: { ...formData, currentStep },
    delay: 2000,
    enabled: !state?.success,
  })

  useEffect(() => {
    const savedData = loadFromStorage()
    if (savedData && savedData.data) {
      setRecoveryData(savedData)
      setShowRecoveryBanner(true)
    }
  }, [loadFromStorage])

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
    if (currentStep < 3) setCurrentStep((prev) => prev + 1)
  }, [currentStep])
  const prevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
  }, [currentStep])

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.firstName &&
          formData.role
        )
      case 2:
        return formData.focusAreas.length > 0 && formData.organizationDescription
      case 3:
        return formData.city && formData.state
      default:
        return false
    }
  }, [currentStep, formData])

  const handleSubmit = useCallback(() => {
    const submitFormData = new FormData()
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

  // Steps
  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Información Básica</h3>
              <p className="text-gray-600">Comencemos con lo esencial</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre legal de la organización</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21V7a2 2 0 0 1 2-2h2V3h2v2h2V3h2v2h2a2 2 0 0 1 2 2v14" /><path d="M13 13h4v8h-4z" /></svg>
                  </span>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={e => updateFormData("firstName", e.target.value)}
                    placeholder="Ej: Nova Corp S.A. de C.V."
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg>
                  </span>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => updateFormData("email", e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e => updateFormData("password", e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => updateFormData("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )
      case 2:
        return <OrganizationStep organizationDescription={formData.organizationDescription} focusAreas={formData.focusAreas} updateFormData={updateFormData} toggleArrayItem={toggleArrayItem} />
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ubicación</h3>
              <p className="text-gray-600">¿Dónde se encuentra tu organización?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={e => updateFormData("city", e.target.value)}
                  placeholder="Ciudad"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={e => updateFormData("state", e.target.value)}
                  placeholder="Estado"
                  required
                />
              </div>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }, [currentStep, formData, updateFormData, toggleArrayItem])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl md:max-w-2xl relative z-10 flex flex-col items-center"
      >
        <div className="bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center w-full">
          <RecoveryBanner
            isVisible={showRecoveryBanner}
            onRestore={handleRestoreData}
            onDismiss={handleDismissRecovery}
            timestamp={recoveryData?.timestamp || 0}
          />
          <h1 className="text-2xl font-bold mb-4">Registro de Organización</h1>
          <AutosaveIndicator isEnabled={!state?.success} className="justify-center mb-4" />
          {state?.message && (
            <div className="mb-4 text-center text-red-500">{state.message}</div>
          )}
          <AnimatePresence mode="wait">{renderStep}</AnimatePresence>
          <div className="flex justify-between pt-6 w-full">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 bg-transparent"
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>
            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600"
                type="button"
              >
                <span>Siguiente</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600"
                type="button"
              >
                <span>Crear Cuenta</span>
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="w-full text-center mt-6">
            <span className="text-gray-600">¿Ya tienes cuenta?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Inicia sesión aquí</a>
            </span>
          </div>
        </div>
        <div className="w-full text-center mt-6">
          <a href="/" className="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center">
            ← Volver al inicio
          </a>
        </div>
      </motion.div>
    </div>
  )
} 