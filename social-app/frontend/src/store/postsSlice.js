/**
 * Posts Redux Slice
 * Role: Manage global posts state for the entire application
 * - Stores array of posts fetched from backend
 * - Tracks loading state while fetching posts
 * - Provides actions to modify posts without refetching
 * - All posts displayed throughout app come from this store
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  isLoading: false,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    /**
     * setPosts: Replace entire posts list and clear loading state
     * - Called when fetching feed, explore, or profile posts
     * - Replaces current posts array with new data
     * - Sets isLoading to false (fetching complete)
     */
    setPosts: (state, action) => {
      state.items = action.payload;
      state.isLoading = false;
    },
    /**
     * addPost: Prepend new post to beginning of array
     * - Called when user creates new post
     * - Adds to front so it appears at top of feed immediately
     */
    addPost: (state, action) => {
      state.items.unshift(action.payload);
    },
    /**
     * removePost: Delete post from array by ID
     * - Called when user deletes their post
     * - Removes post from all feeds instantly
     */
    removePost: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    /**
     * updateLike: Update like status and count for a post
     * - Called when user likes/unlikes a post
     * - Updates liked_by_me flag and like_count for post
     * - Finds post by ID and updates only the necessary fields
     */
    updateLike: (state, action) => {
      const post = state.items.find(p => p.id === action.payload.postId);
      if (post) {
        post.liked_by_me = action.payload.liked;
        post.like_count = action.payload.likeCount;
      }
    },
    /**
     * setLoading: Set loading state during fetch operations
     * - Called before fetching posts from API
     * - Set to true to show loading indicator
     * - Set to false when fetch completes
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setPosts, addPost, removePost, updateLike, setLoading } = postsSlice.actions;
export default postsSlice.reducer;
