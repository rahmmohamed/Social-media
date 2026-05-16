/**
 * Auth Redux Slice
 * Role: Manage global authentication state
 * - Stores JWT token (in Redux and localStorage)
 * - Stores current user object (in Redux and localStorage)
 * - Tracks loading state during auth operations
 * - Persists auth data across browser refreshes using localStorage
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * loginSuccess: Save user and token after successful login/registration
     * - Stores token for API authentication
     * - Stores user object for display throughout app
     * - Persists both to localStorage for session persistence
     */
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    /**
     * logout: Clear authentication data and sign out user
     * - Removes token from Redux state
     * - Removes user object from Redux state
     * - Clears localStorage to prevent auto-login on next session
     */
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
