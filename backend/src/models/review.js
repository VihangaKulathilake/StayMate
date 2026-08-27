import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    boarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Boarding",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    comment: {
        type: String,
    },
}, {
    timestamps: true,
});

// High-Performance Query & Aggregation Indexes
reviewSchema.index({ boarding: 1, rating: 1 });
reviewSchema.index({ user: 1, boarding: 1 });
reviewSchema.index({ boarding: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
