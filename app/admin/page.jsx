'use client';

import { useState } from 'react';
import styles from './layout.module.css';

export default function AdminDashboard() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState('');

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeedResult(data.message || data.error);
    } catch (e) {
      setSeedResult('Error seeding database');
    }
    setSeeding(false);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard SPK</h1>
        <p className={styles.pageSubtitle}>Selamat datang di Panel Admin Sistem Pendukung Keputusan Pemilihan Platform Promosi Digital</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>Inisialisasi Data Default</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
          Gunakan tombol di bawah ini untuk mengisi database dengan data awal (Kriteria dan Alternatif bawaan).
        </p>
        <button className="btn-primary" onClick={handleSeed} disabled={seeding}>
          {seeding ? 'Memproses...' : 'Seed Data Default'}
        </button>
        {seedResult && <p style={{ marginTop: '1rem', color: 'var(--accent-color)' }}>{seedResult}</p>}
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Tentang Metode SAW (Simple Additive Weighting)</h3>
        
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Metode SAW sering dikenal dengan istilah metode penjumlahan terbobot. Konsep dasar metode SAW adalah mencari penjumlahan terbobot dari rating kinerja pada setiap alternatif pada semua atribut.
        </p>

        <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>1. Rumus Normalisasi Matriks (R<sub>ij</sub>)</h4>
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '1px solid var(--card-border)',
          marginBottom: '1.5rem',
          fontFamily: 'monospace',
          fontSize: '1.1rem'
        }}>
          <p style={{ marginBottom: '1rem' }}>
            <span style={{ color: '#4ade80' }}>Untuk Kriteria Benefit (Keuntungan):</span><br/>
            R<sub>ij</sub> = X<sub>ij</sub> / Max(X<sub>ij</sub>)
          </p>
          <p>
            <span style={{ color: '#f87171' }}>Untuk Kriteria Cost (Biaya):</span><br/>
            R<sub>ij</sub> = Min(X<sub>ij</sub>) / X<sub>ij</sub>
          </p>
        </div>
        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
          <li><strong>R<sub>ij</sub></strong> : Nilai rating kinerja ternormalisasi</li>
          <li><strong>X<sub>ij</sub></strong> : Nilai atribut yang dimiliki dari setiap kriteria</li>
          <li><strong>Max(X<sub>ij</sub>)</strong> : Nilai terbesar dari setiap kriteria</li>
          <li><strong>Min(X<sub>ij</sub>)</strong> : Nilai terkecil dari setiap kriteria</li>
        </ul>

        <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>2. Rumus Nilai Preferensi Akhir (V<sub>i</sub>)</h4>
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '1px solid var(--card-border)',
          marginBottom: '1.5rem',
          fontFamily: 'monospace',
          fontSize: '1.1rem',
          color: 'var(--accent-color)'
        }}>
          V<sub>i</sub> = Σ (W<sub>j</sub> * R<sub>ij</sub>)
        </div>
        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
          <li><strong>V<sub>i</sub></strong> : Nilai akhir dari alternatif (Peringkat / Ranking)</li>
          <li><strong>W<sub>j</sub></strong> : Bobot dari kriteria yang telah ditentukan (Total harus = 1)</li>
          <li><strong>R<sub>ij</sub></strong> : Nilai normalisasi matriks</li>
          <li><strong>Σ</strong> : Penjumlahan dari perkalian bobot dengan nilai normalisasi seluruh kriteria</li>
        </ul>

      </div>
    </div>
  );
}
