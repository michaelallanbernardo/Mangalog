import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setError('Error: ' + err.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>MangaLog</h1>
        {message && <p style={{ color: 'green' }}>✓ Connected: {message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </header>
    </div>
  );
}

export default App;
