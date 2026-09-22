export type CachedProduct = { id: string | number; name: string; price: number; category: string; stock: number; description?: string };
const KEY = "rumah-rona-products-cache";
export function getProductCache(): CachedProduct[] { if (typeof window === "undefined") return []; try { return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as CachedProduct[]; } catch { return []; } }
export function saveProductCache(products: CachedProduct[]) { if (typeof window !== "undefined") { window.localStorage.setItem(KEY, JSON.stringify(products)); window.dispatchEvent(new Event("rumah-rona-products-updated")); } }
