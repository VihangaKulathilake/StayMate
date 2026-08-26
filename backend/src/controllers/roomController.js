import mongoose from "mongoose";
import Boarding from "../models/boarding.js";
import Room from "../models/room.js";
import Booking from "../models/booking.js";
import { isAdmin, isOwnerOrAdmin } from "../utils/authHelpers.js";
import { normalizeStringArray } from "../utils/formatHelpers.js";

export const createRoom = async (req, res) => {
  try {
    const { boardingId } = req.params;
    const { roomNumber, price, capacity, facilities, images, available } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!boardingId || !mongoose.Types.ObjectId.isValid(boardingId)) {
      return res.status(400).json({ message: "Valid boardingId is required" });
    }

    const boarding = await Boarding.findById(boardingId);
    if (!boarding) {
      return res.status(404).json({ message: "Boarding not found" });
    }

    if (!isOwnerOrAdmin(req.user, boarding.owner)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (boarding.type !== "room_based") {
      return res.status(400).json({ message: "Rooms can only be added to room_based boardings" });
    }

    if (!roomNumber || price === undefined || capacity === undefined) {
      return res.status(400).json({ message: "roomNumber, price, and capacity are required" });
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "price must be a valid non-negative number" });
    }

    const parsedCapacity = Number(capacity);
    if (Number.isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ message: "capacity must be a valid number greater than 0" });
    }

    let nextAvailable;
    if (available !== undefined) {
      if (typeof available === "boolean") {
        nextAvailable = available;
      } else if (available === "true" || available === "false") {
        nextAvailable = available === "true";
      } else {
        return res.status(400).json({ message: "available must be a boolean" });
      }
    }

    const roomData = {
      boarding: boardingId,
      roomNumber,
      price: parsedPrice,
      capacity: parsedCapacity,
      facilities: normalizeStringArray(facilities) || [],
      images: normalizeStringArray(images) || [],
    };

    if (nextAvailable !== undefined) {
      roomData.available = nextAvailable;
    }

    const room = await Room.create(roomData);

    // Update totalRooms in Boarding
    const roomCount = await Room.countDocuments({ boarding: boardingId, isDeleted: { $ne: true } });
    await Boarding.findByIdAndUpdate(boardingId, { totalRooms: roomCount });

    return res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRoomsByBoarding = async (req, res) => {
  try {
    const { boardingId } = req.params;

    if (!boardingId || !mongoose.Types.ObjectId.isValid(boardingId)) {
      return res.status(400).json({ message: "Valid boardingId is required" });
    }

    const boarding = await Boarding.findById(boardingId);
    if (!boarding) {
      return res.status(404).json({ message: "Boarding not found" });
    }

    const rooms = await Room.find({ boarding: boardingId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });

    return res.json(rooms);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, capacity, facilities, available } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const boarding = await Boarding.findById(room.boarding);
    if (!boarding) {
      return res.status(404).json({ message: "Boarding not found" });
    }

    if (!isOwnerOrAdmin(req.user, boarding.owner)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (boarding.type !== "room_based") {
      return res.status(400).json({ message: "Rooms can only be managed for room_based boardings" });
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: "price must be a valid non-negative number" });
      }
      room.price = parsedPrice;
    }

    if (capacity !== undefined) {
      const parsedCapacity = Number(capacity);
      if (Number.isNaN(parsedCapacity) || parsedCapacity <= 0) {
        return res.status(400).json({ message: "capacity must be a valid number greater than 0" });
      }
      room.capacity = parsedCapacity;
    }

    if (facilities !== undefined) {
      room.facilities = normalizeStringArray(facilities) || [];
    }

    if (available !== undefined) {
      if (typeof available === "boolean") {
        room.available = available;
      } else if (available === "true" || available === "false") {
        room.available = available === "true";
      } else {
        return res.status(400).json({ message: "available must be a boolean" });
      }
    }

    await room.save();

    return res.json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    const room = await Room.findById(id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ message: "Room not found" });
    }

    const boarding = await Boarding.findById(room.boarding);
    if (!boarding) {
      return res.status(404).json({ message: "Boarding not found" });
    }

    if (!isOwnerOrAdmin(req.user, boarding.owner)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (boarding.type !== "room_based") {
      return res.status(400).json({ message: "Rooms can only be managed for room_based boardings" });
    }

    // Check for active bookings
    const activeBooking = await Booking.findOne({
      room: id,
      status: { $in: ["pending", "approved"] }
    });

    if (activeBooking && !isAdmin(req.user)) {
      return res.status(409).json({
        message: "Cannot delete room with active or pending tenant bookings. Please resolve bookings first."
      });
    }

    const boardingId = room.boarding;
    
    // Soft delete room to maintain historical booking references
    room.isDeleted = true;
    room.deletedAt = new Date();
    room.available = false;
    await room.save();

    // Update totalRooms in Boarding
    const roomCount = await Room.countDocuments({ boarding: boardingId, isDeleted: { $ne: true } });
    await Boarding.findByIdAndUpdate(boardingId, { totalRooms: roomCount });

    return res.json({ message: "Room deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
