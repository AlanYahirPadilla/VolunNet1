import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, className, iconClassName }: StatCardProps) {
  return (
    <Card className={cn("border shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="p-6">
        <div className="flex items-center">
          <div className={cn("p-2 rounded-md", iconClassName || "bg-blue-50")}>
            <Icon className={cn("h-5 w-5", iconClassName ? "text-white" : "text-blue-600")} />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              {trend && (
                <p className={cn("ml-2 text-sm", trend.positive ? "text-green-600" : "text-red-600")}>
                  {trend.positive ? "+" : "-"}
                  {trend.value}% {trend.label}
                </p>
              )}
            </div>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
        </div>
      </div>
    </Card>
  )
}
