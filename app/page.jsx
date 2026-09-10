import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <div className="hero">
        <h1 className="title glow">
          SPK Pemilihan Platform Digital
        </h1>
        <p className="subtitle">
          Sistem Pendukung Keputusan cerdas menggunakan metode Simple Additive Weighting (SAW) untuk menentukan platform promosi digital terbaik bagi produk Anda.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link href="/kuesioner" className="btn-primary">
            Mulai Kuesioner
          </Link>
          <Link href="/admin/login" className="btn-secondary" style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--accent-color)',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}>
            Akses Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
