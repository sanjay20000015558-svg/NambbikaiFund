import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  campaigns: [],
  featuredCampaigns: [],
  campaign: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    sortBy: 'createdAt',
    order: 'desc',
    status: 'approved',
    limit: 12,
    page: 1,
  },
};

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
fetchCampaignsSuccess: (state, action) => {
       state.campaigns = action.payload.data || action.payload.campaigns || [];
       state.total = action.payload.total || 0;
       state.pages = action.payload.pages || 0;
       state.currentPage = action.payload.page || 1;
       state.loading = false;
     },
    fetchCampaignSuccess: (state, action) => {
      state.campaign = action.payload;
      state.loading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateCampaign: (state, action) => {
      const index = state.campaigns.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.campaigns[index] = { ...state.campaigns[index], ...action.payload };
      }
      if (state.campaign && state.campaign._id === action.payload._id) {
        state.campaign = { ...state.campaign, ...action.payload };
      }
    },
    addCampaign: (state, action) => {
      state.campaigns.unshift(action.payload);
    },
    deleteCampaign: (state, action) => {
      state.campaigns = state.campaigns.filter(c => c._id !== action.payload);
      if (state.campaign && state.campaign._id === action.payload) {
        state.campaign = null;
      }
    },
    resetCampaign: (state) => {
      state.campaign = null;
    },
    clearCampaigns: (state) => {
      state.campaigns = [];
      state.total = 0;
      state.pages = 0;
      state.currentPage = 1;
    },
    setCampaigns: (state, action) => {
      state.campaigns = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  fetchCampaignsSuccess,
  fetchCampaignSuccess,
  setFilters,
  updateCampaign,
  addCampaign,
  deleteCampaign,
  resetCampaign,
  clearCampaigns,
  setCampaigns,
} = campaignSlice.actions;

export default campaignSlice.reducer;
