"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
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

interface InterestsStepProps {
  interests: string[]
  toggleArrayItem: (field: string, item: string) => void
}

const InterestsStep = memo(({ interests, toggleArrayItem }: InterestsStepProps) => {
  return (
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
                interests.includes(category.id) ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
              }`}
              onClick={() => toggleArrayItem("interests", category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h4 className="font-medium text-sm mb-1">{category.name}</h4>
                <p className="text-xs text-gray-500">{category.description}</p>
                {interests.includes(category.id) && (
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
        Seleccionadas: {interests.length} de {INTEREST_CATEGORIES.length}
      </div>
    </motion.div>
  )
})

InterestsStep.displayName = "InterestsStep"

export default InterestsStep
