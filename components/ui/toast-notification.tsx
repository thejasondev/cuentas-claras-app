"use client"

import { useEffect, useState } from "react"
import { Check, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info"

interface ToastNotificationProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function ToastNotification({ message, type = "success", duration = 2000, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))

    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onClose, 200)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <Check className="h-4 w-4" strokeWidth={3} />,
    error: <X className="h-4 w-4" strokeWidth={3} />,
    info: <AlertCircle className="h-4 w-4" />,
  }

  const colors = {
    success: "bg-success text-success-foreground",
    error: "bg-destructive text-destructive-foreground",
    info: "bg-primary text-primary-foreground",
  }

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 ease-out safe-top",
        colors[type],
        isVisible && !isLeaving ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2",
      )}
    >
      <div className="flex items-center justify-center h-5 w-5 rounded-2xl bg-current/20 mt-3">
        {icons[type]}
      </div>
      <span className="font-semibold text-sm mt-3 leading-tight text-center max-w-[200px]">{message}</span>
    </div>
  )
}
