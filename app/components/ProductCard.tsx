import { Product, formatPrice } from "./types";

export function ProductArt({ product }: { product: Product }) {
  return <div className={`product-art art-${product.image}`} style={{ "--tone": product.color } as React.CSSProperties}><span className="art-label">HANDMADE<br/><b>with care</b></span><span className="hanger">✦</span></div>;
}

export default function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  return <article className="product-card"><div className="card-image"><ProductArt product={product}/>{product.tag&&<span className="tag">{product.tag}</span>}<button className="quick-add" onClick={() => onAdd(product)}>+ KERANJANG</button></div><div className="product-info"><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>{formatPrice(product.price)}</strong></div></article>;
}
