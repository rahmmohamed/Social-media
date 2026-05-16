const router = require('express').Router({ mergeParams: true });
const pool   = require('../db');
const auth   = require('../middleware/auth');

/**
 * GET /posts/:postId/comments
 * Role: Fetch all comments for a specific post
 * - Protected route: requires valid JWT token
 * - Joins with users table to get commenter info
 * - Orders comments by creation time (oldest first)
 * - Returns array of comments with user details
 */
router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT comments.*, users.username, users.avatar
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at ASC`, [req.params.postId]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

/**
 * POST /posts/:postId/comments
 * Role: Add a new comment to a post
 * - Protected route: requires valid JWT token
 * - Validates that comment content is not empty
 * - Associates comment with current user and specified post
 * - Returns created comment object
 */
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({error:'Content required.'});
    const r = await pool.query(`
      INSERT INTO comments (user_id, post_id, content) VALUES ($1,$2,$3) RETURNING *`,
      [req.user.id, req.params.postId, content]);
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

/**
 * DELETE /posts/:postId/comments/:id
 * Role: Delete a comment (owner only)
 * - Protected route: requires valid JWT token
 * - Verifies comment exists
 * - Checks that requesting user is the comment owner
 * - Prevents unauthorized deletion
 * - Returns 403 Forbidden if not owner
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const c = await pool.query('SELECT user_id FROM comments WHERE id=$1',[req.params.id]);
    if (!c.rows.length) return res.status(404).json({error:'Not found.'});
    if (c.rows[0].user_id !== req.user.id) return res.status(403).json({error:'Not yours.'});
    await pool.query('DELETE FROM comments WHERE id=$1',[req.params.id]);
    res.json({message:'Deleted.'});
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

module.exports = router;