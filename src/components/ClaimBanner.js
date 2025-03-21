import React, { useState } from 'react';
import './ClaimBanner.css';

// Test comment to verify pre-commit hook
const ClaimBanner = ({ onSubmit, userStatus }) => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(email);
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDismissed) return null;

  if (userStatus === 'unconfirmed') {
    return (
      <div className="claim-banner claim-banner-warning">
        <button 
          className="dismiss-button" 
          onClick={() => setIsDismissed(true)}
        >
          ×
        </button>
        <p>📧 Please check your email to confirm your account</p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="claim-banner">
        <button 
          className="dismiss-button" 
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
        >
          ×
        </button>
        <p onClick={() => setShowForm(true)}>✨ Claim your account</p>
      </div>
    );
  }

  return (
    <div className="claim-banner claim-banner-form">
      <button 
        className="dismiss-button" 
        onClick={() => setIsDismissed(true)}
      >
        ×
      </button>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Claiming...' : 'Claim Account'}
        </button>
        <button 
          type="button" 
          onClick={() => {
            setShowForm(false);
            setError(null);
          }}
          className="cancel-button"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ClaimBanner; 