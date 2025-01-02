import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import './Auth.css';

const VerifyEmail = () => {
  return (
    <div className="auth-page">
      <div className="auth-container verify-email">
        <div className="verify-icon">
          <FaEnvelope />
        </div>
        <h1>Email Mirkaneessi</h1>
        <p>
          Email mirkaneessuu keef link email kee irratti ergineerra.
          Maaloo email kee ilaali.
        </p>
        
        <div className="verify-actions">
          <button className="auth-button">
            Email Irra Deebi'ii Ergi
          </button>
          <Link to="/login" className="auth-link">
            ← Gara Login deebi'i
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 