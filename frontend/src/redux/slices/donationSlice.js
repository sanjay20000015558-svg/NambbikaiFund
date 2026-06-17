import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  donations: [],
  recentDonations: [],
  totalDonated: 0,
  loading: false,
  error: null,
  paymentOrder: null,
};

const donationSlice = createSlice({
  name: 'donations',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setPaymentOrder: (state, action) => {
      state.paymentOrder = action.payload;
    },
    clearPaymentOrder: (state) => {
      state.paymentOrder = null;
    },
    fetchDonationsSuccess: (state, action) => {
      state.donations = action.payload.donations;
      state.total = action.payload.total;
      state.pages = action.payload.pages;
      state.currentPage = action.payload.page;
      state.loading = false;
    },
    updateDonation: (state, action) => {
      const index = state.donations.findIndex(d => d._id === action.payload._id);
      if (index !== -1) {
        state.donations[index] = { ...state.donations[index], ...action.payload };
      }
    },
    addDonation: (state, action) => {
      state.donations.unshift(action.payload);
      state.totalDonated += action.payload.amount;
    },
    setTotalDonated: (state, action) => {
      state.totalDonated = action.payload;
    },
    clearDonations: (state) => {
      state.donations = [];
      state.total = 0;
      state.pages = 0;
    },
  },
});

export const {
  setLoading,
  setError,
  setPaymentOrder,
  clearPaymentOrder,
  fetchDonationsSuccess,
  updateDonation,
  addDonation,
  setTotalDonated,
  clearDonations,
} = donationSlice.actions;

export default donationSlice.reducer;
