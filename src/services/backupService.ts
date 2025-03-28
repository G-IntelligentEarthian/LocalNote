import { EncryptedNote } from '../types/note';
import { storageService } from './storageService';

class BackupService {
  async exportNotes(): Promise<string> {
    try {
      const notes = await storageService.getAllNotes();
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        notes: notes,
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `localnote-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return 'Backup exported successfully';
    } catch (error) {
      throw new Error('Failed to export notes: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async importNotes(file: File): Promise<{ imported: number; failed: number }> {
    try {
      const content = await file.text();
      const backup = JSON.parse(content);
      
      // Validate backup format
      if (!backup.version || !Array.isArray(backup.notes)) {
        throw new Error('Invalid backup file format');
      }

      let imported = 0;
      let failed = 0;

      for (const note of backup.notes) {
        try {
          await storageService.saveNote(note);
          imported++;
        } catch (error) {
          console.error('Failed to import note:', note.id, error);
          failed++;
        }
      }

      return { imported, failed };
    } catch (error) {
      throw new Error('Failed to import notes: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}

export const backupService = new BackupService(); 