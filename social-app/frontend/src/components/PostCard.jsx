import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PostCard Component
 * Role: Display a single post with author info, content, and interactions
 * - "Dumb" component: receives all data as props, handles no data fetching
 * - Shows author avatar, username, and timestamp
 * - Displays post content
 * - Shows like/unlike button with count and comment button with count
 * - Shows delete button (only for post owner)
 * - Each post is clickable to view full post details
 * @prop {object} post - Post data object
 * @prop {function} onLike - Callback when like button is clicked
 * @prop {function} onDelete - Callback when delete button is clicked
 */
export default function PostCard({ post, onLike, onDelete }) {
  const me = useSelector(s => s.auth.user);
  const isOwner = me?.id === post.user_id;

  /**
   * timeAgo(d): Convert date to relative time string
   * - Calculates seconds elapsed since date
   * - Returns formatted string like "5m ago" or "2h ago"
   * - Used to display "posted 5 minutes ago" style timestamps
   * @param {Date|string} d - Date to convert
   * @returns {string} Relative time string (e.g., "5s ago", "2h ago")
   */
  function timeAgo(d) {
    // eslint-disable-next-line react-hooks/purity
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60)   return `${s}s ago`;
    if (s < 3600) return `${ Math.floor(s/60)}m ago`;
    return `${ Math.floor(s/3600)}h ago`;
  }

  return (
    <div style={{borderBottom:'1px solid #1e1e1e',padding:'20px 24px'}}>
      <div style={{display:'flex',gap:'12px',marginBottom:'12px'}}>
        <Link to={`/profile/${post.user_id}`}
          style={{width:'42px',height:'42px',borderRadius:'50%',background:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'700',flexShrink:0,textDecoration:'none'}}>
          {post.username?.[0]?.toUpperCase()}
        </Link>
        <div>
          <Link to={`/profile/${post.user_id}`} style={{fontWeight:'600',color:'#f0f0f0',textDecoration:'none'}}>{post.username}</Link>
          <div style={{fontSize:'12px',color:'#555'}}>{ timeAgo(post.created_at)}</div>
        </div>
        {isOwner && <button onClick={() => onDelete(post.id)} style={{marginLeft:'auto',background:'none',border:'none',color:'#555',cursor:'pointer'}}>🗑️</button>}
      </div>

      <p style={{marginBottom:'14px',lineHeight:'1.65',color:'#e0e0e0'}}>{post.content}</p>

      <div style={{display:'flex',gap:'20px'}}>
        <button onClick={() => onLike(post.id)}
          style={{background:'none',border:'none',cursor:'pointer',color:post.liked_by_me?'#ef4444':'#666',fontSize:'14px'}}>
          {post.liked_by_me ? '❤️' : '🤍'} {post.like_count || 0}
        </button>
        <Link to={`/post/${post.id}`} style={{color:'#666',textDecoration:'none',fontSize:'14px'}}>
          💬 {post.comment_count || 0}
        </Link>
      </div>
    </div>
  );
}