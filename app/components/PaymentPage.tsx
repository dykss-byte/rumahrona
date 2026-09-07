"use client";
import { useState } from "react";
import { CartItem, formatPrice } from "./types";

type CustomerDetails = { method: string; name: string; whatsapp: string; address: string };

export default function PaymentPage({ cart, onBack, onSuccess }: { cart: CartItem[]; onBack: () => void; onSuccess: (details: CustomerDetails) => Promise<void> }) {
  const [method, setMethod] = useState("Transfer Bank");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const submit = async () => { if (!name.trim() || !whatsapp.trim() || !address.trim()) { window.alert("Lengkapi data penerima terlebih dahulu."); return; } setIsSubmitting(true); try { await onSuccess({ method, name, whatsapp, address }); } finally { setIsSubmitting(false); } };
  return <section className="payment-page"><button className="back-link" onClick={onBack}>← Kembali ke keranjang</button><div className="payment-layout"><div><p className="eyebrow">CHECKOUT</p><h1>Pembayaran</h1><p className="payment-subtitle">Pilih metode pembayaran untuk menyelesaikan pesananmu.</p><div className="payment-card"><h2>Metode pembayaran</h2>{["Transfer Bank", "E-Wallet", "COD"].map((item) => <button className={`payment-option ${method === item ? "selected" : ""}`} onClick={() => setMethod(item)} key={item}><span className="radio">{method === item ? "●" : "○"}</span><span><b>{item}</b><small>{item === "Transfer Bank" ? "BCA, BRI, Mandiri" : item === "E-Wallet" ? "GoPay, OVO, DANA" : "Bayar saat barang sampai"}</small></span></button>)}</div><div className="payment-card contact-card"><h2>Data penerima</h2><div className="form-grid"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama lengkap"/><input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="Nomor WhatsApp"/><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Alamat pengiriman" className="full"/></div></div></div><aside className="order-summary"><p className="eyebrow">RINGKASAN PESANAN</p><h2>Pesananmu</h2>{cart.map((item) => <div className="summary-item" key={`${item.product.id}-${item.size}`}><span>{item.product.name} <small>· {item.size} · × {item.quantity}</small></span><b>{formatPrice(item.product.price * item.quantity)}</b></div>)}<div className="summary-total"><span>Total</span><b>{formatPrice(total)}</b></div><button className="button dark pay-button" onClick={submit} disabled={isSubmitting}>{isSubmitting ? "MENYIMPAN PESANAN..." : "BAYAR SEKARANG ↗"}</button></aside></div></section>;
}
