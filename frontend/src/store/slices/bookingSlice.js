import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getBookings, requestStayExtension, respondStayExtension } from "@/api/bookings";

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  activeBooking: null,
  lastFetched: null,
  cacheTTL: 45000, // 45 seconds client-side cache window
};

// Async Thunks
export const fetchUserBookings = createAsyncThunk(
  "bookings/fetchUserBookings",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().bookings;
      const now = Date.now();
      const isFresh = state.lastFetched && (now - state.lastFetched < state.cacheTTL);
      const isFilterEmpty = Object.keys(params).length === 0;

      // Instant 0ms cache return if fresh and not explicitly forced
      if (isFresh && isFilterEmpty && state.bookings.length > 0 && !params.forceRefresh) {
        return { data: state.bookings, fromCache: true };
      }

      const data = await getBookings(params);
      return { data, fromCache: false, fetchedAt: now };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch bookings.");
    }
  }
);

export const submitExtensionRequest = createAsyncThunk(
  "bookings/submitExtensionRequest",
  async ({ bookingId, additionalMonths, reason }, { rejectWithValue }) => {
    try {
      const data = await requestStayExtension(bookingId, { additionalMonths, reason });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to submit stay extension request.");
    }
  }
);

export const submitExtensionDecision = createAsyncThunk(
  "bookings/submitExtensionDecision",
  async ({ bookingId, decision, landlordNote }, { rejectWithValue }) => {
    try {
      const data = await respondStayExtension(bookingId, { decision, landlordNote });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to respond to extension request.");
    }
  }
);

export const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setActiveBooking: (state, action) => {
      state.activeBooking = action.payload;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    invalidateBookingCache: (state) => {
      state.lastFetched = null;
    },
    updateBookingInStore: (state, action) => {
      const updated = action.payload;
      if (updated && updated._id) {
        state.bookings = state.bookings.map(b => b._id === updated._id ? { ...b, ...updated } : b);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchUserBookings.pending, (state) => {
        // Only trigger visible spinner if we have NO cached items
        if (state.bookings.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.fromCache) {
          state.bookings = action.payload.data;
          state.lastFetched = action.payload.fetchedAt;
        }
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Extension
      .addCase(submitExtensionRequest.fulfilled, (state, action) => {
        const updated = action.payload.booking || action.payload;
        if (updated && updated._id) {
          state.bookings = state.bookings.map(b => b._id === updated._id ? updated : b);
        }
      })
      // Respond Extension
      .addCase(submitExtensionDecision.fulfilled, (state, action) => {
        const updated = action.payload.booking || action.payload;
        if (updated && updated._id) {
          state.bookings = state.bookings.map(b => b._id === updated._id ? updated : b);
        }
      });
  },
});

export const { setActiveBooking, clearBookingError, invalidateBookingCache, updateBookingInStore } = bookingSlice.actions;

// Selectors
export const selectBookings = (state) => state.bookings.bookings;
export const selectBookingsLoading = (state) => state.bookings.loading;
export const selectActiveBooking = (state) => state.bookings.activeBooking;
export const selectBookingsLastFetched = (state) => state.bookings.lastFetched;

export default bookingSlice.reducer;
