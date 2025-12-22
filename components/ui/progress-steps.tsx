"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  showPercentage?: boolean;
}

export function ProgressSteps({
  currentStep,
  totalSteps,
  labels,
  showPercentage = false,
}: ProgressStepsProps) {
  const percentage = Math.round((currentStep / (totalSteps - 1)) * 100);

  return (
    <div
      className="py-4 px-4"
      role="navigation"
      aria-label="Progreso del proceso"
    >
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all duration-300",
                index < currentStep
                  ? "bg-success text-success-foreground shadow-md shadow-success/30"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/40 ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
              aria-current={index === currentStep ? "step" : undefined}
              aria-label={`Paso ${index + 1}${
                labels?.[index] ? `: ${labels[index]}` : ""
              }${
                index < currentStep
                  ? " (completado)"
                  : index === currentStep
                  ? " (actual)"
                  : ""
              }`}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4 animate-scale-in" strokeWidth={3} />
              ) : (
                <span
                  className={cn(
                    index === currentStep && "animate-pulse-gentle"
                  )}
                >
                  {index + 1}
                </span>
              )}
            </div>
            {labels && labels[index] && (
              <span
                className={cn(
                  "ml-2 text-xs font-semibold transition-colors hidden sm:inline",
                  index < currentStep
                    ? "text-success"
                    : index === currentStep
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {labels[index]}
              </span>
            )}
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "w-8 h-1 mx-2 rounded-full transition-all duration-500",
                  index < currentStep ? "bg-success" : "bg-muted"
                )}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile labels */}
      {labels && (
        <div className="flex justify-between mt-2 px-2 sm:hidden">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn(
                "text-[10px] font-medium transition-colors text-center flex-1",
                index < currentStep
                  ? "text-success"
                  : index === currentStep
                  ? "text-primary font-bold"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {showPercentage && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          {percentage}% completado
        </p>
      )}
    </div>
  );
}
