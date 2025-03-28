import React, { useState, useEffect } from 'react';
import { EncryptedNote } from '../types/note';
import { storageService } from '../services/storageService';
import { formatDate } from '../utils/helpers';
import styles from '../styles/NoteList.module.css';

interface NoteListProps {
  onSelectNote: (note: EncryptedNote) => void;
  selectedNoteId?: string;
}

export function NoteList({ onSelectNote, selectedNoteId }: NoteListProps) {
  const [notes, setNotes] = useState<EncryptedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await storageService.getAllNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      setError('Failed to load notes');
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNote() {
    try {
      const newNote = await storageService.createNote('Untitled', '');
      setNotes(prev => [newNote, ...prev]);
      onSelectNote(newNote);
    } catch (error) {
      setError('Failed to create note');
      console.error('Failed to create note:', error);
    }
  }

  async function handleDeleteNote(e: React.MouseEvent, noteId: string) {
    e.stopPropagation(); // Prevent note selection when deleting
    try {
      await storageService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      setError('Failed to delete note');
      console.error('Failed to delete note:', error);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading notes...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Notes</h2>
        <button 
          onClick={handleCreateNote}
          className={styles.newButton}
        >
          New Note
        </button>
      </div>
      <div className={styles.list}>
        {notes.length === 0 ? (
          <div className={styles.empty}>No notes yet. Create one!</div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={`${styles.noteItem} ${note.id === selectedNoteId ? styles.selected : ''}`}
              onClick={() => onSelectNote(note)}
            >
              <div className={styles.noteInfo}>
                <div className={styles.noteTitle}>{note.title || 'Untitled'}</div>
                <div className={styles.noteDate}>
                  {formatDate(note.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteNote(e, note.id)}
                className={styles.deleteButton}
                title="Delete note"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 