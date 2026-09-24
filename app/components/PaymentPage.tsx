"use client";

import { useEffect, useState } from "react";
import { CartItem, formatPrice } from "./types";
import { CustomerProfile } from "../lib/dummyAuth";

type CustomerDetails = { method: string; name: string; whatsapp: string; address: string };
type FormErrors = Partial<Record<"name" | "whatsapp" | "address", string>>;

export default function PaymentPage({ cart, userEmail, initialProfile, onBack, onSuccess }: { cart: CartItem[]; userEmail?: string; initialProfile?: CustomerProfile; onBack: () => void; onSuccess: (details: CustomerDetails) => Promise<void> }) {
  const [method, setMethod] = useState("Transfer Bank");
  const [name, setName] = useState(() => initialProfile?.name || userEmail?.split("@")[0] || "");
  const [whatsapp, setWhatsapp] = useState(initialProfile?.whatsapp || "");
  const [address, setAddress] = useState(initialProfile?.address || "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  useEffect(() => {
    const nextName = initialProfile?.name || userEmail?.split("@")[0] || "";
    const nextWhatsapp = initialProfile?.whatsapp || "";
    const nextAddress = initialProfile?.address || "";
    if (nextName !== name) setName(nextName);
    if (nextWhatsapp !== whatsapp) setWhatsapp(nextWhatsapp);
    if (nextAddress !== address) setAddress(nextAddress);
  }, [userEmail, initialProfile?.name, initialProfile?.whatsapp, initialProfile?.address]);

  const validate = () => {
    const next: FormErrors = {};
    const cleanName = name.trim();
    const cleanAddress = address.trim();
    if (!cleanName) next.name = "Nama lengkap wajib diisi.";
    else if (cleanName.length < 3) next.name = "Nama minimal 3 karakter.";
    else if (!/^[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9 .'-]*$/.test(cleanName)) next.name = "Nama hanya boleh berisi huruf dan angka.";
    if (!whatsapp) next.whatsapp = "Nomor WhatsApp wajib diisi.";
    else if (!/^\d+$/.test(whatsapp) || whatsapp.length < 9 || whatsapp.length > 13) next.whatsapp = "Isi angka saja, 9–13 digit.";
    if (!cleanAddress) next.address = "Alamat pengiriman wajib diisi.";
    else if (cleanAddress.length < 10) next.address = "Alamat terlalu singkat. Isi alamat lengkap.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try { await onSuccess({ method, name: name.trim(), whatsapp, address: address.trim() }); }
    finally { setIsSubmitting(false); }
  };

  return <section className="payment-page"><button className="back-link" onClick={onBack}>← Kembali ke keranjang</button><div className="payment-layout"><div><p className="eyebrow">CHECKOUT</p><h1>Pembayaran</h1><p className="payment-subtitle">Pilih metode pembayaran untuk menyelesaikan pesananmu.</p><div className="payment-card"><h2>Metode pembayaran</h2>{["Transfer Bank", "E-Wallet", "COD"].map((item) => <button type="button" className={`payment-option ${method === item ? "selected" : ""}`} onClick={() => setMethod(item)} key={item}><span className="radio">{method === item ? "◉" : "○"}</span><span><b>{item}</b><small>{item === "Transfer Bank" ? "BCA, BRI, Mandiri" : item === "E-Wallet" ? "GoPay, OVO, DANA" : "Bayar saat barang sampai"}</small></span></button>)}</div><div className="payment-card contact-card"><h2>Data penerima</h2><div className="form-grid"><div><input value={name} onChange={(event) => { setName(event.target.value); setErrors((current) => ({ ...current, name: "" })); }} placeholder="Nama lengkap" autoComplete="name" aria-invalid={Boolean(errors.name)} />{errors.name && <small className="field-error">{errors.name}</small>}</div><div><input type="tel" inputMode="numeric" value={whatsapp} onChange={(event) => { setWhatsapp(event.target.value.replace(/\D/g, "").slice(0, 13)); setErrors((current) => ({ ...current, whatsapp: "" })); }} placeholder="Nomor WhatsApp" maxLength={13} autoComplete="tel" aria-invalid={Boolean(errors.whatsapp)} />{errors.whatsapp && <small className="field-error">{errors.whatsapp}</small>}</div><div className="full"><textarea value={address} onChange={(event) => { setAddress(event.target.value); setErrors((current) => ({ ...current, address: "" })); }} placeholder="Alamat pengiriman lengkap" rows={5} aria-invalid={Boolean(errors.address)} />{errors.address && <small className="field-error">{errors.address}</small>}</div></div><small className="field-help">WhatsApp: angka saja, 9–13 digit. Alamat minimal 10 karakter.</small></div></div><aside className="order-summary"><p className="eyebrow">RINGKASAN PESANAN</p><h2>Pesananmu</h2>{cart.map((item) => { const stock = item.product.sizeStocks?.[item.size] ?? item.product.stock ?? 0; return <div className="summary-item" key={`${item.product.id}-${item.size}`}><span>{item.product.name} <small>· {item.size} · × {item.quantity}<br/>Sisa stok ukuran {item.size}: {stock} pcs</small></span><b>{formatPrice(item.product.price * item.quantity)}</b></div>; })}<div className="summary-total"><span>Total</span><b>{formatPrice(total)}</b></div><button className="button dark pay-button" onClick={submit} disabled={isSubmitting}>{isSubmitting ? "MENYIMPAN PESANAN..." : "BAYAR SEKARANG →"}</button></aside></div></section>;
}
