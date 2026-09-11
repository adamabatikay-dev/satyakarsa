'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from '../layout.module.css';
import PasswordModal from '../../../components/PasswordModal';

export default function AdminAlternatif() {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Password Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'save'|'delete', data: any }

  const fetchAlternatives = () => {
    fetch('/api/alternatives')
      .then(res => res.json())
      .then(data => setAlternatives(data));
  };

  useEffect(() => {
    fetchAlternatives();
  }, []);

  const sortedAlternatives = useMemo(() => {
    let sortableItems = [...alternatives];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [alternatives, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const initiateSave = (e) => {
    e.preventDefault();
    if (!name || !description) return;
    setPendingAction({ type: 'save' });
    setModalOpen(true);
  };

  const initiateDelete = (id) => {
    setPendingAction({ type: 'delete', data: id });
    setModalOpen(true);
  };

  const executeAction = async () => {
    setModalOpen(false);
    setLoading(true);
    
    if (pendingAction.type === 'save') {
      try {
        const res = await fetch('/api/alternatives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        
        if (res.ok) {
          setName('');
          setDescription('');
          fetchAlternatives();
        } else {
          alert('Gagal menyimpan alternatif');
        }
      } catch (err) {
        alert('Terjadi kesalahan jaringan');
      }
    } else if (pendingAction.type === 'delete') {
      try {
        const res = await fetch(`/api/alternatives?id=${pendingAction.data}`, { method: 'DELETE' });
        if (res.ok) fetchAlternatives();
        else alert('Gagal menghapus alternatif');
      } catch (err) {
        alert('Terjadi kesalahan jaringan');
      }
    }
    
    setLoading(false);
  };

  return (
    <div>
      <PasswordModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={executeAction} 
        title="Verifikasi Kredensial"
        message={pendingAction?.type === 'delete' ? 'Masukkan password untuk menghapus alternatif ini (data nilainya juga akan ikut terhapus):' : 'Masukkan password untuk menyimpan alternatif:'}
      />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Data Alternatif</h1>
        <p className={styles.pageSubtitle}>Kelola platform promosi digital yang akan dinilai</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Tambah Alternatif Baru</h3>
        <form onSubmit={initiateSave} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nama Platform</label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Twitter Ads"
              required 
            />
          </div>
          <div style={{ flex: 2, minWidth: '300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deskripsi Singkat</label>
            <input 
              type="text" 
              className="input-field" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Penjelasan tentang platform..."
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '45px' }}>
            {loading ? 'Menyimpan...' : '+ Tambah'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('id')}>
                No {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '↕'}
              </th>
              <th style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('name')}>
                Nama Platform {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '↕'}
              </th>
              <th style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('description')}>
                Deskripsi {sortConfig.key === 'description' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '↕'}
              </th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedAlternatives.map((a, index) => (
              <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{index + 1}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{a.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{a.description}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => initiateDelete(a.id)} style={{ color: '#ef4444', fontSize: '0.9rem' }}>Hapus</button>
                </td>
              </tr>
            ))}
            {alternatives.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada data alternatif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
