"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Users, ArrowRight, UserPlus, Clock } from "lucide-react";
import { SwipeableItem } from "@/components/ui/swipeable-item";
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
    initialDiners.length > 0 ? initialDiners : []
  );
  const [newName, setNewName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Nombres ya usados (para excluir de sugerencias)
  const usedNames = useMemo(
    () => diners.map((d) => d.name.toLowerCase()),
    [diners]
  );

  // Sugerencias basadas en lo que escribe
  const suggestions = useMemo(
    () =>
      getSuggestions(
        newName,
        diners.map((d) => d.name)
      ),
    [newName, diners]
  );

  // Comensales frecuentes para chips rápidos
  const [frequentDiners, setFrequentDiners] = useState<string[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
    // Cargar comensales frecuentes al montar
    setFrequentDiners(
      getTopDiners(
        6,
        diners.map((d) => d.name)
      )
    );
  }, []);

  // Actualizar chips cuando cambian los diners
  useEffect(() => {
    setFrequentDiners(
      getTopDiners(
        6,
        diners.map((d) => d.name)
      )
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
      // Verificar que no exista ya
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
      // Mantener el foco
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const removeDiner = (id: string) => {
    const diner = diners.find((d) => d.id === id);
    setDiners(diners.filter((d) => d.id !== id));
    if (diner?.name) {
      showToast(`${diner.name} eliminado`, "info");
    }
  };

  const updateDinerName = (id: string, name: string) => {
    setDiners(diners.map((d) => (d.id === id ? { ...d, name } : d)));
  };

  const handleSubmit = () => {
    const validDiners = diners.filter((d) => d.name.trim());
    if (validDiners.length >= 2) {
      onComplete(validDiners);
    }
  };

  const validCount = diners.filter((d) => d.name.trim()).length;

  return (
    <div className="flex flex-col min-h-screen pb-40">
      <header className="header-gradient text-primary-foreground px-4 pt-6 pb-6 safe-top">
        <div className="max-w-md mx-auto pt-4">
          <h1 className="text-2xl font-bold tracking-tight">Cuentas Claras</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Divide la cuenta fácilmente
          </p>
        </div>
      </header>

      {/* Progress steps */}
      <div className="bg-card border-b card-shadow">
        <div className="max-w-md mx-auto">
          <ProgressSteps
            currentStep={0}
            totalSteps={3}
            labels={["Mesa", "Pedido", "Cuenta"]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full scroll-smooth-touch">
        <Card className="card-shadow animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  ¿Quiénes están en la mesa?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Agrega los nombres de cada comensal
                </p>
              </div>
            </div>

            {/* Lista de comensales */}
            <div
              className="space-y-2.5 mb-4"
              role="list"
              aria-label="Lista de comensales"
            >
              {diners.map((diner, index) => (
                <SwipeableItem
                  key={diner.id}
                  onDelete={() => removeDiner(diner.id)}
                  className=""
                >
                  <div
                    className="flex items-center gap-3 bg-secondary/30 rounded-xl p-2 animate-fade-in"
                    role="listitem"
                  >
                    <AvatarInitials
                      name={diner.name || `C${index + 1}`}
                      size="md"
                    />
                    <div className="flex-1">
                      <Label htmlFor={`diner-${diner.id}`} className="sr-only">
                        Nombre del comensal {index + 1}
                      </Label>
                      <Input
                        id={`diner-${diner.id}`}
                        placeholder={`Comensal ${index + 1}`}
                        value={diner.name}
                        onChange={(e) =>
                          updateDinerName(diner.id, e.target.value)
                        }
                        className="flex-1 h-12 text-base border-0 bg-transparent rounded-lg placeholder:text-muted-foreground/50 focus-ring"
                        aria-label={`Nombre del comensal ${index + 1}`}
                      />
                    </div>
                  </div>
                </SwipeableItem>
              ))}
            </div>

            {diners.length > 0 && (
              <p className="text-[11px] text-muted-foreground text-center mb-4 opacity-70">
                Desliza hacia la izquierda para eliminar
              </p>
            )}

            {/* Agregar nuevo comensal */}
            <div className="relative">
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
                    className="flex-1 h-14 text-base rounded-xl focus-ring"
                    aria-describedby="diner-hint"
                    autoComplete="off"
                  />
                </div>
                <Button
                  onClick={() => addDiner()}
                  disabled={!newName.trim()}
                  size="icon"
                  className="shrink-0 h-14 w-14 rounded-xl touch-feedback focus-ring"
                  aria-label="Agregar comensal"
                >
                  <Plus className="h-6 w-6" />
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
                        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors touch-feedback",
                        idx === 0 && "bg-secondary/30"
                      )}
                    >
                      <AvatarInitials name={name} size="sm" />
                      <span className="font-medium">{name}</span>
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
              <div className="mt-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Recientes
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {frequentDiners.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => addDiner(name)}
                      className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-full transition-colors touch-feedback text-sm"
                    >
                      <AvatarInitials name={name} size="sm" />
                      <span>{name}</span>
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contador de comensales */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/50 animate-fade-in">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              {validCount < 2
                ? `Agrega al menos ${2 - validCount} comensal${
                    2 - validCount > 1 ? "es" : ""
                  }`
                : `${validCount} comensales listos`}
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t px-4 py-4 safe-bottom">
        <div className="max-w-md mx-auto mb-4">
          <Button
            onClick={handleSubmit}
            disabled={validCount < 2}
            className="w-full h-14 text-base font-semibold rounded-xl touch-feedback shadow-lg shadow-primary/20 focus-ring"
            aria-describedby="submit-hint"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          {validCount < 2 && (
            <p
              id="submit-hint"
              className="text-xs text-center text-muted-foreground mt-2"
            >
              Necesitas al menos 2 comensales para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
