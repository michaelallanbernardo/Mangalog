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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      {user && (
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-title">MangaLog</h1>
            <div className="navbar-nav">
              <button 
                className={`nav-link ${view === 'manga' ? 'active' : ''}`}
                onClick={() => setView('manga')}
              >
                My List
              </button>
              <button 
                className={`nav-link ${view === 'browse' ? 'active' : ''}`}
                onClick={() => setView('browse')}
              >
                Browse
              </button>
            </div>
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
          <Browse token={token} onMangaAdded={handleMangaAdded} />
        )}
      </main>
    </div>
  );
}

export default App;
