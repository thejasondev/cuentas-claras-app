"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ProgressStepsProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export function ProgressSteps({ currentStep, totalSteps, labels }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3 px-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold transition-all duration-300",
              index < currentStep
                ? "bg-success text-success-foreground"
                : index === currentStep
                  ? "bg-primary text-primary-foreground scale-110"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {index < currentStep ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
          </div>
          {labels && labels[index] && (
            <span
              className={cn(
                "ml-1.5 text-xs font-medium transition-colors",
                index <= currentStep ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {labels[index]}
            </span>
          )}
          {index < totalSteps - 1 && (
            <div
              className={cn(
                "w-6 h-0.5 mx-1.5 rounded-full transition-colors duration-300",
                index < currentStep ? "bg-success" : "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
