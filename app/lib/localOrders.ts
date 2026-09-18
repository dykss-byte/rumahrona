import { CartItem } from "../components/types";

export type LocalOrder = { id: string; order_number: string; customer_name: string; whatsapp: string; address: string; payment_method: string; total: number; created_at: string; items: { product_name: string; size: string; quantity: number; price: number }[] };
const KEY = "rumah-rona-orders";

export function saveLocalOrder(order: LocalOrder) { const existing = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as LocalOrder[]; window.localStorage.setItem(KEY, JSON.stringify([order, ...existing])); }
export function getLocalOrders(): LocalOrder[] { if (typeof window === "undefined") return []; return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as LocalOrder[]; }
export function makeLocalOrder(orderNumber: string, details: { method: string; name: string; whatsapp: string; address: string }, cart: CartItem[], total: number): LocalOrder { return { id: `local-${orderNumber}`, order_number: orderNumber, customer_name: details.name, whatsapp: details.whatsapp, address: details.address, payment_method: details.method, total, created_at: new Date().toISOString(), items: cart.map((item) => ({ product_name: item.product.name, size: item.size, quantity: item.quantity, price: item.product.price })) }; }
