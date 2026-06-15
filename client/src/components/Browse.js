import { useState, useEffect } from 'react';
import { mangaAPI } from '../api/api';
import './Browse.css';

function Browse({ token, onMangaAdded }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [selectedManga, setSelectedManga] = useState(null);
  const [userMangaIds, setUserMangaIds] = useState(new Set());

  useEffect(() => {
    fetchUserMangaIds();
    fetchTrending();
  }, []);

  const fetchUserMangaIds = async () => {
    try {
      const mangas = await mangaAPI.getAll(token);
      const ids = new Set(mangas.map((m) => m.anilistId).filter(Boolean));
      setUserMangaIds(ids);
    } catch (err) {
      console.error('Failed to fetch user manga:', err);
    }
  };

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5000/api/browse/trending');
      const data = await response.json();
      setResults(data.data);
      setPagination(data.pagination);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load trending manga');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchTrending();
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `http://localhost:5000/api/browse/search?query=${encodeURIComponent(
          searchQuery
        )}&page=1`
      );
      const data = await response.json();
      setResults(data.data);
      setPagination(data.pagination);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to search manga');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    try {
      setLoading(true);
      setError('');
      const query = searchQuery.trim() ? searchQuery : '';
      const response = await fetch(
        `http://localhost:5000/api/browse/search?query=${encodeURIComponent(
          query
        )}&page=${newPage}`
      );
      const data = await response.json();
      setResults(data.data);
      setPagination(data.pagination);
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (manga) => {
    setSelectedManga(manga);
  };

  const submitMangaToList = async (formData) => {
    try {
      setAddingId(selectedManga.jikanId);
      await mangaAPI.create(
        {
          title: selectedManga.title,
          author: selectedManga.author,
          chapters: selectedManga.chapters,
          anilistId: selectedManga.jikanId,
          ...formData,
        },
        token
      );
      setUserMangaIds((prev) => new Set([...prev, selectedManga.jikanId]));
      setSelectedManga(null);
      onMangaAdded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1>Browse Manga</h1>
        <p>Discover and add manga to your collection</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by title, author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-search">
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              fetchTrending();
            }}
            className="btn-clear"
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading manga...</div>
      ) : (
        <>
          <div className="manga-grid-browse">
            {results.length === 0 ? (
              <div className="empty-state">No manga found</div>
            ) : (
              results.map((manga) => (
                <div key={manga.jikanId} className="manga-card-browse">
                  {manga.image && (
                    <img src={manga.image} alt={manga.title} className="manga-image" />
                  )}
                  <div className="manga-card-content">
                    <h3>{manga.title}</h3>
                    <p className="manga-author">by {manga.author}</p>
                    {manga.score && (
                      <p className="manga-score">⭐ {manga.score.toFixed(1)}</p>
                    )}
                    {manga.genres && manga.genres.length > 0 && (
                      <div className="manga-genres">
                        {manga.genres.slice(0, 2).map((genre) => (
                          <span key={genre} className="genre-tag">
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="manga-synopsis">{manga.synopsis.substring(0, 100)}...</p>
                  </div>
                  <button
                    className="btn-add-to-list"
                    onClick={() => handleAddToList(manga)}
                    disabled={addingId === manga.jikanId || userMangaIds.has(manga.jikanId)}
                  >
                    {addingId === manga.jikanId ? 'Adding...' : userMangaIds.has(manga.jikanId) ? '✓ Already Added' : '+ Add to List'}
                  </button>
                </div>
              ))
            )}
          </div>

          {pagination && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-pagination"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {pagination.last_page || '?'}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.has_next_page}
                className="btn-pagination"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {selectedManga && (
        <QuickAddModal
          manga={selectedManga}
          onAdd={submitMangaToList}
          onClose={() => setSelectedManga(null)}
        />
      )}
    </div>
  );
}

function QuickAddModal({ manga, onAdd, onClose }) {
  const [status, setStatus] = useState('plan-to-read');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      status,
      chapters: manga.chapters || 0,
      currentChapter: 0,
      rating: rating ? parseInt(rating) : null,
      notes,
    });
  };

  const displayChapters = manga.chapters && manga.chapters > 0 
    ? `${manga.chapters} chapters` 
    : 'Ongoing';
      
  const displayStatus = manga.status ? manga.status.charAt(0).toUpperCase() + manga.status.slice(1) : 'Unknown';
  
  const getStatusColor = (mangaStatus) => {
    switch(mangaStatus?.toLowerCase()) {
      case 'finished':
        return '#2ecc71';
      case 'publishing':
      case 'ongoing':
        return '#3498db';
      case 'on hiatus':
        return '#f39c12';
      case 'discontinued':
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Add "{manga.title}" to Your List</h2>
        
        <div className="manga-info-display">
          <div className="info-item">
            <span className="info-label">Author:</span>
            <span className="info-value">{manga.author}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Chapters:</span>
            <span className="info-value">{displayChapters}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Publication Status:</span>
            <span 
              className="info-value info-status" 
              style={{ backgroundColor: getStatusColor(manga.status), color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', display: 'inline-block' }}
            >
              {displayStatus}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="quick-add-form">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="plan-to-read">Plan to Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating (1-5)</label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
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
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              rows="2"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-add">
              Add to List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Browse;
