"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users, ArrowRight, UserPlus } from "lucide-react"
import { SwipeableItem } from "@/components/ui/swipeable-item"
import { ProgressSteps } from "@/components/ui/progress-steps"
import type { Diner } from "@/app/page"

interface SetupScreenProps {
  onComplete: (diners: Diner[]) => void
  initialDiners: Diner[]
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

export function SetupScreen({ onComplete, initialDiners, showToast }: SetupScreenProps) {
  const [diners, setDiners] = useState<Diner[]>(
    initialDiners.length > 0 ? initialDiners : [{ id: crypto.randomUUID(), name: "", paid: false }],
  )
  const [newName, setNewName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addDiner = () => {
    if (newName.trim()) {
      setDiners([...diners, { id: crypto.randomUUID(), name: newName.trim(), paid: false }])
      setNewName("")
      showToast(`${newName.trim()} agregado`)
      inputRef.current?.focus()
    }
  }

  const removeDiner = (id: string) => {
    const diner = diners.find((d) => d.id === id)
    setDiners(diners.filter((d) => d.id !== id))
    if (diner?.name) {
      showToast(`${diner.name} eliminado`, "info")
    }
  }

  const updateDinerName = (id: string, name: string) => {
    setDiners(diners.map((d) => (d.id === id ? { ...d, name } : d)))
  }

  const handleSubmit = () => {
    const validDiners = diners.filter((d) => d.name.trim())
    if (validDiners.length >= 2) {
      onComplete(validDiners)
    }
  }

  const validCount = diners.filter((d) => d.name.trim()).length

  return (
    <div className="flex flex-col min-h-screen pb-40">
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-6 safe-top">
        <div className="max-w-md mx-auto pt-4">
          <h1 className="text-2xl font-bold tracking-tight">Cuentas Claras</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Divide la cuenta facilmente</p>
        </div>
      </header>

      {/* Progress steps */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-md mx-auto">
          <ProgressSteps currentStep={0} totalSteps={3} labels={["Mesa", "Pedido", "Cuenta"]} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full scroll-smooth-touch">
        <Card className="shadow-sm animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Quienes estan en la mesa?</h2>
                <p className="text-xs text-muted-foreground">Agrega los nombres de cada comensal</p>
              </div>
            </div>

            {/* Lista de comensales */}
            <div className="space-y-2.5 mb-4">
              {diners.map((diner, index) => (
                <SwipeableItem
                  key={diner.id}
                  onDelete={() => removeDiner(diner.id)}
                  className={diners.length <= 1 ? "pointer-events-none" : ""}
                >
                  <div className="flex items-center gap-2 bg-secondary/30 rounded-xl p-1">
                    <Input
                      placeholder={`Comensal ${index + 1}`}
                      value={diner.name}
                      onChange={(e) => updateDinerName(diner.id, e.target.value)}
                      className="flex-1 h-12 text-base border-0 bg-transparent rounded-lg placeholder:text-muted-foreground/50"
                    />
                  </div>
                </SwipeableItem>
              ))}
            </div>

            {diners.length > 1 && (
              <p className="text-[11px] text-muted-foreground text-center mb-4 opacity-70">
                Desliza hacia la izquierda para eliminar
              </p>
            )}

            {/* Agregar nuevo comensal */}
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                placeholder="Agregar comensal..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDiner()}
                className="flex-1 h-14 text-base rounded-xl"
              />
              <Button
                onClick={addDiner}
                disabled={!newName.trim()}
                size="icon"
                className="shrink-0 h-14 w-14 rounded-xl touch-feedback"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contador de comensales */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {validCount < 2
                ? `Agrega ${2 - validCount} comensal${2 - validCount > 1 ? "es" : ""} mas`
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
            className="w-full h-14 text-base font-semibold rounded-xl touch-feedback shadow-lg shadow-primary/20"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
