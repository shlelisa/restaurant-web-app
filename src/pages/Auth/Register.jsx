import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { sendOTP } from '../../utils/mockApi';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // First Name validation - allow Afaan Oromoo names
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Maqaa duraa galchuu qabdu';
    } else if (!/^[A-Za-zÀ-ÿ\s]{2,}$/.test(formData.firstName)) {
      newErrors.firstName = 'Maqaan sirrii miti';
    }

    // Last Name validation - allow Afaan Oromoo names
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Maqaa abbaa galchuu qabdu';
    } else if (!/^[A-Za-zÀ-ÿ\s]{2,}$/.test(formData.lastName)) {
      newErrors.lastName = 'Maqaan sirrii miti';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email galchuu qabdu';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Email sirrii galchaa';
    }

    // Phone validation - Ethiopian format
    if (!formData.phone) {
      newErrors.phone = 'Bilbila lakkoofsa galchuu qabdu';
    } else if (!/^\+251[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Bilbila lakkoofsa sirrii galchaa (fakk: +251911234567)';
    }

    // Password validation - more secure
    if (!formData.password) {
      newErrors.password = 'Password galchuu qabdu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password dheerina 8 ol ta\'uu qaba';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password qubeewwan gurguddaa, xixiqqaa fi lakkoofsa qabaachuu qaba';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Password irra deebi\'ii galchi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password wal hin simu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);

      // Register with Supabase Auth first
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          },
          emailRedirectTo: undefined
        }
      });

      if (signUpError) throw signUpError;

      // Store OTP in temp_otps table
      const { error: otpError } = await supabase
        .from('temp_otps')
        .insert([{
          email: formData.email,
          otp: otp.toString(),
          created_at: new Date().toISOString()
        }]);

      if (otpError) throw otpError;

      // Send magic link with OTP
      const { error: emailError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false,
          data: {
            verificationCode: otp.toString()
          }
        }
      });

      if (emailError) throw emailError;

      // Store registration data temporarily
      sessionStorage.setItem('registration_data', JSON.stringify({
        ...formData,
        user_id: user.id
      }));

      // Navigate to email verification page
      navigate('/verify-email');

    } catch (err) {
      console.error('Registration error:', err);
      setErrors(prev => ({
        ...prev,
        submit: err.message || 'Galmaa\'uun hin milkoofne. Maaloo irra deebi\'ii yaali.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Galmaa'i</h1>
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <FaUser />
              Maqaa Duraa
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Maqaa duraa galchaa"
              disabled={loading}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaUser />
              Maqaa Abbaa
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Maqaa abbaa galchaa"
              disabled={loading}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaEnvelope />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaPhone />
              Lakkoofsa Bilbilaa
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+251911234567"
              disabled={loading}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaLock />
              Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password galchaa"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaLock />
              Irra deebi'ii Password galchi
            </label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Password irra deebi'ii galchi"
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Galmaa\'i'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Account qabdaa?</p>
          <Link to="/login" className="auth-link">
            Seeni
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 