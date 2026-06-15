import { useEffect, useState } from 'react';
import { mangaAPI } from '../api/api';
import './MangaList.css';

function MangaList({ token }) {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    status: [],
    minRating: 0,
    maxRating: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
    search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  // Fetch mangas whenever filters change
  useEffect(() => {
    fetchMangas();
  }, [token, filters]);

  const fetchMangas = async () => {
    try {
      setLoading(true);
      const response = await mangaAPI.getFiltered(filters, token);
      setMangas(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (status) => {
    setFilters(prev => {
      const newStatuses = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];
      return { ...prev, status: newStatuses, page: 1 };
    });
  };

  const handleRatingChange = (e) => {
    const [min, max] = e.target.value.split('-');
    setFilters(prev => ({
      ...prev,
      minRating: min === 'all' ? 0 : parseInt(min),
      maxRating: max === 'all' ? 5 : parseInt(max),
      page: 1,
    }));
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1,
    }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: [],
      minRating: 0,
      maxRating: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
      search: '',
    });
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

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const statusColors = {
    'reading': '#3498db',
    'completed': '#2ecc71',
    'on-hold': '#f39c12',
    'dropped': '#e74c3c',
    'plan-to-read': '#95a5a6'
  };

  if (loading && mangas.length === 0) return <div className="loading">Loading your manga...</div>;

  return (
    <div className="manga-container">
      <div className="manga-header">
        <h1>My Manga List</h1>
        <span className="manga-count">{pagination.total} manga</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filter Section */}
      <div className="filter-panel">
        <div className="filter-header">
          <h3>Filters & Search</h3>
          {(filters.status.length > 0 || filters.search || filters.minRating > 0 || filters.maxRating < 5 || filters.sortBy !== 'createdAt') && (
            <button onClick={handleResetFilters} className="btn-reset-filters">
              Reset Filters
            </button>
          )}
        </div>

        {/* Search */}
        <div className="filter-group">
          <label htmlFor="search-input">Search by Title or Author</label>
          <input
            id="search-input"
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={handleSearchChange}
            className="search-input-filter"
          />
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label>Status</label>
          <div className="checkbox-group">
            {['reading', 'completed', 'on-hold', 'dropped', 'plan-to-read'].map(status => (
              <label key={status} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                />
                <span>{status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="filter-group">
          <label htmlFor="rating-filter">Rating Range</label>
          <select 
            id="rating-filter"
            value={`${filters.minRating}-${filters.maxRating}`}
            onChange={handleRatingChange}
            className="select-filter"
          >
            <option value="0-5">All Ratings</option>
            <option value="4-5">4+ Stars</option>
            <option value="3-5">3+ Stars</option>
            <option value="2-5">2+ Stars</option>
            <option value="1-5">1+ Stars</option>
            <option value="5-5">5 Stars Only</option>
            <option value="0-0">Not Rated</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By</label>
          <select 
            id="sort-filter"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={handleSortChange}
            className="select-filter"
          >
            <option value="createdAt-desc">Date Added (Newest)</option>
            <option value="createdAt-asc">Date Added (Oldest)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="rating-desc">Rating (Highest)</option>
            <option value="rating-asc">Rating (Lowest)</option>
            <option value="currentChapter-desc">Progress (Most Read)</option>
            <option value="currentChapter-asc">Progress (Least Read)</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {mangas.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0}-{Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} manga
      </div>

      {mangas.length === 0 ? (
        <div className="empty-state">
          {pagination.total === 0 ? (
            <>
              <p>No manga found. Browse and add from the Browse tab!</p>
              {(filters.status.length > 0 || filters.search || filters.minRating > 0 || filters.maxRating < 5) && (
                <button onClick={handleResetFilters} className="btn-secondary">
                  Clear Filters
                </button>
              )}
            </>
          ) : (
            <p>No manga matches your filters.</p>
          )}
        </div>
      ) : (
        <>
          <div className="manga-grid">
            {mangas.map((manga) => (
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-pagination"
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`page-number ${pagination.page === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-pagination"
              >
                Next →
              </button>
            </div>
          )}
        </>
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
