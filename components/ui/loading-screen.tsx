"use client"

import { motion } from "framer-motion"
import { Heart, Calendar, Users, Award } from "lucide-react"

interface LoadingStep {
  id: string
  label: string
  status: "pending" | "loading" | "completed" | "error"
}

interface LoadingScreenProps {
  type?: "page" | "dashboard"
  steps?: LoadingStep[]
}

export function LoadingScreen({ type = "page", steps = [] }: LoadingScreenProps) {
  const icons = [Heart, Calendar, Users, Award]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
      <div className="text-center">
        {/* Logo animado */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VolunNet
          </h1>
        </motion.div>

        {/* Iconos flotantes */}
        <div className="relative mb-8">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{
                left: `${50 + Math.cos((index * Math.PI) / 2) * 60}px`,
                top: `${50 + Math.sin((index * Math.PI) / 2) * 60}px`,
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
              }}
            >
              <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Spinner principal */}
        <motion.div
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        {/* Mensaje de carga */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {type === "dashboard" ? "Preparando tu dashboard..." : "Cargando..."}
          </h2>
          <p className="text-gray-600 mb-6">
            {type === "dashboard"
              ? "Obteniendo tus eventos y recomendaciones personalizadas"
              : "Por favor espera un momento"}
          </p>
        </motion.div>

        {/* Pasos de carga */}
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 text-sm"
                >
                  <div className="flex-shrink-0">
                    {step.status === "completed" && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    {step.status === "loading" && (
                      <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    )}
                    {step.status === "error" && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    {step.status === "pending" && <div className="w-5 h-5 bg-gray-300 rounded-full" />}
                  </div>
                  <span
                    className={`${
                      step.status === "completed"
                        ? "text-green-700"
                        : step.status === "loading"
                          ? "text-blue-700"
                          : step.status === "error"
                            ? "text-red-700"
                            : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Indicador de progreso */}
        {steps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6">
            <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${(steps.filter((s) => s.status === "completed").length / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
