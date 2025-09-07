import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types based on API response
export interface Weather {
  current: {
    temperature: number;
    windSpeed: number;
    weatherCode: number;
    weatherCondition: string;
    time: string;
    humidity: number;
  };
}

export interface Property {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  geohash5: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  weather: Weather;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PropertiesResponse {
  data: Property[];
  pagination: Pagination;
}

export interface FilterParams {
  weatherCondition?: string;
  temperatureMin?: number;
  temperatureMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  page?: number;
  searchText?: string;
}

interface PropertiesState {
  properties: Property[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  filters: FilterParams;
}

const initialState: PropertiesState = {
  properties: [],
  pagination: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
  },
};

// Async thunk for fetching properties
export const fetchProperties = createAsyncThunk(
  "properties/fetchProperties",
  async (params: FilterParams = {}) => {
    const searchParams = new URLSearchParams();

    if (params.weatherCondition)
      searchParams.append("weatherCondition", params.weatherCondition);
    if (params.temperatureMin !== undefined)
      searchParams.append("temperatureMin", params.temperatureMin.toString());
    if (params.temperatureMax !== undefined)
      searchParams.append("temperatureMax", params.temperatureMax.toString());
    if (params.humidityMin !== undefined)
      searchParams.append("humidityMin", params.humidityMin.toString());
    if (params.humidityMax !== undefined)
      searchParams.append("humidityMax", params.humidityMax.toString());
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.searchText) searchParams.append("searchText", params.searchText as string);

    const response = await fetch(
      `http://localhost:5000/get-properties?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch properties");
    }

    return response.json() as Promise<PropertiesResponse>;
  }
);

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FilterParams>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { page: 1 };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch properties";
      });
  },
});

export const { setFilters, clearFilters, setPage } = propertiesSlice.actions;
export default propertiesSlice.reducer;
