const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

/**
 * POST /posts
 * Role: Create a new post for authenticated user
 * - Protected route: requires valid JWT token
 * - Validates that content is not empty
 * - Stores post in database with user_id and timestamp
 * - Returns created post object
 */
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required.' });

    const r = await pool.query(
      'INSERT INTO posts (user_id, content) VALUES ($1,$2) RETURNING *',
      [req.user.id, content]     
    );
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

/**
 * GET /posts/:id
 * Role: Fetch single post with full details including likes and comments count
 * - Protected route: requires valid JWT token
 * - Joins with users table to get author info (username, avatar)
 * - Counts likes and comments for the post
 * - Determines if current user has liked this post (liked_by_me)
 * - Returns 404 if post doesn't exist
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT posts.*, users.username, users.avatar,
             COUNT(DISTINCT likes.user_id) AS like_count,
             COUNT(DISTINCT comments.id)   AS comment_count,
             BOOL_OR(likes.user_id = $2)   AS liked_by_me
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON likes.post_id = posts.id
      LEFT JOIN comments ON comments.post_id = posts.id
      WHERE posts.id = $1
      GROUP BY posts.id, users.username, users.avatar
    `, [req.params.id, req.user.id]);
    
    if (!r.rows.length) return res.status(404).json({error:'Not found.'});
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

/**
 * DELETE /posts/:id
 * Role: Delete a post (owner only)
 * - Protected route: requires valid JWT token
 * - Verifies post exists
 * - Checks that requesting user is the post owner
 * - Prevents unauthorized deletion
 * - Returns 403 Forbidden if not owner
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await pool.query('SELECT user_id FROM posts WHERE id=$1', [req.params.id]);
    if (!post.rows.length) return res.status(404).json({error:'Not found.'});
    if (post.rows[0].user_id !== req.user.id)
      return res.status(403).json({error:'Not your post.'});

    await pool.query('DELETE FROM posts WHERE id=$1', [req.params.id]);
    res.json({message:'Deleted.'});
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

/**
 * POST /posts/:id/like
 * Role: Toggle like/unlike on a post
 * - Protected route: requires valid JWT token
 * - Checks if user has already liked this post
 * - If already liked: removes the like
 * - If not liked: adds the like
 * - Returns updated like status and total like count
 */
router.post('/:id/like', auth, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT 1 FROM likes WHERE user_id=$1 AND post_id=$2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length) {
      await pool.query('DELETE FROM likes WHERE user_id=$1 AND post_id=$2', [req.user.id, req.params.id]);
    } else {
      await pool.query('INSERT INTO likes (user_id, post_id) VALUES ($1,$2)', [req.user.id, req.params.id]);
    }
    const count = await pool.query('SELECT COUNT(*) FROM likes WHERE post_id=$1', [req.params.id]);
    res.json({ liked: !existing.rows.length, likeCount: parseInt(count.rows[0].count) });
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

module.exports = router;