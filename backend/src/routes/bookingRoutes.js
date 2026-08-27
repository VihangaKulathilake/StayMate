import express from "express";
import {
    createBooking,
    deleteBooking,
    getBookingById,
    getBookings,
    updateBookingStatus,
    requestExtension,
    respondExtension,
} from "../controllers/bookingController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
    .route("/")
    .post(protect, authorizeRoles("tenant"), createBooking)
    .get(protect, getBookings);

router
    .route("/:id")
    .get(protect, getBookingById)
    .put(protect, authorizeRoles("admin", "landlord"), updateBookingStatus)
    .delete(protect, authorizeRoles("admin", "landlord"), deleteBooking);

// Formal Stay Extension Workflow
router.post("/:id/request-extension", protect, authorizeRoles("tenant"), requestExtension);
router.put("/:id/respond-extension", protect, authorizeRoles("admin", "landlord"), respondExtension);

export default router;