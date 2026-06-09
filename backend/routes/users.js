const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

/**
 * GET /users
 * Role: Fetch list of all users (for suggestions/explore)
 * - Protected route: requires valid JWT token
 * - Returns all users except current user
 * - Checks if current user is following each user (is_following flag)
 * - Limited to first 50 users for performance
 * - Ordered by account creation date (newest first)
 */
router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT u.id, u.username, u.avatar, u.bio,
             BOOL_OR(f.follower_id = $1) AS is_following
      FROM users u
      LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $1
      WHERE u.id != $1
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 50`, [req.user.id]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

/**
 * GET /users/:id
 * Role: Fetch detailed profile information for a user
 * - Protected route: requires valid JWT token
 * - Returns user profile with all stats
 * - Counts followers, following, and posts
 * - Checks if current user is following this user
 * - Returns 404 if user doesn't exist
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT u.id, u.username, u.avatar, u.bio, u.created_at,
             COUNT(DISTINCT f1.follower_id)  AS followers_count,
             COUNT(DISTINCT f2.following_id) AS following_count,
             COUNT(DISTINCT p.id)            AS posts_count,
             BOOL_OR(f1.follower_id = $2)    AS is_following
      FROM users u
      LEFT JOIN follows f1 ON f1.following_id = u.id
      LEFT JOIN follows f2 ON f2.follower_id  = u.id
      LEFT JOIN posts   p  ON p.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id`, [req.params.id, req.user.id]);

    if (!r.rows.length) return res.status(404).json({error:'Not found.'});
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

/**
 * GET /users/:id/posts
 * Role: Fetch all posts by a specific user
 * - Protected route: requires valid JWT token
 * - Returns posts with author info and like details
 * - Includes like count and whether current user liked each post
 * - Ordered by most recent posts first
 */
router.get('/:id/posts', auth, async (req, res) => {
  const r = await pool.query(`
    SELECT posts.*, users.username, users.avatar,
           COUNT(DISTINCT likes.user_id) AS like_count,
           BOOL_OR(likes.user_id = $2)   AS liked_by_me
    FROM posts
    JOIN users ON posts.user_id = users.id
    LEFT JOIN likes ON likes.post_id = posts.id
    WHERE posts.user_id = $1
    GROUP BY posts.id, users.username, users.avatar
    ORDER BY posts.created_at DESC`, [req.params.id, req.user.id]);
  res.json(r.rows);
});

/**
 * POST /users/:id/follow
 * Role: Toggle follow/unfollow for a user
 * - Protected route: requires valid JWT token
 * - Prevents users from following themselves
 * - If already following: removes the follow relationship
 * - If not following: creates new follow relationship
 * - Returns updated follow status and follower count
 */
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const fid = req.params.id;
    if (parseInt(fid) === req.user.id)
      return res.status(400).json({error:"Can't follow yourself."});

    const ex = await pool.query(
      'SELECT 1 FROM follows WHERE follower_id=$1 AND following_id=$2',
      [req.user.id, fid]
    );
    let following;
    if (ex.rows.length) {
      await pool.query('DELETE FROM follows WHERE follower_id=$1 AND following_id=$2',[req.user.id,fid]);
      following = false;
    } else {
      await pool.query('INSERT INTO follows (follower_id,following_id) VALUES ($1,$2)',[req.user.id,fid]);
      following = true;
    }

    
    const countResult = await pool.query(
      'SELECT COUNT(*) as followers_count FROM follows WHERE following_id=$1',
      [fid]
    );
    res.json({following, followers_count: parseInt(countResult.rows[0].followers_count)});
  } catch(e) { res.status(500).json({error:'Server error.'}); }
});

module.exports = router;