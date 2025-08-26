"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedBackgroundProps {
  className?: string
  variant?: "default" | "gradient" | "dots" | "waves"
  children?: React.ReactNode
}

export function AnimatedBackground({ className, variant = "default", children }: AnimatedBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {variant === "default" && (
        <>
          <div className="absolute inset-0 -z-10">
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 0.9, 1],
              }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"
            />
          </div>
        </>
      )}

      {variant === "gradient" && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10" />
      )}

      {variant === "dots" && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-white opacity-90" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #2563eb20 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      )}

      {variant === "waves" && (
        <div className="absolute inset-0 -z-10">
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            id="visual"
            viewBox="0 0 900 600"
            width="900"
            height="600"
            preserveAspectRatio="none"
          >
            <path
              d="M0 415L21.5 417.7C43 420.3 86 425.7 128.8 427.3C171.7 429 214.3 427 257.2 421.3C300 415.7 343 406.3 385.8 402.7C428.7 399 471.3 401 514.2 407.3C557 413.7 600 424.3 642.8 427.3C685.7 430.3 728.3 425.7 771.2 421.3C814 417 857 413 878.5 411L900 409L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
              fill="#2563eb10"
            >
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="M0 415L21.5 417.7C43 420.3 86 425.7 128.8 427.3C171.7 429 214.3 427 257.2 421.3C300 415.7 343 406.3 385.8 402.7C428.7 399 471.3 401 514.2 407.3C557 413.7 600 424.3 642.8 427.3C685.7 430.3 728.3 425.7 771.2 421.3C814 417 857 413 878.5 411L900 409L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z;
                       M0 435L21.5 432.3C43 429.7 86 424.3 128.8 422.7C171.7 421 214.3 423 257.2 428.7C300 434.3 343 443.7 385.8 447.3C428.7 451 471.3 449 514.2 442.7C557 436.3 600 425.7 642.8 422.7C685.7 419.7 728.3 424.3 771.2 428.7C814 433 857 437 878.5 439L900 441L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z;
                       M0 415L21.5 417.7C43 420.3 86 425.7 128.8 427.3C171.7 429 214.3 427 257.2 421.3C300 415.7 343 406.3 385.8 402.7C428.7 399 471.3 401 514.2 407.3C557 413.7 600 424.3 642.8 427.3C685.7 430.3 728.3 425.7 771.2 421.3C814 417 857 413 878.5 411L900 409L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
              />
            </path>
          </svg>
        </div>
      )}

      {children}
    </div>
  )
}
