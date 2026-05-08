import mongoose from "mongoose";
import Boarding from "../models/boarding.js";
import Room from "../models/room.js";
import User from "../models/User.js";
import Payment from "../models/payment.js";
import Booking from "../models/booking.js";
import Review from "../models/review.js";
import { isAdmin, isOwnerOrAdmin } from "../utils/authHelpers.js";
import { normalizeStringArray } from "../utils/formatHelpers.js";
import { calculateScore } from "../utils/boardingUtils.js";
import { getRecommendations } from "../services/mlService/mlService.js";

// Create a new boarding
export const createBoarding = async (req, res) => {
  try {
    const {
      boardingName,
      description,
      address,
      city,
      type,
      price,
      totalRooms,
      rooms, // Expecting an array of room objects for room_based
      facilities,
      images,
      location,
      owner,
      status,
    } = req.body;

    if (!boardingName || !description || !address || !city || !type || !location) {
      return res.status(400).json({
        message: "boardingName, description, address, city, type, and location are required",
      });
    }

    if (!["room_based", "full_property"].includes(type)) {
      return res.status(400).json({ message: "type must be room_based or full_property" });
    }

    const resolvedOwner = req.user?.id || owner;
    if (!resolvedOwner) {
      return res.status(400).json({ message: "owner is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedOwner)) {
      return res.status(400).json({ message: "Invalid owner id" });
    }

    const parsedPrice = price !== undefined ? Number(price) : undefined;
    const parsedTotalRooms = totalRooms !== undefined ? Number(totalRooms) : undefined;

    if (price !== undefined && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      return res.status(400).json({ message: "price must be a valid non-negative number" });
    }

    if (type === "full_property") {
      if (price === undefined) {
        return res.status(400).json({ message: "price is required for full_property" });
      }
      if (totalRooms === undefined) {
        return res.status(400).json({ message: "totalRooms is required for full_property" });
      }
      if (Number.isNaN(parsedTotalRooms) || parsedTotalRooms <= 0) {
        return res.status(400).json({ message: "totalRooms must be a valid number greater than 0" });
      }
    }

    if (type === "room_based" && (!rooms || !Array.isArray(rooms) || rooms.length === 0)) {
      return res.status(400).json({ message: "At least one room definition is required for room_based boardings" });
    }

    const nextStatus = isAdmin(req.user) && status ? status : "pending";

    const boardingData = {
      boardingName,
      description,
      address,
      city,
      type,
      facilities: normalizeStringArray(facilities) || [],
      images: normalizeStringArray(images) || [],
      owner: resolvedOwner,
      status: nextStatus,
    };

    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      boardingData.location = {
        type: "Point",
        coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
      };
    } else {
      return res.status(400).json({ message: "Invalid location coordinates. Latitude and Longitude are required." });
    }

    if (type === "full_property") {
      boardingData.price = parsedPrice;
      boardingData.totalRooms = parsedTotalRooms;
    }

    console.log("CREATING_BOARDING_WITH_DATA:", JSON.stringify(boardingData, null, 2));

    let boarding;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      boarding = new Boarding(boardingData);
      await boarding.save({ session });

      if (type === "room_based" && rooms && Array.isArray(rooms)) {
        const roomsData = rooms.map(room => ({
          boarding: boarding._id,
          roomNumber: room.roomNumber,
          description: room.description || "",
          price: Number(room.price),
          capacity: Number(room.capacity),
          facilities: normalizeStringArray(room.facilities) || [],
          images: normalizeStringArray(room.images) || [],
          available: true
        }));

        await Room.insertMany(roomsData, { session });

        // Update totalRooms
        boarding.totalRooms = roomsData.length;
        await boarding.save({ session });
      }

      await session.commitTransaction();
    } catch (saveError) {
      await session.abortTransaction();
      console.error("BOARDING_SAVE_ERROR:", saveError);
      return res.status(400).json({
        message: "Failed to save boarding or rooms. Validation error.",
        error: saveError.message
      });
    } finally {
      session.endSession();
    }

    const populatedBoarding = await Boarding.findById(boarding._id).populate("owner", "name email role");

    return res.status(201).json({
      message: "Boarding registered successfully",
      boarding: populatedBoarding,
    });
  } catch (error) {
    console.error("CREATE_BOARDING_UNEXPECTED_ERROR:", error);
    return res.sta

    tus(500).json({ message: "Server error", error: error.message });
  }
};

// Get all boardings with optional filters
export const getBoardings = async (req, res) => {
  try {

    // Extract query parameters for filtering
    const { q, city, minPrice, maxPrice, totalRooms, status, owner, mine, sortBy } = req.query;

    // Fetch user preferences to check for specific places
    let preferredLocation = null;
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("preferences").lean();
      if (user?.preferences?.preferredLocations && Array.isArray(user.preferences.preferredLocations)) {
        // Look for a specific location (not a city)
        const specificLocation = user.preferences.preferredLocations.find(loc => loc.locationType === "place");
        if (specificLocation && specificLocation.lat && specificLocation.lng) {
          preferredLocation = {
            lat: specificLocation.lat,
            lng: specificLocation.lng,
            name: specificLocation.name
          };
        }
      }
    }

    // Build the filter object based on provided query parameters
    const filter = {};

    if (q) {
      filter.$or = [
        { boardingName: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ];
    }

    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
      if (Object.keys(filter.price).length === 0) {
        delete filter.price;
      }
    }

    if (totalRooms !== undefined && !Number.isNaN(Number(totalRooms))) {
      filter.totalRooms = Number(totalRooms);
    }

    if (status) {
      if (isAdmin(req.user)) {
        filter.status = status;
      } else {
        filter.status = "approved";
      }
    }
    else if (!isAdmin(req.user) && mine !== "true") {
      filter.status = "approved";
    }

    if (mine === "true" && req.user?.id) {
      filter.owner = req.user.id;
    } else if (owner && mongoose.Types.ObjectId.isValid(owner)) {
      filter.owner = owner;
    }

    // Determine initial DB sort
    let dbSort = { createdAt: -1 };
    if (sortBy === "newest") dbSort = { createdAt: -1 };

    // Use aggregation pipeline if preferredPlace exists
    let boardings;

    if (preferredLocation) {
      // Build aggreagation pipeline with $geoNear
      const pipeline = [
        // $geoNear - Calculate distance from preferred place
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [preferredLocation.lng, preferredLocation.lat]
            },
            distanceField: "distance",
            maxDistance: 50000, // 50 km
            spherical: true
          }
        },

        // $match - Apply filters
        { $match: filter },

        // $lookup - Join with User collection to get owner details
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner"
          }
        },

        // $unwind - Flatten the owner array
        {
          $unwind: {
            path: "$owner",
            preserveNullAndEmptyArrays: true
          }
        },
        // $sort - Apply initial sorting (e.g., by creation date)
        { $sort: dbSort },
      ];

      try {
        boardings = await Boarding.aggregate(pipeline);
      } catch (error) {
        console.error("AGGREGATION_ERROR:", error);
        return res.status(500).json({ message: "Server error" });
      }
    } else {
      // No preferred place, simple find with populate and sort
      boardings = await Boarding.find(filter)
        .populate("owner", "name email role")
        .sort(dbSort)
        .lean();
    }

    if (boardings.length === 0) return res.json([]);

    const boardingIds = boardings.map(b => b._id);

    // Fetch Room stats, Active bookings, Review performance, AND User Prefs in parallel
    const [stats, activeBookings, reviewStats, user] = await Promise.all([
      Room.aggregate([
        { $match: { boarding: { $in: boardingIds } } },
        {
          $group: {
            _id: "$boarding",
            totalRooms: { $sum: 1 },
            availableRooms: { $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] } },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" }
          },
        },
      ]),
      Booking.aggregate([
        {
          $match: {
            boarding: { $in: boardingIds },
            status: { $in: ["pending", "approved"] }
          }
        },
        { $group: { _id: "$boarding", count: { $sum: 1 } } }
      ]),
      Review.aggregate([
        { $match: { boarding: { $in: boardingIds }, rating: { $gt: 0 } } },
        { $group: { _id: "$boarding", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
      ]),
      req.user?.id ? User.findById(req.user.id).select("preferences").lean() : null
    ]);

    const roomStatsByBoarding = new Map(stats.map(s => [String(s._id), s]));
    const fullPropertyActiveBookings = new Map(activeBookings.map(b => [String(b._id), b.count]));
    const reviewStatsByBoarding = new Map(reviewStats.map(r => [String(r._id), r]));
    const preferences = user?.preferences;

    let response = boardings.map((boarding) => {
      const bId = String(boarding._id);
      const reviews = reviewStatsByBoarding.get(bId) || { avgRating: 0, totalReviews: 0 };

      // Enrich - Add rating, review count, distance, and room availability info to each boarding
      let enriched = {
        ...boarding,
        rating: reviews.avgRating ? Number(reviews.avgRating.toFixed(1)) : 0,
        totalReviews: reviews.totalReviews,
        // Include distance if it exists (from $geoNear)
        distance: boarding.distance ? Math.round(boarding.distance / 1000 * 100) / 100 : null // distance in km rounded to 1 decimal place
      };

      if (boarding.type === "room_based") {
        const stats = roomStatsByBoarding.get(bId) || { totalRooms: 0, availableRooms: 0, minPrice: 0 };
        enriched.totalRooms = stats.totalRooms;
        enriched.availableRooms = stats.availableRooms;
        enriched.price = stats.minPrice;
      } else {
        const activeCount = fullPropertyActiveBookings.get(bId) || 0;
        enriched.availableRooms = activeCount === 0 ? boarding.totalRooms : 0;
      }
      return enriched;
    });

    // Apply secondary sorting in memory
    if (sortBy === "price_low") {
      response.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_high") {
      response.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      response.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "recommended" && preferences) {
      // Check if user actually has meaningful preferences set
      const hasPreferences = (preferences.preferredLocations && preferences.preferredLocations.length > 0) ||
        (preferences.minPrice > 0) ||
        (preferences.maxPrice && preferences.maxPrice < 50000) ||
        (preferences.requiredFacilities && preferences.requiredFacilities.length > 0) ||
        (preferences.preferredType && preferences.preferredType !== "any");

      if (hasPreferences) {
        try {
          const userObj = {
            rooms: preferences.rooms || 1,
            distance: preferences.distance || 5,
            facilities: preferences.requiredFacilities || [],
          };

          // Foramt the boarding response for the ML function
          const formattedBoardings = response.map(b => {
            return {
              ...b,
              id: b._id.toString(),
              number_of_rooms: b.availableRooms || 1,
              distance_km: b.distance || 0,
              rating: b.rating || 0,
            };
          });

          // Use ML function to sort the boardings
          const mlResults = await getRecommendations(userObj, formattedBoardings);

          console.log(`Successfully sorted ${mlResults.length} properties using Python ML Model!`);

          return res.json(mlResults);

        } catch (sortErr) {
          console.error("Sorting recommendation error:", sortErr);
          // Fallback to all boardings if ML fails
          return res.json(response);
        }
      }
    }

    // if no filters or preferences applied return response as is
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single boarding by id
export const getBoardingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid boarding id" });
    }

    const boarding = await Boarding.findById(id).populate("owner", "name email role");

    if (!boarding) {
      return res.status(404).json({ message: "Boarding not found" });
    }

    if (boarding.status !== "approved" && !isOwnerOrAdmin(req.user, boarding.owner?._id || boarding.owner)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (boarding.type === "room_based") {
      const rooms = await Room.find({ boarding: id });
      const totalRooms = rooms.length;
      const availableRooms = rooms.filter((room) => room.available).length;
      const minPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 0;

      return res.json({
        ...boarding.toObject(),
        totalRooms,
        availableRooms,
        rooms,
        price: minPrice, // Set price to minPrice for detail view
      });
    }

    return res.json(boarding);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a boarding by id
export const updateBoarding = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid boarding id" });
    }

    const boarding = await Boarding.findById(id);
    if (!boarding) {
      return res.status(404).json({ message: "Boarding not found" });
    }

    if (!isOwnerOrAdmin(req.user, boarding.owner)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const nextType = req.body.type ?? boarding.type;
    if (!nextType || !["room_based", "full_property"].includes(nextType)) {
      return res.status(400).json({ message: "type must be room_based or full_property" });
    }

    const simpleFields = ["boardingName", "description", "address", "city"];
    for (const field of simpleFields) {
      if (req.body[field] !== undefined) {
        boarding[field] = req.body[field];
      }
    }

    if (req.body.facilities !== undefined) {
      boarding.facilities = normalizeStringArray(req.body.facilities) || [];
    }

    if (req.body.images !== undefined) {
      boarding.images = normalizeStringArray(req.body.images) || [];
    }

    if (req.body.location !== undefined) {
      const { location } = req.body;
      if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
        boarding.location = {
          type: "Point",
          coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
        };
      }
    }

    boarding.type = nextType;

    if (nextType === "full_property") {
      if (req.body.totalRooms !== undefined) {
        const parsedTotalRooms = Number(req.body.totalRooms);
        if (Number.isNaN(parsedTotalRooms) || parsedTotalRooms <= 0) {
          return res.status(400).json({ message: "totalRooms must be a valid number greater than 0" });
        }
        boarding.totalRooms = parsedTotalRooms;
      }

      if (req.body.price !== undefined) {
        const parsedPrice = Number(req.body.price);
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({ message: "price must be a valid non-negative number" });
        }
        boarding.price = parsedPrice;
      }

      if (boarding.price === undefined) {
        return res.status(400).json({ message: "price is required for full_property" });
      }

      if (boarding.totalRooms === undefined) {
        return res.status(400).json({ message: "totalRooms is required for full_property" });
      }
    } else if (nextType === "room_based") {
      boarding.price = undefined;
      boarding.totalRooms = req.body.rooms?.length || boarding.totalRooms;
    }

    if (req.body.status !== undefined) {
      if (!isAdmin(req.user)) {
        return res.status(403).json({ message: "Only admins can update status" });
      }
      boarding.status = req.body.status;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await boarding.save({ session });

      if (nextType === "room_based" && Array.isArray(req.body.rooms)) {
        const incomingRooms = req.body.rooms;
        const existingRooms = await Room.find({ boarding: id }).session(session);

        // Identify rooms to delete
        const incomingIds = incomingRooms.map(r => r._id?.toString()).filter(Boolean);
        const roomsToDelete = existingRooms.filter(r => !incomingIds.includes(r._id.toString()));
        if (roomsToDelete.length > 0) {
          await Room.deleteMany({ _id: { $in: roomsToDelete.map(r => r._id) } }, { session });
        }

        // Identify rooms to update or create
        for (const room of incomingRooms) {
          const roomData = {
            boarding: id,
            roomNumber: room.roomNumber,
            description: room.description || "",
            price: Number(room.price),
            capacity: Number(room.capacity),
            facilities: normalizeStringArray(room.facilities) || [],
            images: normalizeStringArray(room.images) || [],
            available: room.available !== undefined ? room.available : true,
          };

          if (room._id && mongoose.Types.ObjectId.isValid(room._id)) {
            await Room.findByIdAndUpdate(room._id, roomData, { session, runValidators: true });
          } else {
            const newRoom = new Room(roomData);
            await newRoom.save({ session });
          }
        }
      }

      await session.commitTransaction();
    } catch (saveError) {
      await session.abortTransaction();
      console.error("UPDATE_BOARDING_SAVE_ERROR:", saveError);
      return res.status(400).json({
        message: "Failed to update boarding or rooms",
        error: saveError.message
      });
    } finally {
      session.endSession();
    }

    const updatedBoarding = await Boarding.findById(id).populate("owner", "name email role");

    return res.json({
      message: "Boarding updated successfully",
      boarding: updatedBoarding,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// Delete a boarding by id
export const deleteBoarding = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid boarding id" });
    }

    const boarding = await Boarding.findById(id);
    if (!boarding) {
      return res.status(404).json({ message: "Boarding not found" });
    }

    if (!isOwnerOrAdmin(req.user, boarding.owner)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await boarding.deleteOne();

    return res.json({ message: "Boarding deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get platform-wide stats for admin dashboard
export const getAdminStats = async (req, res) => {
  try {
    const [landlordsCount, tenantsCount, boardingsCount, payments] = await Promise.all([
      User.countDocuments({ role: "landlord" }),
      User.countDocuments({ role: "tenant" }),
      Boarding.countDocuments(),
      Payment.find({ status: "completed" }).select("amount"),
    ]);

    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return res.json({
      landlords: landlordsCount,
      tenants: tenantsCount,
      boardings: boardingsCount,
      revenue: totalRevenue,
    });
  } catch (error) {
    console.error("GET_ADMIN_STATS_ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Rate boardings according to the past details and suggest the better one for the tenant
export const rateBoardings = async (req, res) => {
  try {
    const { preferences } = req.body;
    const boardings = await Boarding.find();
    const ratedBoardings = boardings.map((boarding) => ({
      ...boarding,
      score: calculateScore(boarding, preferences),
    }));

    // Sort boardings by score in descending order
    ratedBoardings.sort((a, b) => b.score - a.score);
    return res.json(ratedBoardings);
  } catch (error) {
    console.error("RATE_BOARDINGS_ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

