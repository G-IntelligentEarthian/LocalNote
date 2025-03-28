import { storageService } from '../storageService';
import { EncryptedNote } from '../../types/note';

describe('StorageService', () => {
  const testNote: EncryptedNote = {
    id: 'test-id',
    title: 'Test Note',
    encryptedContent: 'Test content',
    iv: 'test-iv',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    // Clear all notes before each test
    const notes = await storageService.getAllNotes();
    for (const note of notes) {
      await storageService.deleteNote(note.id);
    }
  });

  it('should create and retrieve a note', async () => {
    await storageService.saveNote(testNote);
    const retrievedNote = await storageService.getNote(testNote.id);
    
    expect(retrievedNote).toBeDefined();
    expect(retrievedNote?.id).toBe(testNote.id);
    expect(retrievedNote?.title).toBe(testNote.title);
    expect(retrievedNote?.encryptedContent).toBe(testNote.encryptedContent);
  });

  it('should update a note', async () => {
    await storageService.saveNote(testNote);
    
    const updatedNote = await storageService.updateNote(testNote.id, {
      title: 'Updated Title',
      encryptedContent: 'Updated content',
    });

    expect(updatedNote.title).toBe('Updated Title');
    expect(updatedNote.encryptedContent).toBe('Updated content');
    expect(updatedNote.updatedAt).toBeGreaterThan(testNote.updatedAt);
  });

  it('should delete a note', async () => {
    await storageService.saveNote(testNote);
    await storageService.deleteNote(testNote.id);
    
    const retrievedNote = await storageService.getNote(testNote.id);
    expect(retrievedNote).toBeUndefined();
  });

  it('should get all notes', async () => {
    const note2: EncryptedNote = {
      ...testNote,
      id: 'test-id-2',
      title: 'Test Note 2',
    };

    await storageService.saveNote(testNote);
    await storageService.saveNote(note2);

    const notes = await storageService.getAllNotes();
    expect(notes).toHaveLength(2);
    expect(notes.map(n => n.id)).toContain(testNote.id);
    expect(notes.map(n => n.id)).toContain(note2.id);
  });

  it('should throw error when updating non-existent note', async () => {
    await expect(
      storageService.updateNote('non-existent-id', {
        title: 'New Title',
      })
    ).rejects.toThrow('Note with id non-existent-id not found');
  });
}); 