import { useEffect, useState } from "react";
import { Order, formatPrice } from "./types";
import { getOrderStatus, OrderStatus } from "../lib/localOrders";
import { supabase } from "../lib/supabase";

export default function TrackingPage({ order, orders, onBack }: { order: Order | null; orders?: Order[]; onBack: () => void }) {
  const trackedOrders = orders?.length ? orders : order ? [order] : [];
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});

  useEffect(() => {
    if (!trackedOrders.length) return;
    const syncStatuses = async () => {
      const next: Record<string, OrderStatus> = {};
      await Promise.all(trackedOrders.map(async (trackedOrder) => {
        const fallback = getOrderStatus(trackedOrder.id, (trackedOrder.status as OrderStatus | undefined) ?? "Pesanan diterima");
        if (!supabase) { next[trackedOrder.id] = fallback; return; }
        const { data, error } = await supabase.from("orders").select("status").eq("order_number", trackedOrder.id).maybeSingle();
        next[trackedOrder.id] = !error && data?.status ? data.status as OrderStatus : fallback;
      }));
      setStatuses(next);
    };
    syncStatuses();
    const interval = window.setInterval(syncStatuses, 5000);
    const onRefresh = () => syncStatuses();
    window.addEventListener("storage", onRefresh);
    window.addEventListener("focus", onRefresh);
    const client = supabase;
    const channels = client ? trackedOrders.map((trackedOrder) => client.channel(`order-status-${trackedOrder.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `order_number=eq.${trackedOrder.id}` }, (payload) => { const nextStatus = (payload.new as { status?: OrderStatus }).status; if (nextStatus) setStatuses((current) => ({ ...current, [trackedOrder.id]: nextStatus })); }).subscribe()) : [];
    return () => { window.clearInterval(interval); window.removeEventListener("storage", onRefresh); window.removeEventListener("focus", onRefresh); channels.forEach((channel) => { if (client) client.removeChannel(channel); }); };
  }, [orders, order]);

  const messageFor = (status: OrderStatus) => status === "Selesai" ? "Pesananmu telah selesai." : status === "Dibatalkan" ? "Pesanan ini dibatalkan oleh admin." : "Pesananmu sedang diproses oleh Rumah Rona.";
  return <section className="tracking-page"><button className="back-link" onClick={onBack}>← Kembali ke toko</button><div className="tracking-content"><p className="eyebrow">PESANAN KAMU</p><h1>Tracking pesanan</h1>{trackedOrders.length ? <>{trackedOrders.length > 1 && <p className="tracking-number">{trackedOrders.length} pesanan tersimpan</p>}{trackedOrders.map((trackedOrder) => { const currentStatus = statuses[trackedOrder.id] ?? (trackedOrder.status as OrderStatus | undefined) ?? "Pesanan diterima"; return <div className="tracking-order" key={trackedOrder.id}><p className="tracking-number">Nomor pesanan <b>#{trackedOrder.id}</b></p><div className="tracking-status"><span className="status-dot">✓</span><div><b>{currentStatus}</b><p>{messageFor(currentStatus)}</p></div></div><div className="tracking-card"><div className="tracking-card-head"><h2>Ringkasan pesanan</h2><span>{trackedOrder.items.length} produk</span></div>{trackedOrder.items.map((item) => <div className="tracking-item" key={`${trackedOrder.id}-${item.product.id}-${item.size}`}><span>{item.product.name} <small>· {item.size} · × {item.quantity}</small></span><b>{formatPrice(item.product.price * item.quantity)}</b></div>)}<div className="tracking-total"><span>Total</span><b>{formatPrice(trackedOrder.total)}</b></div></div></div>; })}</> : <div className="tracking-empty"><div>⌁</div><h2>Belum ada pesanan</h2><p>Pesanan yang sudah selesai dibayar akan muncul di sini.</p><button className="button dark" onClick={onBack}>MULAI BELANJA ↗</button></div>}</div></section>;
}
