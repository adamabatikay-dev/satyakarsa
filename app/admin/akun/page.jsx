'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../layout.module.css';

export default function AdminAkun() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newUsername, newPassword })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage('Akun berhasil diperbarui. Silakan login kembali.');
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Log user out if password/username changed
        setTimeout(() => {
          localStorage.removeItem('admin_auth');
          router.push('/admin/login');
        }, 2000);
      } else {
        setError(data.message || 'Gagal memperbarui akun');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pengaturan Akun</h1>
        <p className={styles.pageSubtitle}>Ubah username dan password untuk akses admin</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password Saat Ini (Wajib)</label>
            <input 
              type="password" 
              className="input-field" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Masukkan password yang sekarang"
            />
          </div>

          <div style={{ height: '1px', background: 'var(--card-border)', margin: '1rem 0' }}></div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username Baru (Opsional)</label>
            <input 
              type="text" 
              className="input-field" 
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Biarkan kosong jika tidak ingin mengubah"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password Baru (Opsional)</label>
            <input 
              type="password" 
              className="input-field" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Biarkan kosong jika tidak ingin mengubah"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Konfirmasi Password Baru</label>
            <input 
              type="password" 
              className="input-field" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru jika diisi"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
