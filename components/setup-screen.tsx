"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ArrowRight, Clock, X } from "lucide-react";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { getSuggestions, getTopDiners } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Diner } from "@/app/page";

interface SetupScreenProps {
  onComplete: (diners: Diner[]) => void;
  initialDiners: Diner[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function SetupScreen({
  onComplete,
  initialDiners,
  showToast,
}: SetupScreenProps) {
  const [diners, setDiners] = useState<Diner[]>(
    initialDiners.length > 0 ? initialDiners : [],
  );
  const [newName, setNewName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  // Sugerencias basadas en lo que escribe
  const suggestions = useMemo(
    () =>
      getSuggestions(
        newName,
        diners.map((d) => d.name),
      ),
    [newName, diners],
  );

  // Comensales frecuentes para chips rápidos
  const [frequentDiners, setFrequentDiners] = useState<string[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
    setFrequentDiners(
      getTopDiners(
        6,
        diners.map((d) => d.name),
      ),
    );
  }, []);

  // Actualizar chips cuando cambian los diners
  useEffect(() => {
    setFrequentDiners(
      getTopDiners(
        6,
        diners.map((d) => d.name),
      ),
    );
  }, [diners]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addDiner = (name?: string) => {
    const nameToAdd = (name || newName).trim();
    if (nameToAdd) {
      if (
        diners.some((d) => d.name.toLowerCase() === nameToAdd.toLowerCase())
      ) {
        showToast(`${nameToAdd} ya está en la mesa`, "error");
        return;
      }
      setDiners([
        ...diners,
        { id: crypto.randomUUID(), name: nameToAdd, paid: false },
      ]);
      setNewName("");
      setShowSuggestions(false);
      showToast(`${nameToAdd} agregado`);
      setTimeout(() => {
        inputRef.current?.focus();
        listEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 50);
    }
  };

  const removeDiner = (id: string) => {
    const diner = diners.find((d) => d.id === id);
    setDiners(diners.filter((d) => d.id !== id));
    if (diner?.name) {
      showToast(`${diner.name} eliminado`, "info");
    }
  };

  const handleSubmit = () => {
    const validDiners = diners.filter((d) => d.name.trim());
    if (validDiners.length >= 2) {
      onComplete(validDiners);
    }
  };

  const validCount = diners.filter((d) => d.name.trim()).length;

  return (
    <div className="flex flex-col h-dvh">
      <header className="header-gradient text-primary-foreground px-4 pt-6 pb-5 safe-top shrink-0">
        <div className="max-w-md mx-auto pt-4">
          <h1 className="text-2xl font-bold tracking-tight">Cuentas Claras</h1>
          <p className="text-primary-foreground/80 text-sm mt-0.5">
            Divide la cuenta fácilmente
          </p>
        </div>
      </header>

      {/* Progress steps */}
      <div className="bg-card border-b card-shadow shrink-0">
        <div className="max-w-md mx-auto">
          <ProgressSteps
            currentStep={0}
            totalSteps={3}
            labels={["Mesa", "Pedido", "Cuenta"]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full scroll-smooth-touch scrollbar-hide">
        {/* Título de sección */}
        <h2 className="text-lg font-bold text-foreground mb-1">
          ¿Quiénes están en la mesa?
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Agrega los nombres de cada comensal
        </p>

        {/* Input para agregar */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="new-diner-input" className="sr-only">
                Agregar nuevo comensal
              </Label>
              <Input
                id="new-diner-input"
                ref={inputRef}
                placeholder={
                  diners.length === 0
                    ? "Nombre del primer comensal"
                    : "Agregar otro comensal..."
                }
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(newName.length > 0)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (suggestions.length > 0 && showSuggestions) {
                      addDiner(suggestions[0]);
                    } else {
                      addDiner();
                    }
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                className="flex-1 h-12 text-base rounded-xl focus-ring"
                aria-describedby="diner-hint"
                autoComplete="off"
              />
            </div>
            <Button
              onClick={() => addDiner()}
              disabled={!newName.trim()}
              size="icon"
              className="shrink-0 h-12 w-12 rounded-xl touch-feedback focus-ring"
              aria-label="Agregar comensal"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Dropdown de sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-14 top-full mt-1 bg-card border rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in"
            >
              {suggestions.map((name, idx) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addDiner(name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors touch-feedback",
                    idx === 0 && "bg-secondary/30",
                  )}
                >
                  <AvatarInitials name={name} size="sm" />
                  <span className="font-medium text-sm">{name}</span>
                  {idx === 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Enter ↵
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <p id="diner-hint" className="sr-only">
          Escribe el nombre y presiona Enter o el botón + para agregar
        </p>

        {/* Chips de comensales frecuentes */}
        {frequentDiners.length > 0 && diners.length < 8 && (
          <div className="mb-5 animate-fade-in">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Recientes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {frequentDiners.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addDiner(name)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 hover:bg-secondary rounded-full transition-colors touch-feedback text-sm"
                >
                  <AvatarInitials name={name} size="sm" />
                  <span>{name}</span>
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de comensales agregados */}
        {diners.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                En la mesa ({validCount})
              </span>
            </div>
            <div
              className="space-y-1.5"
              role="list"
              aria-label="Lista de comensales"
            >
              {diners.map((diner, index) => (
                <div
                  key={diner.id}
                  className="flex items-center gap-3 bg-secondary/30 rounded-xl px-3 py-2.5 animate-fade-in"
                  role="listitem"
                >
                  <AvatarInitials
                    name={diner.name || `C${index + 1}`}
                    size="md"
                  />
                  <span className="flex-1 text-base font-medium truncate">
                    {diner.name || `Comensal ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDiner(diner.id)}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors touch-feedback"
                    aria-label={`Eliminar ${diner.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div ref={listEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 bg-background border-t pb-[100px]">
        <div className="max-w-md mx-auto px-5 py-3">
          <Button
            onClick={handleSubmit}
            disabled={validCount < 2}
            className="w-full h-12 text-base font-semibold rounded-2xl touch-feedback shadow-lg shadow-primary/25 focus-ring"
            aria-describedby="submit-hint"
          >
            {validCount >= 2
              ? `Continuar con ${validCount} comensales`
              : `Necesitas ${2 - validCount} más`}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
