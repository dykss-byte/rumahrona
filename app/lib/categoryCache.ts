const KEY = "rumah-rona-categories";
export function getCategoryCache(): string[] { if (typeof window === "undefined") return []; try { return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[]; } catch { return []; } }
export function saveCategoryCache(categories: string[]) { if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify([...new Set(categories.map((item) => item.trim()).filter(Boolean))])); }
