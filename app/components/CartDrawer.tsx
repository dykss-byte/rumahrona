import { Product, formatPrice } from "./types";
import { ProductArt } from "./ProductCard";

type CartDrawerProps = { cart: Product[]; onClose: () => void; onCheckout: () => void };
export default function CartDrawer({ cart, onClose, onCheckout }: CartDrawerProps) {
  const total = cart.reduce((sum, product) => sum + product.price, 0);
  return <div className="modal-backdrop" onClick={onClose}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><button className="close" onClick={onClose}>×</button><p className="eyebrow">BELANJAANMU</p><h2>Keranjang</h2>{cart.length === 0 ? <div className="empty"><div>✦</div><p>Keranjangmu masih kosong.</p><button className="button dark" onClick={onClose}>MULAI BELANJA</button></div> : <><div className="cart-list">{cart.map((product, index) => <div className="cart-item" key={`${product.id}-${index}`}><ProductArt product={product}/><div><b>{product.name}</b><p>{formatPrice(product.price)}</p></div></div>)}</div><div className="cart-total"><span>Total</span><b>{formatPrice(total)}</b></div><button className="button dark checkout" onClick={onCheckout}>LANJUT KE PEMBAYARAN ↗</button></>}</aside></div>;
}
