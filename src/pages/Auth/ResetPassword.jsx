import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setMessage('Email ergameera. Maaloo email kee ilaali.');
      setError('');
    } catch (err) {
      setError('Password reset failed. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Password Reset</h1>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <FaEnvelope />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
          </div>

          <button type="submit" className="auth-button">
            Reset Password
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            ← Gara Login deebi'i
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 