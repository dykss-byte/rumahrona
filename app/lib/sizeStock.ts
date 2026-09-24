export const defaultSizes = ["S", "M", "L", "XL"];

export function splitStock(total: number, sizes: string[] = defaultSizes): Record<string, number> {
  const safeTotal = Math.max(0, Math.floor(Number(total) || 0));
  const base = Math.floor(safeTotal / sizes.length);
  const remainder = safeTotal % sizes.length;
  return Object.fromEntries(sizes.map((size, index) => [size, base + (index < remainder ? 1 : 0)]));
}

export function normalizeSizeStock(value: unknown, total: number, sizes: string[] = defaultSizes): Record<string, number> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const source = value as Record<string, unknown>;
    if (sizes.some((size) => source[size] !== undefined)) return Object.fromEntries(sizes.map((size) => [size, Math.max(0, Number(source[size] ?? 0))]));
  }
  return splitStock(total, sizes);
}

export function totalSizeStock(sizeStocks: Record<string, number> | undefined, fallback = 0) {
  return sizeStocks ? Object.values(sizeStocks).reduce((sum, stock) => sum + Math.max(0, Number(stock) || 0), 0) : fallback;
}
