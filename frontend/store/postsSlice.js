import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items:      [],
    isLoading:  false,
    pagination: { page: 1, hasMore: false },
  },
  reducers: {
    setPosts:    (state, {payload}) => { state.items = payload.posts; state.pagination = payload.pagination; state.isLoading = false; },
    appendPosts: (state, {payload}) => { state.items = [...state.items, ...payload.posts]; state.pagination = payload.pagination; },
    addPost:     (state, {payload}) => { state.items.unshift(payload); },   
    removePost:  (state, {payload}) => { state.items = state.items.filter(p => p.id !== payload); },
    updateLike:  (state, {payload}) => {
      const p = state.items.find(p => p.id === payload.postId);
      if (p) { p.liked_by_me = payload.liked; p.like_count = payload.likeCount; }
    },
    setLoading:  (state, {payload}) => { state.isLoading = payload; },
  },
});

export const { setPosts, appendPosts, addPost, removePost, updateLike, setLoading } = postsSlice.actions;
export default postsSlice.reducer;