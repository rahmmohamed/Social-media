import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import PostCard from '../components/PostCard';

/**
 * Profile Component (Page)
 * Role: Display user profile and their posts
 * - Shows profile info: username, avatar, post/follower/following counts
 * - Fetches both profile data and user's posts in parallel
 * - Shows follow/unfollow button (hidden on own profile)
 * - Displays all user's posts with like/comment/delete functionality
 * - Dynamically updates follower count when follow status changes
 * - Uses URL parameter :id to determine which user profile to display
 */
export default function Profile() {
  const { id }     = useParams();       
  const me         = useSelector(s => s.auth.user);
  const isOwn      = me?.id === parseInt(id);
  const [profile, setProfile] = useState(null);
  const [posts,   setPosts]   = useState([]);

  useEffect(() => {
    
    /**
   * load(): Fetch profile and posts data
   * - Uses Promise.all for parallel requests (faster than sequential)
   * - Calls GET /users/:id to fetch profile information
   * - Calls GET /users/:id/posts to fetch user's posts
   * - Updates local state with fetched data
   * - Runs when URL :id parameter changes
   */
  async function load() {
      const [p, posts] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/posts`),
      ]);
      setProfile(p.data);
      setPosts(posts.data);
    }
    load();
  }, [id]);  

  /**
   * handleFollow(): Toggle follow/unfollow for this user
   * - Sends POST request to /users/:id/follow
   * - Updates local profile state with new follow status
   * - Updates follower count without needing full refetch
   * - Optimistic update for better UX
   */
  async function handleFollow() {
    const res = await api.post(`/users/${id}/follow`);
    
    setProfile(prev => ({
      ...prev,
      is_following:    res.data.following,
      followers_count: res.data.followers_count,
    }));
  }

  /**
   * handleLike(postId): Toggle like/unlike on a post in profile
   * - Sends POST request to /posts/:id/like
   * - Updates local posts state with new like status and count
   * - Only updates the specific post that was liked
   * @param {number} postId - ID of post to like/unlike
   */
  async function handleLike(postId) {
    const res = await api.post(`/posts/${postId}/like`);
    setPosts(prev => prev.map(p => p.id === postId
      ? {...p, liked_by_me: res.data.liked, like_count: res.data.likeCount} : p));
  }

  if (!profile) return <div style={{padding:'40px',textAlign:'center',color:'#555'}}>Loading...</div>;

  return (
    <div>
      <div style={{padding:'32px 24px',borderBottom:'1px solid #1e1e1e'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px'}}>
          <div style={{width:'72px',height:'72px',borderRadius:'50%',background:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:'700',color:'#fff'}}>
            {profile.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{fontSize:'22px',fontWeight:'700'}}>{profile.username}</h1>
            {!isOwn && (
              <button onClick={handleFollow} style={{marginTop:'8px',padding:'6px 16px',borderRadius:'16px',border:'1px solid #6366f1',background:profile.is_following?'transparent':'#6366f1',color:profile.is_following?'#6366f1':'#fff',cursor:'pointer',fontWeight:'600'}}>
                {profile.is_following ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        <div style={{display:'flex',gap:'24px',color:'#888',fontSize:'14px'}}>
          <span><strong style={{color:'#f0f0f0'}}>{profile.posts_count}</strong> posts</span>
          <span><strong style={{color:'#f0f0f0'}}>{profile.followers_count}</strong> followers</span>
          <span><strong style={{color:'#f0f0f0'}}>{profile.following_count}</strong> following</span>
        </div>
      </div>
      {posts.map(p => <PostCard key={p.id} post={p} onLike={handleLike} onDelete={() => {}} />)}
    </div>
  );
}