import React, { useState } from 'react';
import './ClaimBanner.css';

const ClaimBanner = ({ onSubmit }) => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(email);
      setShowForm(false);
    } catch (error) {
      console.error('Error claiming account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <div className="claim-banner" onClick={() => setShowForm(true)}>
        <p>✨ Claim your account</p>
      </div>
    );
  }

  return (
    <div className="claim-banner claim-banner-form">
      <form onSubmit={handleSubmit}>
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
          onClick={() => setShowForm(false)}
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