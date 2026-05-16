# Social App

This repository contains a social media app with separate `backend` and `frontend` folders.

## Structure

- `backend/` - Node.js + Express API
- `frontend/` - React app powered by Vite

## Setup

### Backend

1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your configuration, for example:
   ```env
   PORT=4000
   DATABASE_URL=postgres://user:password@localhost:5432/social_app
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Open a terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Notes

- The backend uses PostgreSQL and expects the database schema defined in `backend/schema.sql`.
- Authentication is handled with JWT tokens.
- The frontend has React pages for login, registration, feed, profile, and post details.

## Recommended workflow

1. Start the backend server first.
2. Start the frontend dev server.
3. Open the frontend URL provided by Vite in your browser.
