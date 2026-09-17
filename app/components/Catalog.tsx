"use client";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { Product, products } from "./types";

export default function Catalog({ onAdd }: { onAdd: (product: Product, size: string) => void }) {
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => { const term = query.trim().toLowerCase(); return products.filter((product) => (category === "Semua" || product.category === category) && (!term || `${product.name} ${product.category}`.toLowerCase().includes(term))); }, [category, query]);
  return <section className="collection" id="koleksi"><div className="section-heading"><div><p className="eyebrow">PILIHAN UNTUKMU</p><h2>Koleksi terbaru</h2></div><a href="#koleksi">Lihat semua <span>→</span></a></div><div className="catalog-tools"><div className="filter-row">{["Semua", "Atasan", "Bawahan", "Outer", "Dress"].map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari produk..." aria-label="Cari produk" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian">×</button>}</label></div>{filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard product={product} onAdd={onAdd} key={product.id} />)}</div> : <div className="no-results">Produk yang kamu cari belum tersedia.</div>}</section>;
}
