"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SwipeableItemProps {
  children: React.ReactNode
  onDelete: () => void
  className?: string
}

export function SwipeableItem({ children, onDelete, className }: SwipeableItemProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const THRESHOLD = 80
  const MAX_SWIPE = 100

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    currentX.current = e.touches[0].clientX
    const diff = startX.current - currentX.current

    if (diff > 0) {
      setTranslateX(Math.min(diff, MAX_SWIPE))
    } else {
      setTranslateX(0)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    if (translateX >= THRESHOLD) {
      setTranslateX(MAX_SWIPE)
      setTimeout(() => {
        onDelete()
      }, 150)
    } else {
      setTranslateX(0)
    }
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)} ref={containerRef}>
      {/* Fondo de eliminar */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end bg-destructive px-5 rounded-r-xl"
        style={{ width: `${MAX_SWIPE}px` }}
      >
        <Trash2 className="h-5 w-5 text-destructive-foreground" />
      </div>

      {/* Contenido deslizable */}
      <div
        className={cn("relative bg-card transition-transform", !isDragging && "duration-200 ease-out")}
        style={{ transform: `translateX(-${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
