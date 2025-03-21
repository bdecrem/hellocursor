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
        // Get the token from the URL
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No verification token found');
        }

        // Verify the token with Supabase Auth
        const { error: authError, data } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });

        if (authError) throw authError;

        // Get the user data that was passed in the email
        const { user, session } = data;
        const { username, confirmation_token } = user.user_metadata;

        if (!username || !confirmation_token) {
          throw new Error('Invalid verification data');
        }

        // Update the user record in our database
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            is_confirmed: true,
            confirmation_token: null,
            updated_at: new Date().toISOString()
          })
          .eq('username', username)
          .eq('confirmation_token', confirmation_token);

        if (updateError) throw updateError;

        setStatus('success');
        // Redirect to the user's mood page after 3 seconds
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
            <h2>Verifying your email...</h2>
            <p>Please wait while we confirm your account.</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <h2>Email Verified! ✨</h2>
            <p>Your account has been confirmed.</p>
            <p>Redirecting you back to your mood page...</p>
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