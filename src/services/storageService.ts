import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note, EncryptedNote } from '../types/note';
import { generateId, getCurrentTimestamp } from '../utils/helpers';

interface LocalNoteDB extends DBSchema {
  notes: {
    key: string;
    value: EncryptedNote;
    indexes: { 'by-updated': number };
  };
}

class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class StorageService {
  private dbName = 'localnote-db';
  private dbVersion = 1;
  private storeName = 'notes' as const;
  private db: IDBPDatabase<LocalNoteDB> | null = null;

  private async getDB() {
    if (this.db) return this.db;

    try {
      const db = await openDB<LocalNoteDB>(this.dbName, this.dbVersion, {
        upgrade(db, oldVersion, newVersion, transaction) {
          if (!db.objectStoreNames.contains('notes')) {
            const store = db.createObjectStore('notes', { keyPath: 'id' });
            store.createIndex('by-updated', 'updatedAt');
          }
        },
        blocked: () => {
          // Handle blocked state (another tab has an older version)
          console.warn('Database blocked: Another tab has an older version');
        },
        blocking: () => {
          // Handle blocking state (this tab is blocking others)
          if (this.db) {
            this.db.close();
            this.db = null;
          }
        },
        terminated: () => {
          // Handle unexpected termination
          this.db = null;
        },
      });
      
      this.db = db;
      return this.db;
    } catch (error) {
      this.db = null;
      throw new StorageError(`Failed to open database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          // Reset DB connection on retry
          this.db = null;
        }
      }
    }
    
    throw lastError || new StorageError('Operation failed after retries');
  }

  async createNote(title: string, content: string): Promise<EncryptedNote> {
    return this.withRetry(async () => {
      const timestamp = getCurrentTimestamp();
      const note: EncryptedNote = {
        id: generateId(),
        title: title.trim(),
        encryptedContent: content,
        iv: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      const db = await this.getDB();
      await db.put(this.storeName, note);
      return note;
    });
  }

  async saveNote(note: EncryptedNote): Promise<void> {
    if (!note.id) {
      throw new StorageError('Note ID is required');
    }

    await this.withRetry(async () => {
      const db = await this.getDB();
      await db.put(this.storeName, {
        ...note,
        title: note.title.trim(),
      });
    });
  }

  async getNote(id: string): Promise<EncryptedNote | undefined> {
    if (!id) {
      throw new StorageError('Note ID is required');
    }

    return this.withRetry(async () => {
      const db = await this.getDB();
      const note = await db.get(this.storeName, id);
      return note || undefined;
    });
  }

  async getAllNotes(): Promise<EncryptedNote[]> {
    return this.withRetry(async () => {
      const db = await this.getDB();
      const notes: EncryptedNote[] = [];
      let cursor = await db.transaction(this.storeName)
        .objectStore(this.storeName)
        .index('by-updated')
        .openCursor(null, 'prev'); // Use 'prev' for descending order

      while (cursor) {
        notes.push(cursor.value);
        cursor = await cursor.continue();
      }
      return notes;
    });
  }

  async deleteNote(id: string): Promise<void> {
    if (!id) {
      throw new StorageError('Note ID is required');
    }

    await this.withRetry(async () => {
      const db = await this.getDB();
      await db.delete(this.storeName, id);
    });
  }

  async updateNote(id: string, updates: Partial<Omit<EncryptedNote, 'id' | 'createdAt'>>): Promise<EncryptedNote> {
    if (!id) {
      throw new StorageError('Note ID is required');
    }

    return this.withRetry(async () => {
      const db = await this.getDB();
      
      // Use a transaction to ensure atomicity
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      
      const existingNote = await store.get(id);
      if (!existingNote) {
        await tx.abort();
        throw new StorageError(`Note with id ${id} not found`);
      }

      if (updates.title !== undefined && !updates.title.trim()) {
        await tx.abort();
        throw new StorageError('Note title cannot be empty');
      }

      const updatedNote: EncryptedNote = {
        ...existingNote,
        ...updates,
        id,
        createdAt: existingNote.createdAt,
        updatedAt: getCurrentTimestamp(),
        title: updates.title?.trim() ?? existingNote.title,
      };

      await store.put(updatedNote);
      await tx.done;
      
      return updatedNote;
    });
  }

  async searchNotes(query: string): Promise<EncryptedNote[]> {
    if (!query) {
      return this.getAllNotes();
    }

    return this.withRetry(async () => {
      const db = await this.getDB();
      const lowercaseQuery = query.toLowerCase();
      const matchingNotes: EncryptedNote[] = [];
      
      let cursor = await db.transaction(this.storeName)
        .objectStore(this.storeName)
        .index('by-updated')
        .openCursor(null, 'prev');

      while (cursor) {
        if (cursor.value.title.toLowerCase().includes(lowercaseQuery)) {
          matchingNotes.push(cursor.value);
        }
        cursor = await cursor.continue();
      }
      
      return matchingNotes;
    });
  }
}

export const storageService = new StorageService(); 

// Planned save states
type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

// Planned hook interface
interface AutosaveState {
  status: SaveStatus;
  lastSaved: Date | null;
  isDirty: boolean;
}

// Planned debounce timing
const AUTOSAVE_DELAY = 2000; // 2 seconds after last change 