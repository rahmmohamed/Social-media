import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import { setPosts, addPost, removePost, updateLike, setLoading } from '../store/postsSlice';
import PostCard   from '../components/PostCard';
import CreatePost from '../components/CreatePost';

/**
 * Feed Component (Page)
 * Role: Display personalized home feed with user's followed posts
 * - Fetches posts from /feed API on mount
 * - Shows loading state while fetching
 * - Displays empty state message if user has no followers
 * - Allows creating new posts via CreatePost component
 * - Allows liking/unliking posts and deleting own posts
 * - Uses Redux for state management
 */
export default function Feed() {
  const dispatch   = useDispatch();
  const posts      = useSelector(s => s.posts.items);
  const isLoading  = useSelector(s => s.posts.isLoading);

  
  useEffect(() => {
    /**
   * load(): Fetch initial feed posts
   * - Dispatches setLoading(true) to show loading state
   * - Calls GET /feed to fetch user's followed posts
   * - Dispatches setPosts to store in Redux
   * - Runs once on component mount due to empty dependency array
   */
  async function load() {
      dispatch(setLoading(true));
      try {
        const res = await api.get('/feed');
        dispatch(setPosts(res.data));
      } catch {
        console.error('Failed to load feed');
        dispatch(setLoading(false));
      }
    }
    load();
  }, [dispatch]);  

  /**
   * handleLike(postId): Toggle like/unlike on a post
   * - Sends POST request to /posts/:id/like
   * - Dispatches updateLike to update Redux state with new like status
   * @param {number} postId - ID of post to like/unlike
   */
  async function handleLike(postId) {
    const res = await api.post(`/posts/${postId}/like`);
    dispatch(updateLike({ postId, liked: res.data.liked, likeCount: res.data.likeCount }));
  }

  /**
   * handleDelete(postId): Delete a post with confirmation
   * - Shows confirmation dialog to prevent accidental deletion
   * - Sends DELETE request to /posts/:id
   * - Dispatches removePost to update Redux state
   * @param {number} postId - ID of post to delete
   */
  async function handleDelete(postId) {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/posts/${postId}`);
    dispatch(removePost(postId));
  }

  if (isLoading) return <div style={{padding:'40px',textAlign:'center',color:'#555'}}>Loading...</div>;

  return (
    <div>
      <div style={{padding:'20px 24px',borderBottom:'1px solid #1e1e1e'}}>
        <h1 style={{fontSize:'20px',fontWeight:'700'}}>Home</h1>
      </div>

      <CreatePost onPostCreated={p => dispatch(addPost(p))} />

      {posts.length === 0
        ? <p style={{padding:'40px',textAlign:'center',color:'#555'}}>Follow people to see their posts here.</p>
        : posts.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} />
          ))
      }
    </div>
  );
}