import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Gif } from '@giphy/react-components';
import { supabase } from '../supabaseClient';
import '../App.css';
import ClaimBanner from './ClaimBanner';
import { getCookie } from '../utils/cookies';

// Import the moods array so we can get the search term
import { moods } from '../App';

function SharedPage() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedMood, setSharedMood] = useState(null);
  const [gif, setGif] = useState(null);
  const [showClaimBanner, setShowClaimBanner] = useState(false);

  useEffect(() => {
    const fetchSharedMood = async () => {
      try {
        const { data, error } = await supabase
          .from('shared_moods')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        if (data) {
          setSharedMood(data);
          // Check if this is the mood creator viewing their own mood
          const cookieName = `mood_creator_${username}`;
          const isMoodCreator = getCookie(cookieName);
          console.log('Checking cookie:', cookieName, 'Value:', isMoodCreator);
          console.log('All cookies:', document.cookie);
          setShowClaimBanner(!!isMoodCreator);
          
          // Find the mood object to get the search term
          const moodObj = moods.find(m => m.name === data.mood_name);
          if (moodObj) {
            fetchGif(moodObj.search);
          }
        }
      } catch (err) {
        console.error('Error fetching shared mood:', err);
        setError('Could not find the shared mood');
      } finally {
        setLoading(false);
      }
    };

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

  const handleClaimAccount = async (email) => {
    try {
      // We'll implement this later when we add authentication
      console.log('Claiming account for:', email);
      // For now, just hide the banner after submission
      setShowClaimBanner(false);
    } catch (error) {
      console.error('Error claiming account:', error);
    }
  };

  if (loading) return <div className="App-header">Loading...</div>;
  if (error) return <div className="App-header">Error: {error}</div>;
  if (!sharedMood) return <div className="App-header">Mood not found</div>;

  return (
    <div className="App">
      {showClaimBanner && (
        <ClaimBanner onSubmit={handleClaimAccount} />
      )}
      <header className="App-header" style={{ background: sharedMood.gradient_style }}>
        <div className="mood-title-container">
          <div className="mood-title mood-title-bottom">
            {sharedMood.gradient_name} {sharedMood.mood_name}
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
            I'm feeling {sharedMood.gradient_name} {sharedMood.mood_name} today.
          </p>
          <p className="signature">—{username}</p>
        </div>
      </header>
    </div>
  );
}

export default SharedPage; 