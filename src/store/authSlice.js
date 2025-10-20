import { signInApi } from "@/app/api/auth";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  userStats: {
    friendsCount: 0,
    postsCount: 0,
    likesCount: 0,
    followingCount: 0,
  },
  statsLoading: false,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      return initialState;
    },

    setUser: (state, action) => {
      state.user = action.payload;
    },

    setUserStats: (state, action) => {
      state.userStats = action.payload;
      state.statsLoading = false;
    },

    setStatsLoading: (state, action) => {
      state.statsLoading = action.payload;
    },

    updateSingleStat: (state, action) => {
      const { statName, value } = action.payload;
      if (state.userStats[statName] !== undefined) {
        state.userStats[statName] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInApi.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signInApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  setUser,
  setUserStats,
  setStatsLoading,
  updateSingleStat,
} = authSlice.actions;
export default authSlice.reducer;
