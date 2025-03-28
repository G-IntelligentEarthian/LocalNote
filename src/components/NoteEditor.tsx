import React, { useState, useEffect, useCallback } from 'react';
import { EncryptedNote } from '../types/note';
import { useAutosave } from '../hooks/useAutosave';
import { SaveIndicator } from './SaveIndicator';
import styles from '../styles/NoteEditor.module.css';

interface NoteEditorProps {
  note: EncryptedNote;
  onSave: (note: EncryptedNote) => void;
  onCancel: () => void;
}

export function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.encryptedContent);
  const [localNote, setLocalNote] = useState<EncryptedNote>({ ...note });

  // Update state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.encryptedContent);
    setLocalNote({ ...note });
  }, [note.id]); // Only update when note ID changes

  // Update local note when title or content changes
  useEffect(() => {
    setLocalNote(prev => ({
      ...prev,
      title,
      encryptedContent: content,
    }));
  }, [title, content]);

  // Initialize autosave
  const { saveState, setDirty, forceSave } = useAutosave({
    note: localNote,
    onSaveSuccess: () => {
      onSave(localNote);
    },
  });

  // Save changes before unmounting or switching notes
  useEffect(() => {
    return () => {
      if (saveState.isDirty) {
        forceSave();
      }
    };
  }, [forceSave, saveState.isDirty]);

  // Handle content changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setDirty();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setDirty();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      forceSave();
    }
  }, [forceSave]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className={styles.titleInput}
        />
        <SaveIndicator 
          status={saveState.status}
          lastSaved={saveState.lastSaved}
        />
      </div>
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing your note..."
        className={styles.contentInput}
      />
      <div className={styles.actions}>
        <button 
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 