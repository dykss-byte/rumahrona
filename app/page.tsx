"use client";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BrandStory from "./components/BrandStory";
import Catalog from "./components/Catalog";
import Manifesto from "./components/Manifesto";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import { Product } from "./components/types";

export default function Home() {
  const [cart, setCart] = useState<Product[]>([]);
  const [notice, setNotice] = useState("");
  const [showCart, setShowCart] = useState(false);
  const addToCart = (product: Product) => {
    setCart((items) => [...items, product]);
    setNotice(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setNotice(""), 2200);
  };
  const checkout = () => { setNotice("Pesanan siap diproses!"); setShowCart(false); };

  return <main>
    <Navbar cartCount={cart.length} onCartClick={() => setShowCart(true)} />
    <Hero />
    <BrandStory />
    <Catalog onAdd={addToCart} />
    <Manifesto />
    <Footer />
    {notice && <div className="toast">✓ {notice}</div>}
    {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onCheckout={checkout} />}
  </main>;
}
