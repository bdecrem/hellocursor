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
        
        // Try a simple search instead of trending to test the API
        const { data } = await gf.search('happy', { limit: 1 });
        console.log('Search response:', data);
        
        if (data && data.length > 0) {
          setGif(data[0]);
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
          <div style={{ marginBottom: '20px' }}>
            <Gif gif={gif} width={300} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <p style={{ margin: 0, fontSize: '24px' }}>Hello world!</p>
          <p style={{ margin: 0, alignSelf: 'flex-end', marginTop: '8px' }}>--Bart</p>
        </div>
      </header>
    </div>
  );
}

export default App;
