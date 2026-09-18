export type DummyUser = { email: string; role: "customer" | "admin" };
export const ADMIN_EMAIL = "admin@gmail.com";
export const ADMIN_PASSWORD = "admin123";
const SESSION_KEY = "rumah-rona-session";
const USERS_KEY = "rumah-rona-users";

export function getDummySession(): DummyUser | null { if (typeof window === "undefined") return null; const value = window.localStorage.getItem(SESSION_KEY); if (!value) return null; return JSON.parse(value) as DummyUser; }
export function signOutDummy() { window.localStorage.removeItem(SESSION_KEY); window.dispatchEvent(new Event("rumah-rona-auth")); window.location.href = "/"; }
export function signInDummy(email: string, password: string): DummyUser | null { if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) { const user = { email: ADMIN_EMAIL, role: "admin" as const }; window.localStorage.setItem(SESSION_KEY, JSON.stringify(user)); return user; } const users = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "{}") as Record<string, string>; if (!users[email.toLowerCase()] || users[email.toLowerCase()] !== password) return null; const user = { email: email.toLowerCase(), role: "customer" as const }; window.localStorage.setItem(SESSION_KEY, JSON.stringify(user)); return user; }
export function signUpDummy(email: string, password: string): DummyUser | null { const key = email.toLowerCase(); if (key === ADMIN_EMAIL || password.length < 6) return null; const users = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "{}") as Record<string, string>; users[key] = password; window.localStorage.setItem(USERS_KEY, JSON.stringify(users)); const user = { email: key, role: "customer" as const }; window.localStorage.setItem(SESSION_KEY, JSON.stringify(user)); return user; }
