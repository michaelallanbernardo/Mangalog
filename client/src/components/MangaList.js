import { useEffect, useState } from 'react';
import { mangaAPI } from '../api/api';
import './MangaList.css';

function MangaList({ token }) {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchMangas();
  }, [token]);

  const fetchMangas = async () => {
    try {
      setLoading(true);
      const data = await mangaAPI.getAll(token);
      setMangas(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (manga) => {
    setEditingId(manga._id);
    setEditData({
      status: manga.status,
      currentChapter: manga.currentChapter,
      rating: manga.rating || '',
      notes: manga.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      await mangaAPI.update(editingId, editData, token);
      setEditingId(null);
      setEditData(null);
      fetchMangas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this manga from your list?')) {
      try {
        await mangaAPI.delete(id, token);
        fetchMangas();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredMangas = filterStatus === 'all' 
    ? mangas 
    : mangas.filter(m => m.status === filterStatus);

  const statusColors = {
    'reading': '#3498db',
    'completed': '#2ecc71',
    'on-hold': '#f39c12',
    'dropped': '#e74c3c',
    'plan-to-read': '#95a5a6'
  };

  if (loading) return <div className="loading">Loading your manga...</div>;

  return (
    <div className="manga-container">
      <div className="manga-header">
        <h1>My Manga List</h1>
        <span className="manga-count">{mangas.length} manga</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <label htmlFor="status-filter">Filter by status:</label>
        <select 
          id="status-filter"
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="dropped">Dropped</option>
          <option value="plan-to-read">Plan to Read</option>
        </select>
      </div>

      {filteredMangas.length === 0 ? (
        <div className="empty-state">No manga found. Browse and add from the Browse tab!</div>
      ) : (
        <div className="manga-grid">
          {filteredMangas.map((manga) => (
            <div key={manga._id} className="manga-card">
              <div className="manga-header-card">
                <h3>{manga.title}</h3>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: statusColors[manga.status] }}
                >
                  {manga.status}
                </span>
              </div>
              <p className="manga-author">by {manga.author}</p>
              
              <div className="manga-details">
                <div className="detail-item">
                  <span className="label">Progress:</span>
                  <span>
                    {manga.chapters > 0 
                      ? `${manga.currentChapter}/${manga.chapters}` 
                      : `Ch. ${manga.currentChapter}`
                    }
                  </span>
                </div>
                {manga.rating && (
                  <div className="detail-item">
                    <span className="label">Rating:</span>
                    <span>{'⭐'.repeat(manga.rating)}</span>
                  </div>
                )}
              </div>

              {manga.notes && (
                <p className="manga-notes">{manga.notes}</p>
              )}

              <div className="manga-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleEdit(manga)}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleDelete(manga._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId && editData && (
        <EditModal
          manga={mangas.find(m => m._id === editingId)}
          editData={editData}
          onEditChange={setEditData}
          onSave={handleSaveEdit}
          onClose={() => {
            setEditingId(null);
            setEditData(null);
          }}
        />
      )}
    </div>
  );
}

function EditModal({ manga, editData, onEditChange, onSave, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Edit "{manga.title}"</h2>

        <div className="edit-form">
          <div className="form-group">
            <label htmlFor="edit-status">Reading Status</label>
            <select
              id="edit-status"
              value={editData.status}
              onChange={(e) => onEditChange({ ...editData, status: e.target.value })}
            >
              <option value="plan-to-read">Plan to Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-chapter">Current Chapter</label>
            <input
              type="number"
              id="edit-chapter"
              min="0"
              value={editData.currentChapter}
              onChange={(e) => onEditChange({ ...editData, currentChapter: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-rating">Rating (1-5)</label>
            <select
              id="edit-rating"
              value={editData.rating}
              onChange={(e) => onEditChange({ ...editData, rating: e.target.value ? parseInt(e.target.value) : null })}
            >
              <option value="">No rating</option>
              <option value="1">1 ⭐</option>
              <option value="2">2 ⭐</option>
              <option value="3">3 ⭐</option>
              <option value="4">4 ⭐</option>
              <option value="5">5 ⭐</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-notes">Notes</label>
            <textarea
              id="edit-notes"
              value={editData.notes}
              onChange={(e) => onEditChange({ ...editData, notes: e.target.value })}
              placeholder="Add notes..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="button" onClick={onSave} className="btn-add">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MangaList;
