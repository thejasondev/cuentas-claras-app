"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Share2,
  Check,
  Copy,
  RotateCcw,
  Receipt,
  PartyPopper,
  Users,
  Calculator,
} from "lucide-react";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import type { Diner, Item } from "@/app/page";
import { saveBill, type SavedBill } from "@/lib/storage";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface SummaryScreenProps {
  diners: Diner[];
  setDiners: (diners: Diner[]) => void;
  items: Item[];
  onBack: () => void;
  onNewBill: () => void;
  servicePercent: number;
  currency: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

interface DinerSummary {
  diner: Diner;
  subtotal: number;
  service: number;
  total: number;
}

type DivisionMode = "consumption" | "equal";

// Feedback háptico
const triggerHaptic = (style: "light" | "medium" | "heavy" = "light") => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(style === "light" ? 10 : style === "medium" ? 25 : 50);
  }
};

export function SummaryScreen({
  diners,
  setDiners,
  items,
  onBack,
  onNewBill,
  servicePercent,
  currency,
  showToast,
}: SummaryScreenProps) {
  const [divisionMode, setDivisionMode] = useState<DivisionMode>("consumption");
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [isSavedToHistory, setIsSavedToHistory] = useState(false);

  const summaries = useMemo(() => {
    // Calcular el total real de la mesa (respetando isShared)
    const getRealTotal = () => {
      return items.reduce((sum, item) => {
        const itemIsShared = item.isShared ?? true;
        if (itemIsShared) {
          // Compartido: el precio es el total del plato
          return sum + item.price;
        } else {
          // Cada uno: el precio se multiplica por la cantidad de comensales asignados
          const assignedCount = item.assignedTo.includes("all")
            ? diners.length
            : item.assignedTo.length;
          return sum + item.price * assignedCount;
        }
      }, 0);
    };

    return diners.map((diner) => {
      let subtotal = 0;

      if (divisionMode === "equal") {
        // División igualitaria: total real de la mesa / cantidad de comensales
        subtotal = getRealTotal() / diners.length;
      } else {
        // División por consumo
        items.forEach((item) => {
          const itemIsShared = item.isShared ?? true;

          if (item.assignedTo.includes("all")) {
            if (itemIsShared) {
              // Todos comparten - dividir entre todos
              subtotal += item.price / diners.length;
            } else {
              // Cada uno paga el total
              subtotal += item.price;
            }
          } else if (item.assignedTo.includes(diner.id)) {
            if (itemIsShared) {
              // Compartido - dividir entre los asignados
              subtotal += item.price / item.assignedTo.length;
            } else {
              // Cada uno - cada persona paga el precio completo
              subtotal += item.price;
            }
          }
        });
      }

      const service = subtotal * (servicePercent / 100);
      const total = subtotal + service;

      return {
        diner,
        subtotal,
        service,
        total,
      } as DinerSummary;
    });
  }, [diners, items, servicePercent, divisionMode]);

  const grandTotal = summaries.reduce((sum, s) => sum + s.total, 0);
  const paidCount = diners.filter((d) => d.paid).length;
  const paidTotal = summaries
    .filter((s) => s.diner.paid)
    .reduce((sum, s) => sum + s.total, 0);
  const pendingTotal = grandTotal - paidTotal;
  const progressPercent =
    diners.length > 0 ? (paidCount / diners.length) * 100 : 0;

  // Celebración cuando todos han pagado
  const triggerCelebration = useCallback(() => {
    if (!hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      triggerHaptic("heavy");

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#36eb00", "#22c55e", "#10b981", "#059669"],
      });

      // Segundo burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#36eb00", "#22c55e"],
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#36eb00", "#22c55e"],
        });
      }, 400);
    }
  }, [hasTriggeredConfetti]);

  useEffect(() => {
    if (paidCount === diners.length && diners.length > 0) {
      triggerCelebration();
    }
  }, [paidCount, diners.length, triggerCelebration]);

  const togglePaid = (dinerId: string) => {
    const diner = diners.find((d) => d.id === dinerId);
    const newPaidStatus = !diner?.paid;
    setDiners(
      diners.map((d) => (d.id === dinerId ? { ...d, paid: newPaidStatus } : d)),
    );

    triggerHaptic(newPaidStatus ? "medium" : "light");

    if (diner) {
      showToast(
        newPaidStatus ? `${diner.name} ha pagado` : `${diner.name} pendiente`,
        newPaidStatus ? "success" : "info",
      );
    }
  };

  const generateShareText = () => {
    let text = "*Cuentas Claras*\n\n";
    text += "*Resumen de la cuenta:*\n";
    text += "─────────────────\n";

    summaries.forEach((s) => {
      const status = s.diner.paid ? "✅" : "⏳";
      text += `${status} ${s.diner.name}: ${formatCurrency(
        s.total,
        currency,
      )}\n`;
    });

    text += "─────────────────\n";
    text += `*Total Mesa: ${formatCurrency(grandTotal, currency)}*\n`;
    text += `Pagado: ${paidCount}/${diners.length}`;
    if (divisionMode === "equal") {
      text += "\n(División en partes iguales)";
    }

    return text;
  };

  const saveBillToHistory = () => {
    if (isSavedToHistory) return; // Evitar duplicados
    const bill: SavedBill = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      diners: diners.map((d) => ({ ...d })),
      items: items.map((i) => ({ ...i })),
      servicePercent,
      currency,
      total: grandTotal,
    };
    saveBill(bill);
    setIsSavedToHistory(true);
  };

  const handleShare = async () => {
    const text = generateShareText();
    saveBillToHistory();

    if (navigator.share) {
      try {
        await navigator.share({ text });
        showToast("Cuenta compartida");
      } catch {
        await copyToClipboard(text);
      }
    } else {
      await copyToClipboard(text);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copiado al portapapeles");
      triggerHaptic("light");
    } catch {
      showToast("No se pudo copiar", "error");
    }
  };

  const allPaid = paidCount === diners.length && diners.length > 0;

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header className="header-gradient text-primary-foreground px-4 pt-4 pb-4 safe-top shrink-0">
        <div className="max-w-md mx-auto flex items-center gap-3 mt-4">
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
            <h1 className="text-lg font-bold">Resumen</h1>
            <p className="text-primary-foreground/80 text-xs">
              {paidCount}/{diners.length} han pagado
            </p>
          </div>
          {allPaid && (
            <div className="flex items-center gap-1 bg-primary-foreground/20 px-3 py-1.5 rounded-full animate-bounce-in">
              <PartyPopper className="h-4 w-4" />
              <span className="text-xs font-semibold">¡Completo!</span>
            </div>
          )}
        </div>
      </header>

      <div className="bg-card border-b card-shadow shrink-0">
        <div className="max-w-md mx-auto">
          <ProgressSteps
            currentStep={2}
            totalSteps={3}
            labels={["Mesa", "Pedido", "Cuenta"]}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-md mx-auto w-full scroll-smooth-touch scrollbar-hide">
        {/* Barra de progreso de pagos */}
        <div className="mb-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">
              Progreso de pagos
            </span>
            <span className="text-sm font-bold text-primary">
              {paidCount}/{diners.length}
            </span>
          </div>
          <ProgressBar value={progressPercent} label="Progreso de pagos" />
          {pendingTotal > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Pendiente:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(pendingTotal, currency)}
              </span>
            </p>
          )}
        </div>

        {/* Toggle de modo de división */}
        <div className="mb-5 animate-fade-in delay-100">
          <p className="text-sm text-muted-foreground font-medium mb-2">
            Modo de división
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDivisionMode("consumption")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all touch-feedback",
                divisionMode === "consumption"
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "border-border text-muted-foreground",
              )}
            >
              <Calculator className="h-4 w-4" />
              <span className="text-sm">Por consumo</span>
            </button>
            <button
              onClick={() => setDivisionMode("equal")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all touch-feedback",
                divisionMode === "equal"
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "border-border text-muted-foreground",
              )}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm">Partes iguales</span>
            </button>
          </div>
        </div>

        {/* Resumen por comensal */}
        <div className="space-y-2.5 mb-5">
          {summaries.map((summary, index) => (
            <Card
              key={summary.diner.id}
              className={cn(
                "card-shadow animate-fade-in-up transition-all",
                summary.diner.paid && "bg-primary/5 border-primary/30",
                index === 0 && "delay-100",
                index === 1 && "delay-150",
                index === 2 && "delay-200",
                index === 3 && "delay-250",
                index === 4 && "delay-300",
                index >= 5 && "delay-350",
              )}
            >
              <CardContent className="py-4 px-4">
                <div
                  className="flex items-start justify-between mb-3 cursor-pointer touch-feedback rounded-lg -m-1 p-1"
                  onClick={() => togglePaid(summary.diner.id)}
                  role="button"
                  data-state={summary.diner.paid ? "checked" : "unchecked"}
                  aria-label={`Marcar a ${summary.diner.name} como ${
                    summary.diner.paid ? "pendiente" : "pagado"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <AvatarInitials name={summary.diner.name} size="lg" />
                      {summary.diner.paid && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 animate-scale-in">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-semibold text-lg transition-colors",
                        summary.diner.paid && "text-primary",
                      )}
                    >
                      {summary.diner.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {summary.diner.paid && (
                      <span className="text-primary flex items-center gap-1 text-xs font-semibold bg-primary/10 px-2 py-1 rounded-full animate-scale-in">
                        <Check className="h-3 w-3" />
                        Pagado
                      </span>
                    )}
                    <Checkbox
                      checked={summary.diner.paid}
                      onCheckedChange={() => togglePaid(summary.diner.id)}
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-sm ml-14">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(summary.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Servicio ({servicePercent}%)
                    </span>
                    <span>{formatCurrency(summary.service, currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                    <span>Total a pagar</span>
                    <span className="text-primary">
                      {formatCurrency(summary.total, currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total general */}
        <Card
          className={cn(
            "bg-primary text-primary-foreground shadow-lg transition-all",
            allPaid && "animate-bounce-in",
          )}
        >
          <CardContent className="py-5 px-5">
            <div className="flex items-center gap-3 mb-1">
              {allPaid ? (
                <PartyPopper className="h-5 w-5 opacity-80" />
              ) : (
                <Receipt className="h-5 w-5 opacity-80" />
              )}
              <span className="text-primary-foreground/90">
                {allPaid ? "¡Todos han pagado!" : "Total Mesa"}
              </span>
            </div>
            <span className="text-3xl font-bold">
              {formatCurrency(grandTotal, currency)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="shrink-0 bg-background border-t pb-[50px]">
        <div className="max-w-md mx-auto px-5 py-3 space-y-3">
          <Button
            onClick={handleShare}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl touch-feedback shadow-lg shadow-primary/25 focus-ring"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Enviar Cuenta
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(generateShareText())}
              className="flex-1 h-10 rounded-xl touch-feedback bg-transparent focus-ring"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
            <Button
              variant="outline"
              onClick={onNewBill}
              className="flex-1 h-10 rounded-xl bg-transparent touch-feedback focus-ring"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Nueva Cuenta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
