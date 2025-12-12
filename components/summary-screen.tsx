"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Share2, Check, Copy, RotateCcw, Receipt } from "lucide-react"
import { ProgressSteps } from "@/components/ui/progress-steps"
import type { Diner, Item } from "@/app/page"
import { saveBill, type SavedBill } from "@/lib/storage"
import { formatCurrency } from "@/lib/currency"

interface SummaryScreenProps {
  diners: Diner[]
  setDiners: (diners: Diner[]) => void
  items: Item[]
  onBack: () => void
  onNewBill: () => void
  servicePercent: number
  currency: string
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

interface DinerSummary {
  diner: Diner
  subtotal: number
  service: number
  total: number
}

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
  const summaries = useMemo(() => {
    return diners.map((diner) => {
      let subtotal = 0

      items.forEach((item) => {
        if (item.assignedTo.includes("all")) {
          subtotal += item.price / diners.length
        } else if (item.assignedTo.includes(diner.id)) {
          subtotal += item.price / item.assignedTo.length
        }
      })

      const service = subtotal * (servicePercent / 100)
      const total = subtotal + service

      return {
        diner,
        subtotal,
        service,
        total,
      } as DinerSummary
    })
  }, [diners, items, servicePercent])

  const grandTotal = summaries.reduce((sum, s) => sum + s.total, 0)
  const paidCount = diners.filter((d) => d.paid).length

  const togglePaid = (dinerId: string) => {
    const diner = diners.find((d) => d.id === dinerId)
    const newPaidStatus = !diner?.paid
    setDiners(diners.map((d) => (d.id === dinerId ? { ...d, paid: newPaidStatus } : d)))

    if (diner) {
      showToast(
        newPaidStatus ? `${diner.name} ha pagado` : `${diner.name} pendiente`,
        newPaidStatus ? "success" : "info",
      )
    }
  }

  const generateShareText = () => {
    let text = "*Cuentas Claras*\n\n"
    text += "*Resumen de la cuenta:*\n"
    text += "─────────────────\n"

    summaries.forEach((s) => {
      const status = s.diner.paid ? "[Pagado]" : "[Pendiente]"
      text += `${status} ${s.diner.name}: ${formatCurrency(s.total, currency)}\n`
    })

    text += "─────────────────\n"
    text += `*Total Mesa: ${formatCurrency(grandTotal, currency)}*\n`
    text += `Pagado: ${paidCount}/${diners.length}`

    return text
  }

  const saveBillToHistory = () => {
    const bill: SavedBill = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      diners: diners.map((d) => ({ ...d })),
      items: items.map((i) => ({ ...i })),
      servicePercent,
      currency,
      total: grandTotal,
    }
    saveBill(bill)
  }

  const handleShare = async () => {
    const text = generateShareText()
    saveBillToHistory()

    if (navigator.share) {
      try {
        await navigator.share({ text })
        showToast("Cuenta compartida")
      } catch {
        await copyToClipboard(text)
      }
    } else {
      await copyToClipboard(text)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast("Copiado al portapapeles")
    } catch {
      showToast("No se pudo copiar", "error")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-4 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-3 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-11 w-11 rounded-xl touch-feedback"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Resumen</h1>
            <p className="text-primary-foreground/80 text-xs">
              {paidCount}/{diners.length} han pagado
            </p>
          </div>
        </div>
      </header>

      <div className="bg-card border-b shadow-sm">
        <div className="max-w-md mx-auto">
          <ProgressSteps currentStep={2} totalSteps={3} labels={["Mesa", "Pedido", "Cuenta"]} />
        </div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full overflow-y-auto scroll-smooth-touch scrollbar-hide pb-52">
        {/* Resumen por comensal */}
        <div className="space-y-2.5 mb-5">
          {summaries.map((summary, index) => (
            <Card
              key={summary.diner.id}
              className={`shadow-sm animate-slide-up transition-all ${summary.diner.paid ? "bg-primary/5 border-primary/30" : ""}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="py-4 px-4">
                <div
                  className="flex items-start justify-between mb-3 cursor-pointer touch-feedback rounded-lg -m-1 p-1"
                  onClick={() => togglePaid(summary.diner.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={summary.diner.paid}
                      onCheckedChange={() => togglePaid(summary.diner.id)}
                      className="h-6 w-6"
                    />
                    <span className="font-semibold text-lg">{summary.diner.name}</span>
                  </div>
                  {summary.diner.paid && (
                    <span className="text-primary flex items-center gap-1 text-xs font-semibold bg-primary/10 px-2 py-1 rounded-full">
                      <Check className="h-3 w-3" />
                      Pagado
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-sm ml-9">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(summary.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicio ({servicePercent}%)</span>
                    <span>{formatCurrency(summary.service, currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                    <span>Total a pagar</span>
                    <span className="text-primary">{formatCurrency(summary.total, currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total general */}
        <Card className="bg-primary text-primary-foreground shadow-lg">
          <CardContent className="py-5 px-5">
            <div className="flex items-center gap-3 mb-1">
              <Receipt className="h-5 w-5 opacity-80" />
              <span className="text-primary-foreground/90">Total Mesa</span>
            </div>
            <span className="text-3xl font-bold">{formatCurrency(grandTotal, currency)}</span>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t px-4 py-4safe-bottom">
        <div className="max-w-md mx-auto space-y-3 mt-2">
          <Button
            onClick={handleShare}
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl touch-feedback shadow-lg shadow-primary/20"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Enviar Cuenta
          </Button>
          <div className="flex gap-3 mb-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(generateShareText())}
              className="flex-1 h-12 rounded-xl touch-feedback bg-transparent"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
            <Button
              variant="outline"
              onClick={onNewBill}
              className="flex-1 h-12 rounded-xl bg-transparent touch-feedback"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Nueva Cuenta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
