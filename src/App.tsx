import { useState, useCallback } from 'react'
import { HashRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NoteList } from './components/NoteList'
import { NoteEditor } from './components/NoteEditor'
import { StorageSettings } from './components/StorageSettings'
import { EncryptedNote } from './types/note'
import { storageService } from './services/storageService'
import styles from './styles/App.module.css'
import { About } from './components/About'

function Notes() {
  const [selectedNote, setSelectedNote] = useState<EncryptedNote | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Force NoteList to refresh
  const refreshNotes = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // Handle note selection
  const handleNoteSelect = useCallback(async (note: EncryptedNote) => {
    // Get the latest version of the note
    try {
      const latestNote = await storageService.getNote(note.id);
      if (latestNote) {
        setSelectedNote(latestNote);
      }
    } catch (error) {
      console.error('Failed to load note:', error);
    }
  }, []);

  const handleNoteSave = useCallback(async (note: EncryptedNote) => {
    try {
      const savedNote = await storageService.updateNote(note.id, {
        title: note.title,
        encryptedContent: note.encryptedContent,
      })
      // Update the selected note with the saved version
      setSelectedNote(savedNote)
      refreshNotes() // Refresh the note list to show updated notes
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }, [refreshNotes])

  const handleNoteCancel = useCallback(() => {
    setSelectedNote(null)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <NoteList 
          onSelectNote={handleNoteSelect}
          selectedNoteId={selectedNote?.id}
          key={refreshTrigger} // Force re-render when notes are updated
        />
      </div>
      <div className={styles.main}>
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id} // Force new instance when note changes
            note={selectedNote}
            onSave={handleNoteSave}
            onCancel={handleNoteCancel}
          />
        ) : (
          <div className={styles.emptyState}>
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Layout>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Notes
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Storage Settings
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            About
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<Notes />} />
          <Route path="/settings" element={<StorageSettings />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
