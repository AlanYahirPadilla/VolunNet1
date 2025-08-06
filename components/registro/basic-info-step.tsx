"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users, Building, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface BasicInfoStepProps {
  formData: {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    role: string
  }
  updateFormData: (field: string, value: any) => void
}

const BasicInfoStep = memo(({ formData, updateFormData }: BasicInfoStepProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
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
        <RadioGroup
          value={formData.role}
          onValueChange={(value) => updateFormData("role", value)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="VOLUNTEER" id="volunteer" />
            <Label htmlFor="volunteer" className="flex items-center space-x-2 cursor-pointer">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Voluntario</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ORGANIZATION" id="organization" />
            <Label htmlFor="organization" className="flex items-center space-x-2 cursor-pointer">
              <Building className="h-4 w-4 text-purple-600" />
              <span>Organización</span>
            </Label>
          </div>
        </RadioGroup>
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
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

BasicInfoStep.displayName = "BasicInfoStep"

export default BasicInfoStep
