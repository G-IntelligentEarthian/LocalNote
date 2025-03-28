import React, { useState, useEffect, useRef } from 'react';
import { StorageType, STORAGE_PROVIDERS } from '../types/storage';
import { storageConfigService } from '../services/storageConfig';
import { migrationService } from '../services/migrationService';
import { backupService } from '../services/backupService';
import styles from '../styles/StorageSettings.module.css';

export function StorageSettings() {
  const [selectedType, setSelectedType] = useState<StorageType>('indexedDB');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{
    stage: string;
    completed: number;
    total: number;
  } | null>(null);
  const [storageStatus, setStorageStatus] = useState<{
    isValid: boolean;
    noteCount: number;
    storageType: StorageType;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
    validateStorage();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function loadConfig() {
    try {
      setLoading(true);
      const config = await storageConfigService.getConfig();
      setSelectedType(config.type);
    } catch (err) {
      setError('Failed to load storage settings');
    } finally {
      setLoading(false);
    }
  }

  async function validateStorage() {
    const status = await migrationService.validateStorage();
    setStorageStatus(status);
  }

  async function handleStorageChange(type: StorageType) {
    try {
      setError(null);
      setMigrating(true);
      setMigrationProgress({ stage: 'Preparing migration...', completed: 0, total: 100 });
      
      // If choosing file system, request permission first
      if (type === 'fileSystem') {
        try {
          setMigrationProgress({ stage: 'Requesting file system permission...', completed: 10, total: 100 });
          await window.showDirectoryPicker();
        } catch (err) {
          setError('Failed to get file system permission');
          setMigrating(false);
          setMigrationProgress(null);
          return;
        }
      }

      // Perform migration
      setMigrationProgress({ stage: 'Reading current notes...', completed: 20, total: 100 });
      await migrationService.migrateToStorage(type);
      setMigrationProgress({ stage: 'Verifying migration...', completed: 80, total: 100 });
      setSelectedType(type);
      
      // Validate storage after migration
      await validateStorage();
      setMigrationProgress({ stage: 'Migration completed!', completed: 100, total: 100 });
      setSuccess('Storage location changed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to migrate storage');
    } finally {
      setMigrating(false);
      setTimeout(() => setMigrationProgress(null), 2000);
    }
  }

  async function handleExportBackup() {
    try {
      setError(null);
      const result = await backupService.exportNotes();
      setSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export backup');
    }
  }

  async function handleImportBackup(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null);
      const file = event.target.files?.[0];
      if (!file) return;

      const result = await backupService.importNotes(file);
      setSuccess(`Successfully imported ${result.imported} notes (${result.failed} failed)`);
      await validateStorage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import backup');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading storage settings...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Storage Settings</h2>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          {success}
        </div>
      )}

      {storageStatus && (
        <div className={styles.status}>
          <p>Current Storage: {storageStatus.storageType}</p>
          <p>Notes: {storageStatus.noteCount}</p>
          <p>Status: {storageStatus.isValid ? 'Valid' : 'Invalid'}</p>
          <div className={styles.backupActions}>
            <button onClick={handleExportBackup} className={styles.backupButton}>
              Export Backup
            </button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className={styles.backupButton}
            >
              Import Backup
            </button>
          </div>
        </div>
      )}

      <div className={styles.options}>
        {STORAGE_PROVIDERS.map(provider => (
          <div
            key={provider.type}
            className={`${styles.option} ${!provider.available ? styles.disabled : ''} ${selectedType === provider.type ? styles.selected : ''}`}
            onClick={() => provider.available && handleStorageChange(provider.type)}
          >
            <span className={styles.icon}>{provider.icon}</span>
            <div className={styles.info}>
              <div className={styles.name}>{provider.name}</div>
              <div className={styles.description}>{provider.description}</div>
              {!provider.available && (
                <div className={styles.unavailable}>
                  This storage type is not available in your browser
                </div>
              )}
            </div>
            {selectedType === provider.type && (
              <span className={styles.checkmark}>✓</span>
            )}
          </div>
        ))}
      </div>

      {migrationProgress && (
        <div className={styles.migrationProgress}>
          <div className={styles.progressStage}>{migrationProgress.stage}</div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(migrationProgress.completed / migrationProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.warning}>
        <p>
          <strong>Note:</strong> When changing storage location, your notes will be automatically migrated.
          However, it's recommended to backup your notes before making any changes.
          The migration process will preserve all your notes and their content.
        </p>
      </div>
    </div>
  );
} 