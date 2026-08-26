import axiosInstance from "./axios";
import { toApiError } from "./errors";

// API functions for managing boardings: create, read, update, delete, search, and filter
const BOARDINGS_BASE = "/boardings";

const assertBoardingId = (boardingId) => {
  if (!boardingId) {
    throw new Error("boardingId is required");
  }
};

export const createBoarding = async (boardingData) => {
  try {
    const { data } = await axiosInstance.post(BOARDINGS_BASE, boardingData);
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to create boarding.");
  }
};

export const getBoardings = async (params = {}) => {
  try {
    const { data } = await axiosInstance.get(BOARDINGS_BASE, { params });
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch boardings.");
  }
};

export const getBoardingById = async (boardingId) => {
  assertBoardingId(boardingId);
  try {
    const { data } = await axiosInstance.get(`${BOARDINGS_BASE}/${boardingId}`);
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch boarding.");
  }
};

export const updateBoarding = async (boardingId, boardingData) => {
  assertBoardingId(boardingId);
  try {
    const { data } = await axiosInstance.put(`${BOARDINGS_BASE}/${boardingId}`, boardingData);
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to update boarding.");
  }
};

export const deleteBoarding = async (boardingId, options = {}) => {
  assertBoardingId(boardingId);
  try {
    const { permanent } = options;
    const { data } = await axiosInstance.delete(`${BOARDINGS_BASE}/${boardingId}`, {
      params: permanent ? { permanent: "true" } : {}
    });
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to delete boarding.");
  }
};

export const searchBoardings = async (query, params = {}) => {
  try {
    const { data } = await axiosInstance.get(BOARDINGS_BASE, {
      params: { q: query, ...params },
    });
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to search boardings.");
  }
};

export const filterBoardings = async (filters = {}) => {
  try {
    const { data } = await axiosInstance.get(BOARDINGS_BASE, { params: filters });
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to filter boardings.");
  }
};

export const getAdminStats = async () => {
  try {
    const { data } = await axiosInstance.get(`${BOARDINGS_BASE}/admin/stats`);
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch admin statistics.");
  }
};

export const getPublicStats = async () => {
  try {
    const { data } = await axiosInstance.get(`${BOARDINGS_BASE}/public/stats`);
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch public statistics.");
  }
};

