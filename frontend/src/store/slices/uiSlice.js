import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: false,
  activeModal: null,
  toast: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    }
  }
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  showToast,
  clearToast
} = uiSlice.actions;

export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectActiveModal = (state) => state.ui.activeModal;
export const selectToast = (state) => state.ui.toast;

export default uiSlice.reducer;
