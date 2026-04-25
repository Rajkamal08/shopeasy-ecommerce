import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../Login/Login.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) { navigate('/'); return null; }

  const handleSendOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSent(true);
    console.log('OTP Code:', code);
    toast.success(`OTP sent! (Check console: ${code})`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (otpSent && otp !== generatedOtp) { toast.error('Invalid OTP'); return; }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page" id="register-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join ShopEasy for the best deals</p>
        </div>
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required id="register-name" />
            </div>
            <div className="auth-field">
              <label>Email Address</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required id="register-email" />
                <button type="button" className="btn btn-outline btn-sm" onClick={handleSendOtp} style={{ flexShrink: 0 }}>
                  {otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
            </div>
            {otpSent && (
              <div className="auth-field">
                <label>Enter OTP</label>
                <input type="text" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required id="register-otp" />
              </div>
            )}
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Create password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required id="register-password" />
            </div>
            <div className="auth-field">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="register-submit">
              {loading ? 'Creating Account...' : 'REGISTER'}
            </button>
          </form>
          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
