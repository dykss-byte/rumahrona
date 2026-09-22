"use client";
import { useState } from "react";

type NavbarProps = { cartCount: number; hasOrder: boolean; userEmail?: string; hasAddress?: boolean; onAddressClick?: () => void; onCartClick: () => void; onTrackingClick: () => void; onNewsClick: () => void; onAuthClick: () => void; onSignOut: () => void; onAdminClick?: () => void };

export default function Navbar({ cartCount, hasOrder, userEmail, hasAddress = true, onAddressClick, onCartClick, onTrackingClick, onNewsClick, onAuthClick, onSignOut, onAdminClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const action = (callback: () => void) => { setMenuOpen(false); callback(); };
  const isAdmin = userEmail?.toLowerCase() === "admin@gmail.com";
  return <>
    <header className="site-header"><a className="brand" href="#home"><span className="brand-mark">✦</span> RUMAH RONA</a><nav className="desktop-nav"><button className="nav-news" onClick={onNewsClick}>NEWS</button><a href="#koleksi">KOLEKSI</a><a href="#cerita">CERITA KAMI</a><a href="#panduan">PANDUAN</a><button className="nav-tracking" onClick={onTrackingClick}>TRACKING {hasOrder && "•"}</button>{isAdmin && <button className="nav-admin" onClick={onAdminClick}>ADMIN</button>}<button className="nav-account" onClick={userEmail ? onSignOut : onAuthClick}>{userEmail ? "KELUAR" : "MASUK"}</button></nav><button className="cart-button desktop-cart" onClick={onCartClick}>KERANJANG <span>{cartCount}</span> <i>↗</i></button><button className="mobile-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Buka menu">{menuOpen ? "×" : "☰"}</button></header>
    {userEmail && !isAdmin && !hasAddress && <div className="address-topbar"><span>Alamat dan nomor HP-mu belum lengkap.</span><button onClick={onAddressClick}>LENGKAPI SEKARANG →</button></div>}
    {menuOpen && <div className="mobile-menu"><div className="mobile-menu-inner"><button onClick={() => action(onNewsClick)}>NEWS</button><a href="#koleksi" onClick={() => setMenuOpen(false)}>SHOP</a><button onClick={() => action(onCartClick)}>CART <span>{cartCount || ""}</span></button><button onClick={() => action(onTrackingClick)}>TRACKING {hasOrder && "•"}</button>{isAdmin && <button onClick={() => action(onAdminClick ?? (() => undefined))}>ADMIN</button>}<a href="#cerita" onClick={() => setMenuOpen(false)}>ABOUT</a><button onClick={() => action(userEmail ? onSignOut : onAuthClick)}>{userEmail ? "SIGN OUT" : "SIGN IN"}</button></div></div>}
  </>;
}
