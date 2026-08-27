import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import boardingReducer from "./slices/boardingSlice";
import bookingReducer from "./slices/bookingSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boardings: boardingReducer,
    bookings: bookingReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore date object or specific non-serializable properties in actions if needed
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
