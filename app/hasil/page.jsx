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
  const totalSumScore = results.reduce((sum, r) => sum + r.totalScore, 0);

  // Helper to calculate percentage
  const getPercentage = (score) => {
    if (totalSumScore === 0) return "0.0";
    return ((score / totalSumScore) * 100).toFixed(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Rekomendasi Platform Anda</h1>
        <p className={styles.subtitle}>Berdasarkan perhitungan SAW (Simple Additive Weighting)</p>
      </div>

      <div className={`glass-panel ${styles.topResult}`}>
        <div className={styles.badge}>Peringkat 1</div>
        <h2>{topPlatform.alternativeName}</h2>
        <div className={styles.score}>
          Skor Akhir: {topPlatform.totalScore.toFixed(3)} 
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '10px' }}>({getPercentage(topPlatform.totalScore)}% dari total keseluruhan)</span>
        </div>
        <p>{topPlatform.description}</p>
        
        {/* Top Result Analysis */}
        <div style={{ marginTop: '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Analisis Perhitungan Kriteria:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {criteria.map(c => {
              const weightVal = topPlatform.details[c.id] || 0;
              const normVal = topPlatform.normalizedValues[c.id] || 0;
              return (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{c.name}</div>
                  <div style={{ fontWeight: 'bold' }}>Bobot: {weightVal.toFixed(3)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Normalisasi: {normVal.toFixed(3)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <h3 className={styles.listTitle}>Peringkat Keseluruhan & Analisis</h3>
      <div className={styles.resultList}>
        {results.map((res, index) => (
          <div key={res.alternativeId} className={`glass-panel ${styles.resultCard}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }} onClick={() => setExpanded(expanded === res.alternativeId ? null : res.alternativeId)}>
              <div className={styles.rank}>#{index + 1}</div>
              <div className={styles.cardInfo}>
                <h4>{res.alternativeName}</h4>
                <div className={styles.scoreRow}>
                  <span className={styles.scoreLabel}>Skor:</span>
                  <span className={styles.scoreValue}>{res.totalScore.toFixed(3)} ({getPercentage(res.totalScore)}%)</span>
                </div>
              </div>
              <div style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
                {expanded === res.alternativeId ? 'Sembunyikan Analisis ▲' : 'Lihat Analisis ▼'}
              </div>
            </div>
            
            {/* Expanded Analysis */}
            {expanded === res.alternativeId && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                  {criteria.map(c => {
                    const weightVal = res.details[c.id] || 0;
                    const normVal = res.normalizedValues[c.id] || 0;
                    return (
                      <div key={c.id}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{c.name}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Bobot: {weightVal.toFixed(3)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className={styles.actions}>
        <Link href="/kuesioner" className="btn-primary">
          Ubah Preferensi
        </Link>
        <Link href="/feedback" className={styles.homeLink} style={{ 
          padding: '12px 24px',
          borderRadius: '9999px',
          background: 'rgba(59, 130, 246, 0.1)',
          color: 'var(--accent-color)',
          textDecoration: 'none',
          fontWeight: '600',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          Beri Saran & Kritik
        </Link>
        <Link href="/" className={styles.homeLink}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
