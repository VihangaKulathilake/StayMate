import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser as loginApi, registerUser as registerApi } from "@/api/auth";
import { getMe } from "@/api/users";
import { 
  getCurrentUser, 
  getAuthToken, 
  saveAuthSession, 
  clearAuthSession 
} from "@/lib/auth";

const initialUser = getCurrentUser();
const initialToken = getAuthToken();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
  role: initialUser?.role || null,
  loading: false,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginApi(credentials);
      saveAuthSession({ token: data.token, user: data.user });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Login failed. Please check credentials.");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await registerApi(userData);
      saveAuthSession({ token: data.token, user: data.user });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Registration failed.");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await getMe();
      if (user) {
        saveAuthSession({ user });
      }
      return user;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch user profile.");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(token && user);
      state.role = user?.role || null;
      state.error = null;
      saveAuthSession({ token, user });
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      saveAuthSession({ user: state.user });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.error = null;
      clearAuthSession();
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.role = action.payload.user?.role || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.role = action.payload.user?.role || null;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed.";
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload?.role || state.role;
        state.isAuthenticated = Boolean(state.token && action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCredentials, updateUserProfile, logout, clearAuthError } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
