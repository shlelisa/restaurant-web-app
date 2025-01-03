import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKey } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import './Auth.css';

const VerifyOTP = () => {
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

      // Verify OTP using database function
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_otp', {
          phone_number: registrationData.phone,
          otp_code: otp
        });

      if (verifyError || !isValid) {
        throw new Error('OTP sirrii miti');
      }

      // Register with Supabase Auth
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password
      });

      if (signUpError) throw signUpError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: user.id,
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          phone: registrationData.phone
        }]);

      if (profileError) throw profileError;

      // Clear session storage
      sessionStorage.removeItem('registration_data');

      // Navigate to success page
      navigate('/registration-success');

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

  const verifyOTP = async (inputOTP) => {
    // Check OTP from database
    const { data, error } = await supabase
      .from('temp_otps')
      .select('*')
      .eq('phone', registrationData.phone)
      .eq('otp', inputOTP)
      .eq('used', false)
      .single();

    if (error || !data) {
      throw new Error('OTP sirrii miti');
    }

    // Mark OTP as used
    await supabase
      .from('temp_otps')
      .update({ used: true })
      .eq('id', data.id);

    return true;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="verify-icon">
          <FaKey />
        </div>
        <h1>OTP Mirkaneessaa</h1>
        <p>
          Koodii mirkaneessaa lakkoofsa bilbilaa keessan irratti ergine galchaa
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

export default VerifyOTP; 