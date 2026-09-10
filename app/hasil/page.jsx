'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function Hasil() {
  const [results, setResults] = useState([]);
  const router = useRouter();
  const recorded = useRef(false);

  useEffect(() => {
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
        <h1 className={styles.title}>Rekomendasi Platform Anda</h1>
        <p className={styles.subtitle}>Berdasarkan perhitungan SAW (Simple Additive Weighting)</p>
      </div>

      <div className={`glass-panel ${styles.topResult}`}>
        <div className={styles.badge}>Peringkat 1</div>
        <h2>{topPlatform.alternativeName}</h2>
        <div className={styles.score}>Skor Akhir: {topPlatform.totalScore.toFixed(3)}</div>
        <p>{topPlatform.description}</p>
      </div>

      <h3 className={styles.listTitle}>Peringkat Keseluruhan</h3>
      <div className={styles.resultList}>
        {results.map((res, index) => (
          <div key={res.alternativeId} className={`glass-panel ${styles.resultCard}`}>
            <div className={styles.rank}>#{index + 1}</div>
            <div className={styles.cardInfo}>
              <h4>{res.alternativeName}</h4>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabel}>Skor:</span>
                <span className={styles.scoreValue}>{res.totalScore.toFixed(3)}</span>
              </div>
            </div>
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
