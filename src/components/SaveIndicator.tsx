import React from 'react';
import { SaveStatus } from '../hooks/useAutosave';
import styles from '../styles/SaveIndicator.module.css';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
}

export function SaveIndicator({ status, lastSaved }: SaveIndicatorProps) {
  const getStatusText = () => {
    switch (status) {
      case 'saved':
        return 'All changes saved';
      case 'saving':
        return 'Saving...';
      case 'unsaved':
        return 'Unsaved changes';
      case 'error':
        return 'Error saving';
      default:
        return '';
    }
  };

  const getLastSavedText = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return 'Just now';
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h ago`;
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.indicator} ${styles[status]}`}>
        {status === 'saving' && (
          <svg className={styles.spinner} viewBox="0 0 24 24">
            <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" />
          </svg>
        )}
        {status === 'saved' && (
          <svg className={styles.checkmark} viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        )}
        {status === 'error' && (
          <svg className={styles.error} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        )}
        <span className={styles.status}>{getStatusText()}</span>
        {lastSaved && status === 'saved' && (
          <span className={styles.lastSaved}>{getLastSavedText()}</span>
        )}
      </div>
    </div>
  );
} 