'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../layout.module.css';
import PasswordModal from '../../../components/PasswordModal';

export default function AdminAkun() {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'logs', 'password'
  
  // List Admin state
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Riwayat Akses state
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Ubah Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [updateUsername, setUpdateUsername] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const router = useRouter();

  // Load Data
  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch('/api/admin-users');
      const data = await res.json();
      setAdmins(data);
    } catch (e) {
      console.error(e);
    }
    setLoadingAdmins(false);
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin-logs');
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    if (activeTab === 'list') loadAdmins();
    if (activeTab === 'logs') loadLogs();
    setError('');
    setMessage('');
  }, [activeTab]);

  // Tambah Admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Admin berhasil ditambahkan');
        setNewUsername('');
        setNewPassword('');
        loadAdmins();
      } else {
        setError(data.message || 'Gagal menambah admin');
      }
    } catch (e) {
      setError('Terjadi kesalahan koneksi');
    }
  };

  // Hapus Admin
  const confirmDelete = (id) => {
    setAdminToDelete(id);
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = async () => {
    setIsModalOpen(false);
    setError(''); setMessage('');
    if (!adminToDelete) return;

    try {
      const res = await fetch('/api/admin-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminToDelete })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Admin berhasil dihapus');
        loadAdmins();
        
        // Cek apakah admin yang dihapus adalah dirinya sendiri
        const myId = localStorage.getItem('admin_id');
        if (myId && parseInt(myId) === adminToDelete) {
           localStorage.removeItem('admin_auth');
           localStorage.removeItem('admin_id');
           router.push('/admin/login');
        }
      } else {
        setError(data.message || 'Gagal menghapus admin');
      }
    } catch (e) {
      setError('Terjadi kesalahan koneksi');
    }
    setAdminToDelete(null);
  };

  // Ubah Akun Sendiri
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');

    if (updatePassword && updatePassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    const adminId = localStorage.getItem('admin_id');
    if (!adminId) {
      setError('ID Admin tidak ditemukan, silakan login ulang.');
      return;
    }

    setLoadingUpdate(true);
    try {
      const res = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, currentPassword, newUsername: updateUsername, newPassword: updatePassword })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage('Akun berhasil diperbarui. Mengalihkan ke login...');
        setCurrentPassword('');
        setUpdateUsername('');
        setUpdatePassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          localStorage.removeItem('admin_auth');
          localStorage.removeItem('admin_id');
          router.push('/admin/login');
        }, 2000);
      } else {
        setError(data.message || 'Gagal memperbarui akun');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Manajemen Akses & Akun</h1>
        <p className={styles.pageSubtitle}>Kelola akun admin dan lihat riwayat login</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn-primary ${activeTab !== 'list' ? 'inactive-tab' : ''}`}
          style={{ background: activeTab === 'list' ? 'var(--accent-color)' : 'var(--input-bg)', color: activeTab === 'list' ? '#fff' : 'var(--text-main)', boxShadow: 'none' }}
          onClick={() => setActiveTab('list')}
        >
          Daftar Admin
        </button>
        <button 
          className={`btn-primary ${activeTab !== 'logs' ? 'inactive-tab' : ''}`}
          style={{ background: activeTab === 'logs' ? 'var(--accent-color)' : 'var(--input-bg)', color: activeTab === 'logs' ? '#fff' : 'var(--text-main)', boxShadow: 'none' }}
          onClick={() => setActiveTab('logs')}
        >
          Riwayat Login
        </button>
        <button 
          className={`btn-primary ${activeTab !== 'password' ? 'inactive-tab' : ''}`}
          style={{ background: activeTab === 'password' ? 'var(--accent-color)' : 'var(--input-bg)', color: activeTab === 'password' ? '#fff' : 'var(--text-main)', boxShadow: 'none' }}
          onClick={() => setActiveTab('password')}
        >
          Keamanan Akun Saya
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', maxWidth: '800px' }}>
          {error}
        </div>
      )}
      
      {message && (
        <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '8px', marginBottom: '1.5rem', maxWidth: '800px' }}>
          {message}
        </div>
      )}

      {/* TAB 1: LIST ADMIN */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="glass-panel" style={{ flex: '1', minWidth: '300px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Admin Terdaftar</h3>
            {loadingAdmins ? (
              <p style={{ color: 'var(--text-muted)' }}>Memuat...</p>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <th style={{ padding: '0.75rem 0' }}>ID</th>
                    <th style={{ padding: '0.75rem 0' }}>Username</th>
                    <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0' }}>{a.id}</td>
                      <td style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>{a.username}</td>
                      <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                        <button 
                          onClick={() => confirmDelete(a.id)}
                          style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem' }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="glass-panel" style={{ width: '350px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Tambah Admin</h3>
            <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Simpan Admin</button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT LOGIN */}
      {activeTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>50 Aktivitas Akses Terakhir</h3>
          {loadingLogs ? (
             <p style={{ color: 'var(--text-muted)' }}>Memuat...</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ padding: '0.75rem' }}>Waktu</th>
                  <th style={{ padding: '0.75rem' }}>Username</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Alamat IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>Belum ada log</td></tr>
                ) : logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{formatDate(l.accessedAt)}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{l.username || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        background: l.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: l.status === 'SUCCESS' ? '#4ade80' : '#ef4444',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                      }}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{l.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: UBAH PASSWORD */}
      {activeTab === 'password' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Keamanan Akun Saya</h3>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password Saat Ini (Wajib)</label>
              <input 
                type="password" 
                className="input-field" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Masukkan password Anda yang sekarang"
              />
            </div>
            <div style={{ height: '1px', background: 'var(--card-border)', margin: '1rem 0' }}></div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username Baru (Opsional)</label>
              <input 
                type="text" 
                className="input-field" 
                value={updateUsername}
                onChange={(e) => setUpdateUsername(e.target.value)}
                placeholder="Kosongkan jika tidak ingin diubah"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password Baru (Opsional)</label>
              <input 
                type="password" 
                className="input-field" 
                value={updatePassword}
                onChange={(e) => setUpdatePassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin diubah"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Konfirmasi Password Baru</label>
              <input 
                type="password" 
                className="input-field" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={loadingUpdate}>
                {loadingUpdate ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <PasswordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteAdmin}
        title="Otorisasi Hapus Admin"
        message="Masukkan password Anda saat ini untuk mengonfirmasi penghapusan admin tersebut."
      />
    </div>
  );
}
