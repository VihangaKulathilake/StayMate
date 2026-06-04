import axiosInstance from "./axios";
import { toApiError } from "./errors";

// API functions for user authentication: register, login, and logout
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Registration failed.");
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Login failed.");
  }
};

export const logoutUser = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    throw toApiError(error, "Logout failed.");
  }
};

export const googleLogin = async (credential) => {
  try {
    const response = await axiosInstance.post("/auth/google", { credential });
    return response.data;
  } catch (error) {
    throw toApiError(error, "Google login failed.");
  }
};
