import { useState } from 'react';
import api from '../api/axios';

/**
 * CreatePost Component
 * Role: Provide form for users to create new posts
 * - Text area for entering post content
 * - Submit button that posts content to API
 * - Validates that post content is not empty
 * - Shows loading state while submitting
 * - Clears textarea after successful post
 * - Calls onPostCreated callback with new post data
 * @prop {function} onPostCreated - Callback invoked with new post data after creation
 */
export default function CreatePost({ onPostCreated }) {
  const [content,     setContent]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  /**
   * submit(): Handle post submission
   * - Validates that content is not empty (after trimming whitespace)
   * - Sets submitting state to disable button and show loading text
   * - Makes POST request to /posts with content
   * - Calls onPostCreated with new post data so parent can add to feed
   * - Clears textarea for next post
   * - Ensures loading state is cleared in finally block
   */
  async function submit() {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/posts', { content });
      onPostCreated(res.data);  
      setContent('');
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{borderBottom:'1px solid #1e1e1e',padding:'16px 24px'}}>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{width:'100%',background:'none',border:'none',color:'#f0f0f0',fontSize:'15px',resize:'none',outline:'none',marginBottom:'12px'}}
        rows={3}
      />
      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <button onClick={submit} disabled={submitting || !content.trim()}
          style={{background:'#6366f1',color:'#fff',border:'none',borderRadius:'20px',padding:'8px 20px',fontWeight:'600',cursor:'pointer',opacity:submitting||!content.trim()?0.5:1}}>
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}