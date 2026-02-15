"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  UtensilsCrossed,
  Pencil,
  X,
  Users,
} from "lucide-react";
import { SwipeableItem } from "@/components/ui/swipeable-item";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import type { Diner, Item } from "@/app/page";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface ItemsScreenProps {
  diners: Diner[];
  items: Item[];
  setItems: (items: Item[]) => void;
  onComplete: () => void;
  onBack: () => void;
  currency: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function ItemsScreen({
  diners,
  items,
  setItems,
  onComplete,
  onBack,
  currency,
  showToast,
}: ItemsScreenProps) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [selectedDiners, setSelectedDiners] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isShared, setIsShared] = useState(true); // true = compartido, false = cada uno
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(items.length === 0);
  const formRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => nameInputRef.current?.focus(), 300);
    }
  }, [showForm]);

  const handleAllToggle = (checked: boolean) => {
    setIsAllSelected(checked);
    if (checked) {
      setSelectedDiners(diners.map((d) => d.id));
    } else {
      setSelectedDiners([]);
    }
  };

  const handleDinerToggle = (dinerId: string) => {
    const isSelected = selectedDiners.includes(dinerId);
    if (isSelected) {
      const newSelected = selectedDiners.filter((id) => id !== dinerId);
      setSelectedDiners(newSelected);
      setIsAllSelected(false);
    } else {
      const newSelected = [...selectedDiners, dinerId];
      setSelectedDiners(newSelected);
      if (newSelected.length === diners.length) {
        setIsAllSelected(true);
      }
    }
  };

  const addItem = () => {
    if (itemName.trim() && itemPrice && selectedDiners.length > 0) {
      if (editingItemId) {
        setItems(
          items.map((item) =>
            item.id === editingItemId
              ? {
                  ...item,
                  name: itemName.trim(),
                  price: safeParsePrice(itemPrice),
                  assignedTo: isAllSelected ? ["all"] : selectedDiners,
                  isShared: selectedDiners.length >= 2 ? isShared : true,
                }
              : item,
          ),
        );
        showToast("Plato actualizado");
        setEditingItemId(null);
      } else {
        const newItem: Item = {
          id: crypto.randomUUID(),
          name: itemName.trim(),
          price: safeParsePrice(itemPrice),
          assignedTo: isAllSelected ? ["all"] : selectedDiners,
          isShared: selectedDiners.length >= 2 ? isShared : true,
        };
        setItems([...items, newItem]);
        showToast(`${itemName.trim()} agregado`);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setItemName("");
    setItemPrice("");
    setSelectedDiners([]);
    setIsAllSelected(false);
    setIsShared(true);
    if (items.length > 0 || editingItemId) {
      setShowForm(false);
    }
  };

  const removeItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems(items.filter((i) => i.id !== id));
    if (item) {
      showToast(`${item.name} eliminado`, "info");
    }
    if (editingItemId === id) {
      setEditingItemId(null);
      resetForm();
    }
  };

  const startEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setIsShared(item.isShared ?? true);
    if (item.assignedTo.includes("all")) {
      setIsAllSelected(true);
      setSelectedDiners(diners.map((d) => d.id));
    } else {
      setIsAllSelected(false);
      setSelectedDiners(item.assignedTo);
    }
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    resetForm();
    setShowForm(false);
  };

  const getAssignedNames = (item: Item) => {
    if (item.assignedTo.includes("all")) return "Todos";
    return item.assignedTo
      .map((id) => diners.find((d) => d.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  // Parseo seguro del precio (evita NaN)
  const safeParsePrice = (value: string): number => {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  };

  // Subtotal real de la mesa (respeta isShared)
  const total = items.reduce((sum, item) => {
    const itemIsShared = item.isShared ?? true;
    if (itemIsShared) {
      // Compartido: el precio ya es el total del plato
      return sum + item.price;
    } else {
      // Cada uno: multiplicar por comensales asignados
      const assignedCount = item.assignedTo.includes("all")
        ? diners.length
        : item.assignedTo.length;
      return sum + item.price * assignedCount;
    }
  }, 0);

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header className="header-gradient text-primary-foreground px-4 pt-6 pb-4 safe-top shrink-0">
        <div className="max-w-md mx-auto flex items-center gap-3 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-11 w-11 rounded-xl touch-feedback focus-ring"
            aria-label="Volver a la pantalla anterior"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Registrar Consumo</h1>
            <p className="text-primary-foreground/80 text-xs">
              {diners.length} comensales
            </p>
          </div>
        </div>
      </header>

      <div className="bg-card border-b card-shadow shrink-0">
        <div className="max-w-md mx-auto">
          <ProgressSteps
            currentStep={1}
            totalSteps={3}
            labels={["Mesa", "Pedido", "Cuenta"]}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-md mx-auto w-full scroll-smooth-touch scrollbar-hide">
        {showForm && (
          <Card className="mb-5 card-shadow animate-slide-up" ref={formRef}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold">
                    {editingItemId ? "Editar plato" : "Agregar plato"}
                  </h2>
                </div>
                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelEdit}
                    className="h-10 w-10 rounded-xl touch-feedback focus-ring"
                    aria-label="Cancelar"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="item-name" className="sr-only">
                    Nombre del plato
                  </Label>
                  <Input
                    id="item-name"
                    ref={nameInputRef}
                    placeholder="Nombre del plato"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="h-14 text-base rounded-xl focus-ring"
                  />
                </div>

                {/* Input de precio con símbolo de moneda */}
                <div className="relative">
                  <Label htmlFor="item-price" className="sr-only">
                    Precio
                  </Label>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg pointer-events-none">
                    {currencySymbol}
                  </span>
                  <Input
                    id="item-price"
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className={cn(
                      "h-14 text-base rounded-xl focus-ring text-right font-bold pr-4",
                      currency === "CUP" ? "pl-14" : "pl-10",
                    )}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Asignación con chips */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    ¿Quién lo consumió?
                  </p>

                  {/* Opción "Todos" */}
                  <button
                    type="button"
                    onClick={() => handleAllToggle(!isAllSelected)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all touch-feedback",
                      isAllSelected
                        ? "bg-primary/10 border-primary shadow-md"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-full transition-colors",
                        isAllSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <Users className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "text-base font-medium flex-1 text-left",
                        isAllSelected && "text-primary",
                      )}
                    >
                      Todos
                    </span>
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleAllToggle}
                      className="h-6 w-6 pointer-events-none"
                      aria-hidden="true"
                    />
                  </button>

                  {/* Chips de comensales individuales */}
                  <div className="flex flex-wrap gap-2">
                    {diners.map((diner) => {
                      const isSelected = selectedDiners.includes(diner.id);
                      return (
                        <button
                          key={diner.id}
                          type="button"
                          onClick={() => handleDinerToggle(diner.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all touch-feedback",
                            isSelected
                              ? "bg-primary/10 border-primary shadow-sm scale-105"
                              : "border-border hover:border-primary/50",
                          )}
                          data-pressed={isSelected ? "true" : "false"}
                        >
                          <AvatarInitials name={diner.name} size="sm" />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSelected && "text-primary",
                            )}
                          >
                            {diner.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggle Compartido / Cada uno - solo aparece con 2+ personas */}
                {selectedDiners.length >= 2 && (
                  <div className="animate-fade-in">
                    <p className="text-xs text-muted-foreground mb-2">
                      ¿Cómo dividir este plato?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsShared(true)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 transition-all touch-feedback text-sm",
                          isShared
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : "border-border text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        <span className="text-base">🔀</span>
                        <span>Compartido</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsShared(false)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 transition-all touch-feedback text-sm",
                          !isShared
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : "border-border text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        <span className="text-base">🍽️</span>
                        <span>Cada uno</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Vista previa de división */}
                {itemPrice && selectedDiners.length > 0 && (
                  <div className="bg-secondary/50 rounded-xl p-4 animate-fade-in">
                    <p className="text-xs text-muted-foreground mb-2">
                      Vista previa:
                    </p>
                    {selectedDiners.length >= 2 && !isShared ? (
                      // Cada uno paga el total
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted-foreground">
                            {selectedDiners.length} personas ×{" "}
                            {formatCurrency(
                              safeParsePrice(itemPrice),
                              currency,
                            )}
                          </span>
                          <span className="font-bold text-lg text-primary">
                            {formatCurrency(
                              safeParsePrice(itemPrice),
                              currency,
                            )}{" "}
                            c/u
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total:{" "}
                          {formatCurrency(
                            safeParsePrice(itemPrice) * selectedDiners.length,
                            currency,
                          )}
                        </p>
                      </div>
                    ) : (
                      // Compartido - dividir entre personas
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">
                          {selectedDiners.length === 1
                            ? "1 persona"
                            : `${selectedDiners.length} personas`}
                        </span>
                        <span className="font-bold text-lg text-primary">
                          {formatCurrency(
                            safeParsePrice(itemPrice) / selectedDiners.length,
                            currency,
                          )}{" "}
                          c/u
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={addItem}
                    disabled={
                      !itemName.trim() ||
                      !itemPrice ||
                      selectedDiners.length === 0
                    }
                    className="flex-1 h-14 text-base rounded-xl touch-feedback focus-ring"
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
                      className="h-14 px-5 rounded-xl bg-transparent touch-feedback focus-ring"
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
              <h3 className="font-semibold text-muted-foreground text-sm">
                Pedido ({items.length})
              </h3>
              <span className="text-xs text-muted-foreground">
                Desliza para eliminar
              </span>
            </div>

            {items.map((item, index) => (
              <SwipeableItem key={item.id} onDelete={() => removeItem(item.id)}>
                <Card
                  className={cn(
                    "card-shadow animate-fade-in",
                    editingItemId === item.id && "ring-2 ring-primary",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="py-3.5 px-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {item.assignedTo.includes("all") ? (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            Todos
                          </span>
                        ) : (
                          <div className="flex -space-x-2">
                            {item.assignedTo.slice(0, 3).map((id) => {
                              const diner = diners.find((d) => d.id === id);
                              return diner ? (
                                <AvatarInitials
                                  key={id}
                                  name={diner.name}
                                  size="sm"
                                  className="ring-2 ring-card"
                                />
                              ) : null;
                            })}
                            {item.assignedTo.length > 3 && (
                              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-bold ring-2 ring-card">
                                +{item.assignedTo.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        {formatCurrency(item.price, currency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditItem(item)}
                        className="text-muted-foreground hover:text-primary h-10 w-10 rounded-xl touch-feedback focus-ring"
                        aria-label={`Editar ${item.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SwipeableItem>
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {items.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Sin platos</h3>
            <p className="text-muted-foreground text-sm mb-5">
              Agrega los platos consumidos
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-xl touch-feedback focus-ring"
            >
              <Plus className="mr-2 h-5 w-5" />
              Agregar plato
            </Button>
          </div>
        )}
      </div>

      {/* Footer unificado - estático en el flex column */}
      {!showForm && (
        <div className="shrink-0 bg-background border-t">
          <div className="max-w-md mx-auto px-5 py-3">
            {items.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Subtotal
                  </span>
                  <p className="text-lg font-bold">
                    {formatCurrency(total, currency)}
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors touch-feedback"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </button>
              </div>
            )}
            <Button
              onClick={onComplete}
              disabled={items.length === 0}
              className="w-full h-12 text-base font-semibold rounded-2xl touch-feedback shadow-lg shadow-primary/25 focus-ring"
            >
              Ver Resumen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
