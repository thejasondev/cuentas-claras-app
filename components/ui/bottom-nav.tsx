"use client";

import { useEffect, useState } from "react";
import { Home, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBillsCount } from "@/lib/storage";

interface BottomNavProps {
  activeScreen: string;
  onNavigate: (screen: "setup" | "history" | "settings") => void;
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    // Cargar conteo inicial
    setHistoryCount(getBillsCount());

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      setHistoryCount(getBillsCount());
    };

    window.addEventListener("storage", handleStorageChange);

    // También actualizar cuando cambia el screen (por si se guardó una cuenta)
    if (activeScreen === "setup") {
      setHistoryCount(getBillsCount());
    }

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [activeScreen]);

  const items = [
    { id: "setup", label: "Inicio", icon: Home },
    { id: "history", label: "Historial", icon: Clock, badge: historyCount },
    { id: "settings", label: "Ajustes", icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t safe-bottom z-40">
      <div className="max-w-md mx-auto flex items-center justify-around min-h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          const badge = "badge" in item ? item.badge : 0;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-6 min-h-16 touch-feedback no-select transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 mb-1 transition-all",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1 animate-scale-in">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
