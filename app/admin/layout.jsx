'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (pathname !== '/admin/login') {
      const auth = localStorage.getItem('admin_auth');
      if (!auth) {
        router.push('/admin/login');
      } else {
        setIsAuth(true);
      }
    } else {
      setIsAuth(true);
    }
  }, [router, pathname]);

  if (!isAuth) return null;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    router.push('/admin/login');
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>SPK Admin</div>
        <nav className={styles.nav}>
          <Link href="/admin" className={pathname === '/admin' ? styles.active : ''}>Dashboard</Link>
          <Link href="/admin/kriteria" className={pathname === '/admin/kriteria' ? styles.active : ''}>Data Kriteria</Link>
          <Link href="/admin/alternatif" className={pathname === '/admin/alternatif' ? styles.active : ''}>Data Alternatif</Link>
          <Link href="/admin/penilaian" className={pathname === '/admin/penilaian' ? styles.active : ''}>Matriks Keputusan</Link>
          
          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', paddingLeft: '1.5rem', fontWeight: 'bold' }}>Fitur Ekstra</div>
          
          <Link href="/admin/akun" className={pathname === '/admin/akun' ? styles.active : ''}>Pengaturan Akun</Link>
          <Link href="/admin/identitas" className={pathname === '/admin/identitas' ? styles.active : ''}>Pengaturan Identitas</Link>
          <Link href="/admin/riwayat" className={pathname === '/admin/riwayat' ? styles.active : ''}>Riwayat Rekomendasi</Link>
          <Link href="/admin/feedback" className={pathname === '/admin/feedback' ? styles.active : ''}>Saran & Kritik</Link>
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
