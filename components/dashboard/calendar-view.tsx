"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  organization_name: string
  city: string
  state: string
  start_date: string
  end_date?: string
  max_volunteers: number
  current_volunteers: number
  category_name: string
  skills: string[]
}

interface CalendarViewProps {
  events: Event[]
  onEventClick?: (event: Event) => void
}

export function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate])

  // Agrupar eventos por fecha
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {}

    events.forEach((event) => {
      const eventDate = new Date(event.start_date)
      const dateKey = eventDate.toDateString()

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return grouped
  }, [events])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const selectedDateEvents = selectedDate ? eventsByDate[selectedDate.toDateString()] || [] : []

  const getEventColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario principal */}
      <div className="lg:col-span-2">
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="bg-white hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="bg-white hover:bg-gray-50">
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="bg-white hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isToday = date.toDateString() === today.toDateString()
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                const dayEvents = eventsByDate[date.toDateString()] || []

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border border-gray-100 cursor-pointer transition-colors
                      ${isCurrentMonth ? "bg-white hover:bg-blue-50" : "bg-gray-50 text-gray-400"}
                      ${isToday ? "ring-2 ring-blue-500 ring-inset" : ""}
                      ${isSelected ? "ring-2 ring-purple-500 ring-inset bg-purple-50" : ""}
                    `}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded border truncate ${getEventColor(eventIndex)}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick?.(event)
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 2} más</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de detalles */}
      <div>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800">
              {selectedDate ? (
                <>
                  Eventos del{" "}
                  {selectedDate.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                  })}
                </>
              ) : (
                "Selecciona una fecha"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors cursor-pointer"
                      onClick={() => onEventClick?.(event)}
                    >
                      <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          {new Date(event.start_date).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                          {event.city}, {event.state}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          {event.current_volunteers}/{event.max_volunteers} voluntarios
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">{event.organization_name}</Badge>
                        <Badge variant="outline" className="border-gray-300">
                          {event.category_name}
                        </Badge>
                      </div>
                      <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                        Ver detalles
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay eventos este día</p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-gray-500">Haz clic en una fecha para ver los eventos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos eventos */}
        <Card className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-white rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors cursor-pointer"
                  onClick={() => onEventClick?.(event)}
                >
                  <h5 className="font-medium text-gray-900 text-sm">{event.title}</h5>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.start_date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
