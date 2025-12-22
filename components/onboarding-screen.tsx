"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  UtensilsCrossed,
  Receipt,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Users,
    title: "Agrega a tus comensales",
    description: "Registra a todas las personas que comparten la mesa contigo.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: UtensilsCrossed,
    title: "Registra los platos",
    description:
      "Añade cada plato y asígnalo a quien lo consumió. Puedes dividir entre varios.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Receipt,
    title: "Divide la cuenta",
    description:
      "Obtén el total exacto por persona, incluyendo propina. ¡Compártelo fácilmente!",
    color: "from-green-500 to-emerald-500",
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-4 mt-8 safe-top">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          Omitir
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto">
        {/* Icon with gradient background */}
        <div
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center mb-8 bg-linear-to-br animate-bounce-in",
            slide.color
          )}
          key={currentSlide}
        >
          <Icon className="h-16 w-16 text-white" strokeWidth={1.5} />
        </div>

        {/* Text content */}
        <div
          className="text-center animate-fade-in"
          key={`text-${currentSlide}`}
        >
          <h1 className="text-2xl font-bold mb-3">{slide.title}</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-8 safe-bottom">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              )}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 text-base font-semibold rounded-xl touch-feedback shadow-lg shadow-primary/20"
        >
          {isLast ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Comenzar
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
