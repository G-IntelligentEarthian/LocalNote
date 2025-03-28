export type StorageType = 'indexedDB' | 'localStorage' | 'fileSystem';

export interface StorageProvider {
  type: StorageType;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export const STORAGE_PROVIDERS: StorageProvider[] = [
  {
    type: 'indexedDB',
    name: 'Browser Storage',
    description: 'Store notes in your browser (recommended for most users)',
    icon: '🌐',
    available: true
  },
  {
    type: 'localStorage',
    name: 'Local Storage',
    description: 'Store notes in browser local storage (limited space)',
    icon: '💾',
    available: true
  },
  {
    type: 'fileSystem',
    name: 'File System',
    description: 'Store notes in your chosen folder (requires permission)',
    icon: '📁',
    available: 'showDirectoryPicker' in window
  }
]; 