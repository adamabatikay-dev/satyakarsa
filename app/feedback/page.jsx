'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../kuesioner/page.module.css'; // Reuse form card styles

export default function Feedback() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });
      if (res.ok) {
        setSuccess(true);
        setName('');
        setMessage('');
      } else {
        alert('Gagal mengirim pesan');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.formCard}`}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>&larr; Kembali ke Beranda</Link>
        </div>

        <h2 className={styles.title}>Saran & Kritik</h2>
        <p className={styles.desc}>Kami sangat menghargai masukan Anda untuk pengembangan sistem SPK ini ke depannya.</p>
        
        {success ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Terima Kasih!</h3>
            <p>Pesan Anda telah berhasil dikirim ke sistem kami.</p>
            <button onClick={() => setSuccess(false)} className="btn-primary" style={{ marginTop: '1.5rem' }}>Kirim Pesan Lain</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup} style={{ padding: '0', background: 'transparent', border: 'none' }}>
              <label style={{ textAlign: 'left', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nama (Opsional)</label>
              <input 
                type="text" 
                className="input-field" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama Anda..."
                style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            
            <div className={styles.formGroup} style={{ padding: '0', background: 'transparent', border: 'none' }}>
              <label style={{ textAlign: 'left', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Pesan Saran/Kritik *</label>
              <textarea 
                className="input-field" 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tuliskan masukan Anda di sini..."
                rows="5"
                required
                style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Pesan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
