import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Award } from "lucide-react"

interface ApplicationStatusBadgeProps {
  status?: string
  hasApplied?: boolean
  className?: string
}

export function ApplicationStatusBadge({ status, hasApplied, className = "" }: ApplicationStatusBadgeProps) {
  if (!hasApplied) {
    return null
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="h-3 w-3" />,
          text: 'Pendiente',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
        }
      case 'ACCEPTED':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Aceptado',
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
        }
      case 'REJECTED':
        return {
          icon: <XCircle className="h-3 w-3" />,
          text: 'Rechazado',
          className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
        }
      case 'COMPLETED':
        return {
          icon: <Award className="h-3 w-3" />,
          text: 'Completado',
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
        }
      default:
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Ya postulado',
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge 
      variant="outline" 
      className={`text-xs font-medium ${config.className} ${className}`}
    >
      {config.icon}
      <span className="ml-1">{config.text}</span>
    </Badge>
  )
}





