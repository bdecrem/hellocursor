import { useEffect, useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import './App.css';

const gradients = [
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Current peachy gradient
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Fresh mint to pink
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', // Spring grass
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // Ocean breeze
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // Sunset glow
  'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)', // Lavender mist
  'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', // Soft peach to pink
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // Purple lake
  'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)', // Gentle green
  'linear-gradient(135deg, #ffecd2 0%, #c7ecee 100%)'  // Sandy beach
];

function App() {
  const [gif, setGif] = useState(null);
  const [error, setError] = useState(null);
  const [currentGradient, setCurrentGradient] = useState(0);
  
  useEffect(() => {
    const fetchTrendingGif = async () => {
      try {
        // Log the API key to make sure it's loaded (we'll remove this in production)
        console.log('Environment variables:', {
          apiKey: process.env.REACT_APP_GIPHY_API_KEY,
          nodeEnv: process.env.NODE_ENV
        });

        const gf = new GiphyFetch(process.env.REACT_APP_GIPHY_API_KEY);
        // Get 25 trending GIFs and pick one randomly
        const { data } = await gf.trending({ limit: 25 });
        if (data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setGif(data[randomIndex]);
        } else {
          setError('No GIFs found');
        }
      } catch (error) {
        console.error('Detailed error:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        setError(`Error: ${error.message}`);
      }
    };
    
    fetchTrendingGif();
  }, []);

  const handleColorClick = () => {
    setCurrentGradient((prev) => (prev + 1) % gradients.length);
  };

  return (
    <div className="App">
      <header className="App-header" style={{ background: gradients[currentGradient] }}>
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
          <p className="hello-text">Hello world!</p>
          <p className="signature">—Bart</p>
        </div>
        <button className="color-button" onClick={handleColorClick}>
          Colors!
        </button>
      </header>
    </div>
  );
}

export default App;
