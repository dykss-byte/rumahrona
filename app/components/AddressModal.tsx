"use client";
import { FormEvent, useState } from "react";
import { CustomerProfile } from "../lib/dummyAuth";

export default function AddressModal({ profile, onClose, onSave }: { profile: CustomerProfile; onClose: () => void; onSave: (profile: CustomerProfile) => void }) {
  const [address, setAddress] = useState(profile.address);
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); const value = address.trim(); if (value.length < 10) { setError("Alamat minimal 10 karakter."); return; } onSave({ ...profile, address: value }); };
  return <div className="modal-backdrop" onClick={onClose}><div className="auth-modal address-modal" onClick={(event) => event.stopPropagation()}><button className="close" onClick={onClose}>×</button><p className="eyebrow">DATA PENGIRIMAN</p><h2>Lengkapi alamatmu</h2><p className="auth-copy">Simpan alamat agar proses checkout berikutnya lebih cepat.</p><form onSubmit={submit}><textarea value={address} onChange={(event) => { setAddress(event.target.value); setError(""); }} placeholder="Alamat lengkap" rows={5} autoFocus required />{error && <p className="auth-error">{error}</p>}<button className="button dark auth-submit">SIMPAN ALAMAT →</button></form></div></div>;
}
