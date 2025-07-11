"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SmartLink } from "@/components/ui/smart-link"
import {
  Home,
  Search,
  Calendar,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
  Users,
  Award,
  Clock,
} from "lucide-react"

interface EnhancedSidebarProps {
  user: {
    firstName: string
    lastName: string
    role: string
  }
  upcomingEvents: Array<{
    id: string
    title: string
    date: string
    location: string
  }>
  stats: {
    completedEvents: number
    totalHours: number
    profileCompletion: number
  }
}

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", color: "text-blue-600" },
  { icon: Search, label: "Explorar Eventos", href: "/eventos", color: "text-green-600" },
  { icon: Calendar, label: "Mis Eventos", href: "/mis-eventos", color: "text-purple-600" },
  { icon: Users, label: "Comunidad", href: "/comunidad", color: "text-orange-600" },
  { icon: User, label: "Perfil", href: "/perfil", color: "text-pink-600" },
  { icon: Settings, label: "Configuración", href: "/configuracion", color: "text-gray-600" },
]

export function EnhancedSidebar({ user, upcomingEvents, stats }: EnhancedSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState("/dashboard")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveItem(window.location.pathname)
    }
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full bg-gradient-to-b from-slate-50 to-gray-50 border-r border-gray-200 shadow-sm z-40 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">VolunNet</h1>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="p-2 hover:bg-gray-100">
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => (
            <SmartLink key={item.href} href={item.href} preloadOnHover={true} preloadDelay={150}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeItem === item.href
                    ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                    : "hover:bg-white hover:shadow-sm text-gray-700 border border-transparent"
                }`}
                onClick={() => setActiveItem(item.href)}
              >
                <item.icon className={`w-5 h-5 ${activeItem === item.href ? item.color : "text-gray-500"}`} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </SmartLink>
          ))}
        </nav>

        <Separator className="my-6 mx-3" />

        {/* Stats Summary */}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-3"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Tu Progreso</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Eventos</span>
                      </div>
                      <span className="font-medium text-gray-900">{stats.completedEvents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Horas</span>
                      </div>
                      <span className="font-medium text-gray-900">{stats.totalHours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
