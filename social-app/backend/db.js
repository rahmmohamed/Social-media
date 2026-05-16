/**
 * Database Connection Setup
 * Role: Initialize PostgreSQL connection pool
 * - Connects to PostgreSQL using DATABASE_URL from .env
 * - Creates reusable connection pool for query efficiency
 * - Logs connection status to console on startup
 * - Exported to use in route handlers for executing SQL queries
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

pool.connect((err) => {
  if (err) console.error('❌ Failed to connect to DB:', err.message);
  else console.log('✅ Connected to PostgreSQL');
});

module.exports = pool;