"use client";
import { useState } from "react";

type NavbarProps = { cartCount: number; hasOrder: boolean; onCartClick: () => void; onTrackingClick: () => void; onNewsClick: () => void };

export default function Navbar({ cartCount, hasOrder, onCartClick, onTrackingClick, onNewsClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const openNews = () => { closeMenu(); onNewsClick(); };
  const openTracking = () => { closeMenu(); onTrackingClick(); };
  const openCart = () => { closeMenu(); onCartClick(); };
  return <>
    <header className="site-header"><a className="brand" href="#home"><span className="brand-mark">✦</span> RUMAH RONA</a><nav className="desktop-nav"><button className="nav-news" onClick={onNewsClick}>NEWS</button><a href="#koleksi">KOLEKSI</a><a href="#cerita">CERITA KAMI</a><a href="#panduan">PANDUAN</a><button className={hasOrder ? "nav-tracking ready" : "nav-tracking"} onClick={onTrackingClick}>TRACKING {hasOrder && "•"}</button></nav><button className="cart-button desktop-cart" onClick={onCartClick}>KERANJANG <span>{cartCount}</span> <i>↗</i></button><button className="mobile-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Buka menu">{menuOpen ? "×" : "☰"}</button></header>
    {menuOpen && <div className="mobile-menu"><div className="mobile-menu-inner"><button onClick={openNews}>NEWS</button><a href="#koleksi" onClick={closeMenu}>SHOP</a><button onClick={openCart}>CART <span>{cartCount > 0 ? cartCount : ""}</span></button><button onClick={openTracking}>TRACKING {hasOrder && "•"}</button><a href="#cerita" onClick={closeMenu}>ABOUT</a><button onClick={closeMenu}>SIGN IN</button></div></div>}
  </>;
}
