import { StorageType } from '../types/storage';
import { EncryptedNote } from '../types/note';
import { storageService } from './storageService';
import { storageConfigService } from './storageConfig';

class MigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationError';
  }
}

class MigrationService {
  private async getAllNotesFromCurrentStorage(): Promise<EncryptedNote[]> {
    return storageService.getAllNotes();
  }

  private async saveNotesToStorage(notes: EncryptedNote[]): Promise<void> {
    // Delete all existing notes first
    const existingNotes = await storageService.getAllNotes();
    for (const note of existingNotes) {
      await storageService.deleteNote(note.id);
    }

    // Save all notes from the new storage
    for (const note of notes) {
      await storageService.saveNote(note);
    }
  }

  async migrateToStorage(newStorageType: StorageType): Promise<void> {
    try {
      // 1. Get current storage type
      const currentConfig = await storageConfigService.getConfig();
      const currentStorageType = currentConfig.type;

      // 2. If migrating to the same storage type, do nothing
      if (currentStorageType === newStorageType) {
        return;
      }

      // 3. Get all notes from current storage
      const notes = await this.getAllNotesFromCurrentStorage();

      // 4. Update storage configuration
      await storageConfigService.updateConfig({ type: newStorageType });

      // 5. Save notes to new storage
      await this.saveNotesToStorage(notes);

      // 6. Verify migration
      const migratedNotes = await storageService.getAllNotes();
      if (migratedNotes.length !== notes.length) {
        throw new MigrationError('Migration verification failed: note count mismatch');
      }

      // 7. Compare notes to ensure data integrity
      for (let i = 0; i < notes.length; i++) {
        const originalNote = notes[i];
        const migratedNote = migratedNotes[i];
        
        if (originalNote.id !== migratedNote.id ||
            originalNote.title !== migratedNote.title ||
            originalNote.encryptedContent !== migratedNote.encryptedContent) {
          throw new MigrationError('Migration verification failed: data mismatch');
        }
      }
    } catch (error) {
      // If migration fails, try to revert to original storage type
      const currentConfig = await storageConfigService.getConfig();
      if (currentConfig.type !== newStorageType) {
        await storageConfigService.updateConfig({ type: currentConfig.type });
      }
      throw error;
    }
  }

  async validateStorage(): Promise<{
    isValid: boolean;
    noteCount: number;
    storageType: StorageType;
  }> {
    try {
      const config = await storageConfigService.getConfig();
      const notes = await storageService.getAllNotes();
      
      return {
        isValid: true,
        noteCount: notes.length,
        storageType: config.type
      };
    } catch (error) {
      return {
        isValid: false,
        noteCount: 0,
        storageType: 'indexedDB' // fallback to default
      };
    }
  }
}

export const migrationService = new MigrationService(); 