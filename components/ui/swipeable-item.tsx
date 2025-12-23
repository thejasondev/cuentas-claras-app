"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

export function SwipeableItem({
  children,
  onDelete,
  className,
}: SwipeableItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 60;
  const REVEAL_WIDTH = 80;

  // Cerrar al tocar fuera
  useEffect(() => {
    if (!isRevealed) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsRevealed(false);
        setTranslateX(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isRevealed]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;

    if (isRevealed) {
      // Si ya está revelado, permitir cerrar deslizando a la derecha
      if (diff < 0) {
        setTranslateX(Math.max(REVEAL_WIDTH + diff, 0));
      }
    } else {
      // Deslizar para revelar
      if (diff > 0) {
        setTranslateX(Math.min(diff, REVEAL_WIDTH));
      } else {
        setTranslateX(0);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (isRevealed) {
      // Si estaba revelado y deslizó para cerrar
      if (translateX < REVEAL_WIDTH / 2) {
        setIsRevealed(false);
        setTranslateX(0);
      } else {
        setTranslateX(REVEAL_WIDTH);
      }
    } else {
      // Si no estaba revelado
      if (translateX >= THRESHOLD) {
        setIsRevealed(true);
        setTranslateX(REVEAL_WIDTH);
      } else {
        setTranslateX(0);
      }
    }
  };

  const handleDelete = useCallback(() => {
    // Animación de salida
    setTranslateX(containerRef.current?.offsetWidth || 300);
    setTimeout(() => {
      onDelete();
    }, 200);
  }, [onDelete]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl", className)}
      ref={containerRef}
    >
      {/* Botón de eliminar revelable */}
      <button
        type="button"
        onClick={handleDelete}
        className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-center bg-destructive transition-all",
          "hover:bg-destructive/90 active:bg-destructive/80",
          isRevealed ? "opacity-100" : "opacity-70"
        )}
        style={{ width: `${REVEAL_WIDTH}px` }}
        aria-label="Eliminar"
      >
        <Trash2 className="h-5 w-5 text-destructive-foreground" />
      </button>

      {/* Contenido deslizable */}
      <div
        className={cn(
          "relative bg-card",
          !isDragging && "transition-transform duration-200 ease-out"
        )}
        style={{ transform: `translateX(-${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
