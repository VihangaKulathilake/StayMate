import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const ticketSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Null means it's an admin complaint/ticket
    },
    boarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boarding",
      required: false, // Optional, can be linked to a specific boarding
    },
    type: {
      type: String,
      enum: ["message_to_landlord", "complaint_to_admin"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    replies: [replySchema]
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
ticketSchema.index({ sender: 1 });
ticketSchema.index({ receiver: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ type: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
