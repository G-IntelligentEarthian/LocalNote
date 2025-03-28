import { StorageType } from '../types/storage';

export interface StorageConfig {
  type: StorageType;
  encryptionEnabled: boolean;
  autoBackupEnabled: boolean;
  backupInterval: number;
}

const DEFAULT_CONFIG: StorageConfig = {
  type: 'indexedDB',
  encryptionEnabled: false,
  autoBackupEnabled: true,
  backupInterval: 5 * 60 * 1000 // 5 minutes
};

class StorageConfigService {
  private readonly CONFIG_KEY = 'localnote_storage_config';

  async getConfig(): Promise<StorageConfig> {
    const savedConfig = localStorage.getItem(this.CONFIG_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return DEFAULT_CONFIG;
  }

  async saveConfig(config: StorageConfig): Promise<void> {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  async updateConfig(updates: Partial<StorageConfig>): Promise<StorageConfig> {
    const currentConfig = await this.getConfig();
    const newConfig = { ...currentConfig, ...updates };
    await this.saveConfig(newConfig);
    return newConfig;
  }
}

export const storageConfigService = new StorageConfigService(); 