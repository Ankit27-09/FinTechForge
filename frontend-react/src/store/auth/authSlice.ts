import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '@/types/auth';
import { RootState } from '../store';
 
  const initialState: {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
} = {
  isLoggedIn: false,
  user: null,
  accessToken: null,
  loading: true,
};
  export const silentRefresh = createAsyncThunk('auth/silentRefresh', async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      dispatch(logout());
      console.error('Silent refresh failed:', error);
      return rejectWithValue('Refresh failed');
    }
  });


  const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
      setAccessToken: (state, action) => {
        state.accessToken = action.payload.accessToken || action.payload;
        state.user = action.payload.user || state.user;
        state.isLoggedIn = true;
        state.loading = false;
      },
      logout: (state) => {
        state.accessToken = null;
        state.isLoggedIn = false;
        state.user = null;
        state.loading = false;
      },
    },
    extraReducers: (builder) => {
      // builder.addCase(login.fulfilled, (state, action) => {
      //   state.accessToken = action.payload;
      // });
      builder.addCase(silentRefresh.pending, (state) => {
        state.loading = true;
      });
      builder.addCase(silentRefresh.fulfilled, (state, action) => {
        if (action.payload) {
          state.isLoggedIn = true;
          state.accessToken = action.payload.accessToken;
          state.user = action.payload.user;
        }
        state.loading = false;
      });
      builder.addCase(silentRefresh.rejected, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
      });
    },
  });

  export const { setAccessToken, logout } = authSlice.actions;

  export default authSlice.reducer;


