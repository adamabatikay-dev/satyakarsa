'use client';

import { useState, useEffect } from 'react';
import styles from '../layout.module.css';
import PasswordModal from '../../../components/PasswordModal';

export default function AdminFeedbackLoop() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' | 'settings' | 'evaluations' | 'logs'
  const [selectedAltFilter, setSelectedAltFilter] = useState('all');

  // Action states
  const [syncing, setSyncing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' });
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Editable settings form
  const [settingsForm, setSettingsForm] = useState({
    isAutoUpdate: true,
    updateMode: 'periodic',
    batchThreshold: 5,
    blendingAlpha: 0.5
  });

  // Test evaluation form states (for quick simulation in admin)
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simForm, setSimForm] = useState({
    respondentName: '',
    alternativeId: 1,
    scores: { 1: 3, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4 },
    comment: ''
  });
  const [simSubmitting, setSimSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbackLoopData();
  }, []);

  const fetchFeedbackLoopData = async () => {
    try {
      const res = await fetch('/api/feedback-loop');
      const json = await res.json();
      if (res.ok) {
        setData(json);
        if (json.settings) {
          setSettingsForm({
            isAutoUpdate: json.settings.isAutoUpdate ?? true,
            updateMode: json.settings.updateMode || 'periodic',
            batchThreshold: json.settings.batchThreshold || 5,
            blendingAlpha: json.settings.blendingAlpha ?? 0.5
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch feedback loop data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 5000);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/feedback-loop/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customAlpha: settingsForm.blendingAlpha,
          notes: 'Sinkronisasi manual matriks keputusan dipicu oleh Administrator.'
        })
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast('Matriks keputusan berhasil disinkronkan dengan penilaian responden terbaru!');
        fetchFeedbackLoopData();
      } else {
        showToast(resJson.error || 'Gagal menyinkronkan matriks.', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan jaringan saat sinkronisasi.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/feedback-loop/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast('Pengaturan dynamic feedback loop berhasil disimpan!');
        fetchFeedbackLoopData();
      } else {
        showToast(resJson.error || 'Gagal menyimpan pengaturan.', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const executeResetBaseline = async () => {
    setResetModalOpen(false);
    setSyncing(true);
    try {
      const res = await fetch('/api/feedback-loop/reset', { method: 'POST' });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast('Matriks keputusan berhasil dikembalikan ke nilai dasar (baseline awal)!');
        fetchFeedbackLoopData();
      } else {
        showToast('Gagal mereset matriks.', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleSimSubmit = async (e) => {
    e.preventDefault();
    setSimSubmitting(true);
    try {
      const res = await fetch('/api/feedback-loop/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simForm)
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        showToast(`Penilaian simulasi berhasil dicatat! ${resJson.syncTriggered ? '(Pembaruan matriks otomatis langsung terpicu)' : ''}`);
        setSimModalOpen(false);
        setSimForm({
          respondentName: '',
          alternativeId: 1,
          scores: { 1: 3, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4 },
          comment: ''
        });
        fetchFeedbackLoopData();
      } else {
        showToast(resJson.error || 'Gagal menyimpan simulasi.', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setSimSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Memuat data Dynamic Feedback Loop...
      </div>
    );
  }

  const settings = data?.settings || settingsForm;
  const totalEvals = data?.totalEvaluations || 0;
  const comparison = data?.comparison || [];
  const criteriaList = data?.criteriaList || [];
  const syncLogs = data?.syncLogs || [];
  const evaluations = data?.evaluations || [];

  const filteredComparison = selectedAltFilter === 'all' 
    ? comparison 
    : comparison.filter(c => c.alternativeId === parseInt(selectedAltFilter));

  return (
    <div>
      <PasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={executeResetBaseline}
        title="Verifikasi Reset Matriks Baseline"
        message="Masukkan password admin Anda untuk mengembalikan seluruh nilai matriks keputusan ke baseline awal:"
      />

      {/* Header */}
      <div className={styles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className={styles.pageTitle}>Dynamic Feedback Loop</h1>
          <p className={styles.pageSubtitle}>
            Otomatisasi pengumpulan evaluasi responden riil dan pembaruan berkala matriks keputusan (SAW)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={() => setSimModalOpen(true)}
            style={{ 
              padding: '10px 18px', 
              borderRadius: '9999px', 
              background: 'rgba(255,255,255,0.08)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            + Simulasi Penilaian Responden
          </button>
          <button 
            type="button" 
            onClick={handleManualSync}
            disabled={syncing}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            {syncing ? 'Menyinkronkan...' : '⚡ Sinkronkan Matriks Sekarang'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {message.text && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          borderRadius: '10px',
          background: message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
          border: `1px solid ${message.type === 'error' ? '#ef4444' : '#22c55e'}`,
          color: message.type === 'error' ? '#f87171' : '#4ade80',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>{message.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status Feedback Loop</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: settings.isAutoUpdate ? '#22c55e' : '#eab308',
              boxShadow: settings.isAutoUpdate ? '0 0 10px #22c55e' : 'none'
            }} />
            <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {settings.isAutoUpdate ? 'Otomatis Aktif' : 'Manual Saja'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {settings.isAutoUpdate ? `Mode: ${settings.updateMode === 'realtime' ? 'Real-time Seketika' : `Berkala Tiap ${settings.batchThreshold} Responden`}` : 'Diperbarui via tombol sinkron'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Responden Penilai</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-color)' }}>
            {totalEvals} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Responden</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Evaluasi riil kinerja platform
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Bobot Pengaruh Adaptif (&alpha;)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {Math.round((settings.blendingAlpha ?? 0.5) * 100)}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {Math.round((1 - (settings.blendingAlpha ?? 0.5)) * 100)}% Baseline + {Math.round((settings.blendingAlpha ?? 0.5) * 100)}% Responden
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Siklus Pembaruan Terakhir</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum pernah'}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--card-border)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('comparison')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            background: activeTab === 'comparison' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'comparison' ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: 600,
            border: activeTab === 'comparison' ? '1px solid var(--accent-color)' : '1px solid transparent',
            cursor: 'pointer'
          }}
        >
          📊 Komparasi Matriks Dinamis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            background: activeTab === 'settings' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'settings' ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: 600,
            border: activeTab === 'settings' ? '1px solid var(--accent-color)' : '1px solid transparent',
            cursor: 'pointer'
          }}
        >
          ⚙️ Pengaturan Feedback Loop
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('evaluations')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            background: activeTab === 'evaluations' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'evaluations' ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: 600,
            border: activeTab === 'evaluations' ? '1px solid var(--accent-color)' : '1px solid transparent',
            cursor: 'pointer'
          }}
        >
          👥 Penilaian Responden ({evaluations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            background: activeTab === 'logs' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'logs' ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: 600,
            border: activeTab === 'logs' ? '1px solid var(--accent-color)' : '1px solid transparent',
            cursor: 'pointer'
          }}
        >
          📜 Log Riwayat Pembaruan ({syncLogs.length})
        </button>
      </div>

      {/* TAB 1: COMPARISON */}
      {activeTab === 'comparison' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Tabel Perbandingan Nilai Matriks</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Menampilkan perbandingan nilai dasar (baseline), rata-rata masukan responden, dan nilai aktif yang digunakan algoritma SAW
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Alternatif:</label>
              <select
                className="input-field"
                value={selectedAltFilter}
                onChange={e => setSelectedAltFilter(e.target.value)}
                style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', borderRadius: '6px' }}
              >
                <option value="all">Semua Platform ({comparison.length})</option>
                {comparison.map(alt => (
                  <option key={alt.alternativeId} value={alt.alternativeId}>{alt.alternativeName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto', marginBottom: '2rem' }}>
            {filteredComparison.map(alt => (
              <div key={alt.alternativeId} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--accent-color)' }}>
                      {alt.alternativeName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({alt.description})</span>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '9999px', 
                    background: alt.evaluationCount > 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', 
                    color: alt.evaluationCount > 0 ? '#60a5fa' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {alt.evaluationCount} Evaluasi Masuk
                  </span>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }}>
                      <th style={{ padding: '10px 14px' }}>Kode</th>
                      <th style={{ padding: '10px 14px' }}>Kriteria</th>
                      <th style={{ padding: '10px 14px' }}>Tipe</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Nilai Baseline (X₀)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Rata-rata Responden (X̄)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Matriks Aktif Terkini</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Perubahan (&Delta;)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteriaList.map(crit => {
                      const item = alt.criteria[crit.id] || {};
                      const delta = item.delta || 0;
                      return (
                        <tr key={crit.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{crit.code}</td>
                          <td style={{ padding: '10px 14px' }}>{crit.name}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              background: crit.type === 'cost' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                              color: crit.type === 'cost' ? '#f87171' : '#4ade80'
                            }}>
                              {crit.type.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'monospace' }}>
                            {item.baselineVal?.toFixed(3) ?? '-'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'monospace', color: alt.evaluationCount > 0 ? '#60a5fa' : 'var(--text-muted)' }}>
                            {item.respAverage?.toFixed(3) ?? '-'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>
                            {item.activeVal?.toFixed(3) ?? '-'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            {delta === 0 ? (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tetap</span>
                            ) : delta > 0 ? (
                              <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.85rem' }}>
                                +{delta.toFixed(3)} ▲
                              </span>
                            ) : (
                              <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.85rem' }}>
                                {delta.toFixed(3)} ▼
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Mathematical Formula Banner */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--accent-color)' }}>
              Mekanisme Agregasi Dynamic Feedback Loop
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Nilai matriks keputusan aktif dihitung menggunakan rumus pembobotan adaptif:<br/>
              <code style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px', color: '#60a5fa' }}>
                X_ij (Baru) = (1 - &alpha;) &times; X_ij (Baseline) + &alpha; &times; X̄_ij (Responden)
              </code><br/>
              di mana parameter adaptasi <strong>&alpha; = {settings.blendingAlpha ?? 0.5}</strong> memastikan sistem menyerap tren pengalaman responden baru tanpa mengorbankan stabilitas dasar penelitian awal.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '800px' }}>
          <form onSubmit={handleSaveSettings} className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem' }}>Konfigurasi Dynamic Feedback Loop</h3>

            {/* Toggle Auto Update */}
            <div style={{ marginBottom: '1.75rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={settingsForm.isAutoUpdate}
                  onChange={e => setSettingsForm(prev => ({ ...prev, isAutoUpdate: e.target.checked }))}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                />
                <span>Aktifkan Pembaruan Otomatis Matriks Keputusan</span>
              </label>
              <p style={{ margin: '0.5rem 0 0 2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Jika diaktifkan, penilaian dari responden baru secara otomatis dapat memperbarui nilai matriks keputusan sesuai jadwal/mode di bawah.
              </p>
            </div>

            {/* Update Mode */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem' }}>Mode Pembaruan Berkala</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div
                  onClick={() => setSettingsForm(prev => ({ ...prev, updateMode: 'periodic' }))}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: settingsForm.updateMode === 'periodic' ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                    background: settingsForm.updateMode === 'periodic' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="radio"
                      name="updateMode"
                      value="periodic"
                      checked={settingsForm.updateMode === 'periodic'}
                      onChange={() => {}}
                    />
                    <strong style={{ color: settingsForm.updateMode === 'periodic' ? 'var(--accent-color)' : 'inherit' }}>
                      Pembaruan Berkala (Batch Interval)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Matriks diperbarui otomatis secara periodik setiap kelipatan N responden baru terkumpul. Direkomendasikan untuk stabilitas data.
                  </p>
                </div>

                <div
                  onClick={() => setSettingsForm(prev => ({ ...prev, updateMode: 'realtime' }))}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: settingsForm.updateMode === 'realtime' ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                    background: settingsForm.updateMode === 'realtime' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="radio"
                      name="updateMode"
                      value="realtime"
                      checked={settingsForm.updateMode === 'realtime'}
                      onChange={() => {}}
                    />
                    <strong style={{ color: settingsForm.updateMode === 'realtime' ? 'var(--accent-color)' : 'inherit' }}>
                      Otomatis Real-time (Seketika)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Setiap kali responden baru mengirimkan penilaian, matriks langsung diperbarui seketika.
                  </p>
                </div>
              </div>
            </div>

            {/* Threshold N */}
            {settingsForm.updateMode === 'periodic' && (
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Ambang Batas Jumlah Responden (Batch Threshold)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="input-field"
                    value={settingsForm.batchThreshold}
                    onChange={e => setSettingsForm(prev => ({ ...prev, batchThreshold: parseInt(e.target.value) || 1 }))}
                    style={{ width: '120px', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)' }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    responden baru untuk setiap siklus pembaruan berkala.
                  </span>
                </div>
              </div>
            )}

            {/* Blending Alpha Slider */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Bobot Adaptasi Nilai (&alpha;)</label>
                <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '1.1rem' }}>
                  {Math.round(settingsForm.blendingAlpha * 100)}% Responden
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settingsForm.blendingAlpha}
                onChange={e => setSettingsForm(prev => ({ ...prev, blendingAlpha: parseFloat(e.target.value) }))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>10% (Konservatif / Dominan Baseline)</span>
                <span>50% (Seimbang)</span>
                <span>100% (Murni Rata-Rata Responden)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="submit"
                disabled={savingSettings}
                className="btn-primary"
                style={{ padding: '12px 28px' }}
              >
                {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Feedback Loop'}
              </button>
            </div>
          </form>

          {/* Danger Zone: Reset Baseline */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#f87171' }}>Zona Pemulihan Data</h4>
            <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Jika terjadi anomali data masukan dari responden, Anda dapat mengembalikan seluruh matriks keputusan ke nilai dasar (baseline penelitian awal).
            </p>
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔄 Reset Matriks ke Baseline Awal
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: RESPONDENT EVALUATIONS */}
      {activeTab === 'evaluations' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Daftar Evaluasi Responden ({evaluations.length})</h3>
            <button
              type="button"
              onClick={() => setSimModalOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              + Tambah Evaluasi Uji Coba
            </button>
          </div>

          {evaluations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Belum ada evaluasi responden yang tercatat. Klik &quot;+ Tambah Evaluasi Uji Coba&quot; untuk mencoba.
            </div>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Tanggal</th>
                  <th style={{ padding: '12px' }}>Nama Responden</th>
                  <th style={{ padding: '12px' }}>Platform yang Dinilai</th>
                  <th style={{ padding: '12px' }}>Rating Kriteria (C1-C7)</th>
                  <th style={{ padding: '12px' }}>Catatan Pengalaman</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map(ev => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(ev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{ev.respondentName}</td>
                    <td style={{ padding: '12px', color: 'var(--accent-color)' }}>{ev.alternativeName}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5, 6, 7].map(cId => (
                          <span
                            key={cId}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.06)',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace'
                            }}
                            title={`C${cId}: ${ev.scores[cId] || '-'}`}
                          >
                            C{cId}: <strong>{ev.scores[cId] || '-'}</strong>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {ev.comment || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 4: SYNC LOGS */}
      {activeTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 1.5rem' }}>Riwayat Audit Pembaruan Matriks</h3>

          {syncLogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Belum ada riwayat sinkronisasi matriks.
            </div>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Waktu Eksekusi</th>
                  <th style={{ padding: '12px' }}>Tipe Pembaruan</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Responden Terlibat</th>
                  <th style={{ padding: '12px' }}>Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map(log => {
                  let badgeBg = 'rgba(59, 130, 246, 0.2)';
                  let badgeColor = '#60a5fa';
                  let badgeText = 'Manual Admin';

                  if (log.syncType === 'auto_realtime') {
                    badgeBg = 'rgba(34, 197, 94, 0.2)';
                    badgeColor = '#4ade80';
                    badgeText = 'Otomatis Real-time';
                  } else if (log.syncType === 'auto_periodic') {
                    badgeBg = 'rgba(168, 85, 247, 0.2)';
                    badgeColor = '#c084fc';
                    badgeText = 'Otomatis Berkala';
                  } else if (log.syncType === 'reset') {
                    badgeBg = 'rgba(239, 68, 68, 0.2)';
                    badgeColor = '#f87171';
                    badgeText = 'Reset Baseline';
                  }

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(log.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '9999px', background: badgeBg, color: badgeColor, fontSize: '0.8rem', fontWeight: 600 }}>
                          {badgeText}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                        {log.respondentCount}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {log.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Simulation Modal */}
      {simModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>Simulasi Penilaian Responden Baru</h3>
            <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Uji coba bagaimana penilaian responden baru memicu dynamic feedback loop dan memperbarui matriks keputusan.
            </p>

            <form onSubmit={handleSimSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Nama Responden / Profil UMKM
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian (Toko Sepatu Online)"
                  className="input-field"
                  value={simForm.respondentName}
                  onChange={e => setSimForm(prev => ({ ...prev, respondentName: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Pilih Platform Promosi
                </label>
                <select
                  className="input-field"
                  value={simForm.alternativeId}
                  onChange={e => setSimForm(prev => ({ ...prev, alternativeId: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)' }}
                >
                  {comparison.map(alt => (
                    <option key={alt.alternativeId} value={alt.alternativeId}>{alt.alternativeName}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  Penilaian Kriteria (Skala 1 - 5)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {criteriaList.map(crit => (
                    <div key={crit.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong>{crit.code}</strong>: {crit.name}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSimForm(prev => ({
                              ...prev,
                              scores: { ...prev.scores, [crit.id]: val }
                            }))}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              border: simForm.scores[crit.id] === val ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                              background: simForm.scores[crit.id] === val ? 'var(--accent-color)' : 'rgba(0,0,0,0.3)',
                              color: 'white',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Catatan Pengalaman (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Ceritakan pengalaman menggunakan platform ini..."
                  className="input-field"
                  value={simForm.comment}
                  onChange={e => setSimForm(prev => ({ ...prev, comment: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setSimModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={simSubmitting}
                  className="btn-primary"
                  style={{ padding: '10px 22px' }}
                >
                  {simSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
