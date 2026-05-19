import express from "express";
import {
  createTicket,
  getUserTickets,
  addReply,
  updateTicketStatus,
} from "../controllers/ticketController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createTicket)
  .get(protect, getUserTickets);

router.route("/:id/reply")
  .post(protect, addReply);

router.route("/:id/status")
  .put(protect, updateTicketStatus);

export default router;
