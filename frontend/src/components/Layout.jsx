/**
 * Layout Component
 * Role: Main application layout with sidebar navigation
 * - Displays sticky sidebar with navigation menu
 * - Shows Home, Explore, and Profile links
 * - Conditionally shows profile link with logged-in user's ID
 * - Provides logout functionality
 * - Uses <Outlet /> to render child page content
 * - Wraps all authenticated pages
 */
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

/**
 * Layout Component
 * Role: Main application layout with sidebar navigation
 * - Displays sticky sidebar with navigation menu
 * - Shows Home, Explore, and Profile links
 * - Conditionally shows profile link with logged-in user's ID
 * - Provides logout functionality
 * - Uses <Outlet /> to render child page content
 * - Wraps all authenticated pages
 */
export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector(s => s.auth.user);

  const link = ({isActive}) => ({
    display:'flex',gap:'10px',padding:'10px 16px',borderRadius:'8px',
    color: isActive ? '#6366f1' : '#666', background: isActive ? 'rgba(99,102,241,.1)' : 'none',
    fontWeight:'500', fontSize:'14px', margin:'2px 8px', textDecoration:'none',
  });

  return (
    <div style={{display:'flex',maxWidth:'1100px',margin:'0 auto'}}>
      <nav style={{width:'240px',flexShrink:0,background:'#0d0d0d',borderRight:'1px solid #1e1e1e',minHeight:'100vh',position:'sticky',top:0,display:'flex',flexDirection:'column',paddingTop:'24px'}}>
        <div style={{fontSize:'20px',fontWeight:'800',color:'#6366f1',padding:'0 24px',marginBottom:'24px'}}>● Socially</div>
        <NavLink to="/"                  style={link} end>🏠 Home</NavLink>
        <NavLink to="/explore"           style={link}>🔍 Explore</NavLink>
        <NavLink to={`/profile/${user?.id}`} style={link}>👤 Profile</NavLink>
        <div style={{flex:1}}/>
        <button onClick={() => { dispatch(logout()); navigate('/login'); }}
          style={{background:'none',border:'none',color:'#666',padding:'10px 24px',marginBottom:'24px',cursor:'pointer',textAlign:'left',fontSize:'14px'}}>
          🚪 Log out
        </button>
      </nav>
      {/* Outlet renders the current child page */}
      <main style={{flex:1,borderLeft:'1px solid #1e1e1e'}}><Outlet /></main>
    </div>
  );
}