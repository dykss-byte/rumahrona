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
import AdminPage from "./admin/page";
import { makeLocalOrder, saveLocalOrder } from "./lib/localOrders";

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
  const [authForCheckout, setAuthForCheckout] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  useEffect(() => { const sync = () => { const localUser = getDummySession(); if (localUser) { setUser(localUser); return; } supabase?.auth.getSession().then(({ data }) => { const email = data.session?.user.email; setUser(email ? { email, role: email.toLowerCase() === "admin@gmail.com" ? "admin" : "customer" } : null); }); }; sync(); const listener = supabase?.auth.onAuthStateChange((_event, session) => { const email = session?.user.email; if (email) setUser({ email, role: email.toLowerCase() === "admin@gmail.com" ? "admin" : "customer" }); }); return () => listener?.data.subscription.unsubscribe(); }, []);
  const addToCart = (product: Product, size: string) => {
    setCart((items) => { const found = items.find((item) => item.product.id === product.id && item.size === size); if (found && found.quantity >= (product.stock ?? 0)) { setNotice("Stok produk ini sudah maksimal."); return items; } return found ? items.map((item) => item.product.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, size, quantity: 1 }]; });
    setNotice(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setNotice(""), 2200);
  };
  const changeQuantity = (productId: number, size: string, change: number) => setCart((items) => items.flatMap((item) => item.product.id === productId && item.size === size ? (item.quantity + change > 0 ? [{ ...item, quantity: item.quantity + change }] : []) : [item]));
  const checkout = () => { if (!user) { setShowCart(false); setShowJoinPrompt(true); return; } setShowCart(false); setShowPayment(true); };
  const completeOrder = async (details: { method: string; name: string; whatsapp: string; address: string }) => {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderNumber = `RR-${Date.now().toString().slice(-8)}`;
    const saveOffline = () => { const localOrder = makeLocalOrder(orderNumber, details, cart, total); saveLocalOrder(localOrder); setOrder({ id: localOrder.order_number, items: cart, total, status: "Pesanan diterima" }); setCart([]); setNotice("Pesanan berhasil dibuat!"); setShowPayment(false); };
    if (!supabase) { saveOffline(); return; }
    const client = supabase;
    const { data: savedOrder, error: orderError } = await client.from("orders").insert({ order_number: orderNumber, customer_name: details.name, whatsapp: details.whatsapp, address: details.address, payment_method: details.method, total }).select().single();
    if (orderError || !savedOrder) { saveOffline(); return; }
    const { error: itemsError } = await client.from("order_items").insert(cart.map((item) => ({ order_id: savedOrder.id, product_id: null, product_name: item.product.name, size: item.size, quantity: item.quantity, price: item.product.price })));
    if (itemsError) { saveOffline(); return; }
    setOrder({ id: savedOrder.order_number, items: cart, total, status: "Pesanan diterima" }); setCart([]); setNotice("Pesanan berhasil dibuat! Stok sedang diperbarui dari database."); setShowPayment(false);
  };
  if (showPayment) return <main><PaymentPage cart={cart} userEmail={user?.email} onBack={() => setShowPayment(false)} onSuccess={completeOrder} />{notice && <div className="toast">✓ {notice}</div>}</main>;
  if (showTracking) return <main><TrackingPage order={order} onBack={() => setShowTracking(false)} /></main>;
  if (showNews) return <main><NewsPage onBack={() => setShowNews(false)} /></main>;
  if (user?.role === "admin") return <AdminPage />;

  return <main>
    <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} hasOrder={Boolean(order)} userEmail={user?.email} onCartClick={() => setShowCart(true)} onTrackingClick={() => setShowTracking(true)} onNewsClick={() => setShowNews(true)} onAuthClick={() => setShowAuth(true)} onSignOut={() => { signOutDummy(); supabase?.auth.signOut(); }} />
    <Hero />
    <BrandStory />
    <Catalog onAdd={addToCart} />
    <Manifesto />
    <Footer />
    {notice && <div className="toast">✓ {notice}</div>}
    {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onCheckout={checkout} onChangeQuantity={changeQuantity} />}
    {showJoinPrompt && <div className="modal-backdrop" onClick={() => setShowJoinPrompt(false)}><div className="auth-modal join-prompt" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setShowJoinPrompt(false)}>×</button><p className="eyebrow">RUMAH RONA</p><h2>Silakan bergabung dengan kami</h2><p className="auth-copy">Masuk atau daftar terlebih dahulu untuk melanjutkan checkout pesananmu.</p><button className="button dark auth-submit" onClick={() => { setShowJoinPrompt(false); setAuthForCheckout(true); setShowAuth(true); }}>LOGIN / DAFTAR →</button></div></div>}
    {showAuth && <AuthModal checkoutMode={authForCheckout} onClose={() => { setShowAuth(false); setAuthForCheckout(false); }} onAuthenticated={(authenticatedUser) => { setUser(authenticatedUser); setShowAuth(false); setAuthForCheckout(false); if (cart.length) { setShowCart(false); setShowPayment(true); } }} />}
  </main>;
}
