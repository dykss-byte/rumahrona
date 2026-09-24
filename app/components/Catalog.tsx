"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { Product, products as defaultProducts } from "./types";
import { supabase } from "../lib/supabase";
import { getProductCache } from "../lib/productCache";
import { getCategoryCache } from "../lib/categoryCache";
import { getLocalOrders } from "../lib/localOrders";
import { normalizeSizeStock, totalSizeStock } from "../lib/sizeStock";

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
        setProducts(defaultProducts.map((product) => { const sizeStocks = normalizeSizeStock(product.sizeStocks, product.stock ?? 10, product.sizes); getLocalOrders().forEach((order) => order.items.filter((item) => item.product_name.trim().toLowerCase() === product.name.trim().toLowerCase()).forEach((item) => { sizeStocks[item.size] = Math.max(0, (sizeStocks[item.size] ?? 0) - item.quantity); })); return { ...product, sizeStocks, stock: totalSizeStock(sizeStocks) }; }));
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
      const productQuery = await client.from("products").select("id, name, price, category, stock, size_stock");
      const sizeColumnAvailable = !productQuery.error;
      const productData = sizeColumnAvailable ? productQuery.data : (await client.from("products").select("id, name, price, category, stock")).data;
      const { data: itemData } = await client.from("order_items").select("product_name, size, quantity");
      if (!alive || !productData) return;
      const cached = getProductCache();
      const remoteRows = productData.map((row) => ({ ...row, description: cached.find((item) => String(item.id) === String(row.id))?.description }));
      const sold = new Map<string, number>();
      const soldBySize = new Map<string, number>();
      (itemData ?? []).forEach((item) => {
        const key = String(item.product_name).trim().toLowerCase();
        sold.set(key, (sold.get(key) ?? 0) + Number(item.quantity || 0));
        soldBySize.set(`${key}::${item.size}`, (soldBySize.get(`${key}::${item.size}`) ?? 0) + Number(item.quantity || 0));
      });
      const localSold = new Map<string, number>();
      getLocalOrders().forEach((order) => order.items.forEach((item) => {
        const key = item.product_name.trim().toLowerCase();
        localSold.set(key, (localSold.get(key) ?? 0) + item.quantity);
      }));
      const mapped = remoteRows.map((row, index) => {
        const base = defaultProducts.find((product) => String(product.id) === String(row.id) || product.name.trim().toLowerCase() === String(row.name).trim().toLowerCase()) ?? defaultProducts[index % defaultProducts.length];
        const key = String(row.name).trim().toLowerCase();
        const persistedSizeStock = (row as { size_stock?: unknown }).size_stock;
        const hasPersistedSizeStock = Boolean(persistedSizeStock && typeof persistedSizeStock === "object" && !Array.isArray(persistedSizeStock) && Object.keys(persistedSizeStock as object).length);
        const sizeStocks = normalizeSizeStock(persistedSizeStock, Number(row.stock ?? base.stock ?? 10), base.sizes);
        if (sizeColumnAvailable && !hasPersistedSizeStock) (base.sizes ?? []).forEach((size) => { sizeStocks[size] = Math.max(0, sizeStocks[size] - (soldBySize.get(`${key}::${size}`) ?? 0)); });
        getLocalOrders().forEach((order) => order.items.filter((item) => item.product_name.trim().toLowerCase() === key).forEach((item) => { sizeStocks[item.size] = Math.max(0, (sizeStocks[item.size] ?? 0) - item.quantity); }));
        const soldQuantity = (sold.get(key) ?? 0) + (localSold.get(key) ?? 0);
        const calculatedStock = Math.max(0, totalSizeStock(sizeStocks, (base.stock ?? 10) - soldQuantity));
        const databaseStock = Number(row.stock);
        const stock = Number.isFinite(databaseStock) ? Math.min(Math.max(0, databaseStock - (localSold.get(key) ?? 0)), calculatedStock) : calculatedStock;
        return { ...base, id: typeof row.id === "number" ? row.id : 10000 + index, name: row.name || base.name, price: Number(row.price ?? base.price), category: row.category || base.category, sizeStocks, stock, description: cached.find((item) => String(item.id) === String(row.id))?.description || base.description };
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
