import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPayments } from "@/api/payments";

const initialState = {
  payments: [],
  loading: false,
  error: null,
  lastFetched: null,
  cacheTTL: 45000, // 45s SWR cache window
};

// Async Thunks
export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().payments;
      const now = Date.now();
      const isFresh = state.lastFetched && (now - state.lastFetched < state.cacheTTL);
      const isFilterEmpty = Object.keys(params).length === 0;

      // Return cached instantly if still within fresh window and not forced
      if (isFresh && isFilterEmpty && state.payments.length > 0 && !params.forceRefresh) {
        return { data: state.payments, fromCache: true };
      }

      const data = await getPayments(params);
      return { data, fromCache: false, fetchedAt: now };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch payments.");
    }
  }
);

export const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    invalidatePaymentCache: (state) => {
      state.lastFetched = null;
    },
    updatePaymentInStore: (state, action) => {
      const updated = action.payload;
      if (updated && updated._id) {
        state.payments = state.payments.map(p => p._id === updated._id ? { ...p, ...updated } : p);
      }
    },
    addPaymentToStore: (state, action) => {
      if (action.payload) {
        state.payments = [action.payload, ...state.payments];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        // If we already have cached items, keep loading false for 0ms instant display!
        if (state.payments.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.fromCache) {
          state.payments = action.payload.data;
          state.lastFetched = action.payload.fetchedAt;
        }
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { invalidatePaymentCache, updatePaymentInStore, addPaymentToStore } = paymentSlice.actions;

// Selectors
export const selectPayments = (state) => state.payments.payments;
export const selectPaymentsLoading = (state) => state.payments.loading;
export const selectPaymentsLastFetched = (state) => state.payments.lastFetched;

export default paymentSlice.reducer;
