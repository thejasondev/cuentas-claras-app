"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Receipt } from "lucide-react"
import { SwipeableItem } from "@/components/ui/swipeable-item"
import { getBills, deleteBill, type SavedBill } from "@/lib/storage"
import { formatCurrency } from "@/lib/currency"

interface HistoryScreenProps {
  onBack: () => void
  currency: string
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

export function HistoryScreen({ onBack, currency, showToast }: HistoryScreenProps) {
  const [bills, setBills] = useState<SavedBill[]>([])

  useEffect(() => {
    setBills(getBills())
  }, [])

  const handleDelete = (id: string) => {
    deleteBill(id)
    setBills(getBills())
    showToast("Cuenta eliminada", "info")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-6 safe-top">
        <div className="max-w-md mx-auto mt-4">
          <h1 className="text-2xl font-bold tracking-tight">Historial</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">{bills.length} cuentas guardadas</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full overflow-y-auto scroll-smooth-touch scrollbar-hide">
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Sin historial</h3>
            <p className="text-muted-foreground text-sm">Las cuentas que compartas se guardaran aqui</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs text-muted-foreground mb-3 px-1">Desliza hacia la izquierda para eliminar</p>

            {bills.map((bill, index) => (
              <SwipeableItem key={bill.id} onDelete={() => handleDelete(bill.id)}>
                <Card className="shadow-sm animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{formatCurrency(bill.total, bill.currency)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(bill.date)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-secondary/50 rounded-lg py-2">
                        <p className="text-lg font-semibold">{bill.diners.length}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Personas</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg py-2">
                        <p className="text-lg font-semibold">{bill.items.length}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Platos</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg py-2">
                        <p className="text-lg font-semibold">{bill.servicePercent}%</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Servicio</p>
                      </div>
                    </div>

                    {bill.diners.filter((d) => d.paid).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Pagaron:</p>
                        <div className="flex flex-wrap gap-1">
                          {bill.diners
                            .filter((d) => d.paid)
                            .map((d) => (
                              <span
                                key={d.id}
                                className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full"
                              >
                                {d.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SwipeableItem>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
