import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';

/**
 * PostDetail Component (Page)
 * Role: Display full post with all comments
 * - Fetches post details and all comments in parallel
 * - Shows loading state while fetching
 * - Displays post with like/delete functionality
 * - Provides comment form for adding new comments
 * - Shows all comments with author info
 * - Updates like count and comment list dynamically
 */
export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * load(): Fetch post and comments data
   * - Uses Promise.all for parallel requests (faster than sequential)
   * - Calls GET /posts/:id to fetch post details
   * - Calls GET /posts/:id/comments to fetch all comments
   * - Updates local state with fetched data
   * - Runs when URL :id parameter changes
   */
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [p, c] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/posts/${id}/comments`),
        ]);
        setPost(p.data);
        setComments(c.data);
      } catch {
        console.error('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  /**
   * handleCommentSubmit(): Add new comment to post
   * - Validates that comment text is not empty
   * - Makes POST request to /posts/:id/comments
   * - Appends new comment to local comments array
   * - Clears textarea for next comment
   */
  async function handleCommentSubmit() {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/posts/${id}/comments`, { content: commentText });
      setComments([...comments, res.data]);
      setCommentText('');
    } catch {
      console.error('Failed to post comment');
    }
  }

  /**
   * handleLike(postId): Toggle like/unlike on post
   * - Sends POST request to /posts/:id/like
   * - Updates post state with new like status and count
   * @param {number} postId - ID of post to like/unlike
   */
  async function handleLike(postId) {
    const res = await api.post(`/posts/${postId}/like`);
    setPost(prev => ({
      ...prev,
      liked_by_me: res.data.liked,
      like_count: res.data.likeCount,
    }));
  }

  /**
   * handleDelete(postId): Delete post with confirmation
   * - Shows confirmation dialog to prevent accidental deletion
   * - Sends DELETE request to /posts/:id
   * - Redirects to home page after deletion
   * @param {number} postId - ID of post to delete
   */
  async function handleDelete(postId) {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/posts/${postId}`);
    navigate('/');
  }

  if (isLoading) return <div style={{padding:'40px',textAlign:'center',color:'#555'}}>Loading...</div>;
  if (!post) return <div style={{padding:'40px',textAlign:'center',color:'#555'}}>Post not found.</div>;

  return (
    <div>
      <PostCard post={post} onLike={handleLike} onDelete={handleDelete} />

      <div style={{borderBottom:'1px solid #1e1e1e',padding:'16px 24px'}}>
        <textarea
          placeholder="Add a comment..."
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          style={{width:'100%',background:'none',border:'none',color:'#f0f0f0',fontSize:'15px',resize:'none',outline:'none',marginBottom:'12px'}}
          rows={2}
        />
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <button onClick={handleCommentSubmit} disabled={!commentText.trim()}
            style={{background:'#6366f1',color:'#fff',border:'none',borderRadius:'20px',padding:'8px 20px',fontWeight:'600',cursor:'pointer',opacity:!commentText.trim()?0.5:1}}>
            Comment
          </button>
        </div>
      </div>

      {comments.map(comment => (
        <div key={comment.id} style={{borderBottom:'1px solid #1e1e1e',padding:'16px 24px'}}>
          <div style={{display:'flex',gap:'12px',marginBottom:'8px'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'700',flexShrink:0}}>
              {comment.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{fontWeight:'600',color:'#f0f0f0'}}>{comment.username}</div>
              <p style={{margin:'4px 0 0 0',color:'#e0e0e0',fontSize:'14px'}}>{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
