export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedNote extends Omit<Note, 'content'> {
  encryptedContent: string;
  iv: string;
}

export interface NoteMetadata {
  id: string;
  title: string;
  updatedAt: number;
} 