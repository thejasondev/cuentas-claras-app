"use client"

import { Home, Clock, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeScreen: string
  onNavigate: (screen: "setup" | "history" | "settings") => void
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const items = [
    { id: "setup", label: "Inicio", icon: Home },
    { id: "history", label: "Historial", icon: Clock },
    { id: "settings", label: "Ajustes", icon: Settings },
  ] as const

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t safe-bottom z-40">
      <div className="max-w-md mx-auto flex items-center justify-around min-h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeScreen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-6 min-h-16 touch-feedback no-select transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn("h-5 w-5 mb-1 transition-all", isActive && "scale-110")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn("text-[11px] font-medium", isActive && "font-semibold")}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
