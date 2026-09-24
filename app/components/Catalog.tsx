"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { Product, products as defaultProducts } from "./types";
import { supabase } from "../lib/supabase";
import { getProductCache } from "../lib/productCache";
import { getCategoryCache } from "../lib/categoryCache";
import { getLocalOrders } from "../lib/localOrders";

export default function Catalog({ onAdd }: { onAdd: (product: Product, size: string) => void }) {
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState(defaultProducts);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);

  useEffect(() => { const refreshCategories = () => setSavedCategories(getCategoryCache()); refreshCategories(); window.addEventListener("storage", refreshCategories); window.addEventListener("rumah-rona-products-updated", refreshCategories); return () => { window.removeEventListener("storage", refreshCategories); window.removeEventListener("rumah-rona-products-updated", refreshCategories); }; }, []);

  useEffect(() => {
    if (!supabase) {
      const refreshLocalProducts = () => {
        const sold = new Map<string, number>();
        getLocalOrders().forEach((order) => order.items.forEach((item) => { const key = item.product_name.trim().toLowerCase(); sold.set(key, (sold.get(key) ?? 0) + item.quantity); }));
        setProducts(defaultProducts.map((product) => ({ ...product, stock: Math.max(0, (product.stock ?? 10) - (sold.get(product.name.trim().toLowerCase()) ?? 0)) })));
      };
      refreshLocalProducts();
      const timer = window.setInterval(refreshLocalProducts, 1000);
      window.addEventListener("storage", refreshLocalProducts);
      window.addEventListener("rumah-rona-orders-updated", refreshLocalProducts);
      return () => { window.clearInterval(timer); window.removeEventListener("storage", refreshLocalProducts); window.removeEventListener("rumah-rona-orders-updated", refreshLocalProducts); };
    }
    const client = supabase;
    let alive = true;
    const refreshProducts = async () => {
      const [{ data: productData }, { data: itemData }] = await Promise.all([
        client.from("products").select("id, name, price, category, stock"),
        client.from("order_items").select("product_name, quantity"),
      ]);
      if (!alive || !productData) return;
      const cached = getProductCache();
      const remoteRows = productData.map((row) => ({ ...row, description: cached.find((item) => String(item.id) === String(row.id))?.description }));
      cached.forEach((item) => { if (!remoteRows.some((row) => String(row.id) === String(item.id))) remoteRows.push({ ...item, description: item.description ?? "" }); });
      const sold = new Map<string, number>();
      (itemData ?? []).forEach((item) => {
        const key = String(item.product_name).trim().toLowerCase();
        sold.set(key, (sold.get(key) ?? 0) + Number(item.quantity || 0));
      });
      const mapped = remoteRows.map((row, index) => {
        const base = defaultProducts.find((product) => String(product.id) === String(row.id) || product.name.trim().toLowerCase() === String(row.name).trim().toLowerCase()) ?? defaultProducts[index % defaultProducts.length];
        const key = String(row.name).trim().toLowerCase();
        const fallbackStock = Math.max(0, (base.stock ?? 10) - (sold.get(key) ?? 0));
        return { ...base, id: typeof row.id === "number" ? row.id : 10000 + index, name: row.name || base.name, price: Number(row.price ?? base.price), category: row.category || base.category, stock: Number.isFinite(Number(row.stock)) ? Number(row.stock) : fallbackStock, description: cached.find((item) => String(item.id) === String(row.id))?.description || base.description };
      });
      setProducts(mapped);
    };
    refreshProducts();
    const timer = window.setInterval(refreshProducts, 5000);
    window.addEventListener("focus", refreshProducts);
    window.addEventListener("storage", refreshProducts);
    window.addEventListener("rumah-rona-products-updated", refreshProducts);
    return () => { alive = false; window.clearInterval(timer); window.removeEventListener("focus", refreshProducts); window.removeEventListener("storage", refreshProducts); window.removeEventListener("rumah-rona-products-updated", refreshProducts); };
  }, []);

  const filtered = useMemo(() => { const term = query.trim().toLowerCase(); return products.filter((product) => (category === "Semua" || product.category === category) && (!term || `${product.name} ${product.category}`.toLowerCase().includes(term))); }, [category, query, products]);
  const categories = useMemo(() => ["Semua", ...new Set([...savedCategories, ...products.map((product) => product.category)].filter(Boolean))], [products, savedCategories]);
  return <section className="collection" id="koleksi"><div className="section-heading"><div><p className="eyebrow">PILIHAN UNTUKMU</p><h2>Koleksi terbaru</h2></div><a href="#koleksi">Lihat semua <span>→</span></a></div><div className="catalog-tools"><div className="filter-row">{categories.map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari produk..." aria-label="Cari produk" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian">×</button>}</label></div>{filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard product={product} onAdd={onAdd} key={product.id} />)}</div> : <div className="no-results">Produk yang kamu cari belum tersedia.</div>}</section>;
}
