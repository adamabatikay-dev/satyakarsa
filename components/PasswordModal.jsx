import styles from './PasswordModal.module.css';
import { useState } from 'react';

export default function PasswordModal({ isOpen, onClose, onConfirm, title, message }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // Hardcoded for this prototype
      setError('');
      setPassword('');
      onConfirm();
    } else {
      setError('Password salah! Proses dibatalkan.');
    }
  };

  const handleCancel = () => {
    setError('');
    setPassword('');
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={`glass-panel ${styles.modal}`}>
        <h3>{title || 'Verifikasi Keamanan'}</h3>
        <p>{message || 'Masukkan password admin Anda untuk melanjutkan:'}</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            className="input-field" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password..."
            autoFocus
            style={{ marginTop: '1rem', marginBottom: '1rem' }}
          />
          
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.btnCancel}>Batal</button>
            <button type="submit" className="btn-primary">Konfirmasi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
