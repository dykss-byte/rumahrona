const news = [
  { label: "CERITA DIBALIK BAJU", title: "Dibuat perlahan, dipakai lebih lama.", text: "Kenali proses kecil di balik setiap pakaian Rumah Rona, dari pilihan kain sampai jahitan terakhir.", tone: "news-sand" },
  { label: "KOLEKSI TERBARU", title: "Rona baru untuk hari-hari sederhana.", text: "Koleksi terbaru kami hadir dalam warna lembut dan siluet nyaman untuk menemani keseharianmu.", tone: "news-peach" },
  { label: "KABAR RUMAH RONA", title: "Bertemu pembuat di balik setiap karya.", text: "Kami bekerja bersama pengrajin lokal untuk menjaga pakaian tetap dekat dengan tangan dan cerita manusia.", tone: "news-green" },
];

export default function NewsPage({ onBack }: { onBack: () => void }) {
  return <section className="news-page"><button className="back-link" onClick={onBack}>← Kembali ke toko</button><div className="news-heading"><p className="eyebrow">KABAR DARI RUMAH RONA</p><h1>News <em>&amp;</em><br/>stories.</h1><p>Catatan kecil tentang pakaian, proses, dan orang-orang yang membuat Rumah Rona terus hidup.</p></div><div className="news-grid">{news.map((item) => <article className="news-card" key={item.title}><div className={`news-visual ${item.tone}`}><span>RONA<br/><b>STUDIO</b></span><i>✦</i></div><div className="news-card-copy"><p className="eyebrow">{item.label}</p><h2>{item.title}</h2><p>{item.text}</p><a href="#cerita">Baca cerita ↗</a></div></article>)}</div></section>;
}
