'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function Hasil() {
  const [results, setResults] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [expanded, setExpanded] = useState(null); // Track which analysis card is open
  const router = useRouter();
  const recorded = useRef(false);

  useEffect(() => {
    // Fetch criteria for analysis names
    fetch('/api/criteria').then(res => res.json()).then(data => setCriteria(data));

    const stored = localStorage.getItem('sawResults');
    if (stored) {
      const parsedResults = JSON.parse(stored);
      setResults(parsedResults);
      
      // Save record to DB exactly once
      if (!recorded.current && parsedResults.length > 0) {
        recorded.current = true;
        const identityStr = localStorage.getItem('sawIdentity') || '{}';
        const topResult = parsedResults[0];
        
        fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identityData: JSON.parse(identityStr),
            topAlternativeId: topResult.alternativeId,
            topAlternativeName: topResult.alternativeName,
            score: topResult.totalScore
          })
        }).catch(err => console.error("Failed to save record", err));
      }

    } else {
      router.push('/kuesioner');
    }
  }, [router]);

  if (results.length === 0) return null;

  const topPlatform = results[0];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Laporan Hasil Rekomendasi</h1>
        <p className={styles.subtitle}>Sistem Pendukung Keputusan Pemilihan Platform Promosi Digital</p>
      </div>



      {/* Detailed Rankings Table */}
      <div className={`glass-panel ${styles.sectionBox}`}>
        <h3 className={styles.sectionTitle}>Peringkat Keseluruhan</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Peringkat lengkap beserta nilai preferensi akhir
        </p>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.rankingTable}>
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Alternatif</th>
                <th>Deskripsi</th>
                <th style={{ textAlign: 'center' }}>Nilai Preferensi</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, index) => (
                <React.Fragment key={res.alternativeId}>
                  <tr 
                    className={index === 0 ? styles.rowTop : ''}
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => setExpanded(expanded === res.alternativeId ? null : res.alternativeId)}
                    onMouseEnter={(e) => {
                      if (index !== 0) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (index !== 0) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td>
                      <span className={index === 0 ? styles.badgeTop : styles.badgeNormal}>
                        #{index + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      {res.alternativeName}
                      <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {expanded === res.alternativeId ? '▲' : '▼'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{res.description}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{res.totalScore.toFixed(4)}</td>
                  </tr>
                  {expanded === res.alternativeId && (
                    <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <td colSpan="4" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Analisis Perhitungan Kriteria</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                          {criteria.map(c => {
                            const weightVal = res.details[c.id] || 0;
                            const normVal = res.normalizedValues[c.id] || 0;
                            return (
                              <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{c.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Normalisasi: {normVal.toFixed(4)}</div>
                                <div style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>Skor Akhir: <span style={{ color: 'var(--accent-color)' }}>{weightVal.toFixed(4)}</span></div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conclusion & Recommendation */}
      <div className={`glass-panel ${styles.sectionBox}`}>
        <h3 className={styles.sectionTitle}>Kesimpulan & Rekomendasi</h3>
        <p style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
          Berdasarkan analisis komprehensif menggunakan metode <em>Simple Additive Weighting</em> (SAW), 
          platform media promosi yang direkomendasikan untuk Anda adalah <strong style={{ color: 'var(--accent-color)', fontSize: '1.2rem' }}>{topPlatform.alternativeName}</strong> dengan 
          nilai preferensi tertinggi sebesar <strong>{topPlatform.totalScore.toFixed(4)}</strong>.
        </p>
      </div>
      
      <div className={styles.actions}>
        <Link href="/kuesioner" className="btn-primary">
          Ulangi Kuesioner
        </Link>
        <Link href="/" className={styles.homeLink}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
