import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.glowBlob}></div>
        <h1 className={styles.title}>
          SPK Pemilihan <span className={styles.highlight}>Platform Digital</span>
        </h1>
        <p className={styles.subtitle}>
          Sistem Pendukung Keputusan cerdas menggunakan metode Simple Additive Weighting (SAW) untuk menentukan platform promosi digital terbaik bagi produk Anda.
        </p>
        
        <div className={styles.actions}>
          <Link href="/kuesioner" className="btn-primary">
            Mulai Kuesioner
          </Link>
          <Link href="/admin/login" className={styles.adminLink}>
            Akses Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
