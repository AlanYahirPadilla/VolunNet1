"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Users, Building } from "lucide-react"

export default function RegistroSelector() {
  const router = useRouter()
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
        className="w-full max-w-2xl mx-auto z-10"
      >
        <div className="bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4"
          >
            <Heart className="h-8 w-8 text-white fill-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 text-center">¿Cómo quieres registrarte?</h1>
          <p className="text-gray-600 mb-8 text-center">Selecciona el tipo de cuenta que deseas crear en VolunNet</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/registro/voluntario")}
              className="flex flex-col items-center justify-center p-8 rounded-2xl shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-purple-50 transition-all cursor-pointer group"
            >
              <Users className="h-12 w-12 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-semibold text-blue-700 mb-1">Quiero ser Voluntario</span>
              <span className="text-gray-500 text-sm text-center">Explora oportunidades, postúlate a eventos y haz la diferencia en tu comunidad.</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/registro/organizacion")}
              className="flex flex-col items-center justify-center p-8 rounded-2xl shadow-lg border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:from-purple-100 hover:to-blue-50 transition-all cursor-pointer group"
            >
              <Building className="h-12 w-12 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-semibold text-purple-700 mb-1">Quiero registrar mi Organización</span>
              <span className="text-gray-500 text-sm text-center">Gestiona eventos, recibe postulaciones y conecta con voluntarios comprometidos.</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
