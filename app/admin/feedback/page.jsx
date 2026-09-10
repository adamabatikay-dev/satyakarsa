'use client';

import { useState, useEffect } from 'react';
import styles from '../layout.module.css';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => {
        setFeedback(data);
        setLoading(false);
      });
  }, []);

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
        <h1 className={styles.pageTitle}>Saran & Kritik</h1>
        <p className={styles.pageSubtitle}>Masukan dari publik terhadap sistem aplikasi SPK</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading && <p>Memuat saran & kritik...</p>}
        
        {!loading && feedback.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>Belum ada saran dan kritik yang masuk.</p>
        )}

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>
          {feedback.map(f => (
            <div key={f.id} style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '1.5rem', 
              borderRadius: '12px',
              border: '1px solid var(--card-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--accent-color)' }}>{f.name || 'Anonim'}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(f.createdAt)}</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-main)' }}>
                "{f.message}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
