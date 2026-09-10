'use client';

import { useState, useEffect } from 'react';
import styles from '../layout.module.css';

export default function AdminIdentitas() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [options, setOptions] = useState('');

  const fetchFields = () => {
    fetch('/api/identity-fields')
      .then(res => res.json())
      .then(data => {
        setFields(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    
    setLoading(true);
    await fetch('/api/identity-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, options: type === 'select' ? options : null })
    });
    
    setName('');
    setOptions('');
    setType('text');
    fetchFields();
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus kolom isian ini?')) {
      setLoading(true);
      await fetch(`/api/identity-fields?id=${id}`, { method: 'DELETE' });
      fetchFields();
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pengaturan Identitas</h1>
        <p className={styles.pageSubtitle}>Atur isian profil (Nama, Usia, dll) yang wajib diisi pengguna sebelum mengisi kuesioner.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Tambah Kolom Isian Baru</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nama Kolom (Label)</label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Pekerjaan"
              required 
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Jenis Input</label>
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              <option value="text">Teks Bebas (Text)</option>
              <option value="number">Angka (Number)</option>
              <option value="select">Pilihan Ganda (Dropdown)</option>
            </select>
          </div>
          {type === 'select' && (
            <div style={{ flex: 2, minWidth: '250px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pilihan (Pisahkan dengan koma)</label>
              <input 
                type="text" 
                className="input-field" 
                value={options}
                onChange={e => setOptions(e.target.value)}
                placeholder="Contoh: SD, SMP, SMA, Kuliah"
                required={type === 'select'}
              />
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '45px' }}>
            {loading ? 'Menyimpan...' : '+ Tambah'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Label</th>
              <th style={{ padding: '1rem' }}>Tipe</th>
              <th style={{ padding: '1rem' }}>Opsi (Jika Dropdown)</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{f.id}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{f.name}</td>
                <td style={{ padding: '1rem', color: 'var(--accent-color)' }}>{f.type}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{f.options || '-'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(f.id)} style={{ color: '#ef4444', fontSize: '0.9rem' }}>Hapus</button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada field yang diatur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
