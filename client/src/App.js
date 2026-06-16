import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import MangaList from './components/MangaList';
import Browse from './components/Browse';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [refreshList, setRefreshList] = useState(0);
  const [browseSearchInput, setBrowseSearchInput] = useState('');
  const [browseSearchQuery, setBrowseSearchQuery] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setView('manga');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData, newToken) => {
    setUser(userData);
    setToken(newToken);
    setView('manga');
  };

  const handleRegisterSuccess = () => {
    setView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setView('login');
  };

  const handleMangaAdded = () => {
    setRefreshList(prev => prev + 1);
    setView('manga');
  };

  const handleBrowseSearchSubmit = (e) => {
    e.preventDefault();
    setBrowseSearchQuery(browseSearchInput.trim());
    setView('browse');
  };

  const handleBrowseSearchClear = () => {
    setBrowseSearchInput('');
    setBrowseSearchQuery('');
    setView('browse');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      {user && (
        <nav className="navbar">
          <div className="navbar-container">
            <button className="navbar-title" onClick={() => setView('browse')}>
              MangaLog
            </button>
            <div className="navbar-nav">
              <button 
                className={`nav-link ${view === 'manga' ? 'active' : ''}`}
                onClick={() => setView('manga')}
              >
                My List
              </button>
            </div>
            <form className="navbar-search" onSubmit={handleBrowseSearchSubmit}>
              <input
                type="text"
                value={browseSearchInput}
                onChange={(e) => setBrowseSearchInput(e.target.value)}
                placeholder="Search manga..."
                className="navbar-search-input"
              />
              <button type="submit" className="navbar-search-button">
                Search
              </button>
              {browseSearchInput && (
                <button type="button" className="navbar-search-clear" onClick={handleBrowseSearchClear}>
                  Clear
                </button>
              )}
            </form>
            <div className="navbar-user">
              <span>Welcome, {user.username}!</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      <main>
        {view === 'login' && (
          <>
            <Login onLoginSuccess={handleLoginSuccess} />
            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <button 
                  className="link-button"
                  onClick={() => setView('register')}
                >
                  Register here
                </button>
              </p>
            </div>
          </>
        )}

        {view === 'register' && (
          <>
            <Register onRegisterSuccess={handleRegisterSuccess} />
            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <button 
                  className="link-button"
                  onClick={() => setView('login')}
                >
                  Login here
                </button>
              </p>
            </div>
          </>
        )}

        {view === 'manga' && token && (
          <MangaList token={token} key={refreshList} />
        )}

        {view === 'browse' && token && (
          <Browse token={token} searchQuery={browseSearchQuery} onMangaAdded={handleMangaAdded} />
        )}
      </main>
    </div>
  );
}

export default App;
