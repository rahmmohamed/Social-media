const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

/**
 * GET /feed
 * Role: Fetch personalized home feed for authenticated user
 * - Protected route: requires valid JWT token
 * - Returns posts only from users that current user is following
 * - Supports pagination (page query parameter, 10 posts per page)
 * - Includes author info, like count, comment count, and liked_by_me flag
 * - Orders by most recent posts first
 */
router.get('/', auth, async (req, res) => {
  try {
    const page   = parseInt(req.query.page) || 1;
    const limit  = 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT posts.*, users.username, users.avatar,
             COUNT(DISTINCT likes.user_id) AS like_count,
             COUNT(DISTINCT comments.id)   AS comment_count,
             BOOL_OR(likes.user_id = $1)   AS liked_by_me
      FROM posts
      JOIN users   ON posts.user_id      = users.id
      JOIN follows ON follows.following_id = posts.user_id
                   AND follows.follower_id = $1
      LEFT JOIN likes    ON likes.post_id    = posts.id
      LEFT JOIN comments ON comments.post_id = posts.id
      GROUP BY posts.id, users.username, users.avatar
      ORDER BY posts.created_at DESC
      LIMIT $2 OFFSET $3`, [req.user.id, limit, offset]);

    res.json(result.rows);

  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

/**
 * GET /feed/explore
 * Role: Fetch explore page with posts from all users
 * - Protected route: requires valid JWT token
 * - Shows all posts regardless of follow status
 * - Supports pagination (10 posts per page)
 * - Includes like count and liked_by_me flag
 * - Orders by most recent posts first
 */
router.get('/explore', auth, async (req, res) => {
  try {
    const offset = ((parseInt(req.query.page) || 1) - 1) * 10;
    const r = await pool.query(`
      SELECT posts.*, users.username, users.avatar,
             COUNT(DISTINCT likes.user_id) AS like_count,
             BOOL_OR(likes.user_id = $1)   AS liked_by_me
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON likes.post_id = posts.id
      GROUP BY posts.id, users.username, users.avatar
      ORDER BY posts.created_at DESC LIMIT 10 OFFSET $2`, [req.user.id, offset]);
    res.json({ posts: r.rows });
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

module.exports = router;