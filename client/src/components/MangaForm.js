import { useEffect, useState } from 'react';
import './MangaForm.css';

function MangaForm({ onSubmit, editingId, mangas }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('plan-to-read');
  const [chapters, setChapters] = useState('');
  const [currentChapter, setCurrentChapter] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingId && mangas) {
      const manga = mangas.find((m) => m._id === editingId);
      if (manga) {
        setTitle(manga.title);
        setAuthor(manga.author);
        setStatus(manga.status);
        setChapters(manga.chapters || '');
        setCurrentChapter(manga.currentChapter || '');
        setNotes(manga.notes || '');
      }
    }
  }, [editingId, mangas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        title,
        author,
        status,
        chapters: chapters ? parseInt(chapters, 10) : 0,
        currentChapter: currentChapter ? parseInt(currentChapter, 10) : 0,
        notes,
      });

      setTitle('');
      setAuthor('');
      setStatus('plan-to-read');
      setChapters('');
      setCurrentChapter('');
      setNotes('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manga-form-container">
      <form onSubmit={handleSubmit} className="manga-form">
        <h3>{editingId ? 'Edit Manga' : 'Add New Manga'}</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            >
              <option value="plan-to-read">Plan to Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="chapters">Total Chapters</label>
            <input
              type="number"
              id="chapters"
              min="0"
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currentChapter">Current Chapter</label>
            <input
              type="number"
              id="currentChapter"
              min="0"
              value={currentChapter}
              onChange={(e) => setCurrentChapter(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="Add personal notes or thoughts..."
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Manga
          </button>
        </div>
      </form>
    </div>
  );
}

export default MangaForm;
