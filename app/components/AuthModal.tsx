"use client";
import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";
import { ADMIN_EMAIL, DummyUser, signInDummy, signUpDummy } from "../lib/dummyAuth";

export default function AuthModal({ onClose, onAuthenticated }: { onClose: () => void; onAuthenticated: (user: DummyUser) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const useFallback = () => { const fallback = mode === "login" ? signInDummy(email, password) : signUpDummy(email, password); if (fallback) { onAuthenticated(fallback); return true; } return false; };
  const submit = async (event: FormEvent) => { event.preventDefault(); setLoading(true); setError(""); try {
    if (!supabase) throw new Error("Failed to fetch");
    const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    if (result.error) { const offline = /failed to fetch|network|fetch/i.test(result.error.message); if (offline && useFallback()) return; setError(result.error.message.includes("Invalid login") ? "Email atau password salah." : result.error.message); return; }
    if (mode === "signup" && !result.data.session) { setError("Akun berhasil dibuat. Silakan konfirmasi email lalu masuk."); return; }
    if (result.data.user) { const accountEmail = result.data.user.email ?? email; onAuthenticated({ email: accountEmail, role: accountEmail.toLowerCase() === ADMIN_EMAIL ? "admin" : "customer" }); }
  } catch { if (!useFallback()) setError(mode === "login" ? "Email atau password salah." : "Pendaftaran gagal. Periksa email dan password."); } finally { setLoading(false); } };
  return <div className="modal-backdrop" onClick={onClose}><div className="auth-modal" onClick={(event) => event.stopPropagation()}><button className="close" onClick={onClose}>×</button><p className="eyebrow">RUMAH RONA</p><h2>{mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}</h2><p className="auth-copy">{mode === "login" ? "Masuk dengan akunmu untuk melanjutkan belanja." : "Daftar sekali, lalu akses akunmu dari perangkat mana pun."}</p><form onSubmit={submit}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (min. 6 karakter)" minLength={6} required />{error && <p className="auth-error">{error}</p>}<button className="button dark auth-submit" disabled={loading}>{loading ? "MEMPROSES..." : mode === "login" ? "MASUK →" : "DAFTAR →"}</button></form><button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}</button></div></div>;
}
