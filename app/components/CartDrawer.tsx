import { CartItem, formatPrice } from "./types";
import { ProductArt } from "./ProductCard";

type CartDrawerProps = { cart: CartItem[]; onClose: () => void; onCheckout: () => void; onChangeQuantity: (productId: number, size: string, change: number) => void };
export default function CartDrawer({ cart, onClose, onCheckout, onChangeQuantity }: CartDrawerProps) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <div className="modal-backdrop" onClick={onClose}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><button className="close" onClick={onClose}>×</button><p className="eyebrow">BELANJAANMU</p><h2>Keranjang</h2>{cart.length === 0 ? <div className="empty"><div>✦</div><p>Keranjangmu masih kosong.</p><button className="button dark" onClick={onClose}>MULAI BELANJA</button></div> : <><div className="cart-list">{cart.map((item) => <div className="cart-item" key={`${item.product.id}-${item.size}`}><ProductArt product={item.product}/><div className="cart-item-detail"><b>{item.product.name}</b><p>{formatPrice(item.product.price)} · Ukuran {item.size}</p><div className="qty-control"><button onClick={() => onChangeQuantity(item.product.id, item.size, -1)}>−</button><span>{item.quantity}</span><button onClick={() => onChangeQuantity(item.product.id, item.size, 1)}>+</button></div></div></div>)}</div><div className="cart-total"><span>Total</span><b>{formatPrice(total)}</b></div><button className="button dark checkout" onClick={onCheckout}>LANJUT KE PEMBAYARAN ↗</button></>}</aside></div>;
}
