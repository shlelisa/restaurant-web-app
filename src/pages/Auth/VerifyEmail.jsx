import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import './Auth.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const registrationData = JSON.parse(sessionStorage.getItem('registration_data'));

      // Verify OTP
      const { data: isValid, error: verifyError } = await supabase
        .from('temp_otps')
        .select('*')
        .eq('email', registrationData.email)
        .eq('otp', otp)
        .single();

      if (verifyError || !isValid) {
        throw new Error('Koodiin OTP sirrii miti');
      }

      // Create profile after verification
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: registrationData.user_id,
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          email: registrationData.email,
          phone: registrationData.phone
        }]);

      if (profileError) throw profileError;

      // Clear temporary data
      sessionStorage.removeItem('registration_data');

      // Navigate to login
      navigate('/login', {
        state: {
          message: 'Email verification milkaa\'eera. Maaloo seenaa.'
        }
      });

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-container verify-email">
        <div className="verify-icon">
          <FaEnvelope />
        </div>
        <h1>Email Mirkaneessaa</h1>
        <p>
          Koodii mirkaneessaa email keessan irratti ergine galchaa
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Koodii OTP galchaa"
              maxLength={6}
              required
            />
          </div>

          <div className="timer">
            Hanga: {formatTime(timeLeft)}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || timeLeft === 0}
          >
            {loading ? 'Processing...' : 'Mirkaneessi'}
          </button>
        </form>

        {timeLeft === 0 && (
          <button 
            onClick={() => navigate('/register')} 
            className="auth-button secondary"
          >
            Irra deebi'ii yaali
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 