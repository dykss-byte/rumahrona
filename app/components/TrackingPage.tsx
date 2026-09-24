import { useEffect, useState } from "react";
import { Order, formatPrice } from "./types";
import { getOrderStatus, OrderStatus } from "../lib/localOrders";
import { supabase } from "../lib/supabase";

export default function TrackingPage({ order, onBack }: { order: Order | null; onBack: () => void }) {
  const [status, setStatus] = useState<OrderStatus>("Pesanan diterima");

  useEffect(() => {
    if (!order) return;
    const syncStatus = async () => {
      const localStatus = getOrderStatus(order.id, (order.status as OrderStatus | undefined) ?? "Pesanan diterima");
      setStatus(localStatus);
      if (!supabase) return;
      const { data } = await supabase.from("orders").select("status").eq("order_number", order.id).maybeSingle();
      if (data?.status) setStatus(data.status as OrderStatus);
    };
    syncStatus();
    const interval = window.setInterval(syncStatus, 5000);
    const onStorage = () => syncStatus();
    window.addEventListener("storage", onStorage);
    return () => { window.clearInterval(interval); window.removeEventListener("storage", onStorage); };
  }, [order]);

  const statusMessage = status === "Selesai" ? "Pesananmu telah selesai." : status === "Dibatalkan" ? "Pesanan ini dibatalkan oleh admin." : "Pesananmu sedang diproses oleh Rumah Rona.";
  return <section className="tracking-page"><button className="back-link" onClick={onBack}>← Kembali ke toko</button><div className="tracking-content"><p className="eyebrow">PESANAN KAMU</p><h1>Tracking pesanan</h1>{order ? <><p className="tracking-number">Nomor pesanan <b>#{order.id}</b></p><div className="tracking-status"><span className="status-dot">✓</span><div><b>{status}</b><p>{statusMessage}</p></div></div><div className="tracking-card"><div className="tracking-card-head"><h2>Ringkasan pesanan</h2><span>{order.items.length} produk</span></div>{order.items.map((item) => <div className="tracking-item" key={`${item.product.id}-${item.size}`}><span>{item.product.name} <small>· {item.size} · × {item.quantity}</small></span><b>{formatPrice(item.product.price * item.quantity)}</b></div>)}<div className="tracking-total"><span>Total</span><b>{formatPrice(order.total)}</b></div></div></> : <div className="tracking-empty"><div>⌁</div><h2>Belum ada pesanan</h2><p>Pesanan yang sudah selesai dibayar akan muncul di sini.</p><button className="button dark" onClick={onBack}>MULAI BELANJA ↗</button></div>}</div></section>;
}
