"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, Award, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EventsStatsPanelProps {
  stats: {
    completedEvents: number
    totalHours: number
  }
  upcomingEvents: Array<{
    id: string
    title: string
    date: string
    location: string
  }>
}

export function EventsStatsPanel({ stats, upcomingEvents = [] }: EventsStatsPanelProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 lg:p-4 text-center border border-green-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03 }}
        >
          <Award className="h-5 lg:h-6 w-5 lg:w-6 text-green-600 mx-auto mb-1 lg:mb-2" />
          <p className="text-lg lg:text-xl font-bold text-green-700">{stats.completedEvents}</p>
          <p className="text-xs text-green-600">Eventos</p>
        </motion.div>
        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 lg:p-4 text-center border border-orange-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
        >
          <Clock className="h-5 lg:h-6 w-5 lg:w-6 text-orange-600 mx-auto mb-1 lg:mb-2" />
          <p className="text-lg lg:text-xl font-bold text-orange-700">{stats.totalHours}</p>
          <p className="text-xs text-orange-600">Horas</p>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <motion.div
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-3 lg:p-4 border-b border-gray-100">
          <h3 className="text-sm lg:text-base font-semibold text-gray-900 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Próximos Eventos
          </h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-64 lg:max-h-80 overflow-y-auto">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                className="p-3 lg:p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                whileHover={{ x: 5 }}
              >
                <h4 className="font-medium text-xs lg:text-sm text-gray-900 mb-1 lg:mb-2 line-clamp-2">
                  {event.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <Clock className="h-3 w-3 mr-1 lg:mr-2 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{event.date}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1 lg:mr-2 text-green-500 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-3 lg:p-4 text-center text-gray-500 text-xs lg:text-sm">No hay eventos próximos</div>
          )}
        </div>
        <div className="p-2 lg:p-3 bg-gray-50 border-t border-gray-100">
          <Link href="/eventos" passHref>
            <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-800 text-xs lg:text-sm">
              Ver todos los eventos
              <ChevronRight className="h-3 lg:h-4 w-3 lg:w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
