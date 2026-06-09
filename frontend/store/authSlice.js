import { createSlice } from '@reduxjs/toolkit';


const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:      savedUser  ? JSON.parse(savedUser)  : null,
    token:     savedToken ? savedToken               : null,
    isLoading: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user  = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user',  JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;