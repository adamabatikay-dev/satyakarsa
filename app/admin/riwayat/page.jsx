'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from '../layout.module.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

  const chartData = useMemo(() => {
    const counts = {};
    records.forEach(r => {
      counts[r.topAlternativeName] = (counts[r.topAlternativeName] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      count: counts[key]
    })).sort((a, b) => b.count - a.count);
  }, [records]);
  
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'];

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

      {!loading && chartData.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Statistik Platform Terbaik</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--card-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" name="Total Keputusan" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
