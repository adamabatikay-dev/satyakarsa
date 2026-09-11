'use client';

import { useState, useEffect } from 'react';
import styles from '../layout.module.css';
import PasswordModal from '../../../components/PasswordModal';

export default function AdminPenilaian() {
  const [alternatives, setAlternatives] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [matrix, setMatrix] = useState({}); // { 'altId-critId': value }
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Password Modal states
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/alternatives').then(res => res.json()),
      fetch('/api/criteria').then(res => res.json())
    ]).then(([alts, crits]) => {
      setAlternatives(alts);
      setCriteria(crits);
      
      // Initialize matrix state from existing data
      const initialMatrix = {};
      alts.forEach(a => {
        a.scores.forEach(s => {
          initialMatrix[`${a.id}-${s.criteriaId}`] = s.value;
        });
      });
      setMatrix(initialMatrix);
    });
  };

  const handleInputChange = (altId, critId, value) => {
    setMatrix(prev => ({
      ...prev,
      [`${altId}-${critId}`]: parseFloat(value) || 0
    }));
  };

  const initiateSave = () => {
    setModalOpen(true);
  };

  const executeSave = async () => {
    setModalOpen(false);
    setSaving(true);
    setMessage('');
    
    // Convert matrix object back to array of {alternativeId, criteriaId, value}
    const scoresArray = Object.keys(matrix).map(key => {
      const [altId, critId] = key.split('-');
      return {
        alternativeId: parseInt(altId),
        criteriaId: parseInt(critId),
        value: matrix[key]
      };
    });

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: scoresArray })
      });
      
      if (res.ok) {
        setMessage('Perubahan matriks berhasil disimpan ke database!');
        fetchData(); // reload
      } else {
        setMessage('Gagal menyimpan perubahan.');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan jaringan.');
    }
    
    setSaving(false);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleReset = () => {
    const confirmReset = window.confirm('Anda yakin ingin mengosongkan semua angka di layar? (Ini belum merubah database sampai Anda tekan Simpan)');
    if (confirmReset) {
      const clearedMatrix = {};
      alternatives.forEach(a => {
        criteria.forEach(c => {
          clearedMatrix[`${a.id}-${c.id}`] = 0;
        });
      });
      setMatrix(clearedMatrix);
    }
  };

  return (
    <div>
      <PasswordModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={executeSave} 
        title="Verifikasi Kredensial"
        message="Masukkan password admin Anda untuk menerapkan perubahan matriks ini secara permanen:"
      />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Matriks Keputusan</h1>
        <p className={styles.pageSubtitle}>Input manual nilai mentah setiap alternatif terhadap kriteria</p>
      </div>

      {message && (
        <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
          {message}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto', marginBottom: '2rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '1rem' }}>Alternatif</th>
              {criteria.map(c => (
                <th key={c.id} style={{ padding: '1rem' }}>
                  {c.name}<br/>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({c.type})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alternatives.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{a.name}</td>
                {criteria.map(c => {
                  const key = `${a.id}-${c.id}`;
                  return (
                    <td key={c.id} style={{ padding: '1rem' }}>
                      <input 
                        type="number"
                        className="input-field"
                        style={{ padding: '8px', width: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)' }}
                        value={matrix[key] !== undefined ? matrix[key] : ''}
                        onChange={(e) => handleInputChange(a.id, c.id, e.target.value)}
                        placeholder="Nilai..."
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {alternatives.length === 0 && (
              <tr>
                <td colSpan={criteria.length + 1} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Data alternatif belum tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {alternatives.length > 0 && criteria.length > 0 && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={handleReset} 
              style={{ padding: '12px 24px', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', fontWeight: '600', cursor: 'pointer', border: 'none', transition: 'all 0.2s' }}
            >
              Reset ke 0
            </button>
            <button type="button" className="btn-primary" onClick={initiateSave} disabled={saving}>
              {saving ? 'Memproses...' : 'Simpan Semua Penilaian'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
