"use client";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BrandStory from "./components/BrandStory";
import Catalog from "./components/Catalog";
import Manifesto from "./components/Manifesto";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import PaymentPage from "./components/PaymentPage";
import { CartItem, Order, Product } from "./components/types";
import TrackingPage from "./components/TrackingPage";
import NewsPage from "./components/NewsPage";
import { supabase } from "./lib/supabase";
import AuthModal from "./components/AuthModal";
import { DummyUser, getDummySession, signOutDummy } from "./lib/dummyAuth";

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<DummyUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  useEffect(() => { const sync = () => setUser(getDummySession()); sync(); window.addEventListener("rumah-rona-auth", sync); return () => window.removeEventListener("rumah-rona-auth", sync); }, []);
  const addToCart = (product: Product, size: string) => {
    if (!user) { setShowAuth(true); return; }
    setCart((items) => { const found = items.find((item) => item.product.id === product.id && item.size === size); return found ? items.map((item) => item.product.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, size, quantity: 1 }]; });
    setNotice(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setNotice(""), 2200);
  };
  const changeQuantity = (productId: number, size: string, change: number) => setCart((items) => items.flatMap((item) => item.product.id === productId && item.size === size ? (item.quantity + change > 0 ? [{ ...item, quantity: item.quantity + change }] : []) : [item]));
  const checkout = () => { if (!user) { setShowAuth(true); return; } setShowCart(false); setShowPayment(true); };
  const completeOrder = async (details: { method: string; name: string; whatsapp: string; address: string }) => {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderNumber = `RR-${Date.now().toString().slice(-8)}`;
    const { data: savedOrder, error: orderError } = await supabase.from("orders").insert({ order_number: orderNumber, customer_name: details.name, whatsapp: details.whatsapp, address: details.address, payment_method: details.method, total }).select().single();
    if (orderError || !savedOrder) { setNotice(`Pesanan gagal disimpan: ${orderError?.message ?? "coba lagi"}`); return; }
    const { error: itemsError } = await supabase.from("order_items").insert(cart.map((item) => ({ order_id: savedOrder.id, product_id: null, product_name: item.product.name, size: item.size, quantity: item.quantity, price: item.product.price })));
    if (itemsError) { setNotice(`Detail pesanan gagal disimpan: ${itemsError.message}`); return; }
    setOrder({ id: savedOrder.order_number, items: cart, total, status: "Pesanan diterima" }); setCart([]); setNotice("Pesanan berhasil dibuat!"); setShowPayment(false);
  };
  if (showPayment) return <main><PaymentPage cart={cart} onBack={() => setShowPayment(false)} onSuccess={completeOrder} />{notice && <div className="toast">✓ {notice}</div>}</main>;
  if (showTracking) return <main><TrackingPage order={order} onBack={() => setShowTracking(false)} /></main>;
  if (showNews) return <main><NewsPage onBack={() => setShowNews(false)} /></main>;

  return <main>
    <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} hasOrder={Boolean(order)} userEmail={user?.email} onCartClick={() => setShowCart(true)} onTrackingClick={() => setShowTracking(true)} onNewsClick={() => setShowNews(true)} onAuthClick={() => setShowAuth(true)} onSignOut={signOutDummy} />
    <Hero />
    <BrandStory />
    <Catalog onAdd={addToCart} />
    <Manifesto />
    <Footer />
    {notice && <div className="toast">✓ {notice}</div>}
    {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onCheckout={checkout} onChangeQuantity={changeQuantity} />}
    {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuthenticated={(authenticatedUser) => { setUser(authenticatedUser); setShowAuth(false); if (cart.length) { setShowCart(false); setShowPayment(true); } }} />}
  </main>;
}
