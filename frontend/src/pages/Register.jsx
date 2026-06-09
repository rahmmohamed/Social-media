import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../api/axios';
import { loginSuccess } from '../store/authSlice';

/**
 * Register Component (Page)
 * Role: Handle user registration and account creation
 * - Provides signup form for new users
 * - Validates username, email, and password inputs
 * - Sends registration data to POST /auth/register
 * - Stores JWT token and user data in Redux and localStorage on success
 * - Redirects to home page after successful registration
 * - Shows error message on registration failure (duplicate email/username)
 */
export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * handleSubmit(e): Handle registration form submission
   * - Prevents default form submission behavior
   * - Validates all three fields (username, email, password) are provided
   * - Makes POST request to /auth/register with new user data
   * - Trims whitespace from inputs for clean data
   * - Dispatches loginSuccess to automatically log in user after registration
   * - Redirects to home page on success
   * - Displays error message on failure (e.g., duplicate email)
   */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { 
        username: username.trim(), 
        email: email.trim(), 
        password 
      });
      dispatch(loginSuccess(res.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f0f0f'}}>
      <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'40px',width:'380px'}}>
        <h2 style={{textAlign:'center',marginBottom:'8px',color:'#6366f1',fontSize:'24px'}}>● Socially</h2>
        <p style={{textAlign:'center',color:'#666',marginBottom:'28px'}}>Create an account</p>
        {error && <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:'8px',color:'#ef4444',padding:'10px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)}
            style={{width:'100%',background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'#f0f0f0',marginBottom:'12px'}} required />
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
            style={{width:'100%',background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'#f0f0f0',marginBottom:'12px'}} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
            style={{width:'100%',background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'#f0f0f0',marginBottom:'16px'}} required />
          <button type="submit" disabled={loading}
            style={{width:'100%',background:'#6366f1',color:'#fff',border:'none',borderRadius:'10px',padding:'12px',fontWeight:'600',cursor:'pointer'}}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'20px',color:'#666'}}>
          Already have an account? <Link to="/login" style={{color:'#6366f1'}}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
