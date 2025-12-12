export interface SavedBill {
  id: string
  date: string
  diners: Array<{ id: string; name: string; paid: boolean }>
  items: Array<{ id: string; name: string; price: number; assignedTo: string[] }>
  servicePercent: number
  currency: string
  total: number
}

const STORAGE_KEY = "cuentas-claras-bills"
const SETTINGS_KEY = "cuentas-claras-settings"

export interface AppSettings {
  servicePercent: number
  currency: string
  theme: "light" | "dark"
}

export const defaultSettings: AppSettings = {
  servicePercent: 10,
  currency: "CUP",
  theme: "light",
}

export function saveBill(bill: SavedBill): void {
  try {
    const bills = getBills()
    bills.unshift(bill)
    // Keep only last 20 bills
    const trimmedBills = bills.slice(0, 20)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedBills))
  } catch (error) {
    console.error("Error saving bill:", error)
  }
}

export function getBills(): SavedBill[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error loading bills:", error)
    return []
  }
}

export function deleteBill(id: string): void {
  try {
    const bills = getBills().filter((bill) => bill.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
  } catch (error) {
    console.error("Error deleting bill:", error)
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    // Apply theme immediately
    document.documentElement.classList.toggle("dark", settings.theme === "dark")
  } catch (error) {
    console.error("Error saving settings:", error)
  }
}

export function getSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings
  } catch (error) {
    console.error("Error loading settings:", error)
    return defaultSettings
  }
}
