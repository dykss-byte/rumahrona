import { CartItem } from "../components/types";

export type OrderStatus = "Pesanan diterima" | "Diproses" | "Dikemas" | "Dikirim" | "Selesai" | "Dibatalkan";
export const orderStatuses: OrderStatus[] = ["Pesanan diterima", "Diproses", "Dikemas", "Dikirim", "Selesai", "Dibatalkan"];
export type LocalOrder = { id: string; order_number: string; customer_name: string; whatsapp: string; address: string; payment_method: string; total: number; created_at: string; status?: OrderStatus; items: { product_name: string; size: string; quantity: number; price: number }[] };
const KEY = "rumah-rona-orders";
const STATUS_KEY = "rumah-rona-order-statuses";

export function saveLocalOrder(order: LocalOrder) { const existing = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as LocalOrder[]; window.localStorage.setItem(KEY, JSON.stringify([order, ...existing])); window.dispatchEvent(new Event("rumah-rona-orders-updated")); }
export function getLocalOrders(): LocalOrder[] { if (typeof window === "undefined") return []; return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as LocalOrder[]; }
export function saveOrderStatus(orderNumber: string, status: OrderStatus) { const statuses = JSON.parse(window.localStorage.getItem(STATUS_KEY) ?? "{}") as Record<string, OrderStatus>; statuses[orderNumber] = status; window.localStorage.setItem(STATUS_KEY, JSON.stringify(statuses)); }
export function getOrderStatus(orderNumber: string, fallback: OrderStatus = "Pesanan diterima"): OrderStatus { if (typeof window === "undefined") return fallback; const statuses = JSON.parse(window.localStorage.getItem(STATUS_KEY) ?? "{}") as Record<string, OrderStatus>; return statuses[orderNumber] ?? fallback; }
export function makeLocalOrder(orderNumber: string, details: { method: string; name: string; whatsapp: string; address: string }, cart: CartItem[], total: number): LocalOrder { return { id: `local-${orderNumber}`, order_number: orderNumber, customer_name: details.name, whatsapp: details.whatsapp, address: details.address, payment_method: details.method, total, status: "Pesanan diterima", created_at: new Date().toISOString(), items: cart.map((item) => ({ product_name: item.product.name, size: item.size, quantity: item.quantity, price: item.product.price })) }; }
