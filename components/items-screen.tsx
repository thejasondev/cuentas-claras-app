"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Plus, UtensilsCrossed, Pencil, X } from "lucide-react"
import { SwipeableItem } from "@/components/ui/swipeable-item"
import { ProgressSteps } from "@/components/ui/progress-steps"
import type { Diner, Item } from "@/app/page"
import { formatCurrency } from "@/lib/currency"

interface ItemsScreenProps {
  diners: Diner[]
  items: Item[]
  setItems: (items: Item[]) => void
  onComplete: () => void
  onBack: () => void
  currency: string
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

export function ItemsScreen({ diners, items, setItems, onComplete, onBack, currency, showToast }: ItemsScreenProps) {
  const [itemName, setItemName] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [selectedDiners, setSelectedDiners] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(items.length === 0)
  const formRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      setTimeout(() => nameInputRef.current?.focus(), 300)
    }
  }, [showForm])

  const handleAllToggle = (checked: boolean) => {
    setIsAllSelected(checked)
    if (checked) {
      setSelectedDiners(diners.map((d) => d.id))
    } else {
      setSelectedDiners([])
    }
  }

  const handleDinerToggle = (dinerId: string, checked: boolean) => {
    if (checked) {
      const newSelected = [...selectedDiners, dinerId]
      setSelectedDiners(newSelected)
      if (newSelected.length === diners.length) {
        setIsAllSelected(true)
      }
    } else {
      setSelectedDiners(selectedDiners.filter((id) => id !== dinerId))
      setIsAllSelected(false)
    }
  }

  const addItem = () => {
    if (itemName.trim() && itemPrice && selectedDiners.length > 0) {
      if (editingItemId) {
        setItems(
          items.map((item) =>
            item.id === editingItemId
              ? {
                  ...item,
                  name: itemName.trim(),
                  price: Number.parseFloat(itemPrice),
                  assignedTo: isAllSelected ? ["all"] : selectedDiners,
                }
              : item,
          ),
        )
        showToast("Plato actualizado")
        setEditingItemId(null)
      } else {
        const newItem: Item = {
          id: crypto.randomUUID(),
          name: itemName.trim(),
          price: Number.parseFloat(itemPrice),
          assignedTo: isAllSelected ? ["all"] : selectedDiners,
        }
        setItems([...items, newItem])
        showToast(`${itemName.trim()} agregado`)
      }
      resetForm()
    }
  }

  const resetForm = () => {
    setItemName("")
    setItemPrice("")
    setSelectedDiners([])
    setIsAllSelected(false)
    if (items.length > 0 || editingItemId) {
      setShowForm(false)
    }
  }

  const removeItem = (id: string) => {
    const item = items.find((i) => i.id === id)
    setItems(items.filter((i) => i.id !== id))
    if (item) {
      showToast(`${item.name} eliminado`, "info")
    }
    if (editingItemId === id) {
      setEditingItemId(null)
      resetForm()
    }
  }

  const startEditItem = (item: Item) => {
    setEditingItemId(item.id)
    setItemName(item.name)
    setItemPrice(item.price.toString())
    if (item.assignedTo.includes("all")) {
      setIsAllSelected(true)
      setSelectedDiners(diners.map((d) => d.id))
    } else {
      setIsAllSelected(false)
      setSelectedDiners(item.assignedTo)
    }
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    resetForm()
    setShowForm(false)
  }

  const getAssignedNames = (item: Item) => {
    if (item.assignedTo.includes("all")) return "Todos"
    return item.assignedTo
      .map((id) => diners.find((d) => d.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-3 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-11 w-11 rounded-xl touch-feedback"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Registrar Consumo</h1>
            <p className="text-primary-foreground/80 text-xs">{diners.length} comensales</p>
          </div>
        </div>
      </header>

      <div className="bg-card border-b shadow-sm">
        <div className="max-w-md mx-auto">
          <ProgressSteps currentStep={1} totalSteps={3} labels={["Mesa", "Pedido", "Cuenta"]} />
        </div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full overflow-y-auto scroll-smooth-touch scrollbar-hide pb-36">
        {showForm && (
          <Card className="mb-5 shadow-sm animate-slide-up" ref={formRef}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold">{editingItemId ? "Editar plato" : "Agregar plato"}</h2>
                </div>
                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelEdit}
                    className="h-10 w-10 rounded-xl touch-feedback"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <Input
                  ref={nameInputRef}
                  placeholder="Nombre del plato"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="h-14 text-base rounded-xl"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Precio"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="h-14 text-base rounded-xl"
                  min="0"
                  step="0.01"
                />

                {/* Asignacion */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Quien lo consumio?</p>

                  <div
                    className="flex items-center space-x-3 p-4 rounded-xl bg-primary/5 border-2 border-primary/20 touch-feedback cursor-pointer"
                    onClick={() => handleAllToggle(!isAllSelected)}
                  >
                    <Checkbox id="all" checked={isAllSelected} onCheckedChange={handleAllToggle} className="h-6 w-6" />
                    <Label htmlFor="all" className="text-base font-medium cursor-pointer flex-1">
                      Todos (compartido)
                    </Label>
                  </div>

                  {/* Comensales individuales */}
                  <div className="grid grid-cols-2 gap-2">
                    {diners.map((diner) => (
                      <div
                        key={diner.id}
                        className={`flex items-center space-x-2 p-3.5 rounded-xl border touch-feedback cursor-pointer transition-colors ${
                          selectedDiners.includes(diner.id) ? "bg-primary/5 border-primary/30" : "border-border"
                        }`}
                        onClick={() => handleDinerToggle(diner.id, !selectedDiners.includes(diner.id))}
                      >
                        <Checkbox
                          id={diner.id}
                          checked={selectedDiners.includes(diner.id)}
                          onCheckedChange={(checked) => handleDinerToggle(diner.id, checked as boolean)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor={diner.id} className="text-sm cursor-pointer truncate flex-1">
                          {diner.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={addItem}
                    disabled={!itemName.trim() || !itemPrice || selectedDiners.length === 0}
                    className="flex-1 h-14 text-base rounded-xl touch-feedback"
                  >
                    {editingItemId ? (
                      <>
                        <Pencil className="mr-2 h-5 w-5" />
                        Actualizar
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Agregar
                      </>
                    )}
                  </Button>
                  {editingItemId && (
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      className="h-14 px-5 rounded-xl bg-transparent touch-feedback"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de platos */}
        {items.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-muted-foreground text-sm">Pedido ({items.length})</h3>
              <span className="text-xs text-muted-foreground">Desliza para eliminar</span>
            </div>

            {items.map((item, index) => (
              <SwipeableItem key={item.id} onDelete={() => removeItem(item.id)}>
                <Card
                  className={`shadow-sm ${editingItemId === item.id ? "ring-2 ring-primary" : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="py-3.5 px-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{getAssignedNames(item)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{formatCurrency(item.price, currency)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditItem(item)}
                        className="text-muted-foreground hover:text-primary h-10 w-10 rounded-xl touch-feedback"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SwipeableItem>
            ))}

            <div className="flex justify-between items-center pt-4 px-1 border-t mt-4 pr-28">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="font-bold text-xl">{formatCurrency(total, currency)}</span>
            </div>
          </div>
        )}

        {/* Estado vacio */}
        {items.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Sin platos</h3>
            <p className="text-muted-foreground text-sm mb-5">Agrega los platos consumidos</p>
            <Button onClick={() => setShowForm(true)} className="rounded-xl touch-feedback">
              <Plus className="mr-2 h-5 w-5" />
              Agregar plato
            </Button>
          </div>
        )}
      </div>

      {!showForm && items.length > 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed right-4 bottom-24 z-30 flex items-center justify-center h-14 min-w-14 px-5 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 touch-feedback no-select transition-all duration-200 hover:shadow-2xl hover:scale-105"
          aria-label="Agregar"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          <span className="ml-2 font-semibold text-sm">Agregar</span>
        </button>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t px-4 py-6 safe-bottom">
        <div className="max-w-md mx-auto pb-4">
          <Button
            onClick={onComplete}
            disabled={items.length === 0}
            className="w-full h-14 text-base font-semibold rounded-xl touch-feedback shadow-lg shadow-primary/20"
          >
            Ver Resumen
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
