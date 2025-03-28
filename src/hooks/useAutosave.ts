import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { EncryptedNote } from '../types/note';
import { storageService } from '../services/storageService';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface AutosaveState {
  status: SaveStatus;
  lastSaved: Date | null;
  isDirty: boolean;
}

interface UseAutosaveOptions {
  note: EncryptedNote;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  delay?: number;
}

export function useAutosave({
  note,
  onSaveSuccess,
  onSaveError,
  delay = 2000,
}: UseAutosaveOptions) {
  const [state, setState] = useState<AutosaveState>({
    status: 'saved',
    lastSaved: null,
    isDirty: false,
  });

  // Keep track of the latest note value
  const noteRef = useRef(note);
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  // Create the save function
  const saveNote = useCallback(async () => {
    if (state.status === 'saving') return;

    setState(prev => ({ ...prev, status: 'saving' }));
    try {
      const updatedNote = await storageService.updateNote(noteRef.current.id, {
        title: noteRef.current.title,
        encryptedContent: noteRef.current.encryptedContent,
      });
      setState({
        status: 'saved',
        lastSaved: new Date(),
        isDirty: false,
      });
      onSaveSuccess?.();
      return updatedNote;
    } catch (error) {
      setState(prev => ({ ...prev, status: 'error' }));
      onSaveError?.(error as Error);
      throw error;
    }
  }, [state.status, onSaveSuccess, onSaveError]);

  // Create debounced version of save
  const debouncedSave = useCallback(
    debounce(saveNote, delay, { maxWait: delay * 2 }),
    [saveNote, delay]
  );

  // Set up autosave effect
  useEffect(() => {
    if (state.isDirty) {
      debouncedSave();
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [state.isDirty, debouncedSave]);

  // Function to mark content as dirty
  const setDirty = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'unsaved',
      isDirty: true,
    }));
  }, []);

  // Function to force save immediately
  const forceSave = useCallback(async () => {
    debouncedSave.cancel();
    return saveNote();
  }, [debouncedSave, saveNote]);

  return {
    saveState: state,
    setDirty,
    forceSave,
  };
} 