import mongoose from "mongoose";
import Review from "../models/review.js";
import Boarding from "../models/boarding.js";
import { isAdmin, isOwnerOrAdmin } from "../utils/authHelpers.js";

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { boardingId, rating, comment } = req.body;

        if (!boardingId || !mongoose.Types.ObjectId.isValid(boardingId)) {
            return res.status(400).json({ message: "Valid boardingId is required" });
        }

        const boarding = await Boarding.findById(boardingId);
        if (!boarding) {
            return res.status(404).json({ message: "Boarding not found" });
        }

        const review = await Review.create({
            boarding: boardingId,
            user: req.user.id,
            rating,
            comment,
        });

        return res.status(201).json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json({ message: "Server error while creating review" });
    }
};

// Get all reviews
export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("user", "name email")
            .populate("boarding", "boardingName address")
            .lean();
        return res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: "Server error while fetching reviews" });
    }
};

// Get review by id
export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review id" });
        }

        const review = await Review.findById(id)
            .populate("user", "name email")
            .populate("boarding", "boardingName address")
            .lean();

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.json(review);
    } catch (error) {
        console.error("Error fetching review:", error);
        return res.status(500).json({ message: "Server error while fetching review" });
    }
};

// Get all reviews by boarding id
export const getReviewsByBoardingId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid boarding id" });
        }

        const reviews = await Review.find({ boarding: id })
            .populate("user", "name email")
            .populate("boarding", "boardingName address")
            .sort({ createdAt: -1 })
            .lean();

        return res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews by boarding id:", error);
        return res.status(500).json({ message: "Server error while fetching reviews by boarding id" });
    }
};

// Update review
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review id" });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const isOwner = isOwnerOrAdmin(req.user, review.boarding?.owner);
        const isUser = String(review.user) === String(req.user.id);

        if (!isUser && !isOwner && !isAdmin(req.user)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        await review.save();
        return res.json(review);
    } catch (error) {
        console.error("Error updating review:", error);
        return res.status(500).json({ message: "Server error while updating review" });
    }
};

// Delete review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review id" });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const isOwner = isOwnerOrAdmin(req.user, review.boarding?.owner);
        const isUser = String(review.user) === String(req.user.id);

        if (!isUser && !isOwner && !isAdmin(req.user)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await review.deleteOne();
        return res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Server error while deleting review" });
    }
};
