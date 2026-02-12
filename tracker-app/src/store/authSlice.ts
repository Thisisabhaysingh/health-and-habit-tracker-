import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { AuthUser, UserProfile } from '@/types/tracker';

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error?: string | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.profile = action.payload;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetAuthState() {
      return { ...initialState, loading: false };
    },
  },
});

export const { setUser, setProfile, setAuthLoading, setAuthError, resetAuthState } =
  authSlice.actions;

export default authSlice.reducer;
