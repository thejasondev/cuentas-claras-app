export interface SavedBill {
  id: string;
  date: string;
  diners: Array<{ id: string; name: string; paid: boolean }>;
  items: Array<{
    id: string;
    name: string;
    price: number;
    assignedTo: string[];
  }>;
  servicePercent: number;
  currency: string;
  total: number;
}

const STORAGE_KEY = "cuentas-claras-bills";
const SETTINGS_KEY = "cuentas-claras-settings";

export interface AppSettings {
  servicePercent: number;
  currency: string;
  theme: "light" | "dark";
}

export const defaultSettings: AppSettings = {
  servicePercent: 10,
  currency: "CUP",
  theme: "light",
};

export function saveBill(bill: SavedBill): void {
  try {
    const bills = getBills();
    bills.unshift(bill);
    // Keep only last 20 bills
    const trimmedBills = bills.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedBills));
  } catch (error) {
    console.error("Error saving bill:", error);
  }
}

export function getBills(): SavedBill[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading bills:", error);
    return [];
  }
}

export function getBillsCount(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return 0;
    const bills = JSON.parse(data);
    return Array.isArray(bills) ? bills.length : 0;
  } catch (error) {
    console.error("Error counting bills:", error);
    return 0;
  }
}

export function deleteBill(id: string): void {
  try {
    const bills = getBills().filter((bill) => bill.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch (error) {
    console.error("Error deleting bill:", error);
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Apply theme immediately
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark"
    );
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

export function getSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (error) {
    console.error("Error loading settings:", error);
    return defaultSettings;
  }
}

// ============ Nombres de Comensales Frecuentes ============

const FREQUENT_DINERS_KEY = "cuentas-claras-frequent-diners";

interface FrequentDiner {
  name: string;
  count: number; // Veces que se ha usado
  lastUsed: string; // ISO date
}

/**
 * Guarda nombres de comensales y actualiza su frecuencia
 */
export function saveFrequentDiners(names: string[]): void {
  try {
    const existing = getFrequentDiners();
    const now = new Date().toISOString();

    names.forEach((name) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      const existingIndex = existing.findIndex(
        (d) => d.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Actualizar existente
        existing[existingIndex].count += 1;
        existing[existingIndex].lastUsed = now;
        // Mantener el nombre con la capitalización más reciente
        existing[existingIndex].name = trimmedName;
      } else {
        // Añadir nuevo
        existing.push({
          name: trimmedName,
          count: 1,
          lastUsed: now,
        });
      }
    });

    // Ordenar por frecuencia y limitar a 30
    const sorted = existing.sort((a, b) => b.count - a.count).slice(0, 30);

    localStorage.setItem(FREQUENT_DINERS_KEY, JSON.stringify(sorted));
  } catch (error) {
    console.error("Error saving frequent diners:", error);
  }
}

/**
 * Obtiene todos los comensales frecuentes ordenados por uso
 */
export function getFrequentDiners(): FrequentDiner[] {
  try {
    const data = localStorage.getItem(FREQUENT_DINERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading frequent diners:", error);
    return [];
  }
}

/**
 * Busca sugerencias de nombres que coincidan con el texto
 */
export function getSuggestions(
  query: string,
  exclude: string[] = []
): string[] {
  if (!query.trim()) return [];

  const diners = getFrequentDiners();
  const lowerQuery = query.toLowerCase().trim();
  const lowerExclude = exclude.map((e) => e.toLowerCase());

  return diners
    .filter(
      (d) =>
        d.name.toLowerCase().includes(lowerQuery) &&
        !lowerExclude.includes(d.name.toLowerCase())
    )
    .slice(0, 5) // Máximo 5 sugerencias
    .map((d) => d.name);
}

/**
 * Obtiene los comensales más frecuentes para mostrar como chips rápidos
 */
export function getTopDiners(
  limit: number = 6,
  exclude: string[] = []
): string[] {
  const diners = getFrequentDiners();
  const lowerExclude = exclude.map((e) => e.toLowerCase());

  return diners
    .filter((d) => !lowerExclude.includes(d.name.toLowerCase()))
    .slice(0, limit)
    .map((d) => d.name);
}
