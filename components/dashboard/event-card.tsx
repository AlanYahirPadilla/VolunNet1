import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Star } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string
    organization_name: string
    city: string
    state: string
    start_date: string
    max_volunteers: number
    current_volunteers: number
    category_name: string
    skills?: string[]
    recommendation_score?: number
    recommendation_reasons?: string[]
  }
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Obtener iniciales de la organización
  const orgInitials = event.organization_name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-blue-100 text-blue-800">{orgInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.organization_name}</p>
            </div>
          </div>
          {event.recommendation_score && event.recommendation_score > 0.5 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Star className="h-3 w-3 mr-1 fill-blue-500" />
              Recomendado
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {event.city}, {event.state}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {formatDate(event.start_date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            {event.current_volunteers}/{event.max_volunteers} voluntarios
          </div>
        </div>

        {event.skills && event.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                {skill}
              </Badge>
            ))}
            {event.skills.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-50">
                +{event.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/eventos/${event.id}`}>Ver detalles</Link>
        </Button>
      </div>
    </Card>
  )
}
