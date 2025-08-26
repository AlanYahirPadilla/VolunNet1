"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface LoadingStep {
  id: string
  label: string
  status: "pending" | "loading" | "completed" | "error"
}

interface ProgressiveLoaderProps {
  steps: LoadingStep[]
}

export function ProgressiveLoader({ steps }: ProgressiveLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const completedSteps = steps.filter((step) => step.status === "completed").length
    const totalSteps = steps.length
    setProgress((completedSteps / totalSteps) * 100)

    const loadingStepIndex = steps.findIndex((step) => step.status === "loading")
    if (loadingStepIndex !== -1) {
      setCurrentStep(loadingStepIndex)
    }
  }, [steps])

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "loading":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">VolunNet</h1>
        </motion.div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Cargando...</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Pasos de carga */}
        <div className="space-y-3">
          <AnimatePresence>
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  step.status === "loading"
                    ? "bg-blue-50 border border-blue-200"
                    : step.status === "completed"
                      ? "bg-green-50 border border-green-200"
                      : step.status === "error"
                        ? "bg-red-50 border border-red-200"
                        : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      step.status === "loading"
                        ? "text-blue-900"
                        : step.status === "completed"
                          ? "text-green-900"
                          : step.status === "error"
                            ? "text-red-900"
                            : "text-gray-700"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {step.status === "loading" && (
                  <motion.div
                    className="flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mensaje de estado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-600">
            {progress === 100 ? "¡Casi listo! Finalizando carga..." : "Preparando tu experiencia personalizada..."}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
