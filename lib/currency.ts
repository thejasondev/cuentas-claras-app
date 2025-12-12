export interface Currency {
  code: string
  symbol: string
  name: string
}

export const currencies: Currency[] = [
  { code: "CUP", symbol: "CUP", name: "Peso Cubano (CUP)" },
  { code: "USD", symbol: "$", name: "Dolar Americano (USD)" },
]

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = currencies.find((c) => c.code === currencyCode)
  const symbol = currency?.symbol || "$"
  if (currencyCode === "CUP") {
    return `${amount.toFixed(2)} ${symbol}`
  }
  return `${symbol}${amount.toFixed(2)}`
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = currencies.find((c) => c.code === currencyCode)
  return currency?.symbol || "$"
}
