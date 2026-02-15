"use client";

import { useState, useEffect, useCallback } from "react";
import { SetupScreen } from "@/components/setup-screen";
import { ItemsScreen } from "@/components/items-screen";
import { SummaryScreen } from "@/components/summary-screen";
import { HistoryScreen } from "@/components/history-screen";
import { SettingsScreen } from "@/components/settings-screen";
import { OnboardingScreen } from "@/components/onboarding-screen";
import { BottomNav } from "@/components/ui/bottom-nav";
import { ToastNotification } from "@/components/ui/toast-notification";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  getSettings,
  saveSettings,
  saveFrequentDiners,
  saveBill,
  type AppSettings,
} from "@/lib/storage";

export type Diner = {
  id: string;
  name: string;
  paid: boolean;
};

export type Item = {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
  isShared: boolean; // true = dividir entre comensales, false = cada uno paga el total
};

type ToastState = {
  message: string;
  type: "success" | "error" | "info";
} | null;

type AppStep = "setup" | "items" | "summary" | "history" | "settings";

const STORAGE_KEY = "cuentas_claras_current_bill";
const ONBOARDING_KEY = "onboarding_completed";

// Persistir estado actual
const saveCurrentBill = (diners: Diner[], items: Item[], step: AppStep) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ diners, items, step }));
  }
};

// Cargar estado guardado
const loadCurrentBill = (): {
  diners: Diner[];
  items: Item[];
  step: AppStep;
} | null => {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

// Limpiar estado guardado
const clearCurrentBill = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export default function Home() {
  const [step, setStep] = useState<AppStep>("setup");
  const [diners, setDiners] = useState<Diner[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    servicePercent: 10,
    currency: "USD",
    theme: "light",
  });
  const [toast, setToast] = useState<ToastState>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConfirmNewBill, setShowConfirmNewBill] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar configuración y estado guardado al iniciar
  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    document.documentElement.classList.toggle(
      "dark",
      loadedSettings.theme === "dark",
    );

    // Verificar si es la primera vez
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }

    // Cargar cuenta en progreso
    const savedBill = loadCurrentBill();
    if (
      savedBill &&
      (savedBill.diners.length > 0 || savedBill.items.length > 0)
    ) {
      setDiners(savedBill.diners);
      setItems(savedBill.items);
      // Solo restaurar el step si es uno de los pasos del flujo principal
      if (savedBill.step === "items" || savedBill.step === "summary") {
        setStep(savedBill.step);
      }
    }

    setIsLoaded(true);
  }, []);

  // Guardar progreso automáticamente
  useEffect(() => {
    if (isLoaded && (diners.length > 0 || items.length > 0)) {
      saveCurrentBill(diners, items, step);
    }
  }, [diners, items, step, isLoaded]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type });
    },
    [],
  );

  const handleSettingsUpdate = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSetupComplete = (newDiners: Diner[]) => {
    setDiners(newDiners);
    setStep("items");
  };

  const handleItemsComplete = () => {
    setStep("summary");
  };

  const handleBack = () => {
    if (step === "items") setStep("setup");
    if (step === "summary") setStep("items");
    if (step === "history" || step === "settings") setStep("setup");
  };

  const handleNewBillRequest = () => {
    // Verificar si todos han pagado (cuenta ya guardada en historial)
    const allPaid = diners.length > 0 && diners.every((d) => d.paid);

    if (allPaid) {
      // Todos pagaron - la cuenta ya está en historial, no necesita confirmación
      handleNewBill(true);
    } else if (diners.length > 0 || items.length > 0) {
      // Hay datos sin guardar - pedir confirmación
      setShowConfirmNewBill(true);
    } else {
      // No hay datos - crear nueva directamente
      handleNewBill(false);
    }
  };

  const handleNewBill = (wasCompleted: boolean = false) => {
    // Si la cuenta estaba completa o tiene datos válidos, guardarla en historial
    if (diners.length > 0 && items.length > 0) {
      // Calcular total para el historial
      const total = items.reduce((sum, item) => sum + item.price, 0);

      // Guardar en historial
      saveBill({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        diners,
        items,
        servicePercent: settings.servicePercent,
        currency: settings.currency,
        total,
      });

      // Guardar comensales frecuentes
      saveFrequentDiners(diners.map((d) => d.name).filter(Boolean));
    }

    setDiners([]);
    setItems([]);
    setStep("setup");
    clearCurrentBill();
    if (wasCompleted) {
      showToast("¡Cuenta guardada en historial! ✓", "success");
    } else {
      showToast("Nueva cuenta iniciada", "info");
    }
  };

  const handleNavigate = (screen: "setup" | "history" | "settings") => {
    if (step === "items" || step === "summary") {
      // Si está en medio de una cuenta, ir al setup primero
      setStep("setup");
      setTimeout(() => setStep(screen), 0);
    } else {
      setStep(screen);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const showBottomNav =
    step === "setup" || step === "history" || step === "settings";

  // Mostrar onboarding si es la primera vez
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <main className="min-h-screen bg-background">
      {step === "setup" && (
        <SetupScreen
          onComplete={handleSetupComplete}
          initialDiners={diners}
          showToast={showToast}
        />
      )}
      {step === "items" && (
        <ItemsScreen
          diners={diners}
          items={items}
          setItems={setItems}
          onComplete={handleItemsComplete}
          onBack={handleBack}
          currency={settings.currency}
          showToast={showToast}
        />
      )}
      {step === "summary" && (
        <SummaryScreen
          diners={diners}
          setDiners={setDiners}
          items={items}
          onBack={handleBack}
          onNewBill={handleNewBillRequest}
          servicePercent={settings.servicePercent}
          currency={settings.currency}
          showToast={showToast}
        />
      )}
      {step === "history" && (
        <HistoryScreen
          onBack={handleBack}
          currency={settings.currency}
          showToast={showToast}
        />
      )}
      {step === "settings" && (
        <SettingsScreen
          settings={settings}
          onUpdate={handleSettingsUpdate}
          onBack={handleBack}
          showToast={showToast}
        />
      )}

      {showBottomNav && (
        <BottomNav activeScreen={step} onNavigate={handleNavigate} />
      )}

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Diálogo de confirmación para nueva cuenta */}
      <ConfirmDialog
        open={showConfirmNewBill}
        onOpenChange={setShowConfirmNewBill}
        title="¿Crear nueva cuenta?"
        description="Se perderán los datos de la cuenta actual. Esta acción no se puede deshacer."
        confirmLabel="Sí, crear nueva"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setShowConfirmNewBill(false);
          handleNewBill();
        }}
        variant="destructive"
      />
    </main>
  );
}
