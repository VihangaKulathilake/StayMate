import bcrypt from "bcryptjs";
import User from "../models/User.js";

// GET /api/users/me - Get the logged-in user's full profile from DB
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error("GET_CURRENT_USER_ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me - Update logged-in user's profile details
export const updateCurrentUserProfile = async (req, res) => {
  try {
    const { name, email, phone, address, isVerified } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      user.name = name.trim();
    }

    if (email !== undefined) {
      const emailLower = email.toLowerCase().trim();
      if (!emailLower) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }
      // Check if another user already has this email
      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "Email is already in use by another account" });
      }
      user.email = emailLower;
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (address !== undefined) {
      user.address = address.trim();
    }

    if (isVerified !== undefined) {
      user.isVerified = !!isVerified;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("UPDATE_CURRENT_USER_ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me/password - Change the logged-in user's password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users - Get all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error("GET_USERS_ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching users" });
  }
};

// GET /api/users/:id - Get specific user completely (Admin only)
export const adminGetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    if (error.kind === "ObjectId") {
       return res.status(404).json({ message: "User not found" });
    }
    console.error("GET_USER_BY_ID_ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching targeted user" });
  }
};
// PUT /api/users/me/preferences - Update logged-in user's boarding preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { preferredLocations, minPrice, maxPrice, requiredFacilities, preferredType } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize preferences if they don't exist
    if (!user.preferences) {
      user.preferences = {};
    }

    if (preferredLocations !== undefined) user.preferences.preferredLocations = preferredLocations;
    if (minPrice !== undefined) user.preferences.minPrice = Number(minPrice);
    if (maxPrice !== undefined) user.preferences.maxPrice = Number(maxPrice);
    if (requiredFacilities !== undefined) user.preferences.requiredFacilities = requiredFacilities;
    if (preferredType !== undefined) user.preferences.preferredType = preferredType;

    await user.save();

    return res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("UPDATE_USER_PREFERENCES_ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
