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

  // Dynamic Feedback Loop states
  const [evalPlatformId, setEvalPlatformId] = useState('');
  const [evalScores, setEvalScores] = useState({});
  const [evalComment, setEvalComment] = useState('');
  const [evalSubmitting, setEvalSubmitting] = useState(false);
  const [evalSuccess, setEvalSuccess] = useState(false);
  const [evalNotice, setEvalNotice] = useState('');

  useEffect(() => {
    // Fetch criteria for analysis names
    fetch('/api/criteria').then(res => res.json()).then(data => {
      setCriteria(data);
      const initialScores = {};
      data.forEach(c => { initialScores[c.id] = 4; });
      setEvalScores(initialScores);
    });

    const stored = localStorage.getItem('sawResults');
    if (stored) {
      const parsedResults = JSON.parse(stored);
      setResults(parsedResults);
      if (parsedResults.length > 0) {
        setEvalPlatformId(parsedResults[0].alternativeId);
      }
      
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

  const handleScoreChange = (criteriaId, value) => {
    setEvalScores(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    setEvalSubmitting(true);
    setEvalNotice('');

    try {
      const identityStr = localStorage.getItem('sawIdentity') || '{}';
      const identity = JSON.parse(identityStr);
      const respondentName = identity['Nama Lengkap'] || identity['Nama'] || 'Responden SPK';

      const res = await fetch('/api/feedback-loop/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondentName,
          alternativeId: parseInt(evalPlatformId),
          scores: evalScores,
          comment: evalComment
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEvalSuccess(true);
        if (data.syncTriggered) {
          setEvalNotice('Penilaian Anda langsung menyinkronkan matriks keputusan sistem secara otomatis!');
        } else {
          setEvalNotice('Penilaian Anda telah diakumulasikan ke dalam siklus pembaruan berkala sistem.');
        }
      } else {
        alert(data.error || 'Gagal mengirim evaluasi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setEvalSubmitting(false);
    }
  };

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

      {/* Dynamic Feedback Loop: Respondent Platform Evaluation */}
      <div className={`glass-panel ${styles.sectionBox}`} style={{ border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.6rem' }}>💡</span>
          <div>
            <h3 className={styles.sectionTitle} style={{ margin: 0, color: 'var(--accent-color)' }}>
              Dynamic Feedback Loop: Penilaian Kinerja Platform
            </h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Bantu sistem kami semakin cerdas dan akurat! Berikan penilaian pengalaman riil Anda terhadap platform promosi digital.
            </p>
          </div>
        </div>

        {evalSuccess ? (
          <div style={{
            padding: '1.5rem',
            marginTop: '1.25rem',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#4ade80', margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
              ✓ Penilaian Anda Berhasil Tercatat!
            </h4>
            <p style={{ color: 'var(--text-main)', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>
              {evalNotice}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Evaluasi Anda telah masuk ke dalam loop umpan balik dinamis modul Administrator untuk mengkalibrasi matriks keputusan sistem SPK.
            </p>
            <button
              type="button"
              onClick={() => { setEvalSuccess(false); setEvalComment(''); }}
              style={{
                marginTop: '1rem',
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Beri Penilaian Platform Lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleEvalSubmit} style={{ marginTop: '1.5rem' }}>
            {/* Select Alternative */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                Platform yang Ingin Anda Nilai:
              </label>
              <select
                className="input-field"
                value={evalPlatformId}
                onChange={e => setEvalPlatformId(parseInt(e.target.value))}
                style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', borderRadius: '8px', maxWidth: '400px' }}
              >
                {results.map(r => (
                  <option key={r.alternativeId} value={r.alternativeId}>
                    {r.alternativeName} {r.alternativeId === topPlatform.alternativeId ? '(Rekomendasi Utama)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Criteria Evaluation Group */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                Beri Nilai Berdasarkan Kriteria (Skala 1 = Sangat Rendah s.d. 5 = Sangat Tinggi):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {criteria.map(c => (
                  <div
                    key={c.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
                      {c.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleScoreChange(c.id, num)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: evalScores[c.id] === num ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                              background: evalScores[c.id] === num ? 'var(--accent-color)' : 'rgba(0,0,0,0.3)',
                              color: 'white',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Skor: <strong>{evalScores[c.id] || 4}</strong>/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Comment */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Ceritakan Pengalaman Anda Menggunakan Platform Ini (Opsional):
              </label>
              <textarea
                rows="2"
                className="input-field"
                value={evalComment}
                onChange={e => setEvalComment(e.target.value)}
                placeholder="Misal: Biaya iklan cukup murah dan hasil penjualan meningkat tajam..."
                style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', borderRadius: '8px', width: '100%', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={evalSubmitting}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              {evalSubmitting ? 'Mengirim Penilaian...' : '🚀 Kirim Penilaian Responden'}
            </button>
          </form>
        )}
      </div>
      
      <div className={styles.actions}>
        <Link href="/kuesioner" className="btn-primary">
          Ulangi Kuesioner
        </Link>
        <Link href="/feedback" className="btn-primary" style={{ background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}>
          Kirim Saran & Kritik
        </Link>
        <Link href="/" className={styles.homeLink}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
