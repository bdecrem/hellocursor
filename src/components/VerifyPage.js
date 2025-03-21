import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get parameters from URL
        const username = searchParams.get('username');
        if (!username) {
          throw new Error('No username found in URL');
        }

        console.log('Verifying for username:', username);

        // Get the user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        if (!session) {
          throw new Error('No session found. Please try the verification link again.');
        }

        console.log('Session found:', session);

        // Update the user record to confirm them
        console.log('Updating user record...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            is_confirmed: true,
            updated_at: new Date().toISOString()
          })
          .eq('username', username)
          .eq('email', session.user.email);

        if (updateError) {
          console.error('Error updating user record:', updateError);
          throw updateError;
        }

        console.log('User record updated successfully');
        setStatus('success');
        
        // Redirect to the user's mood page after 3 seconds
        console.log('Redirecting to mood page in 3 seconds...');
        setTimeout(() => {
          navigate(`/${username}`);
        }, 3000);

      } catch (error) {
        console.error('Verification error:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="App">
      <header className="App-header">
        {status === 'verifying' && (
          <div>
            <h2>Verifying your email... ✨</h2>
            <p>Please wait while we confirm your account.</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <h2>Success! ✨</h2>
            <p>Your account has been confirmed.</p>
            <p>Redirecting you back to your mood page in 3 seconds...</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h2>Verification Failed</h2>
            <p>Sorry, we couldn't verify your email: {error}</p>
            <p>Please try claiming your account again.</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default VerifyPage; 