"use client"

import { useState, useEffect, useCallback } from "react"
import { SetupScreen } from "@/components/setup-screen"
import { ItemsScreen } from "@/components/items-screen"
import { SummaryScreen } from "@/components/summary-screen"
import { HistoryScreen } from "@/components/history-screen"
import { SettingsScreen } from "@/components/settings-screen"
import { BottomNav } from "@/components/ui/bottom-nav"
import { ToastNotification } from "@/components/ui/toast-notification"
import { getSettings, saveSettings, type AppSettings } from "@/lib/storage"

export type Diner = {
  id: string
  name: string
  paid: boolean
}

export type Item = {
  id: string
  name: string
  price: number
  assignedTo: string[]
}

type ToastState = {
  message: string
  type: "success" | "error" | "info"
} | null

export default function Home() {
  const [step, setStep] = useState<"setup" | "items" | "summary" | "history" | "settings">("setup")
  const [diners, setDiners] = useState<Diner[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [settings, setSettings] = useState<AppSettings>({
    servicePercent: 10,
    currency: "USD",
    theme: "light",
  })
  const [toast, setToast] = useState<ToastState>(null)

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
    document.documentElement.classList.toggle("dark", loadedSettings.theme === "dark")
  }, [])

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type })
  }, [])

  const handleSettingsUpdate = (newSettings: AppSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleSetupComplete = (newDiners: Diner[]) => {
    setDiners(newDiners)
    setStep("items")
  }

  const handleItemsComplete = () => {
    setStep("summary")
  }

  const handleBack = () => {
    if (step === "items") setStep("setup")
    if (step === "summary") setStep("items")
    if (step === "history" || step === "settings") setStep("setup")
  }

  const handleNewBill = () => {
    setDiners([])
    setItems([])
    setStep("setup")
  }

  const handleNavigate = (screen: "setup" | "history" | "settings") => {
    if (step === "items" || step === "summary") {
      // If in the middle of a bill, go back to setup first
      setStep("setup")
      setTimeout(() => setStep(screen), 0)
    } else {
      setStep(screen)
    }
  }

  const showBottomNav = step === "setup" || step === "history" || step === "settings"

  return (
    <main className="min-h-screen bg-background">
      {step === "setup" && (
        <SetupScreen onComplete={handleSetupComplete} initialDiners={diners} showToast={showToast} />
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
          onNewBill={handleNewBill}
          servicePercent={settings.servicePercent}
          currency={settings.currency}
          showToast={showToast}
        />
      )}
      {step === "history" && <HistoryScreen onBack={handleBack} currency={settings.currency} showToast={showToast} />}
      {step === "settings" && (
        <SettingsScreen settings={settings} onUpdate={handleSettingsUpdate} onBack={handleBack} showToast={showToast} />
      )}

      {showBottomNav && <BottomNav activeScreen={step} onNavigate={handleNavigate} />}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}
