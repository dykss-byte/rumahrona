type NavbarProps = { cartCount: number; onCartClick: () => void };

export default function Navbar({ cartCount, onCartClick }: NavbarProps) {
  return <header className="site-header">
    <a className="brand" href="#home"><span className="brand-mark">✦</span> RUMAH RONA</a>
    <nav><a href="#koleksi">KOLEKSI</a><a href="#cerita">CERITA KAMI</a><a href="#panduan">PANDUAN</a></nav>
    <button className="cart-button" onClick={onCartClick}>KERANJANG <span>{cartCount}</span> <i>↗</i></button>
  </header>;
}
