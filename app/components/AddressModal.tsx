"use client";
import { FormEvent, useState } from "react";
import { CustomerProfile } from "../lib/dummyAuth";

export default function AddressModal({ profile, onClose, onSave }: { profile: CustomerProfile; onClose: () => void; onSave: (profile: CustomerProfile) => void }) {
  const [address, setAddress] = useState(profile.address);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp);
  const [name, setName] = useState(profile.name);
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); const cleanName = name.trim(); const value = address.trim(); const phone = whatsapp.replace(/\D/g, ""); if (cleanName.length < 3) { setError("Nama minimal 3 karakter."); return; } if (phone.length < 9 || phone.length > 13) { setError("Nomor HP harus 9–13 digit."); return; } if (value.length < 10) { setError("Alamat minimal 10 karakter."); return; } onSave({ ...profile, name: cleanName, whatsapp: phone, address: value }); };
  return <div className="modal-backdrop" onClick={onClose}><div className="auth-modal address-modal" onClick={(event) => event.stopPropagation()}><button className="close" onClick={onClose}>×</button><p className="eyebrow">DATA PENGIRIMAN</p><h2>Lengkapi data pengiriman</h2><p className="auth-copy">Simpan nama, nomor HP, dan alamat agar proses checkout berikutnya lebih cepat.</p><form onSubmit={submit}><input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Nama lengkap" autoFocus required /><input type="tel" inputMode="numeric" value={whatsapp} onChange={(event) => { setWhatsapp(event.target.value.replace(/\D/g, "").slice(0, 13)); setError(""); }} placeholder="Nomor HP / WhatsApp" maxLength={13} required /><textarea value={address} onChange={(event) => { setAddress(event.target.value); setError(""); }} placeholder="Alamat lengkap" rows={5} required />{error && <p className="auth-error">{error}</p>}<button className="button dark auth-submit">SIMPAN DATA →</button></form></div></div>;
}
