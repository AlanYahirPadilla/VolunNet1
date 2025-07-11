"use client"

import { memo } from "react"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

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

interface OrganizationStepProps {
  organizationDescription: string
  focusAreas: string[]
  updateFormData: (field: string, value: any) => void
  toggleArrayItem: (field: string, item: string) => void
}

const OrganizationStep = memo(
  ({ organizationDescription, focusAreas, updateFormData, toggleArrayItem }: OrganizationStepProps) => {
    return (
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
              value={organizationDescription}
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
                    focusAreas.includes(category.id)
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
  },
)

OrganizationStep.displayName = "OrganizationStep"

export default OrganizationStep
