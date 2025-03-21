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
  const [userStatus, setUserStatus] = useState(null); // 'confirmed', 'unconfirmed', or null

  useEffect(() => {
    const fetchSharedMood = async () => {
      try {
        // First check if this username already has a user account
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
          throw userError;
        }

        // Log user data for debugging
        console.log('User data:', userData);

        // Set user status if found
        if (userData) {
          setUserStatus(userData.is_confirmed ? 'confirmed' : 'unconfirmed');
          console.log('User status:', userData.is_confirmed ? 'confirmed' : 'unconfirmed');
        } else {
          console.log('No user record found for username:', username);
        }

        // Then fetch the shared mood
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
          // Only show claim banner if user is creator and not already confirmed
          setShowClaimBanner(!!isMoodCreator && userStatus !== 'confirmed');
          
          // Find the mood object to get the search term
          const moodObj = moods.find(m => m.name === data.mood_name);
          if (moodObj) {
            fetchGif(moodObj.search);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Could not load the page');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedMood();
  }, [username, userStatus]);

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
      console.log('Attempting to claim account for:', { username, email });

      // Check if email is already in use by a confirmed user
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_confirmed', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        throw checkError;
      }

      if (existingUser) {
        console.log('Email already registered:', email);
        throw new Error('This email is already registered');
      }

      // Generate a secure random token
      const confirmationToken = crypto.randomUUID();
      console.log('Generated confirmation token');

      // Create or update user record
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          username,
          email,
          is_confirmed: false,
          confirmation_token: confirmationToken,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'username',
          returning: 'minimal'
        });

      if (upsertError) {
        console.error('Error upserting user:', upsertError);
        throw upsertError;
      }

      console.log('User record created/updated');

      // Send verification email using Supabase Auth
      const { error: emailError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            username,
            confirmation_token: confirmationToken
          },
          emailRedirectTo: `${window.location.origin}/verify`
        }
      });

      if (emailError) {
        console.error('Error sending verification email:', emailError);
        throw emailError;
      }

      console.log('Verification email sent');

      // Update UI state
      setUserStatus('unconfirmed');
      setShowClaimBanner(false);
      
    } catch (error) {
      console.error('Error claiming account:', error);
      throw error;
    }
  };

  if (loading) return <div className="App-header">Loading...</div>;
  if (error) return <div className="App-header">Error: {error}</div>;
  if (!sharedMood) return <div className="App-header">Mood not found</div>;

  return (
    <div className="App">
      {showClaimBanner && (
        <ClaimBanner 
          onSubmit={handleClaimAccount}
          userStatus={userStatus}
        />
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