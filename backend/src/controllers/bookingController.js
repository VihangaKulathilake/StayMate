import mongoose from "mongoose";
import Boarding from "../models/boarding.js";
import Room from "../models/room.js";
import Booking from "../models/booking.js";
import Payment from "../models/payment.js";
import { isAdmin, isOwnerOrAdmin } from "../utils/authHelpers.js";

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { boardingId, roomId, checkInDate, durationMonths, tenantId } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!boardingId || !mongoose.Types.ObjectId.isValid(boardingId)) {
      return res.status(400).json({ message: "Valid boardingId is required" });
    }

    const parsedCheckIn = new Date(checkInDate);
    if (!checkInDate || Number.isNaN(parsedCheckIn.getTime())) {
      return res.status(400).json({ message: "Valid checkInDate is required" });
    }

    const parsedDuration = durationMonths !== undefined ? Number(durationMonths) : 1;
    if (Number.isNaN(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({ message: "durationMonths must be a number greater than 0" });
    }

    const boarding = await Boarding.findById(boardingId);
    if (!boarding) {
      return res.status(404).json({ message: "Boarding not found" });
    }

    if (boarding.status !== "approved" && !isOwnerOrAdmin(req.user, boarding.owner)) {
      return res.status(403).json({ message: "Boarding is not available for booking" });
    }

    let room = null;
    if (boarding.type === "room_based") {
      if (!roomId) {
        return res.status(400).json({ message: "roomId is required for room_based boarding" });
      }

      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({ message: "Invalid roomId" });
      }

      room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      if (String(room.boarding) !== String(boardingId)) {
        return res.status(400).json({ message: "Room does not belong to this boarding" });
      }

      if (!room.available) {
        return res.status(409).json({ message: "Room is not available" });
      }

      const existingBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ["pending", "approved"] },
      });

      if (existingBooking) {
        return res.status(409).json({ message: "Room already has an active booking" });
      }
    } else if (boarding.type === "full_property") {
      if (roomId) {
        return res.status(400).json({ message: "roomId is not allowed for full_property boarding" });
      }

      if (boarding.price === undefined || Number.isNaN(Number(boarding.price))) {
        return res.status(400).json({ message: "Boarding price is not available" });
      }
    } else {
      return res.status(400).json({ message: "Invalid boarding type" });
    }

    const resolvedTenantId = isAdmin(req.user) && tenantId ? tenantId : req.user.id;
    if (!mongoose.Types.ObjectId.isValid(resolvedTenantId)) {
      return res.status(400).json({ message: "Invalid tenant id" });
    }

    const basePrice = boarding.type === "room_based" ? room.price : boarding.price;
    const monthlyRent = Number(basePrice);

    // Instantiate Booking first to get _id
    const booking = new Booking({
      tenant: resolvedTenantId,
      boarding: boardingId,
      room: room?._id,
      checkInDate: parsedCheckIn,
      durationMonths: parsedDuration,
      monthlyRent,
      status: "pending",
    });

    // Generate Month-by-Month Installment Ledger
    const payments = [];
    for (let i = 0; i < parsedDuration; i++) {
      const dueDate = new Date(parsedCheckIn);
      dueDate.setMonth(dueDate.getMonth() + i);

      const installmentNumber = i + 1;
      const isFirst = installmentNumber === 1;

      const p = new Payment({
        booking: booking._id,
        boarding: boardingId,
        user: resolvedTenantId,
        amount: monthlyRent,
        type: isFirst ? "first_month" : "monthly_rent",
        dueDate,
        billingMonth: `Month ${installmentNumber} of ${parsedDuration}`,
        installmentNumber,
        totalInstallments: parsedDuration,
        method: "cash",
        status: "pending",
        transactionId: `TX_${Date.now()}_${installmentNumber}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      });
      payments.push(p);
    }

    const savedPayments = await Payment.insertMany(payments);
    booking.payment = savedPayments[0]._id; // Move-in 1st month payment
    booking.payments = savedPayments.map((p) => p._id);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("tenant", "name email role")
      .populate("boarding")
      .populate("room")
      .populate("payment")
      .populate("payments");

    return res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};

// Get bookings based on role
export const getBookings = async (req, res) => {
  try {
    const { status, boardingId, roomId, tenantId } = req.query;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (boardingId && mongoose.Types.ObjectId.isValid(boardingId)) {
      filter.boarding = boardingId;
    }

    if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
      filter.room = roomId;
    }

    if (isAdmin(req.user)) {
      if (tenantId && mongoose.Types.ObjectId.isValid(tenantId)) {
        filter.tenant = tenantId;
      }
    } else if (req.user.role === "landlord") {
      const ownedBoardings = await Boarding.find({ owner: req.user.id }).select("_id").lean();
      const ownedIds = ownedBoardings.map((b) => b._id);
      filter.boarding = { $in: ownedIds };
    } else {
      filter.tenant = req.user.id;
    }

    const bookings = await Booking.find(filter)
      .populate("tenant", "name email role phone")
      .populate("boarding", "boardingName address city type price images owner")
      .populate("room", "roomNumber price capacity facilities")
      .populate("payment", "amount status type billingMonth paidAt")
      .populate("payments", "amount status type billingMonth installmentNumber totalInstallments dueDate paidAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching bookings" });
  }
};

// Get a single booking by id
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id)
      .populate("tenant", "name email role phone")
      .populate("boarding", "boardingName address city type price images owner")
      .populate("room", "roomNumber price capacity facilities")
      .populate("payment", "amount status type billingMonth paidAt")
      .populate("payments", "amount status type billingMonth installmentNumber totalInstallments dueDate paidAt")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isTenant = String(booking.tenant?._id || booking.tenant) === String(req.user?.id);
    const isOwner = isOwnerOrAdmin(req.user, booking.boarding?.owner || booking.boarding);

    if (!isTenant && !isOwner && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching booking" });
  }
};

// Update booking status (approve/reject/cancel)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id).populate("boarding");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isTenant = String(booking.tenant) === String(req.user?.id);
    const isOwner = isOwnerOrAdmin(req.user, booking.boarding?.owner || booking.boarding);

    if (status === "cancelled" && !isTenant && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Only tenant can cancel" });
    }

    if (["approved", "rejected"].includes(status) && !isOwner && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Only owner/admin can approve or reject" });
    }

    if (status === "approved" && booking.room) {
      const room = await Room.findById(booking.room);
      if (room && !room.available) {
        return res.status(409).json({ message: "Room is no longer available" });
      }
      if (room) {
        room.available = false;
        await room.save();
      }
    }

    if (["rejected", "cancelled"].includes(status) && booking.room) {
      const room = await Room.findById(booking.room);
      if (room) {
        room.available = true;
        await room.save();
      }
    }

    booking.status = status;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("tenant", "name email role")
      .populate("boarding")
      .populate("room")
      .populate("payment")
      .populate("payments");

    return res.json({
      message: "Booking status updated",
      booking: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating booking" });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id).populate("boarding");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isTenant = String(booking.tenant) === String(req.user?.id);
    const isOwner = isOwnerOrAdmin(req.user, booking.boarding?.owner || booking.boarding);

    if (!isTenant && !isOwner && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await booking.deleteOne();
    return res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while deleting booking" });
  }
};

// Request Stay Extension (Tenant)
export const requestExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalMonths, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const parsedMonths = Number(additionalMonths);
    if (!parsedMonths || parsedMonths < 1 || parsedMonths > 24) {
      return res.status(400).json({ message: "Extension duration must be between 1 and 24 months" });
    }

    const booking = await Booking.findById(id).populate("boarding");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only tenant can request extension
    if (String(booking.tenant) !== String(req.user.id) && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden. Only the tenant can request a stay extension." });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({ message: "Can only extend active, approved stays." });
    }

    if (booking.extensionRequest?.status === "pending") {
      return res.status(409).json({ message: "An extension request is already pending review for this stay." });
    }

    booking.extensionRequest = {
      status: "pending",
      additionalMonths: parsedMonths,
      reason: reason?.trim() || "",
      requestedAt: new Date(),
      reviewedAt: null,
      landlordNote: "",
    };

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("tenant", "name email role")
      .populate("boarding")
      .populate("room")
      .populate("payments");

    return res.json({
      message: "Extension request submitted to landlord successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error requesting extension:", error);
    return res.status(500).json({ message: "Server error while requesting stay extension" });
  }
};

// Respond to Stay Extension (Landlord / Admin)
export const respondExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, landlordNote } = req.body; // decision: "approved" | "rejected"

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approved' or 'rejected'" });
    }

    const booking = await Booking.findById(id).populate("boarding");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = isOwnerOrAdmin(req.user, booking.boarding?.owner);
    if (!isOwner && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden. Only property landlord or admin can review extensions." });
    }

    if (booking.extensionRequest?.status !== "pending") {
      return res.status(400).json({ message: "No pending extension request found on this stay." });
    }

    const additionalMonths = booking.extensionRequest.additionalMonths;
    booking.extensionRequest.status = decision;
    booking.extensionRequest.reviewedAt = new Date();
    booking.extensionRequest.landlordNote = landlordNote?.trim() || "";

    if (decision === "approved") {
      const oldDuration = booking.durationMonths;
      const newDuration = oldDuration + additionalMonths;
      booking.durationMonths = newDuration;

      // Generate new month-by-month installments for the extended period
      const newPayments = [];
      for (let i = 0; i < additionalMonths; i++) {
        const installmentNumber = oldDuration + i + 1;
        const dueDate = new Date(booking.checkInDate);
        dueDate.setMonth(dueDate.getMonth() + (oldDuration + i));

        const p = new Payment({
          booking: booking._id,
          boarding: booking.boarding._id,
          user: booking.tenant,
          amount: booking.monthlyRent,
          type: "monthly_rent",
          dueDate,
          billingMonth: `Month ${installmentNumber} of ${newDuration}`,
          installmentNumber,
          totalInstallments: newDuration,
          method: "cash",
          status: "pending",
          transactionId: `TX_${Date.now()}_${installmentNumber}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        });
        newPayments.push(p);
      }

      const savedNewPayments = await Payment.insertMany(newPayments);
      const newPaymentIds = savedNewPayments.map((p) => p._id);
      booking.payments = [...(booking.payments || []), ...newPaymentIds];

      // Update totalInstallments on existing payments of this booking
      await Payment.updateMany(
        { booking: booking._id },
        { totalInstallments: newDuration }
      );

      // Refresh billingMonth labels on existing payments
      const allExisting = await Payment.find({ booking: booking._id });
      for (const p of allExisting) {
        p.billingMonth = `Month ${p.installmentNumber} of ${newDuration}`;
        await p.save();
      }
    }

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("tenant", "name email role")
      .populate("boarding")
      .populate("room")
      .populate("payments");

    return res.json({
      message: `Stay extension ${decision} successfully`,
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error responding to extension:", error);
    return res.status(500).json({ message: "Server error while processing extension response" });
  }
};
