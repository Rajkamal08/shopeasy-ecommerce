import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) { navigate('/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page" id="login-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to access your account</p>
        </div>
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required id="login-email" />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required id="login-password" />
            </div>
            <label className="auth-remember"><input type="checkbox" /> Remember me</label>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="login-submit">
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          <div className="auth-social">
            <button type="button">🔵 Google</button>
            <button type="button">📘 Facebook</button>
          </div>

          <p className="auth-link">
            New here? <Link to="/register">Create an account</Link>
          </p>

          <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-hint)', textAlign: 'center' }}>
            Demo: user@test.com / User@123 | admin@test.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
