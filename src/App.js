import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import { supabase } from './supabaseClient';
import SharedPage from './components/SharedPage';
import './App.css';

const gradients = [
  { style: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', name: 'Peachy' },
  { style: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: 'Minty' },
  { style: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', name: 'Spring' },
  { style: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', name: 'Ocean' },
  { style: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', name: 'Sunset' },
  { style: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)', name: 'Lavender' },
  { style: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', name: 'Cotton' },
  { style: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', name: 'Purple' },
  { style: 'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)', name: 'Forest' },
  { style: 'linear-gradient(135deg, #ffecd2 0%, #c7ecee 100%)', name: 'Beach' }
];

const moods = [
  { name: 'Trending', search: 'trending' },
  { name: 'Happy', search: 'happy excited' },
  { name: 'Sassy', search: 'sassy attitude' },
  { name: 'Chill', search: 'relaxed chill' },
  { name: 'Epic', search: 'epic amazing' },
  { name: 'Adorable', search: 'cute adorable' },
  { name: 'Facepalm', search: 'facepalm fail' },
  { name: 'Party', search: 'party celebration' },
  { name: 'Sleepy', search: 'sleepy tired' },
  { name: 'Hungry', search: 'hungry food' }
];

function MainApp() {
  const [gif, setGif] = useState(null);
  const [error, setError] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const [currentMood, setCurrentMood] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const savedMoodName = params.get('mood');
    const savedMood = moods.find(m => m.name === savedMoodName);
    const savedFromStorage = localStorage.getItem('currentMood');
    return savedMood || (savedFromStorage ? JSON.parse(savedFromStorage) : moods[0]);
  });

  const [currentGradient, setCurrentGradient] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const savedGradientName = params.get('gradient');
    const savedGradient = gradients.find(g => g.name === savedGradientName);
    const savedFromStorage = localStorage.getItem('currentGradient');
    return savedGradient || (savedFromStorage ? JSON.parse(savedFromStorage) : gradients[0]);
  });

  const [hasRolled, setHasRolled] = useState(false);

  const fetchGif = async (searchTerm) => {
    try {
      const gf = new GiphyFetch(process.env.REACT_APP_GIPHY_API_KEY);
      let data;
      if (searchTerm === 'trending') {
        const result = await gf.trending({ limit: 25 });
        data = result.data;
      } else {
        const result = await gf.search(searchTerm, { limit: 25 });
        data = result.data;
      }
      
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setGif(data[randomIndex]);
      } else {
        setError('No GIFs found');
      }
    } catch (error) {
      console.error('Error fetching GIF:', error);
      setError(`Error: ${error.message}`);
    }
  };

  // Initial GIF fetch on load
  useEffect(() => {
    // Disable the exhaustive-deps rule for this effect since we only want it to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchGif(currentMood.search);
  }, []); // Empty dependency array means this only runs once on mount

  const spinRoulette = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setHasRolled(true);
    
    // Simulate spinning with rapid changes
    const duration = 1000; // 1 second spin
    const interval = 50; // Change every 50ms
    const startTime = Date.now();
    
    const spin = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        setCurrentGradient(gradients[Math.floor(Math.random() * gradients.length)]);
        setCurrentMood(moods[Math.floor(Math.random() * moods.length)]);
        setTimeout(spin, interval);
      } else {
        // Final selection
        const newGradient = gradients[Math.floor(Math.random() * gradients.length)];
        const newMood = moods[Math.floor(Math.random() * moods.length)];
        
        setCurrentGradient(newGradient);
        setCurrentMood(newMood);
        localStorage.setItem('currentGradient', JSON.stringify(newGradient));
        localStorage.setItem('currentMood', JSON.stringify(newMood));
        setIsSpinning(false);
        
        // Only fetch new GIF after spin completes
        fetchGif(newMood.search);
      }
    };
    
    spin();
  };

  const handleSaveClick = () => {
    setShowShareDialog(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return;

    try {
      // Check for existing usernames and find next available number
      const { data: existingUsers } = await supabase
        .from('shared_moods')
        .select('username')
        .ilike('username', `${userName}%`);

      let uniqueUsername = userName;
      if (existingUsers && existingUsers.length > 0) {
        const numbers = existingUsers
          .map(u => {
            const match = u.username.match(new RegExp(`^${userName}(\\d*)$`));
            return match ? (match[1] ? parseInt(match[1]) : 1) : 0;
          })
          .filter(n => !isNaN(n));
        
        const maxNumber = Math.max(0, ...numbers);
        uniqueUsername = `${userName}${maxNumber + 1}`;
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('shared_moods')
        .insert([
          {
            username: uniqueUsername,
            mood: currentMood,
            gradient: currentGradient,
            gif_url: gif.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Create the share URL using the unique username
      const url = `${window.location.origin}/${uniqueUsername}`;
      setShareUrl(url);
      setUserName(uniqueUsername); // Update the displayed username
    } catch (err) {
      console.error('Error saving shared mood:', err);
      setError(`Failed to create share link: ${err.message}`);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const params = new URLSearchParams(window.location.search);
  const sharedName = params.get('name');
  const isSharedUrl = params.get('mood') && params.get('gradient');

  return (
    <div className="App">
      <header className="App-header" style={{ background: currentGradient.style }}>
        {hasRolled && (
          <div className="mood-title-container">
            <div className="mood-title mood-title-bottom">
              {currentGradient.name} {currentMood.name}
            </div>
          </div>
        )}

        {hasRolled && (
          <button className="share-icon" onClick={handleSaveClick} title="Share this mood">
            🔗
          </button>
        )}

        {showShareDialog && (
          <div className="share-dialog">
            <button className="dialog-close" onClick={() => setShowShareDialog(false)}>✕</button>
            {!shareUrl ? (
              <form onSubmit={handleShareSubmit}>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="name-input"
                />
                <button type="submit" className="new-tab-button">Create Link</button>
              </form>
            ) : (
              <>
                <div className="share-url-container">
                  <input type="text" readOnly value={shareUrl} className="share-url" />
                  <button onClick={handleCopyUrl} className="copy-icon" title="Copy link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 3H4v13h3v4h13V8h-4V3zM7 14V5h7v3h3v8H7z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="new-tab-button">
                  Take me there
                </a>
              </>
            )}
          </div>
        )}

        {error && (
          <div style={{ color: 'red', marginBottom: '20px', maxWidth: '80%', wordBreak: 'break-word' }}>
            Error loading GIF: {error}
          </div>
        )}
        {gif && (
          <div className="gif-container">
            <Gif gif={gif} width={300} />
          </div>
        )}
        <div className="message-container">
          <p className="hello-text">
            {isSharedUrl ? (
              <>
                Hello world,
                <br />
                I'm feeling {currentGradient.name} {currentMood.name} today.
              </>
            ) : (
              'Hello world!'
            )}
          </p>
          <p className="signature">—{sharedName || 'Bart'}</p>
        </div>
        <button 
          className={`roulette-button ${isSpinning ? 'spinning' : ''}`} 
          onClick={spinRoulette}
          disabled={isSpinning}
        >
          🎲
        </button>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/:username" element={<SharedPage />} />
      </Routes>
    </Router>
  );
}

export default App;
