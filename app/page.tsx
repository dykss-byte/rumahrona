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
import { CartItem, Order, Product, products } from "./components/types";
import TrackingPage from "./components/TrackingPage";
import NewsPage from "./components/NewsPage";
import { supabase } from "./lib/supabase";
import AuthModal from "./components/AuthModal";
import { CustomerProfile, DummyUser, getDummyProfile, getDummySession, saveDummyProfile, signOutDummy } from "./lib/dummyAuth";
import AdminPage from "./admin/page";
import { makeLocalOrder, saveLocalOrder } from "./lib/localOrders";
import AddressModal from "./components/AddressModal";
import { getCustomerOrder, getCustomerOrders, saveCustomerOrder } from "./lib/customerOrders";
import { normalizeSizeStock, totalSizeStock } from "./lib/sizeStock";

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [user, setUser] = useState<DummyUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authForCheckout, setAuthForCheckout] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [viewingStore, setViewingStore] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>({ name: "", whatsapp: "", address: "" });
  useEffect(() => { const savedOrder = getCustomerOrder(); const savedOrders = getCustomerOrders(); if (savedOrder) setOrder(savedOrder); if (savedOrders.length) setOrderHistory(savedOrders); }, []);
  useEffect(() => { const sync = () => { const localUser = getDummySession(); if (localUser) { if (localUser.role === "admin" && window.sessionStorage.getItem("rumah-rona-view-store") === "1") { window.sessionStorage.removeItem("rumah-rona-view-store"); setViewingStore(true); } setUser(localUser); setProfile(getDummyProfile(localUser.email)); return; } supabase?.auth.getSession().then(({ data }) => { const sessionUser = data.session?.user; const email = sessionUser?.email; if (email) { setUser({ email, role: email.toLowerCase() === "admin@gmail.com" ? "admin" : "customer" }); setProfile({ name: sessionUser.user_metadata?.name ?? "", whatsapp: sessionUser.user_metadata?.whatsapp ?? "", address: sessionUser.user_metadata?.address ?? "" }); } }); }; sync(); const listener = supabase?.auth.onAuthStateChange((_event, session) => { const sessionUser = session?.user; const email = sessionUser?.email; if (email) { setUser({ email, role: email.toLowerCase() === "admin@gmail.com" ? "admin" : "customer" }); setProfile({ name: sessionUser.user_metadata?.name ?? "", whatsapp: sessionUser.user_metadata?.whatsapp ?? "", address: sessionUser.user_metadata?.address ?? "" }); } }); return () => listener?.data.subscription.unsubscribe(); }, []);
  useEffect(() => {
    if (!supabase || !user || user.role === "admin" || !profile.whatsapp.trim()) return;
    const client = supabase;
    const restoreLatestOrder = async () => {
      const { data: savedOrder } = await client.from("orders").select("id, order_number, total, status, created_at").eq("whatsapp", profile.whatsapp).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!savedOrder) return;
      const { data: savedItems } = await client.from("order_items").select("product_name, size, quantity, price").eq("order_id", savedOrder.id);
      const items: CartItem[] = (savedItems ?? []).map((item, index) => {
        const product = products.find((candidate) => candidate.name.trim().toLowerCase() === item.product_name.trim().toLowerCase());
        return { product: product ?? { id: 100000 + index, name: item.product_name, price: Number(item.price), category: "", image: "", color: "#d8c1aa", sizes: [item.size], description: "" }, size: item.size, quantity: Number(item.quantity) };
      });
      if (items.length) { const restoredOrder = { id: savedOrder.order_number, items, total: Number(savedOrder.total), status: savedOrder.status ?? "Pesanan diterima" }; saveCustomerOrder(restoredOrder); setOrder(restoredOrder); setOrderHistory((current) => [restoredOrder, ...current.filter((saved) => saved.id !== restoredOrder.id)]); }
    };
    restoreLatestOrder();
  }, [user, profile.whatsapp]);
  const addToCart = (product: Product, size: string) => {
    setCart((items) => { const available = product.sizeStocks?.[size] ?? product.stock ?? 0; const found = items.find((item) => item.product.id === product.id && item.size === size); if (available < 1 || (found && found.quantity >= available)) { setNotice(`Stok ukuran ${size} sudah habis.`); return items; } return found ? items.map((item) => item.product.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, size, quantity: 1 }]; });
    setNotice(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setNotice(""), 2200);
  };
  const changeQuantity = (productId: number, size: string, change: number) => setCart((items) => items.flatMap((item) => { if (item.product.id !== productId || item.size !== size) return [item]; const available = item.product.sizeStocks?.[size] ?? item.product.stock ?? 0; const next = Math.min(available, item.quantity + change); return next > 0 ? [{ ...item, quantity: next }] : []; }));
  const checkout = () => { if (!user) { setShowCart(false); setShowJoinPrompt(true); return; } setShowCart(false); setShowPayment(true); };
  const completeOrder = async (details: { method: string; name: string; whatsapp: string; address: string }) => {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (user?.email) saveDummyProfile(user.email, { name: details.name, whatsapp: details.whatsapp, address: details.address });
    const orderNumber = `RR-${Date.now().toString().slice(-8)}`;
    const saveOffline = () => { const localOrder = makeLocalOrder(orderNumber, details, cart, total); const customerOrder = { id: localOrder.order_number, items: cart, total, status: "Pesanan diterima" as const }; saveLocalOrder(localOrder); saveCustomerOrder(customerOrder); setOrder(customerOrder); setOrderHistory((current) => [customerOrder, ...current.filter((saved) => saved.id !== customerOrder.id)]); setCart([]); setNotice("Pesanan berhasil dibuat!"); setShowPayment(false); };
    if (!supabase) { saveOffline(); return; }
    const client = supabase;
    const { data: savedOrder, error: orderError } = await client.from("orders").insert({ order_number: orderNumber, customer_name: details.name, whatsapp: details.whatsapp, address: details.address, payment_method: details.method, total }).select().single();
    if (orderError || !savedOrder) { saveOffline(); return; }
    const productNames = [...new Set(cart.map((item) => item.product.name))];
    const stockQuery = await client.from("products").select("name, stock, size_stock").in("name", productNames);
    const hasSizeStockColumn = !stockQuery.error;
    const stockBeforeRows = hasSizeStockColumn ? stockQuery.data : (await client.from("products").select("name, stock").in("name", productNames)).data;
    const { error: itemsError } = await client.from("order_items").insert(cart.map((item) => ({ order_id: savedOrder.id, product_id: null, product_name: item.product.name, size: item.size, quantity: item.quantity, price: item.product.price })));
    if (itemsError) { saveOffline(); return; }
    await Promise.all((stockBeforeRows ?? []).map(async (row) => {
      const matching = cart.filter((item) => item.product.name === row.name);
      const quantity = matching.reduce((sum, item) => sum + item.quantity, 0);
      const currentQuery = hasSizeStockColumn
        ? await client.from("products").select("stock, size_stock").eq("name", row.name).maybeSingle()
        : await client.from("products").select("stock").eq("name", row.name).maybeSingle();
      const currentRow = currentQuery.data;
      if (currentRow) {
        if (hasSizeStockColumn) {
          const productSizes = matching[0]?.product.sizes ?? ["S", "M", "L", "XL"];
          const beforeSizes = normalizeSizeStock((row as { size_stock?: unknown }).size_stock, Number(row.stock ?? 0), productSizes);
          const expectedSizes = { ...beforeSizes };
          matching.forEach((item) => { expectedSizes[item.size] = Math.max(0, (expectedSizes[item.size] ?? 0) - item.quantity); });
          const currentSizes = normalizeSizeStock((currentRow as { size_stock?: unknown }).size_stock, Number(currentRow.stock ?? 0), productSizes);
          const sizeStocks = Object.fromEntries(productSizes.map((size) => [size, Math.min(currentSizes[size] ?? 0, expectedSizes[size] ?? 0)]));
          await client.from("products").update({ stock: totalSizeStock(sizeStocks), size_stock: sizeStocks }).eq("name", row.name);
        } else {
          const expectedStock = Math.max(0, Number(row.stock ?? 0) - quantity);
          const stockAfterTrigger = Number(currentRow.stock ?? 0);
          await client.from("products").update({ stock: Math.min(stockAfterTrigger, expectedStock) }).eq("name", row.name);
        }
      }
    }));
    const customerOrder = { id: savedOrder.order_number, items: cart, total, status: "Pesanan diterima" as const }; saveCustomerOrder(customerOrder); setOrder(customerOrder); setOrderHistory((current) => [customerOrder, ...current.filter((saved) => saved.id !== customerOrder.id)]); setCart([]); setNotice("Pesanan berhasil dibuat! Stok sedang diperbarui dari database."); setShowPayment(false);
  };
  if (showPayment) return <main><PaymentPage cart={cart} userEmail={user?.email} initialProfile={profile} onBack={() => setShowPayment(false)} onSuccess={completeOrder} />{notice && <div className="toast">✓ {notice}</div>}</main>;
  if (showTracking) return <main><TrackingPage order={order} orders={orderHistory} onBack={() => setShowTracking(false)} /></main>;
  if (showNews) return <main><NewsPage onBack={() => setShowNews(false)} /></main>;
  if (user?.role === "admin" && !viewingStore) return <AdminPage />;

  return <main>
    <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} hasOrder={Boolean(order)} userEmail={user?.email} hasAddress={Boolean(profile.name.trim()) && Boolean(profile.address.trim()) && Boolean(profile.whatsapp.trim())} onAddressClick={() => setShowAddress(true)} onCartClick={() => setShowCart(true)} onTrackingClick={() => setShowTracking(true)} onNewsClick={() => setShowNews(true)} onAuthClick={() => setShowAuth(true)} onAdminClick={() => setViewingStore(false)} onSignOut={() => { signOutDummy(); supabase?.auth.signOut(); }} />
    <Hero />
    <BrandStory />
    <Catalog onAdd={addToCart} />
    <Manifesto />
    <Footer />
    {notice && <div className="toast">✓ {notice}</div>}
    {showCart && <CartDrawer cart={cart} onClose={() => setShowCart(false)} onCheckout={checkout} onChangeQuantity={changeQuantity} />}
    {showJoinPrompt && <div className="modal-backdrop" onClick={() => setShowJoinPrompt(false)}><div className="auth-modal join-prompt" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setShowJoinPrompt(false)}>×</button><p className="eyebrow">RUMAH RONA</p><h2>Silakan bergabung dengan kami</h2><p className="auth-copy">Masuk atau daftar terlebih dahulu untuk melanjutkan checkout pesananmu.</p><button className="button dark auth-submit" onClick={() => { setShowJoinPrompt(false); setAuthForCheckout(true); setShowAuth(true); }}>LOGIN / DAFTAR →</button></div></div>}
    {showAuth && <AuthModal checkoutMode={authForCheckout} onClose={() => { setShowAuth(false); setAuthForCheckout(false); }} onAuthenticated={(authenticatedUser) => { setUser(authenticatedUser); setProfile(getDummyProfile(authenticatedUser.email)); setShowAuth(false); setAuthForCheckout(false); if (cart.length) { setShowCart(false); setShowPayment(true); } }} />}
    {showAddress && user?.email && <AddressModal profile={profile} onClose={() => setShowAddress(false)} onSave={async (nextProfile) => { setProfile(nextProfile); saveDummyProfile(user.email, nextProfile); await supabase?.auth.updateUser({ data: nextProfile }); setShowAddress(false); setNotice("Alamat berhasil disimpan."); setTimeout(() => setNotice(""), 2200); }} />}
  </main>;
}
