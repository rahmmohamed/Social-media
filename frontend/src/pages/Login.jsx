import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../api/axios';
import { loginSuccess } from '../store/authSlice';

/**
 * Login Component (Page)
 * Role: Handle user authentication and sign in
 * - Provides login form for existing users
 * - Validates email and password inputs
 * - Sends credentials to POST /auth/login
 * - Stores JWT token and user data in Redux and localStorage
 * - Redirects to home page on successful login
 * - Shows error message on login failure
 */
export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  /**
   * handleSubmit(e): Handle login form submission
   * - Prevents default form submission behavior
   * - Validates email and password fields are not empty
   * - Makes POST request to /auth/login with credentials
   * - Dispatches loginSuccess to save auth data to Redux
   * - Redirects to home page on success
   * - Displays error message on failure
   */
  async function handleSubmit(e) {
    e.preventDefault();  
    
    
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      dispatch(loginSuccess(res.data));  
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f0f0f'}}>
      <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'40px',width:'380px'}}>
        <h2 style={{textAlign:'center',marginBottom:'8px',color:'#6366f1',fontSize:'24px'}}>● Socially</h2>
        <p style={{textAlign:'center',color:'#666',marginBottom:'28px'}}>Sign in to your account</p>
        {error && <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:'8px',color:'#ef4444',padding:'10px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
            style={{width:'100%',background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'#f0f0f0',marginBottom:'12px'}} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
            style={{width:'100%',background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'#f0f0f0',marginBottom:'16px'}} required />
          <button type="submit" disabled={loading}
            style={{width:'100%',background:'#6366f1',color:'#fff',border:'none',borderRadius:'10px',padding:'12px',fontWeight:'600',cursor:'pointer'}}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'20px',color:'#666'}}>
          No account? <Link to="/register" style={{color:'#6366f1'}}>Register</Link>
        </p>
      </div>
    </div>
  );
}