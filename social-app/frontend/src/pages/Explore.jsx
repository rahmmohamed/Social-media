import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Explore Component (Page)
 * Role: Display list of all users for discovery and follow suggestions
 * - Fetches list of all users on mount
 * - Shows user card with follow/unfollow button
 * - Allows following other users for personalized feed
 * - Shows loading state while fetching
 * - Updates follow status optimistically
 */
export default function Explore() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * load(): Fetch list of all users
   * - Calls GET /users to fetch all users except current user
   * - Sets loading state during fetch
   * - Runs once on component mount
   */
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch {
        console.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  /**
   * handleFollow(userId): Toggle follow/unfollow for a user
   * - Sends POST request to /users/:id/follow
   * - Updates local users list with new follow status
   * - Optimistic update for immediate UI feedback
   * @param {number} userId - ID of user to follow/unfollow
   */
  async function handleFollow(userId) {
    try {
      await api.post(`/users/${userId}/follow`);
      setUsers(prev => prev.map(u => u.id === userId 
        ? { ...u, is_following: !u.is_following } 
        : u
      ));
    } catch {
      console.error('Failed to follow user');
    }
  }

  if (isLoading) return <div style={{padding:'40px',textAlign:'center',color:'#555'}}>Loading...</div>;

  return (
    <div>
      <div style={{padding:'20px 24px',borderBottom:'1px solid #1e1e1e'}}>
        <h1 style={{fontSize:'20px',fontWeight:'700'}}>Explore</h1>
      </div>

      <div style={{padding:'20px 24px'}}>
        {users.length === 0
          ? <p style={{textAlign:'center',color:'#555'}}>No users found.</p>
          : users.map(user => (
              <div key={user.id} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',padding:'12px',borderRadius:'8px',border:'1px solid #2a2a2a'}}>
                <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'700',flexShrink:0}}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'600',color:'#f0f0f0'}}>{user.username}</div>
                  <div style={{fontSize:'12px',color:'#555'}}>@{user.username}</div>
                </div>
                <button onClick={() => handleFollow(user.id)}
                  style={{background:user.is_following?'#333':'#6366f1',color:'#fff',border:'none',borderRadius:'20px',padding:'8px 16px',cursor:'pointer',fontWeight:'600'}}>
                  {user.is_following ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
        }
      </div>
    </div>
  );
}
