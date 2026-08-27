import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getBookings, requestStayExtension, respondStayExtension } from "@/api/bookings";

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  activeBooking: null,
};

// Async Thunks
export const fetchUserBookings = createAsyncThunk(
  "bookings/fetchUserBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getBookings(params);
      return data;
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
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

export const { setActiveBooking, clearBookingError } = bookingSlice.actions;

// Selectors
export const selectBookings = (state) => state.bookings.bookings;
export const selectBookingsLoading = (state) => state.bookings.loading;
export const selectActiveBooking = (state) => state.bookings.activeBooking;

export default bookingSlice.reducer;
