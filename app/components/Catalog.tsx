"use client";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { Product, products } from "./types";

export default function Catalog({ onAdd }: { onAdd: (product: Product, size: string) => void }) {
  const [category, setCategory] = useState("Semua");
  const filtered = useMemo(() => category === "Semua" ? products : products.filter((product) => product.category === category), [category]);
  return <section className="collection" id="koleksi"><div className="section-heading"><div><p className="eyebrow">PILIHAN UNTUKMU</p><h2>Koleksi terbaru</h2></div><a href="#koleksi">Lihat semua <span>↗</span></a></div><div className="filter-row">{["Semua","Atasan","Bawahan","Outer","Dress"].map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><div className="product-grid">{filtered.map((product) => <ProductCard product={product} onAdd={onAdd} key={product.id}/>)}</div></section>;
}
