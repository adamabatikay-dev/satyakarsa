'use client';

import { useState, useEffect } from 'react';
import styles from '../layout.module.css';

export default function AdminRiwayat() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/records')
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        setLoading(false);
      });
  }, []);

  // Helper to parse JSON identity data safely
  const renderIdentity = (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      return (
        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {Object.entries(data).map(([key, val]) => (
            <li key={key}><strong>{key}:</strong> {val}</li>
          ))}
        </ul>
      );
    } catch (e) {
      return <span>Data tidak valid</span>;
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
        <h1 className={styles.pageTitle}>Riwayat Rekomendasi</h1>
        <p className={styles.pageSubtitle}>Log hasil sistem rekomendasi yang telah diberikan kepada publik</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '1rem' }}>Waktu</th>
              <th style={{ padding: '1rem', width: '40%' }}>Profil Pengguna</th>
              <th style={{ padding: '1rem' }}>Rekomendasi Teratas</th>
              <th style={{ padding: '1rem' }}>Skor Keseluruhan</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</td></tr>
            )}
            {!loading && records.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {formatDate(r.createdAt)}
                </td>
                <td style={{ padding: '1rem' }}>
                  {renderIdentity(r.identityData)}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#4ade80',
                    fontWeight: 'bold'
                  }}>
                    {r.topAlternativeName}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                  {r.score.toFixed(3)}
                </td>
              </tr>
            ))}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada riwayat rekomendasi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
