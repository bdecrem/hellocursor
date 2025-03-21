import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import { supabase } from '../supabaseClient';
import '../App.css';

function SharedPage() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedMood, setSharedMood] = useState(null);
  const [gif, setGif] = useState(null);

  useEffect(() => {
    async function fetchSharedMood() {
      try {
        const { data, error } = await supabase
          .from('shared_moods')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Mood not found');

        setSharedMood(data);
        fetchGif(data.mood.search);
      } catch (error) {
        console.error('Error fetching shared mood:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSharedMood();
  }, [username]);

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
      }
    } catch (error) {
      console.error('Error fetching GIF:', error);
      setError(error.message);
    }
  };

  if (loading) return <div className="App-header">Loading...</div>;
  if (error) return <div className="App-header">Error: {error}</div>;
  if (!sharedMood) return <div className="App-header">Mood not found</div>;

  return (
    <div className="App">
      <header className="App-header" style={{ background: sharedMood.gradient.style }}>
        <div className="mood-title-container">
          <div className="mood-title mood-title-bottom">
            {sharedMood.gradient.name} {sharedMood.mood.name}
          </div>
        </div>

        {gif && (
          <div className="gif-container">
            <Gif gif={gif} width={300} />
          </div>
        )}

        <div className="message-container">
          <p className="hello-text">
            Hello world,
            <br />
            I'm feeling {sharedMood.gradient.name} {sharedMood.mood.name} today.
          </p>
          <p className="signature">—{username}</p>
        </div>
      </header>
    </div>
  );
}

export default SharedPage; 