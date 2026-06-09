CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,        -- auto-increment ID
  username    VARCHAR(50) UNIQUE NOT NULL,  -- must be unique
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    TEXT NOT NULL,              -- always stored HASHED
  avatar      TEXT,                       -- URL to profile image
  bio         TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- POSTS table: one row per post
CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  image_url   TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- FOLLOWS table: who follows who
-- follower_id clicked "Follow" on following_id's profile
CREATE TABLE IF NOT EXISTS follows (
  follower_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)  -- no duplicate follows
);

-- LIKES table: who liked which post
CREATE TABLE IF NOT EXISTS likes (
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)  -- one like per user per post
);

-- COMMENTS table
CREATE TABLE IF NOT EXISTS comments (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- INDEXES: make queries faster (Postgres scans less data)
CREATE INDEX IF NOT EXISTS idx_posts_user    ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follow ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_likes_post     ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post  ON comments(post_id);