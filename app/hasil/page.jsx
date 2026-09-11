'use client';

import { useEffect, useState, useRef } from 'react';
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

      {/* Top Result Analysis */}
      <div className={`glass-panel ${styles.sectionBox}`}>
        <h3 className={styles.sectionTitle}>Analisis Pemenang: {topPlatform.alternativeName}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Rincian perhitungan nilai preferensi untuk alternatif terbaik
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {criteria.map(c => {
            const weightVal = topPlatform.details[c.id] || 0; // Final weighted score
            const normVal = topPlatform.normalizedValues[c.id] || 0; // Normalized score
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '4px 12px', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem', 
                  marginRight: '1.5rem',
                  minWidth: '80px',
                  textAlign: 'center'
                }}>
                  {c.type === 'cost' ? '📉 Cost' : '📈 Benefit'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{c.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Normalisasi: {normVal.toFixed(4)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Skor Akhir</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-color)' }}>{weightVal.toFixed(4)}</div>
                </div>
              </div>
            );
          })}
        </div>
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
                <tr key={res.alternativeId} className={index === 0 ? styles.rowTop : ''}>
                  <td>
                    <span className={index === 0 ? styles.badgeTop : styles.badgeNormal}>
                      #{index + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{res.alternativeName}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{res.description}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{res.totalScore.toFixed(4)}</td>
                </tr>
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
