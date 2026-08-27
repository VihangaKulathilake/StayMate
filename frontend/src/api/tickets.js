import axiosInstance from "./axios";
import { toApiError } from "./errors";

const TICKETS_BASE = "/tickets";

export const getTickets = async () => {
  try {
    const { data } = await axiosInstance.get(TICKETS_BASE);
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch tickets.");
  }
};

export const createTicket = async (ticketData) => {
  try {
    const { data } = await axiosInstance.post(TICKETS_BASE, ticketData);
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to create support ticket.");
  }
};

export const addTicketReply = async (ticketId, message) => {
  try {
    const { data } = await axiosInstance.post(`${TICKETS_BASE}/${ticketId}/reply`, { message });
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to send ticket reply.");
  }
};

export const updateTicketStatus = async (ticketId, status) => {
  try {
    const { data } = await axiosInstance.put(`${TICKETS_BASE}/${ticketId}/status`, { status });
    return data;
  } catch (error) {
    throw toApiError(error, "Failed to update ticket status.");
  }
};
