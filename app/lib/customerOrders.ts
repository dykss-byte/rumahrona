import { Order } from "../components/types";

const KEY = "rumah-rona-customer-last-order";

export function saveCustomerOrder(order: Order) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(order));
}

export function getCustomerOrder(): Order | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Order | null;
  } catch {
    return null;
  }
}
