import { useEffect, useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import './App.css';

function App() {
  const [gif, setGif] = useState(null);
  const [error, setError] = useState(null);
  
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

  return (
    <div className="App">
      <header className="App-header">
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
      </header>
    </div>
  );
}

export default App;
