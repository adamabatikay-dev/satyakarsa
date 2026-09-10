'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Kuesioner() {
  // Steps: 1 = Identity, 2 = Questionnaire
  const [step, setStep] = useState(1);
  
  // Data states
  const [identityFields, setIdentityFields] = useState([]);
  const [identityData, setIdentityData] = useState({});
  const [criteria, setCriteria] = useState([]);
  const [weights, setWeights] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch both Identity Fields and Criteria
    Promise.all([
      fetch('/api/identity-fields').then(res => res.json()),
      fetch('/api/criteria').then(res => res.json())
    ]).then(([identities, crits]) => {
      setIdentityFields(identities);
      setCriteria(crits);
      
      const initialWeights = {};
      crits.forEach(c => initialWeights[c.id] = 3);
      setWeights(initialWeights);
      
      setLoading(false);
    });
  }, []);

  // Handlers for Identity Form
  const handleIdentityChange = (name, value) => {
    setIdentityData(prev => ({ ...prev, [name]: value }));
  };

  const handleIdentitySubmit = (e) => {
    e.preventDefault();
    // Validate if all required fields are filled (basic check)
    if (Object.keys(identityData).length < identityFields.length) {
      alert('Harap lengkapi seluruh isian identitas sebelum melanjutkan.');
      return;
    }
    // Save to localStorage so results page can send it to records DB
    localStorage.setItem('sawIdentity', JSON.stringify(identityData));
    setStep(2);
  };

  // Handlers for Kuesioner
  const handleWeightChange = (id, value) => {
    setWeights(prev => ({ ...prev, [id]: parseInt(value) }));
  };

  const handleKuesionerSubmit = async (e) => {
    e.preventDefault();
    setCalculating(true);
    
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userWeights: weights })
      });
      const data = await res.json();
      
      if (data.results) {
        localStorage.setItem('sawResults', JSON.stringify(data.results));
        router.push('/hasil');
      } else {
        alert(data.error || 'Terjadi kesalahan');
        setCalculating(false);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi server.');
      setCalculating(false);
    }
  };

  if (loading) return <div className={styles.container}><div className={styles.loader}>Memuat form...</div></div>;

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.formCard}`}>
        {step === 1 ? (
          // STEP 1: IDENTITY FORM
          <>
            <h2 className={styles.title}>Pengisian Identitas</h2>
            <p className={styles.desc}>Silakan isi data diri Anda terlebih dahulu untuk tujuan pencatatan statistik sistem.</p>
            
            <form onSubmit={handleIdentitySubmit} className={styles.form}>
              {identityFields.map(field => (
                <div key={field.id} className={styles.formGroup} style={{ padding: '0', background: 'transparent', border: 'none' }}>
                  <label style={{ textAlign: 'left', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{field.name}</label>
                  
                  {field.type === 'select' ? (
                    <select 
                      className="input-field" 
                      required 
                      value={identityData[field.name] || ''}
                      onChange={(e) => handleIdentityChange(field.name, e.target.value)}
                      style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="" disabled>Pilih opsi...</option>
                      {field.options && field.options.split(',').map(opt => (
                        <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type={field.type === 'number' ? 'number' : 'text'}
                      className="input-field"
                      required
                      value={identityData[field.name] || ''}
                      onChange={(e) => handleIdentityChange(field.name, e.target.value)}
                      placeholder={`Masukkan ${field.name.toLowerCase()}...`}
                      style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  )}
                </div>
              ))}
              
              <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
                Lanjut ke Kuesioner &rarr;
              </button>
            </form>
          </>
        ) : (
          // STEP 2: QUESTIONNAIRE
          <>
            <h2 className={styles.title}>Kuesioner Preferensi</h2>
            <p className={styles.desc}>Seberapa penting kriteria berikut bagi kampanye Anda?</p>
            
            <form onSubmit={handleKuesionerSubmit} className={styles.form}>
              {criteria.map(c => (
                <div key={c.id} className={styles.formGroup}>
                  <label>{c.name}</label>
                  <div className={styles.ratingGroup}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`${styles.ratingBtn} ${weights[c.id] === num ? styles.activeRating : ''}`}
                        onClick={() => handleWeightChange(c.id, num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className={styles.ratingLabels}>
                    <span>Sangat Tidak Penting</span>
                    <span>Sangat Penting</span>
                  </div>
                </div>
              ))}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer' }}>
                  &larr; Kembali
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px', fontSize: '1.2rem' }} disabled={calculating}>
                  {calculating ? 'Memproses...' : 'Dapatkan Rekomendasi'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
