"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  variant?: "default" | "outline" | "gradient"
  size?: "default" | "sm" | "lg" | "xl"
  className?: string
  children: React.ReactNode
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ href, variant = "default", size = "default", className, children, ...props }, ref) => {
    const buttonClasses = cn(
      "relative overflow-hidden rounded-full transition-all duration-300",
      {
        "px-6 py-2": size === "default",
        "px-4 py-1 text-sm": size === "sm",
        "px-8 py-3 text-lg": size === "lg",
        "px-10 py-4 text-xl": size === "xl",
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20":
          variant === "gradient",
      },
      className,
    )

    const buttonContent = (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
        {variant === "default" && (
          <Button className={buttonClasses} ref={ref} {...props}>
            {children}
          </Button>
        )}

        {variant === "outline" && (
          <Button variant="outline" className={buttonClasses} ref={ref} {...props}>
            {children}
          </Button>
        )}

        {variant === "gradient" && (
          <button className={buttonClasses} ref={ref} {...props}>
            <span className="relative z-10">{children}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        )}
      </motion.div>
    )

    if (href) {
      return <Link href={href}>{buttonContent}</Link>
    }

    return buttonContent
  },
)

AnimatedButton.displayName = "AnimatedButton"
