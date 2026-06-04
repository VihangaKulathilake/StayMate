import axiosInstance from "./axios";
import { toApiError } from "./errors";

const PAYMENTS_BASE = "/payments";

export const createPayment = async (paymentData) => {
    try {
        const { data } = await axiosInstance.post(PAYMENTS_BASE, paymentData);
        return data;
    } catch (error) {
        throw toApiError(error, "Failed to record payment.");
    }
};

export const getPayments = async (params = {}) => {
    try {
        const { data } = await axiosInstance.get(PAYMENTS_BASE, { params });
        return data;
    } catch (error) {
        throw toApiError(error, "Failed to fetch payments.");
    }
};

export const getPaymentById = async (paymentId) => {
    try {
        const { data } = await axiosInstance.get(`${PAYMENTS_BASE}/${paymentId}`);
        return data;
    } catch (error) {
        throw toApiError(error, "Failed to fetch payment details.");
    }
};

export const updatePaymentStatus = async (paymentId, status) => {
    try {
        const { data } = await axiosInstance.put(`${PAYMENTS_BASE}/${paymentId}`, { status });
        return data;
    } catch (error) {
        throw toApiError(error, "Failed to update payment status.");
    }
};

export const getPayPalClientId = async () => {
    try {
        const { data } = await axiosInstance.get(`${PAYMENTS_BASE}/config/paypal`);
        return data.clientId;
    } catch (error) {
        throw toApiError(error, "Failed to fetch PayPal configurations.");
    }
};

export const createPayPalOrder = async (paymentId) => {
    try {
        const { data } = await axiosInstance.post(`${PAYMENTS_BASE}/${paymentId}/create-paypal-order`);
        return data;
    } catch (error) {
        throw toApiError(error, "Failed to initiate PayPal checkout order.");
    }
};

export const capturePayPalOrder = async (paymentId, orderId) => {
    try {
        const { data } = await axiosInstance.post(`${PAYMENTS_BASE}/${paymentId}/capture-paypal-order`, { orderId });
        return data;
    } catch (error) {
        throw toApiError(error, "Failed to confirm and capture PayPal payment.");
    }
};
