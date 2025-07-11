"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface AnimatedCardProps {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
  variant?: "default" | "gradient" | "outline" | "glass"
  hoverEffect?: "lift" | "glow" | "border" | "none"
}

export function AnimatedCard({
  title,
  description,
  icon,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  variant = "default",
  hoverEffect = "lift",
}: AnimatedCardProps) {
  const cardClasses = cn(
    "overflow-hidden transition-all duration-300",
    {
      "hover:-translate-y-1 hover:shadow-xl": hoverEffect === "lift",
      "hover:shadow-lg hover:shadow-blue-500/20": hoverEffect === "glow",
      "hover:border-blue-500": hoverEffect === "border",
      "bg-gradient-to-br from-white to-blue-50/50 border-0": variant === "gradient",
      "bg-white/80 backdrop-blur-sm border border-white/50": variant === "glass",
      "border-2": variant === "outline",
    },
    className,
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cardClasses}>
        {(title || icon || description) && (
          <CardHeader className={cn("relative", headerClassName)}>
            {icon && (
              <motion.div whileHover={{ rotate: [0, -5, 5, -5, 0] }} transition={{ duration: 0.5 }} className="mb-4">
                {icon}
              </motion.div>
            )}
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
            {variant === "gradient" && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            )}
          </CardHeader>
        )}

        {children && <CardContent className={contentClassName}>{children}</CardContent>}

        {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
      </Card>
    </motion.div>
  )
}
