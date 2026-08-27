import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getBoardings, getBoardingById } from "@/api/boardings";

const initialState = {
  boardings: [],
  selectedBoarding: null,
  loading: false,
  error: null,
  lastFetched: null,
  cacheTTL: 60000, // 60 seconds client-side cache window
  filters: {
    searchQuery: "",
    selectedCategory: "All",
    sortBy: "recommended",
    minPrice: 0,
    maxPrice: 50000,
    preferredType: "any",
  }
};

// Async Thunks
export const fetchBoardings = createAsyncThunk(
  "boardings/fetchBoardings",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().boardings;
      const now = Date.now();
      const isFresh = state.lastFetched && (now - state.lastFetched < state.cacheTTL);
      const isParamEmpty = Object.keys(params).length === 0;

      // Instant 0ms cache return if fresh and not explicitly forced
      if (isFresh && isParamEmpty && state.boardings.length > 0 && !params.forceRefresh) {
        return { data: state.boardings, fromCache: true };
      }

      const data = await getBoardings(params);
      return { data, fromCache: false, fetchedAt: now };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch boardings.");
    }
  }
);

export const fetchBoardingByIdThunk = createAsyncThunk(
  "boardings/fetchBoardingById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getBoardingById(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch boarding details.");
    }
  }
);

export const boardingSlice = createSlice({
  name: "boardings",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.filters.selectedCategory = action.payload;
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    setPriceRange: (state, action) => {
      state.filters.minPrice = action.payload.minPrice ?? state.filters.minPrice;
      state.filters.maxPrice = action.payload.maxPrice ?? state.filters.maxPrice;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedBoarding: (state) => {
      state.selectedBoarding = null;
    },
    invalidateBoardingCache: (state) => {
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Boardings
      .addCase(fetchBoardings.pending, (state) => {
        // Only trigger visible spinner if we have NO cached items
        if (state.boardings.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchBoardings.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.fromCache) {
          state.boardings = action.payload.data;
          state.lastFetched = action.payload.fetchedAt;
        }
        state.error = null;
      })
      .addCase(fetchBoardings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load boardings.";
      })
      // Fetch Boarding By Id
      .addCase(fetchBoardingByIdThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoardingByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBoarding = action.payload;
      })
      .addCase(fetchBoardingByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setPriceRange,
  resetFilters,
  clearSelectedBoarding,
  invalidateBoardingCache,
} = boardingSlice.actions;

// Selectors
export const selectBoardings = (state) => state.boardings.boardings;
export const selectSelectedBoarding = (state) => state.boardings.selectedBoarding;
export const selectBoardingLoading = (state) => state.boardings.loading;
export const selectBoardingFilters = (state) => state.boardings.filters;
export const selectBoardingLastFetched = (state) => state.boardings.lastFetched;

export default boardingSlice.reducer;
