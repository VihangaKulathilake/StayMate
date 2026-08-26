import mongoose from "mongoose";

const boardingSchema = new mongoose.Schema(
  {
    boardingName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (v) {
            // Ensure it's an array of exactly 2 numbers
            return Array.isArray(v) && v.length === 2;
          },
          message: "Invalid coordinates. Must be [longitude, latitude] within valid ranges."
        }
      },
    },

    type: {
      type: String,
      enum: ["room_based", "full_property"],
      required: true,
    },

    price: {
      type: Number,
      required: function () {
        return this.type === "full_property";
      },
      min: 0,
    },

    totalRooms: {
      type: Number,
      min: 1,
      required: function () {
        return this.type === "full_property";
      },
    },

    facilities: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String, // store image URLs (from cloud storage like S3 / Cloudinary)
      },
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived", "inactive"],
      default: "pending",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
boardingSchema.index({ owner: 1 });
boardingSchema.index({ city: 1 });
boardingSchema.index({ status: 1 });
boardingSchema.index({ isDeleted: 1 });
boardingSchema.index({ isDeleted: 1, status: 1 });
boardingSchema.index({ price: 1 });
boardingSchema.index({ createdAt: -1 });
boardingSchema.index({ "location": "2dsphere" });

const Boarding = mongoose.model("Boarding", boardingSchema);

export default Boarding;
