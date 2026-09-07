type NavbarProps = { cartCount: number; hasOrder: boolean; onCartClick: () => void; onTrackingClick: () => void; onNewsClick: () => void };

export default function Navbar({ cartCount, hasOrder, onCartClick, onTrackingClick, onNewsClick }: NavbarProps) {
  return <header className="site-header">
    <a className="brand" href="#home"><span className="brand-mark">✦</span> RUMAH RONA</a>
    <nav><button className="nav-news" onClick={onNewsClick}>NEWS</button><a href="#koleksi">KOLEKSI</a><a href="#cerita">CERITA KAMI</a><a href="#panduan">PANDUAN</a><button className={hasOrder ? "nav-tracking ready" : "nav-tracking"} onClick={onTrackingClick}>TRACKING {hasOrder && "•"}</button></nav>
    <button className="cart-button" onClick={onCartClick}>KERANJANG <span>{cartCount}</span> <i>↗</i></button>
  </header>;
}
