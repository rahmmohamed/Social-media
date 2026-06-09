const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

/**
 * Global Middleware
 * - CORS: Allows frontend (port 3000) to make requests to this server
 * - JSON parser: Converts request body to req.body object
 */
app.use(cors());          
app.use(express.json()); 

/**
 * API Routes
 * - Each route file handles one section of the API
 * - All requests are prefixed with the path shown
 */
app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/feed', require('./routes/feed'));


const commentsRouter = require('./routes/comments');
app.use('/posts/:postId/comments', commentsRouter);

/**
 * Health Check Route
 * Role: Verify server is running
 */
app.get('/', (req, res) => res.json({ message: 'API running ✅' }));

/**
 * Global Error Handler
 * Role: Catch all unhandled errors
 * - Logs error to console
 * - Returns generic error message to client
 */
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));