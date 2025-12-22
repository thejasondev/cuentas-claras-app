"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  className,
  showLabel = false,
  animated = true,
  label = "Progreso",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Convertir valores a strings para evitar warnings del linter
  const ariaProps = {
    role: "progressbar" as const,
    "aria-label": label,
    "aria-valuenow": clampedValue,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={cn(
            "bg-primary h-full rounded-full",
            "transition-all duration-500 ease-out",
            animated && "animate-progress-fill"
          )}
          // El inline style es necesario para valores dinámicos de width
          // eslint-disable-next-line react/forbid-dom-props
          style={{ width: `${clampedValue}%` }}
          {...ariaProps}
        />
      </div>
      {showLabel && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          {Math.round(clampedValue)}% completado
        </p>
      )}
    </div>
  );
}
