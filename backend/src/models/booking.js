import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    boarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boarding",
      required: true
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: false
    },

    checkInDate: {
      type: Date,
      required: true
    },

    durationMonths: {
      type: Number,
      default: 1
    },

    monthlyRent: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending"
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    },

    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
      }
    ],

    extensionRequest: {
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none"
      },
      additionalMonths: {
        type: Number,
        default: 0
      },
      reason: {
        type: String,
        default: ""
      },
      requestedAt: {
        type: Date,
        default: null
      },
      reviewedAt: {
        type: Date,
        default: null
      },
      landlordNote: {
        type: String,
        default: ""
      }
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ boarding: 1 });
bookingSchema.index({ tenant: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ "extensionRequest.status": 1 });

export default mongoose.model("Booking", bookingSchema);