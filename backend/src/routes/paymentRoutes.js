import express from "express";
import {
    createPayment,
    getPaymentById,
    getPayments,
    updatePaymentStatus,
    getPayPalClientId,
    createPayPalOrder,
    capturePayPalOrder,
} from "../controllers/paymentController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
    .route("/")
    .post(protect, createPayment)
    .get(protect, getPayments);

// PayPal Endpoints
router.get("/config/paypal", protect, getPayPalClientId);
router.post("/:id/create-paypal-order", protect, createPayPalOrder);
router.post("/:id/capture-paypal-order", protect, capturePayPalOrder);

router
    .route("/:id")
    .get(protect, getPaymentById)
    .put(protect, authorizeRoles("admin", "landlord"), updatePaymentStatus);

export default router;
