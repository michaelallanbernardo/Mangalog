import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import MangaList from './components/MangaList';
import Browse from './components/Browse';
import { API_URL, authAPI } from './api/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [refreshList, setRefreshList] = useState(0);
  const [browseSearchInput, setBrowseSearchInput] = useState('');
  const [browseSearchQuery, setBrowseSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!savedToken || !savedUser) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authAPI.getMe(savedToken);

        if (!isMounted) {
          return;
        }

        setToken(savedToken);
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
        setView('manga');
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (isMounted) {
          setToken(null);
          setUser(null);
          setView('login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/status`);
        if (!response.ok) {
          throw new Error('API health check failed');
        }

        if (isMounted) {
          setApiStatus('online');
        }
      } catch (err) {
        if (isMounted) {
          setApiStatus('offline');
        }
      }
    };

    checkApiStatus();

    return () => {
      isMounted = false;
    };
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
              <span
                className={`api-status api-status-${apiStatus}`}
                title="Backend API status"
              >
                <span className="api-status-dot" />
                {apiStatus === 'checking' ? 'Checking API' : apiStatus === 'online' ? 'API online' : 'API offline'}
              </span>
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
