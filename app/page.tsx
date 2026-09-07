"use client";
import { useState } from "react";
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

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const addToCart = (product: Product, size: string) => {
    setCart((items) => { const found = items.find((item) => item.product.id === product.id && item.size === size); return found ? items.map((item) => item.product.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, size, quantity: 1 }]; });
    setNotice(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setNotice(""), 2200);
  };
  const changeQuantity = (productId: number, size: string, change: number) => setCart((items) => items.flatMap((item) => item.product.id === productId && item.size === size ? (item.quantity + change > 0 ? [{ ...item, quantity: item.quantity + change }] : []) : [item]));
  const checkout = () => { setShowCart(false); setShowPayment(true); };
  const completeOrder = () => { const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0); setOrder({ id: String(Date.now()).slice(-10), items: cart, total, status: "Pesanan diterima" }); setCart([]); setNotice("Pesanan berhasil dibuat!"); setShowPayment(false); };
  if (showPayment) return <main><PaymentPage cart={cart} onBack={() => setShowPayment(false)} onSuccess={completeOrder} />{notice && <div className="toast">✓ {notice}</div>}</main>;
  if (showTracking) return <main><TrackingPage order={order} onBack={() => setShowTracking(false)} /></main>;
  if (showNews) return <main><NewsPage onBack={() => setShowNews(false)} /></main>;

  return <main>
    <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} hasOrder={Boolean(order)} onCartClick={() => setShowCart(true)} onTrackingClick={() => setShowTracking(true)} onNewsClick={() => setShowNews(true)} />
    <Hero />
    <BrandStory />
    <Catalog onAdd={addToCart} />
    <Manifesto />
    <Footer />
    {notice && <div className="toast">✓ {notice}</div>}
    {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onCheckout={checkout} onChangeQuantity={changeQuantity} />}
  </main>;
}
