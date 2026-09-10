'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded for demo/prototype as discussed in plan
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin');
    } else {
      alert('Username atau password salah!');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={`glass-panel ${styles.loginBox}`}>
        <h2>Admin Login</h2>
        <p>Akses khusus pengelola SPK</p>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginBottom: '1rem' }}>Login</button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
              &larr; Kembali ke Halaman Publik
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
