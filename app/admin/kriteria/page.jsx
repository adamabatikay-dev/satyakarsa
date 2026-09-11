'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from '../layout.module.css';
import PasswordModal from '../../../components/PasswordModal';

export default function AdminKriteria() {
  const [kriteria, setKriteria] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('benefit');
  const [weight, setWeight] = useState('');

  // Password Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const fetchKriteria = () => {
    fetch('/api/criteria')
      .then(res => res.json())
      .then(data => setKriteria(data));
  };

  useEffect(() => {
    fetchKriteria();
  }, []);

  // Calculate current total weight
  const currentTotalWeight = useMemo(() => {
    return kriteria.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);
  }, [kriteria]);

  // Real-time calculation if user submits current form
  const projectedTotal = useMemo(() => {
    const inputVal = parseFloat(weight) || 0;
    if (editId) {
      const original = kriteria.find(c => c.id === editId);
      const originalVal = original ? parseFloat(original.weight) : 0;
      return currentTotalWeight - originalVal + inputVal;
    }
    return currentTotalWeight + inputVal;
  }, [currentTotalWeight, weight, editId, kriteria]);

  // Helper for determining colors based on rule: >1 Red, <1 Yellow, ==1 Green
  const getColor = (total) => {
    if (total > 1.001) return '#ef4444'; // Red
    if (total < 0.999) return '#f59e0b'; // Yellow (Warning)
    return '#4ade80'; // Green
  };

  const diffProjected = Math.abs(1 - projectedTotal).toFixed(4);
  let projectedWarning = null;
  if (projectedTotal > 1.001) {
    projectedWarning = `Kelebihan ${diffProjected} (Melebihi batas 1.00)`;
  } else if (projectedTotal < 0.999) {
    projectedWarning = `Masih kurang ${diffProjected} (Belum mencapai 1.00)`;
  } else {
    projectedWarning = `Sempurna (1.00)`;
  }

  const initiateSave = (e) => {
    e.preventDefault();
    if (!name || !weight) return;

    // Block saving if total is greater than 1
    if (projectedTotal > 1.001) {
      alert(`Gagal menyimpan: Total bobot saat ini akan menjadi ${projectedTotal.toFixed(4)}. Harap perbaiki isian agar keseluruhan bobot tidak melebihi 1.00.`);
      return;
    }

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
        const method = editId ? 'PUT' : 'POST';
        const body = { name, type, weight: parseFloat(weight) };
        if (editId) body.id = editId;

        const res = await fetch('/api/criteria', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (res.ok) {
          handleCancelEdit();
          fetchKriteria();
        } else {
          alert('Gagal menyimpan kriteria');
        }
      } catch (err) {
        alert('Terjadi kesalahan jaringan');
      }
    } else if (pendingAction.type === 'delete') {
      try {
        const res = await fetch(`/api/criteria?id=${pendingAction.data}`, { method: 'DELETE' });
        if (res.ok) fetchKriteria();
        else alert('Gagal menghapus kriteria');
      } catch (err) {
        alert('Terjadi kesalahan jaringan');
      }
    }
    
    setLoading(false);
  };

  const handleEditClick = (c) => {
    setEditId(c.id);
    setName(c.name);
    setType(c.type);
    setWeight(c.weight);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setName('');
    setType('benefit');
    setWeight('');
  };

  const currentTotalColor = getColor(currentTotalWeight);
  const projectedTotalColor = getColor(projectedTotal);

  return (
    <div>
      <PasswordModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={executeAction} 
        title="Verifikasi Kredensial"
        message={pendingAction?.type === 'delete' ? 'Masukkan password untuk menghapus kriteria ini:' : 'Masukkan password untuk menyimpan kriteria:'}
      />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Data Kriteria</h1>
        <p className={styles.pageSubtitle}>Kelola kriteria yang digunakan dalam perhitungan SAW</p>
      </div>

      {/* Global Weight Warning Box */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.5rem', 
          marginBottom: '2rem', 
          borderLeft: `4px solid ${currentTotalColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3 style={{ marginBottom: '0.25rem', color: currentTotalColor }}>
            Total Bobot Saat Ini: {currentTotalWeight.toFixed(4)}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {currentTotalWeight > 1.001 && `Peringatan: Bobot saat ini kelebihan ${Math.abs(1 - currentTotalWeight).toFixed(4)} dari target 1.00 (Nilai harus diperbaiki)`}
            {currentTotalWeight < 0.999 && `Perhatian: Bobot saat ini masih kurang ${(1 - currentTotalWeight).toFixed(4)} untuk mencapai target 1.00`}
            {Math.abs(currentTotalWeight - 1) <= 0.001 && `Bagus! Total bobot sudah tepat 1.00`}
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>{editId ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}</h3>
        
        <form onSubmit={initiateSave} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nama Kriteria</label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Biaya Iklan"
              required 
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tipe Kriteria</label>
            <select 
              className="input-field" 
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="benefit">Benefit (Makin besar makin baik)</option>
              <option value="cost">Cost (Makin kecil makin baik)</option>
            </select>
          </div>
          <div style={{ width: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bobot Default</label>
            <input 
              type="number" 
              className="input-field" 
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="Max 1.00"
              step="0.0001"
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editId && (
              <button type="button" className="input-field" onClick={handleCancelEdit} style={{ height: '45px', cursor: 'pointer' }}>Batal</button>
            )}
            <button type="submit" className="btn-primary" disabled={loading} style={{ height: '45px' }}>
              {loading ? 'Menyimpan...' : (editId ? 'Simpan' : '+ Tambah')}
            </button>
          </div>
        </form>

        {/* Real-time projection visualizer */}
        {weight && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: '8px', 
            background: 'rgba(0,0,0,0.2)',
            fontSize: '0.9rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Prediksi Total Jika Disimpan: </span>
            <strong style={{ color: projectedTotalColor }}>
              {projectedTotal.toFixed(4)} ({projectedWarning})
            </strong>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Nama Kriteria</th>
              <th style={{ padding: '1rem' }}>Tipe</th>
              <th style={{ padding: '1rem' }}>Bobot Default</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kriteria.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{c.id}</td>
                <td style={{ padding: '1rem' }}>{c.name}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    background: c.type === 'benefit' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: c.type === 'benefit' ? '#4ade80' : '#f87171'
                  }}>
                    {c.type.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{parseFloat(c.weight).toFixed(4)}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEditClick(c)} style={{ color: 'var(--accent-color)', marginRight: '1rem', fontSize: '0.9rem' }}>Edit</button>
                  <button onClick={() => initiateDelete(c.id)} style={{ color: '#ef4444', fontSize: '0.9rem' }}>Hapus</button>
                </td>
              </tr>
            ))}
            {kriteria.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada data kriteria.
                </td>
              </tr>
            )}
          </tbody>
          {kriteria.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                <td colSpan="3" style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>Total Keseluruhan Bobot:</td>
                <td style={{ 
                  padding: '1rem', 
                  fontWeight: 'bold', 
                  color: currentTotalColor
                }}>
                  {currentTotalWeight.toFixed(4)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
