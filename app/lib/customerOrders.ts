import { Order } from "../components/types";

const KEY = "rumah-rona-customer-last-order";
const HISTORY_KEY = "rumah-rona-customer-order-history";

export function saveCustomerOrder(order: Order) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(order));
    const history = getCustomerOrders().filter((saved) => saved.id !== order.id);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([order, ...history]));
  }
}

export function getCustomerOrder(): Order | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Order | null;
  } catch {
    return null;
  }
}

export function getCustomerOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const history = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]") as Order[];
    const latest = getCustomerOrder();
    return latest && !history.some((order) => order.id === latest.id) ? [latest, ...history] : history;
  } catch {
    return [];
  }
}
