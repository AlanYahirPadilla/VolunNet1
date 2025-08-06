"use client"

import { motion } from "framer-motion"

interface SkeletonLoaderProps {
  type?: "card" | "list" | "grid" | "calendar"
  count?: number
}

export function SkeletonLoader({ type = "card", count = 3 }: SkeletonLoaderProps) {
  const shimmer = {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
    },
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  }

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <motion.div
        className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
        style={{ backgroundSize: "200% 100%" }}
        {...shimmer}
      />
      <motion.div
        className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4"
        style={{ backgroundSize: "200% 100%" }}
        {...shimmer}
      />
      <motion.div
        className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2"
        style={{ backgroundSize: "200% 100%" }}
        {...shimmer}
      />
    </div>
  )

  const SkeletonList = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"
            style={{ backgroundSize: "200% 100%" }}
            {...shimmer}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
              style={{ backgroundSize: "200% 100%" }}
              {...shimmer}
            />
            <motion.div
              className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-2/3"
              style={{ backgroundSize: "200% 100%" }}
              {...shimmer}
            />
          </div>
        </div>
      ))}
    </div>
  )

  const SkeletonCalendar = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
            style={{ backgroundSize: "200% 100%" }}
            {...shimmer}
          />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
            style={{ backgroundSize: "200% 100%" }}
            {...shimmer}
          />
        ))}
      </div>
    </div>
  )

  if (type === "calendar") {
    return <SkeletonCalendar />
  }

  if (type === "list") {
    return <SkeletonList />
  }

  if (type === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return <SkeletonCard />
}
