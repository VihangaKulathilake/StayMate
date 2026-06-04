import mongoose from "mongoose";
import axios from "axios";
import Payment from "../models/payment.js";
import Booking from "../models/booking.js";
import Boarding from "../models/boarding.js";
import Room from "../models/room.js";
import { isAdmin, isOwnerOrAdmin } from "../utils/authHelpers.js";
import { PaymentContext, StrategyFactory } from "../services/payment/PaymentStrategy.js";

// Create a new payment (manual record or gateway)
export const createPayment = async (req, res) => {
    try {
        const { bookingId, amount, transactionId, status, gateway } = req.body;

        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Valid bookingId is required" });
        }

        const booking = await Booking.findById(bookingId).populate("boarding");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Only tenant or landlord/admin can record payment
        const isTenant = String(booking.tenant) === String(req.user.id);
        const isOwner = isOwnerOrAdmin(req.user, booking.boarding?.owner);

        if (!isTenant && !isOwner && !isAdmin(req.user)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const paymentData = {
            boarding: booking.boarding._id,
            user: booking.tenant,
            amount: amount || booking.payment?.amount, // Default to booking amount if not provided
            transactionId,
            status: status || "pending",
        };

        // Initialize Strategy Design Pattern Context
        const strategy = StrategyFactory.getStrategy(gateway);
        const paymentContext = new PaymentContext(strategy);

        // Execute payment strategy and capture its tailored response
        const strategyResult = await paymentContext.executePayment(paymentData);

        // Link payment to booking
        booking.payment = strategyResult.payment._id;
        await booking.save();

        return res.status(201).json({
            message: `Payment initiated successfully using ${gateway || 'cash'} strategy`,
            ...strategyResult
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        return res.status(500).json({ message: "Server error while creating payment" });
    }
};

// Get payments with filters
export const getPayments = async (req, res) => {
    try {
        const { status, userId, boardingId } = req.query;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (isAdmin(req.user)) {
            if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                filter.user = userId;
            }
            if (boardingId && mongoose.Types.ObjectId.isValid(boardingId)) {
                filter.boarding = boardingId;
            }
        } else if (req.user.role === "landlord") {
            const ownedBoardings = await Boarding.find({ owner: req.user.id }).select("_id");
            const ownedIds = ownedBoardings.map(b => b._id);
            filter.boarding = { $in: ownedIds };
            if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                filter.user = userId;
            }
        } else {
            // Tenant
            filter.user = req.user.id;
        }

        const payments = await Payment.find(filter)
            .populate("user", "name email")
            .populate("boarding", "boardingName address")
            .sort({ createdAt: -1 });

        return res.json(payments);
    } catch (error) {
        return res.status(500).json({ message: "Server error while fetching payments" });
    }
};

// Get payment by id
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid payment id" });
        }

        const payment = await Payment.findById(id)
            .populate("user", "name email")
            .populate("boarding", "boardingName address");

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        const isOwner = isOwnerOrAdmin(req.user, payment.boarding?.owner);
        const isUser = String(payment.user?._id || payment.user) === String(req.user.id);

        if (!isUser && !isOwner && !isAdmin(req.user)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        return res.json(payment);
    } catch (error) {
        return res.status(500).json({ message: "Server error while fetching payment" });
    }
};

// Update payment status (admin/landlord only)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid payment id" });
        }

        if (!status || !["pending", "completed", "failed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const payment = await Payment.findById(id).populate("boarding");
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        const isOwner = isOwnerOrAdmin(req.user, payment.boarding?.owner);

        if (!isOwner && !isAdmin(req.user)) {
            return res.status(403).json({ message: "Forbidden. Only landlord or admin can update status." });
        }

        payment.status = status;
        await payment.save();

        // Automatically synchronize the associated Request/Booking
        const booking = await Booking.findOne({ payment: id });
        if (booking) {
            if (status === 'completed') {
                booking.status = 'approved';
                // Lock the room capacity
                if (booking.room) {
                    const room = await Room.findById(booking.room);
                    if (room && room.available) {
                        room.available = false;
                        await room.save();
                    }
                }
            } else if (status === 'failed') {
                booking.status = 'rejected';
                // Release the room capacity
                if (booking.room) {
                    const room = await Room.findById(booking.room);
                    if (room && !room.available) {
                        room.available = true;
                        await room.save();
                    }
                }
            }
            await booking.save();
        }

        return res.json({
            message: "Payment status updated successfully",
            payment,
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating payment status" });
    }
};

// --- PayPal Controller Integrations ---

// Get PayPal client ID
export const getPayPalClientId = async (req, res) => {
    try {
        return res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
    } catch (error) {
        console.error("Error fetching PayPal client ID:", error);
        return res.status(500).json({ message: "Server error while fetching PayPal config" });
    }
};

// Retrieve Access Token from PayPal
const getPayPalAccessToken = async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalUrl = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal Client ID or Secret in environment configuration.");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios({
        url: `${paypalUrl}/v1/oauth2/token`,
        method: "post",
        headers: {
            Accept: "application/json",
            "Accept-Language": "en_US",
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: "grant_type=client_credentials",
    });

    return response.data.access_token;
};

// Create Order on PayPal
export const createPayPalOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid payment id" });
        }

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Verify user owns the payment record (or is admin)
        if (String(payment.user) !== String(req.user.id) && !isAdmin(req.user)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (payment.status === "completed") {
            return res.status(400).json({ message: "Payment is already completed" });
        }

        const token = await getPayPalAccessToken();
        const paypalUrl = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

        // Convert LKR (Rs.) to USD. If exchange rate is not set, default to 1/300.
        const conversionRate = Number(process.env.PAYPAL_EXCHANGE_RATE_LKR_TO_USD) || (1 / 300);
        let amountInUSD = (payment.amount * conversionRate).toFixed(2);
        if (parseFloat(amountInUSD) <= 0) {
            amountInUSD = "1.00";
        }

        const response = await axios({
            url: `${paypalUrl}/v2/checkout/orders`,
            method: "post",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            data: {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: amountInUSD,
                        },
                        reference_id: payment._id.toString(),
                    },
                ],
            },
        });

        const order = response.data;

        // Cache the PayPal Order ID in the payment metadata
        payment.metadata = {
            ...payment.metadata,
            paypalOrderId: order.id,
            amountInUSD,
        };
        payment.method = "paypal";
        payment.status = "processing";
        await payment.save();

        return res.json({ orderId: order.id });
    } catch (error) {
        console.error("Error creating PayPal order:", error.response?.data || error.message);
        return res.status(500).json({ message: "Server error while creating PayPal order" });
    }
};

// Capture Order on PayPal
export const capturePayPalOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid payment id" });
        }

        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Verify user owns the payment record (or is admin)
        if (String(payment.user) !== String(req.user.id) && !isAdmin(req.user)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const token = await getPayPalAccessToken();
        const paypalUrl = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

        const response = await axios({
            url: `${paypalUrl}/v2/checkout/orders/${orderId}/capture`,
            method: "post",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const captureResult = response.data;

        if (captureResult.status === "COMPLETED") {
            const capture = captureResult.purchase_units[0].payments.captures[0];
            payment.status = "completed";
            payment.method = "paypal";
            payment.transactionId = capture.id;
            payment.metadata = {
                ...payment.metadata,
                paypalCapture: capture,
            };
            await payment.save();

            // Automatically synchronize the associated Booking
            const booking = await Booking.findOne({ payment: payment._id });
            if (booking) {
                booking.status = "approved";
                // Lock the room capacity
                if (booking.room) {
                    const room = await Room.findById(booking.room);
                    if (room && room.available) {
                        room.available = false;
                        await room.save();
                    }
                }
                await booking.save();
            }

            return res.json({
                message: "PayPal payment captured successfully",
                payment,
            });
        } else {
            payment.status = "failed";
            await payment.save();
            return res.status(400).json({
                message: `PayPal capture status: ${captureResult.status}`,
            });
        }
    } catch (error) {
        console.error("Error capturing PayPal order:", error.response?.data || error.message);
        return res.status(500).json({ message: "Server error while capturing PayPal order" });
    }
};
